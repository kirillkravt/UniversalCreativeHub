from django.shortcuts import render, get_object_or_404
from django.core.paginator import Paginator
from django.views.generic import ListView, DetailView
from django.db import models
from .models import Article, Category
from taggit.models import Tag


class ArticleListView(ListView):
    """Список всех статей с пагинацией"""
    model = Article
    template_name = 'blog/article_list.html'
    context_object_name = 'articles'
    paginate_by = 10
    
    def get_queryset(self):
        queryset = Article.objects.filter(status='published')
        
        # Фильтрация по категории
        category_slug = self.kwargs.get('category_slug')
        if category_slug:
            category = get_object_or_404(Category, slug=category_slug)
            queryset = queryset.filter(category=category)
        
        # Фильтрация по тегу
        tag_slug = self.request.GET.get('tag')
        if tag_slug:
            queryset = queryset.filter(tags__slug=tag_slug)
        
        # Поиск
        search_query = self.request.GET.get('q')
        if search_query:
            queryset = queryset.filter(
                models.Q(title__icontains=search_query) |
                models.Q(content__icontains=search_query) |
                models.Q(excerpt__icontains=search_query)
            )
        
        return queryset.select_related('author', 'category').prefetch_related('tags')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categories'] = Category.objects.filter(is_active=True)
        context['recent_articles'] = Article.objects.filter(status='published')[:5]
        
        # Добавляем популярные теги
        from django.db.models import Count
        context['popular_tags'] = Tag.objects.annotate(
            num_times=Count('taggit_taggeditem_items')
        ).order_by('-num_times')[:10]
        
        return context


class ArticleDetailView(DetailView):
    """Детальная страница статьи"""
    model = Article
    template_name = 'blog/article_detail.html'
    context_object_name = 'article'
    slug_field = 'slug'
    slug_url_kwarg = 'slug'
    
    def get_queryset(self):
        return Article.objects.filter(status='published')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categories'] = Category.objects.filter(is_active=True)
        context['recent_articles'] = Article.objects.filter(status='published').exclude(
            pk=self.object.pk
        )[:5]
        
        # Добавляем теги текущей статьи
        context['article_tags'] = self.object.tags.all()
        
        return context


class CategoryListView(ListView):
    """Список категорий"""
    model = Category
    template_name = 'blog/category_list.html'
    context_object_name = 'categories'
    
    def get_queryset(self):
        return Category.objects.filter(is_active=True, parent=None)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['recent_articles'] = Article.objects.filter(status='published')[:5]
        return context

def home_view(request):
    """Домашняя страница блога"""
    featured_articles = Article.objects.filter(
        status='published', is_featured=True
    )[:3]
    
    recent_articles = Article.objects.filter(status='published')[:6]
    categories = Category.objects.filter(is_active=True)[:8]  # Уже есть
    
    # Популярные теги
    from django.db.models import Count
    from taggit.models import Tag
    popular_tags = Tag.objects.annotate(
        num_times=Count('taggit_taggeditem_items')
    ).order_by('-num_times')[:10]
    
    context = {
        'featured_articles': featured_articles,
        'recent_articles': recent_articles,
        'categories': categories,  # Это передается
        'popular_tags': popular_tags,
    }
    return render(request, 'blog/home.html', context)
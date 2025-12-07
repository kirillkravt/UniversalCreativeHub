# uch/apps/blog/context_processors.py
from .models import Category, Article
from taggit.models import Tag
from django.db.models import Count, Q  # ← ДОБАВЬТЕ Q


def blog_categories(request):
    """Добавляет категории блога во все шаблоны"""
    try:
        categories = Category.objects.annotate(
            article_count=Count('article', filter=Q(article__status='published'))
        ).filter(is_active=True, article_count__gt=0)[:10]
        
        return {
            'blog_categories': categories,
            'categories': categories,  # Для совместимости
        }
    except Exception as e:
        print(f"Error in blog_categories: {e}")
        return {
            'blog_categories': [],
            'categories': [],
        }


def popular_tags(request):
    """Добавляет популярные теги во все шаблоны"""
    try:
        tags = Tag.objects.annotate(
            num_times=Count('taggit_taggeditem_items')
        ).order_by('-num_times')[:10]
        
        return {
            'popular_tags': tags,
        }
    except Exception as e:
        print(f"Error in popular_tags: {e}")
        return {
            'popular_tags': [],
        }


def blog_stats(request):
    """Добавляет статистику блога"""
    try:
        latest_articles = Article.objects.filter(status='published').order_by('-created_at')[:5]
        
        return {
            'total_articles': Article.objects.filter(status='published').count(),
            'total_categories': Category.objects.filter(is_active=True).count(),
            'latest_articles': latest_articles,
        }
    except Exception as e:
        print(f"Error in blog_stats: {e}")
        return {
            'total_articles': 0,
            'total_categories': 0,
            'latest_articles': [],
        }


def sidebar_data(request):
    """Комбинированный процессор для боковой панели"""
    try:
        # Получаем все данные
        categories = Category.objects.annotate(
            article_count=Count('article', filter=Q(article__status='published'))
        ).filter(is_active=True, article_count__gt=0)[:10]
        
        tags = Tag.objects.annotate(
            num_times=Count('taggit_taggeditem_items')
        ).order_by('-num_times')[:10]
        
        latest_articles = Article.objects.filter(status='published').order_by('-created_at')[:5]
        
        return {
            'categories': categories,
            'popular_tags': tags,
            'latest_articles': latest_articles,
        }
    except Exception as e:
        print(f"Error in sidebar_data: {e}")
        return {
            'categories': [],
            'popular_tags': [],
            'latest_articles': [],
        }
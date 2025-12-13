from django.db.models import Count, Q
from .models import Category, Article

def blog_context(request):
    """Контекст для блога (боковая панель и общие данные)"""
    try:
        # Категории с количеством статей
        categories = Category.objects.annotate(
            article_count=Count('articles', filter=Q(articles__is_published=True))
        ).filter(article_count__gt=0)
        
        # Последние статьи для боковой панели
        recent_articles = Article.objects.filter(
            is_published=True
        ).order_by('-created_at')[:5]
        
        return {
            'blog_categories': categories,
            'blog_recent_articles': recent_articles,
        }
    except Exception:
        # Если база данных еще не готова
        return {
            'blog_categories': [],
            'blog_recent_articles': [],
        }
EOF
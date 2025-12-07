from .models import Category


def blog_categories(request):
    """Добавляет категории блога во все шаблоны"""
    return {
        'blog_categories': Category.objects.filter(is_active=True)[:10]
    }
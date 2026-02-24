# Документация для `uch-backend/uch/apps/blog/models.py`

Автоматически сгенерировано: 2026-02-24 22:46:07

## Описание

```python
from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse
from taggit.managers import TaggableManager


class Category(models.Model):
    """
    Категории статей (иерархические).
    """
    name = models.CharField(max_length=100, verbose_name="Название")
    slug = models.SlugField(max_length=100, unique=True, verbose_name="URL")
    description = models.TextField(blank=True, verbose_name="Описание")
    parent = models.ForeignKey('self', on_delete=models.CASCADE, 
                              null=True, blank=True, 
                              verbose_name="Родительская категория")
    order = models.IntegerField(default=0, verbose_name="Порядок")
    is_active = models.BooleanField(default=True, verbose_name="Активна")
    
    class Meta:
        verbose_name = "Категория"
        verbose_name_plural = "Категории"
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name
    
    def get_absolute_url(self):
        return reverse('blog:category_detail', args=[self.slug])


class Article(models.Model):
    """Статьи/записи блога."""
    STATUS_CHOICES = [
        ('draft', 'Черновик'),
        ('published', 'Опубликовано'),
        ('archived', 'В архиве'),
    ]
    
    title = models.CharField(max_length=200, verbose_name="Заголовок")
    slug = models.SlugField(max_length=200, unique=True, verbose_name="URL")
    excerpt = models.TextField(max_length=500, blank=True, verbose_name="Краткое описание")
    content = models.TextField(verbose_name="Содержание (Markdown)")
    content_html = models.TextField(blank=True, editable=False, verbose_name="Содержание (HTML)")
    
    cover_image = models.ImageField(upload_to='articles/

## Исходный код

```py
from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse
from taggit.managers import TaggableManager


class Category(models.Model):
    """Категории статей (иерархические)"""
    name = models.CharField(max_length=100, verbose_name="Название")
    slug = models.SlugField(max_length=100, unique=True, verbose_name="URL")
    description = models.TextField(blank=True, verbose_name="Описание")
    parent = models.ForeignKey('self', on_delete=models.CA...
```
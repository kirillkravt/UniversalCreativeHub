from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse
from taggit.managers import TaggableManager


class Category(models.Model):
    """Категории статей (иерархические)"""
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
    """Статьи/записи блога"""
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
    
    cover_image = models.ImageField(upload_to='articles/covers/', 
                                   blank=True, null=True,
                                   verbose_name="Обложка")
    
    author = models.ForeignKey(User, on_delete=models.CASCADE, 
                              verbose_name="Автор")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL,
                                null=True, blank=True,
                                verbose_name="Категория")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES,
                            default='draft', verbose_name="Статус")
    
    is_featured = models.BooleanField(default=False, verbose_name="Рекомендуемая")
    allow_comments = models.BooleanField(default=True, verbose_name="Разрешить комментарии")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Создано")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Обновлено")
    published_at = models.DateTimeField(null=True, blank=True, verbose_name="Опубликовано")
    
    # Теги через django-taggit
    tags = TaggableManager(blank=True, verbose_name="Теги")
    
    class Meta:
        verbose_name = "Статья"
        verbose_name_plural = "Статьи"
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['status', 'published_at']),
            models.Index(fields=['slug']),
            models.Index(fields=['category']),
        ]
    
    def __str__(self):
        return self.title
    
    def get_absolute_url(self):
        return reverse('blog:article_detail', args=[self.slug])
    
    def save(self, *args, **kwargs):
        # При публикации устанавливаем дату публикации
        if self.status == 'published' and not self.published_at:
            from django.utils import timezone
            self.published_at = timezone.now()
        
        # Конвертируем Markdown в HTML при сохранении
        if self.content:
            import markdown
            self.content_html = markdown.markdown(
                self.content,
                extensions=['extra', 'codehilite', 'tables']
            )
        
        super().save(*args, **kwargs)


class MediaItem(models.Model):
    """Медиафайлы (изображения, аудио, видео)"""
    MEDIA_TYPES = [
        ('image', 'Изображение'),
        ('audio', 'Аудио'),
        ('video', 'Видео'),
        ('document', 'Документ'),
        ('3d', '3D модель'),
    ]
    
    title = models.CharField(max_length=200, verbose_name="Название")
    description = models.TextField(blank=True, verbose_name="Описание")
    file = models.FileField(upload_to='media/%Y/%m/%d/', verbose_name="Файл")
    file_type = models.CharField(max_length=20, choices=MEDIA_TYPES, 
                                verbose_name="Тип файла")
    thumbnail = models.ImageField(upload_to='media/thumbnails/', 
                                 blank=True, null=True,
                                 verbose_name="Превью")
    
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE,
                                   verbose_name="Загрузил")
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name="Загружено")
    
    # Метаданные для разных типов
    metadata = models.JSONField(default=dict, blank=True, verbose_name="Метаданные")
    
    class Meta:
        verbose_name = "Медиафайл"
        verbose_name_plural = "Медиафайлы"
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.title} ({self.file_type})"
    
    def get_absolute_url(self):
        return self.file.url
    

class Comment(models.Model):
    """Комментарии к статьям"""
    article = models.ForeignKey(Article, on_delete=models.CASCADE,
                               related_name='comments', verbose_name="Статья")
    author = models.ForeignKey(User, on_delete=models.CASCADE,
                              verbose_name="Автор")
    content = models.TextField(max_length=1000, verbose_name="Текст комментария")
    is_approved = models.BooleanField(default=False, verbose_name="Одобрен")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Создан")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Обновлен")
    
    # Для ответов на комментарии
    parent = models.ForeignKey('self', on_delete=models.CASCADE,
                              null=True, blank=True,
                              related_name='replies', verbose_name="Родительский комментарий")
    
    class Meta:
        verbose_name = "Комментарий"
        verbose_name_plural = "Комментарии"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Комментарий от {self.author} к {self.article}"
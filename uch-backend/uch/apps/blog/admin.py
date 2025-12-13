from django.contrib import admin
from django.utils.html import format_html
from .models import Article, Category, Comment, MediaItem
from markdownx.admin import MarkdownxModelAdmin


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'parent', 'order', 'is_active')
    list_filter = ('is_active', 'parent')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('order', 'name')


@admin.register(Article)
class ArticleAdmin(MarkdownxModelAdmin):
    list_display = ('title', 'slug', 'author', 'category', 'status',
                    'published_at', 'is_featured', 'allow_comments')
    list_filter = ('status', 'category', 'is_featured', 'created_at')
    search_fields = ('title', 'content', 'excerpt')
    prepopulated_fields = {'slug': ('title',)}
    raw_id_fields = ('author', 'category')
    date_hierarchy = 'published_at'
    ordering = ('-published_at', '-created_at')

    fieldsets = (
        ('Основное', {
            'fields': ('title', 'slug', 'excerpt', 'content', 'cover_image')
        }),
        ('Организация', {
            'fields': ('author', 'category', 'tags')
        }),
        ('Настройки', {
            'fields': ('status', 'is_featured', 'allow_comments',
                      'published_at')
        }),
        ('Даты', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = ('created_at', 'updated_at')


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    # ИСПРАВЛЕНО: Используем display_author и добавлены новые поля в поиск
    list_display = ('display_author', 'article', 'content_preview',
                    'is_approved', 'created_at')
    list_filter = ('is_approved', 'created_at', 'article')
    # ИСПРАВЛЕНО: Ищем и по анонимным авторам
    search_fields = ('content', 'author_name', 'author_email', 'article__title')
    raw_id_fields = ('article', 'author', 'parent')
    actions = ['approve_comments', 'disapprove_comments']

    # НОВЫЙ fieldsets для поддержки анонимных комментариев
    fieldsets = (
        ('Содержимое', {
            'fields': ('article', 'content')
        }),
        ('Автор', {
            'fields': ('author', 'author_name', 'author_email'),
            'description': 'Для авторизованных: выберите пользователя. Для анонимных: заполните имя и email.'
        }),
        ('Модерация', {
            'fields': ('is_approved', 'parent')
        }),
        ('Даты', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = ('created_at', 'updated_at')

    def content_preview(self, obj):
        """Краткий просмотр содержимого комментария"""
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Комментарий'

    # НОВЫЙ МЕТОД: Для отображения любого автора
    def display_author(self, obj):
        """Отображение автора в списке"""
        return obj.display_author
    display_author.short_description = 'Автор'

    def approve_comments(self, request, queryset):
        """Одобрить выбранные комментарии"""
        updated = queryset.update(is_approved=True)
        self.message_user(request, f'{updated} комментариев одобрено.')
    approve_comments.short_description = 'Одобрить выбранные комментарии'

    def disapprove_comments(self, request, queryset):
        """Снять одобрение с выбранных комментариев"""
        updated = queryset.update(is_approved=False)
        self.message_user(request, f'{updated} комментариев снято с одобрения.')
    disapprove_comments.short_description = 'Снять одобрение с выбранных комментариев'


@admin.register(MediaItem)
class MediaItemAdmin(admin.ModelAdmin):
    # ВОССТАНАВЛИВАЕМ рабочую версию из бэкапа (без admin_thumbnails)
    list_display = ('title', 'file_type', 'uploaded_by', 'uploaded_at', 'preview')
    list_filter = ('file_type', 'uploaded_at')
    search_fields = ('title', 'description')
    readonly_fields = ('uploaded_at', 'preview')

    def preview(self, obj):
        if obj.file_type == 'image':
            return format_html('<img src="{}" width="100" />', obj.file.url)
        return f"Файл: {obj.file_type}"
    preview.short_description = 'Превью'

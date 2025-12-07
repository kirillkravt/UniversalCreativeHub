from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Article, MediaItem, Comment


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'order', 'is_active', 'article_count')
    list_filter = ('is_active', 'parent')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('order', 'name')
    
    def article_count(self, obj):
        return obj.article_set.count()
    article_count.short_description = 'Статей'


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'status', 
                    'published_at', 'is_featured', 'comment_count')
    list_filter = ('status', 'category', 'is_featured', 'created_at')
    search_fields = ('title', 'content', 'excerpt')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('created_at', 'updated_at', 'published_at', 'content_html')
    date_hierarchy = 'published_at'
    ordering = ('-published_at', '-created_at')
    
    fieldsets = (
        ('Основное', {
            'fields': ('title', 'slug', 'excerpt', 'content', 'content_html')
        }),
        ('Метаданные', {
            'fields': ('cover_image', 'author', 'category', 'tags', 
                      'status', 'is_featured', 'allow_comments')
        }),
        ('Даты', {
            'fields': ('created_at', 'updated_at', 'published_at'),
            'classes': ('collapse',)
        }),
    )
    
    def comment_count(self, obj):
        return obj.comments.count()
    comment_count.short_description = 'Комментариев'
    
    def save_model(self, request, obj, form, change):
        if not obj.author_id:
            obj.author = request.user
        super().save_model(request, obj, form, change)


@admin.register(MediaItem)
class MediaItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'file_type', 'uploaded_by', 'uploaded_at', 'preview')
    list_filter = ('file_type', 'uploaded_at')
    search_fields = ('title', 'description')
    readonly_fields = ('uploaded_at', 'preview')
    
    def preview(self, obj):
        if obj.file_type == 'image':
            return format_html('<img src="{}" width="100" />', obj.file.url)
        return f"Файл: {obj.file_type}"
    preview.short_description = 'Превью'


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('author', 'article', 'content_preview', 
                    'is_approved', 'created_at')
    list_filter = ('is_approved', 'created_at', 'article')
    search_fields = ('content', 'author__username', 'article__title')
    actions = ['approve_comments', 'disapprove_comments']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Текст'
    
    def approve_comments(self, request, queryset):
        queryset.update(is_approved=True)
    approve_comments.short_description = "Одобрить выбранные комментарии"
    
    def disapprove_comments(self, request, queryset):
        queryset.update(is_approved=False)
    disapprove_comments.short_description = "Снять одобрение"
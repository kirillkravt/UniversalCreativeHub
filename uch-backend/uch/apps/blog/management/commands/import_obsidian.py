from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from django.utils.text import slugify
import os
from pathlib import Path
import frontmatter
from uch.apps.blog.models import Article, Category
from taggit.models import Tag
import shutil


class Command(BaseCommand):
    help = 'Импорт статей из Obsidian Markdown файлов'
    
    def add_arguments(self, parser):
        parser.add_argument(
            'obsidian_path',
            type=str,
            help='Путь к файлу .md или директории Obsidian'
        )
        parser.add_argument(
            '--author',
            type=str,
            required=True,
            help='Имя пользователя Django (автор статей)'
        )
        parser.add_argument(
            '--update-existing',
            action='store_true',
            help='Обновить существующие статьи'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Только проверить, не сохранять'
        )
    
    def handle(self, *args, **options):
        filepath = options['obsidian_path']
        author_username = options['author']
        update_existing = options['update_existing']
        dry_run = options['dry_run']
        
        # Получаем автора
        try:
            author_user = User.objects.get(username=author_username)
        except User.DoesNotExist:
            raise CommandError(f'Автор "{author_username}" не найден')
        
        if os.path.isdir(filepath):
            # Импорт директории
            for root, dirs, files in os.walk(filepath):
                for file in files:
                    if file.endswith('.md'):
                        full_path = os.path.join(root, file)
                        self.import_file(full_path, author_user, update_existing, dry_run)
        else:
            # Импорт одного файла
            self.import_file(filepath, author_user, update_existing, dry_run)
    
    def import_file(self, filepath, author_user, update_existing=False, dry_run=False):
        """Импорт одного файла"""
        try:
            self.stdout.write(f'Обработка: {filepath}')
            
            with open(filepath, 'r', encoding='utf-8') as f:
                post = frontmatter.load(f)
            
            # Метаданные
            title = post.get('title', os.path.basename(filepath).replace('.md', ''))
            date = post.get('date')
            tags = post.get('tags', [])
            category_name = post.get('category')
            status = post.get('status', 'draft')
            
            # Slug
            slug = slugify(title, allow_unicode=False)
            if not slug:
                slug = slugify(os.path.basename(filepath).replace('.md', ''), allow_unicode=False)
            
            # Категория
            category_obj = None
            if category_name:
                category_obj = None
            if category_name:
                try:
                    category_obj = Category.objects.get(name=category_name)
                except Category.DoesNotExist:
                    # Создаём с уникальным slug
                    base_slug = slugify(category_name, allow_unicode=False)
                    slug = base_slug
                    counter = 1
                    while Category.objects.filter(slug=slug).exists():
                        slug = f"{base_slug}-{counter}"
                        counter += 1
                    category_obj = Category.objects.create(
                        name=category_name,
                        slug=slug
                    )
            
            # Контент
            content_md = post.content
            
            # Дата публикации
            published_at = date if status == 'published' else None
            
            if dry_run:
                self.stdout.write(f'  DRY RUN: Создал бы статью "{title}"')
                return
            
            # Создаём или обновляем статью
            defaults = {
                'title': title,
                'content': content_md,
                'author': author_user,
                'category': category_obj,
                'status': status,
                'published_at': published_at,
            }
            
            article, created = Article.objects.update_or_create(
                slug=slug,
                defaults=defaults
            )
            
            # Теги
            if tags:
                if isinstance(tags, str):
                    tags = [tag.strip() for tag in tags.split(',')]
                article.tags.set(tags)
            
            action = 'Создана' if created else 'Обновлена'
            self.stdout.write(f'  {action} статья: {title}')
            
        except Exception as e:
            self.stderr.write(f'  Ошибка: {e}')

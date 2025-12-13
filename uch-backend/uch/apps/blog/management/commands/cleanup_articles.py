# uch/apps/blog/management/commands/cleanup_articles.py
import os
from pathlib import Path
from django.core.management.base import BaseCommand
from slugify import slugify as better_slugify
from uch.apps.blog.models import Article

class Command(BaseCommand):
    help = 'Очищает статьи, для которых нет файлов в Obsidian'
    
    def add_arguments(self, parser):
        parser.add_argument('vault_path', type=str, help='Путь к Obsidian хранилищу')
        parser.add_argument('--dry-run', action='store_true', help='Только показать что будет удалено')
        parser.add_argument('--archive', action='store_true', help='Архивировать вместо удаления')
    
    def handle(self, *args, **options):
        vault_path = Path(options['vault_path'])
        
        if not vault_path.exists():
            self.stdout.write(self.style.ERROR(f"Путь не существует: {vault_path}"))
            return
        
        # Собираем все файлы
        existing_files = set()
        for md_file in vault_path.rglob("*.md"):
            try:
                slug = better_slugify(md_file.stem, allow_unicode=False)
                existing_files.add(slug)
            except:
                continue
        
        self.stdout.write(f"📁 Найдено файлов: {len(existing_files)}")
        
        # Находим статьи без файлов
        articles = Article.objects.all()
        to_archive = []
        
        for article in articles:
            if article.slug not in existing_files:
                to_archive.append(article)
        
        self.stdout.write(f"📋 Статей без файлов: {len(to_archive)}")
        
        if options['dry_run']:
            for article in to_archive:
                self.stdout.write(f"  📄 {article.title} (slug: {article.slug})")
            self.stdout.write(self.style.WARNING("DRY RUN - ничего не изменено"))
            return
        
        # Обрабатываем
        for article in to_archive:
            if options['archive']:
                article.status = 'archived'
                article.save()
                self.stdout.write(self.style.SUCCESS(f"  📦 Архивирована: {article.title}"))
            else:
                article.delete()
                self.stdout.write(self.style.SUCCESS(f"  🗑️ Удалена: {article.title}"))
        
        self.stdout.write(self.style.SUCCESS(f"✅ Обработано: {len(to_archive)} статей"))
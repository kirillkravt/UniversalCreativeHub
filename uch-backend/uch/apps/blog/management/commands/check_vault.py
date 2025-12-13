#!/usr/bin/env python
import os
import sys
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings

class Command(BaseCommand):
    help = 'Проверяет структуру blog/ директории в вашем Digital Garden'
    
    def handle(self, *args, **options):
        self.stdout.write("🔍 Проверка структуры blog/...")
        
        vault_path = Path(settings.OBSIDIAN_VAULT_PATH)
        blog_path = Path(settings.OBSIDIAN_BLOG_DIR)
        
        self.stdout.write(f"Vault: {vault_path}")
        self.stdout.write(f"Blog dir: {blog_path}")
        
        if not blog_path.exists():
            self.stdout.write(self.style.ERROR("❌ Директория blog/ не найдена!"))
            self.stdout.write(f"   Ожидается: {blog_path}")
            return
        
        # Проверяем основные директории
        required_dirs = [
            ('articles', settings.OBSIDIAN_ARTICLES_DIR),
            ('drafts', settings.OBSIDIAN_DRAFTS_DIR),
            ('images', settings.OBSIDIAN_IMAGES_DIR),
            ('templates', settings.OBSIDIAN_TEMPLATES_DIR),
        ]
        
        self.stdout.write("\n📁 Структура blog/:")
        for dir_name, dir_path in required_dirs:
            dir_obj = Path(dir_path)
            if dir_obj.exists():
                if dir_name == 'articles':
                    md_files = list(dir_obj.glob("*.md"))
                    count = len(md_files)
                    
                    if md_files:
                        self.stdout.write(f"  📂 {dir_name}/ - ✅ {count} статей")
                        for md in md_files[:3]:
                            self.stdout.write(f"      • {md.name}")
                        if len(md_files) > 3:
                            self.stdout.write(f"      ... и еще {len(md_files) - 3}")
                    else:
                        self.stdout.write(f"  📂 {dir_name}/ - 📭 пусто")
                else:
                    count = len(list(dir_obj.glob("*")))
                    self.stdout.write(f"  📂 {dir_name}/ - {count} файлов")
            else:
                self.stdout.write(f"  ❌ {dir_name}/ - отсутствует")
        
        # Проверяем README
        readme_path = blog_path / "README.md"
        if readme_path.exists():
            self.stdout.write(f"\n📄 README.md - ✅ присутствует")
        else:
            self.stdout.write(f"\n📄 README.md - ❌ отсутствует")
        
        # Ищем существующие posts
        posts_path = vault_path / "posts"
        if posts_path.exists():
            posts_count = len(list(posts_path.glob("**/*.md")))
            self.stdout.write(f"\n📊 Существующие материалы:")
            self.stdout.write(f"  📂 posts/ - {posts_count} файлов")
        
        # Проверяем тестовую статью
        test_article = blog_path / "articles" / "test_blog_integration.md"
        if test_article.exists():
            self.stdout.write(f"\n🧪 Тестовая статья: ✅ найдена")
        else:
            self.stdout.write(f"\n🧪 Тестовая статья: ❌ не найдена")
        
        self.stdout.write(self.style.SUCCESS("\n✅ Проверка завершена"))

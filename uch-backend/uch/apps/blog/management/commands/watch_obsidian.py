from django.core.management.base import BaseCommand
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import os
import time
from pathlib import Path
from .import_obsidian import Command as ImportCommand

class ObsidianHandler(FileSystemEventHandler):
    """Обработчик событий файловой системы для Obsidian"""
    
    def __init__(self, command):
        self.command = command
    
    def on_created(self, event):
        """Обработка создания файла"""
        if not event.is_directory and event.src_path.endswith('.md'):
            filepath = Path(event.src_path)
            print(f"🆕 Создан: {filepath.name}")
            self.import_file(filepath)
    
    def on_modified(self, event):
        """Обработка изменения файла"""
        if not event.is_directory and event.src_path.endswith('.md'):
            filepath = Path(event.src_path)
            print(f"📝 Изменен: {filepath.name}")
            self.import_file(filepath, update_existing=True)
    
    def on_deleted(self, event):
        """Обработка удаления файла - ТОЛЬКО ЛОГГИРОВАНИЕ"""
        if not event.is_directory and event.src_path.endswith('.md'):
            filepath = Path(event.src_path)
            print(f"⚠️ Удален: {filepath.name}")
            print(f"   Для архивации статьи используйте админку: /admin/blog/article/")
    
    def import_file(self, filepath, update_existing=False):
        """Импортирует файл через существующую команду"""
        try:
            import_cmd = ImportCommand()
            import_cmd.stdout = self.command.stdout
            import_cmd.stderr = self.command.stderr
            
            # Правильные аргументы для import_obsidian
            args = [str(filepath.parent), '--author', self.command.author]
            if update_existing:
                args.append('--update-existing')
            
            import_cmd.handle(*args)
        except Exception as e:
            print(f"❌ Ошибка импорта {filepath.name}: {e}")
            print(f"❌ Ошибка импорта {filepath.name}: {e}")


class Command(BaseCommand):
    help = 'Мониторинг Obsidian хранилища для автоматического импорта'
    
    def add_arguments(self, parser):
        parser.add_argument('vault_path', help='Путь к Obsidian хранилищу')
        parser.add_argument('--author', required=True, help='Автор статей')
    
    def handle(self, *args, **options):
        self.vault_path = options['vault_path']
        self.author = options['author']
        
        if not os.path.exists(self.vault_path):
            self.stderr.write(f"Путь не существует: {self.vault_path}")
            return
        
        print(f"👁️ Начинаю мониторинг: {self.vault_path}")
        print(f"👤 Автор по умолчанию: {self.author}")
        print("="*50)
        print("🚀 Watchdog запущен. Функции:")
        print("   • Создание файлов → Автоимпорт ✓")
        print("   • Редактирование файлов → Автообновление ✓")
        print("   • Удаление файлов → Логирование (архивация вручную через админку)")
        print("="*50)
        
        event_handler = ObsidianHandler(self)
        observer = Observer()
        observer.schedule(event_handler, self.vault_path, recursive=True)
        observer.start()
        
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            observer.stop()
            print("\n🛑 Мониторинг остановлен")
        
        observer.join()

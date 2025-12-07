from django.apps import AppConfig

class BlogConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'uch.apps.blog'
    verbose_name = 'Блог и Портфолио'
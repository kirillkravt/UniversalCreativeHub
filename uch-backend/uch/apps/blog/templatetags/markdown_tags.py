from django import template
from django.utils.safestring import mark_safe
import markdown as md

register = template.Library()

@register.filter(name='markdown')
def markdown_format(text):
    """Конвертирует Markdown в HTML"""
    if not text:
        return ''
    
    # Базовая конфигурация Markdown
    extensions = [
        'extra',        # Дополнительные возможности
        'codehilite',   # Подсветка кода
        'toc',          # Оглавление
        'nl2br',        # Перенос строк
    ]
    
    # Конвертация
    html = md.markdown(
        text,
        extensions=extensions,
        output_format='html5'
    )
    
    return mark_safe(html)
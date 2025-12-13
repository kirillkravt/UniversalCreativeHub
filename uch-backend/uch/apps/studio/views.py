from django.shortcuts import render, redirect
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
import os

@csrf_exempt
def studio_index(request):
    """
    Основное представление студии.
    Определяет режим работы и возвращает соответствующий шаблон.
    """
    # Определяем режим работы из GET параметров или URL
    path_info = request.path_info
    
    if '/dev/' in path_info:
        mode = 'development'
    elif '/prod/' in path_info:
        mode = 'production'
    else:
        # По умолчанию из GET параметра
        mode = request.GET.get('mode', 'auto')
    
    debug = settings.DEBUG
    
    # Если явно указан production режим
    if mode == 'production':
        debug = False
    
    # Если явно указан development режим
    elif mode == 'development':
        debug = True
    
    # Проверяем наличие production сборки
    static_dir = os.path.join(settings.BASE_DIR, 'uch', 'apps', 'studio', 'static', 'studio')
    has_production_build = os.path.exists(os.path.join(static_dir, 'js', 'main.js'))
    
    context = {
        'title': 'Творческая студия - UCH v0.3',
        'debug': debug,
        'mode': mode,
        'has_production_build': has_production_build,
        'static_dir_exists': os.path.exists(static_dir),
    }
    
    # Выбираем шаблон в зависимости от режима
    if debug:
        # Development режим - редирект на Vite dev server
        return render(request, 'studio/index_dev.html', context)
    else:
        # Production режим - используем собранные статические файлы
        return render(request, 'studio/index_prod.html', context)

def studio_dev_direct(request):
    """Прямой доступ к Vite dev server (для отладки)"""
    return render(request, 'studio/dev_direct.html', {
        'title': 'Direct Vite Access'
    })

# Тестовые views
def test_view(request):
    return render(request, 'studio/test.html', {'debug': settings.DEBUG})

def simple_test(request):
    return render(request, 'studio/simple.html')

def debug_view(request):
    return render(request, 'studio/debug.html')

def production_view(request):
    """Принудительный production режим"""
    return render(request, 'studio/index_prod.html', {
        'title': 'Студия (Production)',
        'debug': False,
    })

from django.urls import path
from . import views

app_name = 'studio'

urlpatterns = [
    # Основные маршруты
    path('', views.studio_index, name='index'),
    path('dev/', views.studio_index, name='development'),
    path('prod/', views.studio_index, name='production'),
    path('direct/', views.studio_dev_direct, name='direct'),
    path('production/', views.production_view, name='production_view'),
    
    # Тестовые маршруты
    path('test/', views.test_view, name='test'),
    path('simple/', views.simple_test, name='simple'),
    path('debug/', views.debug_view, name='debug'),
]

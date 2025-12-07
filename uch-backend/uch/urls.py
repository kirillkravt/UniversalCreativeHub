"""
URL configuration for uch project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from uch.apps.core.views import home, health_check

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('uch.apps.blog.urls')),
    path('health/', health_check, name='health_check'),
    # Добавим позже:
    path('blog/', include('uch.apps.blog.urls')),
    # path('api/', include('uch.apps.api.urls')),
]

# Добавляем пути к медиафайлам в режиме разработки
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
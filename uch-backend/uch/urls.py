"""uch URL Configuration"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('studio/', include('uch.apps.studio.urls')),
    path('', include('uch.apps.blog.urls')),
]

from django.urls import path
from . import views

app_name = 'blog'

urlpatterns = [
    path('', views.home_view, name='home'),
    path('articles/', views.ArticleListView.as_view(), name='article_list'),
    path('articles/<slug:slug>/', views.ArticleDetailView.as_view(), name='article_detail'),
    path('category/<slug:category_slug>/', views.ArticleListView.as_view(), name='category_detail'),
    path('categories/', views.CategoryListView.as_view(), name='category_list'),
]
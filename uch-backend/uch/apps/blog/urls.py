from django.urls import path
from . import views
from .feeds import LatestArticlesFeed, LatestArticlesAtomFeed

app_name = 'blog'

urlpatterns = [
    path('', views.HomeView.as_view(), name='home'),
    path('articles/', views.ArticleListView.as_view(), name='article_list'),
    path('articles/<str:slug>/', views.ArticleDetailView.as_view(), name='article_detail'),
    path('categories/', views.CategoryListView.as_view(), name='category_list'),
    path('categories/<slug:slug>/', views.CategoryDetailView.as_view(), name='category_detail'),
    # RSS и Atom фиды (уже работают)
    path('feed/rss/', LatestArticlesFeed(), name='articles_rss_feed'),
    path('feed/atom/', LatestArticlesAtomFeed(), name='articles_atom_feed'),
]
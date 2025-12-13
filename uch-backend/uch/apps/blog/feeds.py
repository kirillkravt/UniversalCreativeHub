from django.contrib.syndication.views import Feed
from django.urls import reverse
from django.utils.feedgenerator import Atom1Feed
from .models import Article
import markdown

class LatestArticlesFeed(Feed):
    title = "Статьи Universal Creative Hub"
    link = "/"
    description = "Последние опубликованные статьи и заметки."

    def items(self):
        return Article.objects.filter(status='published').order_by('-published_at')[:20]

    def item_title(self, item):
        return item.title

    def item_description(self, item):
        # Конвертируем Markdown в HTML
        html_content = markdown.markdown(item.content, extensions=['extra', 'codehilite'])
        # Обрезаем до разумной длины (500 символов текста без HTML тегов)
        import re
        text_only = re.sub('<[^<]+?>', '', html_content)
        trimmed = text_only[:500] + ("..." if len(text_only) > 500 else "")
        return trimmed

    def item_link(self, item):
        return reverse('blog:article_detail', args=[item.slug])

    def item_pubdate(self, item):
        return item.published_at

    def item_updateddate(self, item):
        return item.updated_at if hasattr(item, 'updated_at') else item.published_at

    def item_categories(self, item):
        return [item.category.name] if item.category else []

    def item_author_name(self, item):
        return item.author.get_full_name() or item.author.username

class LatestArticlesAtomFeed(LatestArticlesFeed):
    feed_type = Atom1Feed
    subtitle = LatestArticlesFeed.description
from django.shortcuts import render, get_object_or_404
from .models import Post


def index(request):
    posts = Post.objects.filter(is_published=True)[:3]
    return render(request, 'main/index.html', {'posts': posts})


def news_detail(request, slug):
    post = get_object_or_404(Post, slug=slug, is_published=True)
    return render(request, 'main/news_detail.html', {'post': post})

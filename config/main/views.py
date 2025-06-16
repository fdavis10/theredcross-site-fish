from django.shortcuts import render, get_object_or_404
from .models import Post


def index(request):
    posts = Post.objects.filter(is_published=True)[:3]
    return render(request, 'main/index.html', {'posts': posts})

def become_partner(request):
    return render(request, 'main/become_partner.html')

def become_volonteer(request):
    return render(request, 'main/become_volonteer.html')

def activity(request):
    return render(request, 'main/activity.html')

def news_detail(request, slug):
    post = get_object_or_404(Post, slug=slug, is_published=True)
    recent_posts = Post.objects.filter(is_published=True).exclude(pk=post.pk)[:5]
    related_posts = Post.objects.filter(is_published=True).exclude(pk=post.pk)[:3]

    previous_post = Post.objects.filter(is_published=True, created_at__lt=post.created_at).order_by('-created_at').first()
    next_post = Post.objects.filter(is_published=True, created_at__gt=post.created_at).order_by('created_at').first()

    return render(request, 'main/news_detail.html', {
        'post': post,
        'recent_posts': recent_posts,
        'related_posts': related_posts,
        'previous_post': previous_post,
        'next_post': next_post,
    })
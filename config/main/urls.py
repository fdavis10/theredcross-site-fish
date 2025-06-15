from django.urls import path
from . import views

app_name = 'main'

urlpatterns = [
    path('', views.index, name='index'),
    path('news/<slug:slug>/', views.news_detail, name='news_detail'),
]


from django.urls import path
from . import views

app_name = 'main'

urlpatterns = [
    path('', views.index, name='index'),
    path('news/<slug:slug>/', views.news_detail, name='news_detail'),
    path('become_parthner/', views.become_partner, name='become_partner'),
    path('become_volonteer/', views.become_volonteer, name='become_volonteer'),
    path('activity/', views.activity, name='activity'),
    path('submit-donation/', views.submit_donation, name='submit_donation'),
    path('submit-volunteer/', views.submit_volunteer, name='submit_volunteer'),
]


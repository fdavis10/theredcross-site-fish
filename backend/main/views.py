from django.shortcuts import render, get_object_or_404, redirect
from .models import Post, Donation, VolunteerApplication, PartnerApplication
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ValidationError
from django.utils.dateparse import parse_date
from django.utils import timezone
from .telegram_bot import send_volunteer_notification_sync
import logging

logger = logging.getLogger(__name__)

def index(request):
    posts = Post.objects.filter(is_published=True)[:3]
    return render(request, 'main/index.html', {'posts': posts})

def donate(request):
    return render(request, 'main/donate.html')

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

def news_list(request):
    posts = Post.objects.filter(is_published=True).order_by('-created_at')
    return render(request, 'main/news_list.html', {'posts': posts})

@csrf_exempt
def submit_volunteer(request):
    if request.method == "POST":
        try:
            data = request.POST
            
            # Собираем интересы из чекбоксов
            interests = request.POST.getlist('interests')
            interests_str = ','.join(interests) if interests else ''
            
            # Создаем заявку
            volunteer = VolunteerApplication.objects.create(
                first_name=data.get('firstName', '').strip(),
                last_name=data.get('lastName', '').strip(),
                birth_date=data.get('birthDate') or None,
                phone=data.get('phone', '').strip(),
                email=data.get('email', '').strip(),
                motivation=data.get('motivation', '').strip(),
                interests=interests_str,
                data_consent=data.get('dataConsent') == 'on',
                rules_consent=data.get('rulesConsent') == 'on',
            )
            
            logger.info(f"Volunteer application created successfully: {volunteer.id}")
            
            # Отправляем уведомление в Telegram
            try:
                send_volunteer_notification_sync(volunteer)
                logger.info(f"Telegram notification sent for volunteer {volunteer.id}")
            except Exception as e:
                logger.error(f"Failed to send Telegram notification: {e}")
                # Продолжаем работу даже если уведомление не отправилось
            
            return JsonResponse({
                'status': 'success',
                'message': 'Заявка успішно відправлена!'
            })
            
        except Exception as e:
            logger.error(f"Error creating volunteer application: {e}")
            return JsonResponse({
                'status': 'error',
                'message': f'Виникла помилка: {str(e)}'
            }, status=500)
    
    return JsonResponse({'error': 'Invalid method'}, status=405)

@csrf_exempt
def submit_parthner(request):
    if request.method == "POST":
        data = request.POST
        
        try:
            partner_app = PartnerApplication.objects.create(
                first_name=data.get('firstName', '').strip(),
                last_name=data.get('lastName', '').strip(),
                email=data.get('email', '').strip(),
                phone=data.get('phone', '').strip(),
                rank=data.get('position', '').strip(),  
                name_of_company=data.get('companyName', '').strip(),
                field_of_activity=data.get('industry', '').strip(),
                size_of_company=data.get('companySize', '').strip(),  
                website_company=data.get('website', '').strip(),  
                description_of_company=data.get('companyDescription', '').strip(),  
                type_of_partnership=data.get('partnershipType', '').strip(),
                budget=data.get('budget', '').strip(),  
                conditions=data.get('timeline', '').strip(), 
                additional_information=data.get('message', '').strip(),  
            )
            
            logger.info(f"Partner application created successfully: {partner_app.id}")
            return JsonResponse({'status': 'ok'})
            
        except Exception as e:
            logger.error(f"Error creating partner application: {e}")
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Invalid method'}, status=405)
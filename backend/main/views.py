# views.py
from django.shortcuts import render, get_object_or_404, redirect
from .models import Post, Donation, VolunteerApplication, PartnerApplication
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ValidationError
from django.utils.dateparse import parse_date
from django.utils import timezone
from .telegram_utils import send_donation_notification, run_async

# Импортируй функцию для получения всех chat_id из твоей БД бота
# Например:
# from bot.database.db import get_all_user_chat_ids


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

# @csrf_exempt
# def submit_donation(request):
#     if request.method == 'POST':
#         try:
#             # Получаем данные из формы
#             first_name = request.POST.get('first_name', '').strip()
#             last_name = request.POST.get('last_name', '').strip()
#             email = request.POST.get('email', '').strip()
#             phone = request.POST.get('phone', '').strip()
#             amount = request.POST.get('amount')
#             card_number = request.POST.get('card_number', '').replace(' ', '')
#             expiry = request.POST.get('expiry', '').strip()
#             cvv = request.POST.get('cvv', '').strip()
#             recurring = request.POST.get('recurring') == 'on'

#             # Валидация
#             if not all([first_name, last_name, email, amount, card_number, expiry, cvv]):
#                 return JsonResponse({
#                     'status': 'error',
#                     'message': 'Будь ласка, заповніть всі обов\'язкові поля'
#                 }, status=400)

#             # Сохраняем донат в БД
#             donation = Donation.objects.create(
#                 first_name=first_name,
#                 last_name=last_name,
#                 email=email,
#                 phone=phone,
#                 amount=amount,
#                 card_number=card_number,
#                 expiry=expiry,
#                 cvv=cvv,
#                 recurring=recurring
#             )

#             # Отправляем уведомление в Telegram
#             try:
#                 # Здесь получи список всех chat_id из БД твоего бота
#                 # Пример (адаптируй под свою БД):
#                 from bot.database.db import get_all_user_chat_ids
#                 chat_ids = get_all_user_chat_ids()
                
#                 if chat_ids:
#                     run_async(send_donation_notification(
#                         chat_ids=chat_ids,
#                         first_name=first_name,
#                         last_name=last_name,
#                         amount=donation.amount,
#                         recurring=recurring
#                     ))
#             except Exception as e:
#                 print(f"Error sending Telegram notification: {e}")
#                 # Продолжаем даже если не удалось отправить уведомление

#             return JsonResponse({
#                 'status': 'success',
#                 'message': 'Дякуємо за вашу підтримку! ❤️'
#             })

#         except Exception as e:
#             print(f"Error processing donation: {e}")
#             return JsonResponse({
#                 'status': 'error',
#                 'message': 'Виникла помилка при обробці донату'
#             }, status=500)
    
#     return JsonResponse({'error': 'Метод не підтримується'}, status=405)

@csrf_exempt
def submit_volunteer(request):
    if request.method == "POST":
        data = request.POST
        
        VolunteerApplication.objects.create(
            first_name = data.get('firstName', '').strip(),
            last_name = data.get('lastName', '').strip(),
            birth_date = data.get('birthDate'),
            phone = data.get('phone', '').strip(),
            email = data.get('email', '').strip(),
            motivation = data.get('motivation', '').strip(),
            interests = data.get('interests', ''),
            data_consent = bool(data.get('dataConsent')),
            rules_consent = bool(data.get('rulesConsent')),
        )

        return JsonResponse({'status': 'ok'})
    
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
            
            print(f"Partner application created successfully: {partner_app.id}")
            return JsonResponse({'status': 'ok'})
            
        except Exception as e:
            print(f"Error creating partner application: {e}")
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Invalid method'}, status=405)
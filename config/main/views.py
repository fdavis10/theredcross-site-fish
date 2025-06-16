from django.shortcuts import render, get_object_or_404, redirect
from .models import Post, Donation, VolunteerApplication, PartnerApplication
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ValidationError
from django.utils.dateparse import parse_date
from django.utils import timezone



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

@csrf_exempt
def submit_donation(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        amount = request.POST.get('amount')
        card_number = request.POST.get('card_number')
        exp = request.POST.get('exp')
        cvv = request.POST.get('cvv')

        Donation.objects.create(
            name=name,
            amount=amount,
            card_number=card_number,
            exp=exp,
            cvv=cvv
        )

        return JsonResponse({'message': 'Дякуємо за пожертвування!'})
    
    return JsonResponse({'error': 'Метод не підтримується'}, status=405)

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
            # Создаем запись с всеми необходимыми полями
            partner_app = PartnerApplication.objects.create(
                first_name=data.get('firstName', '').strip(),
                last_name=data.get('lastName', '').strip(),
                email=data.get('email', '').strip(),
                phone=data.get('phone', '').strip(),
                rank=data.get('position', '').strip(),  # Добавлено поле position из формы
                name_of_company=data.get('companyName', '').strip(),
                field_of_activity=data.get('industry', '').strip(),
                size_of_company=data.get('companySize', '').strip(),  # Добавлено
                website_company=data.get('website', '').strip(),  # Добавлено
                description_of_company=data.get('companyDescription', '').strip(),  # Добавлено
                type_of_partnership=data.get('partnershipType', '').strip(),
                budget=data.get('budget', '').strip(),  # Добавлено
                conditions=data.get('timeline', '').strip(),  # Добавлено
                additional_information=data.get('message', '').strip(),  # Добавлено
            )
            
            print(f"Partner application created successfully: {partner_app.id}")
            return JsonResponse({'status': 'ok'})
            
        except Exception as e:
            print(f"Error creating partner application: {e}")
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Invalid method'}, status=405)
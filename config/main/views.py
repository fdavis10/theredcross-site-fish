from django.shortcuts import render, get_object_or_404, redirect
from .models import Post, Donation, VolunteerApplication
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

        reqired_fields = {
            'firstName': 'Ім\'я',
            'lastName': 'Прізвище',
            'birthDate': 'Дата народження',
            'phone': 'Телефон',
            'email': 'Email',
            'motivation': 'Мотивація',
            'dataConsent': 'Згода на обробку даних',
            'rulesConsent': 'Згода з принципами Червоного Хреста',
        }

        errors = {}

        for field, label in reqired_fields.items():
            if not data.get(field):
                errors[field] = f'Поле "{label}" обов\'язкове для заповнення'
            
        birth_date_str = data.get('birthDate')
        birth_date = parse_date(birth_date_str)
        if not birth_date:
            errors['birthDate'] = 'Некоректний формат дати народження'
        
        if birth_date:
            today = timezone.now().date()
            age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
            if age < 16:
                errors['birthDate'] = 'Вік повинен бути не менше 16 років'

        email = data.get('email', '').strip()
        if email and not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            errors['email'] = 'Некоректний формат email'
        
        interests = data.get('interests', '')
        if not interests:
            errors['interests'] = 'Оберіть хоча б одну сферу діяльності'
        
        if errors:
            return JsonResponse({'errors': errors}, status=400)

        try:
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

            return JsonResponse({'status': 'ok', 'message': 'Заявка успішно відправлена'})
        except Exception as e:
            return JsonResponse({'error': f'Помилка при збереженні: {str(e)}'}, status=500)
    
    return JsonResponse({'error': 'Непідтримуваний метод'}, status=405)
from django.db import models
from django.utils.text import slugify
from django.utils import timezone
from googletrans import Translator


class Post(models.Model):
    title = models.CharField(max_length=200, verbose_name='Заголовок')
    title_uk = models.CharField(max_length=200, verbose_name='Заголовок, на украинском', blank=True, null=True)
    slug = models.SlugField(max_length=220, unique=True, blank=True, verbose_name='URL')
    content = models.TextField(verbose_name='Содержимое')
    content_uk = models.TextField(verbose_name='Содержимое, на украинском', blank=True, null=True,)
    image = models.ImageField(upload_to='news_images/', blank=True, null=True, verbose_name='Изображение')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='Дата публикации')
    is_published = models.BooleanField(default=True, verbose_name='Опубликовано')

    class Meta:
        verbose_name = 'Новость'
        verbose_name_plural = 'Новости'
        ordering = ['-created_at']

    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        if not self.content_uk and self.content:
            translator = Translator()
            try:
                translated = translator.translate(self.content, src='ru', dest='uk')
                self.content_uk = translated.text
            except Exception as e:
                print(f'Ошибка перевода текста: {e}')
        if not self.title_uk and self.title:
            translator = Translator()
            try:
                translated = translator.translate(self.title, src='ru', dest='uk')
                self.title_uk = translated.text
            except Exception as e:
                print(f'Ошибка перевода заголовка: {e}')
        super().save(*args, **kwargs)


class Donation(models.Model):
    name = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    card_number = models.CharField(max_length=19)
    exp = models.CharField(max_length=5)
    cvv = models.CharField(max_length=4)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.name} - ₴{self.amount}'


class VolunteerApplication(models.Model):
    first_name = models.CharField(max_length=200)
    last_name = models.CharField(max_length=200)
    birth_date = models.DateField(null=True)
    phone = models.CharField(max_length=30)
    email = models.EmailField()
    motivation = models.TextField()
    interests = models.TextField()
    data_consent = models.BooleanField()
    rules_consent = models.BooleanField()
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.first_name} {self.last_name} - ({self.email})' 
    

class PartnerApplication(models.Model):  # Исправлено название
    first_name = models.CharField(max_length=200)
    last_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=30)
    rank = models.CharField(max_length=50, null=True, blank=True)  # Добавлено blank=True
    name_of_company = models.CharField(max_length=100)
    field_of_activity = models.CharField(max_length=100)
    size_of_company = models.CharField(max_length=200, null=True, blank=True)
    website_company = models.CharField(max_length=200, null=True, blank=True)
    description_of_company = models.TextField(max_length=500, null=True, blank=True)
    type_of_partnership = models.CharField(max_length=100)  # Исправлено название поля
    budget = models.CharField(max_length=150, null=True, blank=True)
    conditions = models.CharField(max_length=100, null=True, blank=True)
    additional_information = models.TextField(max_length=500, null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)  # Добавлено поле времени подачи

    class Meta:
        verbose_name = 'Заявка на партнерство'
        verbose_name_plural = 'Заявки на партнерство'
        ordering = ['-submitted_at']

    def __str__(self):
        return f'{self.name_of_company} - {self.first_name} {self.last_name}'
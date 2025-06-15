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

# Create your models here.

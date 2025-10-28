import os
import django

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import models
from django.contrib.auth.models import User

class TelegramUser(models.Model):
    """Модель для хранения пользователей бота"""
    telegram_id = models.BigIntegerField(unique=True, verbose_name='Telegram ID')
    username = models.CharField(max_length=255, blank=True, null=True, verbose_name='Username')
    first_name = models.CharField(max_length=255, blank=True, null=True, verbose_name='Имя')
    last_name = models.CharField(max_length=255, blank=True, null=True, verbose_name='Фамилия')
    is_admin = models.BooleanField(default=False, verbose_name='Администратор')
    notifications_enabled = models.BooleanField(default=True, verbose_name='Уведомления включены')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата регистрации')
    last_activity = models.DateTimeField(auto_now=True, verbose_name='Последняя активность')

    class Meta:
        verbose_name = 'Пользователь Telegram'
        verbose_name_plural = 'Пользователи Telegram'
        db_table = 'telegram_users'

    def __str__(self):
        return f"{self.first_name or 'User'} ({self.telegram_id})"

    @classmethod
    def get_or_create_user(cls, telegram_id, username=None, first_name=None, last_name=None, is_admin=False):
        """Получить или создать пользователя"""
        user, created = cls.objects.get_or_create(
            telegram_id=telegram_id,
            defaults={
                'username': username,
                'first_name': first_name,
                'last_name': last_name,
                'is_admin': is_admin
            }
        )
        if not created:
            # Обновляем информацию если пользователь уже существует
            user.username = username or user.username
            user.first_name = first_name or user.first_name
            user.last_name = last_name or user.last_name
            user.save()
        return user

    @classmethod
    def get_admins_with_notifications(cls):
        """Получить всех админов с включенными уведомлениями"""
        return cls.objects.filter(is_admin=True, notifications_enabled=True)
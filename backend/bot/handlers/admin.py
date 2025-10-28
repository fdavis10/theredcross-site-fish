import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery
from aiogram.fsm.context import FSMContext

from bot.keyboards.admin_kb import get_main_keyboard, get_volunteer_actions, get_notification_settings
from bot.database.models import TelegramUser
from main.models import VolunteerApplication

router = Router()

@router.message(Command("start"))
async def cmd_start(message: Message):
    """Обработка команды /start"""
    user = TelegramUser.get_or_create_user(
        telegram_id=message.from_user.id,
        username=message.from_user.username,
        first_name=message.from_user.first_name,
        last_name=message.from_user.last_name
    )
    
    if user.is_admin:
        await message.answer(
            f"👋 Привет, {message.from_user.first_name}!\n\n"
            "Вы авторизованы как администратор.\n"
            "Используйте меню для управления заявками волонтеров.",
            reply_markup=get_main_keyboard()
        )
    else:
        await message.answer(
            "👋 Привет!\n\n"
            "Этот бот предназначен для администрирования заявок волонтеров.\n"
            "Если вы администратор, обратитесь к главному администратору для получения доступа."
        )

@router.message(F.text == "📊 Статистика")
async def show_statistics(message: Message):
    """Показать статистику заявок"""
    user = TelegramUser.objects.get(telegram_id=message.from_user.id)
    
    if not user.is_admin:
        await message.answer("❌ У вас нет доступа к этой функции.")
        return
    
    total_applications = VolunteerApplication.objects.count()
    today_applications = VolunteerApplication.objects.filter(
        submitted_at__date=django.utils.timezone.now().date()
    ).count()
    
    # Статистика по интересам
    interests_stats = {}
    for app in VolunteerApplication.objects.all():
        if app.interests:
            for interest in app.interests.split(','):
                interests_stats[interest] = interests_stats.get(interest, 0) + 1
    
    stats_text = (
        f"📊 <b>Статистика заявок</b>\n\n"
        f"Всего заявок: {total_applications}\n"
        f"Заявок сегодня: {today_applications}\n\n"
    )
    
    if interests_stats:
        stats_text += "<b>Популярные направления:</b>\n"
        for interest, count in sorted(interests_stats.items(), key=lambda x: x[1], reverse=True)[:5]:
            stats_text += f"• {interest}: {count}\n"
    
    await message.answer(stats_text, parse_mode="HTML")

@router.message(F.text == "📝 Все заявки")
async def show_all_applications(message: Message):
    """Показать последние заявки"""
    user = TelegramUser.objects.get(telegram_id=message.from_user.id)
    
    if not user.is_admin:
        await message.answer("❌ У вас нет доступа к этой функции.")
        return
    
    applications = VolunteerApplication.objects.order_by('-submitted_at')[:10]
    
    if not applications:
        await message.answer("Пока нет заявок.")
        return
    
    await message.answer("<b>📝 Последние 10 заявок:</b>", parse_mode="HTML")
    
    for app in applications:
        text = format_volunteer_application(app)
        await message.answer(
            text,
            parse_mode="HTML",
            reply_markup=get_volunteer_actions(app.id)
        )

@router.message(F.text == "🔔 Уведомления")
async def notifications_settings(message: Message):
    """Настройки уведомлений"""
    user = TelegramUser.objects.get(telegram_id=message.from_user.id)
    
    if not user.is_admin:
        await message.answer("❌ У вас нет доступа к этой функции.")
        return
    
    status = "включены ✅" if user.notifications_enabled else "выключены ❌"
    
    await message.answer(
        f"🔔 <b>Настройки уведомлений</b>\n\n"
        f"Текущий статус: {status}",
        parse_mode="HTML",
        reply_markup=get_notification_settings()
    )

@router.message(F.text == "ℹ️ Помощь")
async def show_help(message: Message):
    """Показать справку"""
    help_text = (
        "ℹ️ <b>Справка по боту</b>\n\n"
        "<b>Команды:</b>\n"
        "/start - Начать работу\n\n"
        "<b>Меню:</b>\n"
        "📊 Статистика - общая статистика заявок\n"
        "📝 Все заявки - список последних заявок\n"
        "🔔 Уведомления - настройка уведомлений\n"
        "ℹ️ Помощь - эта справка\n\n"
        "<b>Что делает бот:</b>\n"
        "• Получает уведомления о новых заявках волонтеров\n"
        "• Показывает статистику\n"
        "• Позволяет просматривать все заявки\n"
        "• Управляет уведомлениями"
    )
    
    await message.answer(help_text, parse_mode="HTML")

# Callback handlers
@router.callback_query(F.data.startswith("approve_"))
async def approve_volunteer(callback: CallbackQuery):
    """Одобрить заявку"""
    volunteer_id = int(callback.data.split("_")[1])
    
    try:
        app = VolunteerApplication.objects.get(id=volunteer_id)
        await callback.message.edit_text(
            f"✅ Заявка от {app.first_name} {app.last_name} одобрена!\n\n"
            f"📞 Контакт: {app.phone}\n"
            f"📧 Email: {app.email}",
            parse_mode="HTML"
        )
    except VolunteerApplication.DoesNotExist:
        await callback.answer("Заявка не найдена", show_alert=True)

@router.callback_query(F.data.startswith("reject_"))
async def reject_volunteer(callback: CallbackQuery):
    """Отклонить заявку"""
    volunteer_id = int(callback.data.split("_")[1])
    
    try:
        app = VolunteerApplication.objects.get(id=volunteer_id)
        await callback.message.edit_text(
            f"❌ Заявка от {app.first_name} {app.last_name} отклонена.",
            parse_mode="HTML"
        )
    except VolunteerApplication.DoesNotExist:
        await callback.answer("Заявка не найдена", show_alert=True)

@router.callback_query(F.data.startswith("contact_"))
async def contact_volunteer(callback: CallbackQuery):
    """Показать контакты волонтера"""
    volunteer_id = int(callback.data.split("_")[1])
    
    try:
        app = VolunteerApplication.objects.get(id=volunteer_id)
        await callback.answer(
            f"📞 {app.phone}\n📧 {app.email}",
            show_alert=True
        )
    except VolunteerApplication.DoesNotExist:
        await callback.answer("Заявка не найдена", show_alert=True)

@router.callback_query(F.data.startswith("details_"))
async def show_details(callback: CallbackQuery):
    """Показать детали заявки"""
    volunteer_id = int(callback.data.split("_")[1])
    
    try:
        app = VolunteerApplication.objects.get(id=volunteer_id)
        text = format_volunteer_application(app, detailed=True)
        await callback.message.edit_text(text, parse_mode="HTML", reply_markup=get_volunteer_actions(app.id))
    except VolunteerApplication.DoesNotExist:
        await callback.answer("Заявка не найдена", show_alert=True)

@router.callback_query(F.data == "notifications_on")
async def enable_notifications(callback: CallbackQuery):
    """Включить уведомления"""
    user = TelegramUser.objects.get(telegram_id=callback.from_user.id)
    user.notifications_enabled = True
    user.save()
    
    await callback.answer("✅ Уведомления включены!", show_alert=True)
    await callback.message.edit_text(
        "🔔 <b>Настройки уведомлений</b>\n\n"
        "Текущий статус: включены ✅",
        parse_mode="HTML",
        reply_markup=get_notification_settings()
    )

@router.callback_query(F.data == "notifications_off")
async def disable_notifications(callback: CallbackQuery):
    """Выключить уведомления"""
    user = TelegramUser.objects.get(telegram_id=callback.from_user.id)
    user.notifications_enabled = False
    user.save()
    
    await callback.answer("🔕 Уведомления выключены!", show_alert=True)
    await callback.message.edit_text(
        "🔔 <b>Настройки уведомлений</b>\n\n"
        "Текущий статус: выключены ❌",
        parse_mode="HTML",
        reply_markup=get_notification_settings()
    )

def format_volunteer_application(app, detailed=False):
    """Форматировать заявку волонтера"""
    interests_map = {
        'education': 'Освітні заходи',
        'emergency': 'Швидке реагування',
        'search': 'Пошук людей',
        'psychology': 'Психологічна підтримка',
        'children': 'Допомога дітям',
        'elderly': 'Допомога літнім людям'
    }
    
    interests_list = []
    if app.interests:
        for interest in app.interests.split(','):
            interests_list.append(interests_map.get(interest.strip(), interest))
    
    text = (
        f"👤 <b>{app.first_name} {app.last_name}</b>\n"
        f"📅 Дата рождения: {app.birth_date.strftime('%d.%m.%Y') if app.birth_date else 'Не указано'}\n"
        f"📞 Телефон: {app.phone}\n"
        f"📧 Email: {app.email}\n"
        f"🕒 Подано: {app.submitted_at.strftime('%d.%m.%Y %H:%M')}\n"
    )
    
    if interests_list:
        text += f"\n<b>Интересы:</b>\n" + "\n".join([f"• {i}" for i in interests_list])
    
    if detailed and app.motivation:
        text += f"\n\n<b>Мотивация:</b>\n{app.motivation[:200]}..."
    
    return text
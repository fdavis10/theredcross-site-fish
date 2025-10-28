import asyncio
import logging
from aiogram import Bot
from aiogram.enums import ParseMode
from bot.config import BOT_TOKEN
from bot.database.models import TelegramUser
from bot.keyboards.admin_kb import get_volunteer_actions

logger = logging.getLogger(__name__)

class TelegramNotifier:
    """Класс для отправки уведомлений в Telegram"""
    
    def __init__(self):
        self.bot = Bot(token=BOT_TOKEN, parse_mode=ParseMode.HTML)
    
    async def send_volunteer_notification(self, volunteer_app):
        """Отправить уведомление о новой заявке волонтера"""
        try:
            # Получаем всех админов с включенными уведомлениями
            admins = TelegramUser.get_admins_with_notifications()
            
            if not admins:
                logger.warning("No admins with enabled notifications found")
                return
            
            # Форматируем сообщение
            message = self._format_volunteer_message(volunteer_app)
            
            # Отправляем каждому админу
            for admin in admins:
                try:
                    await self.bot.send_message(
                        chat_id=admin.telegram_id,
                        text=message,
                        reply_markup=get_volunteer_actions(volunteer_app.id)
                    )
                    logger.info(f"Notification sent to admin {admin.telegram_id}")
                except Exception as e:
                    logger.error(f"Failed to send notification to admin {admin.telegram_id}: {e}")
        
        except Exception as e:
            logger.error(f"Error sending volunteer notification: {e}")
    
    def _format_volunteer_message(self, app):
        """Форматировать сообщение о волонтере"""
        interests_map = {
            'education': '🎓 Освітні заходи',
            'emergency': '⚡ Швидке реагування',
            'search': '🔍 Пошук людей',
            'psychology': '❤️ Психологічна підтримка',
            'children': '👶 Допомога дітям',
            'elderly': '👴 Допомога літнім людям'
        }
        
        interests_list = []
        if app.interests:
            for interest in app.interests.split(','):
                interest = interest.strip()
                interests_list.append(interests_map.get(interest, interest))
        
        message = (
            "🎉 <b>Нова заявка волонтера!</b>\n\n"
            f"👤 <b>ПІБ:</b> {app.first_name} {app.last_name}\n"
            f"📅 <b>Дата народження:</b> {app.birth_date.strftime('%d.%m.%Y') if app.birth_date else 'Не вказано'}\n"
            f"📞 <b>Телефон:</b> {app.phone}\n"
            f"📧 <b>Email:</b> {app.email}\n"
            f"🕒 <b>Дата подачі:</b> {app.submitted_at.strftime('%d.%m.%Y %H:%M')}\n"
        )
        
        if interests_list:
            message += f"\n<b>Цікаві напрямки:</b>\n"
            message += "\n".join([f"• {i}" for i in interests_list])
        
        if app.motivation:
            motivation_preview = app.motivation[:150]
            if len(app.motivation) > 150:
                motivation_preview += "..."
            message += f"\n\n<b>Мотивація:</b>\n<i>{motivation_preview}</i>"
        
        return message
    
    async def close(self):
        """Закрыть сессию бота"""
        await self.bot.session.close()

# Глобальный экземпляр notifier
_notifier = None

def get_notifier():
    """Получить или создать экземпляр notifier"""
    global _notifier
    if _notifier is None:
        _notifier = TelegramNotifier()
    return _notifier

def send_volunteer_notification_sync(volunteer_app):
    """Синхронная обертка для отправки уведомления"""
    try:
        notifier = get_notifier()
        
        # Создаем или получаем event loop
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        # Запускаем асинхронную функцию
        if loop.is_running():
            # Если loop уже запущен, создаем задачу
            asyncio.create_task(notifier.send_volunteer_notification(volunteer_app))
        else:
            # Если loop не запущен, запускаем синхронно
            loop.run_until_complete(notifier.send_volunteer_notification(volunteer_app))
        
        logger.info(f"Volunteer notification queued for {volunteer_app.email}")
    except Exception as e:
        logger.error(f"Error in send_volunteer_notification_sync: {e}")
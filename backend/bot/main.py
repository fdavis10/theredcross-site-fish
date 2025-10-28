import asyncio
import logging
import sys
import os

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode

from bot.config import BOT_TOKEN, ADMIN_IDS
from bot.handlers import admin
from bot.database.models import TelegramUser

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

# Глобальный экземпляр бота (для использования из Django)
bot_instance = None

async def on_startup(bot: Bot):
    """Действия при запуске бота"""
    logger.info("Bot started successfully!")
    
    # Создаем админов в базе если их нет
    for admin_id in ADMIN_IDS:
        TelegramUser.get_or_create_user(
            telegram_id=admin_id,
            is_admin=True
        )
        logger.info(f"Admin with ID {admin_id} added to database")
    
    # Уведомляем админов о запуске
    for admin_id in ADMIN_IDS:
        try:
            await bot.send_message(
                admin_id,
                "🤖 Бот запущен и готов к работе!"
            )
        except Exception as e:
            logger.error(f"Failed to notify admin {admin_id}: {e}")

async def on_shutdown(bot: Bot):
    """Действия при остановке бота"""
    logger.info("Bot stopped")

async def main():
    """Главная функция запуска бота"""
    global bot_instance
    
    # Инициализация бота
    bot = Bot(
        token=BOT_TOKEN,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML)
    )
    bot_instance = bot
    
    # Инициализация диспетчера
    dp = Dispatcher()
    
    # Регистрация роутеров
    dp.include_router(admin.router)
    
    # Регистрация хуков
    dp.startup.register(on_startup)
    dp.shutdown.register(on_shutdown)
    
    # Удаление вебхука (на всякий случай)
    await bot.delete_webhook(drop_pending_updates=True)
    
    # Запуск polling
    logger.info("Starting bot polling...")
    await dp.start_polling(bot)

def get_bot():
    """Получить экземпляр бота (для использования из Django)"""
    return bot_instance

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Bot stopped by user")
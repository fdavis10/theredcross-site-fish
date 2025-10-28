import os
from dotenv import load_dotenv

load_dotenv()

# Токен бота от @BotFather
BOT_TOKEN = '8234536775:AAG-e3EiT4X9gtL_VXigevEva2FTWuZT150'

# ID администраторов (получить можно через @userinfobot)
ADMIN_IDS = [
    int(admin_id) for admin_id in os.getenv('ADMIN_IDS', '').split(',') if admin_id
]

# Настройки Django
DJANGO_SETTINGS_MODULE = 'backend.settings'
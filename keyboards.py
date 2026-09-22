"""
Клавиатуры для бота
"""
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.utils.keyboard import ReplyKeyboardBuilder, InlineKeyboardBuilder


def get_main_menu_keyboard(mini_app_url: str = None) -> ReplyKeyboardMarkup:
    """Главное меню бота - упрощенное (только 2 кнопки)"""
    from aiogram.types import WebAppInfo
    builder = ReplyKeyboardBuilder()
    
    # Кнопка открытия Mini App
    if mini_app_url:
        builder.row(
            KeyboardButton(
                text="🚗 Открыть гараж",
                web_app=WebAppInfo(url=mini_app_url)
            )
        )
    
    # Кнопка AI диагностики (единственная функция бота)
    builder.row(
        KeyboardButton(text="🔍 AI Диагностика поломки")
    )
    
    return builder.as_markup(resize_keyboard=True)


def get_garage_menu_keyboard() -> InlineKeyboardMarkup:
    """Меню управления гаражом"""
    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="⚡ Быстрое добавление", callback_data="quick_add_car"))
    builder.row(InlineKeyboardButton(text="➕ Подробное добавление", callback_data="add_car"))
    builder.row(InlineKeyboardButton(text="📋 Мои автомобили", callback_data="list_cars"))
    builder.row(InlineKeyboardButton(text="◀️ Главное меню", callback_data="main_menu"))
    return builder.as_markup()


def get_car_list_keyboard(cars: list) -> InlineKeyboardMarkup:
    """Список автомобилей"""
    builder = InlineKeyboardBuilder()
    
    for car in cars:
        car_name = f"{car.brand} {car.model} ({car.year or 'н/д'})"
        builder.row(InlineKeyboardButton(
            text=car_name,
            callback_data=f"view_car_{car.id}"
        ))
    
    builder.row(InlineKeyboardButton(text="➕ Добавить автомобиль", callback_data="add_car"))
    builder.row(InlineKeyboardButton(text="◀️ Назад", callback_data="garage"))
    return builder.as_markup()


def get_car_select_keyboard(cars: list, action: str = "select") -> InlineKeyboardMarkup:
    """Список автомобилей для выбора (для диагностики, ТО и т.д.)"""
    builder = InlineKeyboardBuilder()
    
    for car in cars:
        car_name = f"{car.brand} {car.model} ({car.year or 'н/д'})"
        builder.row(InlineKeyboardButton(
            text=car_name,
            callback_data=f"{action}_car_{car.id}"
        ))
    
    builder.row(InlineKeyboardButton(text="◀️ Отмена", callback_data="main_menu"))
    return builder.as_markup()


def get_car_actions_keyboard(car_id: int) -> InlineKeyboardMarkup:
    """Действия с автомобилем"""
    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="✏️ Редактировать", callback_data=f"edit_car_{car_id}"))
    builder.row(InlineKeyboardButton(text="📊 История ТО", callback_data=f"car_maintenance_{car_id}"))
    builder.row(InlineKeyboardButton(text="🔧 Добавить ТО", callback_data=f"add_maintenance_{car_id}"))
    builder.row(InlineKeyboardButton(text="🗑 Удалить", callback_data=f"delete_car_{car_id}"))
    builder.row(InlineKeyboardButton(text="◀️ К списку авто", callback_data="list_cars"))
    return builder.as_markup()


def get_edit_car_fields_keyboard(car_id: int) -> InlineKeyboardMarkup:
    """Выбор поля для редактирования"""
    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="🏷 Марка", callback_data=f"edit_field_brand_{car_id}"))
    builder.row(InlineKeyboardButton(text="🚗 Модель", callback_data=f"edit_field_model_{car_id}"))
    builder.row(InlineKeyboardButton(text="📅 Год", callback_data=f"edit_field_year_{car_id}"))
    builder.row(InlineKeyboardButton(text="🔢 Госномер", callback_data=f"edit_field_plate_{car_id}"))
    builder.row(InlineKeyboardButton(text="⚙️ Тип двигателя", callback_data=f"edit_field_engine_{car_id}"))
    builder.row(InlineKeyboardButton(text="📊 Объем двигателя", callback_data=f"edit_field_volume_{car_id}"))
    builder.row(InlineKeyboardButton(text="📏 Пробег", callback_data=f"edit_field_mileage_{car_id}"))
    builder.row(InlineKeyboardButton(text="◀️ Назад", callback_data=f"view_car_{car_id}"))
    return builder.as_markup()


def get_maintenance_menu_keyboard() -> InlineKeyboardMarkup:
    """Меню учета ТО"""
    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="➕ Добавить запись ТО", callback_data="add_maintenance"))
    builder.row(InlineKeyboardButton(text="📋 История ТО", callback_data="maintenance_history"))
    builder.row(InlineKeyboardButton(text="⏰ Напоминания", callback_data="maintenance_reminders"))
    builder.row(InlineKeyboardButton(text="◀️ Главное меню", callback_data="main_menu"))
    return builder.as_markup()


def get_service_type_keyboard() -> InlineKeyboardMarkup:
    """Выбор типа обслуживания"""
    builder = InlineKeyboardBuilder()
    services = [
        ("Плановое ТО", "service_to"),
        ("Замена масла", "service_oil"),
        ("Замена фильтров", "service_filters"),
        ("Тормозная система", "service_brakes"),
        ("Шины и диски", "service_tires"),
        ("Другое", "service_other")
    ]
    
    for text, callback in services:
        builder.row(InlineKeyboardButton(text=text, callback_data=callback))
    
    builder.row(InlineKeyboardButton(text="◀️ Отмена", callback_data="maintenance"))
    return builder.as_markup()


def get_expenses_menu_keyboard() -> InlineKeyboardMarkup:
    """Меню расходов"""
    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="➕ Добавить расход", callback_data="add_expense"))
    builder.row(InlineKeyboardButton(text="📊 Статистика", callback_data="expenses_stats"))
    builder.row(InlineKeyboardButton(text="📅 За месяц", callback_data="expenses_month"))
    builder.row(InlineKeyboardButton(text="🌤 За сезон", callback_data="expenses_season"))
    builder.row(InlineKeyboardButton(text="📥 Экспорт отчета", callback_data="export_expenses"))
    builder.row(InlineKeyboardButton(text="◀️ Главное меню", callback_data="main_menu"))
    return builder.as_markup()


def get_expense_category_keyboard() -> InlineKeyboardMarkup:
    """Выбор категории расхода"""
    builder = InlineKeyboardBuilder()
    categories = [
        ("⛽️ Топливо", "expense_fuel"),
        ("🔧 ТО и ремонт", "expense_maintenance"),
        ("🛞 Запчасти", "expense_parts"),
        ("🚗 Мойка", "expense_wash"),
        ("🅿️ Парковка", "expense_parking"),
        ("🚦 Штрафы", "expense_fines"),
        ("📝 Страховка", "expense_insurance"),
        ("💳 Другое", "expense_other")
    ]
    
    for text, callback in categories:
        builder.row(InlineKeyboardButton(text=text, callback_data=callback))
    
    builder.row(InlineKeyboardButton(text="◀️ Отмена", callback_data="expenses"))
    return builder.as_markup()


def get_diagnostics_menu_keyboard() -> InlineKeyboardMarkup:
    """Меню диагностики"""
    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="📝 Описать проблему текстом", callback_data="diag_text"))
    builder.row(InlineKeyboardButton(text="📋 Мои поломки", callback_data="my_issues"))
    builder.row(InlineKeyboardButton(text="◀️ Главное меню", callback_data="main_menu"))
    return builder.as_markup()


def get_issue_actions_keyboard(issue_id: int) -> InlineKeyboardMarkup:
    """Действия с поломкой"""
    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="🔧 Инструкция по ремонту", callback_data=f"repair_inst_{issue_id}"))
    builder.row(InlineKeyboardButton(text="✅ Отметить решенной", callback_data=f"resolve_issue_{issue_id}"))
    builder.row(InlineKeyboardButton(text="◀️ Назад", callback_data="my_issues"))
    return builder.as_markup()


def get_confirmation_keyboard(confirm_action: str) -> InlineKeyboardMarkup:
    """Клавиатура подтверждения действия"""
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(text="✅ Да", callback_data=f"confirm_{confirm_action}"),
        InlineKeyboardButton(text="❌ Нет", callback_data=f"cancel_{confirm_action}")
    )
    return builder.as_markup()


def get_cancel_keyboard() -> ReplyKeyboardMarkup:
    """Кнопка отмены"""
    builder = ReplyKeyboardBuilder()
    builder.row(KeyboardButton(text="❌ Отменить"))
    return builder.as_markup(resize_keyboard=True)

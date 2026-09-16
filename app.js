// Telegram Web App API
let tg = window.Telegram.WebApp;
tg.expand();

// Применяем тему Telegram
document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999');
document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#2481cc');
document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#2481cc');
document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#f4f4f5');

// Данные автомобиля из Telegram
let currentCar = null;

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadCarData();
    loadLocalData();
});

// Загрузка данных автомобиля
function loadCarData() {
    // Получаем данные из initData Telegram
    try {
        const initData = tg.initDataUnsafe;
        if (initData && initData.start_param) {
            // Парсим данные автомобиля
            const carData = JSON.parse(atob(initData.start_param));
            currentCar = carData;
            updateCarInfo(carData);
        } else {
            // Демо-данные для тестирования
            currentCar = {
                brand: 'Toyota',
                model: 'Camry',
                year: 2020,
                engine_type: 'Бензин',
                engine_volume: '2.5',
                current_mileage: 45000
            };
            updateCarInfo(currentCar);
        }
    } catch (e) {
        console.log('Используются демо-данные');
        currentCar = {
            brand: 'Toyota',
            model: 'Camry',
            year: 2020,
            engine_type: 'Бензин',
            engine_volume: '2.5',
            current_mileage: 45000
        };
        updateCarInfo(currentCar);
    }
}

// Обновление информации об автомобиле
function updateCarInfo(car) {
    document.getElementById('car-name').textContent = `${car.brand} ${car.model} (${car.year})`;
    document.getElementById('car-specs').textContent = `${car.engine_type}, ${car.engine_volume}л • ${car.current_mileage.toLocaleString()} км`;
}

// Переключение экранов
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    
    // Вибрация при переходе
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

// Выбор автомобиля
function selectCar() {
    tg.showAlert('Выберите автомобиль в боте через команду /garage');
}

// ========== КАЛЬКУЛЯТОР ТОПЛИВА ==========
function calculateFuel() {
    const distance = parseFloat(document.getElementById('fuel-distance').value);
    const consumption = parseFloat(document.getElementById('fuel-consumption').value);
    const price = parseFloat(document.getElementById('fuel-price').value);

    if (!distance || !consumption || !price) {
        tg.showAlert('Заполните все поля!');
        return;
    }

    const fuelNeeded = (distance * consumption / 100).toFixed(2);
    const totalCost = (fuelNeeded * price).toFixed(2);
    const costPerKm = (totalCost / distance).toFixed(2);

    document.getElementById('fuel-needed').textContent = `${fuelNeeded} л`;
    document.getElementById('fuel-cost').textContent = `${totalCost} ₽`;
    document.getElementById('fuel-cost-per-km').textContent = `${costPerKm} ₽/км`;

    document.getElementById('fuel-result').style.display = 'block';

    // Сохраняем расчет
    saveCalculation('fuel', { distance, consumption, price, fuelNeeded, totalCost });

    if (tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }
}

// ========== КАЛЬКУЛЯТОР ШИН ==========
function calculateTires() {
    const tire1Width = parseFloat(document.getElementById('tire1-width').value);
    const tire1Profile = parseFloat(document.getElementById('tire1-profile').value);
    const tire1Diameter = parseFloat(document.getElementById('tire1-diameter').value);

    const tire2Width = parseFloat(document.getElementById('tire2-width').value);
    const tire2Profile = parseFloat(document.getElementById('tire2-profile').value);
    const tire2Diameter = parseFloat(document.getElementById('tire2-diameter').value);

    if (!tire1Width || !tire1Profile || !tire1Diameter || !tire2Width || !tire2Profile || !tire2Diameter) {
        tg.showAlert('Заполните все размеры шин!');
        return;
    }

    // Расчет диаметра шины: Диаметр = (Ширина × Профиль / 100 × 2) + (Диск × 25.4)
    const tire1Height = (tire1Width * tire1Profile / 100).toFixed(1);
    const tire1TotalDiameter = (tire1Width * tire1Profile / 100 * 2 + tire1Diameter * 25.4).toFixed(1);

    const tire2Height = (tire2Width * tire2Profile / 100).toFixed(1);
    const tire2TotalDiameter = (tire2Width * tire2Profile / 100 * 2 + tire2Diameter * 25.4).toFixed(1);

    const diameterDiff = (tire2TotalDiameter - tire1TotalDiameter).toFixed(1);
    const percentDiff = ((diameterDiff / tire1TotalDiameter) * 100).toFixed(2);
    const speedDiff = Math.abs(parseFloat(percentDiff)).toFixed(1);

    document.getElementById('tire1-total-diameter').textContent = `${tire1TotalDiameter} мм`;
    document.getElementById('tire1-height').textContent = `${tire1Height} мм`;
    document.getElementById('tire2-total-diameter').textContent = `${tire2TotalDiameter} мм`;
    document.getElementById('tire2-height').textContent = `${tire2Height} мм`;
    document.getElementById('tire-diff').textContent = `${diameterDiff} мм (${percentDiff}%)`;
    document.getElementById('speed-diff').textContent = `${speedDiff}%`;

    // Рекомендация
    let recommendation = '';
    const absDiff = Math.abs(parseFloat(percentDiff));
    
    if (absDiff < 1.5) {
        recommendation = '✅ Размеры совместимы! Разница в допустимых пределах.';
    } else if (absDiff < 3) {
        recommendation = '⚠️ Размеры приемлемы, но возможны небольшие погрешности спидометра.';
    } else {
        recommendation = '❌ Размеры не рекомендуются! Большая разница может повлиять на управляемость.';
    }

    document.getElementById('tire-recommendation').textContent = recommendation;
    document.getElementById('tire-result').style.display = 'block';

    if (tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }
}

// ========== ПЕРИОД СТАТИСТИКИ ==========
function setPeriod(period) {
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Здесь можно загрузить данные за выбранный период
    tg.showAlert(`Статистика за ${period === 'week' ? 'неделю' : period === 'month' ? 'месяц' : 'год'} загружена`);
}

// ========== НАПОМИНАНИЯ ==========
function addReminder() {
    tg.showPopup({
        title: 'Новое напоминание',
        message: 'Используйте команду /maintenance в боте для добавления напоминаний о ТО',
        buttons: [
            {id: 'ok', type: 'ok'}
        ]
    });
}

// ========== ДОКУМЕНТЫ ==========
function uploadDoc(docType) {
    const docNames = {
        'sts': 'СТС',
        'license': 'Водительское удостоверение',
        'insurance': 'ОСАГО',
        'kasko': 'КАСКО',
        'service': 'Сервисная книжка',
        'pts': 'ПТС'
    };

    tg.showPopup({
        title: `Загрузить ${docNames[docType]}`,
        message: 'Отправьте фото документа в чат с ботом с командой /docs',
        buttons: [
            {id: 'ok', type: 'ok'}
        ]
    });
}

// ========== ЛОКАЛЬНОЕ ХРАНИЛИЩЕ ==========
function saveCalculation(type, data) {
    const calculations = JSON.parse(localStorage.getItem('calculations') || '[]');
    calculations.push({
        type,
        data,
        timestamp: Date.now()
    });
    
    // Храним последние 50 расчетов
    if (calculations.length > 50) {
        calculations.shift();
    }
    
    localStorage.setItem('calculations', JSON.stringify(calculations));
}

function loadLocalData() {
    // Загрузка сохраненных расчетов
    const calculations = JSON.parse(localStorage.getItem('calculations') || '[]');
    
    // Можно использовать для восстановления последних значений
    if (calculations.length > 0) {
        const lastFuel = calculations.filter(c => c.type === 'fuel').pop();
        if (lastFuel) {
            document.getElementById('fuel-distance').value = lastFuel.data.distance;
            document.getElementById('fuel-consumption').value = lastFuel.data.consumption;
            document.getElementById('fuel-price').value = lastFuel.data.price;
        }
    }
}

// ========== ОТПРАВКА ДАННЫХ БОТУ ==========
function sendDataToBot(action, data) {
    tg.sendData(JSON.stringify({
        action,
        data,
        car: currentCar
    }));
}

// Обработка кнопки закрытия
tg.onEvent('mainButtonClicked', () => {
    tg.close();
});

// Готовность Mini App
tg.ready();

console.log('🚗 Авто Ассистент Mini App загружен');
console.log('Версия Telegram Web App:', tg.version);
console.log('Платформа:', tg.platform);

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

// Данные пользователя и гаража
let userData = null;
let garageData = null;
let currentCar = null;

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadGarageData();
    loadLocalData();
});

// 🔄 СИНХРОНИЗАЦИЯ: Загрузка данных гаража из Telegram
function loadGarageData() {
    try {
        const initData = tg.initDataUnsafe;
        
        // Получаем telegram_id пользователя
        if (initData && initData.user) {
            userData = {
                id: initData.user.id,
                first_name: initData.user.first_name,
                username: initData.user.username
            };
            
            console.log('👤 Пользователь:', userData);
        }
        
        // Пытаемся загрузить данные гаража из start_param или localStorage
        let carsFromParam = null;
        
        if (initData && initData.start_param) {
            try {
                carsFromParam = JSON.parse(atob(initData.start_param));
                console.log('📦 Данные из start_param:', carsFromParam);
            } catch (e) {
                console.log('⚠️ Не удалось распарсить start_param');
            }
        }
        
        // Загружаем из localStorage или используем данные из параметра
        const cachedGarage = localStorage.getItem('garageData');
        if (cachedGarage) {
            garageData = JSON.parse(cachedGarage);
            console.log('💾 Данные из localStorage:', garageData);
        } else if (carsFromParam) {
            garageData = carsFromParam;
            localStorage.setItem('garageData', JSON.stringify(garageData));
        }
        
        // Если есть данные - отображаем
        if (garageData && garageData.cars && garageData.cars.length > 0) {
            updateGarageDisplay(garageData.cars);
            currentCar = garageData.cars[0]; // Первый автомобиль по умолчанию
        } else {
            // Демо-данные для тестирования
            loadDemoData();
        }
        
    } catch (e) {
        console.error('❌ Ошибка загрузки данных гаража:', e);
        loadDemoData();
    }
}

// Демо-данные (если нет реальных)
function loadDemoData() {
    console.log('📝 Загрузка демо-данных');
    garageData = {
        user: userData || { first_name: 'Пользователь' },
        cars: [
            {
                id: 1,
                brand: 'Toyota',
                model: 'Camry',
                year: 2020,
                engine_type: 'Бензин',
                engine_volume: 2.5,
                current_mileage: 45000,
                license_plate: 'А123БВ777'
            }
        ]
    };
    currentCar = garageData.cars[0];
    updateGarageDisplay(garageData.cars);
}

// 🔄 Обновление отображения гаража
function updateGarageDisplay(cars) {
    const carInfo = document.getElementById('car-info');
    const emptyState = document.getElementById('empty-garage');
    
    if (!cars || cars.length === 0) {
        // Показываем пустое состояние
        if (carInfo) carInfo.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        console.log('📭 Гараж пуст - показываем заглушку');
        return;
    }
    
    // Скрываем пустое состояние, показываем авто
    if (carInfo) carInfo.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';
    
    // Показываем первый автомобиль
    const car = cars[0];
    updateCarInfo(car);
    
    // Можно добавить список всех авто позже
    console.log(`🚗 Загружено автомобилей: ${cars.length}`);
}

// Обновление информации об автомобиле
function updateCarInfo(car) {
    if (!car) return;
    
    const carName = `${car.brand} ${car.model}`;
    const carYear = car.year ? `(${car.year})` : '';
    const engineInfo = car.engine_type || '';
    const volumeInfo = car.engine_volume ? `${car.engine_volume}л` : '';
    const mileageInfo = car.current_mileage ? `${car.current_mileage.toLocaleString()} км` : '0 км';
    
    document.getElementById('car-name').textContent = `${carName} ${carYear}`;
    
    let specsText = '';
    if (engineInfo) specsText += engineInfo;
    if (volumeInfo) specsText += (specsText ? ', ' : '') + volumeInfo;
    if (mileageInfo) specsText += (specsText ? ' • ' : '') + mileageInfo;
    
    document.getElementById('car-specs').textContent = specsText || 'Информация не указана';
}

// 🔄 Синхронизация: запросить обновление данных гаража
function requestGarageSync() {
    console.log('🔄 Запрос синхронизации гаража...');
    sendDataToBot('request_garage_sync', {
        user_id: userData ? userData.id : null
    });
}

// 🔄 Обработка обновленных данных гаража
function handleGarageUpdate(newGarageData) {
    console.log('✅ Получены обновленные данные гаража:', newGarageData);
    
    garageData = newGarageData;
    localStorage.setItem('garageData', JSON.stringify(garageData));
    
    if (garageData.cars && garageData.cars.length > 0) {
        updateGarageDisplay(garageData.cars);
        
        tg.showPopup({
            title: '✅ Синхронизировано!',
            message: `Загружено автомобилей: ${garageData.cars.length}`,
            buttons: [{id: 'ok', type: 'ok'}]
        });
    }
}

// Переключение экранов
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    
    // Обновляем данные при переходе на экран
    if (screenId === 'reminders-screen') {
        requestRemindersFromBot();
    }
    
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

    // Сохраняем расчет локально
    saveCalculation('fuel', { distance, consumption, price, fuelNeeded, totalCost });
    
    // 🔄 СИНХРОНИЗАЦИЯ: Предлагаем сохранить расход
    showSyncButton('fuel', { distance, totalCost });

    if (tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }
}

// Показать кнопку синхронизации
function showSyncButton(type, data) {
    const resultDiv = document.getElementById('fuel-result');
    
    // Удаляем старую кнопку если есть
    const oldBtn = resultDiv.querySelector('.sync-btn');
    if (oldBtn) oldBtn.remove();
    
    // Создаем новую кнопку
    const syncBtn = document.createElement('button');
    syncBtn.className = 'btn-primary sync-btn';
    syncBtn.textContent = '💾 Сохранить в расходы';
    syncBtn.onclick = () => saveFuelExpense(data);
    
    resultDiv.appendChild(syncBtn);
}

// Сохранить расход на топливо
function saveFuelExpense(data) {
    sendDataToBot('save_fuel_calculation', {
        distance: data.distance,
        totalCost: data.totalCost,
        car_id: currentCar ? currentCar.id : null
    });
    
    tg.showPopup({
        title: '✅ Готово!',
        message: 'Расход сохранен в статистику',
        buttons: [{id: 'ok', type: 'ok'}]
    });
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
    const payload = {
        action: action,
        data: data,
        car: currentCar,
        timestamp: Date.now()
    };
    
    console.log('📤 Отправка данных боту:', payload);
    
    // Отправляем данные через Telegram Web App API
    tg.sendData(JSON.stringify(payload));
}

// Запросить напоминания о ТО
function requestRemindersFromBot() {
    sendDataToBot('request_reminders', {});
}

// Обновить пробег
function updateMileage(carId, newMileage) {
    sendDataToBot('update_mileage', {
        car_id: carId,
        mileage: newMileage
    });
}

// Обработка кнопки закрытия
tg.onEvent('mainButtonClicked', () => {
    tg.close();
});

// Готовность Mini App
tg.ready();

console.log('🚗 Мой гараж загружен');
console.log('Версия Telegram Web App:', tg.version);
console.log('Платформа:', tg.platform);
console.log('Данные пользователя:', userData);
console.log('Данные гаража:', garageData);


// ============================================
// VIN ДЕКОДЕР - ФУНКЦИИ
// ============================================

// Обработка ввода VIN (счетчик символов + валидация)
function onVINInput(value) {
    const vin = value.toUpperCase();
    const counter = document.getElementById('vin-counter');
    const decodeBtn = document.getElementById('decode-btn');
    
    // Обновляем счетчик
    counter.textContent = `${vin.length} / 17 символов`;
    
    // Цвет счетчика
    if (vin.length === 17) {
        counter.style.color = '#10b981'; // Зеленый
        decodeBtn.disabled = false;
    } else if (vin.length > 0) {
        counter.style.color = '#f59e0b'; // Желтый
        decodeBtn.disabled = true;
    } else {
        counter.style.color = '#888'; // Серый
        decodeBtn.disabled = true;
    }
    
    // Автоматическая валидация символов (удаляем I, O, Q)
    const sanitized = vin.replace(/[IOQ]/g, '');
    if (sanitized !== vin) {
        document.getElementById('vin-input').value = sanitized;
        tg.showAlert('Символы I, O, Q не используются в VIN номерах');
    }
}

// Декодирование VIN
function decodeVINAction() {
    const vinInput = document.getElementById('vin-input').value.trim().toUpperCase();
    
    if (!vinInput) {
        tg.showAlert('Введите VIN номер');
        return;
    }
    
    // Скрываем предыдущие результаты
    document.getElementById('vin-result').style.display = 'none';
    document.getElementById('vin-error').style.display = 'none';
    document.getElementById('vin-warning').style.display = 'none';
    
    // Декодируем VIN
    const result = window.VINDecoder.decodeVIN(vinInput);
    
    if (!result.success) {
        // Ошибка валидации
        document.getElementById('error-message').textContent = result.error;
        document.getElementById('vin-error').style.display = 'block';
        return;
    }
    
    if (!result.found) {
        // Производитель не найден
        document.getElementById('warning-message').textContent = 
            result.warning + `\n\nGod выпуска: ${result.year || 'не определён'}`;
        document.getElementById('vin-warning').style.display = 'block';
        
        // Предзаполняем год
        if (result.year) {
            // Сохраняем для дальнейшего использования
            window.decodedVINData = {
                vin: result.vin,
                year: result.year,
                wmi: result.wmi
            };
        }
        return;
    }
    
    // Успешное декодирование
    displayVINResult(result);
}

// Отображение результатов декодирования
function displayVINResult(result) {
    // Заполняем данные
    document.getElementById('result-vin').textContent = result.vin;
    document.getElementById('result-brand').textContent = result.brand || '-';
    document.getElementById('result-year').textContent = result.year || 'Не определён';
    document.getElementById('result-country').textContent = result.country || '-';
    document.getElementById('result-wmi').textContent = result.wmi;
    
    // Возможные модели
    const modelsSection = document.getElementById('models-section');
    const modelsList = document.getElementById('models-list');
    
    if (result.models && result.models.length > 0) {
        modelsSection.style.display = 'block';
        modelsList.innerHTML = '';
        
        result.models.forEach(model => {
            const modelBtn = document.createElement('button');
            modelBtn.className = 'model-btn';
            modelBtn.textContent = model;
            modelBtn.onclick = () => selectModel(model);
            modelsList.appendChild(modelBtn);
        });
        
        // Заполняем datalist для автокомплита
        const datalist = document.getElementById('model-suggestions');
        datalist.innerHTML = '';
        result.models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            datalist.appendChild(option);
        });
    } else {
        modelsSection.style.display = 'none';
    }
    
    // Сохраняем данные для дальнейшего использования
    window.decodedVINData = result;
    
    // Показываем результат
    document.getElementById('vin-result').style.display = 'block';
    
    // Скроллим к результату
    document.getElementById('vin-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Выбор модели из списка
function selectModel(model) {
    document.getElementById('model-input').value = model;
    
    // Визуальная обратная связь
    const buttons = document.querySelectorAll('.model-btn');
    buttons.forEach(btn => {
        if (btn.textContent === model) {
            btn.style.backgroundColor = '#10b981';
            btn.style.color = '#fff';
        } else {
            btn.style.backgroundColor = '';
            btn.style.color = '';
        }
    });
}

// Сохранение автомобиля из VIN
function saveCarFromVIN() {
    const decodedData = window.decodedVINData;
    
    if (!decodedData) {
        tg.showAlert('Сначала декодируйте VIN');
        return;
    }
    
    const model = document.getElementById('model-input').value.trim();
    const mileage = document.getElementById('mileage-input').value.trim();
    
    if (!model) {
        tg.showAlert('Введите модель автомобиля');
        return;
    }
    
    if (!mileage || parseInt(mileage) < 0) {
        tg.showAlert('Введите корректный пробег');
        return;
    }
    
    // Формируем данные автомобиля
    const carData = {
        vin: decodedData.vin,
        brand: decodedData.brand,
        model: model,
        year: decodedData.year,
        current_mileage: parseInt(mileage),
        country: decodedData.country,
        wmi: decodedData.wmi
    };
    
    console.log('💾 Сохранение авто из VIN:', carData);
    
    // Отправляем данные в бот
    sendCarToBot(carData);
}

// Сохранение автомобиля вручную (когда WMI не найден)
function saveManualCar() {
    const decodedData = window.decodedVINData;
    const brand = document.getElementById('manual-brand').value.trim();
    const model = document.getElementById('manual-model').value.trim();
    const mileage = document.getElementById('manual-mileage').value.trim();
    
    if (!brand) {
        tg.showAlert('Введите марку автомобиля');
        return;
    }
    
    if (!model) {
        tg.showAlert('Введите модель автомобиля');
        return;
    }
    
    if (!mileage || parseInt(mileage) < 0) {
        tg.showAlert('Введите корректный пробег');
        return;
    }
    
    // Формируем данные
    const carData = {
        vin: decodedData ? decodedData.vin : document.getElementById('vin-input').value.trim().toUpperCase(),
        brand: brand,
        model: model,
        year: decodedData ? decodedData.year : null,
        current_mileage: parseInt(mileage),
        wmi: decodedData ? decodedData.wmi : null
    };
    
    console.log('💾 Сохранение авто вручную:', carData);
    
    // Отправляем данные в бот
    sendCarToBot(carData);
}

// Отправка данных автомобиля в бот
function sendCarToBot(carData) {
    // Показываем индикатор загрузки
    tg.MainButton.setText('💾 Сохранение...');
    tg.MainButton.show();
    tg.MainButton.disable();
    
    // Отправляем данные через WebApp API
    tg.sendData(JSON.stringify({
        action: 'add_car_from_vin',
        car: carData
    }));
    
    // Сохраняем в localStorage
    if (!garageData) {
        garageData = { cars: [] };
    }
    
    if (!garageData.cars) {
        garageData.cars = [];
    }
    
    // Добавляем новый автомобиль
    carData.id = Date.now(); // Временный ID
    garageData.cars.push(carData);
    localStorage.setItem('garageData', JSON.stringify(garageData));
    
    // Обновляем отображение
    updateGarageDisplay(garageData.cars);
    currentCar = carData;
    
    // Через 2 секунды закрываем Mini App
    setTimeout(() => {
        tg.close();
    }, 2000);
}

// Сброс декодера
function resetVINDecoder() {
    // Очищаем поля
    document.getElementById('vin-input').value = '';
    document.getElementById('model-input').value = '';
    document.getElementById('mileage-input').value = '';
    document.getElementById('manual-brand').value = '';
    document.getElementById('manual-model').value = '';
    document.getElementById('manual-mileage').value = '';
    
    // Скрываем результаты
    document.getElementById('vin-result').style.display = 'none';
    document.getElementById('vin-error').style.display = 'none';
    document.getElementById('vin-warning').style.display = 'none';
    
    // Сбрасываем счетчик
    document.getElementById('vin-counter').textContent = '0 / 17 символов';
    document.getElementById('vin-counter').style.color = '#888';
    document.getElementById('decode-btn').disabled = true;
    
    // Удаляем сохраненные данные
    window.decodedVINData = null;
    
    // Скроллим к началу
    document.getElementById('vin-screen').scrollIntoView({ behavior: 'smooth' });
}


// ============================================
// НАВИГАЦИЯ - Bottom Nav
// ============================================

function navigateTo(screenId) {
    // Скрываем все экраны
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Показываем нужный экран
    document.getElementById(screenId).classList.add('active');
    
    // Обновляем активную кнопку в навигации
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeNav = document.querySelector(`[data-screen="${screenId}"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }
    
    // Скроллим вверх
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// РЕДАКТОР АВТОМОБИЛЯ
// ============================================

function loadCarDataToEditor() {
    if (!currentCar) {
        tg.showAlert('Сначала добавьте автомобиль');
        showScreen('main-screen');
        return;
    }
    
    // Заполняем поля данными текущего авто
    document.getElementById('edit-brand').value = currentCar.brand || '';
    document.getElementById('edit-model').value = currentCar.model || '';
    document.getElementById('edit-year').value = currentCar.year || '';
    document.getElementById('edit-license-plate').value = currentCar.license_plate || '';
    document.getElementById('edit-engine-type').value = currentCar.engine_type || '';
    document.getElementById('edit-engine-volume').value = currentCar.engine_volume || '';
    document.getElementById('edit-mileage').value = currentCar.current_mileage || '';
}

// Перехватываем переход на экран редактирования
const originalShowScreen = window.showScreen;
window.showScreen = function(screenId) {
    if (screenId === 'edit-car-screen') {
        loadCarDataToEditor();
    }
    originalShowScreen(screenId);
};

function saveCarChanges() {
    const brand = document.getElementById('edit-brand').value.trim();
    const model = document.getElementById('edit-model').value.trim();
    const year = document.getElementById('edit-year').value.trim();
    const licensePlate = document.getElementById('edit-license-plate').value.trim().toUpperCase();
    const engineType = document.getElementById('edit-engine-type').value;
    const engineVolume = document.getElementById('edit-engine-volume').value.trim();
    const mileage = document.getElementById('edit-mileage').value.trim();
    
    // Валидация
    if (!brand) {
        tg.showAlert('Введите марку автомобиля');
        return;
    }
    
    if (!model) {
        tg.showAlert('Введите модель автомобиля');
        return;
    }
    
    if (!mileage || parseInt(mileage) < 0) {
        tg.showAlert('Введите корректный пробег');
        return;
    }
    
    // Формируем данные для отправки
    const updatedCar = {
        id: currentCar.id,
        brand: brand,
        model: model,
        year: year ? parseInt(year) : null,
        license_plate: licensePlate || null,
        engine_type: engineType || null,
        engine_volume: engineVolume ? parseFloat(engineVolume) : null,
        current_mileage: parseInt(mileage)
    };
    
    console.log('💾 Сохранение изменений авто:', updatedCar);
    
    // Отправляем в бот
    tg.sendData(JSON.stringify({
        action: 'update_car',
        car: updatedCar
    }));
    
    // Обновляем локальные данные
    currentCar = updatedCar;
    
    // Обновляем отображение в гараже
    updateCarDisplay(currentCar);
    
    // Сохраняем в localStorage
    if (garageData && garageData.cars) {
        const carIndex = garageData.cars.findIndex(c => c.id === currentCar.id);
        if (carIndex !== -1) {
            garageData.cars[carIndex] = currentCar;
            localStorage.setItem('garageData', JSON.stringify(garageData));
        }
    }
    
    // Показываем уведомление
    tg.showAlert('✅ Изменения сохранены!');
    
    // Возвращаемся на главный экран
    setTimeout(() => {
        navigateTo('main-screen');
    }, 1500);
}

function confirmDeleteCar() {
    tg.showConfirm(
        '⚠️ Вы уверены, что хотите удалить этот автомобиль?\n\nВсе данные (ТО, расходы, поломки) будут удалены!',
        (confirmed) => {
            if (confirmed) {
                deleteCar();
            }
        }
    );
}

function deleteCar() {
    if (!currentCar || !currentCar.id) {
        tg.showAlert('Ошибка: автомобиль не найден');
        return;
    }
    
    console.log('🗑️ Удаление автомобиля:', currentCar.id);
    
    // Отправляем в бот
    tg.sendData(JSON.stringify({
        action: 'delete_car',
        car_id: currentCar.id
    }));
    
    // Удаляем из локальных данных
    if (garageData && garageData.cars) {
        garageData.cars = garageData.cars.filter(c => c.id !== currentCar.id);
        localStorage.setItem('garageData', JSON.stringify(garageData));
    }
    
    // Показываем уведомление
    tg.showAlert('🗑️ Автомобиль удалён');
    
    // Закрываем Mini App
    setTimeout(() => {
        tg.close();
    }, 1500);
}

function updateCarDisplay(car) {
    if (!car) return;
    
    const carName = document.getElementById('car-name');
    const carSpecs = document.getElementById('car-specs');
    
    if (carName) {
        carName.textContent = `${car.brand} ${car.model}`;
    }
    
    if (carSpecs) {
        let specs = [];
        if (car.year) specs.push(car.year);
        if (car.engine_type) specs.push(car.engine_type);
        if (car.engine_volume) specs.push(`${car.engine_volume}л`);
        if (car.current_mileage) specs.push(`${car.current_mileage.toLocaleString()} км`);
        
        carSpecs.textContent = specs.join(' • ') || 'Добавьте данные';
    }
}


// ============================================
// КАРТА - СТО И ЗАПРАВКИ
// ============================================

let userLocation = null;
let currentFilter = 'all';

function requestLocation() {
    if (!navigator.geolocation) {
        tg.showAlert('❌ Геолокация не поддерживается вашим устройством');
        return;
    }
    
    console.log('📍 Запрос геолокации...');
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            console.log('✅ Геолокация получена:', userLocation);
            
            // Обновляем карту
            showMapWithLocation();
            
            // Обновляем расстояния до мест
            updatePlacesDistances();
            
            tg.showAlert('✅ Местоположение определено');
        },
        (error) => {
            console.error('❌ Ошибка геолокации:', error);
            
            let errorMessage = 'Не удалось определить местоположение';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Вы запретили доступ к геолокации. Разрешите в настройках браузера.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Местоположение недоступно';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Превышено время ожидания';
                    break;
            }
            
            tg.showAlert(errorMessage);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

function showMapWithLocation() {
    if (!userLocation) return;
    
    const mapView = document.getElementById('map-view');
    
    // Используем Yandex Maps (работает в России)
    const yandexMapUrl = `https://yandex.ru/maps/?ll=${userLocation.lng},${userLocation.lat}&z=14&l=map`;
    
    mapView.innerHTML = `
        <button class="btn-locate" onclick="requestLocation()">
            <span>📍</span> Обновить
        </button>
        <iframe 
            src="${yandexMapUrl}" 
            width="100%" 
            height="100%" 
            frameborder="0" 
            style="border: none; border-radius: var(--radius-lg);">
        </iframe>
    `;
}

function updatePlacesDistances() {
    // В реальном приложении здесь будет расчет реальных расстояний через API
    // Сейчас просто обновляем счетчик
    const allPlaces = document.querySelectorAll('.place-card');
    const visiblePlaces = Array.from(allPlaces).filter(place => {
        return place.style.display !== 'none';
    });
    
    const countEl = document.getElementById('places-count');
    if (countEl) {
        countEl.textContent = `${visiblePlaces.length} найдено`;
    }
    
    // Сортируем по расстоянию
    const placesList = document.getElementById('places-list');
    const sortedPlaces = Array.from(allPlaces).sort((a, b) => {
        const distA = parseFloat(a.dataset.distance) || 999;
        const distB = parseFloat(b.dataset.distance) || 999;
        return distA - distB;
    });
    
    // Перемещаем в отсортированном порядке
    const header = placesList.querySelector('.places-header');
    sortedPlaces.forEach(place => {
        if (header) {
            header.insertAdjacentElement('afterend', place);
        }
    });
}

function filterPlaces(type) {
    currentFilter = type;
    
    // Обновляем активную кнопку
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === type) {
            btn.classList.add('active');
        }
    });
    
    // Фильтруем карточки
    const places = document.querySelectorAll('.place-card');
    let visibleCount = 0;
    
    places.forEach(place => {
        if (type === 'all' || place.dataset.type === type) {
            place.style.display = 'flex';
            visibleCount++;
        } else {
            place.style.display = 'none';
        }
    });
    
    // Обновляем счетчик
    const countEl = document.getElementById('places-count');
    if (countEl) {
        countEl.textContent = `${visibleCount} найдено`;
    }
    
    // Анимация
    places.forEach((place, index) => {
        if (place.style.display === 'flex') {
            setTimeout(() => {
                place.style.animation = 'slideIn 0.3s ease-out';
            }, index * 50);
        }
    });
}

function openRoute(coords) {
    if (!coords) return;
    
    // Открываем маршрут в Yandex Maps
    const [lat, lng] = coords.split(',');
    
    if (userLocation) {
        // Маршрут от текущего местоположения
        const routeUrl = `https://yandex.ru/maps/?rtext=${userLocation.lat},${userLocation.lng}~${lat},${lng}&rtt=auto`;
        window.open(routeUrl, '_blank');
    } else {
        // Просто открываем точку на карте
        const pointUrl = `https://yandex.ru/maps/?ll=${lng},${lat}&z=16&l=map`;
        window.open(pointUrl, '_blank');
    }
}

// Инициализация карты при загрузке экрана
document.addEventListener('DOMContentLoaded', () => {
    // Устанавливаем начальный счётчик
    updatePlacesDistances();
    
    // Автоматически запрашиваем геолокацию при первом открытии карты
    const originalShowScreenMap = window.showScreen;
    window.showScreen = function(screenId) {
        if (originalShowScreenMap) originalShowScreenMap(screenId);
        
        if (screenId === 'map-screen' && !userLocation) {
            // Небольшая задержка для плавности
            setTimeout(() => {
                // requestLocation(); // Раскомментируй, если нужна автозагрузка геолокации
            }, 500);
        }
    };
});

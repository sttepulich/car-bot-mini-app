# 🚗 Авто Ассистент - Mini App

Полнофункциональное Mini App для Telegram бота, помогающее автовладельцам управлять своими автомобилями.

## 🎯 Возможности

### 1. ⛽ Калькулятор топлива
- Расчет необходимого количества топлива для поездки
- Определение стоимости поездки
- Подсчет стоимости 1 километра
- Советы по экономии топлива

### 2. 🛞 Калькулятор шин
- Сравнение размеров шин
- Расчет разницы диаметров
- Определение влияния на показания спидометра
- Рекомендации по совместимости

### 3. 📊 Анализ расхода
- Статистика потребления топлива
- Средний расход за период
- Общий пробег
- Затраты на топливо

### 4. ⏰ Напоминания
- ТО (техническое обслуживание)
- Страховка (ОСАГО/КАСКО)
- Транспортный налог
- Замена масла и другие работы

### 5. 🗺️ Карта сервисов
- Поиск ближайших СТО
- Заправочные станции
- Шиномонтаж
- Автомойки

### 6. 📄 Хранилище документов
- СТС (свидетельство о регистрации)
- Водительское удостоверение
- ОСАГО и КАСКО
- ПТС
- Сервисная книжка

### 7. 🔧 История поломок
- Каталог всех проблем с автомобилем
- Решения и стоимость ремонта
- Связь с диагностикой бота

### 8. 💰 Статистика расходов
- Распределение затрат по категориям
- Анализ трендов
- Потенциальная экономия
- Графики и диаграммы

## 📁 Структура файлов

```
mini_app/
├── index.html      # Основной HTML с 8 экранами
├── styles.css      # Стили с анимациями и темами Telegram
├── app.js          # JavaScript логика
└── README.md       # Эта документация
```

## 🚀 Быстрый старт

### Локальное тестирование

1. Откройте `index.html` в браузере для предпросмотра
2. Для полноценного тестирования нужен HTTPS хостинг

### Деплой на хостинг

**Рекомендуемые сервисы (бесплатные):**

#### GitHub Pages
```bash
# 1. Создайте репозиторий на GitHub
# 2. Загрузите папку mini_app
# 3. Включите GitHub Pages в настройках
# 4. URL будет: https://username.github.io/repo-name/
```

#### Vercel
```bash
# 1. Установите Vercel CLI
npm install -g vercel

# 2. Перейдите в папку mini_app
cd mini_app

# 3. Деплой
vercel --prod
```

#### Netlify
```bash
# 1. Установите Netlify CLI
npm install -g netlify-cli

# 2. Деплой
netlify deploy --prod --dir=mini_app
```

## 🔧 Настройка в боте

### 1. Обновите .env
```env
MINI_APP_URL=https://your-domain.com/mini_app/
```

### 2. Настройте через BotFather

Отправьте в @BotFather:
```
/newapp
# Выберите вашего бота
# Название: Авто Ассистент
# Описание: Управление автомобилем
# Загрузите иконку (512x512 px)
# URL: https://your-domain.com/mini_app/
# Short name: auto_assistant
```

### 3. Добавьте кнопку в бот

Код уже готов в `handlers/common_handlers.py`:
```python
keyboard = ReplyKeyboardMarkup(resize_keyboard=True)
keyboard.add(KeyboardButton("🚗 Открыть Mini App", web_app=WebAppInfo(url=MINI_APP_URL)))
```

## 🎨 Кастомизация

### Изменение цветов
Отредактируйте переменные CSS в `styles.css`:
```css
:root {
    --primary-color: #3b82f6;    /* Основной цвет */
    --success-color: #10b981;     /* Успех */
    --warning-color: #f59e0b;     /* Предупреждение */
    --danger-color: #ef4444;      /* Опасность */
}
```

### Добавление новых экранов
1. Добавьте HTML в `index.html`:
```html
<div id="new-screen" class="screen">
    <div class="header">
        <button class="btn-back" onclick="showScreen('main-screen')">← Назад</button>
        <h2>Новый экран</h2>
    </div>
    <!-- Контент -->
</div>
```

2. Добавьте пункт в меню:
```html
<div class="menu-item" onclick="showScreen('new-screen')">
    <div class="menu-icon">🎯</div>
    <div class="menu-text">
        <h3>Новая функция</h3>
        <p>Описание</p>
    </div>
</div>
```

3. Добавьте логику в `app.js` (если нужно)

### Интеграция с API

Добавьте функции в `app.js`:
```javascript
async function loadDataFromServer() {
    const userId = tg.initDataUnsafe.user.id;
    const response = await fetch(`https://your-api.com/user/${userId}/data`);
    const data = await response.json();
    return data;
}
```

## 📱 Тестирование

### В браузере
1. Откройте Chrome DevTools (F12)
2. Включите режим устройства (Ctrl+Shift+M)
3. Выберите мобильное устройство
4. Откройте `index.html`

### В Telegram
1. Отправьте команду `/start` боту
2. Нажмите кнопку "🚗 Открыть Mini App"
3. Mini App откроется внутри Telegram

### Отладка
Используйте Telegram Desktop для доступа к консоли:
- Windows: `Ctrl+Shift+I`
- macOS: `Cmd+Option+I`

## 🔐 Безопасность

- **Локальное хранилище**: Документы хранятся только на устройстве пользователя
- **Данные**: Используется `localStorage` для кэширования расчетов
- **API**: Telegram Web App API обеспечивает безопасную передачу данных

## 📊 Производительность

- **Размер**: ~50KB (HTML + CSS + JS)
- **Загрузка**: <1 секунда на 3G
- **Анимации**: 60 FPS на современных устройствах
- **Кэширование**: Автоматическое кэширование расчетов

## 🌐 Совместимость

- ✅ Android (Telegram 9.0+)
- ✅ iOS (Telegram 9.0+)
- ✅ Windows/macOS (Telegram Desktop)
- ✅ Веб-версия Telegram

## 🛠️ Расширенные функции

### Добавление карт
Интегрируйте Google Maps или Яндекс.Карты:
```html
<div id="map-container">
    <script src="https://api-maps.yandex.ru/2.1/?lang=ru_RU"></script>
    <script>
        ymaps.ready(init);
        function init() {
            var map = new ymaps.Map("map-container", {
                center: [55.76, 37.64],
                zoom: 12
            });
        }
    </script>
</div>
```

### График расхода
Используйте Chart.js:
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    const ctx = document.getElementById('consumption-chart');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Янв', 'Фев', 'Мар'],
            datasets: [{
                label: 'Расход л/100км',
                data: [7.2, 7.5, 7.1]
            }]
        }
    });
</script>
```

## 💡 Полезные ссылки

- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [Telegram Web App API](https://core.telegram.org/bots/webapps#initializing-mini-apps)
- [GitHub Pages](https://pages.github.com/)
- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com/)

## 📝 Лицензия

Этот проект создан для личного использования. Можете модифицировать по своему усмотрению.

## 🤝 Поддержка

Если возникли проблемы:
1. Проверьте консоль браузера на ошибки
2. Убедитесь, что URL в BotFather правильный (должен быть HTTPS)
3. Проверьте, что Mini App открывается в браузере
4. Проверьте настройки в `.env` файле бота

---

**Приятного использования! 🚗💨**

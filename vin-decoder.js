// VIN Decoder - Декодирование VIN номеров
// Модуль для расшифровки WMI (World Manufacturer Identifier)

window.VINDecoder = {
    // База данных WMI (первые 3 символа VIN)
    wmiDatabase: {
        // Российские производители
        'X7L': { brand: 'Renault', country: 'Россия', models: ['Logan', 'Sandero', 'Duster', 'Kaptur'] },
        'X7M': { brand: 'Hyundai', country: 'Россия', models: ['Solaris', 'Creta', 'Tucson'] },
        'XTA': { brand: 'AvtoVAZ', country: 'Россия', models: ['Lada Vesta', 'Lada Granta', 'Lada Largus', 'Lada XRAY'] },
        'XTC': { brand: 'AvtoVAZ', country: 'Россия', models: ['Lada Vesta', 'Lada Granta', 'Lada Largus', 'Lada XRAY'] },
        'XTT': { brand: 'GM-AvtoVAZ', country: 'Россия', models: ['Chevrolet Niva'] },
        'XUF': { brand: 'UAZ', country: 'Россия', models: ['Patriot', 'Hunter', 'Pickup'] },
        
        // Японские производители
        'JF1': { brand: 'Subaru', country: 'Япония', models: ['Impreza', 'Legacy', 'Forester', 'Outback', 'XV'] },
        'JF2': { brand: 'Subaru', country: 'Япония', models: ['Impreza', 'Legacy', 'Forester', 'Outback', 'XV'] },
        'JHM': { brand: 'Honda', country: 'Япония', models: ['Accord', 'Civic', 'CR-V', 'Fit', 'Jazz'] },
        'JN1': { brand: 'Nissan', country: 'Япония', models: ['Qashqai', 'X-Trail', 'Juke', 'Patrol'] },
        'JN8': { brand: 'Nissan', country: 'Япония', models: ['Qashqai', 'X-Trail', 'Juke', 'Patrol'] },
        'JT1': { brand: 'Toyota', country: 'Япония', models: ['Camry', 'Corolla', 'RAV4', 'Land Cruiser'] },
        'JT2': { brand: 'Toyota', country: 'Япония', models: ['Camry', 'Corolla', 'RAV4', 'Land Cruiser'] },
        'JT3': { brand: 'Toyota', country: 'Япония', models: ['Camry', 'Corolla', 'RAV4', 'Land Cruiser'] },
        'JTD': { brand: 'Toyota', country: 'Япония', models: ['Prius', 'Auris', 'Yaris'] },
        'JTN': { brand: 'Toyota', country: 'Япония', models: ['Camry', 'Corolla', 'RAV4', 'Land Cruiser'] },
        'JM1': { brand: 'Mazda', country: 'Япония', models: ['3', '6', 'CX-5', 'CX-7', 'CX-9'] },
        'JM3': { brand: 'Mazda', country: 'Япония', models: ['3', '6', 'CX-5', 'CX-7', 'CX-9'] },
        'JS1': { brand: 'Suzuki', country: 'Япония', models: ['Swift', 'Vitara', 'SX4', 'Jimny'] },
        'JS2': { brand: 'Suzuki', country: 'Япония', models: ['Swift', 'Vitara', 'SX4', 'Jimny'] },
        'JMY': { brand: 'Mitsubishi', country: 'Япония', models: ['Lancer', 'Outlander', 'ASX', 'Pajero'] },
        'JMZ': { brand: 'Mitsubishi', country: 'Япония', models: ['Lancer', 'Outlander', 'ASX', 'Pajero'] },
        
        // Немецкие производители
        'WBA': { brand: 'BMW', country: 'Германия', models: ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5'] },
        'WBS': { brand: 'BMW', country: 'Германия', models: ['M3', 'M5', 'M6'] },
        'WBW': { brand: 'BMW', country: 'Германия', models: ['i3', 'i8'] },
        'WDB': { brand: 'Mercedes-Benz', country: 'Германия', models: ['A-Class', 'B-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLC', 'GLE'] },
        'WDD': { brand: 'Mercedes-Benz', country: 'Германия', models: ['A-Class', 'B-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLC', 'GLE'] },
        'WDF': { brand: 'Mercedes-Benz', country: 'Германия', models: ['Sprinter', 'Vito'] },
        'WDC': { brand: 'Mercedes-Benz', country: 'Германия', models: ['AMG GT', 'SL', 'SLK'] },
        'WVW': { brand: 'Volkswagen', country: 'Германия', models: ['Golf', 'Jetta', 'Passat', 'Polo', 'Tiguan', 'Touareg'] },
        'WV1': { brand: 'Volkswagen', country: 'Германия', models: ['Golf', 'Jetta', 'Passat', 'Polo', 'Tiguan', 'Touareg'] },
        'WV2': { brand: 'Volkswagen', country: 'Германия', models: ['Touran', 'Sharan', 'Multivan'] },
        'WVG': { brand: 'Volkswagen', country: 'Германия', models: ['Amarok', 'Crafter'] },
        'WAU': { brand: 'Audi', country: 'Германия', models: ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7'] },
        'WUA': { brand: 'Audi', country: 'Германия', models: ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7'] },
        'WP0': { brand: 'Porsche', country: 'Германия', models: ['911', 'Cayenne', 'Macan', 'Panamera', 'Boxster', 'Cayman'] },
        
        // Американские производители
        '1FA': { brand: 'Ford', country: 'США', models: ['Focus', 'Fusion', 'Mustang', 'Explorer', 'F-150'] },
        '1FB': { brand: 'Ford', country: 'США', models: ['F-250', 'F-350', 'F-450'] },
        '1FC': { brand: 'Ford', country: 'США', models: ['E-Series', 'Transit'] },
        '1FD': { brand: 'Ford', country: 'США', models: ['F-650', 'F-750'] },
        '1FT': { brand: 'Ford', country: 'США', models: ['F-150', 'F-250', 'Ranger'] },
        '1G1': { brand: 'Chevrolet', country: 'США', models: ['Corvette', 'Camaro', 'Malibu', 'Cruze'] },
        '1G4': { brand: 'Buick', country: 'США', models: ['Enclave', 'Encore', 'LaCrosse'] },
        '1GC': { brand: 'Chevrolet', country: 'США', models: ['Silverado', 'Colorado'] },
        '1GN': { brand: 'Chevrolet', country: 'США', models: ['Tahoe', 'Suburban', 'Traverse'] },
        '1GT': { brand: 'GMC', country: 'США', models: ['Sierra', 'Canyon'] },
        '1HG': { brand: 'Honda', country: 'США', models: ['Accord', 'Civic', 'CR-V', 'Pilot'] },
        '1J4': { brand: 'Jeep', country: 'США', models: ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass'] },
        '1C4': { brand: 'Chrysler', country: 'США', models: ['300', 'Pacifica'] },
        '1N4': { brand: 'Nissan', country: 'США', models: ['Altima', 'Maxima', 'Rogue', 'Pathfinder'] },
        
        // Корейские производители
        'KMH': { brand: 'Hyundai', country: 'Южная Корея', models: ['Solaris', 'Elantra', 'Tucson', 'Santa Fe', 'Sonata'] },
        'KNA': { brand: 'Kia', country: 'Южная Корея', models: ['Rio', 'Ceed', 'Sportage', 'Sorento', 'Optima'] },
        'KNB': { brand: 'Kia', country: 'Южная Корея', models: ['Rio', 'Ceed', 'Sportage', 'Sorento', 'Optima'] },
        'KNC': { brand: 'Kia', country: 'Южная Корея', models: ['Rio', 'Ceed', 'Sportage', 'Sorento', 'Optima'] },
        'KND': { brand: 'Kia', country: 'Южная Корея', models: ['Rio', 'Ceed', 'Sportage', 'Sorento', 'Optima'] },
        'KPT': { brand: 'SsangYong', country: 'Южная Корея', models: ['Actyon', 'Rexton', 'Kyron'] },
        
        // Французские производители
        'VF1': { brand: 'Renault', country: 'Франция', models: ['Duster', 'Kaptur', 'Logan', 'Sandero', 'Megane', 'Fluence'] },
        'VF3': { brand: 'Peugeot', country: 'Франция', models: ['208', '308', '408', '508', '3008', '5008'] },
        'VF7': { brand: 'Citroën', country: 'Франция', models: ['C3', 'C4', 'C5', 'C-Crosser', 'Berlingo'] },
        'VFE': { brand: 'Citroën', country: 'Франция', models: ['Jumper', 'Jumpy'] },
        
        // Итальянские производители
        'ZFA': { brand: 'Fiat', country: 'Италия', models: ['500', 'Panda', 'Punto', 'Tipo', 'Doblo'] },
        'ZAR': { brand: 'Alfa Romeo', country: 'Италия', models: ['Giulietta', 'Giulia', 'Stelvio'] },
        'ZFF': { brand: 'Ferrari', country: 'Италия', models: ['458', '488', 'California', 'F12', 'LaFerrari'] },
        'ZLA': { brand: 'Lamborghini', country: 'Италия', models: ['Aventador', 'Huracán', 'Urus'] },
        
        // Шведские производители
        'YV1': { brand: 'Volvo', country: 'Швеция', models: ['S60', 'S80', 'S90', 'V40', 'V60', 'V90', 'XC60', 'XC90'] },
        'YS3': { brand: 'Saab', country: 'Швеция', models: ['9-3', '9-5'] },
        
        // Китайские производители
        'LDC': { brand: 'Changan', country: 'Китай', models: ['CS35', 'CS75', 'Eado'] },
        'LGB': { brand: 'Geely', country: 'Китай', models: ['Emgrand', 'Atlas', 'Coolray'] },
        'LHG': { brand: 'Haval', country: 'Китай', models: ['F7', 'H2', 'H6', 'H9'] },
        'LVS': { brand: 'Chery', country: 'Китай', models: ['Tiggo', 'Arrizo'] },
        'LFV': { brand: 'FAW', country: 'Китай', models: ['Besturn', 'Oley'] },
        
        // Чешские производители
        'TMB': { brand: 'Škoda', country: 'Чехия', models: ['Rapid', 'Octavia', 'Superb', 'Kodiaq', 'Karoq'] },
        'TMP': { brand: 'Škoda', country: 'Чехия', models: ['Rapid', 'Octavia', 'Superb', 'Kodiaq', 'Karoq'] },
        
        // Индийские производители
        'MA3': { brand: 'Suzuki', country: 'Индия', models: ['Swift', 'Vitara', 'SX4'] },
        
        // Британские производители
        'SAJ': { brand: 'Jaguar', country: 'Великобритания', models: ['XE', 'XF', 'XJ', 'F-Type', 'F-Pace'] },
        'SAL': { brand: 'Land Rover', country: 'Великобритания', models: ['Defender', 'Discovery', 'Range Rover', 'Evoque', 'Velar'] },
        'SAR': { brand: 'Range Rover', country: 'Великобритания', models: ['Sport', 'Evoque', 'Velar'] },
        'SCC': { brand: 'Lotus', country: 'Великобритания', models: ['Elise', 'Exige', 'Evora'] },
        
        // Испанские производители
        'VSS': { brand: 'SEAT', country: 'Испания', models: ['Ibiza', 'Leon', 'Ateca', 'Arona'] },
    },

    // Расчет года выпуска по 10-му символу VIN
    yearCodes: {
        'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014,
        'F': 2015, 'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019,
        'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023, 'R': 2024,
        'S': 2025, 'T': 2026, 'V': 2027, 'W': 2028, 'X': 2029,
        'Y': 2030,
        '1': 2001, '2': 2002, '3': 2003, '4': 2004, '5': 2005,
        '6': 2006, '7': 2007, '8': 2008, '9': 2009
    },

    // Основная функция декодирования
    decodeVIN: function(vin) {
        // Валидация VIN
        const validation = this.validateVIN(vin);
        if (!validation.valid) {
            return {
                success: false,
                error: validation.error,
                vin: vin
            };
        }

        // Извлекаем WMI (первые 3 символа)
        const wmi = vin.substring(0, 3);
        
        // Определяем год
        const yearChar = vin.charAt(9);
        const year = this.yearCodes[yearChar] || null;

        // Ищем производителя
        const manufacturer = this.wmiDatabase[wmi];

        if (!manufacturer) {
            // WMI не найден в базе
            return {
                success: true,
                found: false,
                vin: vin,
                wmi: wmi,
                year: year,
                warning: `Производитель с кодом ${wmi} не найден в базе данных.\n\nВведите марку и модель вручную.`
            };
        }

        // Успешное декодирование
        return {
            success: true,
            found: true,
            vin: vin,
            wmi: wmi,
            brand: manufacturer.brand,
            country: manufacturer.country,
            year: year,
            models: manufacturer.models || []
        };
    },

    // Валидация VIN
    validateVIN: function(vin) {
        // Проверка длины
        if (!vin || vin.length === 0) {
            return { valid: false, error: 'VIN номер не может быть пустым' };
        }

        if (vin.length < 17) {
            return { valid: false, error: `VIN слишком короткий: ${vin.length} символов (должен быть 17)` };
        }

        if (vin.length > 17) {
            return { valid: false, error: `VIN слишком длинный: ${vin.length} символов (должен быть 17)` };
        }

        // Проверка запрещенных символов (I, O, Q)
        const invalidChars = ['I', 'O', 'Q'];
        for (let char of vin) {
            if (invalidChars.includes(char)) {
                return { valid: false, error: `Недопустимый символ "${char}". В VIN не используются I, O, Q` };
            }
        }

        // Проверка на валидные символы (латинские буквы и цифры)
        const validPattern = /^[A-HJ-NPR-Z0-9]{17}$/;
        if (!validPattern.test(vin)) {
            return { valid: false, error: 'VIN может содержать только латинские буквы A-Z (кроме I, O, Q) и цифры 0-9' };
        }

        return { valid: true };
    }
};

console.log('✅ VIN Decoder загружен. База WMI: ' + Object.keys(window.VINDecoder.wmiDatabase).length + ' производителей');

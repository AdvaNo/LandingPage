// Функция для определения города по IP
async function detectCity() {
    const cityElement = document.getElementById('user-city');

    try {
        // Делаем запрос к бесплатному API (ip-api.com)
        // Мы просим данные на русском языке (lang=ru)
        const response = await fetch('http://ip-api.com/json/?lang=ru');
        const data = await response.json();

        if (data && data.city) {
            // Если город найден, подставляем его в наш span
            cityElement.textContent = data.city;
        } else {
            // Если API не ответил, ставим город по умолчанию
            cityElement.textContent = "вашем городе";
        }
    } catch (error) {
        console.error("Ошибка при определении города:", error);
        cityElement.textContent = "вашем городе";
    }
}

// Запускаем функцию сразу после загрузки страницы
document.addEventListener('DOMContentLoaded', detectCity);

// Настройка ручного переключения вкладок (если стандартный Bootstrap не сработал)
document.addEventListener('DOMContentLoaded', function () {
    // 1. Находим все кнопки-вкладки
    const tabButtons = document.querySelectorAll('#servicesTabs button');

    tabButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault(); // Отменяем стандартное поведение

            // 2. Убираем класс 'active' у всех кнопок в этом меню
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Добавляем 'active' той, на которую нажали
            this.classList.add('active');

            // 3. Получаем ID блока, который нужно показать (например, #pills-vet)
            const targetId = this.getAttribute('data-bs-target');
            const targetPane = document.querySelector(targetId);

            if (targetPane) {
                // 4. Скрываем все блоки с контентом
                const allPanes = document.querySelectorAll('.tab-pane');
                allPanes.forEach(pane => {
                    pane.classList.remove('show', 'active');
                });

                // 5. Показываем нужный блок
                targetPane.classList.add('show', 'active');
            }
        });
    });
});

// 3. РАБОТА КНОПОК "+" (ДОБАВЛЕНИЕ)
document.addEventListener('click', function (e) {
    // Ищем, нажат ли элемент с классом .add-to-cart-btn или его иконка
    const btn = e.target.closest('.add-to-cart-btn');

    if (btn) {
        console.log("Кнопка нажата!"); // Проверка в консоли (F12)
        const icon = btn.querySelector('i');

        // Добавляем класс анимации (создадим его в CSS)
        btn.classList.add('btn-clicked');

        // Меняем иконку
        if (icon) {
            icon.classList.remove('fa-plus');
            icon.classList.add('fa-check');
        }

        // Меняем стиль кнопки
        btn.classList.remove('btn-warning');
        btn.classList.add('btn-success');

        // Чтобы анимация была видна, задержим уведомление
        setTimeout(() => {
            alert("Специалист выбран! Заполните форму.");
            document.getElementById('contacts').scrollIntoView({ behavior: 'smooth' });
        }, 300);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // 1. Инициализируем карусель специалистов вручную
    const expertCarouselEl = document.querySelector('#expertsCarousel');

    // Если карусель есть на странице, создаем объект Bootstrap Carousel
    if (expertCarouselEl) {
        const carousel = new bootstrap.Carousel(expertCarouselEl, {
            interval: false, // Отключаем автоматическую прокрутку
            ride: false      // Не запускать при загрузке
        });

        // 2. Настраиваем кнопки "Назад" и "Вперед"
        const prevBtn = expertCarouselEl.querySelector('.carousel-control-prev');
        const nextBtn = expertCarouselEl.querySelector('.carousel-control-next');

        if (prevBtn) {
            prevBtn.addEventListener('click', function () {
                carousel.prev();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function () {
                carousel.next();
            });
        }
    }
});

// Функция для создания карты
function initMap(lat = 58.0104, lon = 56.2294) { // Координаты Перми по умолчанию
    const map = L.map('map').setView([lat, lon], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Условные отметки (ваши специалисты)
    const experts = [
        { lat: 58.003, lon: 56.240, name: "Анастасия (Передержка)" },
        { lat: 58.015, lon: 56.190, name: "Дмитрий (Ветеринар)" },
        { lat: 58.030, lon: 56.280, name: "Елена (Груминг)" },
        { lat: 57.990, lon: 56.210, name: "Игорь (Выгул)" }
    ];

    const dogIcon = L.divIcon({
        html: '<i class="fa-solid fa-location-dot text-warning fa-2x"></i>',
        iconSize: [30, 30],
        className: 'custom-div-icon'
    });

    experts.forEach(exp => {
        L.marker([exp.lat, exp.lon], { icon: dogIcon })
            .addTo(map)
            .bindPopup(`<b>${exp.name}</b><br>Готов к выезду!`);
    });
}

// Вызовем инициализацию карты в window.onload
// (Добавьте это внутрь существующей функции window.onload в вашем script.js)
initMap();

//// Функция для определения города по IP
//async function detectCity() {
//    const cityElement = document.getElementById('user-city');

//    try {
//        // Делаем запрос к бесплатному API (ip-api.com)
//        // Мы просим данные на русском языке (lang=ru)
//        const response = await fetch('http://ip-api.com/json/?lang=ru');
//        const data = await response.json();

//        if (data && data.city) {
//            // Если город найден, подставляем его в наш span
//            cityElement.textContent = data.city;
//        } else {
//            // Если API не ответил, ставим город по умолчанию
//            cityElement.textContent = "вашем городе";
//        }
//    } catch (error) {
//        console.error("Ошибка при определении города:", error);
//        cityElement.textContent = "вашем городе";
//    }
//}

//// Запускаем функцию сразу после загрузки страницы
//document.addEventListener('DOMContentLoaded', detectCity);

//// Настройка ручного переключения вкладок (если стандартный Bootstrap не сработал)
//document.addEventListener('DOMContentLoaded', function () {
//    // 1. Находим все кнопки-вкладки
//    const tabButtons = document.querySelectorAll('#servicesTabs button');

//    tabButtons.forEach(button => {
//        button.addEventListener('click', function (e) {
//            e.preventDefault(); // Отменяем стандартное поведение

//            // 2. Убираем класс 'active' у всех кнопок в этом меню
//            tabButtons.forEach(btn => btn.classList.remove('active'));
//            // Добавляем 'active' той, на которую нажали
//            this.classList.add('active');

//            // 3. Получаем ID блока, который нужно показать (например, #pills-vet)
//            const targetId = this.getAttribute('data-bs-target');
//            const targetPane = document.querySelector(targetId);

//            if (targetPane) {
//                // 4. Скрываем все блоки с контентом
//                const allPanes = document.querySelectorAll('.tab-pane');
//                allPanes.forEach(pane => {
//                    pane.classList.remove('show', 'active');
//                });

//                // 5. Показываем нужный блок
//                targetPane.classList.add('show', 'active');
//            }
//        });
//    });
//});


//document.addEventListener('DOMContentLoaded', function () {
//    // 1. Инициализируем карусель специалистов вручную
//    const expertCarouselEl = document.querySelector('#expertsCarousel');

//    // Если карусель есть на странице, создаем объект Bootstrap Carousel
//    if (expertCarouselEl) {
//        const carousel = new bootstrap.Carousel(expertCarouselEl, {
//            interval: false, // Отключаем автоматическую прокрутку
//            ride: false      // Не запускать при загрузке
//        });

//        // 2. Настраиваем кнопки "Назад" и "Вперед"
//        const prevBtn = expertCarouselEl.querySelector('.carousel-control-prev');
//        const nextBtn = expertCarouselEl.querySelector('.carousel-control-next');

//        if (prevBtn) {
//            prevBtn.addEventListener('click', function () {
//                carousel.prev();
//            });
//        }

//        if (nextBtn) {
//            nextBtn.addEventListener('click', function () {
//                carousel.next();
//            });
//        }
//    }
//});
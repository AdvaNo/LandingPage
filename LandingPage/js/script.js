// Используем один общий обработчик загрузки
document.addEventListener('DOMContentLoaded', function () {
    console.log("Скрипт загружен и готов к работе!");

    // 1. ОПРЕДЕЛЕНИЕ ГОРОДА (с исправленным https)
    async function detectCity() {
        const cityElement = document.getElementById('user-city');
        if (!cityElement) return;

        try {
            // Используем https, чтобы не было ошибок на GitHub
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            if (data && data.city) {
                cityElement.textContent = data.city;
            } else {
                cityElement.textContent = "вашем городе";
            }
        } catch (error) {
            console.error("Ошибка города:", error);
            cityElement.textContent = "вашем городе";
        }
    }
    detectCity();

    // 2. ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
    const tabButtons = document.querySelectorAll('#servicesTabs button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const targetId = this.getAttribute('data-bs-target');
            const targetPane = document.querySelector(targetId);

            if (targetPane) {
                document.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.remove('show', 'active');
                });
                targetPane.classList.add('show', 'active');
            }
        });
    });

    // 3. КОРЗИНА И КНОПКИ "+" (ОБЩИЙ ОБРАБОТЧИК КЛИКОВ)
    let cart = [];
    const cartList = document.getElementById('cart-items-list');
    const cartTotal = document.getElementById('cart-total');
    const cartBadge = document.getElementById('cart-badge');

    function updateCartUI() {
        if (!cartList) return;
        cartList.innerHTML = '';
        let totalSum = 0;

        if (cart.length === 0) {
            cartList.innerHTML = '<li class="list-group-item text-center text-muted">Корзина пока пуста</li>';
            if (cartBadge) cartBadge.classList.add('d-none');
        } else {
            if (cartBadge) {
                cartBadge.classList.remove('d-none');
                cartBadge.textContent = cart.length;
            }
            cart.forEach((item, index) => {
                totalSum += item.price;
                cartList.innerHTML += `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div><h6 class="mb-0 fw-bold">${item.name}</h6></div>
                        <div>
                            <span class="me-3 fw-bold">${item.price} ₽</span>
                            <button class="btn btn-sm text-danger remove-btn" data-index="${index}"><i class="fa-solid fa-xmark"></i></button>
                        </div>
                    </li>`;
            });
        }
        if (cartTotal) cartTotal.textContent = totalSum + ' ₽';
    }

    document.addEventListener('click', function (e) {
        // Добавление в корзину
        const addBtn = e.target.closest('.add-to-cart-btn');
        if (addBtn) {
            const card = addBtn.closest('.expert-card');
            const expertName = card.querySelector('h5').textContent;
            const priceText = card.querySelector('.fw-bold.h5').textContent;
            const expertPrice = parseInt(priceText.replace(/\D/g, ''));

            cart.push({ name: expertName, price: expertPrice });
            updateCartUI();

            const icon = addBtn.querySelector('i');
            if (icon) icon.classList.replace('fa-plus', 'fa-check');
            addBtn.classList.replace('btn-warning', 'btn-success');
            console.log("Добавлено:", expertName);
        }

        // Удаление из корзины
        const removeBtn = e.target.closest('.remove-btn');
        if (removeBtn) {
            const index = removeBtn.getAttribute('data-index');
            cart.splice(index, 1);
            updateCartUI();
        }

        // ОТКРЫТИЕ/ЗАКРЫТИЕ ЧАТА (Больше не закомментировано!)
        const chatToggleBtn = e.target.closest('#chat-toggle-btn');
        const chatCloseBtn = e.target.closest('#chat-close-btn');
        const chatWindow = document.getElementById('chat-window');

        if (chatToggleBtn && chatWindow) {
            chatWindow.classList.toggle('d-none');
        }
        if (chatCloseBtn && chatWindow) {
            chatWindow.classList.add('d-none');
        }

        // ==========================================
        // ЛОГИКА ПОИСКА ПО САЙТУ
        // ==========================================
        const searchInput = document.getElementById('main-search-input');
        const searchBtn = document.getElementById('main-search-btn');

        // Словарь: что ищем -> какой ID вкладки открываем
        const searchMap = {
            'вет': '#pills-vet',
            'врач': '#pills-vet',
            'передерж': '#pills-home',
            'отель': '#pills-home',
            'выгул': '#pills-walk',
            'погуля': '#pills-walk',
            'грум': '#pills-grooming',
            'стриж': '#pills-grooming',
            'такси': '#pills-taxi',
            'машин': '#pills-taxi'
        };

        function performSearch() {
            if (!searchInput) return;
            const query = searchInput.value.toLowerCase().trim();

            if (query === "") return;

            let found = false;

            // Проверяем наш словарь на совпадения
            for (let key in searchMap) {
                if (query.includes(key)) {
                    const targetTabId = searchMap[key];
                    const tabTrigger = document.querySelector(`button[data-bs-target="${targetTabId}"]`);

                    if (tabTrigger) {
                        // 1. Кликаем по нужной вкладке
                        tabTrigger.click();
                        // 2. Скроллим к разделу услуг
                        document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
                        found = true;
                        break;
                    }
                }
            }

            if (!found) {
                alert("Услуга не найдена. Попробуйте ввести: Ветеринар, Груминг, Выгул или Такси");
            }
        }

        // Поиск по клику на лупу
        if (searchBtn) searchBtn.onclick = performSearch;

        // Поиск по нажатию Enter
        if (searchInput) {
            searchInput.onkeypress = (e) => {
                if (e.key === 'Enter') performSearch();
            };
        }
    });

    // 4. ОТПРАВКА СООБЩЕНИЙ В ЧАТЕ
    const chatInput = document.querySelector('#chat-window input');
    const chatSendBtn = document.querySelector('#chat-window .btn-outline-warning');
    const chatBody = document.querySelector('.chat-body');

    function sendMessage() {
        if (!chatInput || !chatBody) return;
        const text = chatInput.value.trim();
        if (text !== "") {
            chatBody.innerHTML += `
                <div class="ms-auto bg-warning text-white p-2 rounded-3 shadow-sm mb-2" style="width: 85%;">
                    <p class="small mb-0">${text}</p>
                </div>`;
            chatInput.value = '';
            chatBody.scrollTop = chatBody.scrollHeight;

            setTimeout(() => {
                chatBody.innerHTML += `
                    <div class="bg-white p-2 rounded-3 shadow-sm mb-2" style="width: 85%;">
                        <p class="small mb-0">Минутку, сейчас уточню этот вопрос...</p>
                    </div>`;
                chatBody.scrollTop = chatBody.scrollHeight;
            }, 1000);
        }
    }

    if (chatSendBtn) chatSendBtn.onclick = sendMessage;
    if (chatInput) {
        chatInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
    }

    // 5. КАРТА
    if (document.getElementById('map')) {
        const map = L.map('map').setView([58.0104, 56.2294], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        const dogIcon = L.divIcon({
            html: '<i class="fa-solid fa-location-dot text-warning fa-2x"></i>',
            iconSize: [30, 30],
            className: 'custom-div-icon'
        });

        const experts = [
            { lat: 58.003, lon: 56.240, name: "Анастасия" },
            { lat: 58.015, lon: 56.190, name: "Дмитрий" }
        ];

        experts.forEach(exp => {
            L.marker([exp.lat, exp.lon], { icon: dogIcon }).addTo(map).bindPopup(exp.name);
        });
    }
});



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

//// 3. РАБОТА КНОПОК "+" (ДОБАВЛЕНИЕ)
//document.addEventListener('click', function (e) {
//    // Ищем, нажат ли элемент с классом .add-to-cart-btn или его иконка
//    const btn = e.target.closest('.add-to-cart-btn');

//    if (btn) {
//        console.log("Кнопка нажата!"); // Проверка в консоли (F12)
//        const icon = btn.querySelector('i');

//        // Добавляем класс анимации (создадим его в CSS)
//        btn.classList.add('btn-clicked');

//        // Меняем иконку
//        if (icon) {
//            icon.classList.remove('fa-plus');
//            icon.classList.add('fa-check');
//        }

//        // Меняем стиль кнопки
//        btn.classList.remove('btn-warning');
//        btn.classList.add('btn-success');

//        // Чтобы анимация была видна, задержим уведомление
//        setTimeout(() => {
//            alert("Специалист выбран! Заполните форму.");
//            document.getElementById('contacts').scrollIntoView({ behavior: 'smooth' });
//        }, 300);
//    }
//});

////document.addEventListener('DOMContentLoaded', function () {
////    // 1. Инициализируем карусель специалистов вручную
////    const expertCarouselEl = document.querySelector('#expertsCarousel');

////    // Если карусель есть на странице, создаем объект Bootstrap Carousel
////    if (expertCarouselEl) {
////        const carousel = new bootstrap.Carousel(expertCarouselEl, {
////            interval: false, // Отключаем автоматическую прокрутку
////            ride: false      // Не запускать при загрузке
////        });

////        // 2. Настраиваем кнопки "Назад" и "Вперед"
////        const prevBtn = expertCarouselEl.querySelector('.carousel-control-prev');
////        const nextBtn = expertCarouselEl.querySelector('.carousel-control-next');

////        if (prevBtn) {
////            prevBtn.addEventListener('click', function () {
////                carousel.prev();
////            });
////        }

////        if (nextBtn) {
////            nextBtn.addEventListener('click', function () {
////                carousel.next();
////            });
////        }
////    }
////});

//// ==========================================
//// ЛОГИКА КОРЗИНЫ
//// ==========================================
//let cart = []; // Массив для хранения выбранных услуг
//const cartList = document.getElementById('cart-items-list');
//const cartTotal = document.getElementById('cart-total');
//const cartBadge = document.getElementById('cart-badge');

//// Функция обновления интерфейса корзины
//function updateCartUI() {
//    cartList.innerHTML = '';
//    let totalSum = 0;

//    if (cart.length === 0) {
//        cartList.innerHTML = '<li class="list-group-item text-center text-muted">Корзина пока пуста</li>';
//        if (cartBadge) cartBadge.classList.add('d-none');
//    } else {
//        if (cartBadge) {
//            cartBadge.classList.remove('d-none');
//            cartBadge.textContent = cart.length;
//        }

//        cart.forEach((item, index) => {
//            totalSum += item.price;
//            cartList.innerHTML += `
//                    <li class="list-group-item d-flex justify-content-between align-items-center">
//                        <div><h6 class="mb-0 fw-bold">${item.name}</h6></div>
//                        <div>
//                            <span class="me-3 fw-bold">${item.price} ₽</span>
//                            <button class="btn btn-sm text-danger remove-btn" data-index="${index}"><i class="fa-solid fa-xmark"></i></button>
//                        </div>
//                    </li>`;
//        });
//    }
//    cartTotal.textContent = totalSum + ' ₽';
//}

//// 3. РАБОТА КНОПОК "+" И УДАЛЕНИЯ ИЗ КОРЗИНЫ
//document.addEventListener('click', function (e) {
//    // Если нажали на кнопку добавления (+)
//    //if (e.target.closest('.add-to-cart-btn')) {
//    //    const btn = e.target.closest('.add-to-cart-btn');
//    //    const card = btn.closest('.expert-card');

//    //    // Достаем данные из карточки
//    //    const expertName = card.querySelector('h5').textContent;
//    //    // Достаем цену и очищаем ее от букв (например "от 500 ₽" -> 500)
//    //    const priceText = card.querySelector('.fw-bold.h5').textContent;
//    //    const expertPrice = parseInt(priceText.replace(/\D/g, ''));

//    //    // Добавляем в массив корзины
//    //    cart.push({ name: expertName, price: expertPrice });
//    //    updateCartUI(); // Перерисовываем корзину

//    //    // Визуальный эффект нажатия (анимация галочки)
//    //    const icon = btn.querySelector('i');
//    //    btn.classList.add('btn-clicked');
//    //    if (icon) {
//    //        icon.classList.remove('fa-plus');
//    //        icon.classList.add('fa-check');
//    //    }
//    //    btn.classList.remove('btn-warning');
//    //    btn.classList.add('btn-success');
//    //}
//    if (e.target.closest('.add-to-cart-btn')) {
//        const btn = e.target.closest('.add-to-cart-btn');
//        const card = btn.closest('.expert-card');

//        const expertName = card.querySelector('h5').textContent;
//        const priceText = card.querySelector('.fw-bold.h5').textContent;
//        const expertPrice = parseInt(priceText.replace(/\D/g, ''));

//        cart.push({ name: expertName, price: expertPrice });
//        updateCartUI();

//        // Анимация кнопки без перемотки
//        const icon = btn.querySelector('i');
//        icon.classList.replace('fa-plus', 'fa-check');
//        btn.classList.replace('btn-warning', 'btn-success');

//        // Вместо alert и скролла — легкое уведомление в консоль или мини-тост
//        console.log("Добавлено в корзину: " + expertName);

//    // Если нажали на крестик удаления внутри корзины
//    if (e.target.closest('.remove-btn')) {
//        const removeBtn = e.target.closest('.remove-btn');
//        const index = removeBtn.getAttribute('data-index');

//        // Удаляем 1 элемент из массива по его индексу
//        cart.splice(index, 1);
//        updateCartUI(); // Перерисовываем корзину
//    }
//});

//// Оформление заказа (заглушка)
//const checkoutForm = document.getElementById('checkout-form');
//if (checkoutForm) {
//    checkoutForm.addEventListener('submit', function (e) {
//        e.preventDefault(); // Отменяем реальную отправку формы

//        if (cart.length === 0) {
//            alert("Пожалуйста, добавьте хотя бы одну услугу в корзину.");
//            return;
//        }

//        alert("Заказ успешно оформлен! Наш менеджер скоро свяжется с вами.");

//        // Очищаем корзину после заказа
//        cart = [];
//        updateCartUI();

//        // Закрываем боковую панель
//        const offcanvasEl = document.getElementById('cartOffcanvas');
//        const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasEl);
//        if (offcanvasInstance) offcanvasInstance.hide();

//        // Очищаем форму
//        checkoutForm.reset();
//    });
//}

//// ==========================================
//// ЛОГИКА ЧАТА ПОДДЕРЖКИ
//// ==========================================
////const chatToggleBtn = document.getElementById('chat-toggle-btn');
////const chatWindow = document.getElementById('chat-window');
////const chatCloseBtn = document.getElementById('chat-close-btn');

////if (chatToggleBtn && chatWindow) {
////    // Открыть/закрыть чат по круглой кнопке
////    chatToggleBtn.addEventListener('click', function () {
////        chatWindow.classList.toggle('d-none');
////    });

////    // Закрыть чат по крестику
////    chatCloseBtn.addEventListener('click', function () {
////        chatWindow.classList.add('d-none');
////    });
////}
//// ОЖИВЛЯЕМ ЧАТ (ОТПРАВКА СООБЩЕНИЙ)
//const chatInput = document.querySelector('#chat-window input');
//const chatSendBtn = document.querySelector('#chat-window .btn-outline-warning');
//const chatBody = document.querySelector('.chat-body');

//function sendMessage() {
//    const text = chatInput.value.trim();
//    if (text !== "") {
//        // Добавляем сообщение пользователя
//        chatBody.innerHTML += `
//                <div class="ms-auto bg-warning text-white p-2 rounded-3 shadow-sm mb-2" style="width: 85%;">
//                    <p class="small mb-0">${text}</p>
//                </div>`;
//        chatInput.value = '';
//        chatBody.scrollTop = chatBody.scrollHeight; // Прокрутка вниз

//        // Имитация ответа через 1 сек
//        setTimeout(() => {
//            chatBody.innerHTML += `
//                    <div class="bg-white p-2 rounded-3 shadow-sm mb-2" style="width: 85%;">
//                        <p class="small mb-0">Минутку, сейчас уточню этот вопрос...</p>
//                    </div>`;
//            chatBody.scrollTop = chatBody.scrollHeight;
//        }, 1000);
//    }
//}

//if (chatSendBtn) chatSendBtn.onclick = sendMessage;
//if (chatInput) {
//    chatInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
//}

//// Функция для создания карты
//function initMap(lat = 58.0104, lon = 56.2294) { // Координаты Перми по умолчанию
//    const map = L.map('map').setView([lat, lon], 12);

//    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//        attribution: '&copy; OpenStreetMap contributors'
//    }).addTo(map);

//    // Условные отметки (ваши специалисты)
//    const experts = [
//        { lat: 58.003, lon: 56.240, name: "Анастасия (Передержка)" },
//        { lat: 58.015, lon: 56.190, name: "Дмитрий (Ветеринар)" },
//        { lat: 58.030, lon: 56.280, name: "Елена (Груминг)" },
//        { lat: 57.990, lon: 56.210, name: "Игорь (Выгул)" }
//    ];

//    const dogIcon = L.divIcon({
//        html: '<i class="fa-solid fa-location-dot text-warning fa-2x"></i>',
//        iconSize: [30, 30],
//        className: 'custom-div-icon'
//    });

//    experts.forEach(exp => {
//        L.marker([exp.lat, exp.lon], { icon: dogIcon })
//            .addTo(map)
//            .bindPopup(`<b>${exp.name}</b><br>Готов к выезду!`);
//    });
//}

//// Вызовем инициализацию карты в window.onload
//// (Добавьте это внутрь существующей функции window.onload в вашем script.js)
//initMap();

////// Функция для определения города по IP
////async function detectCity() {
////    const cityElement = document.getElementById('user-city');

////    try {
////        // Делаем запрос к бесплатному API (ip-api.com)
////        // Мы просим данные на русском языке (lang=ru)
////        const response = await fetch('http://ip-api.com/json/?lang=ru');
////        const data = await response.json();

////        if (data && data.city) {
////            // Если город найден, подставляем его в наш span
////            cityElement.textContent = data.city;
////        } else {
////            // Если API не ответил, ставим город по умолчанию
////            cityElement.textContent = "вашем городе";
////        }
////    } catch (error) {
////        console.error("Ошибка при определении города:", error);
////        cityElement.textContent = "вашем городе";
////    }
////}

////// Запускаем функцию сразу после загрузки страницы
////document.addEventListener('DOMContentLoaded', detectCity);

////// Настройка ручного переключения вкладок (если стандартный Bootstrap не сработал)
////document.addEventListener('DOMContentLoaded', function () {
////    // 1. Находим все кнопки-вкладки
////    const tabButtons = document.querySelectorAll('#servicesTabs button');

////    tabButtons.forEach(button => {
////        button.addEventListener('click', function (e) {
////            e.preventDefault(); // Отменяем стандартное поведение

////            // 2. Убираем класс 'active' у всех кнопок в этом меню
////            tabButtons.forEach(btn => btn.classList.remove('active'));
////            // Добавляем 'active' той, на которую нажали
////            this.classList.add('active');

////            // 3. Получаем ID блока, который нужно показать (например, #pills-vet)
////            const targetId = this.getAttribute('data-bs-target');
////            const targetPane = document.querySelector(targetId);

////            if (targetPane) {
////                // 4. Скрываем все блоки с контентом
////                const allPanes = document.querySelectorAll('.tab-pane');
////                allPanes.forEach(pane => {
////                    pane.classList.remove('show', 'active');
////                });

////                // 5. Показываем нужный блок
////                targetPane.classList.add('show', 'active');
////            }
////        });
////    });
////});


////document.addEventListener('DOMContentLoaded', function () {
////    // 1. Инициализируем карусель специалистов вручную
////    const expertCarouselEl = document.querySelector('#expertsCarousel');

////    // Если карусель есть на странице, создаем объект Bootstrap Carousel
////    if (expertCarouselEl) {
////        const carousel = new bootstrap.Carousel(expertCarouselEl, {
////            interval: false, // Отключаем автоматическую прокрутку
////            ride: false      // Не запускать при загрузке
////        });

////        // 2. Настраиваем кнопки "Назад" и "Вперед"
////        const prevBtn = expertCarouselEl.querySelector('.carousel-control-prev');
////        const nextBtn = expertCarouselEl.querySelector('.carousel-control-next');

////        if (prevBtn) {
////            prevBtn.addEventListener('click', function () {
////                carousel.prev();
////            });
////        }

////        if (nextBtn) {
////            nextBtn.addEventListener('click', function () {
////                carousel.next();
////            });
////        }
////    }
////});
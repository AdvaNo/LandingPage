document.addEventListener('DOMContentLoaded', function () {
    console.log("Скрипт загружен: Карта, Поиск, Чат (с ответами) и Корзина активны!");

    // ==========================================
    // 1. ГЕОЛОКАЦИЯ И ЯНДЕКС.КАРТА
    // ==========================================
    async function initGeoAndMap() {
        const cityElement = document.getElementById('user-city');
        let lat = 55.7558; let lon = 37.6173; let city = "вашем городе";

        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            if (data && data.city) {
                city = data.city;
                lat = data.latitude || lat;
                lon = data.longitude || lon;
            }
        } catch (error) { console.error("Ошибка гео:", error); }

        if (cityElement) cityElement.textContent = city;
        if (typeof ymaps !== 'undefined') {
            ymaps.ready(() => {
                const myMap = new ymaps.Map("map", {
                    center: [lat, lon], zoom: 12, controls: ['zoomControl']
                }, { suppressMapOpenBlock: true });
                myMap.geoObjects.add(new ymaps.Placemark([lat, lon], { balloonContent: `Мы в г. ${city}!` }, { preset: 'islands#warningIcon' }));
                myMap.behaviors.disable('scrollZoom');
            });
        }
    }
    initGeoAndMap();

    // ==========================================
    // 2. ЛОГИКА ЧАТА (ОТПРАВКА СООБЩЕНИЙ)
    // ==========================================
    function sendChatMessage() {
        const chatInput = document.querySelector('#chat-window input');
        const chatBody = document.querySelector('.chat-body');

        if (!chatInput || !chatBody) return;
        const text = chatInput.value.trim();

        if (text !== "") {
            // Сообщение пользователя
            chatBody.insertAdjacentHTML('beforeend', `
                <div class="ms-auto bg-warning text-white p-2 rounded-3 shadow-sm mb-2" style="width: 85%;">
                    <p class="small mb-0">${text}</p>
                </div>`);

            chatInput.value = ''; // Очистка поля
            chatBody.scrollTop = chatBody.scrollHeight; // Скролл вниз

            // Имитация ответа поддержки
            setTimeout(() => {
                chatBody.insertAdjacentHTML('beforeend', `
                    <div class="bg-white p-2 rounded-3 shadow-sm mb-2" style="width: 85%;">
                        <p class="small mb-0">Специалист уже изучает ваш вопрос. Ожидайте, пожалуйста...</p>
                    </div>`);
                chatBody.scrollTop = chatBody.scrollHeight;
            }, 1000);
        }
    }

    // ==========================================
    // 3. КОРЗИНА И УВЕДОМЛЕНИЯ
    // ==========================================
    let cart = [];

    function showCartMessage(text, type = 'danger') {
        const container = document.getElementById('cart-message-container');
        if (!container) return;
        container.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show small" role="alert">${text}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
        if (type !== 'success') {
            setTimeout(() => {
                const alert = container.querySelector('.alert');
                if (alert && typeof bootstrap !== 'undefined') new bootstrap.Alert(alert).close();
            }, 4000);
        }
    }

    function updateCartUI() {
        const cartList = document.getElementById('cart-items-list');
        const cartTotal = document.getElementById('cart-total');
        const cartBadge = document.getElementById('cart-badge');
        if (!cartList) return;

        cartList.innerHTML = '';
        let totalSum = 0;

        if (cart.length === 0) {
            cartList.innerHTML = '<li class="list-group-item text-center text-muted">Корзина пока пуста</li>';
            if (cartBadge) cartBadge.classList.add('d-none');
        } else {
            if (cartBadge) { cartBadge.classList.remove('d-none'); cartBadge.textContent = cart.length; }
            cart.forEach((item, index) => {
                totalSum += item.price;
                cartList.insertAdjacentHTML('beforeend', `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div><h6 class="mb-0 fw-bold">${item.name}</h6></div>
                        <div><span class="me-3 fw-bold">${item.price} ₽</span><button class="btn btn-sm text-danger remove-btn" data-index="${index}"><i class="fa-solid fa-xmark"></i></button></div>
                    </li>`);
            });
        }
        if (cartTotal) cartTotal.textContent = totalSum + ' ₽';
    }

    // ==========================================
    // 4. ЕДИНЫЙ ОБРАБОТЧИК КЛИКОВ
    // ==========================================
    document.addEventListener('click', function (e) {
        // Чат
        if (e.target.closest('#chat-toggle-btn')) document.getElementById('chat-window').classList.toggle('d-none');
        if (e.target.closest('#chat-close-btn')) document.getElementById('chat-window').classList.add('d-none');
        if (e.target.closest('#chat-send-btn')) sendChatMessage();

        // Поиск
        if (e.target.closest('#main-search-btn')) performSearch();

        // Корзина: Добавить/Удалить
        const addBtn = e.target.closest('.add-to-cart-btn');
        if (addBtn) {
            const card = addBtn.closest('.expert-card');
            const name = card.querySelector('h5').textContent;
            if (addBtn.classList.contains('btn-success')) {
                cart = cart.filter(i => i.name !== name);
                addBtn.classList.replace('btn-success', 'btn-warning');
                addBtn.querySelector('i').classList.replace('fa-check', 'fa-plus');
            } else {
                const price = parseInt(card.querySelector('.fw-bold.h5').textContent.replace(/\D/g, ''));
                cart.push({ name, price });
                addBtn.classList.replace('btn-warning', 'btn-success');
                addBtn.querySelector('i').classList.replace('fa-plus', 'fa-check');
            }
            updateCartUI();
        }

        if (e.target.closest('.remove-btn')) {
            const idx = e.target.closest('.remove-btn').dataset.index;
            const name = cart[idx].name;
            cart.splice(idx, 1);
            updateCartUI();
            document.querySelectorAll('.expert-card').forEach(c => {
                if (c.querySelector('h5').textContent === name) {
                    const b = c.querySelector('.add-to-cart-btn');
                    b.classList.replace('btn-success', 'btn-warning');
                    b.querySelector('i').classList.replace('fa-check', 'fa-plus');
                }
            });
        }

        // Обработка кнопки "Оставить заявку" (нижняя форма)
        const leadBtn = e.target.closest('#send-request-btn');
        if (leadBtn) {
            e.preventDefault(); // Останавливаем перезагрузку

            const nameInput = document.getElementById('userName');
            const phoneInput = document.getElementById('userPhone');

            // Простая валидация
            if (!nameInput.value.trim()) {
                alert('Пожалуйста, введите имя');
                return;
            }
            if (phoneInput.value.replace(/\D/g, '').length < 11) {
                alert('Введите корректный телефон (11 цифр)');
                return;
            }

            // Метрика
            if (typeof ym !== 'undefined') {
                ym(108784033, 'reachGoal', 'lead_success');
            }

            // Визуальный отклик
            alert('Спасибо! Ваша заявка принята. Менеджер свяжется с вами.');

            const contactForm = leadBtn.closest('form');
            if (contactForm) contactForm.reset();

            leadBtn.disabled = true;
            leadBtn.innerText = 'Отправлено ✓';
            leadBtn.classList.replace('btn-warning', 'btn-secondary');
        }
    });

    // Поиск и Чат по ENTER
    document.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            if (document.activeElement.id === 'main-search-input') performSearch();
            if (document.activeElement.closest('#chat-window')) sendChatMessage();
        }
    });

    // ==========================================
    // 5. ПОИСК И ВКЛАДКИ
    // ==========================================
    const searchMap = { 'вет': '#pills-vet', 'врач': '#pills-vet', 'грум': '#pills-grooming', 'выгул': '#pills-walk', 'такси': '#pills-taxi' };
    function performSearch() {
        const query = document.getElementById('main-search-input').value.toLowerCase();
        for (let k in searchMap) {
            if (query.includes(k)) {
                document.querySelector(`button[data-bs-target="${searchMap[k]}"]`).click();
                document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
                return;
            }
        }
        alert("Услуга не найдена.");
    }

    document.querySelectorAll('#servicesTabs button').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('#servicesTabs button').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('show', 'active'));
            document.querySelector(this.dataset.bsTarget).classList.add('show', 'active');
        });
    });

    // Форма оформления в корзине
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (cart.length === 0) return showCartMessage("Корзина пуста!", "warning");
            showCartMessage("✨ Заказ оформлен!", "success");
            cart = []; updateCartUI(); checkoutForm.reset();
        });
    }
});

//// Используем один общий обработчик загрузки
//document.addEventListener('DOMContentLoaded', function () {
//    console.log("Скрипт загружен и готов к работе!");

//    // 1. ОПРЕДЕЛЕНИЕ ГОРОДА (с исправленным https)
//    async function detectCity() {
//        const cityElement = document.getElementById('user-city');
//        if (!cityElement) return;

//        try {
//            // Используем https, чтобы не было ошибок на GitHub
//            const response = await fetch('https://ipapi.co/json/');
//            const data = await response.json();
//            if (data && data.city) {
//                cityElement.textContent = data.city;
//            } else {
//                cityElement.textContent = "вашем городе";
//            }
//        } catch (error) {
//            console.error("Ошибка города:", error);
//            cityElement.textContent = "вашем городе";
//        }
//    }
//    detectCity();

//    // 2. ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
//    const tabButtons = document.querySelectorAll('#servicesTabs button');
//    tabButtons.forEach(button => {
//        button.addEventListener('click', function (e) {
//            e.preventDefault();
//            tabButtons.forEach(btn => btn.classList.remove('active'));
//            this.classList.add('active');

//            const targetId = this.getAttribute('data-bs-target');
//            const targetPane = document.querySelector(targetId);

//            if (targetPane) {
//                document.querySelectorAll('.tab-pane').forEach(pane => {
//                    pane.classList.remove('show', 'active');
//                });
//                targetPane.classList.add('show', 'active');
//            }
//        });
//    });

//    // 3. КОРЗИНА И КНОПКИ "+" (ОБЩИЙ ОБРАБОТЧИК КЛИКОВ)
//    let cart = [];
//    const cartList = document.getElementById('cart-items-list');
//    const cartTotal = document.getElementById('cart-total');
//    const cartBadge = document.getElementById('cart-badge');

//    function updateCartUI() {
//        if (!cartList) return;
//        cartList.innerHTML = '';
//        let totalSum = 0;

//        if (cart.length === 0) {
//            cartList.innerHTML = '<li class="list-group-item text-center text-muted">Корзина пока пуста</li>';
//            if (cartBadge) cartBadge.classList.add('d-none');
//        } else {
//            if (cartBadge) {
//                cartBadge.classList.remove('d-none');
//                cartBadge.textContent = cart.length;
//            }
//            cart.forEach((item, index) => {
//                totalSum += item.price;
//                cartList.innerHTML += `
//                    <li class="list-group-item d-flex justify-content-between align-items-center">
//                        <div><h6 class="mb-0 fw-bold">${item.name}</h6></div>
//                        <div>
//                            <span class="me-3 fw-bold">${item.price} ₽</span>
//                            <button class="btn btn-sm text-danger remove-btn" data-index="${index}"><i class="fa-solid fa-xmark"></i></button>
//                        </div>
//                    </li>`;
//            });
//        }
//        if (cartTotal) cartTotal.textContent = totalSum + ' ₽';
//    }

//    // Функция для показа сообщений в корзине
//    function showCartMessage(text, type = 'danger') {
//        const container = document.getElementById('cart-message-container');
//        if (!container) return;

//        // Создаем красивое уведомление Bootstrap
//        container.innerHTML = `
//        <div class="alert alert-${type} alert-dismissible fade show small" role="alert">
//            ${text}
//            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
//        </div>
//    `;

//        // Автоматически скрываем сообщение через 4 секунды (если это не успех)
//        if (type !== 'success') {
//            setTimeout(() => {
//                const alert = container.querySelector('.alert');
//                if (alert) {
//                    const bsAlert = new bootstrap.Alert(alert);
//                    bsAlert.close();
//                }
//            }, 4000);
//        }
//    }

//    // ОБНОВЛЕННЫЙ ОБРАБОТЧИК ФОРМЫ
//    const checkoutForm = document.getElementById('checkout-form');
//    if (checkoutForm) {
//        checkoutForm.addEventListener('submit', function (e) {
//            e.preventDefault();

//            // 1. Проверка на пустую корзину
//            if (cart.length === 0) {
//                showCartMessage("Ваша корзина пуста! Выберите хотя бы одну услугу.", "warning");
//                return; // Прерываем выполнение, форма не отправится
//            }

//            // 2. Имитация отправки данных
//            // Здесь можно собрать данные: const name = this.querySelector('input[type="text"]').value;

//            // 3. Сообщение об успехе
//            showCartMessage("✨ Заказ оформлен! Менеджер свяжется с вами в течение 10 минут.", "success");

//            ym(108784033, 'reachGoal', 'order_success');
            
//            // 4. Очистка корзины и данных
//            cart = []; // Очищаем массив
//            updateCartUI(); // Обновляем интерфейс (счетчик и список)
//            checkoutForm.reset(); // Сбрасываем поля формы

//            // 5. Опционально: закрываем корзину через 3 секунды после успеха
//            setTimeout(() => {
//                const offcanvasEl = document.getElementById('cartOffcanvas');
//                const instance = bootstrap.Offcanvas.getInstance(offcanvasEl);
//                if (instance) instance.hide();
//                // Очищаем сообщение, чтобы при следующем открытии было пусто
//                document.getElementById('cart-message-container').innerHTML = '';
//            }, 5000);
//        });
//    }

//    //document.addEventListener('click', function (e) {
//    //    // Добавление в корзину
//    //    const addBtn = e.target.closest('.add-to-cart-btn');
//    //    if (addBtn) {
//    //        const card = addBtn.closest('.expert-card');
//    //        const expertName = card.querySelector('h5').textContent;
//    //        const priceText = card.querySelector('.fw-bold.h5').textContent;
//    //        const expertPrice = parseInt(priceText.replace(/\D/g, ''));

//    //        cart.push({ name: expertName, price: expertPrice });
//    //        updateCartUI();

//    //        const icon = addBtn.querySelector('i');
//    //        if (icon) icon.classList.replace('fa-plus', 'fa-check');
//    //        addBtn.classList.replace('btn-warning', 'btn-success');
//    //        console.log("Добавлено:", expertName);
//    //    }

//    //    // Удаление из корзины
//    //    const removeBtn = e.target.closest('.remove-btn');
//    //    if (removeBtn) {
//    //        const index = removeBtn.getAttribute('data-index');
//    //        cart.splice(index, 1);
//    //        updateCartUI();
//    //    }

//    //    // ОТКРЫТИЕ/ЗАКРЫТИЕ ЧАТА (Больше не закомментировано!)
//    //    const chatToggleBtn = e.target.closest('#chat-toggle-btn');
//    //    const chatCloseBtn = e.target.closest('#chat-close-btn');
//    //    const chatWindow = document.getElementById('chat-window');

//    //    if (chatToggleBtn && chatWindow) {
//    //        chatWindow.classList.toggle('d-none');
//    //    }
//    //    if (chatCloseBtn && chatWindow) {
//    //        chatWindow.classList.add('d-none');
//    //    }

//    //    // ==========================================
//    //    // ЛОГИКА ПОИСКА ПО САЙТУ
//    //    // ==========================================
//    //    const searchInput = document.getElementById('main-search-input');
//    //    const searchBtn = document.getElementById('main-search-btn');

//    //    // Словарь: что ищем -> какой ID вкладки открываем
//    //    const searchMap = {
//    //        'вет': '#pills-vet',
//    //        'врач': '#pills-vet',
//    //        'передерж': '#pills-home',
//    //        'отель': '#pills-home',
//    //        'выгул': '#pills-walk',
//    //        'погуля': '#pills-walk',
//    //        'грум': '#pills-grooming',
//    //        'стриж': '#pills-grooming',
//    //        'такси': '#pills-taxi',
//    //        'машин': '#pills-taxi'
//    //    };

//    //    function performSearch() {
//    //        if (!searchInput) return;
//    //        const query = searchInput.value.toLowerCase().trim();

//    //        if (query === "") return;

//    //        let found = false;

//    //        // Проверяем наш словарь на совпадения
//    //        for (let key in searchMap) {
//    //            if (query.includes(key)) {
//    //                const targetTabId = searchMap[key];
//    //                const tabTrigger = document.querySelector(`button[data-bs-target="${targetTabId}"]`);

//    //                if (tabTrigger) {
//    //                    // 1. Кликаем по нужной вкладке
//    //                    tabTrigger.click();
//    //                    // 2. Скроллим к разделу услуг
//    //                    document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
//    //                    found = true;
//    //                    break;
//    //                }
//    //            }
//    //        }

//    //        if (!found) {
//    //            alert("Услуга не найдена. Попробуйте ввести: Ветеринар, Груминг, Выгул или Такси");
//    //        }
//    //    }

//    //    // Поиск по клику на лупу
//    //    if (searchBtn) searchBtn.onclick = performSearch;

//    //    // Поиск по нажатию Enter
//    //    if (searchInput) {
//    //        searchInput.onkeypress = (e) => {
//    //            if (e.key === 'Enter') performSearch();
//    //        };
//    //    }
//    //});

//    document.addEventListener('click', function (e) {

//        // ==========================================
//        // 1. ДОБАВЛЕНИЕ / УДАЛЕНИЕ ИЗ КОРЗИНЫ (Toggle)
//        // ==========================================
//        const addBtn = e.target.closest('.add-to-cart-btn');
//        if (addBtn) {
//            const card = addBtn.closest('.expert-card');
//            const expertName = card.querySelector('h5').textContent;
//            const icon = addBtn.querySelector('i');

//            // Проверяем, добавлена ли уже услуга (по классу кнопки)
//            if (addBtn.classList.contains('btn-success')) {
//                // УДАЛЯЕМ, если уже нажата
//                cart = cart.filter(item => item.name !== expertName);

//                // Возвращаем прежний вид
//                if (icon) icon.classList.replace('fa-check', 'fa-plus');
//                addBtn.classList.replace('btn-success', 'btn-warning');
//                console.log("Удалено из корзины:", expertName);
//            } else {
//                // ДОБАВЛЯЕМ
//                const priceText = card.querySelector('.fw-bold.h5').textContent;
//                const expertPrice = parseInt(priceText.replace(/\D/g, ''));

//                cart.push({ name: expertName, price: expertPrice });

//                // Меняем вид на "Выбрано"
//                if (icon) icon.classList.replace('fa-plus', 'fa-check');
//                addBtn.classList.replace('btn-warning', 'btn-success');
//                console.log("Добавлено в корзину:", expertName);
//            }
//            updateCartUI();
//        }

//        // Удаление через кнопку "удалить" в самой корзине
//        const removeBtn = e.target.closest('.remove-btn');
//        if (removeBtn) {
//            const index = removeBtn.getAttribute('data-index');
//            // Находим имя удаляемого товара, чтобы "отжать" кнопку в списке
//            const removedItemName = cart[index].name;

//            cart.splice(index, 1);
//            updateCartUI();

//            // Синхронизируем кнопки в списке: находим кнопку этого эксперта и возвращаем ей вид "плюс"
//            document.querySelectorAll('.expert-card').forEach(card => {
//                if (card.querySelector('h5').textContent === removedItemName) {
//                    const btn = card.querySelector('.add-to-cart-btn');
//                    const icon = btn.querySelector('i');
//                    btn.classList.replace('btn-success', 'btn-warning');
//                    if (icon) icon.classList.replace('fa-check', 'fa-plus');
//                }
//            });
//        }

//        // ==========================================
//        // 2. ВАЛИДАЦИЯ И ОТПРАВКА ЗАЯВКИ
//        // ==========================================
//        const requestBtn = e.target.closest('#send-request-btn');

//        if (requestBtn) {
//            // КРИТИЧНО: Останавливаем перезагрузку страницы сразу!
//            e.preventDefault();

//            const nameInput = document.getElementById('userName');
//            const phoneInput = document.getElementById('userPhone');
//            const serviceSelect = document.getElementById('userService');

//            // 1. Простая валидация
//            const nameValue = nameInput ? nameInput.value.trim() : "";
//            const phoneValue = phoneInput ? phoneInput.value.replace(/\D/g, '') : "";

//            if (nameValue.length < 2) {
//                alert('Пожалуйста, введите ваше имя');
//                if (nameInput) nameInput.focus();
//                return; // Прерываем выполнение, чтобы не скроллило и не отправляло
//            }

//            if (phoneValue.length < 11) {
//                alert('Введите корректный номер телефона (11 цифр)');
//                if (phoneInput) phoneInput.focus();
//                return;
//            }

//            // 2. Если прошли валидацию — отправляем в Метрику
//            if (typeof ym !== 'undefined') {
//                ym(108784033, 'reachGoal', 'lead_success');
//                console.log('Цель lead_success успешно улетела в Метрику');
//            }

//            // 3. Показываем сообщение
//            alert('Спасибо! Ваша заявка принята. Менеджер свяжется с вами в течение 5 минут.');

//            // 4. Очищаем форму и визуально меняем кнопку
//            const contactForm = e.target.closest('form');
//            if (contactForm) {
//                contactForm.reset();
//            }

//            requestBtn.disabled = true;
//            requestBtn.innerText = 'Отправлено ✓';
//            requestBtn.classList.replace('btn-warning', 'btn-secondary');
//        }
//            // Поиск по клику на лупу
//            if (searchBtn) searchBtn.onclick = performSearch;

//            // Поиск по нажатию Enter
//            if (searchInput) {
//                searchInput.onkeypress = (e) => {
//                    if (e.key === 'Enter') performSearch();
//                };
//            }

//            // ОТКРЫТИЕ/ЗАКРЫТИЕ ЧАТА (Больше не закомментировано!)
//            const chatToggleBtn = e.target.closest('#chat-toggle-btn');
//            const chatCloseBtn = e.target.closest('#chat-close-btn');
//            const chatWindow = document.getElementById('chat-window');

//            if (chatToggleBtn && chatWindow) {
//                chatWindow.classList.toggle('d-none');
//            }
//            if (chatCloseBtn && chatWindow) {
//                chatWindow.classList.add('d-none');
//            }

//            // ==========================================
//            // ЛОГИКА ПОИСКА ПО САЙТУ
//            // ==========================================
//            const searchInput = document.getElementById('main-search-input');
//            const searchBtn = document.getElementById('main-search-btn');

//            // Словарь: что ищем -> какой ID вкладки открываем
//            const searchMap = {
//                'вет': '#pills-vet',
//                'врач': '#pills-vet',
//                'передерж': '#pills-home',
//                'отель': '#pills-home',
//                'выгул': '#pills-walk',
//                'погуля': '#pills-walk',
//                'грум': '#pills-grooming',
//                'стриж': '#pills-grooming',
//                'такси': '#pills-taxi',
//                'машин': '#pills-taxi'
//            };

//            function performSearch() {
//                if (!searchInput) return;
//                const query = searchInput.value.toLowerCase().trim();

//                if (query === "") return;

//                let found = false;

//                // Проверяем наш словарь на совпадения
//                for (let key in searchMap) {
//                    if (query.includes(key)) {
//                        const targetTabId = searchMap[key];
//                        const tabTrigger = document.querySelector(`button[data-bs-target="${targetTabId}"]`);

//                        if (tabTrigger) {
//                            // 1. Кликаем по нужной вкладке
//                            tabTrigger.click();
//                            // 2. Скроллим к разделу услуг
//                            document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
//                            found = true;
//                            break;
//                        }
//                    }
//                }

//                if (!found) {
//                    alert("Услуга не найдена. Попробуйте ввести: Ветеринар, Груминг, Выгул или Такси");
//                }
//            }

//        // Остальной ваш код (Чат, Поиск...)
//        // ...
//    });

//    // 4. ОТПРАВКА СООБЩЕНИЙ В ЧАТЕ
//    const chatInput = document.querySelector('#chat-window input');
//    const chatSendBtn = document.querySelector('#chat-window .btn-outline-warning');
//    const chatBody = document.querySelector('.chat-body');

//    function sendMessage() {
//        if (!chatInput || !chatBody) return;
//        const text = chatInput.value.trim();
//        if (text !== "") {
//            chatBody.innerHTML += `
//                <div class="ms-auto bg-warning text-white p-2 rounded-3 shadow-sm mb-2" style="width: 85%;">
//                    <p class="small mb-0">${text}</p>
//                </div>`;
//            chatInput.value = '';
//            chatBody.scrollTop = chatBody.scrollHeight;

//            setTimeout(() => {
//                chatBody.innerHTML += `
//                    <div class="bg-white p-2 rounded-3 shadow-sm mb-2" style="width: 85%;">
//                        <p class="small mb-0">Минутку, сейчас уточню этот вопрос...</p>
//                    </div>`;
//                chatBody.scrollTop = chatBody.scrollHeight;
//            }, 1000);
//        }
//    }

//    if (chatSendBtn) chatSendBtn.onclick = sendMessage;
//    if (chatInput) {
//        chatInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
//    }

//    // 5. КАРТА
//    //if (document.getElementById('map')) {
//    //    const map = L.map('map').setView([58.0104, 56.2294], 12);
//    //    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

//    //    const dogIcon = L.divIcon({
//    //        html: '<i class="fa-solid fa-location-dot text-warning fa-2x"></i>',
//    //        iconSize: [30, 30],
//    //        className: 'custom-div-icon'
//    //    });

//    //    const experts = [
//    //        { lat: 58.003, lon: 56.240, name: "Анастасия" },
//    //        { lat: 58.015, lon: 56.190, name: "Дмитрий" }
//    //    ];

//    //    experts.forEach(exp => {
//    //        L.marker([exp.lat, exp.lon], { icon: dogIcon }).addTo(map).bindPopup(exp.name);
//    //    });
//    //}
//    // 1. Определяем местоположение
//    fetch('https://ipapi.co/json/')
//        .then(response => response.json())
//        .then(data => {
//            const city = data.city || "Москве";
//            const lat = data.latitude || 55.7558;
//            const lon = data.longitude || 37.6173;

//            // Подставляем город в ваш заголовок
//            const citySpan = document.getElementById('user-city');
//            if (citySpan) citySpan.textContent = city;

//            // 2. Ждем загрузки API Яндекс Карт и рисуем карту
//            ymaps.ready(() => {
//                initYandexMap(lat, lon, city);
//            });
//        })
//        .catch(() => {
//            // Если геолокация не сработала — просто грузим Москву
//            ymaps.ready(() => initYandexMap(55.7558, 37.6173, "Москве"));
//        });
//});

//function initYandexMap(lat, lon, cityName) {
//    const myMap = new ymaps.Map("map", {
//        center: [lat, lon],
//        zoom: 12,
//        // Оставляем только нужные элементы: зум и тип карты
//        // Если хотите "пустую" карту — оставьте массив []
//        controls: ['zoomControl', 'typeSelector']
//    }, {
//        // Убираем лишние кнопки и делаем интерфейс чище
//        suppressMapOpenBlock: true // Убирает кнопку "Открыть в Яндекс Картах"
//    });

//    // Добавляем маркер
//    const myPlacemark = new ymaps.Placemark([lat, lon], {
//        balloonContent: `Мы работаем в г. ${cityName}!`
//    }, {
//        preset: 'islands#warningIcon' // Желтый значок под ваш стиль
//    });

//    myMap.geoObjects.add(myPlacemark);

//    // Чтобы карта не "залипала" при скролле страницы
//    myMap.behaviors.disable('scrollZoom');
//}
// Инициализация сессии при загрузке страницы
async function initializeSession() {
    try {
        console.log('Инициализация сессии...');
        
        const response = await fetch('/api/init-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Сессия инициализирована:', data.sessionId);
            
            // Показываем индикатор готовности (опционально)
            showSessionReady();
        } else {
            console.error('Ошибка инициализации сессии');
        }
        
    } catch (error) {
        console.error('Ошибка инициализации:', error);
    }
}

// Показываем что система готова к работе
function showSessionReady() {
    // Можно добавить тонкий индикатор готовности
    console.log('✅ Система готова к диалогу');
}

// Автоинициализация при загрузке страницы
window.addEventListener('load', function() {
    // Небольшая задержка чтобы не мешать основной загрузке
    setTimeout(initializeSession, 1000);
});
// Переменная для защиты от спама
let isMessageSending = false;

// Функция безопасной очистки пользовательского ввода
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\//g, '&#x2F;');
}

// Проверка валидности сообщения
function validateMessage(message) {
    if (message.length > 1000) {
        alert('Сообщение слишком длинное. Максимум 1000 символов.');
        return false;
    }
    
    if (message === '' || message.length < 1) {
        document.getElementById('messageInput').focus();
        return false;
    }
    
    return true;
}
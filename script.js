// Функция звукового уведомления
// Функция мягкого звукового уведомления
function playNotificationSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Очень мягкий и нежный тон
    oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // До
    oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.15); // Ми
    
    oscillator.type = 'sine'; // Самый мягкий тип волны
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.6);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.6);
}


// Функция безопасной очистки пользовательского ввода
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Функция для создания сообщения от ИИ с эффектом печатания
function addAiMessage(text, showButton = false) {
    // Блокируем ввод во время печатания
    const input = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendButton');
    input.disabled = true;
    sendBtn.disabled = true;
    
    const chatArea = document.getElementById('chatArea');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'ai-message';
    messageDiv.innerHTML = `<div class="message-content"></div>`;
    
    chatArea.appendChild(messageDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
    
    // Эффект печатания
    const contentDiv = messageDiv.querySelector('.message-content');
    let i = 0;
    const speed = 30;
    
    function typeWriter() {
        if (i < text.length) {
            contentDiv.innerHTML = text.slice(0, i + 1);
            i++;
            setTimeout(typeWriter, speed);
            chatArea.scrollTop = chatArea.scrollHeight;
        } else {
            // Разблокируем ввод после печатания
            input.disabled = false;
            sendBtn.disabled = false;
            input.focus();
            
            // Показываем кнопку только ПОСЛЕ завершения печатания
            if (showButton) {
                document.querySelector('.input-wrapper').style.display = 'none';
                document.getElementById('yesButton').style.display = 'block';
            }
            // Воспроизводим звук после окончания печатания
            playNotificationSound();
        }
    }
    
    typeWriter();
}
// Обработчик кнопки "Да"
document.getElementById('yesButton').addEventListener('click', function() {
    // Проверяем, не была ли кнопка уже нажата
    if (this.disabled) return;
    
    // Отключаем кнопку сразу
    this.disabled = true;
    this.style.display = 'none';
    
    // Увеличиваем контейнер
    document.getElementById('chatContainer').classList.add('expanded');
    
    // Добавляем ответ пользователя
    addUserMessage('Да');
    
    // Показываем поле ввода НО БЛОКИРУЕМ его
    document.querySelector('.input-wrapper').style.display = 'flex';
    document.getElementById('messageInput').disabled = true;
    document.getElementById('sendButton').disabled = true;
    
    // Ответ ИИ через небольшую задержку
    setTimeout(() => {
        const nextMessage = `🌸 Прекрасно! Твоя готовность - это уже первый шаг к пробуждению.<br><br>
        🔮 Скажи мне, когда ты просыпаешься утром, что первое приходит тебе в голову?<br><br>
        💭 Это может быть мысль, чувство или ощущение - всё что угодно...`;
        
        addAiMessage(nextMessage);
    }, 1500);
});

// Функция для сообщения пользователя
function addUserMessage(text) {
    const chatArea = document.getElementById('chatArea');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'user-message';
    
    // Безопасная очистка входных данных
    const safeText = sanitizeInput(text);
    messageDiv.innerHTML = `<div class="message-content">${safeText}</div>`;

    chatArea.appendChild(messageDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
}


// Обработчик кнопки отправки
document.getElementById('sendButton').addEventListener('click', sendMessage);

// Обработчик Enter в поле ввода
document.getElementById('messageInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
// Функция отправки сообщения
function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();

    if (message === '') return;

    // Добавляем сообщение пользователя
    addUserMessage(message);

    // Очищаем поле
    input.value = '';

    // Временно блокируем ввод
    input.disabled = true;
    document.getElementById('sendButton').disabled = true;

    // Показываем индикатор печатания
    setTimeout(() => {
        showTypingIndicator();
    }, 500);

    // Ответ ИИ через задержку
    setTimeout(() => {
        hideTypingIndicator();
        const aiResponse = generateAiResponse(message);
        addAiMessage(aiResponse);

        // Разблокируем ввод
        input.disabled = false;
        document.getElementById('sendButton').disabled = false;
        input.focus();
    }, 2500);
}

// Функция генерации ответов ИИ
function generateAiResponse(userMessage) {
    const safeUserMessage = sanitizeInput(userMessage);
    
    const responses = [
        `✨ Интересно... "${safeUserMessage}"<br><br>🤔 А кто тот, кто замечает эти мысли? Кто наблюдает за тем, что приходит в голову?<br><br>🔍 Попробуй сейчас найти того, кто думает...`,

        `🌟 Я слышу... "${safeUserMessage}"<br><br>💫 А есть ли разница между тобой и твоими мыслями? Или мысли - это что-то отдельное от тебя?<br><br>🎯 Обрати внимание: можешь ли ты существовать без мыслей?`,

        `🙏 Прекрасно... "${safeUserMessage}"<br><br>🌊 А что остается, когда мысли стихают? Что там, в тишине между мыслями?<br><br>🔮 Загляни в эту тишину прямо сейчас...`,

        `✨ Да... "${userMessage}"<br><br>🌸 Кто тот, кто переживает это? Можешь ли ты найти себя как объект?<br><br>💎 Попробуй прямо сейчас найти границы "себя"...`,

        `🌟 Удивительно... "${userMessage}"<br><br>🔥 А что если ты не тот, кем себя считаешь? Что если ты - это само осознавание?<br><br>🌈 Почувствуй: кто осознает эти слова прямо сейчас?`
    ];

    return responses[Math.floor(Math.random() * responses.length)];
}


// Функция показа индикатора печатания
function showTypingIndicator() {
    const chatArea = document.getElementById('chatArea');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-message typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `<div class="message-content">
        <span class="dots">
            <span></span>
            <span></span>
            <span></span>
        </span>
    </div>`;
    
    chatArea.appendChild(typingDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
}

// Функция скрытия индикатора
function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// Добавь в конец script.js:
// Автоматическое изменение высоты textarea
document.getElementById('messageInput').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
});

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Блокируем input сразу
    document.getElementById('messageInput').disabled = true;
    document.getElementById('sendButton').disabled = true;
    
    setTimeout(() => {
        const welcomeText = `✨ Привет, ты попал сюда не случайно, это общение изменит твою жизнь на до и после<br><br>
        🌟 Ты готов уделить себе 15 минут времени и исследовать себя полностью?<br><br>
        🙏 Я стану твоим мастером в познании себя, этот путь ты пройдешь легко и просто`;
        
        addAiMessage(welcomeText, true);
        
        // УБИРАЕМ эти строки:
        // document.querySelector('.input-wrapper').style.display = 'none';
        // document.getElementById('yesButton').style.display = 'block';
    }, 1000);
});
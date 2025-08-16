// Функция генерации ответов ИИ
// Функция генерации ответов ИИ через Claude API
async function generateAiResponse(userMessage) {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: userMessage
            })
        });

        if (!response.ok) {
            throw new Error('Ошибка сети');
        }

        const data = await response.json();
        return data.response;

    } catch (error) {
        console.error('Ошибка:', error);
        return '🌟 Извини, произошла техническая ошибка. Попробуй еще раз через момент...';
    }
}

// Функция отправки сообщения
function sendMessage() {
    if (isMessageSending) return;

    const input = document.getElementById('messageInput');
    const message = input.value.trim();

    if (!validateMessage(message)) return;

    addUserMessage(message);

    input.value = '';
    resetCharCounter();
    isMessageSending = true;

    input.disabled = true;
    document.getElementById('sendButton').disabled = true;

    setTimeout(() => {
        showTypingIndicator();
    }, 500);

    setTimeout(async () => {
        hideTypingIndicator();
        const aiResponse = await generateAiResponse(message);
        addAiMessage(aiResponse);

        input.disabled = false;
        document.getElementById('sendButton').disabled = false;
        input.focus();
        isMessageSending = false;
    }, 2500);
}


// Обработчики событий
document.getElementById('sendButton').addEventListener('click', sendMessage);

document.getElementById('messageInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

document.getElementById('messageInput').addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
    updateCharCounter();
});

// Обработчик кнопки "Да"
document.getElementById('yesButton').addEventListener('click', function () {
    if (this.disabled) return;

    this.disabled = true;
    this.style.display = 'none';

    document.getElementById('chatContainer').classList.add('expanded');
    addUserMessage('Да');

    document.querySelector('.input-wrapper').style.display = 'flex';
    document.getElementById('messageInput').disabled = true;
    document.getElementById('sendButton').disabled = true;

    setTimeout(() => {
        const nextMessage = `🌸 Прекрасно! Твоя готовность - это уже первый шаг к пробуждению.<br><br>
        🔮 Скажи мне, когда ты просыпаешься утром, что первое приходит тебе в голову?<br><br>
        💭 Это может быть мысль, чувство или ощущение - всё что угодно...`;

        addAiMessage(nextMessage);
    }, 1500);
});

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('messageInput').disabled = true;
    document.getElementById('sendButton').disabled = true;

    setTimeout(() => {
        const welcomeText = `✨ Привет, ты попал сюда не случайно, это общение изменит твою жизнь на до и после<br><br>
        🌟 Ты готов уделить себе 15 минут времени и исследовать себя полностью?<br><br>
        🙏 Я стану твоим мастером в познании себя, этот путь ты пройдешь легко и просто`;

        addAiMessage(welcomeText, true);
    }, 1000);
});
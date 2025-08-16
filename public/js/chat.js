// Функция для сообщения пользователя
function addUserMessage(text) {
    const chatArea = document.getElementById('chatArea');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'user-message';
    
    const safeText = sanitizeInput(text);
    messageDiv.innerHTML = `<div class="message-content">${safeText}</div>`;

    chatArea.appendChild(messageDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
}

// Функция для создания сообщения от ИИ с эффектом печатания
function addAiMessage(text, showButton = false) {
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
            input.disabled = false;
            sendBtn.disabled = false;
            input.focus();
            
            if (showButton) {
                document.querySelector('.input-wrapper').style.display = 'none';
                document.getElementById('yesButton').style.display = 'block';
            }
            playNotificationSound();
        }
    }
    
    typeWriter();
}
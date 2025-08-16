// Функция обновления счетчика символов
function updateCharCounter() {
    const input = document.getElementById('messageInput');
    const counter = document.getElementById('charCounter');
    const length = input.value.length;
    
    counter.textContent = `${length}/1000`;
    counter.className = 'char-counter';
    
    if (length > 800) counter.classList.add('warning');
    if (length > 1000) counter.classList.add('error');
}

// Функция сброса счетчика
function resetCharCounter() {
    const counter = document.getElementById('charCounter');
    counter.textContent = '0/1000';
    counter.className = 'char-counter';
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
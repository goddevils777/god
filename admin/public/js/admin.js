let knowledgeBlocks = [];
let systemPrompt = '';

// Загрузка данных при старте
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setupAutoSave(); // Добавь эту строку
});

// Загрузка сохраненных данных
async function loadData() {
    try {
        const response = await fetch('/api/admin/data');
        if (response.ok) {
            const data = await response.json();
            systemPrompt = data.systemPrompt || '';
            knowledgeBlocks = data.knowledgeBlocks || [];
            
            document.getElementById('systemPrompt').value = systemPrompt;
            renderKnowledgeBlocks();
            updatePreview();
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
    }
}

// Настройка автосохранения для системного промпта
function setupAutoSave() {
    const systemPromptField = document.getElementById('systemPrompt');
    
    systemPromptField.addEventListener('input', function() {
        systemPrompt = this.value;
        updatePreview();
        
        // Автосохранение через 2 секунды
        clearTimeout(window.systemPromptTimer);
        window.systemPromptTimer = setTimeout(() => {
            saveData();
        }, 2000);
    });
}

// Сохранение системного промпта
// Сохранение системного промпта
async function saveSystemPrompt() {
    const button = event.target;
    button.disabled = true;
    button.textContent = 'Сохраняем...';
    
    systemPrompt = document.getElementById('systemPrompt').value;
    const success = await saveData();
    
    if (success) {
        updatePreview();
        button.textContent = 'Сохранено!';
        button.style.background = '#27ae60';
        setTimeout(() => {
            button.textContent = 'Сохранить системный промпт';
            button.style.background = '#3498db';
            button.disabled = false;
        }, 2000);
    } else {
        button.textContent = 'Ошибка!';
        button.style.background = '#e74c3c';
        setTimeout(() => {
            button.textContent = 'Сохранить системный промпт';
            button.style.background = '#3498db';
            button.disabled = false;
        }, 2000);
    }
}

// Добавление нового блока знаний
function addKnowledgeBlock() {
    const newBlock = {
        id: Date.now(),
        title: '',
        content: ''
    };
    knowledgeBlocks.push(newBlock);
    renderKnowledgeBlocks();
}

// Отрисовка блоков знаний
function renderKnowledgeBlocks() {
    const container = document.getElementById('knowledgeBlocks');
    container.innerHTML = '';
    
    knowledgeBlocks.forEach(block => {
        const blockDiv = document.createElement('div');
        blockDiv.className = 'knowledge-block';
        blockDiv.innerHTML = `
            <input type="text" placeholder="Название блока..." value="${block.title}" 
                   onchange="updateBlockTitle(${block.id}, this.value)">
            <textarea placeholder="Содержание блока знаний..." 
                      onchange="updateBlockContent(${block.id}, this.value)">${block.content}</textarea>
            <button onclick="deleteBlock(${block.id})" class="delete-btn">Удалить блок</button>
        `;
        container.appendChild(blockDiv);
    });
}

// Обновление заголовка блока
// Обновление заголовка блока с автосохранением
function updateBlockTitle(id, title) {
    const block = knowledgeBlocks.find(b => b.id === id);
    if (block) {
        block.title = title;
        updatePreview();
        // Автосохранение через 2 секунды после изменения
        clearTimeout(window.autoSaveTimer);
        window.autoSaveTimer = setTimeout(() => {
            saveData();
        }, 2000);
    }
}

// Обновление содержимого блока с автосохранением
function updateBlockContent(id, content) {
    const block = knowledgeBlocks.find(b => b.id === id);
    if (block) {
        block.content = content;
        updatePreview();
        // Автосохранение через 2 секунды после изменения
        clearTimeout(window.autoSaveTimer);
        window.autoSaveTimer = setTimeout(() => {
            saveData();
        }, 2000);
    }
}

// Удаление блока
function deleteBlock(id) {
    if (confirm('Удалить этот блок?')) {
        knowledgeBlocks = knowledgeBlocks.filter(b => b.id !== id);
        renderKnowledgeBlocks();
        updatePreview();
    }
}

// Обновление превью итогового промпта
function updatePreview() {
    let finalPrompt = systemPrompt + '\n\nМАТЕРИАЛЫ МАСТЕРА:\n\n';
    
    knowledgeBlocks.forEach(block => {
        if (block.content.trim()) {
            finalPrompt += `=== ${block.title || 'Блок знаний'} ===\n`;
            finalPrompt += block.content + '\n\n';
        }
    });
    
    document.getElementById('finalPrompt').textContent = finalPrompt;
}

// Сохранение всех данных
// Сохранение всех данных с обратной связью
async function saveData() {
    try {
        const response = await fetch('/api/admin/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                systemPrompt: document.getElementById('systemPrompt').value,
                knowledgeBlocks: knowledgeBlocks
            })
        });
        
        if (!response.ok) {
            throw new Error('Ошибка сохранения');
        }
        
        return true;
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка сохранения данных');
        return false;
    }
}

// Применение изменений (обновление промпта в основном чате)
// Применение изменений (обновление промпта в основном чате)
async function applyChanges() {
    const button = event.target;
    button.disabled = true;
    button.textContent = 'Применяем изменения...';
    
    // Сохраняем все текущие данные
    systemPrompt = document.getElementById('systemPrompt').value;
    
    // Собираем данные из всех полей
    const blocks = document.querySelectorAll('.knowledge-block');
    blocks.forEach((blockDiv, index) => {
        const titleInput = blockDiv.querySelector('input');
        const contentTextarea = blockDiv.querySelector('textarea');
        
        if (knowledgeBlocks[index]) {
            knowledgeBlocks[index].title = titleInput.value;
            knowledgeBlocks[index].content = contentTextarea.value;
        }
    });
    
    const success = await saveData();
    
    if (success) {
        updatePreview();
        button.textContent = 'Изменения применены!';
        button.style.background = '#27ae60';
        setTimeout(() => {
            button.textContent = 'Применить изменения';
            button.style.background = '#3498db';
            button.disabled = false;
        }, 3000);
    } else {
        button.textContent = 'Ошибка применения!';
        button.style.background = '#e74c3c';
        setTimeout(() => {
            button.textContent = 'Применить изменения';
            button.style.background = '#3498db';
            button.disabled = false;
        }, 3000);
    }
}
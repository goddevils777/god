const express = require('express');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs').promises;
const { ADMIN_HASH, ADMIN_PASSWORD } = require('./admin/config');
require('dotenv').config();

// Добавь эти строки:
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');

// Хранилище сессий (в продакшене лучше Redis)
const userSessions = new Map();


const app = express();
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Функция загрузки системного промпта из админки
async function getSystemPrompt() {
    try {
        const data = await fs.readFile('admin/data.json', 'utf8');
        const adminData = JSON.parse(data);
        
        let fullPrompt = adminData.systemPrompt || 'Ты мудрый духовный наставник.';
        
        if (adminData.knowledgeBlocks && adminData.knowledgeBlocks.length > 0) {
            fullPrompt += '\n\nМАТЕРИАЛЫ МАСТЕРА:\n\n';
            adminData.knowledgeBlocks.forEach(block => {
                if (block.content.trim()) {
                    fullPrompt += `=== ${block.title || 'Блок знаний'} ===\n`;
                    fullPrompt += block.content + '\n\n';
                }
            });
        }
        
        return fullPrompt;
    } catch (error) {
        return 'Ты мудрый духовный наставник, помогающий людям познать себя.';
    }
}

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Настройка сессий
app.use(session({
    secret: process.env.SESSION_SECRET || 'spiritual-chat-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false, // true только для HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 часа
    }
}));

// API для инициализации сессии с промптом
app.post('/api/init-session', async (req, res) => {
    try {
        const sessionId = req.session.id;
        
        // Загружаем системный промпт с базой знаний
        const systemPrompt = await getSystemPrompt();
        
        // Создаем начальную сессию с промптом
        const sessionData = {
            id: sessionId,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                }
            ],
            initialized: true,
            createdAt: new Date()
        };
        
        // Сохраняем в память
        userSessions.set(sessionId, sessionData);
        
        console.log(`Сессия ${sessionId} инициализирована с промптом`);
        
        res.json({ 
            success: true, 
            sessionId: sessionId,
            message: 'Сессия готова к работе'
        });
        
    } catch (error) {
        console.error('Ошибка инициализации сессии:', error);
        res.status(500).json({ 
            error: 'Ошибка инициализации' 
        });
    }
});
// API endpoint для чата с поддержкой сессий
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const sessionId = req.session.id;
        
        // Получаем или создаем сессию
        let sessionData = userSessions.get(sessionId);
        
        if (!sessionData) {
            // Если сессия не найдена, создаем новую
            const systemPrompt = await getSystemPrompt();
            sessionData = {
                id: sessionId,
                messages: [{ role: 'system', content: systemPrompt }],
                initialized: true,
                createdAt: new Date()
            };
            userSessions.set(sessionId, sessionData);
        }
        
        // Добавляем сообщение пользователя
        sessionData.messages.push({
            role: 'user',
            content: message
        });
        
        // Отправляем всю историю диалога в Claude
        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 300,
            messages: sessionData.messages.slice(1) // убираем system message
        });
        
        const aiResponse = response.content[0].text;
        
        // Сохраняем ответ ИИ в историю
        sessionData.messages.push({
            role: 'assistant',
            content: aiResponse
        });
        
        // Обновляем сессию
        userSessions.set(sessionId, sessionData);
        
        res.json({ 
            response: aiResponse 
        });

    } catch (error) {
        console.error('Ошибка Claude API:', error);
        res.status(500).json({ 
            error: 'Ошибка сервера' 
        });
    }
});

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Роут для админ-страницы
app.get(`/admin/${ADMIN_HASH}`, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin/public/index.html'));
});

// Статические файлы админки
// Статические файлы админки (CSS, JS)
app.use('/admin', express.static('admin/public'));

// API для загрузки данных админки
app.get('/api/admin/data', async (req, res) => {
    try {
        const data = await fs.readFile('admin/data.json', 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.json({ systemPrompt: '', knowledgeBlocks: [] });
    }
});

// API для сохранения данных админки
app.post('/api/admin/save', async (req, res) => {
    try {
        await fs.writeFile('admin/data.json', JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сохранения' });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
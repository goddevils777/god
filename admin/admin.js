const crypto = require('crypto');

// Генерируем уникальный хеш для админ-ссылки
function generateAdminHash() {
    return crypto.randomBytes(16).toString('hex');
}

module.exports = {
    ADMIN_HASH,
    ADMIN_PASSWORD
};
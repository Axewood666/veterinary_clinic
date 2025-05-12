/**
 * Возвращает случайное целое число в заданном диапазоне (включительно)
 * @param {number} min - Минимальное значение
 * @param {number} max - Максимальное значение
 * @returns {number} Случайное целое число
 */
exports.getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Форматирует дату в строку формата YYYY-MM-DD
 * @param {Date} date - Объект даты
 * @returns {string} Отформатированная строка даты
 */
exports.formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Форматирует время в строку формата HH:MM
 * @param {Date} date - Объект даты
 * @returns {string} Отформатированная строка времени
 */
exports.formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

/**
 * Валидирует строку электронной почты
 * @param {string} email - Строка электронной почты
 * @returns {boolean} true, если строка является корректным email
 */
exports.validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Валидирует номер телефона
 * @param {string} phone - Строка с номером телефона
 * @returns {boolean} true, если строка является корректным номером телефона
 */
exports.validatePhone = (phone) => {
    const phoneRegex = /^\+?\d{10,15}$/;
    return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
};

/**
 * Обрезает текст, если он превышает заданную длину
 * @param {string} text - Исходный текст
 * @param {number} maxLength - Максимальная длина
 * @returns {string} Обрезанный текст с многоточием или исходный текст
 */
exports.truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + '...';
};

/**
 * Генерирует случайный строковый идентификатор
 * @param {number} length - Длина идентификатора
 * @returns {string} Случайный идентификатор
 */
exports.generateRandomId = (length = 10) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}; 
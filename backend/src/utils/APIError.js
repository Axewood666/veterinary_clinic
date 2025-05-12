/**
 * Класс для обработки ошибок API
 * Позволяет создавать стандартизированные ошибки с нужными статусами HTTP
 */
class APIError extends Error {
    /**
     * Создает новый экземпляр API ошибки
     * @param {string} message - Сообщение об ошибке
     * @param {number} statusCode - HTTP статус-код (по умолчанию 500)
     * @param {object} data - Дополнительные данные для логирования
     */
    constructor(message, statusCode = 500, data = {}) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.data = data;
        this.date = new Date();

        // Сохраняем стек вызовов для отладки
        Error.captureStackTrace(this, this.constructor);
    }

    /**
     * Создает ошибку Not Found (404)
     * @param {string} message - Сообщение об ошибке
     * @param {object} data - Дополнительные данные
     * @returns {APIError} Экземпляр ошибки
     */
    static notFound(message = 'Ресурс не найден', data = {}) {
        return new APIError(message, 404, data);
    }

    /**
     * Создает ошибку Bad Request (400)
     * @param {string} message - Сообщение об ошибке
     * @param {object} data - Дополнительные данные
     * @returns {APIError} Экземпляр ошибки
     */
    static badRequest(message = 'Неверный запрос', data = {}) {
        return new APIError(message, 400, data);
    }

    /**
     * Создает ошибку Unauthorized (401)
     * @param {string} message - Сообщение об ошибке
     * @param {object} data - Дополнительные данные
     * @returns {APIError} Экземпляр ошибки
     */
    static unauthorized(message = 'Требуется авторизация', data = {}) {
        return new APIError(message, 401, data);
    }

    /**
     * Создает ошибку Forbidden (403)
     * @param {string} message - Сообщение об ошибке
     * @param {object} data - Дополнительные данные
     * @returns {APIError} Экземпляр ошибки
     */
    static forbidden(message = 'Доступ запрещен', data = {}) {
        return new APIError(message, 403, data);
    }

    /**
     * Создает ошибку Validation Failed (422)
     * @param {string} message - Сообщение об ошибке
     * @param {object} data - Дополнительные данные (например, ошибки валидации)
     * @returns {APIError} Экземпляр ошибки
     */
    static validationFailed(message = 'Ошибка валидации', data = {}) {
        return new APIError(message, 422, data);
    }

    /**
     * Создает ошибку Internal Server Error (500)
     * @param {string} message - Сообщение об ошибке
     * @param {object} data - Дополнительные данные
     * @returns {APIError} Экземпляр ошибки
     */
    static internal(message = 'Внутренняя ошибка сервера', data = {}) {
        return new APIError(message, 500, data);
    }
}

module.exports = APIError; 
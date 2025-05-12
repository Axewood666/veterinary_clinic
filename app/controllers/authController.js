const db = require('../config/database');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Рендер страницы входа
 */
exports.renderLogin = (req, res) => {
    // Если пользователь уже вошел, перенаправляем на главную
    if (res.locals.isAuthenticated) {
        return res.redirect('/');
    }

    // Получаем URL для перенаправления после входа
    const redirect = req.query.redirect || '/';

    res.render('pages/auth/login', {
        title: 'Вход в систему',
        redirect
    });
};

/**
 * Обработка входа пользователя
 */
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await db('users').where('username', username).first();
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const activeBan = await db('user_bans').where('userid', user.userid).first();
        if (activeBan) {
            return res.status(403).json({ message: `You was banned. Reason: ${activeBan.reason}` });
        }

        const token = jwt.sign({ username: user.username, role: user.role, userid: user.userid }, process.env.JWT_SECRET, { expiresIn: '12h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 12 * 60 * 60 * 1000
        });

        return res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Выход из системы
 */
exports.logout = async (req, res) => {
    try {
        // Очищаем куки
        res.clearCookie('token');

        res.redirect('/');
    } catch (err) {
        logger.error(`Ошибка при выходе: ${err.message}`);
        res.redirect('/');
    }
};

/**
 * Рендер страницы восстановления пароля
 */
exports.renderForgotPassword = (req, res) => {
    res.render('auth/forgot-password', {
        title: 'Восстановление пароля'
    });
};

/**
 * Обработка запроса на восстановление пароля
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Поиск пользователя
        const user = await db('users')
            .where('email', email)
            .first();

        // Если пользователь не найден, все равно показываем сообщение об успехе
        // для предотвращения утечки информации о наличии email в базе
        if (!user) {
            res.addSuccess('На указанный email отправлены инструкции по восстановлению пароля');
            return res.render('auth/forgot-password', {
                title: 'Восстановление пароля'
            });
        }

        // Генерируем токен для сброса пароля
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date();
        resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Токен действителен 1 час

        // Сохраняем токен в БД
        await db('users')
            .where('id', user.id)
            .update({
                reset_token: resetToken,
                reset_token_expiry: resetTokenExpiry
            });

        // В реальном приложении здесь нужно отправить email
        // Для демонстрации просто вернем успешный результат

        logger.info(`Сгенерирован токен сброса пароля для ${email}: ${resetToken}`);

        res.addSuccess('На указанный email отправлены инструкции по восстановлению пароля');
        res.render('auth/forgot-password', {
            title: 'Восстановление пароля'
        });
    } catch (err) {
        logger.error(`Ошибка при запросе восстановления пароля: ${err.message}`);
        res.addError('Произошла ошибка при обработке запроса');
        res.render('auth/forgot-password', {
            title: 'Восстановление пароля',
            email: req.body.email
        });
    }
};

/**
 * Рендер страницы сброса пароля
 */
exports.renderResetPassword = async (req, res) => {
    try {
        const { token } = req.params;

        // Проверяем существование и валидность токена
        const user = await db('users')
            .where('reset_token', token)
            .where('reset_token_expiry', '>', new Date())
            .first();

        if (!user) {
            res.addError('Недействительный или устаревший токен восстановления пароля');
            return res.redirect('/auth/forgot-password');
        }

        res.render('auth/reset-password', {
            title: 'Установка нового пароля',
            token
        });
    } catch (err) {
        logger.error(`Ошибка при отображении страницы сброса пароля: ${err.message}`);
        res.addError('Произошла ошибка при обработке запроса');
        res.redirect('/auth/forgot-password');
    }
};

/**
 * Обработка сброса пароля
 */
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, password_confirmation } = req.body;

        // Проверяем совпадение паролей
        if (password !== password_confirmation) {
            res.addError('Пароли не совпадают');
            return res.render('auth/reset-password', {
                title: 'Установка нового пароля',
                token
            });
        }

        // Проверяем существование и валидность токена
        const user = await db('users')
            .where('reset_token', token)
            .where('reset_token_expiry', '>', new Date())
            .first();

        if (!user) {
            res.addError('Недействительный или устаревший токен восстановления пароля');
            return res.redirect('/auth/forgot-password');
        }

        // Хешируем новый пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // Обновляем пароль и сбрасываем токен
        await db('users')
            .where('id', user.id)
            .update({
                password: hashedPassword,
                reset_token: null,
                reset_token_expiry: null
            });

        res.addSuccess('Пароль успешно изменен. Теперь вы можете войти в систему.');
        res.redirect('/auth/login');
    } catch (err) {
        logger.error(`Ошибка при сбросе пароля: ${err.message}`);
        res.addError('Произошла ошибка при смене пароля');
        res.render('auth/reset-password', {
            title: 'Установка нового пароля',
            token: req.params.token
        });
    }
};

/**
 * Рендер страницы профиля
 */
exports.renderProfile = (req, res) => {
    res.render('auth/profile', {
        title: 'Мой профиль'
    });
};

/**
 * Обновление профиля пользователя
 */
exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const userId = req.user.id;

        // Проверяем, не занят ли email другим пользователем
        if (email !== req.user.email) {
            const existingUser = await db('users')
                .where('email', email)
                .whereNot('id', userId)
                .first();

            if (existingUser) {
                res.addError('Данный email уже используется');
                return res.render('auth/profile', {
                    title: 'Мой профиль',
                    formData: req.body
                });
            }
        }

        // Обновляем данные пользователя
        await db('users')
            .where('id', userId)
            .update({
                name,
                email,
                updated_at: new Date()
            });

        // Если пользователь - ветеринар, обновляем его данные в таблице vets
        if (req.user.role === 'vet') {
            const vet = await db('vets')
                .where('user_id', userId)
                .first();

            if (vet) {
                await db('vets')
                    .where('id', vet.id)
                    .update({
                        email,
                        updated_at: new Date()
                    });
            }
        }

        res.addSuccess('Профиль успешно обновлен');
        res.render('auth/profile', {
            title: 'Мой профиль'
        });
    } catch (err) {
        logger.error(`Ошибка при обновлении профиля: ${err.message}`);
        res.addError('Произошла ошибка при обновлении профиля');
        res.render('auth/profile', {
            title: 'Мой профиль',
            formData: req.body
        });
    }
};

/**
 * Изменение пароля пользователя
 */
exports.changePassword = async (req, res) => {
    try {
        const { current_password, new_password, password_confirmation } = req.body;
        const userId = req.user.id;

        // Получаем текущий пароль пользователя
        const user = await db('users')
            .select('password')
            .where('id', userId)
            .first();

        // Проверяем текущий пароль
        const isPasswordValid = await bcrypt.compare(current_password, user.password);
        if (!isPasswordValid) {
            res.addError('Текущий пароль указан неверно');
            return res.render('auth/profile', {
                title: 'Мой профиль',
                passwordError: true
            });
        }

        // Проверяем совпадение новых паролей
        if (new_password !== password_confirmation) {
            res.addError('Новые пароли не совпадают');
            return res.render('auth/profile', {
                title: 'Мой профиль',
                passwordError: true
            });
        }

        // Хешируем новый пароль
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Обновляем пароль
        await db('users')
            .where('id', userId)
            .update({
                password: hashedPassword,
                updated_at: new Date()
            });

        res.addSuccess('Пароль успешно изменен');
        res.render('auth/profile', {
            title: 'Мой профиль'
        });
    } catch (err) {
        logger.error(`Ошибка при смене пароля: ${err.message}`);
        res.addError('Произошла ошибка при смене пароля');
        res.render('auth/profile', {
            title: 'Мой профиль',
            passwordError: true
        });
    }
};

/**
 * Рендер страницы регистрации
 */
exports.renderRegister = (req, res) => {
    // Если пользователь уже вошел, перенаправляем на главную
    if (req.user) {
        return res.redirect('/');
    }

    res.render('pages/auth/register', {
        title: 'Регистрация'
    });
};

/**
 * Обработка регистрации пользователя
 */
exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        // Проверка паролей
        if (!email || !username || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Проверка на существование пользователя с таким email
        const existingUserByEmail = await db('users')
            .where('email', email)
            .first();

        if (existingUserByEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Проверка на существование пользователя с таким username
        const existingUserByUsername = await db('users')
            .where('username', username)
            .first();

        if (existingUserByUsername) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создание пользователя
        const user = await db('users').insert({
            email,
            username,
            password: hashedPassword,
            role: 'Client'
        }, 'userid');

        const token = jwt.sign(
            { userid: user.userid, role: 'Client', username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Устанавливаем куки с токеном
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 часа
        });

        // Перенаправление пользователя
        res.redirect('/');

    } catch (err) {
        logger.error(`Ошибка при регистрации: ${err.message}`);
        res.render('pages/auth/register', {
            title: 'Регистрация',
            error: 'Произошла ошибка при регистрации',
            formData: req.body
        });
    }
}; 
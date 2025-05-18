const db = require('../config/database');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendInvitationEmail } = require('../services/mailerService');

/**
 * Рендер страницы входа
 */
exports.renderLogin = (req, res) => {
    // Если пользователь уже вошел, перенаправляем на главную
    if (res.user) {
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
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

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

        const token = jwt.sign({ username: user.username, role: user.role, userid: user.userid }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRE_TIME });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 12 * 60 * 60 * 1000
        });

        return res.json({ token, redirect: req.query.redirect || '/' });
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
        res.clearCookie('token');

        res.redirect('/');
    } catch (err) {
        logger.error(`Ошибка при выходе: ${err.message}`);
        res.redirect('/');
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
        const [created] = await db('users').insert({
            email,
            username,
            password: hashedPassword,
            role: 'Client'
        }).returning('*');

        const token = jwt.sign({ username: created.username, role: created.role, userid: created.userid }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRE_TIME });

        // Устанавливаем куки с токеном
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 часа
        });

        // Перенаправление пользователя
        return res.status(201).json({ redirect: '/' });
    } catch (err) {
        logger.error(`Ошибка при регистрации: ${err.message}`);
        return res.status(400).json({ message: 'Произошла ошибка при регистрации' });
    }
};

exports.sendInvite = async (req, res) => {
    const { email, role } = req.body;

    try {
        const existingInvitation = await db('invitation_tokens').where('email', email).first();
        if (existingInvitation) {
            return res.status(400).json({
                message: `An active invitation for ${email} already exists`
            });
        }

        const existingUser = await db('users').where('email', email).first();
        if (existingUser) {
            return res.status(400).json({
                message: `${email} is already busy`
            });
        }

        const newToken = await db('invitation_tokens').insert({
            email,
            role,
            token: crypto.randomBytes(32).toString('hex'),
            expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24)
        }).returning('*');

        if (!newToken?.length) {
            throw new Error('Failed to create an invitation token');
        }

        try {
            await sendInvitationEmail(email, newToken[0].token);
        } catch (mailError) {
            await db('invitation_tokens').where('token', newToken[0].token).delete();
            return res.status(500).json({
                message: "Error sending the email. Try again."
            });
        }

        return res.status(201).json({
            message: `The invitation has been sent to ${email}`
        });
    } catch (error) {
        console.error('Invite create error:', error);

        if (error.message.includes('duplicate key value')) {
            return res.status(400).json({
                message: "An invitation with such a token already exists. Retry."
            });
        }

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

exports.registerByInvite = async (req, res) => {
    const { username, password, token } = req.body;
    try {
        const invite = await db('invitation_tokens').where('token', token).first();
        if (!invite) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        const existingUsername = await db('users').where('username', username).first();
        if (existingUsername) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const newUser = await db('users').insert({
            username,
            password,
            email: invite.email,
            role: invite.role
        }).returning('*');

        if (!newUser?.length) {
            throw new Error('Failed to register. Please try again later.');
        }

        await db('invitation_tokens').where('token', token).update({ used: true });

        const JWTtoken = jwt.sign({ username: newUser.username, role: newUser.role, userid: newUser.userid }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRE_TIME });

        res.status(201).json({
            username: newUser.username,
            email: newUser.email,
            token: JWTtoken
        });
    } catch (error) {
        res.status(500).json({
            message: "Iternal server error: " + error.message
        });
    }
}

exports.banUser = async (req, res) => {
    const { userid, reason } = req.body;
    if (!userid) {
        return res.status(400).json({ message: 'Userid is required' })
    }
    if (!reason) {
        reason = "Po prikolu"
    }
    try {
        const user = await db('users').where('userid', userid).first();
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        };

        await db('user_bans').insert({
            userid,
            reason,
            banned_by: req.user.userid
        });

        return res.status(200).json({ message: 'User was banned' });
    } catch (error) {
        res.status(500).json({
            message: "Iternal server error: " + error.message
        });
    }
}

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

            return res.redirect('/auth/forgot-password');
        }

        res.render('auth/reset-password', {
            title: 'Установка нового пароля',
            token
        });
    } catch (err) {
        logger.error(`Ошибка при отображении страницы сброса пароля: ${err.message}`);

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

            return res.render('auth/profile', {
                title: 'Мой профиль',
                passwordError: true
            });
        }

        // Проверяем совпадение новых паролей
        if (new_password !== password_confirmation) {

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

        res.render('auth/profile', {
            title: 'Мой профиль',
            passwordError: true
        });
    }
};


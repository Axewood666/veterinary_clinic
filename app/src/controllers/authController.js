const db = require('../db/database');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendInvitationEmail } = require('../services/mailerService');
exports.renderLogin = (req, res) => {
    if (res.user) {
        return res.redirect('/');
    }
    const redirect = req.query.redirect || '/';
    res.render('pages/auth/login', {
        title: 'Вход в систему',
        redirect
    });
};
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
        const token = jwt.sign({ username: user.username, role: user.role, userid: user.userid }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRE_TIME || '12h' });
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
exports.logout = async (req, res) => {
    try {
        res.clearCookie('token');
        res.redirect('/');
    } catch (err) {
        logger.error(`Ошибка при выходе: ${err.message}`);
        res.redirect('/');
    }
};
exports.renderRegister = (req, res) => {
    if (req.user) {
        return res.redirect('/');
    }
    res.render('pages/auth/register', {
        title: 'Регистрация'
    });
};
exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        if (!email || !username || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const existingUserByEmail = await db('users')
            .where('email', email)
            .first();
        if (existingUserByEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        const existingUserByUsername = await db('users')
            .where('username', username)
            .first();
        if (existingUserByUsername) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const [created] = await db('users').insert({
            email,
            username,
            password: hashedPassword,
            role: 'Client'
        }).returning('*');
        const token = jwt.sign({ username: created.username, role: created.role, userid: created.userid }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRE_TIME || '12h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 
        });
        return res.status(201).json({ redirect: '/' });
    } catch (err) {
        logger.error(`Ошибка при регистрации: ${err.message}`);
        return res.status(400).json({ message: 'Произошла ошибка при регистрации' });
    }
};
exports.sendInvite = async (req, res) => {
    const { email, role, name } = req.body;
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
            name,
            token: crypto.randomBytes(32).toString('hex'),
            expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24)
        }).returning('*');
        if (!newToken?.length) {
            throw new Error('Failed to create an invitation token');
        }
        try {
            await sendInvitationEmail(email, newToken[0].token, name);
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
exports.deleteInvite = async (req, res) => {
    const { inviteId } = req.params;
    try {
        await db('invitation_tokens').where('id', inviteId).delete();
        res.status(200).json({ message: 'Invitation deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
}
exports.renderInviteRegister = async (req, res) => {
    const { token } = req.params;
    try {
        const invite = await db('invitation_tokens')
            .whereRaw('token::text = ?', [token])
            .where('used', false)
            .whereRaw('expires_at > NOW()')
            .first();
        if (!invite) {
            return res.render('pages/auth/invite-register', {
                title: 'Регистрация по приглашению',
                tokenError: true
            });
        }
        res.render('pages/auth/invite-register', {
            title: 'Регистрация по приглашению',
            token: token
        });
    } catch (err) {
        logger.error(`Ошибка при отображении формы регистрации по приглашению: ${err.message}`);
        res.render('pages/auth/invite-register', {
            title: 'Регистрация по приглашению',
            error: 'Произошла ошибка. Пожалуйста, попробуйте позже.'
        });
    }
};
exports.getInviteInfo = async (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(400).json({ message: 'Токен не указан' });
    }
    try {
        const invite = await db('invitation_tokens')
            .whereRaw('token::text = ?', [token])
            .where('used', false)
            .whereRaw('expires_at > NOW()')
            .first();
        if (!invite) {
            return res.status(400).json({ message: 'Приглашение недействительно или срок его действия истек' });
        }
        res.json({
            email: invite.email,
            role: invite.role,
            expiresAt: invite.expires_at
        });
    } catch (err) {
        logger.error(`Ошибка при получении информации о приглашении: ${err.message}`);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
exports.registerByInvite = async (req, res) => {
    const { username, password, token } = req.body;
    try {
        const invite = await db('invitation_tokens')
            .whereRaw('token::text = ?', [token])
            .where('used', false)
            .whereRaw('expires_at > NOW()')
            .first();
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
            name: invite.name,
            email: invite.email,
            role: invite.role
        }).returning('*');
        if (!newUser?.length) {
            throw new Error('Failed to register. Please try again later.');
        }
        await db.raw('UPDATE invitation_tokens SET used = true WHERE token = ?', [token]);
        const JWTtoken = jwt.sign({ username: newUser.username, role: newUser.role, userid: newUser.userid }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRE_TIME || '12h' });
        res.cookie('token', JWTtoken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });
        res.status(201).json({
            username: newUser.username,
            email: newUser.email,
            token: JWTtoken,
            role: newUser.role,
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
exports.renderForgotPassword = (req, res) => {
    res.render('auth/forgot-password', {
        title: 'Восстановление пароля'
    });
};
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await db('users')
            .where('email', email)
            .first();
        if (!user) {
            res.addSuccess('На указанный email отправлены инструкции по восстановлению пароля');
            return res.render('auth/forgot-password', {
                title: 'Восстановление пароля'
            });
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date();
        resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); 
        await db('users')
            .where('id', user.id)
            .update({
                reset_token: resetToken,
                reset_token_expiry: resetTokenExpiry
            });
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
exports.renderResetPassword = async (req, res) => {
    try {
        const { token } = req.params;
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
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, password_confirmation } = req.body;
        if (password !== password_confirmation) {
            return res.render('auth/reset-password', {
                title: 'Установка нового пароля',
                token
            });
        }
        const user = await db('users')
            .where('reset_token', token)
            .where('reset_token_expiry', '>', new Date())
            .first();
        if (!user) {
            return res.redirect('/auth/forgot-password');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
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
exports.renderProfile = (req, res) => {
    res.render('auth/profile', {
        title: 'Мой профиль'
    });
};
exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const userId = req.user.id;
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
        await db('users')
            .where('id', userId)
            .update({
                name,
                email,
                updated_at: new Date()
            });
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
exports.changePassword = async (req, res) => {
    try {
        const { current_password, new_password, password_confirmation } = req.body;
        const userId = req.user.id;
        const user = await db('users')
            .select('password')
            .where('id', userId)
            .first();
        const isPasswordValid = await bcrypt.compare(current_password, user.password);
        if (!isPasswordValid) {
            return res.render('auth/profile', {
                title: 'Мой профиль',
                passwordError: true
            });
        }
        if (new_password !== password_confirmation) {
            return res.render('auth/profile', {
                title: 'Мой профиль',
                passwordError: true
            });
        }
        const hashedPassword = await bcrypt.hash(new_password, 10);
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

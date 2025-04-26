const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

const { Users, invitation_token } = require('../models/');
const { sendInvitationEmail } = require("../services/mailerService");

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET


exports.getUsers = async (res) => {
    try {
        const users = await Users.getAll();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.register = async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const existingUser = await Users.getAll().where({ username }).first();
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const existingEmail = await Users.getAll().where({ email }).first();
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const newUser = await Users.create({
            username,
            password,
            email,
            role: "Client"
        });

        const token = jwt.sign({ username, role, userid: newUser.userid }, JWT_SECRET, { expiresIn: '12h' });

        res.status(201).json({
            username: newUser.username,
            email: newUser.email,
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await Users.getAll().where({ username }).first();
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign({ username: user.username, role: user.role, userid: user.userid }, JWT_SECRET, { expiresIn: '12h' });

        return res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.sendInvite = async (req, res) => {
    const { email, role } = req.body;

    try {
        const existingInvitation = await invitation_token.getExistingInventationByEmail(email);
        if (existingInvitation) {
            return res.status(400).json({
                message: `Активное приглашение для ${email} уже существует`
            });
        }

        const existingUser = await Users.getAll().where({ email }).first();
        if (existingUser) {
            return res.status(400).json({
                message: `${email} уже занят`
            });
        }

        const newToken = await invitation_token.create(email, role);
        if (!newToken?.length) {
            throw new Error('Не удалось создать токен приглашения');
        }

        try {
            await sendInvitationEmail(email, newToken[0].token);
        } catch (mailError) {
            await invitation_token.deleteByToken(newToken[0].token);
            return res.status(500).json({
                message: "Ошибка отправки письма. Попробуйте еще раз."
            });
        }

        return res.status(201).json({
            message: `Приглашение на почту ${email} было отправлено`
        });
    } catch (error) {
        console.error('Invite create error:', error);

        if (error.message.includes('duplicate key value')) {
            return res.status(400).json({
                message: "Приглашение с таким токеном уже существует"
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
        const invite = await invitation_token.getByToken(token);
        if (!invite) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        const existingUsername = await Users.getAll().where({ username }).first();
        if (existingUsername) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const newUser = await Users.create({
            username,
            password,
            email: invite.email,
            role: invite.role
        });

        if (!newUser?.length) {
            throw new Error('Не удалось зарегистрироваться. Повторите попытку позднее');
        }

        await invitation_token.updateUsedByToken(token);

        const JWTtoken = jwt.sign({ username: newUser.username, role: newUser.role, userid: newUser.userid }, JWT_SECRET, { expiresIn: '12h' });

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

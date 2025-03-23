const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

const { Users } = require('../models/');

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET


exports.getUsers = async (req, res) => {
    try {
        const users = await Users.getAll();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { username, password, email, role } = req.body;
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
            role
        });

        res.status(201).json({
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

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

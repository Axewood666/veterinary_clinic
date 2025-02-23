// const db = require('../config/db');
const User = require('../models/user');

exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.register = async (req, res) => {
    const { name, email } = req.body;
    try {
        const result = await db.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *', [name, email]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// exports.updateUser = async (req, res) => {
//     const { id } = req.params;
//     const { name, email } = req.body;
//     try {
//         const result = await db.query('UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *', [name, email, id]);
//         res.status(200).json(result.rows[0]);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// exports.deleteUser = async (req, res) => {
//     const { id } = req.params;
//     try {
//         await db.query('DELETE FROM users WHERE id = $1', [id]);
//         res.status(204).send();
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };
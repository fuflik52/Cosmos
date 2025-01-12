const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Подключение к базе данных
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// API для сохранения прогресса
app.post('/api/save', async (req, res) => {
    try {
        const { userId, gameState } = req.body;
        const result = await pool.query(
            'INSERT INTO game_saves (user_id, game_state) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET game_state = $2',
            [userId, gameState]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save game state' });
    }
});

// API для загрузки прогресса
app.get('/api/load/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await pool.query('SELECT game_state FROM game_saves WHERE user_id = $1', [userId]);
        if (result.rows.length > 0) {
            res.json(result.rows[0].game_state);
        } else {
            res.json(null);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load game state' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

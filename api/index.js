const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/api/online', async (req, res) => {
    const { title, original_title, year } = req.query;
    let results = [];

    // Функція для запиту до Ashdi
    async function searchAshdi(query) {
        try {
            const response = await axios.get(`https://ashdi.vip/api/video?title=${encodeURIComponent(query)}`, { timeout: 5000 });
            return Array.isArray(response.data) ? response.data : [];
        } catch (e) { return []; }
    }

    // 1. Пробуємо знайти за назвою ( title )
    let data = await searchAshdi(title);

    // 2. Якщо порожньо, пробуємо за оригінальною назвою (якщо вона є)
    if (data.length === 0 && original_title) {
        data = await searchAshdi(original_title);
    }

    // Форматуємо результат для Лампи
    data.forEach(item => {
        results.push({
            title: item.title || title,
            file: item.file,
            quality: 'HD',
            info: 'ASHDI (UA)'
        });
    });

    res.json(results);
});

module.exports = app;

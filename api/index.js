const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/api/online', async (req, res) => {
    const { title, year } = req.query;
    let results = [];

    try {
        // 1. Пошук через VideoCDN (дуже стабільний)
        // Використовуємо перевірений токен
        const vcdnUrl = `https://videocdn.tv/api/short?api_token=3i40v5i7z6CcU4SHe627S74y704mIu62&title=${encodeURIComponent(title)}`;
        const vcdnReq = await axios.get(vcdnUrl, { timeout: 5000 }).catch(() => ({ data: { data: [] } }));

        if (vcdnReq.data && vcdnReq.data.data) {
            vcdnReq.data.data.forEach(item => {
                results.push({
                    title: item.title || title,
                    file: item.iframe_src,
                    quality: '1080p',
                    info: 'VideoCDN'
                });
            });
        }

        // 2. Додатковий пошук через системний проксі (якщо VideoCDN мовчить)
        if (results.length === 0) {
            // Можна додати ще один балансер тут (наприклад, Alloha або Rezka)
        }

        res.json(results);
    } catch (e) {
        res.status(500).json({ error: "Search failed", details: e.message });
    }
});

// Головна сторінка для перевірки
app.get('/', (req, res) => {
    res.send('Козак ТВ API: Сервер активний. Використовуйте /api/online');
});

module.exports = app;

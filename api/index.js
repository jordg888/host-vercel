const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

// Головна сторінка для перевірки
app.get('/', (req, res) => {
    res.send('Козак ТВ API працює! Використовуйте /api/online?title=Назва');
});

app.get('/api/online', async (req, res) => {
    const { title } = req.query;
    if (!title) return res.status(400).json({ error: "Вкажіть назву фільму" });

    try {
        // Запит до Ashdi
        const ashdi = await axios.get(`https://ashdi.vip/api/video?title=${encodeURIComponent(title)}`, { timeout: 5000 }).catch(() => ({ data: [] }));
        
        // Запит до VideoCDN (заміни токен на свій, якщо цей не працює)
        const vcdn = await axios.get(`https://videocdn.tv/api/short?api_token=3i40v5i7z6CcU4SHe627S74y704mIu62&title=${encodeURIComponent(title)}`, { timeout: 5000 }).catch(() => ({ data: { data: [] } }));

        let results = [];

        // Обробка Ashdi
        if (Array.isArray(ashdi.data)) {
            ashdi.data.forEach(item => {
                results.push({
                    title: item.title,
                    file: item.file,
                    quality: 'HD',
                    info: 'ASHDI (UA)'
                });
            });
        }

        // Обробка VideoCDN
        if (vcdn.data && vcdn.data.data) {
            vcdn.data.data.forEach(item => {
                results.push({
                    title: item.title,
                    file: item.iframe_src,
                    quality: '1080p',
                    info: 'VideoCDN'
                });
            });
        }

        res.json(results);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = app;

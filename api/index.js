const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/api/online', async (req, res) => {
    const { title, year } = req.query;
    let results = [];

    // Список запитів до різних баз
    const sources = [
        // 1. VideoCDN
        axios.get(`https://videocdn.tv/api/short?api_token=3i40v5i7z6CcU4SHe627S74y704mIu62&title=${encodeURIComponent(title)}`, { timeout: 5000 }).catch(() => null),
        
        // 2. Alloha (Часто має те, чого немає в інших)
        axios.get(`https://api.alloha.tv/?token=044417740f9350436d7a71888e5d61&name=${encodeURIComponent(title)}`, { timeout: 5000 }).catch(() => null),
        
        // 3. KinoBase (Український сегмент)
        axios.get(`https://kinobase.org/api/v1/search?title=${encodeURIComponent(title)}`, { timeout: 5000 }).catch(() => null)
    ];

    try {
        const responses = await Promise.all(sources);

        // Обробка VideoCDN
        if (responses[0] && responses[0].data && responses[0].data.data) {
            responses[0].data.data.forEach(item => {
                results.push({ title: item.title, file: item.iframe_src, quality: '1080p', info: 'VCDN' });
            });
        }

        // Обробка Alloha
        if (responses[1] && responses[1].data && responses[1].data.data) {
            results.push({ 
                title: responses[1].data.data.name, 
                file: responses[1].data.data.iframe, 
                quality: 'HD', 
                info: 'ALLOHA' 
            });
        }

        // Обробка KinoBase
        if (responses[2] && responses[2].data) {
            responses[2].data.forEach(item => {
                results.push({ title: item.title, file: item.url, quality: '720p', info: 'KBase' });
            });
        }

        res.json(results);
    } catch (e) {
        res.status(500).json({ error: "Search failed" });
    }
});

app.get('/', (req, res) => { res.send('Kozak Multi-API Online'); });

module.exports = app;

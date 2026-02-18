const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/api/online', async (req, res) => {
    // Отримуємо назву та чистимо її від зайвих пробілів
    let { title } = req.query;
    if (!title) return res.json([]);
    
    title = title.trim();
    let results = [];

    // Набір запитів до різних баз (використовуємо робочі дзеркала)
    const sources = [
        // 1. VideoCDN (через перевірений токен)
        axios.get(`https://videocdn.tv/api/short?api_token=3i40v5i7z6CcU4SHe627S74y704mIu62&title=${encodeURIComponent(title)}`, { timeout: 4000 }).catch(() => null),
        
        // 2. Collaps (дуже потужний балансер)
        axios.get(`https://api.bhcesh.me/api/short?api_token=ed495096-787f-4b0d-9b57-61c1653557e0&title=${encodeURIComponent(title)}`, { timeout: 4000 }).catch(() => null),
        
        // 3. Alloha
        axios.get(`https://api.alloha.tv/?token=044417740f9350436d7a71888e5d61&name=${encodeURIComponent(title)}`, { timeout: 4000 }).catch(() => null)
    ];

    try {
        const responses = await Promise.all(sources);

        // Обробка VideoCDN
        if (responses[0]?.data?.data?.length) {
            responses[0].data.data.forEach(item => {
                results.push({ title: item.title, file: item.iframe_src, quality: '1080p', info: 'VCDN' });
            });
        }

        // Обробка Collaps
        if (responses[1]?.data?.length) {
            responses[1].data.forEach(item => {
                results.push({ title: item.title, file: item.iframe_src, quality: '720p/1080p', info: 'Collaps' });
            });
        }

        // Обробка Alloha
        if (responses[2]?.data?.data?.iframe) {
            results.push({ 
                title: responses[2].data.data.name || title, 
                file: responses[2].data.data.iframe, 
                quality: 'HD', 
                info: 'Alloha' 
            });
        }

        // Видаляємо дублікати за посиланням
        const uniqueResults = results.filter((v, i, a) => a.findIndex(t => (t.file === v.file)) === i);

        res.json(uniqueResults);
    } catch (e) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/', (req, res) => { res.send('Kozak Ultra-API is Online'); });

module.exports = app;

const express = require('express');
const path = require('path');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = 3000;
const API_KEY = 'O8icsYnZwQ'; // Chave da API mantida no servidor

// Configurar CORS
app.use(cors());

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint para busca de vídeos
app.get('/api/search', async (req, res) => {
    const query = req.query.query;
    if (!query) {
        return res.status(400).json({ error: 'Parâmetro "query" é obrigatório.' });
    }

    try {
        const response = await fetch(`https://api.nexfuture.com.br/api/pesquisas/youtube?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
            const errorText = response.status === 403 ? 'Chave de API inválida ou acesso negado.' :
                             response.status === 429 ? 'Limite de requisições excedido.' :
                             `Erro HTTP ${response.status}: ${response.statusText}`;
            throw new Error(errorText);
        }

        const data = await response.json();
        console.log('Resposta da API de busca:', data); // Log para depuração
        if (!data || !data.all || !Array.isArray(data.all)) {
            return res.status(200).json({ results: [], message: 'Nenhum vídeo encontrado ou resposta inválida.' });
        }

        const videos = data.all.filter(item => item.type === 'video' && item.thumbnail && item.title && item.url);
        res.json({ results: videos });
    } catch (error) {
        console.error('Erro na busca:', error.message);
        res.status(500).json({ error: error.message || 'Erro ao buscar vídeos.' });
    }
});
// Endpoint para download de MP3
app.get('/api/download', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) {
        return res.status(400).json({ error: 'Parâmetro "url" é obrigatório.' });
    }

    try {
        const response = await fetch(`https://api.nexfuture.com.br/api/downloads/youtube/play?query=${q}`);
        const data = await response.json();
        console.log('Resposta da API de download MP3:', data); // Log para depuração
        if (!data || !data.download || !data.download.downloadLink) {
            throw new Error('Link de download não disponível.');
        }

        res.json({
            downloadLink: data.download.downloadLink,
            filename: data.download.filename || 'nebby_music.mp3'
        });
    } catch (error) {
        console.error('Erro no download MP3:', error.message);
        res.status(500).json({ error: error.message || 'Erro ao gerar link de download MP3.' });
    }
});

// Endpoint para download de MP4
app.get('/api/download/mp4', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) {
        return res.status(400).json({ error: 'Parâmetro "url" é obrigatório.' });
    }

    try {
        const apiResponse = await fetch(`https://https://api.nexfuture.com.br/api/downloads/youtube/mp4?url=${q}`);
        // Configurar cabeçalhos para download
        const filename = `redtube_video_${Date.now()}.mp4`;
        res.setHeader('Content-Type', apiResponse.headers.get('content-type') || 'video/mp4');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Encaminhar o fluxo de dados
        apiResponse.body.pipe(res);
    } catch (error) {
        console.error('Erro no download MP4:', error.message);
        res.status(500).json({ error: error.message || 'Erro ao gerar link de download MP4.' });
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

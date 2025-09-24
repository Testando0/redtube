// Importação dos módulos necessários
const express = require('express');
const path = require('path');
const cors = require('cors');
// Usamos a versão 2 do node-fetch para compatibilidade com require()
const fetch = require('node-fetch');

// Inicialização do aplicativo Express
const app = express();
const port = 3000; // Porta onde o servidor irá rodar

// --- Middlewares ---
// Habilita o CORS para permitir requisições de outras origens (ex: seu front-end)
app.use(cors());
// Serve arquivos estáticos (como HTML, CSS, JS do front-end) da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));


// --- Endpoints da API ---

/**
 * Endpoint para buscar vídeos no YouTube.
 * Exemplo de uso: /api/search?query=musica
 */
app.get('/api/search', async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'O parâmetro "query" é obrigatório.' });
    }

    // Monta a URL da API, agora sem a chave de API
    const apiUrl = `https://api.nexfuture.com.br/api/pesquisas/youtube?query=${encodeURIComponent(query)}`;

    try {
        console.log(`Buscando por: ${query}`);
        const response = await fetch(apiUrl);

        if (!response.ok) {
            const errorText = `Erro na API externa: ${response.status} ${response.statusText}`;
            throw new Error(errorText);
        }

        const data = await response.json();
        
        // Valida o formato da resposta da API
        if (!data || !data.all || !Array.isArray(data.all)) {
            return res.status(200).json({ results: [], message: 'Nenhum vídeo encontrado ou formato de resposta inesperado.' });
        }
        
        // Filtra para retornar apenas itens que são vídeos e possuem os dados necessários
        const videos = data.all.filter(item => item.type === 'video' && item.thumbnail && item.title && item.url);
        res.json({ results: videos });

    } catch (error) {
        console.error('Erro detalhado na busca:', error);
        res.status(500).json({ error: error.message || 'Ocorreu um erro interno ao buscar os vídeos.' });
    }
});

/**
 * Endpoint para obter o link de download de um áudio (MP3).
 * Exemplo de uso: /api/download?url=https://www.youtube.com/watch?v=...
 */
app.get('/api/download', async (req, res) => {
    // Renomeia 'url' para 'videoUrl' para maior clareza
    const { url: videoUrl } = req.query;

    if (!videoUrl) {
        return res.status(400).json({ error: 'O parâmetro "url" é obrigatório.' });
    }

    // URL da API sem a chave de API
    const apiUrl = `https://api.nexfuture.com.br/api/downloads/youtube/play?url=${encodeURIComponent(videoUrl)}`;

    try {
        console.log(`Obtendo link de download MP3 para: ${videoUrl}`);
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!response.ok || !data.download || !data.download.downloadLink) {
            throw new Error(data.message || 'Link de download não disponível ou URL inválida.');
        }

        res.json({
            downloadLink: data.download.downloadLink,
            filename: data.download.filename || 'audio.mp3'
        });

    } catch (error) {
        console.error('Erro detalhado no download MP3:', error);
        res.status(500).json({ error: error.message || 'Ocorreu um erro ao gerar o link de download MP3.' });
    }
});

/**
 * Endpoint para fazer o download direto de um vídeo (MP4).
 * Este endpoint atua como um proxy, repassando o vídeo para o cliente.
 * Exemplo de uso: /api/download/mp4?url=https://www.youtube.com/watch?v=...
 */
app.get('/api/download/mp4', async (req, res) => {
    const { url: videoUrl } = req.query;

    if (!videoUrl) {
        return res.status(400).json({ error: 'O parâmetro "url" é obrigatório.' });
    }

    // URL da API sem a chave de API e com a correção do https:// duplicado
    const apiUrl = `https://api.nexfuture.com.br/api/downloads/youtube/mp4?url=${encodeURIComponent(videoUrl)}`;
    
    try {
        console.log(`Iniciando stream de download MP4 para: ${videoUrl}`);
        const apiResponse = await fetch(apiUrl);

        if (!apiResponse.ok) {
            throw new Error(`Erro ao buscar o vídeo na API externa: ${apiResponse.status} ${apiResponse.statusText}`);
        }

        // Configura os cabeçalhos para o cliente para forçar o download
        const filename = `video_${Date.now()}.mp4`;
        res.setHeader('Content-Type', apiResponse.headers.get('content-type') || 'video/mp4');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', apiResponse.headers.get('content-length'));

        // Repassa o corpo da resposta (o vídeo) diretamente para o cliente
        apiResponse.body.pipe(res);

    } catch (error) {
        console.error('Erro detalhado no download MP4:', error);
        // Garante que a resposta de erro só seja enviada se o stream não tiver começado
        if (!res.headersSent) {
            res.status(500).json({ error: error.message || 'Ocorreu um erro ao processar o download do MP4.' });
        }
    }
});


// --- Inicialização do Servidor ---
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log('API proxy configurada para interagir com api.nexfuture.com.br');
});


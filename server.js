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
router.get('/api/download', async (req, res) => {
    const { query } = req; // O nome da música será passado como parâmetro de consulta
    const musicName = query.name; // Exemplo: /play?nome=nome_da_musica

    if (!musicName) {
        return res.status(400).json({ error: 'Nome da música é obrigatório' });
    }

    try {
        // Montar a URL da API com o nome da música
        const apiUrl = `https://api.nexfuture.com.br/api/downloads/youtube/play?query=${encodeURIComponent(musicName)}`;
        
        // Fazer a requisição para a API
        const response = await axios.get(apiUrl);

        if (response.data.status && response.data.resultado && response.data.resultado.audio) {
            const audioUrl = response.data.resultado.audio;

            // Redirecionar para o link do áudio
            return res.redirect(audioUrl);
        } else {
            return res.status(404).json({ error: 'Áudio não encontrado' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao processar a solicitação' });
    }
});
    

// Endpoint para download de MP4
router.get('/api/download/mp4', async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'Parâmetro "query" não fornecido' });

  try {
    const endpoint = `https://api.nexfuture.com.br/api/downloads/youtube/playvideo/v2?query=${encodeURIComponent(query)}`;
    const response = await axios.get(endpoint);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar vídeo do YouTube', details: err.message });
  }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

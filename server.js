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
    const { query } = req;

    if (!name) {
        return res.status(400).json({status: false, message: "cade o parametro nome?"})
    }
        var response = await fetch(`https://api.nexfuture.com.br/api/pesquisas/youtube?query=${encodeURIComponent(name)}`);

        var texto = response

        res.json({ 
            Criador: "Dantes",
            Provedor: "Nex Carisys",
            resultad: texto
        })
    } catch (error) {
        console.error("Error ao porcessar api")
        res.status(500).json({status: false, erro: "Erro ao tentar achar o nome.... entre em contato com o meu dono!!"})
    }
})

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

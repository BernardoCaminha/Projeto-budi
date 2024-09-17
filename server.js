const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const moment = require('moment');

const app = express();
const port = 3000;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Delicias_Budi',
  password: '1234',
  port: 5432,
});

app.use(express.static('public'));
app.use(bodyParser.json());

// Rota para buscar todos os itens de pronta entrega
app.get('/api/pronta_entrega', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pronta_entrega');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar pronta entrega:', err);
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

// Rota para buscar todos os materiais em estoque
app.get('/api/estoque_materiais', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM estoque_materiais');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar estoque de materiais:', err);
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

// Rota para buscar todos os pedidos de clientes
app.get('/api/pedidos_clientes', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nome_cliente, telefone, descricao_pedido, preco, prazo_entrega FROM pedidos_clientes');
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao buscar pedidos:', err);
        res.status(500).json({ error: 'Erro ao buscar dados' });
    }
});

// Adicionar item à pronta entrega
app.post('/api/pronta_entrega', async (req, res) => {
  try {
    const { nome, quantidade, preco } = req.body;
    const result = await pool.query(
      'INSERT INTO pronta_entrega (nome, quantidade, preco) VALUES ($1, $2, $3) RETURNING *',
      [nome, quantidade, preco]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao adicionar produto' });
  }
});

// Remover item da pronta entrega
app.delete('/api/pronta_entrega/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM pronta_entrega WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json({ message: 'Produto removido com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover produto' });
  }
});

// Adicionar material ao estoque
app.post('/api/estoque_materiais', async (req, res) => {
  try {
    const { nome, quantidade } = req.body;
    const result = await pool.query(
      'INSERT INTO estoque_materiais (nome, quantidade) VALUES ($1, $2) RETURNING *',
      [nome, quantidade]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao adicionar material' });
  }
});

// Remover material do estoque
app.delete('/api/estoque_materiais/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM estoque_materiais WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Material não encontrado' });
    }
    res.json({ message: 'Material removido com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover material' });
  }
});

// Adicionar pedido
app.post('/api/pedidos_clientes', async (req, res) => {
    try {
        const { nome_cliente, telefone, descricao_pedido, preco, prazo_entrega } = req.body;
        
        // Validação do formato da data
        if (!/^\d{4}-\d{2}-\d{2}$/.test(prazo_entrega)) {
            return res.status(400).json({ error: 'Formato de data inválido. Use YYYY-MM-DD.' });
        }

        const result = await pool.query(
            'INSERT INTO pedidos_clientes (nome_cliente, telefone, descricao_pedido, preco, prazo_entrega) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [nome_cliente, telefone, descricao_pedido, preco, prazo_entrega]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao adicionar pedido:', err);
        res.status(500).json({ error: 'Erro ao adicionar pedido' });
    }
});

// Remover pedido
app.delete('/api/pedidos_clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM pedidos_clientes WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    res.json({ message: 'Pedido removido com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover pedido' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
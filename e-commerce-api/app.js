const express = require('express'); 
const app = express();             
const port = 3000;     

const products = require('./data/products');

// Middleware para interpretar JSON no corpo da requisição
app.use(express.json());

// Lista todos os produtos
app.get('/api/products', (req, res) => {
  res.json(products);
}); 

// Consultar produto por id
app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ message: 'Produto não encontrado '});
  }

  res.json(product);
});

// Criar um novo produto
app.post('/api/products', (req, res) => {
  const { name, price, description, category, stock } = req.body;

  if(!name || price === undefined) {
    return res.status(400).json({ message: 'Nome e preço são obrigatórios'});
  }

  const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
  
  const newProduct = {
    id: newId,
    name,
    price,
    description: description || '',
    category: category || 'Outros',
    stock: stock || 0, 
  };

  products.push(newProduct);

  res.status(201).json(newProduct);
});

// Atualizar produto existente
app.put('/api/products/:id', (req, res) =>{
  const id = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === id);

  if(productIndex === -1) {
    return res.status(404).json({ message: 'Produto não encontrado '});
  }

  const { name, price, description, category, stock } = req.body;

  if (
    name === undefined &&
    price === undefined &&
    description === undefined &&
    category === undefined &&
    stock === undefined
  ) {
    return res.status(400).json({ message: 'Nenhum dado para atualizar foi fornecido.' });
  }

  const allowedFields = ['name', 'price', 'description', 'category', 'stock'];
  const updates = req.body;

  allowedFields.forEach(field => {
    if(updates[field] !== undefined) {
      products[productIndex][field] = updates[field];
    }
  });

  res.json(products[productIndex]);
});

// Deletar produto
app.delete('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === id);

  if(productIndex === -1) {
    return res.status(404).json({ message: 'Produto não encontrado '});
  }

  const removedProduct = products.splice(productIndex, 1)[0];

  res.json({ message: 'Produto removido com sucesso ', product: removedProduct });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

// Tratamento global de erros para evitar queda do servidor
process.on('uncaughtException', (err) => {
  console.error('Erro não tratado:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Rejeição não tratada:', reason);
});
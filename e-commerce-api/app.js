const express = require('express'); 
const app = express();             
const port = 3000;     

const products = require('./data/products'); 

// Middleware para interpretar JSON no corpo da requisição
app.use(express.json());

// Simulação do carrinho de compras
let cart = [
  { productId: 5, quantity: 2},
  { productId: 4, quantity: 2},
  { productId: 1, quantity: 2}
]

// Exibição dos produtos contidos no carrinho de compras
app.get('/api/cart', (req, res) => {
  const cartItems = cart.map(cartItem => {
    const product = products.find(p => p.id === cartItem.productId);
    
    if(!product) return null;

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: cartItem.quantity,
      total: cartItem.quantity * product.price
    };
  }).filter(item => item !== null);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.total, 0);

  res.json({
    message: 'Itens no carrinho de compras',
    items: cartItems,
    totalItems,
    totalPrice
  });
});

// Exibição dos produtos adicionados no carrinho de compras
app.post('/api/cart', (req, res) => {
  const { productId, quantity } = req.body;

  // Validação robusta dos tipos
  if (
    typeof productId !== 'number' ||
    typeof quantity !== 'number' ||
    !Number.isInteger(productId) ||
    !Number.isInteger(quantity) ||
    quantity < 1
  ) {
    return res.status(400).json({
      error: 'productId e quantity devem ser números inteiros e quantity deve ser maior que zero.'
    });
  }

  // Verifica se o produto existe
  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Produto não encontrado.' });
  }

  // Verifica se o produto já está no carrinho
  const existingItem = cart.find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }

  res.status(201).json({
    message: 'Produto adicionado ao carrinho com sucesso.',
    cart
  });
});

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

// Atualizar a quantidade de um item no carrinho
app.put('/api/cart/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const { quantity } = req.body;

  // Validação do ID e da quantidade
  if (isNaN(productId) || productId < 1) {
    return res.status(400).json({ error: 'ID do produto inválido.' });
  }

  if (!quantity || isNaN(quantity) || quantity < 1 || !Number.isInteger(quantity)) {
    return res.status(400).json({ error: 'A quantidade deve ser um número inteiro maior que zero.' });
  }

  // Verifica se o produto existe no catálogo
  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Produto não existe no catálogo.' });
  }

  // Verifica se o item está no carrinho
  const item = cart.find(item => item.productId === productId);
  if (!item) {
    return res.status(404).json({ error: 'Produto não encontrado no carrinho.' });
  }

  // Atualiza a quantidade
  item.quantity = quantity;

  // Reconstrói a lista detalhada dos itens no carrinho
  const cartItems = cart.map(cartItem => {
    const prod = products.find(p => p.id === cartItem.productId);
    return {
      id: prod.id,
      name: prod.name,
      price: prod.price,
      quantity: cartItem.quantity,
      total: cartItem.quantity * prod.price
    };
  });

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.total, 0);

  res.json({
    message: 'Quantidade atualizada com sucesso.',
    items: cartItems,
    totalItems,
    totalPrice
  });
});

// Remover um item específico do carrinho pelo productId
app.delete('/api/cart/:id', (req, res) => {
  const productId = parseInt(req.params.id);

  if (isNaN(productId) || productId < 1) {
    return res.status(400).json({ error: 'ID do produto inválido.' });
  }

  const index = cart.findIndex(item => item.productId === productId);

  if (index === -1) {
    return res.status(404).json({ error: 'Produto não encontrado no carrinho.' });
  }

  cart.splice(index, 1);

  // Retorna o carrinho atualizado com detalhes completos
  const cartItems = cart.map(cartItem => {
    const prod = products.find(p => p.id === cartItem.productId);
    return {
      id: prod.id,
      name: prod.name,
      price: prod.price,
      quantity: cartItem.quantity,
      total: cartItem.quantity * prod.price
    };
  });

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.total, 0);

  res.json({
    message: 'Produto removido do carrinho com sucesso.',
    items: cartItems,
    totalItems,
    totalPrice
  });
});

// Esvaziar o carrinho inteiro
app.delete('/api/cart', (req, res) => {
  cart = [];

  res.json({
    message: 'Carrinho esvaziado com sucesso.',
    items: [],
    totalItems: 0,
    totalPrice: 0
  });
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
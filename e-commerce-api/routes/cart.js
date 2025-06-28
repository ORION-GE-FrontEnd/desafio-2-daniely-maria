// Importa o módulo 'express', que é o framework web para construir APIs RESTful.
const express = require('express');
// Cria um objeto Router do Express. Este objeto permite agrupar rotas relacionadas e middleware.
const router = express.Router();

// Importa a lista de produtos de um arquivo de dados local.
// 'products' será a fonte de verdade sobre os produtos disponíveis na loja.
let products = require('../data/products');
// Inicializa o array 'cart' (carrinho de compras) com alguns itens de exemplo.
// Cada item no carrinho tem um 'productId' e uma 'quantity' (quantidade).
let cart = [
  { productId: 5, quantity: 2},
  { productId: 4, quantity: 2},
  { productId: 1, quantity: 2}
];

// --- Endpoint: Exibir Itens no Carrinho (GET /) ---
// Define uma rota GET para a raiz do seu módulo de carrinho.
// Quando uma requisição GET é feita para esta rota (ex: /api/cart), ela retorna o conteúdo do carrinho.
router.get('/', (req, res) => {
  // Mapeia os itens simples do carrinho (productId, quantity) para itens mais detalhados.
  // Para cada item no 'cart', ele busca as informações completas do produto em 'products'.
  const cartItems = cart.map(cartItem => {
    // Encontra o produto correspondente no array 'products' usando o 'productId'.
    const product = products.find(p => p.id === cartItem.productId);

    // Se o produto não for encontrado no catálogo (pode ter sido removido), retorna null.
    if(!product) return null;

    // Retorna um objeto com detalhes do item no carrinho, incluindo nome, preço, quantidade e total por item.
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: cartItem.quantity,
      total: cartItem.quantity * product.price // Calcula o total para este item
    };
  }).filter(item => item !== null); // Filtra quaisquer itens que não foram encontrados no catálogo (nulls).

  // Calcula o número total de itens (unidades) no carrinho.
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  // Calcula o preço total de todos os itens no carrinho.
  const totalPrice = cartItems.reduce((sum, item) => sum + item.total, 0);

  // Envia a resposta JSON com os itens detalhados do carrinho, o total de itens e o preço total.
  res.json({
    message: 'Itens no carrinho de compras',
    items: cartItems,
    totalItems,
    totalPrice
  });
});

// --- Endpoint: Adicionar Produto ao Carrinho (POST /) ---
// Define uma rota POST para a raiz do seu módulo de carrinho.
// Usada para adicionar um novo produto ou aumentar a quantidade de um produto existente no carrinho.
router.post('/', (req, res) => {
  // Extrai 'productId' e 'quantity' do corpo da requisição.
  const { productId, quantity } = req.body;

  // Validação robusta dos tipos e valores dos dados de entrada.
  // Garante que 'productId' e 'quantity' são números inteiros e que 'quantity' é maior que zero.
  if (
    typeof productId !== 'number' ||
    typeof quantity !== 'number' ||
    !Number.isInteger(productId) ||
    !Number.isInteger(quantity) ||
    quantity < 1
  ) {
    // Retorna um erro 400 (Bad Request) se a validação falhar.
    return res.status(400).json({
      error: 'productId e quantity devem ser números inteiros e quantity deve ser maior que zero.'
    });
  }

  // Verifica se o produto com o 'productId' fornecido existe no catálogo.
  const product = products.find(p => p.id === productId);
  if (!product) {
    // Se o produto não for encontrado, retorna um erro 404 (Not Found).
    return res.status(404).json({ error: 'Produto não encontrado.' });
  }

  // Verifica se há estoque suficiente para a quantidade que está sendo adicionada.
  if (product.stock < quantity) {
    // Retorna um erro 400 se o estoque for insuficiente.
    return res.status(400).json({ error: `Estoque insuficiente para ${product.name}. Apenas ${product.stock} em estoque.` });
  }

  // Verifica se o produto já está no carrinho.
  const existingItem = cart.find(item => item.productId === productId);
  if (existingItem) {
    // Se o item já existe, calcula a nova quantidade total no carrinho.
    // Verifica se a adição dessa nova quantidade não excede o estoque disponível.
    if (product.stock < (existingItem.quantity + quantity)) {
      // Retorna um erro 400 se a nova quantidade exceder o estoque.
      return res.status(400).json({ error: `Estoque insuficiente para adicionar mais ${product.name}.` });
    }
    // Se há estoque, incrementa a quantidade do item existente no carrinho.
    existingItem.quantity += quantity;
  } else {
    // Se o produto não está no carrinho, adiciona-o como um novo item.
    cart.push({ productId, quantity });
  }

  // Retorna uma resposta 201 (Created) indicando sucesso.
  // Inclui uma representação detalhada do carrinho atualizado na resposta.
  res.status(201).json({
    message: 'Produto adicionado ao carrinho com sucesso.',
    cart: cart.map(item => { // Mapeia o carrinho para incluir detalhes do produto
      const p = products.find(prod => prod.id === item.productId);
      return { id: p.id, name: p.name, quantity: item.quantity, price: p.price };
    })
  });
});

// --- Endpoint: Atualizar Quantidade de um Item no Carrinho (PUT /:id) ---
// Define uma rota PUT com um parâmetro ':id' (o ID do produto no carrinho).
// Usada para modificar a quantidade de um produto específico no carrinho.
router.put('/:id', (req, res) => {
  // Converte o ID do produto da URL (string) para um número inteiro.
  const productId = parseInt(req.params.id);
  // Extrai a nova 'quantity' (quantidade) do corpo da requisição.
  const { quantity } = req.body;

  // Validação: Garante que 'productId' é um número válido e positivo.
  if (isNaN(productId) || productId < 1) {
    return res.status(400).json({ error: 'ID do produto inválido.' });
  }

  // Validação: Garante que 'quantity' é um número inteiro e não negativo.
  if (quantity === undefined || isNaN(quantity) || !Number.isInteger(quantity) || quantity < 0) {
    return res.status(400).json({ error: 'A quantidade deve ser um número inteiro e não pode ser negativa.' });
  }

  // Verifica se o produto existe no catálogo de produtos (não apenas no carrinho).
  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Produto não existe no catálogo.' });
  }

  // Encontra o índice do item no carrinho.
  const itemIndex = cart.findIndex(item => item.productId === productId);

  // Se o item não for encontrado no carrinho, retorna um erro 404.
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Produto não encontrado no carrinho para atualizar.' });
  }

  // Lógica especial: Se a 'quantity' desejada for 0, o item é removido do carrinho.
  if (quantity === 0) {
    cart.splice(itemIndex, 1); // Remove 1 item a partir do 'itemIndex'.
    return res.status(200).json({ message: 'Produto removido do carrinho com sucesso (quantidade zero).' });
  }

  // Verifica se a nova quantidade solicitada excede o estoque disponível do produto.
  if (product.stock < quantity) {
    // Retorna um erro 400 se não houver estoque suficiente.
    return res.status(400).json({ error: `Estoque insuficiente para a quantidade solicitada de ${product.name}. Disponível: ${product.stock}.` });
  }

  // Se todas as validações passarem, atualiza a quantidade do item no carrinho.
  cart[itemIndex].quantity = quantity;

  // Reconstroi a representação detalhada do carrinho para a resposta. (Mesma lógica da rota GET /)
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

  // Retorna uma resposta JSON com o status de sucesso e os detalhes atualizados do carrinho.
  res.json({
    message: 'Quantidade atualizada com sucesso.',
    items: cartItems,
    totalItems,
    totalPrice
  });
});

// --- Endpoint: Remover um Item Específico do Carrinho (DELETE /:id) ---
// Define uma rota DELETE com um parâmetro ':id' (o ID do produto a ser removido do carrinho).
router.delete('/:id', (req, res) => {
  // Converte o 'productId' da URL para um número inteiro.
  const productId = parseInt(req.params.id);

  // Validação: Garante que 'productId' é um número válido e positivo.
  if (isNaN(productId) || productId < 1) {
    return res.status(400).json({ error: 'ID do produto inválido.' });
  }

  // Encontra o índice do item no carrinho que corresponde ao 'productId'.
  const index = cart.findIndex(item => item.productId === productId);

  // Se o item não for encontrado no carrinho, retorna um erro 404.
  if (index === -1) {
    return res.status(404).json({ error: 'Produto não encontrado no carrinho.' });
  }

  // Remove o item do carrinho usando 'splice'.
  cart.splice(index, 1);

  // Reconstroi a representação detalhada do carrinho para a resposta. (Mesma lógica da rota GET /)
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

  // Retorna uma resposta JSON com a mensagem de sucesso e o carrinho atualizado.
  res.json({
    message: 'Produto removido do carrinho com sucesso.',
    items: cartItems,
    totalItems,
    totalPrice
  });
});

// --- Endpoint: Esvaziar o Carrinho Inteiro (DELETE /) ---
// Define uma rota DELETE para a raiz do seu módulo de carrinho.
// Usada para remover todos os itens do carrinho.
router.delete('/', (req, res) => {
  // Esvazia completamente o array 'cart'.
  cart = [];

  // Retorna uma mensagem de sucesso e um carrinho vazio.
  res.json({
    message: 'Carrinho esvaziado com sucesso.',
    items: [],
    totalItems: 0,
    totalPrice: 0
  });
});

// Exporta o objeto 'router' para que ele possa ser usado no arquivo principal da sua aplicação Express.
module.exports = router;
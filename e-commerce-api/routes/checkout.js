// Importa o módulo 'express', fundamental para construir sua API.
const express = require('express');
// Cria um objeto 'router' do Express para definir rotas específicas.
const router = express.Router();

// Importa a lista de produtos do seu 'banco de dados' em memória.
let products = require('../data/products');
// Importa o carrinho de compras. Note que ele está sendo importado de um arquivo separado.
// Assume-se que 'cart' é um array que armazena os itens que o usuário adicionou.
let cart = require('./cart').cart;
// Inicializa um array vazio para armazenar os pedidos. Este será o "banco de dados" de pedidos em memória.
let orders = [];

// --- Função Geradora de IDs de Pedido ---
// Define uma função para gerar IDs únicos para os novos pedidos.
const generateOrderId = () => {
  // Encontra o maior ID de pedido existente. Se não houver pedidos, começa com 0.
  // 'parseInt(o.orderId) || 0' garante que mesmo que 'orderId' seja uma string ou algo não numérico, ele tenta converter para número ou usa 0.
  const maxId = orders.length > 0
    ? Math.max(...orders.map(o => parseInt(o.orderId) || 0))
    : 0;
  // Retorna o próximo ID como uma string (por exemplo, "1", "2", etc.).
  return (maxId + 1).toString();
};

// --- Rota para Iniciar o Checkout (Criar um Pedido) ---
// Define uma rota POST na raiz ('/'). Esta rota é usada para processar o checkout.
// ENDPOINT: POST / (Ex: /api/orders)
router.post('/', (req, res) => {
  // Extrai o método de pagamento e o endereço do corpo da requisição.
  const { paymentMethod, address } = req.body;

  // Validação: Verifica se o carrinho de compras está vazio.
  if (cart.length === 0) {
    // Se estiver vazio, retorna um erro 400 (Requisição Inválida).
    return res.status(400).json({ error: 'Carrinho de compras vazio. Adicione produtos antes de finalizar.' });
  }

  // Validação: Verifica se o método de pagamento e o endereço foram fornecidos.
  if (!paymentMethod || !address) {
    // Se não, retorna um erro 400.
    return res.status(400).json({ error: 'Método de pagamento e endereço são obrigatórios.' });
  }

  // Inicializa o valor total do pedido.
  let totalAmount = 0;
  // Array para armazenar os itens do pedido (detalhes do produto no momento da compra).
  const orderItems = [];
  // Array para registrar as mudanças de estoque que serão aplicadas após a confirmação do pagamento.
  const stockChanges = [];

  // Itera sobre cada item no carrinho de compras.
  for (const cartItem of cart) {
    // Encontra o produto correspondente no catálogo de produtos.
    const product = products.find(p => p.id === cartItem.productId);
    // Erro de consistência: Se o produto no carrinho não for encontrado no catálogo.
    if (!product) {
      console.error(`Erro: Produto ID ${cartItem.productId} no carrinho não encontrado no catálogo.`);
      return res.status(500).json({ error: `Erro interno: Produto ID ${cartItem.productId} no carrinho não encontrado no catálogo.` });
    }
    // Validação: Verifica se há estoque suficiente para o item.
    if (product.stock < cartItem.quantity) {
      // Se não houver, retorna um erro 400.
      return res.status(400).json({ error: `Estoque insuficiente para ${product.name}. Apenas ${product.stock} em estoque.` });
    }

    // Calcula o valor total do pedido.
    totalAmount += product.price * cartItem.quantity;
    // Adiciona os detalhes do item ao array de 'orderItems'.
    orderItems.push({
      productId: product.id,
      name: product.name,
      quantity: cartItem.quantity,
      price: product.price
    });
    // Registra a mudança de estoque necessária para este produto.
    stockChanges.push({ productId: product.id, quantityToDeduct: cartItem.quantity });
  }

  // Cria o novo objeto de pedido.
  const newOrder = {
    orderId: generateOrderId(), // Gera um ID único para o pedido.
    items: orderItems, // Itens que fazem parte deste pedido.
    totalAmount: totalAmount, // Valor total do pedido.
    status: 'processing', // Status inicial do pedido.
    paymentMethod: paymentMethod, // Método de pagamento escolhido.
    address: address, // Endereço de entrega.
    createdAt: new Date().toISOString(), // Data e hora de criação do pedido.
    _stockChanges: stockChanges // Guarda as mudanças de estoque temporariamente (serão aplicadas após confirmação).
  };

  // Adiciona o novo pedido ao array de 'orders'.
  orders.push(newOrder);

  // Retorna uma resposta 202 (Aceito) com detalhes básicos do pedido criado.
  res.status(202).json({
    orderId: newOrder.orderId,
    totalAmount: newOrder.totalAmount,
    status: newOrder.status
  });
});

// --- Rota para Confirmar Pagamento do Pedido ---
// Define uma rota POST para confirmar o pagamento de um pedido específico.
// ':orderId' é um parâmetro dinâmico na URL.
// ENDPOINT: POST /:orderId/confirm (Ex: /api/orders/abc123def/confirm)
router.post('/:orderId/confirm', (req, res) => {
  // Obtém o 'orderId' da URL.
  const orderId = req.params.orderId;
  // Extrai o 'paymentStatus' (status do pagamento) do corpo da requisição.
  const { paymentStatus } = req.body;

  // Encontra o pedido correspondente no array de 'orders'.
  let order = orders.find(o => o.orderId === orderId);

  // Se o pedido não for encontrado...
  if (!order) {
    // Retorna um erro 404 (Não Encontrado).
    return res.status(404).json({ error: 'Pedido não encontrado.' });
  }

  // Validação: Verifica se o status do pedido já impede uma nova confirmação.
  if (order.status === 'paid' || order.status === 'cancelled' || order.status === 'failed') {
    // Retorna um erro 400.
    return res.status(400).json({ error: `O pedido já está no status ${order.status}.` });
  }

  // Se o status do pagamento for 'success' (sucesso)...
  if (paymentStatus === 'success') {
    // Atualiza o status do pedido para 'paid'.
    order.status = 'paid';
    // Registra a data e hora do pagamento.
    order.paidAt = new Date().toISOString();

    // Aplica as mudanças de estoque registradas no pedido.
    for (const change of order._stockChanges) {
      // Encontra o produto no catálogo.
      const product = products.find(p => p.id === change.productId);
      // Se o produto for encontrado, subtrai a quantidade do estoque.
      if (product) {
        product.stock -= change.quantityToDeduct;
      }
    }
    // Remove o campo '_stockChanges' do objeto do pedido, pois já foi aplicado.
    delete order._stockChanges;

    // Limpa o carrinho de compras, pois o pedido foi finalizado com sucesso.
    // Isso é importante para que o usuário comece um novo pedido com o carrinho vazio.
    cart.splice(0, cart.length);

    // Retorna uma resposta 200 (OK) com a confirmação do pagamento.
    res.status(200).json({
      message: 'Pagamento confirmado',
      orderId: order.orderId,
      status: order.status
    });
  } else if (paymentStatus === 'failed') { // Se o status do pagamento for 'failed' (falhou)...
    // Atualiza o status do pedido para 'failed'.
    order.status = 'failed';
    // Retorna uma resposta 200 com a mensagem de falha.
    res.status(200).json({
      message: 'Pagamento falhou',
      orderId: order.orderId,
      status: order.status
    });
  } else { // Se o status de pagamento fornecido for inválido.
    // Retorna um erro 400.
    return res.status(400).json({ error: 'Status de pagamento inválido. Use "success" ou "failed".' });
  }
});

// --- Rota para Visualizar um Pedido Específico ---
// Define uma rota GET para visualizar os detalhes de um pedido específico.
// ENDPOINT: GET /:orderId (Ex: /api/orders/xyz789uvw)
router.get('/:orderId', (req, res) => {
  // Obtém o 'orderId' da URL.
  const orderId = req.params.orderId;
  // Encontra o pedido correspondente.
  const order = orders.find(o => o.orderId === orderId);

  // Se o pedido for encontrado...
  if (order) {
    // Formata os itens do pedido para incluir o nome atual do produto (caso tenha mudado no catálogo).
    // Isso garante que a exibição do pedido reflita o nome atual do produto, se disponível.
    const formattedItems = order.items.map(item => {
      const productDetail = products.find(p => p.id === item.productId);
      return {
        // Usa o nome atual do produto no catálogo ou o nome registrado no pedido (fallback).
        name: productDetail ? productDetail.name : item.name,
        quantity: item.quantity,
        price: item.price
      };
    });

    // Retorna uma resposta 200 com os detalhes formatados do pedido.
    res.status(200).json({
      orderId: order.orderId,
      items: formattedItems,
      totalAmount: order.totalAmount,
      status: order.status
    });
  } else { // Se o pedido não for encontrado...
    // Retorna um erro 404.
    res.status(404).json({ error: 'Pedido não encontrado.' });
  }
});

// Exporta o objeto 'router' para que ele possa ser utilizado no arquivo principal da sua aplicação Express.
module.exports = router;
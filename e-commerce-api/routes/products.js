// Importa o módulo 'express', que é um framework web para Node.js.
// Ele simplifica a criação de servidores e APIs.
const express = require('express');

// Cria um objeto 'Router' do Express.
// Um router é como um "mini-aplicativo" que pode lidar com rotas específicas.
// Isso ajuda a organizar o código da sua API.
const router = express.Router();

// Importa a lista de produtos de um arquivo local.
// A variável 'products' agora contém um array de objetos, onde cada objeto representa um produto.
let products = require('../data/products');

// --- Função Geradora de ID ---
// Define uma função auxiliar para gerar o próximo ID disponível para um novo produto.
const getNextProductId = () => {
  // Calcula o ID máximo entre os produtos existentes.
  // Se não houver produtos, o maxId será 0.
  const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
  // Retorna o maxId + 1, garantindo um ID único e sequencial.
  return maxId + 1;
};

// --- Rota para Listar Todos os Produtos ---
// Define uma rota GET para a URL raiz ('/').
// Quando uma requisição GET é feita para esta rota, a função de callback é executada.
// ENDPOINT: GET / (Ex: /api/products)
router.get('/', (req, res) => {
  // Envia a lista completa de produtos como uma resposta JSON.
  res.json(products);
});

// --- Rota para Consultar Produto por ID ---
// Define uma rota GET com um parâmetro dinâmico ':id'.
// ':id' significa que qualquer valor após a barra será capturado como 'id'.
// ENDPOINT: GET /:id (Ex: /api/products/123)
router.get('/:id', (req, res) => {
  // Converte o parâmetro 'id' da URL (que é uma string) para um número inteiro.
  const id = parseInt(req.params.id);
  // Procura na lista de produtos por um produto cujo 'id' seja igual ao 'id' fornecido.
  const product = products.find(p => p.id === id);

  // Se nenhum produto for encontrado (ou seja, 'product' é undefined/null)...
  if (!product) {
    // Retorna uma resposta com status 404 (Não Encontrado) e uma mensagem de erro em JSON.
    return res.status(404).json({ message: 'Produto não encontrado ' });
  }

  // Se o produto for encontrado, envia-o como uma resposta JSON.
  res.json(product);
});

// --- Rota para Criar um Novo Produto ---
// Define uma rota POST para a URL raiz ('/').
// Esta rota é usada para adicionar novos recursos (produtos neste caso).
// ENDPOINT: POST / (Ex: /api/products)
router.post('/', (req, res) => {
  // Desestrutura o corpo da requisição (req.body) para obter as propriedades do novo produto.
  const { name, price, description, category, stock } = req.body;

  // Validação: Verifica se 'name' e 'price' foram fornecidos.
  // 'price === undefined' é usado para garantir que o preço foi enviado, mesmo que seja 0.
  if (!name || price === undefined) {
    // Retorna uma resposta com status 400 (Requisição Inválida) e uma mensagem de erro.
    return res.status(400).json({ message: 'Nome e preço são obrigatórios' });
  }
  // Validação: Verifica se 'price' ou 'stock' são negativos.
  if (price < 0 || stock < 0) {
    // Retorna uma resposta com status 400 e uma mensagem de erro.
    return res.status(400).json({ message: 'Preço e estoque não podem ser negativos.' });
  }

  // Calcula o novo ID do produto.
  // Se já houver produtos, pega o maior ID e soma 1. Caso contrário, começa com 1.
  const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

  // Cria um novo objeto 'newProduct' com as propriedades fornecidas e um novo ID.
  // Define valores padrão para 'description', 'category' e 'stock' se não forem fornecidos.
  const newProduct = {
    id: newId,
    name,
    price,
    description: description || '', // Se 'description' for falso (null, undefined, ''), usa string vazia.
    category: category || 'Outros', // Se 'category' for falso, usa 'Outros'.
    stock: stock || 0, // Se 'stock' for falso, usa 0.
  };

  // Adiciona o novo produto ao array 'products'.
  products.push(newProduct);

  // Retorna uma resposta com status 201 (Criado) e o novo produto em JSON.
  res.status(201).json(newProduct);
});

// --- Rota para Atualizar Produto Existente ---
// Define uma rota PUT com um parâmetro dinâmico ':id'.
// PUT é usado para atualizar um recurso completo ou substituir um recurso existente.
// ENDPOINT: PUT /:id (Ex: /api/products/456)
router.put('/:id', (req, res) => {
  // Converte o ID da URL para número inteiro.
  const id = parseInt(req.params.id);
  // Encontra o índice do produto no array que corresponde ao ID fornecido.
  const productIndex = products.findIndex(p => p.id === id);

  // Se o índice for -1, significa que o produto não foi encontrado.
  if (productIndex === -1) {
    // Retorna uma resposta 404.
    return res.status(404).json({ message: 'Produto não encontrado ' });
  }

  // Desestrutura o corpo da requisição para obter as propriedades a serem atualizadas.
  const { name, price, description, category, stock } = req.body;

  // Validação: Verifica se nenhum dado para atualização foi fornecido.
  if (
    name === undefined &&
    price === undefined &&
    description === undefined &&
    category === undefined &&
    stock === undefined
  ) {
    // Retorna uma resposta 400 se o corpo da requisição estiver vazio.
    return res.status(400).json({ message: 'Nenhum dado para atualizar foi fornecido.' });
  }
  // Validação: Verifica se 'price' ou 'stock' (se fornecidos) são negativos.
  if (price !== undefined && price < 0 || stock !== undefined && stock < 0) {
    // Retorna uma resposta 400 com mensagem de erro.
    return res.status(400).json({ message: 'Preço e estoque não podem ser negativos.' });
  }

  // Define os campos permitidos para atualização.
  const allowedFields = ['name', 'price', 'description', 'category', 'stock'];
  // Pega todos os dados do corpo da requisição como 'updates'.
  const updates = req.body;

  // Itera sobre os campos permitidos.
  allowedFields.forEach(field => {
    // Se o campo existe em 'updates' e não é undefined...
    if (updates[field] !== undefined) {
      // Atualiza o valor do campo no produto encontrado.
      products[productIndex][field] = updates[field];
    }
  });

  // Retorna o produto atualizado como resposta JSON.
  res.json(products[productIndex]);
});

// --- Rota para Deletar Produto ---
// Define uma rota DELETE com um parâmetro dinâmico ':id'.
// DELETE é usado para remover um recurso.
// ENDPOINT: DELETE /:id (Ex: /api/products/789)
router.delete('/:id', (req, res) => {
  // Converte o ID da URL para número inteiro.
  const id = parseInt(req.params.id);
  // Encontra o índice do produto a ser removido.
  const productIndex = products.findIndex(p => p.id === id);

  // Se o produto não for encontrado...
  if (productIndex === -1) {
    // Retorna uma resposta 404.
    return res.status(404).json({ message: 'Produto não encontrado ' });
  }

  // Remove o produto do array usando 'splice'.
  // 'splice(index, 1)' remove 1 elemento a partir do 'index'.
  // '[0]' pega o elemento removido, pois 'splice' retorna um array.
  const removedProduct = products.splice(productIndex, 1)[0];

  // Retorna uma mensagem de sucesso e o produto que foi removido.
  res.json({ message: 'Produto removido com sucesso ', product: removedProduct });
});

// --- Rota para Controle de Estoque (Atualização Parcial) ---
// Define uma rota PUT com um parâmetro ':id' e um caminho '/stock'.
// Esta rota é específica para atualizar apenas a quantidade em estoque de um produto.
// ENDPOINT: PUT /:id/stock (Ex: /api/products/101/stock)
router.put('/:id/stock', (req, res) => {
  // Converte o ID do produto para número inteiro.
  const id = parseInt(req.params.id);
  // Desestrutura o corpo da requisição para obter a 'quantity' (quantidade de estoque).
  const { quantity } = req.body;

  // Validação: Verifica se 'quantity' foi fornecida, é um número, não é negativa e é um inteiro.
  if (quantity === undefined || isNaN(quantity) || quantity < 0 || !Number.isInteger(quantity)) {
    // Retorna uma resposta 400 com uma mensagem de erro detalhada.
    return res.status(400).json({ error: 'A quantidade para atualizar o estoque é obrigatória e deve ser um número inteiro não negativo.' });
  }

  // Procura o produto pelo ID.
  let product = products.find(p => p.id === id);

  // Se o produto não for encontrado...
  if (!product) {
    // Retorna uma resposta 404.
    return res.status(404).json({ error: 'Produto não encontrado para atualizar estoque.' });
  }

  // Atualiza a propriedade 'stock' do produto com a nova 'quantity'.
  product.stock = quantity;

  // Retorna uma resposta 200 (OK) com uma mensagem de sucesso.
  res.status(200).json({ message: 'Estoque atualizado com sucesso' });
});

// Exporta o objeto 'router' para que ele possa ser usado em outros arquivos da aplicação.
module.exports = router;
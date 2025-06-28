// Este arquivo é um módulo JavaScript que exporta uma lista de produtos.
// Ele serve como um "banco de dados" em memória para os produtos da sua loja.
// Em uma aplicação real, esses dados viriam de um banco de dados persistente (SQL, NoSQL, etc.).

// Declara uma constante 'products' que é um array (uma lista).
// Cada elemento deste array é um objeto JavaScript, e cada objeto representa um produto individual.
const products = [
  {
    // 'id': Um identificador único para o produto. Essencial para referenciar o produto em outras partes da aplicação (carrinho, pedidos).
    id: 1,
    // 'name': O nome descritivo do produto.
    name: "Camiseta",
    // 'price': O preço de venda do produto.
    price: 49.90,
    // 'description': Uma breve descrição detalhada do produto.
    description: "Camiseta 100% algodão, confortável e estilosa.",
    // 'category': A categoria à qual o produto pertence. Útil para organização e filtragem.
    category: "Roupas",
    // 'stock': A quantidade disponível deste produto no inventário.
    // Este valor será atualizado quando produtos forem adicionados ao carrinho e, principalmente, quando pedidos forem finalizados.
    stock: 150
  },
  {
    id: 2,
    name: "Tênis",
    price: 199.90,
    description: "Tênis esportivo para uso diário, com amortecimento extra.",
    category: "Calçados",
    stock: 80
  },
  {
    id: 3,
    name: "Calça Jeans",
    price: 129.90,
    description: "Calça jeans slim fit, resistente e confortável.",
    category: "Roupas",
    stock: 120
  },
  {
    id: 4,
    name: "Jaqueta",
    price: 249.90,
    description: "Jaqueta de couro sintético, ideal para o inverno.",
    category: "Roupas",
    stock: 60
  },
  {
    id: 5,
    name: "Boné",
    price: 39.90,
    description: "Boné esportivo com ajuste traseiro e tecido respirável.",
    category: "Acessórios",
    stock: 200
  },
  {
    id: 6,
    name: "Moletom",
    price: 179.90,
    description: "Moletom confortável com capuz e bolsos frontais.",
    category: "Roupas",
    stock: 90
  },
  {
    id: 7,
    name: "Relógio",
    price: 299.90,
    description: "Relógio analógico à prova d’água, design moderno.",
    category: "Acessórios",
    stock: 40
  },
  {
    id: 8,
    name: "Óculos de Sol",
    price: 149.90,
    description: "Óculos de sol com proteção UV400 e armação leve.",
    category: "Acessórios",
    stock: 75
  },
  {
    id: 9,
    name: "Meias (kit com 3 pares)",
    price: 29.90,
    description: "Kit com 3 pares de meias esportivas, tecido macio.",
    category: "Roupas",
    stock: 300
  },
  {
    id: 10,
    name: "Cinto de Couro",
    price: 59.90,
    description: "Cinto de couro legítimo, ajuste fácil e durável.",
    category: "Acessórios",
    stock: 100
  }
];

// Exporta o array 'products' para que outros arquivos JavaScript possam importá-lo.
// Por exemplo, em 'products.js', 'cart.js' ou 'checkout.js', você usaria:
// `let products = require('../data/products');` para acessar esta lista.
module.exports = products;
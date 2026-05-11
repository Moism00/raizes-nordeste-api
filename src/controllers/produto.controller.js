const prisma = require("../utils/prisma");

async function listarProdutos(req, res) {
  try {
    const produtos = await prisma.produto.findMany({
      where: {
        ativo: true
      },
      orderBy: {
        id: "asc"
      }
    });

    return res.json({
      total: produtos.length,
      data: produtos
    });
  } catch (error) {
    return res.status(500).json({
      error: "ERRO_INTERNO",
      message: "Erro ao listar produtos.",
      details: [],
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }
}

module.exports = {
  listarProdutos
};
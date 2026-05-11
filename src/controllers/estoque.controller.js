const prisma = require("../utils/prisma");

async function listarEstoquePorUnidade(req, res) {
  try {
    const unidadeId = Number(req.query.unidadeId);

    if (!unidadeId) {
      return res.status(422).json({
        error: "UNIDADE_OBRIGATORIA",
        message: "O parâmetro unidadeId é obrigatório.",
        details: [
          {
            field: "unidadeId",
            issue: "Informe o identificador da unidade."
          }
        ],
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }

    const unidade = await prisma.unidade.findUnique({
      where: { id: unidadeId }
    });

    if (!unidade) {
      return res.status(404).json({
        error: "UNIDADE_NAO_ENCONTRADA",
        message: "Unidade não encontrada.",
        details: [],
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }

    const estoques = await prisma.estoque.findMany({
      where: { unidadeId },
      include: {
        produto: true
      },
      orderBy: {
        produtoId: "asc"
      }
    });

    return res.status(200).json({
      unidadeId: unidade.id,
      unidade: unidade.nome,
      total: estoques.length,
      data: estoques.map((item) => ({
        produtoId: item.produtoId,
        produto: item.produto.nome,
        quantidadeDisponivel: item.quantidadeDisponivel
      }))
    });
  } catch (error) {
    return res.status(500).json({
      error: "ERRO_INTERNO",
      message: "Erro ao consultar estoque.",
      details: [],
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }
}

module.exports = {
  listarEstoquePorUnidade
};
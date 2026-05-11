const prisma = require("../utils/prisma");

async function listarUnidades(req, res) {
  try {
    const unidades = await prisma.unidade.findMany({
      where: {
        ativo: true
      },
      orderBy: {
        id: "asc"
      }
    });

    return res.json({
      total: unidades.length,
      data: unidades
    });
  } catch (error) {
    return res.status(500).json({
      error: "ERRO_INTERNO",
      message: "Erro ao listar unidades.",
      details: [],
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }
}

module.exports = {
  listarUnidades
};
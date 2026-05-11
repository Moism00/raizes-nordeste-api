const prisma = require("../utils/prisma");

async function listarAuditorias(req, res) {
  try {
    const auditorias = await prisma.auditoria.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true
          }
        }
      },
      orderBy: {
        id: "desc"
      }
    });

    return res.status(200).json({
      total: auditorias.length,
      data: auditorias.map((item) => ({
        id: item.id,
        usuarioId: item.usuarioId,
        usuario: item.usuario.nome,
        perfil: item.usuario.perfil,
        pedidoId: item.pedidoId,
        acao: item.acao,
        entidade: item.entidade,
        detalhes: item.detalhes,
        createdAt: item.createdAt
      }))
    });
  } catch (error) {
    return res.status(500).json({
      error: "ERRO_INTERNO",
      message: "Erro ao listar auditorias.",
      details: [],
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }
}

module.exports = {
  listarAuditorias
};
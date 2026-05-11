const prisma = require("../utils/prisma");

function decimalParaNumero(valor) {
  if (valor && typeof valor.toNumber === "function") {
    return valor.toNumber();
  }

  return Number(valor);
}

async function simularPagamentoMock(req, res) {
  try {
    const pedidoId = Number(req.params.id);
    const { resultado } = req.body;

    if (!pedidoId) {
      return res.status(422).json({
        error: "PEDIDO_INVALIDO",
        message: "O identificador do pedido é inválido.",
        details: [],
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }

    if (!resultado || !["APROVADO", "RECUSADO"].includes(resultado)) {
      return res.status(422).json({
        error: "RESULTADO_PAGAMENTO_INVALIDO",
        message: "O resultado do pagamento deve ser APROVADO ou RECUSADO.",
        details: [
          {
            field: "resultado",
            issue: "Valores permitidos: APROVADO ou RECUSADO."
          }
        ],
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }

    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: {
        itens: true,
        pagamento: true
      }
    });

    if (!pedido) {
      return res.status(404).json({
        error: "PEDIDO_NAO_ENCONTRADO",
        message: "Pedido não encontrado.",
        details: [],
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }

    if (pedido.pagamento) {
      return res.status(409).json({
        error: "PAGAMENTO_JA_REGISTRADO",
        message: "Este pedido já possui um pagamento registrado.",
        details: [],
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }

    if (pedido.status !== "AGUARDANDO_PAGAMENTO") {
      return res.status(409).json({
        error: "PEDIDO_NAO_AGUARDA_PAGAMENTO",
        message: "O pedido não está aguardando pagamento.",
        details: [
          {
            field: "status",
            issue: `Status atual: ${pedido.status}`
          }
        ],
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }

    const novoStatusPedido = resultado === "APROVADO" ? "PAGO" : "PAGAMENTO_RECUSADO";

    const pagamento = await prisma.$transaction(async (tx) => {
      const novoPagamento = await tx.pagamento.create({
        data: {
          pedidoId: pedido.id,
          metodo: "MOCK",
          status: resultado,
          payloadRequisicao: JSON.stringify({
            pedidoId: pedido.id,
            valor: decimalParaNumero(pedido.valorTotal),
            resultado
          }),
          payloadResposta: JSON.stringify({
            status: resultado,
            mensagem:
              resultado === "APROVADO"
                ? "Pagamento mock aprovado."
                : "Pagamento mock recusado."
          })
        }
      });

      await tx.pedido.update({
        where: { id: pedido.id },
        data: {
          status: novoStatusPedido
        }
      });

      if (resultado === "RECUSADO") {
        for (const item of pedido.itens) {
          await tx.estoque.update({
            where: {
              unidadeId_produtoId: {
                unidadeId: pedido.unidadeId,
                produtoId: item.produtoId
              }
            },
            data: {
              quantidadeDisponivel: {
                increment: item.quantidade
              }
            }
          });
        }
      }

      await tx.auditoria.create({
        data: {
          usuarioId: req.usuario.id,
          pedidoId: pedido.id,
          acao: "PAGAMENTO_MOCK",
          entidade: "Pagamento",
          detalhes: `Pagamento mock ${resultado}`
        }
      });

      return novoPagamento;
    });

    return res.status(200).json({
      pedidoId: pedido.id,
      pagamentoId: pagamento.id,
      statusPagamento: pagamento.status,
      statusPedido: novoStatusPedido,
      mensagem:
        resultado === "APROVADO"
          ? "Pagamento mock aprovado com sucesso."
          : "Pagamento mock recusado."
    });
  } catch (error) {
    return res.status(500).json({
      error: "ERRO_INTERNO",
      message: "Erro ao simular pagamento.",
      details: [],
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }
}

module.exports = {
  simularPagamentoMock
};
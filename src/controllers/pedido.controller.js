const prisma = require("../utils/prisma");

const CANAIS_VALIDOS = ["APP", "WEB", "TOTEM", "BALCAO", "PICKUP"];

function decimalParaNumero(valor) {
  if (valor && typeof valor.toNumber === "function") {
    return valor.toNumber();
  }

  return Number(valor);
}

async function criarPedido(req, res) {
  try {
    const { unidadeId, canalPedido, itens, formaPagamento } = req.body;

    if (!unidadeId || !canalPedido || !itens || !formaPagamento) {
      return res.status(400).json({
        error: "DADOS_OBRIGATORIOS",
        message: "Unidade, canalPedido, itens e formaPagamento são obrigatórios.",
        details: [],
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }

    if (!CANAIS_VALIDOS.includes(canalPedido)) {
      return res.status(422).json({
        error: "CANAL_PEDIDO_INVALIDO",
        message: "O canalPedido informado é inválido.",
        details: [
          {
            field: "canalPedido",
            issue: "Valores permitidos: APP, WEB, TOTEM, BALCAO, PICKUP."
          }
        ],
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }

    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(422).json({
        error: "ITENS_INVALIDOS",
        message: "O pedido deve possuir pelo menos um item.",
        details: [],
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }

    const unidade = await prisma.unidade.findUnique({
      where: { id: Number(unidadeId) }
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

    const itensCalculados = [];
    let valorTotal = 0;

    for (const item of itens) {
      const produtoId = Number(item.produtoId);
      const quantidade = Number(item.quantidade);

      if (!produtoId || !quantidade || quantidade <= 0) {
        return res.status(422).json({
          error: "ITEM_INVALIDO",
          message: "Produto e quantidade devem ser válidos.",
          details: [
            {
              field: "itens",
              issue: "Cada item deve possuir produtoId e quantidade maior que zero."
            }
          ],
          timestamp: new Date().toISOString(),
          path: req.originalUrl
        });
      }

      const produto = await prisma.produto.findUnique({
        where: { id: produtoId }
      });

      if (!produto || !produto.ativo) {
        return res.status(404).json({
          error: "PRODUTO_NAO_ENCONTRADO",
          message: "Produto não encontrado ou inativo.",
          details: [
            {
              field: "produtoId",
              issue: `Produto ${produtoId} não disponível.`
            }
          ],
          timestamp: new Date().toISOString(),
          path: req.originalUrl
        });
      }

      const estoque = await prisma.estoque.findUnique({
        where: {
          unidadeId_produtoId: {
            unidadeId: Number(unidadeId),
            produtoId
          }
        }
      });

      if (!estoque || estoque.quantidadeDisponivel < quantidade) {
        return res.status(409).json({
          error: "ESTOQUE_INSUFICIENTE",
          message: "Não há quantidade suficiente para um ou mais itens.",
          details: [
            {
              field: "itens.quantidade",
              issue: `Produto ${produto.nome}. Disponível: ${estoque ? estoque.quantidadeDisponivel : 0}`
            }
          ],
          timestamp: new Date().toISOString(),
          path: req.originalUrl
        });
      }

      const precoUnitario = decimalParaNumero(produto.preco);
      const subtotal = precoUnitario * quantidade;

      valorTotal += subtotal;

      itensCalculados.push({
        produtoId,
        quantidade,
        precoUnitario,
        subtotal
      });
    }

    const pedido = await prisma.$transaction(async (tx) => {
      const novoPedido = await tx.pedido.create({
        data: {
          usuarioId: req.usuario.id,
          unidadeId: Number(unidadeId),
          canalPedido,
          formaPagamento,
          valorTotal: valorTotal.toFixed(2),
          status: "AGUARDANDO_PAGAMENTO",
          itens: {
            create: itensCalculados.map((item) => ({
              produtoId: item.produtoId,
              quantidade: item.quantidade,
              precoUnitario: item.precoUnitario.toFixed(2),
              subtotal: item.subtotal.toFixed(2)
            }))
          }
        },
        include: {
          itens: true
        }
      });

      for (const item of itensCalculados) {
        await tx.estoque.update({
          where: {
            unidadeId_produtoId: {
              unidadeId: Number(unidadeId),
              produtoId: item.produtoId
            }
          },
          data: {
            quantidadeDisponivel: {
              decrement: item.quantidade
            }
          }
        });
      }

      await tx.auditoria.create({
        data: {
          usuarioId: req.usuario.id,
          pedidoId: novoPedido.id,
          acao: "CRIAR_PEDIDO",
          entidade: "Pedido",
          detalhes: `Pedido criado pelo canal ${canalPedido}`
        }
      });

      return novoPedido;
    });

    return res.status(201).json({
      pedidoId: pedido.id,
      unidadeId: pedido.unidadeId,
      canalPedido: pedido.canalPedido,
      status: pedido.status,
      formaPagamento: pedido.formaPagamento,
      total: decimalParaNumero(pedido.valorTotal),
      itens: pedido.itens.map((item) => ({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        precoUnitario: decimalParaNumero(item.precoUnitario),
        subtotal: decimalParaNumero(item.subtotal)
      })),
      createdAt: pedido.createdAt
    });
  } catch (error) {
    return res.status(500).json({
      error: "ERRO_INTERNO",
      message: "Erro ao criar pedido.",
      details: [],
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }
}

async function listarPedidos(req, res) {
  try {
    const { canalPedido, status } = req.query;

    const filtros = {};

    if (canalPedido) {
      filtros.canalPedido = canalPedido;
    }

    if (status) {
      filtros.status = status;
    }

    const pedidos = await prisma.pedido.findMany({
      where: filtros,
      include: {
        itens: true,
        pagamento: true
      },
      orderBy: {
        id: "desc"
      }
    });

    return res.status(200).json({
      total: pedidos.length,
      data: pedidos.map((pedido) => ({
        pedidoId: pedido.id,
        usuarioId: pedido.usuarioId,
        unidadeId: pedido.unidadeId,
        canalPedido: pedido.canalPedido,
        status: pedido.status,
        formaPagamento: pedido.formaPagamento,
        total: decimalParaNumero(pedido.valorTotal),
        createdAt: pedido.createdAt
      }))
    });
  } catch (error) {
    return res.status(500).json({
      error: "ERRO_INTERNO",
      message: "Erro ao listar pedidos.",
      details: [],
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }
}
async function atualizarStatusPedido(req, res) {
  try {
    const pedidoId = Number(req.params.id);
    const { status } = req.body;

    const STATUS_VALIDOS = ["EM_PREPARO", "PRONTO", "ENTREGUE", "CANCELADO"];

    if (!pedidoId) {
      return res.status(422).json({
        error: "PEDIDO_INVALIDO",
        message: "O identificador do pedido é inválido.",
        details: [],
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }

    if (!status || !STATUS_VALIDOS.includes(status)) {
      return res.status(422).json({
        error: "STATUS_INVALIDO",
        message: "O status informado é inválido.",
        details: [
          {
            field: "status",
            issue: "Valores permitidos: EM_PREPARO, PRONTO, ENTREGUE, CANCELADO."
          }
        ],
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }

    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId }
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

    if (pedido.status === "ENTREGUE" || pedido.status === "CANCELADO") {
      return res.status(409).json({
        error: "PEDIDO_FINALIZADO",
        message: "Não é possível alterar o status de um pedido finalizado.",
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

    if (pedido.status === "AGUARDANDO_PAGAMENTO") {
      return res.status(409).json({
        error: "PEDIDO_SEM_PAGAMENTO",
        message: "O pedido ainda não possui pagamento aprovado.",
        details: [
          {
            field: "status",
            issue: "Apenas pedidos pagos podem avançar no fluxo operacional."
          }
        ],
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }

    if (pedido.status === "PAGAMENTO_RECUSADO") {
      return res.status(409).json({
        error: "PAGAMENTO_RECUSADO",
        message: "Não é possível atualizar o status de um pedido com pagamento recusado.",
        details: [],
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }

    const pedidoAtualizado = await prisma.$transaction(async (tx) => {
      const atualizado = await tx.pedido.update({
        where: { id: pedidoId },
        data: { status }
      });

      await tx.auditoria.create({
        data: {
          usuarioId: req.usuario.id,
          pedidoId: pedido.id,
          acao: "ATUALIZAR_STATUS_PEDIDO",
          entidade: "Pedido",
          detalhes: `Status alterado de ${pedido.status} para ${status}`
        }
      });

      return atualizado;
    });

    return res.status(200).json({
      pedidoId: pedidoAtualizado.id,
      statusAnterior: pedido.status,
      statusAtual: pedidoAtualizado.status,
      updatedAt: pedidoAtualizado.updatedAt
    });
  } catch (error) {
    return res.status(500).json({
      error: "ERRO_INTERNO",
      message: "Erro ao atualizar status do pedido.",
      details: [],
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }
}


module.exports = {
  criarPedido,
  listarPedidos,
  atualizarStatusPedido
};
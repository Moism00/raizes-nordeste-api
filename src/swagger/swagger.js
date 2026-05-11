const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Raízes do Nordeste",
      version: "1.0.0",
      description: "API Back-end para pedidos, estoque, pagamento mock e atualização de status."
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor local"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    paths: {
      "/auth/login": {
        post: {
          summary: "Realizar login",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                example: {
                  email: "cliente@exemplo.com",
                  senha: "Senha@123"
                }
              }
            }
          },
          responses: {
            200: { description: "Login realizado com sucesso" },
            401: { description: "Credenciais inválidas" }
          }
        }
      },
      "/produtos": {
        get: {
          summary: "Listar produtos",
          tags: ["Produtos"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Lista de produtos" },
            401: { description: "Token ausente ou inválido" }
          }
        }
      },
      "/unidades": {
        get: {
          summary: "Listar unidades",
          tags: ["Unidades"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Lista de unidades" }
          }
        }
      },
      "/estoques": {
        get: {
          summary: "Consultar estoque por unidade",
          tags: ["Estoque"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "unidadeId",
              in: "query",
              required: true,
              schema: { type: "integer" },
              example: 1
            }
          ],
          responses: {
            200: { description: "Saldo de estoque da unidade" },
            422: { description: "Parâmetro unidadeId ausente ou inválido" }
          }
        }
      },
      "/pedidos": {
        post: {
          summary: "Criar pedido",
          tags: ["Pedidos"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                example: {
                  unidadeId: 1,
                  canalPedido: "TOTEM",
                  itens: [
                    { produtoId: 1, quantidade: 2 },
                    { produtoId: 2, quantidade: 1 }
                  ],
                  formaPagamento: "MOCK"
                }
              }
            }
          },
          responses: {
            201: { description: "Pedido criado com sucesso" },
            409: { description: "Estoque insuficiente" },
            422: { description: "Dados inválidos" }
          }
        },
        get: {
          summary: "Listar pedidos",
          tags: ["Pedidos"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "canalPedido",
              in: "query",
              required: false,
              schema: { type: "string" },
              example: "TOTEM"
            },
            {
              name: "status",
              in: "query",
              required: false,
              schema: { type: "string" },
              example: "PAGO"
            }
          ],
          responses: {
            200: { description: "Lista de pedidos" }
          }
        }
      },
      "/pedidos/{id}/pagamento/mock": {
        post: {
          summary: "Simular pagamento mock",
          tags: ["Pagamentos"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
              example: 1
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                example: {
                  resultado: "APROVADO"
                }
              }
            }
          },
          responses: {
            200: { description: "Pagamento simulado" },
            409: { description: "Pagamento já registrado ou pedido inválido" }
          }
        }
      },
      "/pedidos/{id}/status": {
        patch: {
          summary: "Atualizar status do pedido",
          tags: ["Pedidos"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
              example: 1
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                example: {
                  status: "EM_PREPARO"
                }
              }
            }
          },
          responses: {
            200: { description: "Status atualizado" },
            409: { description: "Transição inválida" }
          }
        }
      },
      "/auditorias": {
        get: {
          summary: "Listar auditorias",
          tags: ["Auditoria"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Lista de auditorias" },
            403: { description: "Sem permissão" }
          }
        }
      }
    }
  },
  apis: []
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
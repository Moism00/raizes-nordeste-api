# API Raízes do Nordeste

Projeto Back-end desenvolvido para a atividade prática da trilha Back-End.

A API simula o funcionamento de uma rede de lanchonetes, com autenticação, produtos, unidades, estoque, pedidos, pagamento mock, atualização de status e auditoria.

## Tecnologias utilizadas

- Node.js
- Express
- Prisma ORM
- SQLite
- JWT
- Swagger/OpenAPI
- Postman

## Requisitos

Antes de executar o projeto, é necessário ter instalado:

- Node.js
- npm
- Git

## Instalação

Clone o repositório:

```bash
git clone (https://github.com/Moism00/raizes-nordeste-api.git)
cd raizes-nordeste-api
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env` com base no arquivo `.env.example`.

Exemplo de `.env`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="raizes_nordeste_api_chave_segura_2026"
PORT=3000
```

Execute as migrations do banco de dados:

```bash
npx prisma migrate dev
```

Execute o seed para criar dados iniciais:

```bash
npm run seed
```

Inicie a API:

```bash
npm run dev
```

A API ficará disponível em:

```text
http://localhost:3000
```

## Swagger/OpenAPI

A documentação da API pode ser acessada em:

```text
http://localhost:3000/api-docs
```

## Usuários de teste

Após executar o seed, os seguintes usuários estarão disponíveis:

```text
cliente@exemplo.com / Senha@123
atendente@exemplo.com / Senha@123
cozinha@exemplo.com / Senha@123
admin@exemplo.com / Senha@123
```

## Endpoints principais

| Método | Rota | Descrição |
|---|---|---|
| POST | /auth/login | Autenticar usuário e retornar token JWT |
| GET | /produtos | Listar produtos do cardápio |
| GET | /unidades | Listar unidades da rede |
| GET | /estoques?unidadeId=1 | Consultar estoque por unidade |
| POST | /pedidos | Criar pedido |
| GET | /pedidos | Listar pedidos |
| GET | /pedidos?canalPedido=TOTEM | Filtrar pedidos por canal |
| POST | /pedidos/{id}/pagamento/mock | Simular pagamento mock |
| PATCH | /pedidos/{id}/status | Atualizar status do pedido |
| GET | /auditorias | Listar registros de auditoria |

## Fluxo principal

O fluxo principal implementado é:

```text
Pedido → Pagamento mock → Atualização de status
```

Etapas do fluxo:

1. Realizar login em `/auth/login`.
2. Copiar o token JWT retornado.
3. Consultar unidades, produtos e estoque.
4. Criar um pedido em `/pedidos`.
5. Simular pagamento em `/pedidos/{id}/pagamento/mock`.
6. Atualizar o status do pedido em `/pedidos/{id}/status`.
7. Consultar registros de auditoria em `/auditorias`.

## Exemplo de login

Requisição:

```http
POST /auth/login
```

Body:

```json
{
  "email": "cliente@exemplo.com",
  "senha": "Senha@123"
}
```

Resposta esperada:

```json
{
  "accessToken": "jwt...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": 1,
    "nome": "Maria Cliente",
    "email": "cliente@exemplo.com",
    "perfil": "CLIENTE"
  }
}
```

## Exemplo de criação de pedido

Requisição:

```http
POST /pedidos
```

Body:

```json
{
  "unidadeId": 1,
  "canalPedido": "TOTEM",
  "itens": [
    {
      "produtoId": 1,
      "quantidade": 2
    },
    {
      "produtoId": 2,
      "quantidade": 1
    }
  ],
  "formaPagamento": "MOCK"
}
```

Resposta esperada:

```json
{
  "pedidoId": 1,
  "unidadeId": 1,
  "canalPedido": "TOTEM",
  "status": "AGUARDANDO_PAGAMENTO",
  "formaPagamento": "MOCK",
  "total": 68.7
}
```

## Exemplo de pagamento mock

Requisição:

```http
POST /pedidos/1/pagamento/mock
```

Body:

```json
{
  "resultado": "APROVADO"
}
```

Resposta esperada:

```json
{
  "pedidoId": 1,
  "pagamentoId": 1,
  "statusPagamento": "APROVADO",
  "statusPedido": "PAGO",
  "mensagem": "Pagamento mock aprovado com sucesso."
}
```

## Exemplo de atualização de status

Requisição:

```http
PATCH /pedidos/1/status
```

Body:

```json
{
  "status": "EM_PREPARO"
}
```

Resposta esperada:

```json
{
  "pedidoId": 1,
  "statusAnterior": "PAGO",
  "statusAtual": "EM_PREPARO"
}
```

## Padrão de erro

A API utiliza um padrão único de erro em JSON:

```json
{
  "error": "NOME_DO_ERRO",
  "message": "Mensagem legível",
  "details": [
    {
      "field": "campo",
      "issue": "problema"
    }
  ],
  "timestamp": "2026-02-05T12:00:00Z",
  "path": "/rota"
}
```

## Coleção Postman

A coleção Postman está disponível no repositório no caminho:

```text
postman/raizes-nordeste-api.postman_collection.json
```

A coleção contém requisições para testar:

- Login
- Listagem de produtos
- Listagem de unidades
- Consulta de estoque
- Criação de pedido
- Pagamento mock aprovado
- Atualização de status
- Consulta de auditoria
- Cenários de erro

## Banco de dados

O projeto utiliza SQLite com Prisma ORM.

Principais tabelas:

- Usuario
- Unidade
- Produto
- Estoque
- Pedido
- PedidoItem
- Pagamento
- Auditoria
- Fidelidade

## Segurança

A API utiliza:

- Autenticação JWT
- Hash de senha com bcrypt
- Controle de acesso por perfil
- Validação de token em rotas protegidas
- Respostas de erro sem exposição de senha
- Auditoria de ações sensíveis

## Perfis de usuário

Os principais perfis utilizados são:

- CLIENTE
- ATENDENTE
- COZINHA
- GERENTE
- ADMIN

## Observações

O pagamento é simulado por mock, sem integração real com gateway financeiro.

O banco SQLite é utilizado para facilitar a execução local do projeto.

O arquivo `.env` não deve ser enviado ao GitHub. Apenas o `.env.example` deve ser versionado.

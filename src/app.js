const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const produtoRoutes = require("./routes/produto.routes");
const unidadeRoutes = require("./routes/unidade.routes");
const estoqueRoutes = require("./routes/estoque.routes");
const pedidoRoutes = require("./routes/pedido.routes");
const pagamentoRoutes = require("./routes/pagamento.routes");
const auditoriaRoutes = require("./routes/auditoria.routes");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.json({
    message: "API Raízes do Nordeste funcionando"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

app.use("/auth", authRoutes);
app.use("/produtos", produtoRoutes);
app.use("/unidades", unidadeRoutes);
app.use("/estoques", estoqueRoutes);
app.use("/pedidos", pedidoRoutes);
app.use("/pedidos", pagamentoRoutes);
app.use("/auditorias", auditoriaRoutes);

module.exports = app;
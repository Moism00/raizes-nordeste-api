const express = require("express");
const {
  criarPedido,
  listarPedidos,
  atualizarStatusPedido
} = require("../controllers/pedido.controller");

const { autenticar, autorizarPerfis } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/", autenticar, autorizarPerfis("CLIENTE", "ATENDENTE"), criarPedido);

router.get("/", autenticar, listarPedidos);

router.patch(
  "/:id/status",
  autenticar,
  autorizarPerfis("COZINHA", "ATENDENTE", "GERENTE", "ADMIN"),
  atualizarStatusPedido
);

module.exports = router;
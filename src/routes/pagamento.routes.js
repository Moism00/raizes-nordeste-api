const express = require("express");
const { simularPagamentoMock } = require("../controllers/pagamento.controller");
const { autenticar, autorizarPerfis } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post(
  "/:id/pagamento/mock",
  autenticar,
  autorizarPerfis("CLIENTE", "ATENDENTE"),
  simularPagamentoMock
);

module.exports = router;
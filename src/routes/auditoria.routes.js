const express = require("express");
const { listarAuditorias } = require("../controllers/auditoria.controller");
const { autenticar, autorizarPerfis } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get(
  "/",
  autenticar,
  autorizarPerfis("ADMIN", "GERENTE"),
  listarAuditorias
);

module.exports = router;
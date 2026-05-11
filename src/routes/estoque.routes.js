const express = require("express");
const { listarEstoquePorUnidade } = require("../controllers/estoque.controller");
const { autenticar } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", autenticar, listarEstoquePorUnidade);

module.exports = router;
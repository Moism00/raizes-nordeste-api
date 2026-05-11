const express = require("express");
const { listarProdutos } = require("../controllers/produto.controller");
const { autenticar } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", autenticar, listarProdutos);

module.exports = router;
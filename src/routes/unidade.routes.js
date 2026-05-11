const express = require("express");
const { listarUnidades } = require("../controllers/unidade.controller");
const { autenticar } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", autenticar, listarUnidades);

module.exports = router;
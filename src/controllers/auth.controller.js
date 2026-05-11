const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");

async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        error: "DADOS_OBRIGATORIOS",
        message: "E-mail e senha são obrigatórios.",
        details: [],
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario) {
      return res.status(401).json({
        error: "CREDENCIAIS_INVALIDAS",
        message: "E-mail ou senha inválidos.",
        details: [],
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);

    if (!senhaValida) {
      return res.status(401).json({
        error: "CREDENCIAIS_INVALIDAS",
        message: "E-mail ou senha inválidos.",
        details: [],
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }

    const accessToken = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        perfil: usuario.perfil
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      accessToken,
      tokenType: "Bearer",
      expiresIn: 3600,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: "ERRO_INTERNO",
      message: "Erro ao realizar login.",
      details: [],
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }
}

module.exports = {
  login
};
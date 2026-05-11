const jwt = require("jsonwebtoken");

function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: "TOKEN_AUSENTE",
      message: "Token de autenticação não informado.",
      details: [],
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }

  const partes = authHeader.split(" ");

  if (partes.length !== 2 || partes[0] !== "Bearer") {
    return res.status(401).json({
      error: "TOKEN_INVALIDO",
      message: "Formato do token inválido.",
      details: [],
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }

  const token = partes[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "TOKEN_INVALIDO",
      message: "Token inválido ou expirado.",
      details: [],
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }
}

function autorizarPerfis(...perfisPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        error: "NAO_AUTENTICADO",
        message: "Usuário não autenticado.",
        details: [],
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }

    if (!perfisPermitidos.includes(req.usuario.perfil)) {
      return res.status(403).json({
        error: "SEM_PERMISSAO",
        message: "Usuário não possui permissão para acessar este recurso.",
        details: [],
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }

    next();
  };
}

module.exports = {
  autenticar,
  autorizarPerfis
};
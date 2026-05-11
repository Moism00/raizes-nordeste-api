const bcrypt = require("bcryptjs");
const prisma = require("../src/utils/prisma");

async function main() {
  await prisma.auditoria.deleteMany();
  await prisma.pagamento.deleteMany();
  await prisma.pedidoItem.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.estoque.deleteMany();
  await prisma.fidelidade.deleteMany();
  await prisma.produto.deleteMany();
  await prisma.unidade.deleteMany();
  await prisma.usuario.deleteMany();

  const senhaPadrao = await bcrypt.hash("Senha@123", 10);

  const cliente = await prisma.usuario.create({
    data: {
      nome: "Maria Cliente",
      email: "cliente@exemplo.com",
      senhaHash: senhaPadrao,
      perfil: "CLIENTE",
      telefone: "11999990000",
      consentimentoLGPD: true
    }
  });

  await prisma.usuario.create({
    data: {
      nome: "João Atendente",
      email: "atendente@exemplo.com",
      senhaHash: senhaPadrao,
      perfil: "ATENDENTE",
      telefone: "11988880000",
      consentimentoLGPD: true
    }
  });

  await prisma.usuario.create({
    data: {
      nome: "Ana Cozinha",
      email: "cozinha@exemplo.com",
      senhaHash: senhaPadrao,
      perfil: "COZINHA",
      telefone: "11977770000",
      consentimentoLGPD: true
    }
  });

  await prisma.usuario.create({
    data: {
      nome: "Carlos Admin",
      email: "admin@exemplo.com",
      senhaHash: senhaPadrao,
      perfil: "ADMIN",
      telefone: "11966660000",
      consentimentoLGPD: true
    }
  });

  await prisma.fidelidade.create({
    data: {
      usuarioId: cliente.id,
      saldoPontos: 0,
      consentimento: true
    }
  });

  const unidade = await prisma.unidade.create({
    data: {
      nome: "Raízes do Nordeste - Centro",
      endereco: "Rua Principal, 100",
      cidade: "São Paulo",
      ativo: true
    }
  });

  const baiao = await prisma.produto.create({
    data: {
      nome: "Baião de Dois",
      descricao: "Prato típico nordestino",
      preco: "29.90",
      ativo: true
    }
  });

  const suco = await prisma.produto.create({
    data: {
      nome: "Suco de Cajá",
      descricao: "Bebida natural",
      preco: "8.90",
      ativo: true
    }
  });

  await prisma.estoque.create({
    data: {
      unidadeId: unidade.id,
      produtoId: baiao.id,
      quantidadeDisponivel: 15
    }
  });

  await prisma.estoque.create({
    data: {
      unidadeId: unidade.id,
      produtoId: suco.id,
      quantidadeDisponivel: 30
    }
  });

  console.log("Seed executado com sucesso.");
  console.log("Usuários de teste:");
  console.log("cliente@exemplo.com / Senha@123");
  console.log("atendente@exemplo.com / Senha@123");
  console.log("cozinha@exemplo.com / Senha@123");
  console.log("admin@exemplo.com / Senha@123");
}

main()
  .catch((error) => {
    console.error("Erro ao executar seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
import { NextResponse } from "next/server";

export async function GET() {
  const clientes = [
    {
      id: 1,
      nome: "Floricultura Bella Rosa",
      contato: "Mariana Silva",
      email: "contato@bellarosa.com.br",
      telefone: "(21) 98765-4321",
      cidade: "Niterói",
      uf: "RJ",
      status: "Ativo",
      pedidos_mes: 18,
    },
    {
      id: 2,
      nome: "Jardim das Orquídeas",
      contato: "Carlos Eduardo",
      email: "carlos@jardimorquideas.com",
      telefone: "(21) 99887-1122",
      cidade: "Rio de Janeiro",
      uf: "RJ",
      status: "Ativo",
      pedidos_mes: 24,
    },
    {
      id: 3,
      nome: "Arranjos & Flores Icaraí",
      contato: "Fernanda Costa",
      email: "atendimento@floresicarai.com",
      telefone: "(21) 97654-3210",
      cidade: "Niterói",
      uf: "RJ",
      status: "Ativo",
      pedidos_mes: 12,
    },
    {
      id: 4,
      nome: "Plantas & Paisagismo UFF",
      contato: "Roberto Rocha",
      email: "roberto@paisagismouff.br",
      telefone: "(21) 99123-4567",
      cidade: "Niterói",
      uf: "RJ",
      status: "Em Negociação",
      pedidos_mes: 5,
    },
  ];

  return NextResponse.json(clientes);
}

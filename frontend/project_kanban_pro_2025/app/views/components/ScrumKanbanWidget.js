"use client";

import React from 'react';

const ScrumKanbanMetodologia = () => {
  const secoes = [
    {
      titulo: "1. Estrutura do Fluxo (Kanban)",
      subtitulo: "Quadro visual (Trello/Jira) para visibilidade total.",
      itens: [
        { label: "Colunas Sugeridas", desc: "Backlog → To Do → Doing → Testing/Review → Done." },
        { label: "Limites de WIP", desc: "Estagiário com apenas 1 ou 2 tarefas em 'Doing' para garantir foco e conclusão." },
        { label: "Cartões por Cores", desc: "Diferenciação visual entre Software (Dev) e Hardware/Elétrica (Estagiário)." }
      ]
    },
    {
      titulo: "2. Ciclos de Trabalho (Scrum)",
      subtitulo: "Ritos para manter o alinhamento e evolução constante.",
      itens: [
        { label: "Sprints Curtas", desc: "Ciclos de 1 a 2 semanas com metas tangíveis para o estagiário." },
        { label: "Daily Meeting", desc: "15 min diários para revisar o quadro e remover impedimentos técnicos." },
        { label: "Review & Retrô", desc: "Demonstração do aprendizado e ajuste do processo de trabalho." }
      ]
    },
    {
      titulo: "3. Integração Dev + Eng. Elétrica",
      subtitulo: "Pontos de contato claros entre hardware e software.",
      itens: [
        { label: "DoR (Ready)", desc: "Especificações claras antes do início do circuito ou código." },
        { label: "DoD (Done)", desc: "Código em produção ou simulação/protótipo validado no AnaREDE/Organon." },
        { label: "Mentoria Ativa", desc: "Pair Programming ou revisão técnica integrada no fluxo do quadro." }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-50 rounded-xl shadow-md border border-slate-200">
      <header className="mb-8 border-b border-slate-300 pb-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Metodologia Ágil: Dev & Eng. Elétrica</h2>
        <p className="text-slate-600 mt-2">Aplicação de Scrumban para integração de hardware e software.</p>
      </header>

      <div className="grid gap-8">
        {secoes.map((secao, idx) => (
          <div key={idx} className="group">
            <h3 className="text-xl font-semibold text-blue-700 mb-1 group-hover:text-blue-800 transition-colors">
              {secao.titulo}
            </h3>
            <p className="text-sm text-slate-500 mb-4 italic">{secao.subtitulo}</p>
            
            <ul className="space-y-3">
              {secao.itens.map((item, i) => (
                <li key={i} className="flex flex-col sm:flex-row sm:gap-2 text-slate-700">
                  <span className="font-bold text-slate-900 min-w-[160px]">• {item.label}:</span>
                  <span className="text-slate-600 leading-relaxed">{item.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScrumKanbanMetodologia;

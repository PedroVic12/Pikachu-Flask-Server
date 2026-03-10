"use client";

import React from 'react';

import RecoveryProtocol from './ProtocoloSaudeMental';

const ProtoculoRecuperacaoMental = () => {

return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-50 rounded-xl shadow-md border border-slate-200">
      <header className="mb-8 border-b border-slate-300 pb-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Protocolo de Recuperação Mental</h2>
        <p className="text-slate-600 mt-2">Estratégias para lidar com o estresse, ansiedade, Brain Rot e Burnout no ambiente de trabalho.</p>
      </header>
      <div className="grid gap-8">
        
        
      </div>

    </div>

);

}


const VibeCodingMode = () => {

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-50 rounded-xl shadow-md border border-slate-200">
      <header className="mb-8 border-b border-slate-300 pb-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Vibe Coding Mode</h2>
        <p className="text-slate-600 mt-2">Dicas para criar um ambiente de trabalho produtivo e agradável, promovendo o foco e a criatividade.</p>
      </header>
      <div className="grid gap-8">
        
        <p className="text-slate-700 leading-relaxed">
          Para criar um ambiente de trabalho produtivo e agradável, é importante considerar tanto o espaço físico quanto as práticas diárias. Aqui estão algumas dicas para promover o foco e a criatividade:
        </p>

         <p className="text-slate-700 leading-relaxed">
          O framework PROPER visa transformar o Vibe Coding de um atalho para uma ferramenta de aprendizagem estruturada, incentivando os alunos a se envolverem ativamente com o código gerado, em vez de aceitá-lo passivamente. Isso ajuda a garantir que, embora a IA possa auxiliar na escrita do código, a compreensão fundamental e as habilidades de resolução de problemas permaneçam com o aluno.
        </p>


        <p>
          Para abordar esse problema, foi proposto o framework PROPER, um acrônimo para:
        </p>

        <ul className="list-disc list-inside text-slate-700 leading-relaxed">
          <li><strong>Prompt::</strong> Elaborar um prompt claro e eficaz para a IA..</li>
          <li><strong>Review:</strong> Revisar criticamente o código gerado pela IA..</li>
          <li><strong>Organize:</strong> Estruturar e organizar o código dentro do projeto maior..</li>
          <li><strong>Polish:</strong> Refinar e melhorar o código.</li>
          <li><strong>Extend:</strong> Expandir a funcionalidade além do que foi gerado inicialmente.</li>
          <li><strong>Reflect:</strong> Refletir e ter discernimento sobre o processo de aprendizagem e do resultado criado.</li>
        </ul>

        <h2 className="text-xl font-semibold text-blue-700 mb-1">O Impacto no Papel do Desenvolvedor</h2>

        <p className="text-xl font-semibold text-blue-700 mb-1">O foco está se deslocando da escrita de código para habilidades de nível superior. De acordo com Addy Osmani, líder sênior de engenharia no Google Chrome, as competências cruciais para o futuro incluem:</p>
       
         <ul className="list-disc list-inside text-slate-700 leading-relaxed">
          <li><strong>Gerenciamento da Integração e dos Limites de Sistemas:</strong>Compreender e gerenciar as fronteiras entre componentes, incluindo design de API, esquemas de eventos e modelos de dados</li>
           <li><strong>Pensamento Sistêmico (Systems Thinking):</strong>Uma compreensão avançada de como sistemas complexos interagem e se comportam.</li>
          <li><strong>Fundamentos de Arquitetura de Software</strong>Conhecimento profundo sobre como projetar sistemas robustos, escaláveis e flexíveis.</li>

        </ul>
        
      </div>

    </div>
  
  
  );

}


const ScrumKanbanMetodologia = () => {
  const secoes = [
    {
      titulo: "1. Estrutura do Fluxo (Kanban) para Estagiários e Desenvolvedores",
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

  const headerComponent = () => (
      <header className="mb-8 border-b border-slate-300 pb-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Metodologia Ágil: Dev & Eng. Elétrica</h2>
        <p className="text-slate-600 mt-2">Aplicação de Scrum e Kanban para integração de Eng. Elétrica e Desenvolvimento de Software.</p>
      </header>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-50 rounded-xl shadow-md border border-slate-200">
      {headerComponent()}

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

        {ProtoculoRecuperacaoMental()}

        {RecoveryProtocol()}

        {VibeCodingMode()}
      </div>
    </div>
  );
};

export default ScrumKanbanMetodologia;

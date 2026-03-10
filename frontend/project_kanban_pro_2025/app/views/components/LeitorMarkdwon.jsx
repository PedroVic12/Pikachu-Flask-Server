import React, { useState, useEffect } from 'react';
import { 
  Info, 
  Cpu, 
  BrainCircuit, 
  AlertTriangle, 
  Compass, 
  CheckCircle2, 
  FileText,
  Loader2
} from 'lucide-react';

/**
 * Mapeamento de palavras-chave para ícones
 * O parser usará isso para decidir qual ícone exibir baseado no título da seção
 */
const iconMap = {
  'Definição': Info,
  'Causas': Cpu,
  'Impactos': BrainCircuit,
  'Sinais': AlertTriangle,
  'Recuperação': Compass,
  'default': FileText
};

/**
 * Componente Visual de Bloco de Informação
 */
const ProtocolSection = ({ label, text, subItems }) => {
  // Tenta encontrar um ícone que combine com o label
  const IconComponent = Object.entries(iconMap).find(([key]) => 
    label.toLowerCase().includes(key.toLowerCase())
  )?.[1] || iconMap.default;

  return (
    <div className="group p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 mb-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400">
          <IconComponent size={24} />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
            {label}
          </h4>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {text}
          </p>
          
          {subItems && subItems.length > 0 && (
            <ul className="space-y-3 mt-4">
              {subItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                  <CheckCircle2 size={18} className="text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium italic">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * COMPONENTE PRINCIPAL: Carrega e Renderiza o MD
 */
const MarkdownProtocolViewer = ({ fileName = "declinio-cognitivo.md" }) => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        setLoading(true);
        // Em um ambiente real, você apontaria para: `/notes/${fileName}`
        // Aqui simulamos a resposta do arquivo .md baseado na sua imagem
        const mockMDResponse = `
# Declínio Cognitivo Digital

* **Definição:** Declínio do estado mental ou intelectual resultante do consumo excessivo de conteúdos digitais triviais, superficiais ou "inúteis". Não é diagnóstico médico, mas reflete exaustão cognitiva real no mundo digital.
* **Causas e Mecanismos:** Impulsionado por ciclos de feedback de dopamina e algoritmos de vídeos curtos que viciam o cérebro em gratificação instantânea, promovendo um consumo passivo e fragmentado.
* **Impactos Cognitivos:** O uso desordenado leva ao encurtamento da capacidade de atenção, dificuldades de memória, "névoa mental" (brain fog), aumento da ansiedade e isolamento social.
* **Sinais de Alerta:** Dificuldade em manter o foco em tarefas complexas, irritabilidade ao estar offline, uso excessivo de gírias de internet e sedentarismo.
* **Caminho para a Recuperação:** Efeitos são reversíveis através da neuroplasticidade. Estratégias fundamentais incluem:
    a. Estabelecer limites rigorosos de tempo de tela e silenciar notificações.
    b. Trocar o consumo passivo por atividades estimulantes, como a leitura de livros físicos e novos hobbies.
        `;

        // Simulando o delay do fetch
        await new Promise(resolve => setTimeout(resolve, 800));
        
        parseMarkdown(mockMDResponse);
        setLoading(false);
      } catch (err) {
        setError("Não foi possível carregar o arquivo de notas.");
        setLoading(false);
      }
    };

    fetchMarkdown();
  }, [fileName]);

  /**
   * Parser simples para transformar o MD em objetos
   */
  const parseMarkdown = (mdString) => {
    const lines = mdString.split('\n');
    const sections = [];
    let currentSection = null;

    lines.forEach(line => {
      const trimmed = line.trim();
      
      // Detecta o padrão "* **Título:** Descrição"
      const match = trimmed.match(/^\*\s+\*\*(.*?):\*\*\s+(.*)/);
      
      if (match) {
        if (currentSection) sections.push(currentSection);
        currentSection = {
          label: match[1],
          text: match[2],
          subItems: []
        };
      } 
      // Detecta sub-itens (a., b., ou apenas identação)
      else if (currentSection && trimmed.match(/^[a-z]\.\s+(.*)/)) {
        const subMatch = trimmed.match(/^[a-z]\.\s+(.*)/);
        currentSection.subItems.push(subMatch[1]);
      }
    });

    if (currentSection) sections.push(currentSection);
    setContent(sections);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 text-gray-500">
      <Loader2 className="animate-spin mb-4" size={40} />
      <p>Carregando notas do protocolo...</p>
    </div>
  );

  if (error) return (
    <div className="p-10 text-center text-red-500 bg-red-50 rounded-xl border border-red-100">
      {error}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <header className="mb-10 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
            Notas de Recuperação
          </h1>
          <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
            <FileText size={16} /> Arquivo: {fileName}
          </p>
        </div>
      </header>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {content.map((section, idx) => (
          <ProtocolSection 
            key={idx}
            label={section.label}
            text={section.text}
            subItems={section.subItems}
          />
        ))}
      </div>
    </div>
  );
};


export default MarkdownProtocolViewer;

// export default function App() {
//   return (
//     <div className="min-h-screen bg-white dark:bg-gray-950">
//       <MarkdownProtocolViewer fileName="protocolo-cognitivo.md" />
//     </div>
//   );
// }
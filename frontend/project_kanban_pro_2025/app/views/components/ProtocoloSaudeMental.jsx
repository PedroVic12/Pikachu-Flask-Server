import React from 'react';
import { 
  Timer, 
  Smartphone, 
  BellOff, 
  Moon, 
  Activity, 
  Utensils, 
  BookOpen, 
  Puzzle, 
  Brain, 
  Trees, 
  Users, 
  CalendarX 
} from 'lucide-react';

/**
 * Componente de Item Individual dentro do Card
 */
const ProtocolItem = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-4 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
    <div className="text-gray-600 dark:text-gray-400">
      {Icon && <Icon size={24} strokeWidth={1.5} />}
    </div>
    <span className="text-gray-800 dark:text-gray-200 font-medium text-lg">
      {text}
    </span>
  </div>
);

/**
 * Componente de Card Customizável
 * @param {string} title - Título do card
 * @param {Array} items - Lista de objetos { icon, text }
 * @param {string} variant - 'orange' ou 'green' para o esquema de cores
 */
const ProtocolCard = ({ title, items, variant = 'orange' }) => {
  const themes = {
    orange: "border-orange-200 dark:border-orange-900/30 text-orange-700 dark:text-orange-400",
    green: "border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400"
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-2 ${themes[variant]} flex flex-col h-full`}>
      <h3 className={`text-2xl font-bold text-center uppercase tracking-wider mb-6 ${themes[variant]}`}>
        {title}
      </h3>
      <div className="space-y-2 flex-grow">
        {items.map((item, index) => (
          <ProtocolItem key={index} icon={item.icon} text={item.text} />
        ))}
      </div>
    </div>
  );
};

/**
 * Componente Principal que organiza o Grid (Equivalente ao seu ScrumKanbanMetodologia)
 */
const RecoveryProtocol = () => {
  const protocolData = [
    {
      title: "Digital",
      variant: "orange",
      items: [
        { icon: Timer, text: "Limite 60 min/dia" },
        { icon: Smartphone, text: "Apps de Bloqueio" },
        { icon: BellOff, text: "Notificações Off" },
      ]
    },
    {
      title: "Físico",
      variant: "green",
      items: [
        { icon: Moon, text: "Sono 7-9h" },
        { icon: Activity, text: "150 min exercício/semana" },
        { icon: Utensils, text: "Dieta rica em nutrientes" },
      ]
    },
    {
      title: "Mental",
      variant: "orange",
      items: [
        { icon: BookOpen, text: "Leitura diária" },
        { icon: Puzzle, text: "Hobbies complexos" },
        { icon: Brain, text: "Mindfulness" },
      ]
    },
    {
      title: "Social",
      variant: "green",
      items: [
        { icon: Trees, text: "Natureza (30 min)" },
        { icon: Users, text: "Encontros presenciais" },
        { icon: CalendarX, text: "Detox periódico" },
      ]
    }
  ];

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-orange-800 dark:text-orange-500">
            O Protocolo de Recuperação: <span className="font-light">Resumo</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {protocolData.map((data, index) => (
            <ProtocolCard 
              key={index}
              title={data.title}
              variant={data.variant}
              items={data.items}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecoveryProtocol;
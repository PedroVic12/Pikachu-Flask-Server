import { create } from 'zustand';

export const useProjectStore = create((set) => ({
    status: 'atencao', // Exemplo: 'normal' ou 'atencao'
    setStatus: (newStatus) => set({ status: newStatus }),
}));



function ProjectBadge() {
    const { status } = useProjectStore();
    const projects = [1, 2, 3]; // Exemplo

    return (
        <span className={`
      ${status === 'atencao' ? 'text-red-500' : 'text-blue-500'} 
      bg-gray-100 dark:bg-gray-700 
      text-lg font-bold px-3 py-1 rounded-full
    `}>
            {projects.length}
        </span>
    );
}

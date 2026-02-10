import React from 'react';
import { Edit3, GripVertical, Plus } from 'lucide-react';

// ========== HELPERS ==========
import { CATEGORIES, STATUS_COLUMNS } from '../controllers/Repository.jsx';



// ========== HELPERS ========== 
const calculateProgress = (content) => { // Removed type annotations
    if (!content) {
        return { total: 0, completed: 0, percentage: 0 };
    }

    const checklistRegex = /- \[( |x)\]/gi;
    const completedRegex = /- \[x\]/gi;

    const total = (content.match(checklistRegex) || []).length;
    const completed = (content.match(completedRegex) || []).length;

    if (total === 0) {
        return { total: 0, completed: 0, percentage: 0 };
    }

    const percentage = Math.round((completed / total) * 100);
    return { total, completed, percentage };
};


// ========== COMPONENTS ==========


// Removed interface ProjectCardProps
const ProjectCard = ({ project, onEdit, onDragStart }) => { // Removed React.FC<ProjectCardProps> and type annotations
    const categoryInfo = CATEGORIES[project.category] || CATEGORIES.ons; // Removed CategoryKey cast
    const { total, completed, percentage } = calculateProgress(project.content);
    // Extract base background and border classes from categoryInfo.color for the card itself
    // Assuming categoryInfo.color might now contain dark mode variants directly
    const baseCardBgClass = categoryInfo.color.split(' ').find(cls => cls.startsWith('bg-') && !cls.startsWith('dark:bg-')) || 'bg-white';
    const baseCardBorderClass = categoryInfo.color.split(' ').find(cls => cls.startsWith('border-') && !cls.startsWith('dark:border-')) || 'border-gray-100';
    const darkCardBgClass = categoryInfo.color.split(' ').find(cls => cls.startsWith('dark:bg-')) || 'dark:bg-gray-800';
    const darkCardBorderClass = categoryInfo.color.split(' ').find(cls => cls.startsWith('dark:border-')) || 'dark:border-gray-700';


    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, project)}
            onClick={() => onEdit(project)}
            className={`${baseCardBgClass} ${darkCardBgClass} rounded-lg p-3 cursor-pointer hover:brightness-95 dark:hover:brightness-125 transition-all duration-200 hover:shadow-md dark:hover:shadow-lg ${baseCardBorderClass} ${darkCardBorderClass} group`}
        >
            <div className="flex items-start justify-between mb-2">
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                    <span>{categoryInfo.emoji} </span>
                </div>
                <GripVertical
                    size={14}
                    className="text-gray-400 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
                />
            </div>

            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm line-clamp-2">
                {project.title}
            </h3>

            <p className="text-xs text-gray-900 dark:text-gray-100 line-clamp-2 mb-2">
                {(project.content || '').replace(/[#*`]/g, '').substring(0, 80)}...
            </p>

            {total > 0 && (
                <div className="mt-3">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs  font-bold text-gray-900 dark:text-gray-100">Progresso</span>
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{completed}/{total}</span>
                    </div>
                    <div className="w-full bg-gray-200/70 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                            className="bg-blue-900 h-1.5 rounded-full" // This color might need dark variant too, but it's a fixed progress bar color
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-900 dark:text-gray-100 mt-2">
                <span>{project.updatedAt.toLocaleDateString('pt-BR')}</span>
                <Edit3 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </div>
    );
};

// Helper: decide a color class for a Kanban column based on its status/name.
// Returns tailwind utility classes to apply to the column container.
const getColumnColorClass = (status) => {
    if (!status || typeof status !== 'string') return 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700';

    const s = status.toLowerCase();

    // Red: urgent / blocked / impediment
    if (s.includes('urg') || s.includes('bloque') || s.includes('block') || s.includes('tarefa')) {
        return 'bg-red-100 dark:bg-red-800 border-red-200 dark:border-red-700';
    }

    // Green: done / finished / ready
    if (s.includes('done') || s.includes('finaliz') || s.includes('ready') || s.includes('conclu')) {
        return 'bg-green-400 dark:bg-green-700 border-green-200 dark:border-green-600';
    }

    // Blue: default (in progress / backlog / todo)
    return 'bg-gray-100 dark:bg-blue-800 border-blue-200 dark:border-blue-600';
}

const KanbanColumn = ({
    status,
    projects,
    onProjectEdit,
    onProjectCreate,
    onDragOver,
    onDrop,
    onDragStart
}) => { // Removed React.FC<KanbanColumnProps> and type annotations
    const columnInfo = STATUS_COLUMNS[status];

    // The colorClass now contains light and dark variants
    const colorClass = getColumnColorClass(columnInfo?.title || status);

    return (
        <div
            className={`${colorClass} rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 min-w-80 md:min-w-0`}
            style={{ borderWidth: 1 }}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, status)}
        >
            <div className="flex items-center justify-between mb-4" >
                <div className="flex items-center gap-2" >
                    <span className="text-xl text-gray-900 dark:text-gray-100" > {columnInfo.emoji} </span>
                    < h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm" > {columnInfo.title} </h2>
                    < span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full" >
                        {projects.length}
                    </span>
                </div>
                < button
                    onClick={() => onProjectCreate(status)}
                    className="p-1 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                    <Plus size={16} />
                </button>
            </div>

            < div className="space-y-3" >
                {
                    projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onEdit={onProjectEdit}
                            onDragStart={onDragStart}
                        />
                    ))
                }
            </div>
        </div>
    );
};

export default KanbanColumn;

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
    const [bgColor] = categoryInfo.color.split(' ');

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, project)}
            onClick={() => onEdit(project)}
            className={`${bgColor} rounded-lg p-3 cursor-pointer hover:brightness-95 transition-all duration-200 hover:shadow-md border-gray-100 group`}
        >
            <div className="flex items-start justify-between mb-2">
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                    <span>{categoryInfo.emoji} </span>
                </div>
                <GripVertical
                    size={14}
                    className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
                />
            </div>

            <h3 className="font-medium text-gray-900 mb-2 text-sm line-clamp-2">
                {project.title}
            </h3>

            <p className="text-xs text-gray-900 line-clamp-2 mb-2">
                {(project.content || '').replace(/[#*`]/g, '').substring(0, 80)}...
            </p>

            {total > 0 && (
                <div className="mt-3">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs  font-bold text-gray-900">Progresso</span>
                        <span className="text-xs font-bold text-gray-600">{completed}/{total}</span>
                    </div>
                    <div className="w-full bg-gray-200/70 rounded-full h-1.5">
                        <div
                            className="bg-blue-900 h-1.5 rounded-full"
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between text-xs text-black-900 mt-2">
                <span>{project.updatedAt.toLocaleDateString('pt-BR')}</span>
                <Edit3 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </div>
    );
};

// Helper: decide a color class for a Kanban column based on its status/name.
// Returns tailwind utility classes to apply to the column container.
const getColumnColorClass = (status) => {
    if (!status || typeof status !== 'string') return 'bg-white';

    const s = status.toLowerCase();

    // Red: urgent / blocked / impediment
    if (s.includes('urg') || s.includes('bloque') || s.includes('block') || s.includes('imped')) {
        return 'bg-red-100 border-red-200';
    }

    // Green: done / finished / ready
    if (s.includes('done') || s.includes('finaliz') || s.includes('ready') || s.includes('conclu')) {
        return 'bg-green-200 border-green-200';
    }

    // Blue: default (in progress / backlog / todo)
    return 'bg-grey-100 border-blue-200';
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

    const colorClass = getColumnColorClass(columnInfo?.title || status);

    return (
        <div
            className={`${colorClass} rounded-xl shadow-sm border p-4 min-w-80 md:min-w-0`}
            style={{ borderWidth: 1 }}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, status)}
        >
            <div className="flex items-center justify-between mb-4" >
                <div className="flex items-center gap-2" >
                    <span className="text-xl" > {columnInfo.emoji} </span>
                    < h2 className="font-semibold text-gray-900 text-sm" > {columnInfo.title} </h2>
                    < span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full" >
                        {projects.length}
                    </span>
                </div>
                < button
                    onClick={() => onProjectCreate(status)}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
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

import React from "react";
import { getProjectsByStatus, openItemEditor, createNewItem, handleDragOver, handleDrop, handleDragStart } from "../controllers/Repository.jsx";
import KanbanColumn from "../widgets/KanbanColumn.jsx";
import { STATUS_COLUMNS } from "../controllers/Repository.jsx";



const KanbanScreen = () => {
    const columns = Object.keys(STATUS_COLUMNS); // Removed type annotation

    return (
        <div className="p-4 lg:p-6 bg-white dark:bg-gray-900">
            <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {" "}
                    Kanban PRO Board 2026{" "}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    {" "}
                    Organize seus projetos visualmente utilizando métodos de SCRUM, XP
                    programming e Design Patterns para programação de softwares Desktop,
                    Websites, Aplicativos Móveis, Robos RPA e muito mais!
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto">
                {columns.map((status) => (
                    <KanbanColumn
                        key={status}
                        status={status}
                        projects={getProjectsByStatus(status)}
                        onProjectEdit={openItemEditor}
                        onProjectCreate={createNewItem}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onDragStart={handleDragStart}
                    />
                ))}
            </div>
        </div>
    );
};

export default KanbanScreen;
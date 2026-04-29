import React, { useState } from "react";
import KanbanColumn from "../../widgets/KanbanContainer.jsx";
import { STATUS_COLUMNS } from "../../controllers/Repository.jsx";
import MonitoramentoPage from "./MonitoramentePage.jsx";

class KanbanController {
    constructor(projects, setProjects, editingItem, setEditingItem, draggedItem, setDraggedItem) {
        this.projects = projects;
        this.setProjects = setProjects;
        this.editingItem = editingItem;
        this.setEditingItem = setEditingItem;
        this.draggedItem = draggedItem;
        this.setDraggedItem = setDraggedItem;
    }

    handleExport() {
        try {
            // Implementar exportação para Excel
            console.log("Exportando projetos para Excel...", this.projects);
            alert("Projetos exportados com sucesso!");
        } catch (error) {
            alert("Erro ao exportar: " + error.message);
        }
    }

    handleImport = async (file) => {
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                const importedProjects = JSON.parse(e.target.result);
                this.setProjects(importedProjects);
                alert("Dados de projetos importados com sucesso!");
                console.log("Projetos importados:", importedProjects);
            };
            reader.readAsText(file);
        } catch (error) {
            alert(error instanceof Error ? error.message : "Erro ao importar arquivo");
        }
    };

    handleSync() {
        try {
            // Sincronizar projetos
            console.log("Sincronizando dados...", this.projects);
            alert("Dados sincronizados!");
        } catch (error) {
            alert("Erro ao sincronizar: " + error.message);
        }
    }

    handleDragStart = (e, item) => {
        this.setDraggedItem(item);
        e.dataTransfer.effectAllowed = "move";
    };

    handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    handleDrop = (e, newStatus) => {
        e.preventDefault();
        if (this.draggedItem) {
            this.moveProject(this.draggedItem.id, newStatus);
            this.setDraggedItem(null);
        }
    };

    openItemEditor = (item) => {
        this.setEditingItem(item);
    };

    handleSaveItem = (updates) => {
        if (this.editingItem) {
            this.updateProject(this.editingItem.id, updates);
        }
    };

    handleDeleteItem = (itemId) => {
        this.deleteProject(itemId);
        this.setEditingItem(null);
    };

    createNewItem = (status) => {
        const newItem = {
            id: Date.now().toString(),
            title: "Novo Item",
            status,
            category: "ons",
            content: "# Novo Item\n\nDescreva aqui o conteúdo...",
            createdAt: new Date(),
            updatedAt: new Date(),
            files: [],
        };

        this.addProject(newItem);
        this.openItemEditor(newItem);
    };

    // Utility Functions
    getProjectsByStatus = (status) => {
        return this.projects.filter((item) => item.status === status);
    };

    getFilteredProjects = (searchTerm, filterCategory) => {
        let filtered = this.projects;

        if (searchTerm) {
            filtered = filtered.filter(
                (item) =>
                    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (item.content || "").toLowerCase().includes(searchTerm.toLowerCase()),
            );
        }

        if (filterCategory && filterCategory !== "all") {
            filtered = filtered.filter((item) => item.category === filterCategory);
        }

        return filtered;
    };

    getStatusStats = () => {
        return Object.keys(STATUS_COLUMNS).reduce((acc, status) => {
            acc[status] = this.projects.filter((item) => item.status === status).length;
            return acc;
        }, {});
    };

    getCategoryStats = () => {
        const CATEGORIES = { ons: "ONS", rpa: "RPA", web: "Website", mobile: "Mobile", desktop: "Desktop" };
        return Object.keys(CATEGORIES).reduce((acc, category) => {
            acc[category] = this.projects.filter((item) => item.category === category).length;
            return acc;
        }, {});
    };

    // Data Management Methods
    addProject = (project) => {
        this.setProjects([...this.projects, project]);
    };

    updateProject = (projectId, updates) => {
        const updated = this.projects.map((item) =>
            item.id === projectId ? { ...item, ...updates, updatedAt: new Date() } : item
        );
        this.setProjects(updated);
        this.setEditingItem(null);
    };

    deleteProject = (projectId) => {
        const filtered = this.projects.filter((item) => item.id !== projectId);
        this.setProjects(filtered);
    };

    moveProject = (projectId, newStatus) => {
        const updated = this.projects.map((item) =>
            item.id === projectId ? { ...item, status: newStatus } : item
        );
        this.setProjects(updated);
    };
}

const KanbanScreen = () => {
    // Estado do Kanban
    const [projects, setProjects] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [draggedItem, setDraggedItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");

    // Instanciar o controller com o estado
    const controller = new KanbanController(
        projects,
        setProjects,
        editingItem,
        setEditingItem,
        draggedItem,
        setDraggedItem
    );

    const columns = Object.keys(STATUS_COLUMNS);

    return (
        <div className="p-4 lg:p-6 bg-white dark:bg-gray-900">
            <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Kanban PRO Board 2026
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Organize seus projetos visualmente utilizando métodos de SCRUM, XP
                    programming e Design Patterns para programação de softwares Desktop,
                    Websites, Aplicativos Móveis, Robos RPA e muito mais!
                </p>
                <div className="flex gap-4 mt-4">
                    <MonitoramentoPage></MonitoramentoPage>

                </div>

                {/* Toolbar */}
                <div className="flex gap-2 mt-4 flex-wrap">
                    <button
                        onClick={() => controller.handleExport()}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Exportar
                    </button>
                    <button
                        onClick={() => controller.handleSync()}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Sincronizar
                    </button>
                    <input
                        type="file"
                        accept=".json"
                        onChange={(e) => e.target.files && controller.handleImport(e.target.files[0])}
                        className="px-4 py-2 border rounded"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto">
                {columns.map((status) => (
                    <KanbanColumn
                        key={status}
                        status={status}
                        projects={controller.getProjectsByStatus(status)}
                        onProjectEdit={controller.openItemEditor}
                        onProjectCreate={controller.createNewItem}
                        onProjectDelete={controller.handleDeleteItem}
                        onDragStart={controller.handleDragStart}
                        onDragOver={controller.handleDragOver}
                        onDrop={controller.handleDrop}
                    />
                ))}
            </div>
        </div>
    );
};

export default KanbanScreen;
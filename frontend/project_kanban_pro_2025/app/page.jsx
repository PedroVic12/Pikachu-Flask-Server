"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  LayoutDashboard,
  Table,
  Kanban,
  Menu,
  X,
  Edit3,
  Trash2,
  Upload,
  Download,
  FolderSync as Sync,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  Database,
  Sun,
  Moon,
  Flame,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent } from "@/components/ui/card";

//! upgrade separando estilos
import colorClasses from "./styles.js";

//! logica de negocios com backend
import projectRepository, {
  CATEGORIES,
  STATUS_COLUMNS,
} from "./controllers/Repository.jsx";

// Widget do componente da Coluna Kanban
import KanbanColumn from "./widgets/KanbanContainer.jsx";
import ItemEditor from "./views/components/EditorModalProject.js";
import PlannerONSPage from "./views/pages/Planner_ONS_Page.jsx";
import OlaMundo from "./views/HTML/OlaMundo.jsx";

// ========== HOOKS ==========
const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const initialProjects = await projectRepository.loadProjects();
      setProjects(initialProjects || []);
      setIsLoaded(true);
    };
    fetchData();
  }, []);

  const addProject = (project) => {
    setProjects((prev) => [...prev, project]);
  };

  const updateProject = (id, updates) => {
    setProjects((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date() } : item,
      ),
    );
  };

  const deleteProject = (id) => {
    setProjects((prev) => prev.filter((item) => item.id !== id));
  };

  const moveProject = (projectId, newStatus) => {
    updateProject(projectId, { status: newStatus });
  };

  return {
    projects,
    addProject,
    updateProject,
    deleteProject,
    moveProject,
    setProjects,
  };
};

// ========== COMPONENTS ==========
const Sidebar = ({
  currentScreen,
  onScreenChange,
  onExport,
  onImport,
  onSync,
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  theme,
  onToggleTheme,
}) => {
  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      event.target.value = "";
    }
  };

  // Menu simplificado e limpo conforme solicitado (Habitos e API removidos por enquanto)
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "kanban", label: "Kanban", icon: Kanban },
    { id: "planner", label: "Planner ONS", icon: Table },
  ];

  const actionItems = [
    {
      id: "sync",
      label: "Salvar Alterações",
      icon: Sync,
      onClick: onSync,
      color: "text-green-700 hover:bg-green-50",
    },
    {
      id: "import",
      label: "Importar Excel",
      icon: Upload,
      onClick: handleImportClick,
    },
    {
      id: "export",
      label: "Exportar Excel",
      icon: Download,
      onClick: onExport,
    },
    {
      id: "theme-toggle",
      label: theme === "light" ? "Modo Escuro" : "Modo Claro",
      icon: theme === "light" ? Moon : Sun,
      onClick: onToggleTheme,
      color: "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
    },
  ];

  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:inset-0 ${
          isCollapsed ? "lg:w-20" : "w-64"
        }`}
      >
        <div
          className={`flex items-center justify-between h-16 border-b border-gray-200 dark:border-gray-700 ${
            isCollapsed ? "px-2" : "px-4"
          }`}
        >
          <h1
            className={`text-xl font-bold text-gray-900 dark:text-gray-100 ${
              isCollapsed ? "hidden" : "block"
            }`}
          >
            Kanban Pro
          </h1>

          <div className="flex items-center gap-1">
            <button
              onClick={onToggleCollapse}
              className="hidden lg:inline-flex p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700"
              aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
              title={isCollapsed ? "Expandir" : "Recolher"}
            >
              {isCollapsed ? (
                <ChevronRight size={20} />
              ) : (
                <ChevronLeft size={20} />
              )}
            </button>

            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700"
              aria-label="Fechar menu"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className={`mt-8 ${isCollapsed ? "px-2" : "px-4"}`}>
          <div className="space-y-2">
            {menuItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  onScreenChange(id);
                  onClose();
                }}
                title={label}
                className={`w-full flex items-center ${
                  isCollapsed ? "justify-center px-3" : "px-4"
                } py-3 text-left rounded-lg transition-colors ${
                  currentScreen === id
                    ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-200"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <Icon size={20} className={isCollapsed ? "" : "mr-3"} />
                {!isCollapsed && label}
              </button>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              {actionItems.map(({ id, label, icon: Icon, onClick, color }) => (
                <button
                  key={id}
                  onClick={onClick}
                  title={label}
                  className={`w-full flex items-center ${
                    isCollapsed ? "justify-center px-3" : "px-4"
                  } py-3 text-left rounded-lg transition-colors ${
                    color || "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon size={20} className={isCollapsed ? "" : "mr-3"} />
                  {!isCollapsed && label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [editingItem, setEditingItem] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showWipModal, setShowWipModal] = useState(false);

  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) return savedTheme;
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "dark";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    moveProject,
    setProjects,
  } = useProjects();

  useEffect(() => {
    const inProgressCount = projects.filter((p) => p.status === "in progress").length;
    if (inProgressCount > 4) {
      setShowWipModal(true);
    }
  }, [projects]);

  const getScreenTitle = () => {
    switch (currentScreen) {
      case "dashboard":
        return "Dashboard Geral";
      case "kanban":
        return "Quadro Kanban PRO";
      case "planner":
        return "Planner ONS & PVRV Web DEV Core";
      default:
        return "Dashboard";
    }
  };

  const handleExport = () => {
    projectRepository.exportToXLSX(projects);
  };

  const handleImport = async (file) => {
    try {
      const importedProjects = await projectRepository.importFromXLSX(file);
      setProjects(importedProjects);
      alert(`${importedProjects.length} projetos importados com sucesso!`);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Erro ao importar arquivo",
      );
    }
  };

  const handleSync = () => {
    projectRepository.saveProjects(projects);
    alert("Dados sincronizados com sucesso!");
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (draggedItem) {
      moveProject(draggedItem.id, newStatus);
      setDraggedItem(null);
    }
  };

  const openItemEditor = (item) => {
    setEditingItem(item);
  };

  const handleSaveItem = (updates) => {
    if (editingItem) {
      updateProject(editingItem.id, updates);
    }
  };

  const handleDeleteItem = (itemId) => {
    deleteProject(itemId);
    setEditingItem(null);
  };

  const createNewItem = (status) => {
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

    addProject(newItem);
    openItemEditor(newItem);
  };

  const getProjectsByStatus = (status) => {
    return projects.filter((item) => item.status === status);
  };

  const getStatusStats = () => {
    return Object.keys(STATUS_COLUMNS).reduce((acc, status) => {
      acc[status] = projects.filter((item) => item.status === status).length;
      return acc;
    }, {});
  };

  const getCategoryStats = () => {
    return Object.keys(CATEGORIES).reduce((acc, category) => {
      acc[category] = projects.filter(
        (item) => item.category === category,
      ).length;
      return acc;
    }, {});
  };

  const DashboardScreen = () => {
    const statusStats = getStatusStats();
    const categoryStats = getCategoryStats();
    const totalProjects = projects.length;
    const completedProjects = projects.filter(
      (p) => p.status === "agentes (c3po, jarvis)",
    ).length;
    const progressRate =
      totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

    const statCards = [
      {
        label: "Total de Projetos",
        value: totalProjects,
        icon: BarChart3,
        color: "blue",
      },
      {
        label: "Em Progresso",
        value: statusStats["in progress"] || 0,
        icon: Clock,
        color: "orange",
      },
      {
        label: "Finalizados",
        value: completedProjects,
        icon: TrendingUp,
        color: "green",
      },
      {
        label: "Taxa de Conclusão",
        value: `${progressRate.toFixed(1)}%`,
        icon: Users,
        color: "purple",
      },
    ];

    return (
      <div className="p-4 lg:p-6 bg-white dark:bg-gray-900">
        <div className="mb-8">
          <OlaMundo />
        </div>

        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Visão geral dos seus projetos e atividades
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {value}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-gray-700 rounded-lg text-blue-600 dark:text-blue-400">
                  <Icon size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const KanbanScreen = () => {
    const columns = Object.keys(STATUS_COLUMNS);

    return (
      <div className="p-4 lg:p-6 bg-white dark:bg-gray-900">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Kanban PRO Board 2026
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Organize seus projetos visualmente utilizando métodos de SCRUM, XP e Design Patterns.
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

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case "dashboard":
        return <DashboardScreen />;
      case "kanban":
        return <KanbanScreen />;
      case "planner":
        return <PlannerONSPage />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar
        currentScreen={currentScreen}
        onScreenChange={setCurrentScreen}
        onExport={handleExport}
        onImport={handleImport}
        onSync={handleSync}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="flex-1 flex flex-col lg:ml-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {getScreenTitle()}
            </h1>
          </div>
          
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/50 rounded-lg transition-all"
          >
            🏋️ Ir para Gohan Treinamentos
          </a>
        </header>

        <main className="flex-1 overflow-auto">{renderCurrentScreen()}</main>
      </div>

      <ItemEditor
        item={editingItem}
        isOpen={!!editingItem}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
        onClose={() => setEditingItem(null)}
      />

      {showWipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="bg-gray-900 border-2 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.55)] rounded-2xl p-8 max-w-md w-full mx-4 text-center text-white">
            <div className="text-red-500 text-5xl mb-4 animate-bounce">🚨</div>
            <h2 className="text-xl font-bold uppercase tracking-wider mb-3 text-red-400">
              Batcaverna Alerta: WIP Limit!
            </h2>
            <p className="text-gray-300 mb-6 text-sm leading-relaxed">
              Você possui <span className="text-red-400 font-bold">{projects.filter(p => p.status === "in progress").length} tarefas</span> ativas em <span className="text-yellow-400 font-semibold">IN PROGRESS</span>.
              <br /><br />
              Conforme as diretrizes da <b>Batcaverna 2026</b>, seu limite máximo para evitar dispersão mental e sobrecarga é de <b>4 tarefas ativas</b> (sendo no máximo 3 CLT/ONS e 2 Estudos UFF).
            </p>
            <button
              onClick={() => setShowWipModal(false)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-lg hover:shadow-red-500/25"
            >
              Entendido, vou focar!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

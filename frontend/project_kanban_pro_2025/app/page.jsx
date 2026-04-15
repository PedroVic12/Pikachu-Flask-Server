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
  FileText,
  Kanban,
  Menu,
  X,
  Plus,
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

  FileImage,
  FileSpreadsheet,
  File as FilePdf,
  Database,
  Sun,
  Moon,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

//! updrade separando estilos
import colorClasses from "./styles.js";

//! logica de negocios com backend
import projectRepository, {
  CATEGORIES,
  STATUS_COLUMNS,
} from "./controllers/Repository.jsx";
import FileUploaderController from "./controllers/FileUploaderController.js";

// Widget do componente da Coluna Kanban
import KanbanColumn from "./widgets/KanbanContainer.jsx";
import ScrumKanbanMetodologia from "./views/components/ScrumKanbanWidget.js";

//! importando compoenentes e outras paginas
import ApiDataScreen from "./api-data/APIDataScreen.jsx";
import OlaMundo from "./views/HTML/OlaMundo.jsx";
import ItemEditor from "./views/components/EditorModalProject.js";
import PVRVWebDevPage from "./views/pages/PVRVWebDevPage.jsx";
import DeckStorageController from "./controllers/DeckStorageController.js";
import MonitoramentoPage from "./views/pages/MonitoramentePage.jsx";

// Usar essa pagina no projeto Dashboard Web SP + SECO para ONS PLC
//import ProjectHubPage from "./views/pages/ProjectHubPage.jsx";

// ========== HOOKS ==========
const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Efeito para carregar os dados da API na inicialização
  useEffect(() => {
    const fetchData = async () => {
      const initialProjects = await projectRepository.loadProjects();
      setProjects(initialProjects || []); // Garante que seja um array
      setIsLoaded(true);
    };
    fetchData();
  }, []); // Roda apenas uma vez, no início

  // O useEffect para salvar automaticamente foi removido para dar prioridade ao botão "Sincronizar"

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
  theme, // New prop
  onToggleTheme, // New prop
}) => {
  // Removed React.FC<SidebarProps>
  const fileInputRef = useRef(null); // Removed type annotation

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    // Removed type annotation
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      event.target.value = ""; // Reset input
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "kanban", label: "Kanban", icon: Kanban },
    { id: "table", label: "Tabelas", icon: Table },
    { id: "files", label: "Arquivos", icon: FileText },
    { id: "api-data", label: "API", icon: Database },
    { id: "pvrv-web-dev", label: "PVRV Web DEV", icon: LayoutDashboard },
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
      // New theme toggle item
      id: "theme-toggle",
      label: theme === "light" ? "Modo Escuro" : "Modo Claro",
      icon: theme === "light" ? Moon : Sun,
      onClick: onToggleTheme,
      color:
        "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
    },
  ];

  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 lg:static lg:inset-0 ${isCollapsed ? "lg:w-20" : "w-64"
          }`}
      >
        <div
          className={`flex items-center justify-between h-16 border-b border-gray-200 dark:border-gray-700 ${isCollapsed ? "px-2" : "px-4"}`}
        >
          <h1
            className={`text-xl font-bold text-gray-900 dark:text-gray-100 ${isCollapsed ? "hidden" : "block"
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
                className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "px-4"
                  } py-3 text-left rounded-lg transition-colors ${currentScreen === id
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
                  className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "px-4"
                    } py-3 text-left rounded-lg transition-colors ${color || "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"}
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

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
};

// ========== MAIN APP COMPONENT ==========
export default function App() {
  const [currentScreen, setCurrentScreen] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // Removed type annotation
  const [draggedItem, setDraggedItem] = useState(null); // Removed type annotation
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all"); // Removed type annotation
  const [theme, setTheme] = useState("light"); // Add theme state

  // Effect to apply theme class and save to localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");
      return newTheme;
    });
  };

  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    moveProject,
    setProjects,
  } = useProjects();

  // Event Handlers
  const handleExport = () => {
    projectRepository.exportToExcel(projects);
  };

  const handleImport = async (file) => {
    // Removed type annotation
    try {
      const importedProjects = await projectRepository.importFromExcel(file);
      setProjects(importedProjects);
      alert("Dados de projetos importados com sucesso!");

      // Restore functionality: Also add the imported Excel file to the FilesScreen list
      const reader = new FileReader();
      reader.onload = (e) => {
        const newFile = {
          name: file.name,
          type: "excel",
          url: e.target.result,
        };
        const currentFiles = FileUploaderController.loadFiles() || []; // Defensive check
        const newFiles = [...currentFiles, newFile];
        const success = FileUploaderController.saveFiles(newFiles);
        if (success) {
          console.log(
            `Imported Excel file '${file.name}' also saved to file list.`,
          );
        } else {
          console.error(
            `Failed to save imported Excel file '${file.name}' to file list.`,
          );
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Erro ao importar arquivo",
      );
    }
  };

  const handleSync = () => {
    projectRepository.saveProjects(projects);
    alert("Dados sincronizados!");
  };

  const handleDragStart = (e, item) => {
    // Removed type annotations
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    // Removed type annotation
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, newStatus) => {
    // Removed type annotations
    e.preventDefault();
    if (draggedItem) {
      moveProject(draggedItem.id, newStatus);
      setDraggedItem(null);
    }
  };

  const openItemEditor = (item) => {
    // Removed type annotation
    setEditingItem(item);
  };

  const handleSaveItem = (updates) => {
    // Removed type annotation
    if (editingItem) {
      updateProject(editingItem.id, updates);
    }
  };

  const handleDeleteItem = (itemId) => {
    // Removed type annotation
    deleteProject(itemId);
    setEditingItem(null);
  };

  const createNewItem = (status) => {
    // Removed type annotation
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

  // Utility Functions
  const getProjectsByStatus = (status) => {
    // Removed type annotation
    return projects.filter((item) => item.status === status);
  };

  const getFilteredProjects = () => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.content || "").toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter((item) => item.category === filterCategory);
    }

    return filtered;
  };

  const getStatusStats = () => {
    return Object.keys(STATUS_COLUMNS).reduce((acc, status) => {
      acc[status] = projects.filter((item) => item.status === status).length;
      return acc;
    }, {}); // Removed type annotation
  };

  const getCategoryStats = () => {
    return Object.keys(CATEGORIES).reduce((acc, category) => {
      acc[category] = projects.filter(
        (item) => item.category === category,
      ).length;
      return acc;
    }, {}); // Removed type annotation
  };

  // Screen Components
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

    const categoryDataForChart = Object.keys(categoryStats).map(
      (key, index) => ({
        name: CATEGORIES[key]?.label || key,
        value: categoryStats[key],
        fill: `hsl(var(--chart-${index + 1}))`,
      }),
    );

    const getTimeSeriesData = () => {
      if (!projects || projects.length === 0) return [];

      const statusCountsByDate = projects.reduce((acc, project) => {
        const date = new Date(project.updatedAt).toISOString().split("T")[0];
        if (!acc[date]) {
          acc[date] = {};
          Object.keys(STATUS_COLUMNS).forEach((status) => {
            acc[date][STATUS_COLUMNS[status].title] = 0;
          });
        }
        const statusTitle = STATUS_COLUMNS[project.status]?.title;
        if (statusTitle) {
          acc[date][statusTitle] = (acc[date][statusTitle] || 0) + 1;
        }
        return acc;
      }, {});

      const chartData = Object.keys(statusCountsByDate)
        .map((date) => ({
          date,
          ...statusCountsByDate[date],
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      return chartData;
    };

    const timeSeriesData = getTimeSeriesData();


    const listarProjetos = () => {

      projects.slice(0, 5).map((project) => {
        const categoryInfo =
          CATEGORIES[project.category] || CATEGORIES.ons;
        return (
          <div
            key={project.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex items-center">
              <span className="text-lg mr-3"> {categoryInfo.emoji} </span>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {" "}
                  {project.title}{" "}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  {" "}
                  Atualizado em{" "}
                  {project.updatedAt.toLocaleDateString("pt-BR")}{" "}
                </p>
              </div>
            </div>
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}
            >
              {project.status}
            </div>
          </div>
        );
      })

    }

    return (
      <div className="p-4 lg:p-6 bg-white dark:bg-gray-900">
        {/* Exemplo de como usar a nova tela */}
        <div className="mb-8">
          <OlaMundo />
          <MonitoramentoPage></MonitoramentoPage>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {" "}
            Dashboard{" "}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {" "}
            Visão geral dos seus projetos e atividades{" "}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {" "}
                    {label}{" "}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {" "}
                    {value}{" "}
                  </p>
                </div>
                <div className={`p-3 ${colorClasses[color].bg} rounded-lg`}>
                  <Icon className={`h-6 w-6 ${colorClasses[color].text}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Distribuição por Categoria
            </h3>
            <div className="flex-1 -mx-4">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryDataForChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {categoryDataForChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {" "}
              Status dos Projetos{" "}
            </h3>
            <div className="space-y-3">
              {Object.entries(STATUS_COLUMNS).map(([status, info]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg mr-2"> {info.emoji} </span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {" "}
                      {info.title}{" "}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-2 bg-gray-200 rounded-full mr-3">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${totalProjects > 0 ? (statusStats[status] / totalProjects) * 100 : 0}%`,
                          background: "#007bff",
                          height: "2px",
                        }}
                      >
                        {" "}
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {" "}
                      {statusStats[status] || 0}{" "}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SCRUM KANBAN METODOLOGIA */}

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Estrutura do Fluxo (Kanban)
          </h3>
          <p className="text-gray-600 text dark:text-gray-300">
            Um quadro visual como Trello ou Jira para dar visibilidade ao
            trabalho
          </p>
          <ScrumKanbanMetodologia />
        </div>

        {/* Time Series Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Atividade dos Projetos (Séries Temporais)
          </h3>
          <div className="h-80 -mx-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={timeSeriesData}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.values(STATUS_COLUMNS).map((statusInfo, index) => (
                  <Line
                    key={statusInfo.id}
                    type="monotone"
                    dataKey={statusInfo.title}
                    stroke={`hsl(var(--chart-${index + 1}))`}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {" "}
            Projetos Recentes{" "}
          </h3>


          <div className="space-y-3">
            <TableScreen />
          </div>
        </div>
      </div>
    );
  };


  //! Refatorar essas paginas em arquivos separados para melhor organização, mantendo a estrutura de pastas e componentes modularizada.

  const KanbanScreen = () => {
    const columns = Object.keys(STATUS_COLUMNS);

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


  const TableScreen = () => {
    const filteredProjects = getFilteredProjects();

    return (
      <div className="p-4 lg:p-6 bg-white dark:bg-gray-900">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {" "}
            Tabela de Projetos{" "}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {" "}
            Visualize todos os seus projetos em formato de tabela{" "}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Buscar projetos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all"> Todas as categorias</option>
                {Object.entries(CATEGORIES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.emoji} {value.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {" "}
                    Projeto{" "}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {" "}
                    Status{" "}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {" "}
                    Categoria{" "}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {" "}
                    Atualizado{" "}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {" "}
                    Ações{" "}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProjects.map((project) => {
                  const categoryInfo =
                    CATEGORIES[project.category] || CATEGORIES.ons; // Removed CategoryKey cast
                  const statusInfo = STATUS_COLUMNS[project.status]; // Removed StatusKey cast

                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {" "}
                            {project.title}{" "}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-300">
                            {" "}
                            ID: {project.id}{" "}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">
                            {" "}
                            {statusInfo?.emoji}{" "}
                          </span>
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {" "}
                            {statusInfo?.title || project.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}
                        >
                          <span className="mr-1"> {categoryInfo.emoji} </span>
                          {categoryInfo.label}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {project.updatedAt.toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openItemEditor(project)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-200 dark:hover:bg-blue-900"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => deleteProject(project.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 dark:text-red-400 dark:hover:text-red-200 dark:hover:bg-red-900"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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

      case "api-data":
        return <ApiDataScreen />;
      case "pvrv-web-dev":
        return <PVRVWebDevPage theme={theme} />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
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
        // Pass theme props
        theme={theme} // Pass theme state
        onToggleTheme={toggleTheme} // Pass toggle function
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {" "}
              Kanban Pro{" "}
            </h1>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>

        {/* Screen Content */}
        <main className="flex-1 overflow-auto">{renderCurrentScreen()}</main>
      </div>

      {/* Item Editor */}
      <ItemEditor
        item={editingItem}
        isOpen={!!editingItem}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
        onClose={() => setEditingItem(null)}
      />
    </div>
  );
}

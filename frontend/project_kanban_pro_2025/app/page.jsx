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
  Save,
  Eye,
  EyeOff,
  Trash2,
  GripVertical,
  Upload,
  Download,
  FolderSync as Sync,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Search,
  Filter,
  MoreVertical,
  FileImage,
  FileSpreadsheet,
  File as FilePdf,
  Database,
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
import ScrumKanbanWidget from "./views/components/ScrumKanbanWidget.js";

//! importando compoenentes e outras paginas
import ApiDataScreen from "./api-data/APIDataScreen.jsx";
import OlaMundo from "./views/HTML/OlaMundo.jsx";
import ItemEditor from "./views/components/EditorModalProject.js";
import DeckStorageController from "./controllers/DeckStorageController.js";
import ProjectHubPage from "./views/pages/ProjectHubPage.jsx";

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
// Removed interface SidebarProps
const Sidebar = ({
  currentScreen,
  onScreenChange,
  onExport,
  onImport,
  onSync,
  isOpen,
  onClose,
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
    { id: "projecthub", label: "ProjectHub", icon: LayoutDashboard },
  ];

  const actionItems = [
    {
      id: "sync",
      label: "Salvar",
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
  ];

  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900"> Kanban Pro </h1>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {menuItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  onScreenChange(id);
                  onClose();
                }}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  currentScreen === id
                    ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon size={20} className="mr-3" />
                {label}
              </button>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="space-y-2">
              {actionItems.map(({ id, label, icon: Icon, onClick, color }) => (
                <button
                  key={id}
                  onClick={onClick}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${color || "text-gray-700 hover:bg-gray-100"}
          }`}
                >
                  <Icon size={20} className="mr-3" />
                  {label}
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
  const [editingItem, setEditingItem] = useState(null); // Removed type annotation
  const [draggedItem, setDraggedItem] = useState(null); // Removed type annotation
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all"); // Removed type annotation

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
        const currentFiles = FileUploaderController.loadFiles();
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

    return (
      <div className="p-4 lg:p-6">
        {/* Exemplo de como usar a nova tela */}
        <div className="mb-8">
          <OlaMundo />
        </div>

        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            {" "}
            Dashboard{" "}
          </h1>
          <p className="text-gray-600">
            {" "}
            Visão geral dos seus projetos e atividades{" "}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600"> {label} </p>
                  <p className="text-2xl font-bold text-gray-900"> {value} </p>
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
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
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

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {" "}
              Status dos Projetos{" "}
            </h3>
            <div className="space-y-3">
              {Object.entries(STATUS_COLUMNS).map(([status, info]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg mr-2"> {info.emoji} </span>
                    <span className="text-sm text-gray-600">
                      {" "}
                      {info.title}{" "}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${totalProjects > 0 ? (statusStats[status] / totalProjects) * 100 : 0}%`,
                        }}
                      >
                        {" "}
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {" "}
                      {statusStats[status] || 0}{" "}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3>Estrutura do Fluxo (Kanban)</h3>
          <p>
            Um quadro visual como Trell ou Jira para dar visibilidade ao
            trabalho
          </p>
          <ScrumKanbanWidget />
        </div>

        {/* Time Series Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {" "}
            Projetos Recentes{" "}
          </h3>
          <div className="space-y-3">
            {projects.slice(0, 5).map((project) => {
              const categoryInfo =
                CATEGORIES[project.category] || CATEGORIES.ons;
              return (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3"> {categoryInfo.emoji} </span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {" "}
                        {project.title}{" "}
                      </p>
                      <p className="text-sm text-gray-500">
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
            })}
          </div>
        </div>
      </div>
    );
  };

  const KanbanScreen = () => {
    const columns = Object.keys(STATUS_COLUMNS); // Removed type annotation

    return (
      <div className="p-4 lg:p-6">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            {" "}
            Kanban PRO Board 2026{" "}
          </h1>
          <p className="text-gray-600">
            {" "}
            Organize seus projetos visualmente utilizando métodos de SCRUM e
            Design Patterns para programação de softwares
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
      <div className="p-4 lg:p-6">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            {" "}
            Tabela de Projetos{" "}
          </h1>
          <p className="text-gray-600">
            {" "}
            Visualize todos os seus projetos em formato de tabela{" "}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Buscar projetos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {" "}
                    Projeto{" "}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {" "}
                    Status{" "}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {" "}
                    Categoria{" "}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {" "}
                    Atualizado{" "}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {" "}
                    Ações{" "}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.map((project) => {
                  const categoryInfo =
                    CATEGORIES[project.category] || CATEGORIES.ons; // Removed CategoryKey cast
                  const statusInfo = STATUS_COLUMNS[project.status]; // Removed StatusKey cast

                  return (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {" "}
                            {project.title}{" "}
                          </div>
                          <div className="text-sm text-gray-500">
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
                          <span className="text-sm text-gray-900">
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
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {project.updatedAt.toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openItemEditor(project)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => deleteProject(project.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
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

  const FilesScreen = () => {
    const [markdownContent, setMarkdownContent] = useState(
      `Faça edições no [arquivo.MD ][var4] do repositório para atualizar o dashboard da BatCaverna PV 

[var4]: https://github.com/PedroVic12/Pikachu-Flask-Server/blob/main/batcaverna/batcaverna_pv.md

Aqui está o [link][var1] do Shiatsu como váriavel no .MD

[var1]: https://revigorar.reservio.com/`,
    );
    // State for legacy files (pdf, image, excel) from localStorage
    const [uploadedFiles, setUploadedFiles] = useState([]);
    // State for decks from IndexedDB
    const [decks, setDecks] = useState([]);

    const [deckFile, setDeckFile] = useState(null);
    const [deckDescription, setDeckDescription] = useState("");

    // Load files from both localStorage and IndexedDB on initial render
    useEffect(() => {
      // Load legacy files and filter out any stray decks
      const legacyFiles = FileUploaderController.loadFiles().filter(
        (f) => f.type !== "deck",
      );
      setUploadedFiles(legacyFiles);

      // Load decks from IndexedDB
      const loadDecks = async () => {
        const storedDecks = await DeckStorageController.getAllDecks();
        setDecks(storedDecks);
      };
      loadDecks();
    }, []);

    const handleFileUpload = (event, type) => {
      const files = event.target.files;
      if (!files) return;

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onerror = (error) => {
          console.error("FileReader error:", error);
          alert("Ocorreu um erro ao ler o arquivo.");
        };
        reader.onload = (e) => {
          const newFile = {
            name: file.name,
            type: type,
            url: e.target.result,
          };
          setUploadedFiles((prevFiles) => {
            const newFiles = [...prevFiles, newFile];
            const success = FileUploaderController.saveFiles(newFiles);
            if (success) {
              alert(`Arquivo ${file.name} carregado e salvo com sucesso!`);
            } else {
              alert(`Falha ao salvar o arquivo ${file.name}.`);
            }
            return newFiles;
          });
        };
        reader.readAsDataURL(file); // Read as data URL for preview
      });
    };

    const handleDownload = (file) => {
      if (!file.url) return;
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const handleAddDeck = async () => {
      if (!deckFile) {
        alert("Por favor, selecione um arquivo.");
        return;
      }

      const reader = new FileReader();

      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        alert("Ocorreu um erro ao ler o arquivo.");
      };

      reader.onload = async (e) => {
        // We don't include 'id' because IndexedDB will generate it.
        const newDeckData = {
          name: deckFile.name,
          type: "deck",
          url: e.target.result,
          description: deckDescription || "Sem descrição",
        };

        const savedDeck = await DeckStorageController.saveDeck(newDeckData);

        if (savedDeck) {
          setDecks((prevDecks) => [...prevDecks, savedDeck]);
          alert(`Deck ${deckFile.name} adicionado com sucesso ao IndexedDB!`);
        } else {
          alert(
            `Falha ao salvar o deck ${deckFile.name}. Verifique o console.`,
          );
        }

        // Reset fields after operation
        setDeckFile(null);
        setDeckDescription("");
        if (document.getElementById("deck-upload-input")) {
          document.getElementById("deck-upload-input").value = "";
        }
      };
      reader.readAsDataURL(deckFile);
    };

    const handleDeleteFile = async (file, legacyIndex) => {
      if (
        !window.confirm(
          `Tem certeza que deseja excluir o arquivo "${file.name}"?`,
        )
      ) {
        return;
      }

      if (file.type === "deck") {
        // Handle deletion from IndexedDB
        const success = await DeckStorageController.deleteDeck(file.id);
        if (success) {
          setDecks((prevDecks) => prevDecks.filter((d) => d.id !== file.id));
          alert("Deck excluído com sucesso.");
        } else {
          alert("Falha ao excluir o deck. Verifique o console.");
        }
      } else {
        // Handle deletion from localStorage
        setUploadedFiles((prevFiles) => {
          const newFiles = prevFiles.filter(
            (_, index) => index !== legacyIndex,
          );
          const success = FileUploaderController.saveFiles(newFiles);
          if (!success) {
            alert("Falha ao salvar as alterações após excluir o arquivo.");
            return prevFiles; // Revert state on failure
          }
          alert("Arquivo excluído com sucesso.");
          return newFiles;
        });
      }
    };

    const uploadSections = [
      {
        type: "pdf",
        label: "Upload PDF",
        icon: FilePdf,
        color: "red",
        accept: ".pdf",
      },
      {
        type: "image",
        label: "Upload Imagem",
        icon: FileImage,
        color: "blue",
        accept: "image/*",
      },
      {
        type: "excel",
        label: "Upload Excel",
        icon: FileSpreadsheet,
        color: "green",
        accept: ".xlsx,.xls",
      },
    ];

    // Combine all files for rendering, adding a flag to distinguish them
    const allFiles = [
      ...uploadedFiles.map((file, index) => ({ ...file, legacyIndex: index })),
      ...decks,
    ];

    const carouselSections = {
      image: "Imagens",
      pdf: "Documentos PDF",
      excel: "Planilhas Excel",
      deck: "Decks AnaRede",
    };

    return (
      <div className="p-4 lg:p-6">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            {" "}
            Gerenciador de Arquivos V3{" "}
          </h1>
          <p className="text-gray-600">
            {" "}
            Upload e gerenciamento de PDFs, imagens, planilhas e decks do
            AnaRede.{" "}
          </p>
        </div>

        {/* Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {uploadSections.map(({ type, label, icon: Icon, color, accept }) => (
            <div
              key={type}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center"
            >
              <div
                className={`p-4 ${colorClasses[color].bg} rounded-lg inline-block mb-4`}
              >
                <Icon className={`h-8 w-8 ${colorClasses[color].text}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {" "}
                {label}{" "}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Faça upload de{" "}
                {type === "pdf"
                  ? "documentos PDF"
                  : type === "image"
                    ? "imagens"
                    : "planilhas Excel"}
              </p>
              <input
                type="file"
                accept={accept}
                onChange={(e) => handleFileUpload(e, type)}
                className="hidden"
                id={`${type}-upload-carousel`}
                multiple
              />
              <label
                htmlFor={`${type}-upload-carousel`}
                className={`inline-flex items-center px-4 py-2 ${colorClasses[color].button} text-white rounded-lg cursor-pointer transition-colors`}
              >
                <Upload size={16} className="mr-2" />
                Selecionar Arquivo(s)
              </label>
            </div>
          ))}
          {/* New Card for AnaRede Decks */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
            <div
              className={`p-4 ${colorClasses.purple.bg} rounded-lg inline-block mb-4`}
            >
              <FileText className={`h-8 w-8 ${colorClasses.purple.text}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Decks AnaRede
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload de arquivos .dat, .pwf, .spt com descrição.
            </p>
            <div className="space-y-4">
              <input
                type="file"
                accept=".dat,.pwf,.spt,.DAT,.PWF,.SPT"
                onChange={(e) => setDeckFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                id="deck-upload-input"
              />
              <input
                type="text"
                placeholder="Descrição do deck..."
                value={deckDescription}
                onChange={(e) => setDeckDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleAddDeck}
                className={`w-full inline-flex items-center justify-center px-4 py-2 ${colorClasses.purple.button} text-white rounded-lg cursor-pointer transition-colors`}
              >
                <Plus size={16} className="mr-2" />
                Adicionar Deck
              </button>
            </div>
          </div>
        </div>

        {/* Separated Carousels for Uploaded Files */}
        {Object.entries(carouselSections).map(([type, title]) => {
          const filesOfType = allFiles.filter((file) => file.type === type);
          if (filesOfType.length === 0) return null;

          return (
            <div
              key={type}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mt-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {title} Carregados
              </h3>
              <Carousel
                opts={{
                  align: "start",
                  loop: filesOfType.length > 1,
                }}
                className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-4xl mx-auto"
              >
                <CarouselContent>
                  {filesOfType.map((file, i) => (
                    <CarouselItem
                      key={file.id || file.legacyIndex}
                      className="md:basis-1/2 lg:basis-1/3"
                    >
                      <div className="p-1">
                        <Card className="relative group">
                          <button
                            onClick={() =>
                              handleDeleteFile(file, file.legacyIndex)
                            }
                            className="absolute top-2 right-2 z-10 p-1 bg-white bg-opacity-75 rounded-full text-gray-600 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                            title="Excluir arquivo"
                          >
                            <X size={14} />
                          </button>
                          <CardContent className="flex aspect-square items-center justify-center p-4 flex-col gap-2">
                            {file.type === "image" && file.url ? (
                              <img
                                src={file.url}
                                alt={file.name}
                                className="max-w-full max-h-24 object-contain rounded-md"
                              />
                            ) : file.type === "pdf" ? (
                              <FilePdf className="w-16 h-16 text-red-500" />
                            ) : file.type === "excel" ? (
                              <FileSpreadsheet className="w-16 h-16 text-green-500" />
                            ) : (
                              // for 'deck' type
                              <FileText className="w-16 h-16 text-purple-500" />
                            )}
                            <p
                              className="text-xs text-center text-gray-600 truncate w-full pt-2"
                              title={file.name}
                            >
                              {file.name}
                            </p>
                            {file.description && (
                              <p className="text-xs text-center text-gray-500">
                                {file.description}
                              </p>
                            )}
                            <button
                              onClick={() => handleDownload(file)}
                              className="mt-2 inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                            >
                              <Download size={14} className="mr-1.5" />
                              Baixar
                            </button>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          );
        })}

        {/* Markdown Editor for Links */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {" "}
            Editor de Links e Referências{" "}
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Editor Markdown
              </label>
              <textarea
                placeholder="Cole aqui seus links e referências em formato Markdown..."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                value={markdownContent}
                onChange={(e) => setMarkdownContent(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <div className="h-64 p-4 border border-gray-200 rounded-lg bg-gray-50 overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {markdownContent}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
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
      case "table":
        return <TableScreen />;
      case "files":
        return <FilesScreen />;
      case "api-data":
        return <ApiDataScreen />;
      case "projecthub":
        return <ProjectHubPage />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        currentScreen={currentScreen}
        onScreenChange={setCurrentScreen}
        onExport={handleExport}
        onImport={handleImport}
        onSync={handleSync}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
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

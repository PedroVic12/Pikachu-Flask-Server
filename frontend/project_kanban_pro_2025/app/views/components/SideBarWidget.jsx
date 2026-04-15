
"use client";
const { useRef } = React;
import {
    LayoutDashboard,
    Table,
    FileText,
    Kanban,
    X,
    Upload,
    Download,
    FolderSync as Sync,


    ChevronLeft,
    ChevronRight,

    Database,
    Sun,
    Moon,
} from "lucide-react";

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
}


export default Sidebar;
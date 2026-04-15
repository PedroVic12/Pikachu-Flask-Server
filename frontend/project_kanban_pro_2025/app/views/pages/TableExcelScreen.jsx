import { Edit3, Trash2, Search } from "lucide-react";

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

import React from 'react';
import { BarChart3, Clock, TrendingUp, Users } from 'lucide-react';
import CategoryPieChart from '../GraficosComponent/CategoryPieChart.jsx';
import StatusLineChart from '../GraficosComponent/StatusLineChart.jsx';

const DashboardScreen = ({ projects, getCategoryStats, getStatusStats, CATEGORIES, STATUS_COLUMNS, colorClasses }) => {
    const statusStats = getStatusStats();
    const categoryStats = getCategoryStats();
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'agentes (c3po, jarvis)').length;
    const progressRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

    const statCards = [
      {
        label: 'Total de Projetos',
        value: totalProjects,
        icon: BarChart3,
        color: 'blue'
      },
      {
        label: 'Em Progresso',
        value: statusStats['in progress'] || 0,
        icon: Clock,
        color: 'orange'
      },
      {
        label: 'Finalizados',
        value: completedProjects,
        icon: TrendingUp,
        color: 'green'
      },
      {
        label: 'Taxa de Conclusão',
        value: `${progressRate.toFixed(1)}%`,
        icon: Users,
        color: 'purple'
      }
    ];

    const categoryDataForChart = Object.keys(categoryStats).map((key, index) => ({
      name: CATEGORIES[key]?.label || key,
      value: categoryStats[key],
      fill: `hsl(var(--chart-${index + 1}))`
    }));

    const getTimeSeriesData = () => {
        if (!projects || projects.length === 0) return [];

        const statusCountsByDate = projects.reduce((acc, project) => {
            const date = new Date(project.updatedAt).toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = {};
                Object.keys(STATUS_COLUMNS).forEach(status => {
                    acc[date][STATUS_COLUMNS[status].title] = 0;
                });
            }
            const statusTitle = STATUS_COLUMNS[project.status]?.title;
            if(statusTitle) {
                acc[date][statusTitle] = (acc[date][statusTitle] || 0) + 1;
            }
            return acc;
        }, {});

        const chartData = Object.keys(statusCountsByDate).map(date => ({
            date,
            ...statusCountsByDate[date]
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        return chartData;
    }
    
    const timeSeriesData = getTimeSeriesData();

    return (
      <div className="p-4 lg:p-6" >
      <div className="mb-6" >
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2" > Dashboard </h1>
          < p className = "text-gray-600" > Visão geral dos seus projetos e atividades </p>
            </div>

    {/* Stats Cards */ }
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" >
    {
      statCards.map(({ label, value, icon: Icon, color }) => (
        <div key= { label } className = "bg-white rounded-xl p-6 shadow-sm border border-gray-200" >
        <div className="flex items-center justify-between" >
      <div>
      <p className="text-sm font-medium text-gray-600" > { label } </p>
      < p className = "text-2xl font-bold text-gray-900" > { value } </p>
      </div>
      < div className = {`p-3 ${colorClasses[color].bg} rounded-lg`} >
      <Icon className={ `h-6 w-6 ${colorClasses[color].text}` } />
        </div>
        </div>
        </div>
          ))
}
</div>

{/* Charts */ }
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8" >
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Categoria</h3>
    <div className="flex-1 -mx-4">
        <CategoryPieChart data={categoryDataForChart} />
    </div>
  </div>

  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200" >
    <h3 className="text-lg font-semibold text-gray-900 mb-4" > Status dos Projetos </h3>
      < div className = "space-y-3" >
      {
        Object.entries(STATUS_COLUMNS).map(([status, info]) => (
          <div key= { status } className = "flex items-center justify-between" >
          <div className="flex items-center" >
        <span className="text-lg mr-2" > { info.emoji } </span>
        < span className = "text-sm text-gray-600" > { info.title } </span>
        </div>
        < div className = "flex items-center" >
        <div className="w-24 bg-gray-200 rounded-full h-2 mr-3" >
        <div
                        className="bg-blue-600 h-2 rounded-full"
                        style = {{ width: `${totalProjects > 0 ? (statusStats[status] / totalProjects) * 100 : 0}%` }}
        > </div>
        </div>
        < span className = "text-sm font-medium text-gray-900" > { statusStats[status] || 0 } </span>
          </div>
          </div>
              ))}
</div>
  </div>
  </div>

{/* Time Series Chart */}
<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade dos Projetos (Séries Temporais)</h3>
    <div className="h-80 -mx-4">
        <StatusLineChart data={timeSeriesData} statuses={STATUS_COLUMNS} />
    </div>
</div>

{/* Recent Projects */ }
<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mt-8" >
  <h3 className="text-lg font-semibold text-gray-900 mb-4" > Projetos Recentes </h3>
    < div className = "space-y-3" >
    {
      projects.slice(0, 5).map((project) => {
        const categoryInfo = CATEGORIES[project.category] || CATEGORIES.ons;
        return (
          <div key= { project.id } className = "flex items-center justify-between p-3 bg-gray-50 rounded-lg" >
            <div className="flex items-center" >
              <span className="text-lg mr-3" > { categoryInfo.emoji } </span>
                < div >
                <p className="font-medium text-gray-900" > { project.title } </p>
                  < p className = "text-sm text-gray-500" > Atualizado em { project.updatedAt.toLocaleDateString('pt-BR') } </p>
                    </div>
                    </div>
                    < div className = {`px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`
      }>
      { project.status }
      </div>
      </div>
      );
    })
}
</div>
  </div>
  </div>
    );
  };
  
export default DashboardScreen;

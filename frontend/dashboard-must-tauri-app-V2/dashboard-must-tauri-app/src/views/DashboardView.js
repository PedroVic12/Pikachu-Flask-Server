// src/views/DashboardView.js

import KPISection from '../components/KPISection';

const DashboardView = ({ detailedActivities }) => {
    // Cálculos de métricas
    const total = detailedActivities.length;
    const done = detailedActivities.filter(t => (t.status || '').toLowerCase().includes('conclu')).length;
    const pending = total - done;
    const efficiency = total > 0 ? Math.round((done / total) * 100) : 0;
    const uniqueResp = new Set(detailedActivities.map(a => a.responsavel).filter(Boolean)).size;

    // Dados dos KPIs
    const kpiData = [
        {
            id: 'total',
            title: 'Total',
            value: total,
            icon: Icons.Layout,
            textColor: 'text-slate-800',
            iconBgColor: 'bg-blue-50'
        },
        {
            id: 'responsaveis',
            title: 'Resp.',
            value: uniqueResp,
            icon: Icons.Users,
            textColor: 'text-indigo-600',
            iconBgColor: 'bg-indigo-50'
        },
        {
            id: 'pendentes',
            title: 'Pendentes',
            value: pending,
            icon: Icons.AlertCircle,
            textColor: 'text-amber-500',
            iconBgColor: 'bg-amber-50'
        },
        {
            id: 'eficiencia',
            title: 'Eficiência',
            value: `${efficiency}%`,
            icon: Icons.BarChart,
            textColor: 'text-emerald-600',
            iconBgColor: 'bg-emerald-50'
        }
    ];

    return (
        <div className="space-y-6 fade-in pb-10">
            {/* Header */}
            <header>
                <h2 className="text-xl font-bold text-slate-800">Dashboard: Atividades SP MUST</h2>
            </header>

            {/* KPI Cards Section */}
            <section>
                <KPISection kpiData={kpiData} />
            </section>

            {/*   <section>*/}
            {/* <DashboardExtension /> */}
            {/*</section> */}
            <div className="text-sm text-slate-500 italic">* Dados atualizados em: {new Date().toLocaleString()}</div>



            {/* Charts Section */}
            <section>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <GenericChart data={detailedActivities} xKey="status" yKey="status" type="pie_status" title="Status Geral" />
                    <GenericChart data={detailedActivities} xKey="obs" yKey="" type="pie_boolean" title="Atividades c/ Ressalva" />
                    <GenericChart data={detailedActivities} xKey="responsavel" yKey="status" type="stacked_bar_volume" title="Atividades por Responsável" />
                </div>
            </section>
        </div>
    );
};

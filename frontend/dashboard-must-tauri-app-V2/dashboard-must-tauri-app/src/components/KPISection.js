// src/components/KPISection.js

import KPICard from './KPICard';

const KPISection = ({ kpiData }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiData.map((kpi) => (
                <KPICard
                    key={kpi.id}
                    title={kpi.title}
                    value={kpi.value}
                    icon={kpi.icon}
                    textColor={kpi.textColor}
                    iconBgColor={kpi.iconBgColor}
                />
            ))}
        </div>
    );
};

export default KPISection;

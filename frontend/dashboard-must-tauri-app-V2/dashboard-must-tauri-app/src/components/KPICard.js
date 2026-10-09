// src/components/KPICard.js

const KPICard = ({ title, value, icon: Icon, bgColor, textColor, iconBgColor }) => {
    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    {title}
                </p>
                <p className={`text-2xl font-bold ${textColor} mt-1`}>
                    {value}
                </p>
            </div>
            <div className={`${iconBgColor} p-2 rounded-lg ${textColor}`}>
                {Icon && <Icon />}
            </div>
        </div>
    );
};

export default KPICard;

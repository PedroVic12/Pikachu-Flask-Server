// src/components/ThreatCard.js
export default function ThreatCard({ level, onIncrease, onDecrease }) {
    // Lógica puramente visual
    const getColorClass = () => {
        if (level > 5) return 'text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] border-red-500';
        if (level > 3) return 'text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] border-amber-500';
        return 'text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)] border-green-500';
    };

    return (
        <div className={`p-8 border-2 rounded-xl bg-gray-900/60 transition-colors duration-300 ${getColorClass()}`}>
            <h3 className="text-xl text-white mb-4 uppercase tracking-widest text-center">Nível de Ameaça</h3>

            <div className="text-8xl font-black text-center mb-8">
                {level}
            </div>

            <div className="flex gap-4 justify-center">
                <button
                    onClick={onDecrease}
                    className="px-4 py-2 bg-black/50 text-white border border-gray-600 rounded hover:bg-gray-800"
                >
                    - Reduzir
                </button>
                <button
                    onClick={onIncrease}
                    className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded hover:bg-white/20"
                >
                    + Aumentar
                </button>
            </div>
        </div>
    );
}
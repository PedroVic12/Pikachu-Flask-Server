// src/app/monitoramento/page.js
"use client"
import { useCrisisStore } from '@/app/store/use_state_zustand';
import ThreatCard from '@/components/ThreatCard';

export default function MonitoramentoPage() {
    // O Container conecta-se ao Zustand (GetX equivalente)
    const { threatLevel, increment, decrement } = useCrisisStore();

    return (

        < div className="bg-gray-900/40 border border-cyan-900/50 rounded-xl p-6 shadow-lg shadow-cyan-900/20 w-full max-w-md h-fit flex flex-col transition-all hover:border-cyan-500/50" >
            <h1 className="text-xl text-cyan-400 font-bold mb-6 text-center border-b border-cyan-900/30 pb-3">
                Painel de Controle com Zustand - Monitoramento de Ameaças
            </h1>

            {/* Passamos o estado e as ações como props para o componente burro */}
            <ThreatCard
                level={threatLevel}
                onIncrease={increment}
                onDecrease={decrement}
            />

            {threatLevel > 5 && (
                <div className="mt-6 p-4 bg-red-950/50 border border-red-500 text-red-200 rounded animate-pulse text-center">
                    ⚠️ ALERTA MÁXIMO NA BATCAVERNA
                </div>
            )}

        </div>
    );
}
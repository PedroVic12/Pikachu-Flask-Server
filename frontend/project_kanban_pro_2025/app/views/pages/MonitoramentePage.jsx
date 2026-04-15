// src/app/monitoramento/page.js
"use client"
import { useCrisisStore } from '@/app/store/use_state_zustand';
import ThreatCard from '@/components/ThreatCard';

export default function MonitoramentoPage() {
    // O Container conecta-se ao Zustand (GetX equivalente)
    const { threatLevel, increment, decrement } = useCrisisStore();

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full">
                <h1 className="text-3xl text-cyan-400 font-bold mb-8 text-center">
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
        </div>
    );
}
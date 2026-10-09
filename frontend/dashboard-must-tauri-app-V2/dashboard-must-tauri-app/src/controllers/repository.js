// src/repository.js

/**
 * Classe para gerenciar a comunicação com o backend Rust do Tauri.
 * Abstrai as chamadas `invoke` em métodos mais legíveis.
 */
class BackendRepository {
    constructor() {
        this.isTauri = window.__TAURI__ && window.__TAURI__.tauri;
        if (!this.isTauri) {
            console.warn("A API do Tauri não foi encontrada. O repositório usará dados de fallback.");
        }
        this.invoke = this.isTauri ? window.__TAURI__.tauri.invoke : null;
    }

    /**
     * Busca os dados dos KPIs (Key Performance Indicators) do dashboard.
     * @returns {Promise<Array<object>>} Uma promessa que resolve para um array de objetos KPI.
     */
    async getDashboardKpis() {
        if (!this.isTauri) {
            // Retorna dados de exemplo se não estiver no ambiente Tauri.
            return Promise.resolve([
                { title: "Novos Usuários (Web)", value: "500", icon: "Users", color: "indigo" },
                { title: "Receita (Web)", value: "R$ 10k", icon: "BarChart", color: "emerald" },
            ]);
        }

        try {
            const kpis = await this.invoke('get_dashboard_kpis');
            return kpis;
        } catch (error) {
            console.error("Erro ao buscar KPIs do backend:", error);
            return [];
        }
    }
}

// Anexa uma instância única (Singleton) ao objeto window para ser globalmente acessível.
window.backendRepository = new BackendRepository();
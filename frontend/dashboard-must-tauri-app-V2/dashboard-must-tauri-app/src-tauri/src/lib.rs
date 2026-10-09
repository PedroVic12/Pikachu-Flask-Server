use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Kpi {
    title: String,
    value: String,
    icon: String,
    color: String,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Olá, {}! Você foi cumprimentado pelo Rust!", name)
}

#[tauri::command]
fn get_dashboard_kpis() -> Vec<Kpi> {
    vec![
        Kpi {
            title: "Novos Usuários".into(),
            value: "1,250".into(),
            icon: "Users".into(),
            color: "indigo".into(),
        },
        Kpi {
            title: "Receita Mensal".into(),
            value: "R$ 45.8k".into(),
            icon: "BarChart".into(),
            color: "emerald".into(),
        },
        Kpi {
            title: "Tarefas Concluídas".into(),
            value: "87%".into(),
            icon: "CheckCircle".into(),
            color: "blue".into(),
        },
        Kpi {
            title: "Alertas Críticos".into(),
            value: "3".into(),
            icon: "AlertCircle".into(),
            color: "red".into(),
        },
    ]
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, get_dashboard_kpis])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
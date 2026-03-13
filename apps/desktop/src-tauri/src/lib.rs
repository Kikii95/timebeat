use serde::{Deserialize, Serialize};

mod commands;

// Timer state shared between frontend and backend
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimerState {
    pub state: String,      // "IDLE" | "RUNNING" | "PAUSED" | "BREAK"
    pub elapsed: u64,       // Seconds elapsed
    pub planned: Option<u64>, // Planned duration for timed mode
    pub project_name: Option<String>,
}

impl Default for TimerState {
    fn default() -> Self {
        Self {
            state: "IDLE".to_string(),
            elapsed: 0,
            planned: None,
            project_name: None,
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .manage(commands::AppState::default())
        .invoke_handler(tauri::generate_handler![
            commands::get_timer_state,
            commands::update_timer_state,
            commands::send_notification,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

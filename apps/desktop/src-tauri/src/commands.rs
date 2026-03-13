use crate::TimerState;
use std::sync::Mutex;
use tauri::State;

pub struct AppState {
    pub timer: Mutex<TimerState>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            timer: Mutex::new(TimerState::default()),
        }
    }
}

/// Get current timer state
#[tauri::command]
pub fn get_timer_state(state: State<'_, AppState>) -> Result<TimerState, String> {
    let timer = state
        .timer
        .lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    Ok(timer.clone())
}

/// Update timer state from frontend
#[tauri::command]
pub fn update_timer_state(
    state: State<'_, AppState>,
    new_state: TimerState,
) -> Result<(), String> {
    let mut timer = state
        .timer
        .lock()
        .map_err(|e| format!("Failed to lock state: {}", e))?;
    *timer = new_state;
    Ok(())
}

/// Send a native notification (called from frontend)
#[tauri::command]
pub fn send_notification(app: tauri::AppHandle, title: String, body: String) -> Result<(), String> {
    use tauri_plugin_notification::NotificationExt;

    app.notification()
        .builder()
        .title(&title)
        .body(&body)
        .show()
        .map_err(|e| format!("Failed to send notification: {}", e))?;
    Ok(())
}

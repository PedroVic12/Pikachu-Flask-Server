// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::io::Read;
use pulldown_cmark::{Parser, html};
use serde_json::json;

#[tauri::command]
fn my_command() {
    println!("Hello from the backend!");
}

#[tauri::command]
fn read_markdown_file(path: String) -> Result<String, String> {
    let mut file = fs::File::open(&path)
        .map_err(|e| format!("Failed to open markdown file: {}", e))?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)
        .map_err(|e| format!("Failed to read markdown file: {}", e))?;

    let parser = Parser::new(&contents);
    let mut html_output = String::new();
    html::push_html(&mut html_output, parser);
    Ok(html_output)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![my_command, read_markdown_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

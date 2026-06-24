#!/bin/bash
# Script to run Next.js Kanban Pro board

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "⚡ [1/2] Verificando dependências do Kanban Pro..."
if [ ! -d "node_modules" ]; then
    echo "Instalando dependências (npm install)..."
    npm install
fi

echo "⚡ [2/2] Iniciando Next.js dev server na porta padrão (geralmente http://localhost:3000)..."
npm run dev

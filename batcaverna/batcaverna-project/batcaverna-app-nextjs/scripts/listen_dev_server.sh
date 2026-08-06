#!/usr/bin/env bash
# ==============================================================================
# Script de Monitoramento do Servidor Dev Next.js (BatCaverna Dashboard)
# Escuta o servidor localhost:3000 e exibe os logs em tempo real (.next/dev/logs)
# ==============================================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="$PROJECT_DIR/.next/dev/logs/next-development.log"

echo "=============================================================================="
echo "🦇 BATCAVERNA DEV SERVER MONITOR (localhost:3000 / localhost:3001)"
echo "=============================================================================="

# 1. Verifica se o servidor está rodando na porta 3000 ou 3001
HTTP_STATUS_3000=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
HTTP_STATUS_3001=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 2>/dev/null || echo "000")

if [ "$HTTP_STATUS_3000" = "200" ]; then
    echo -e "🟢 Servidor respondendo com SUCESSO (HTTP 200) em \031[1;32mhttp://localhost:3000\033[0m"
elif [ "$HTTP_STATUS_3001" = "200" ]; then
    echo -e "🟢 Servidor respondendo com SUCESSO (HTTP 200) em \033[1;32mhttp://localhost:3001\033[0m"
else
    echo -e "🟡 Nenhum servidor respondendo em 3000/3001. Status local: 3000=$HTTP_STATUS_3000 | 3001=$HTTP_STATUS_3001"
fi

# 2. Verifica se o arquivo de log do Next.js existe
if [ ! -f "$LOG_FILE" ]; then
    echo "⚠️ Arquivo de logs do Next.js ainda não foi criado: $LOG_FILE"
    echo "Iniciando dev server ou aguardando compilação..."
    mkdir -p "$(dirname "$LOG_FILE")"
    touch "$LOG_FILE"
fi

echo -e "\n📡 Monitorando arquivo de logs em tempo real ($LOG_FILE)... (Pressione Ctrl+C para sair)\n"
echo "------------------------------------------------------------------------------"

# 3. Faz tail -f e formata erros/warnings em JSON do Next.js
tail -n 30 -f "$LOG_FILE" | while read -r line; do
    if echo "$line" | grep -q '"level":"ERROR"'; then
        echo -e "\033[1;31m[NEXT-ERROR]\033[0m $line"
    elif echo "$line" | grep -q '"level":"WARN"'; then
        echo -e "\033[1;33m[NEXT-WARN]\033[0m $line"
    elif echo "$line" | grep -q '"level":"LOG"'; then
        echo -e "\033[1;34m[NEXT-LOG]\033[0m $line"
    else
        echo "$line"
    fi
done

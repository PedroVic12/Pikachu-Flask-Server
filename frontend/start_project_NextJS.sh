#!/bin/bash

# Script para criar novo projeto Next.js com JSX e Tailwind CSS
# Uso: ./start_project.sh

echo "================================"
echo "🚀 Next.js Project Setup Script"
echo "================================"
echo ""

# Solicita o nome do projeto
read -p "📁 Nome do projeto: " PROJECT_NAME

# Valida o nome do projeto
if [ -z "$PROJECT_NAME" ]; then
    echo "❌ Erro: Nome do projeto não pode ser vazio!"
    exit 1
fi

# Verifica se o diretório já existe
if [ -d "$PROJECT_NAME" ]; then
    echo "⚠️  O diretório '$PROJECT_NAME' já existe!"
    read -p "Deseja sobrescrever? (s/N): " OVERWRITE
    if [ "$OVERWRITE" != "s" ] && [ "$OVERWRITE" != "S" ]; then
        echo "❌ Operação cancelada."
        exit 1
    fi
    rm -rf "$PROJECT_NAME"
fi

echo ""
echo "⏳ Criando projeto Next.js..."
echo ""

# Cria o projeto Next.js com as configurações necessárias
npx create-next-app@latest "$PROJECT_NAME" \
    --js \
    --tailwind \
    --eslint \
    --app \
    --no-src-dir \
    --import-alias "@/*"

# Verifica se a criação foi bem-sucedida
if [ $? -ne 0 ]; then
    echo "❌ Erro ao criar o projeto!"
    exit 1
fi

echo ""
echo "📦 Instalando dependências adicionais..."
echo ""

# Entra no diretório do projeto
cd "$PROJECT_NAME"

# Instala as dependências necessárias para o Kanban
npm install lucide-react xlsx

echo ""
echo "📁 Criando estrutura de diretórios..."
echo ""

# Cria diretórios úteis
mkdir -p app/components
mkdir -p app/utils
mkdir -p app/models
mkdir -p app/controllers
mkdir -p app/repositories
mkdir -p public/assets

echo ""
echo "✅ Projeto criado com sucesso!"
echo ""
echo "📋 Estrutura criada:"
echo "   ├── app/"
echo "   │   ├── page.jsx (padrão - substitua pelo seu código)"
echo "   │   ├── layout.jsx"
echo "   │   ├── components/"
echo "   │   ├── utils/"
echo "   │   ├── models/"
echo "   │   ├── controllers/"
echo "   │   └── repositories/"
echo "   ├── public/"
echo "   │   └── assets/"
echo "   └── package.json"
echo ""
echo "🎯 Próximos passos:"
echo "   1. cd $PROJECT_NAME"
echo "   2. Substitua o conteúdo de app/page.jsx pelo seu código"
echo "   3. npm run dev"
echo ""
echo "🌐 O servidor estará disponível em: http://localhost:3000"
echo ""
echo "================================"
echo "✨ Bom desenvolvimento!"
echo "================================"
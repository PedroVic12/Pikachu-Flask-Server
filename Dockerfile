# ===== Estágio 1: Build do Frontend (Next.js) =====
# Usa uma imagem Node.js para compilar o frontend
FROM node:18-alpine AS builder

# Define o diretório de trabalho dentro do container
WORKDIR /app/frontend

# Copia os arquivos de configuração do projeto frontend
COPY frontend/project_kanban_pro_2025/package.json ./
COPY frontend/project_kanban_pro_2025/package-lock.json ./

# Instala as dependências do frontend
RUN npm install

# Copia todo o código fonte do frontend
COPY frontend/project_kanban_pro_2025/ ./

# Executa o build de produção do Next.js
# Isso gera uma pasta .next com o output otimizado
RUN npm run build

# ===== Estágio 2: Aplicação Final (Python + Flask) =====
# Usa uma imagem Python slim
FROM python:3.11-slim

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia as dependências do backend primeiro para aproveitar o cache do Docker
COPY backend/requirements.txt ./

# Instala as dependências do backend
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo o código do backend
COPY backend/ ./

# Copia o frontend compilado do estágio 'builder' para a pasta 'static' do Flask
# O backend irá servir esses arquivos
COPY --from=builder /app/frontend/.next ./static/.next

# Expõe a porta que o Flask irá usar
EXPOSE 5000

# Define a variável de ambiente para o Flask
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0

# Comando para iniciar o servidor Flask quando o container for executado
# Usamos gunicorn para um servidor de produção mais robusto
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]

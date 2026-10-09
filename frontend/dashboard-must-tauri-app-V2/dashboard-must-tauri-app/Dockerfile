# Estágio de Build
FROM rust:1.75-slim-bookworm AS builder

# Instalar dependências de compilação
RUN apt-get update && apt-get install -y pkg-config libssl-dev curl
RUN curl -fsSL https://deb.nodesource.com | bash - && apt-get install -y nodejs

WORKDIR /app
COPY . .

# Compila o backend Rust
# O comando roda dentro de src-tauri para encontrar o Cargo.toml
RUN cd src-tauri && cargo build --release

# Estágio Final
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y libssl3 ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# COPIA O BINÁRIO:
# O binário deve ter o nome definido no seu src-tauri/Cargo.toml
# Ajuste 'dashboard-must-tauri-app' se o nome no Cargo.toml for diferente
COPY --from=builder /app/src-tauri/target/release/dashboard-must-tauri-app /app/server

# COPIA O FRONTEND:
# Como você usa Vanilla, vamos copiar a pasta 'src' e 'public' 
# para que o servidor Rust possa servi-las
COPY --from=builder /app/src /app/frontend/src
COPY --from=builder /app/public /app/frontend/public
COPY --from=builder /app/index.html /app/frontend/index.html

# Render usa a variável PORT
EXPOSE 8080

CMD ["./server"]

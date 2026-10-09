@echo off
setlocal

echo [1/5] Configurando ambiente local...
:: Garante que estamos na toolchain correta
rustup default stable-x86_64-pc-windows-gnu

echo [2/5] Corrigindo configuracao do Linker...
:: Remove configuracao errada do Cargo.toml (se existir)
:: Nota: Isso deve ser feito manualmente se o script falhar aqui
if not exist .cargo mkdir .cargo

:: Criando o config.toml com flags de compatibilidade
echo [target.x86_64-pc-windows-gnu] > .cargo\config.toml
echo linker = "rust-lld.exe" >> .cargo\config.toml
:: A flag abaixo resolve o erro de DllMainCRTStartup forçando o subsistema correto
echo rustflags = ["-C", "link-arg=-Wl,--subsystem,windows"] >> .cargo\config.toml


echo [3/5] Limpando arquivos temporarios...
cargo clean

echo [4/5] Validando dependencias (Check)...
cargo check

if %errorlevel% neq 0 (
    echo [ERRO] O check falhou. Tentando modo de compatibilidade alternativo...
    :: Se o de cima falhar, tentamos injetar o ponto de entrada manualmente
    echo rustflags = ["-C", "link-arg=-e", "-C", "link-arg=DllMainCRTStartup"] >> .cargo\config.toml
    cargo check
)

echo [5/5] Iniciando compilacao Tauri...
:: Usamos 'cargo tauri dev' como voce solicitou
cargo tauri dev

pause

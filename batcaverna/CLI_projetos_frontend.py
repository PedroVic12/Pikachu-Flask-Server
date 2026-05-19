import os
import subprocess
import time
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt, IntPrompt
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.text import Text

console = Console()


def print_header():
    console.clear()
    title = Text(
        "⚡ ENG-STACK CLI ⚡\nGerador de Dashboards Desktop/Web",
        justify="center",
        style="bold cyan",
    )
    console.print(Panel(title, border_style="blue", padding=(1, 2)))
    console.print(
        "[dim]Next.js + Tauri + Arquitetura de Componentes[/dim]", justify="center"
    )
    console.print()


def run_bat_script(script_name, project_name):
    # Obtém o caminho absoluto do diretório atual
    current_dir = os.path.dirname(os.path.abspath(__file__))
    bat_path = os.path.join(current_dir, script_name)

    if not os.path.exists(bat_path):
        console.print(
            f"[bold red]❌ Erro:[/bold red] O script {bat_path} não foi encontrado!"
        )
        return False

    console.print(
        f"\n[bold yellow]🚀 Iniciando o setup (pode levar alguns minutos)...[/bold yellow]"
    )

    # Chama o script .bat no Windows
    try:
        process = subprocess.Popen(
            ["cmd.exe", "/c", bat_path, project_name],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
        )

        # Mostra o log do NPM/Tauri no terminal em tempo real
        if process.stdout:
            for line in process.stdout:
                print(line.strip())

        process.wait()

        if process.returncode == 0:
            console.print("\n[bold green]✅ Projeto gerado com sucesso![/bold green]")
            return True
        else:
            console.print(
                "\n[bold red]❌ Ocorreu um erro durante a execução do script.[/bold red]"
            )
            return False

    except Exception as e:
        console.print(f"[bold red]❌ Erro ao executar o processo:[/bold red] {str(e)}")
        return False


def main():
    print_header()

    # 1. Nome do Projeto
    project_name = Prompt.ask(
        "[bold green]1.[/bold green] Qual o [bold cyan]nome do projeto[/bold cyan]? (ex: dashboard-ons, fluxo-carga)"
    )
    project_name = project_name.lower().replace(" ", "-")

    # 2. Escolha do Framework CSS
    console.print(
        "\n[bold green]2.[/bold green] Qual [bold cyan]framework de UI[/bold cyan] deseja utilizar?"
    )
    console.print("  [1] TailwindCSS (Moderno, Vibe Dracula, Customizável)")
    console.print("  [2] Material UI - MUI (Corporativo, Componentes Prontos)")

    choice = IntPrompt.ask("Escolha a opção", choices=["1", "2"], show_choices=False)

    # 3. Execução
    if choice == 1:
        script = "install_tailwind.bat"
        framework = "TailwindCSS"
    else:
        script = "install_mui.bat"
        framework = "MUI Material"

    console.print(
        f"\n[bold]Resumo:[/bold] Criando [cyan]{project_name}[/cyan] com [cyan]{framework}[/cyan] e [blue]Tauri[/blue]..."
    )

    if Prompt.ask("Confirmar e iniciar?", choices=["s", "n"], default="s") == "s":
        success = run_bat_script(script, project_name)
        if success:
            console.print(
                Panel(
                    f"[bold green]Próximos passos:[/bold green]\n"
                    f"1. cd {project_name}\n"
                    f"2. Cole o nosso template [cyan]page.jsx[/cyan] em [cyan]app/page.jsx[/cyan]\n"
                    f"3. npm run tauri dev",
                    title="Tudo Pronto! 🚀",
                    border_style="green",
                )
            )


if __name__ == "__main__":
    main()

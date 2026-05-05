# language: python
# Importações necessárias
from colorama import init, Fore, Style
from tabulate import tabulate
import progressbar
import time
from rich.console import Console
from rich.table import Table

# Inicializa colorama para cores no terminal
init(autoreset=True)


# Classe para gerenciar cores e exibição de mensagens
class Mensagem:
    def __init__(self):
        self.console = Console()

    def exibir_texto(self, texto, cor=Fore.WHITE, estilo=Style.NORMAL):
        print(cor + estilo + texto)

    def rich_print(self, texto, estilo="bold green"):
        self.console.print(texto, style=estilo)


# Classe para gerenciar tabelas
class Tabela:
    def __init__(self):
        self.console = Console()

    def exibir_tabulate(self, dados, cabecalho):
        tabela_formatada = tabulate(dados, headers=cabecalho, tablefmt="fancy_grid")
        print(Fore.CYAN + tabela_formatada)

    def exibir_rich(self, dados, cabecalho):
        tabela = Table(show_header=True, header_style="bold magenta")
        for col in cabecalho:
            tabela.add_column(col)
        for linha in dados:
            tabela.add_row(*[str(item) for item in linha])
        self.console.print(tabela)


# Classe para simular barra de progresso
class BarraProgresso:
    def __init__(self, max_valor=100):
        self.max_valor = max_valor

    def iniciar(self, msg="Processando..."):
        print(Fore.YELLOW + msg)
        barra = progressbar.ProgressBar(max_value=self.max_valor)
        for i in range(self.max_valor + 1):
            barra.update(i)
            time.sleep(0.02)
        print(Fore.GREEN + "Concluído!")


# Classe principal do menu interativo
class MenuApp:
    def __init__(self):
        self.mensagem = Mensagem()
        self.tabela = Tabela()
        self.barra = BarraProgresso()
        self.opcoes = {
            "1": self.opcao_tabulate,
            "2": self.opcao_rich,
            "3": self.opcao_progresso,
            "4": self.sair,
        }

    def mostrar_menu(self):
        menu_formatado = [
            ["1", "Exibir tabela com Tabulate"],
            ["2", "Exibir tabela com Rich"],
            ["3", "Simular progresso"],
            ["4", "Sair"],
        ]
        print(
            Fore.CYAN
            + tabulate(
                menu_formatado, headers=["Opção", "Descrição"], tablefmt="fancy_grid"
            )
        )

    def opcao_tabulate(self):
        dados = [
            ["Alice", 30, "Engenheira"],
            ["Bob", 25, "Designer"],
            ["Carol", 28, "Gerente"],
        ]
        self.tabela.exibir_tabulate(dados, ["Nome", "Idade", "Profissão"])

    def opcao_rich(self):
        dados = [
            ["Alice", 30, "Engenheira"],
            ["Bob", 25, "Designer"],
            ["Carol", 28, "Gerente"],
        ]
        self.tabela.exibir_rich(dados, ["Nome", "Idade", "Profissão"])

    def opcao_progresso(self):
        self.barra.iniciar("Baixando arquivos...")

    def sair(self):
        self.mensagem.exibir_texto("Saindo do sistema...", Fore.RED, Style.BRIGHT)
        exit()

    def executar(self):
        while True:
            self.mostrar_menu()
            escolha = input(Fore.MAGENTA + "Escolha uma opção: ")
            func = self.opcoes.get(escolha, None)
            if func:
                func()
            else:
                self.mensagem.exibir_texto("Opção inválida! Tente novamente.", Fore.RED)


# Executa o programa
if __name__ == "__main__":
    app = MenuApp()
    app.executar()

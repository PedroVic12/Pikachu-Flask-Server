import flet as ft
import plotly.graph_objects as go
import pandas as pd
import numpy as np
from class_previsao import ModeloPrevisao  # Importe sua classe de previsão

class DashboardPrevisao:
    def __init__(self):
        self.modelo = ModeloPrevisao()
        
    def main(self, page: ft.Page):
        # Configuração da página
        page.title = "Dashboard de Previsão"
        page.theme_mode = ft.ThemeMode.DARK
        page.padding = 20
        page.spacing = 20

        # Criar dados de exemplo para os gráficos
        x = np.linspace(0, 10, 100)
        y_real = np.sin(x) + np.random.normal(0, 0.1, 100)
        y_prev = np.sin(x)

        # Criar gráficos usando Plotly
        def criar_grafico_linha():
            fig = go.Figure()
            fig.add_trace(go.Scatter(x=x, y=y_real, name='Dados Reais'))
            fig.add_trace(go.Scatter(x=x, y=y_prev, name='Previsão'))
            fig.update_layout(
                title='Série Temporal - Valores Reais vs Previsão',
                xaxis_title='Tempo',
                yaxis_title='Valor',
                template='plotly_dark'
            )
            return fig.to_html(include_plotlyjs=True, full_html=False)

        def criar_grafico_dispersao():
            fig = go.Figure()
            fig.add_trace(go.Scatter(
                x=y_real, 
                y=y_prev, 
                mode='markers',
                name='Pontos'
            ))
            fig.add_trace(go.Scatter(
                x=[min(y_real), max(y_real)],
                y=[min(y_real), max(y_real)],
                mode='lines',
                name='Linha de Referência'
            ))
            fig.update_layout(
                title='Dispersão: Real vs Previsto',
                xaxis_title='Valores Reais',
                yaxis_title='Valores Previstos',
                template='plotly_dark'
            )
            return fig.to_html(include_plotlyjs=False, full_html=False)

        # Criar métricas
        metricas = ft.Row(
            controls=[
                ft.Container(
                    content=ft.Column([
                        ft.Text("MSE", size=20, weight=ft.FontWeight.BOLD),
                        ft.Text(f"{np.mean((y_real - y_prev)**2):.4f}")
                    ]),
                    padding=20,
                    bgcolor=ft.colors.BLUE_GREY_900,
                    border_radius=10,
                ),
                ft.Container(
                    content=ft.Column([
                        ft.Text("MAE", size=20, weight=ft.FontWeight.BOLD),
                        ft.Text(f"{np.mean(np.abs(y_real - y_prev)):.4f}")
                    ]),
                    padding=20,
                    bgcolor=ft.colors.BLUE_GREY_900,
                    border_radius=10,
                ),
                ft.Container(
                    content=ft.Column([
                        ft.Text("R²", size=20, weight=ft.FontWeight.BOLD),
                        ft.Text(f"{1 - np.sum((y_real - y_prev)**2) / np.sum((y_real - np.mean(y_real))**2):.4f}")
                    ]),
                    padding=20,
                    bgcolor=ft.colors.BLUE_GREY_900,
                    border_radius=10,
                )
            ],
            alignment=ft.MainAxisAlignment.SPACE_AROUND
        )

        # Criar visualização dos gráficos
        grafico_linha = ft.Html(html=criar_grafico_linha(), expand=True)
        grafico_dispersao = ft.Html(html=criar_grafico_dispersao(), expand=True)

        # Layout principal
        page.add(
            ft.Text("Dashboard de Previsão", size=30, weight=ft.FontWeight.BOLD),
            metricas,
            ft.Row(
                controls=[
                    ft.Container(
                        content=grafico_linha,
                        expand=True,
                        bgcolor=ft.colors.BLUE_GREY_900,
                        padding=10,
                        border_radius=10,
                    ),
                    ft.Container(
                        content=grafico_dispersao,
                        expand=True,
                        bgcolor=ft.colors.BLUE_GREY_900,
                        padding=10,
                        border_radius=10,
                    )
                ],
                spacing=20,
            )
        )

if __name__ == "__main__":
    dashboard = DashboardPrevisao()
    ft.app(target=dashboard.main)

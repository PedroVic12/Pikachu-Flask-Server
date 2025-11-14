import streamlit as st
import pandas as pd
import altair as alt
import io

# Configuração da página Streamlit
st.set_page_config(
    page_title="Dashboard de Notas Fiscais",
    page_icon="🧾",
    layout="wide",
)

class DashboardNotasFiscais:
    """
    Classe para gerenciar o processamento de dados de NF a partir de um DataFrame
    e desenhar o dashboard Streamlit usando POO.
    """

    def __init__(self, raw_df, aba_selecionada):
        """
        Inicializa o dashboard com o DataFrame bruto e o nome da aba selecionada.
        Chama o método de processamento de dados.
        """
        self.aba_selecionada = aba_selecionada
        self.df = self._processar_dados(raw_df.copy()) # Usa uma cópia para não alterar o df original

    @staticmethod
    def _processar_dados(df):
        """
        Realiza a limpeza, renomeação e conversão dos dados do Excel.
        Esta é a lógica que você havia fornecido, adaptada para o método.
        """
        # 1. Renomear colunas (remover espaços e garantir consistência)
        df.columns = [x.strip() for x in df.columns]

        # 2. Limpeza e conversão do Valor da NF para float (coluna final: 'Valor')
        if "Valor da NF" in df.columns:
            df["Valor"] = (
                df["Valor da NF"]
                .astype(str)
                .str.replace(r"R\$", "", regex=True)
                .str.replace(".", "", regex=False)    # Remove separador de milhar (ponto)
                .str.replace(",", ".", regex=False)    # Substitui vírgula por ponto decimal
                .astype(float)
            )
            # Remove a coluna bruta se ela for redundante
            df = df.drop(columns=["Valor da NF"], errors='ignore')
        else:
            st.error("Coluna 'Valor da NF' não encontrada no arquivo.")
            return pd.DataFrame() # Retorna DF vazio para evitar erros

        # 3. Conversão de datas e cálculo de diferença
        if "Emissão da NF" in df.columns and "Conferência" in df.columns:
            df["Emissao"] = pd.to_datetime(df["Emissão da NF"], dayfirst=True, errors="coerce")
            df["Conferencia"] = pd.to_datetime(df["Conferência"], dayfirst=True, errors="coerce")
            df["Dias_para_conferir"] = (df["Conferencia"] - df["Emissao"]).dt.days
        else:
            st.warning("Colunas de data ('Emissão da NF' ou 'Conferência') ausentes. Métricas de tempo serão ignoradas.")

        return df

    def _calcular_metricas(self, df):
        """Calcula as métricas chave a serem exibidas no topo do dashboard."""
        
        # Filtra linhas com valor válido antes de calcular
        df_valid = df.dropna(subset=['Valor'])
        
        total_valor = df_valid['Valor'].sum()
        total_nfs = df_valid['NF'].nunique() if 'NF' in df_valid.columns else len(df_valid)
        
        # Cálculo do tempo médio de conferência
        if 'Dias_para_conferir' in df_valid.columns:
            avg_dias = df_valid['Dias_para_conferir'].mean()
        else:
            avg_dias = None

        # Prepara a formatação monetária (Reais)
        fmt_real = lambda x: f"R$ {x:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
        fmt_dias = lambda x: f"{x:.1f} dias" if x is not None else "N/A"

        return {
            "Total_Valor_Formatado": fmt_real(total_valor),
            "Total_NFs": total_nfs,
            "Tempo_Medio_Conferencia": fmt_dias(avg_dias),
        }

    def _criar_grafico_valor_por_fornecedor(self, df):
        """Gera o gráfico de barras dos 5 maiores fornecedores por valor total."""
        df_fornecedores = df.groupby('Fornecedor')['Valor'].sum().reset_index()
        df_fornecedores = df_fornecedores.nlargest(5, 'Valor')

        base = alt.Chart(df_fornecedores).encode(
            # Usando a nova coluna 'Valor'
            x=alt.X("Valor", title="Valor Total (R$)").axis(format="~s"), 
            y=alt.Y("Fornecedor", title="Fornecedor", sort="-x"),
            tooltip=[
                alt.Tooltip("Fornecedor", title="Fornecedor"),
                # Usando a nova coluna 'Valor'
                alt.Tooltip("Valor", title="Valor Total", format=",.2f")
            ]
        ).properties(
            title="Top 5 Fornecedores por Valor de NF"
        )

        chart = base.mark_bar().encode(
            alt.Color("Valor", scale=alt.Scale(range='ramp', scheme='plasma'), legend=None)
        ).interactive()

        return chart

    def _criar_grafico_nfs_por_gestor(self, df):
        """Gera o gráfico de pizza (donut) da distribuição de NFs por Gestor Adm."""
        # A coluna Gestor Adm está limpa, mas ainda pode ter o nome original
        gestor_col = 'Gestor Adm' if 'Gestor Adm' in df.columns else None
        
        if not gestor_col:
            st.warning("Coluna 'Gestor Adm' não encontrada para o gráfico de distribuição.", icon="⚠️")
            return alt.Chart(df).mark_text(text="Dados de Gestor Ausentes").properties(title="Distribuição por Gestor")

        df_gestores = df.groupby(gestor_col)['NF'].count().reset_index(name='Total_NFs')

        base = alt.Chart(df_gestores).encode(
            theta=alt.Theta("Total_NFs", stack=True)
        ).properties(
            title="Distribuição de NFs por Gestor Administrativo"
        )

        pie = base.mark_arc(outerRadius=120, innerRadius=80).encode(
            color=alt.Color(gestor_col, title="Gestor"),
            order=alt.Order("Total_NFs", sort="descending"),
            tooltip=[gestor_col, "Total_NFs"]
        )

        chart = pie.configure_legend(orient="bottom").interactive()

        return chart

    def _criar_grafico_evolucao_valor_por_data(self, df):
        """Gera um gráfico de linhas para a evolução do valor de NF ao longo do tempo."""
        # Usando a nova coluna 'Emissao'
        if 'Emissao' not in df.columns:
            st.warning("Coluna 'Emissao' ausente. Gráfico de evolução não pode ser gerado.", icon="⚠️")
            return alt.Chart(df).mark_text(text="Dados de Emissão Ausentes").properties(title="Evolução do Valor de NF")

        df_evolucao = df.groupby('Emissao')['Valor'].sum().reset_index()

        chart = alt.Chart(df_evolucao).mark_line(point=True).encode(
            # Usando as novas colunas 'Emissao' e 'Valor'
            x=alt.X("Emissao", title="Data de Emissão"),
            y=alt.Y("Valor", title="Valor Acumulado de NF (R$)", stack=None).axis(format="~s"),
            tooltip=[
                alt.Tooltip("Emissao", title="Data de Emissão"),
                alt.Tooltip("Valor", title="Valor", format=",.2f")
            ]
        ).properties(
            title="Evolução do Valor Total de NFs por Data de Emissão"
        ).interactive()

        return chart

    def run(self):
        """
        Desenha a interface do Streamlit.
        Este método é o ponto de entrada da aplicação.
        """
        st.title("📊 Dashboard de Notas Fiscais")
        st.markdown(f"Aba selecionada: **{self.aba_selecionada}**")
        st.divider()

        if self.df.empty:
            return

        # ---------------------------------------------------------------------
        # SEÇÃO 1: MÉTRICAS CHAVE (RESUMO)
        # ---------------------------------------------------------------------
        metrics = self._calcular_metricas(self.df)

        st.subheader("Resumo Analítico")
        
        col1, col2, col3 = st.columns(3)

        with col1:
            st.metric("Total de NFs", metrics["Total_NFs"])

        with col2:
            st.metric("Valor Total", metrics["Total_Valor_Formatado"])
            
        with col3:
            st.metric("Tempo médio p/ conferência", metrics["Tempo_Medio_Conferencia"])

        st.divider()

        # ---------------------------------------------------------------------
        # SEÇÃO 2: FILTROS E COMPARAÇÃO
        # ---------------------------------------------------------------------

        st.subheader("Análise Detalhada")
        
        gestor_col = 'Gestor Adm' if 'Gestor Adm' in self.df.columns else None

        if gestor_col:
            gestores = self.df[gestor_col].unique()
            selected_gestores = st.multiselect(
                "Filtrar por Gestor Administrativo",
                gestores,
                default=gestores, # Seleciona todos por padrão
                help="Selecione um ou mais gestores para analisar seus dados.",
            )

            if not selected_gestores:
                st.warning("Selecione pelo menos 1 gestor para exibir os gráficos.", icon="⚠️")
                return 
            
            # Filtra o DataFrame com base na seleção
            df_filtrado = self.df[self.df[gestor_col].isin(selected_gestores)]
        else:
            # Se não houver coluna de gestor, usa o DF inteiro para os gráficos
            st.info("Filtro por Gestor desativado, pois a coluna 'Gestor Adm' não foi encontrada.")
            df_filtrado = self.df
        
        # ---------------------------------------------------------------------
        # SEÇÃO 3: GRÁFICOS
        # ---------------------------------------------------------------------

        cols_charts_1 = st.columns([3, 1], gap="medium")

        with cols_charts_1[0].container(border=True, height=350):
            st.markdown("##### Valor de NF por Fornecedor")
            # A coluna Fornecedor deve estar presente para este gráfico funcionar
            if 'Fornecedor' in df_filtrado.columns:
                st.altair_chart(
                    self._criar_grafico_valor_por_fornecedor(df_filtrado), 
                    use_container_width=True
                )
            else:
                st.info("Coluna 'Fornecedor' ausente para o gráfico.")


        with cols_charts_1[1].container(border=True, height=350):
            st.markdown("##### Distribuição por Gestor")
            st.altair_chart(
                self._criar_grafico_nfs_por_gestor(df_filtrado), 
                use_container_width=True
            )

        st.markdown("---")
        
        cols_charts_2 = st.columns(2, gap="medium")
        
        with cols_charts_2[0].container(border=True, height=350):
            st.markdown("##### Evolução do Valor de NF (Emissão)")
            st.altair_chart(
                self._criar_grafico_evolucao_valor_por_data(df_filtrado), 
                use_container_width=True
            )

        with cols_charts_2[1].container(border=True, height=350):
            st.markdown("##### Dados Brutos Filtrados")
            # Exibir o DF processado/filtrado
            st.dataframe(df_filtrado, use_container_width=True)


# -----------------------------------------------------------------------------
# EXECUÇÃO DO APLICATIVO (Lógica de Upload)
# -----------------------------------------------------------------------------
st.sidebar.title("📤 Importar dados do Excel")
arquivo = st.sidebar.file_uploader("Selecione seu arquivo Excel (.xlsx)", type=["xlsx"])

if arquivo:
    # Lendo todas as abas do arquivo
    try:
        excel_file = pd.ExcelFile(arquivo)
        abas = excel_file.sheet_names
        aba_selecionada = st.sidebar.selectbox("Escolha a aba que contém os dados", abas)

        # Lendo a aba selecionada (aqui assumimos que a linha 1 é cabeçalho e os dados começam na linha 2)
        # O skiprows=1 da sua implementação original foi mantido:
        # skiprows = 1 significa pular a primeira linha (linha 0), lendo a partir da linha 1 (a segunda linha do Excel)
        raw_df = pd.read_excel(excel_file, sheet_name=aba_selecionada, skiprows=1)

        # Instancia e roda o Dashboard
        nf_dashboard = DashboardNotasFiscais(raw_df, aba_selecionada)
        nf_dashboard.run()

    except Exception as e:
        st.error(f"Ocorreu um erro ao processar o arquivo: {e}")
        st.info("Verifique se as colunas 'Valor da NF', 'Emissão da NF' e 'Conferência' estão presentes e com o nome correto.")
else:
    st.info("Aguardando o upload de um arquivo Excel para iniciar o dashboard. Por favor, utilize o painel lateral.")

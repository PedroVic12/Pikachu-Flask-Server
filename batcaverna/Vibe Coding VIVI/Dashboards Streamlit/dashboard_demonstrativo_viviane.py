import streamlit as st
import pandas as pd
import plotly.express as px
import io

# ==============================================================================
# 1. MODELO (MODEL) - Lógica de Dados e Processamento
# ==============================================================================
class RHDatenModel:
    def __init__(self):
        self.raw_df = None
        self.tables = {}

    def load_data(self, uploaded_file):
        """
        Carrega o arquivo (CSV ou Excel) e processa as múltiplas tabelas.
        """
        try:
            if uploaded_file.name.endswith('.csv'):
                # Lê o CSV ignorando linhas em branco no início se necessário,
                # mas mantendo a estrutura de grid
                self.raw_df = pd.read_csv(uploaded_file, header=None)
            else:
                self.raw_df = pd.read_excel(uploaded_file, header=None)
            
            self._parse_multiple_tables()
            return True
        except Exception as e:
            st.error(f"Erro ao carregar dados: {e}")
            return False

    def _parse_multiple_tables(self):
        """
        Algoritmo para identificar e extrair tabelas espalhadas na planilha.
        Baseado no padrão do arquivo onde temos um título e logo abaixo 'Rótulos de Linha'.
        """
        df = self.raw_df
        # Dicionário para armazenar os DFs extraídos: { "Nome da Tabela": DataFrame }
        extracted_tables = {}

        n_rows, n_cols = df.shape
        visited_cells = set()

        for r in range(n_rows):
            for c in range(n_cols):
                cell_val = str(df.iat[r, c]).strip()
                
                # Identificador chave: 'Rótulos de Linha' geralmente indica o cabeçalho de uma tabela dinâmica
                if "Rótulos de Linha" in cell_val and (r, c) not in visited_cells:
                    # Tenta descobrir o nome da tabela.
                    # Padrão 1: O nome está na célula imediatamente acima (r-1, c)
                    # Padrão 2: O nome está na célula (r-1, c+1) ou algo similar.
                    # Vamos assumir que o título é o nome da categoria que está na célula acima ou na mesma linha à esquerda
                    
                    table_name = "Tabela Desconhecida"
                    
                    # Tentativa de pegar nome acima
                    if r > 0:
                        possible_name = str(df.iat[r-1, c]).strip()
                        if possible_name and possible_name != "nan":
                            table_name = possible_name
                        else:
                            # Tenta pegar cabeçalho da coluna de valor ao lado
                            possible_name = str(df.iat[r, c+1]).strip()
                            if "Contagem" in possible_name:
                                table_name = possible_name.replace("Contagem de", "").strip()

                    # Se já existe tabela com esse nome, adiciona sufixo
                    if table_name in extracted_tables:
                        table_name = f"{table_name}_{r}_{c}"

                    # Extrair a tabela
                    sub_df = self._extract_block(df, r, c)
                    if sub_df is not None and not sub_df.empty:
                        extracted_tables[table_name] = sub_df
                        # Marcar células como visitadas (simplificado apenas para o header)
                        visited_cells.add((r, c))

        self.tables = extracted_tables

    def _extract_block(self, df, start_row, start_col):
        """
        Extrai um bloco de dados a partir de uma coordenada até encontrar linha vazia ou 'Total Geral'.
        """
        data = []
        # Cabeçalhos: Coluna 1 (Categoria) e Coluna 2 (Valor)
        # O arquivo mostra pares de colunas. Ex: A e B, D e E.
        
        # Pega o nome da coluna de valor (ex: "Contagem de Diretoria")
        col_value_name = str(df.iat[start_row, start_col+1]).strip()
        
        headers = ["Categoria", "Valor"]
        
        curr_row = start_row + 1
        max_rows, max_cols = df.shape

        while curr_row < max_rows:
            cat_val = str(df.iat[curr_row, start_col]).strip()
            num_val = df.iat[curr_row, start_col+1]

            # Critérios de parada
            if cat_val == "nan" or cat_val == "":
                break
            if "Total Geral" in cat_val:
                # Opcional: podemos incluir o total ou não. Geralmente gráficos não querem o total.
                break 
            
            # Tratamento numérico
            try:
                num_val = float(num_val)
            except:
                num_val = 0

            data.append([cat_val, num_val])
            curr_row += 1

        if data:
            new_df = pd.DataFrame(data, columns=headers)
            # Adiciona metadados
            new_df.attrs['original_metric'] = col_value_name
            return new_df
        return None

    def get_table_names(self):
        return list(self.tables.keys())

    def get_table(self, name):
        return self.tables.get(name)


# ==============================================================================
# 2. VISÃO (VIEW) - Interface Gráfica e Dashboards
# ==============================================================================
class RHView:
    def __init__(self):
        st.set_page_config(page_title="Dashboard RH Analítico", layout="wide", page_icon="📊")

    def render_header(self):
        st.title("📊 Dashboard Analítico de RH")
        st.markdown("---")

    def render_sidebar(self):
        st.sidebar.header("📁 Upload de Dados")
        return st.sidebar.file_uploader("Carregue o arquivo Excel/CSV", type=["xlsx", "csv"])

    def render_error(self, message):
        st.error(message)

    def render_empty_state(self):
        st.info("Por favor, faça o upload do arquivo para visualizar os dashboards.")

    def render_tabs(self, tables):
        """
        Cria as abas dinamicamente baseada nas tabelas extraídas e uma aba consolidada.
        """
        if not tables:
            st.warning("Nenhuma tabela identificada no arquivo.")
            return

        table_names = list(tables.keys())
        # Cria lista de abas: Consolidadas + Uma para cada tabela
        tab_titles = ["📈 Visão Consolidada"] + table_names
        tabs = st.tabs(tab_titles)

        # 1. Renderizar Aba Consolidada (Primeira Aba)
        with tabs[0]:
            self._render_consolidated_view(tables)

        # 2. Renderizar Abas Individuais
        for i, name in enumerate(table_names):
            with tabs[i+1]: # +1 porque a 0 é a consolidada
                self._render_individual_table(name, tables[name])

    def _render_individual_table(self, title, df):
        st.subheader(f"Análise: {title}")
        
        col1, col2 = st.columns([1, 2])
        
        with col1:
            st.caption("Dados Brutos da Tabela")
            st.dataframe(df, use_container_width=True)
            
            # Métricas rápidas
            total = df['Valor'].sum()
            st.metric("Total", f"{int(total)}")

        with col2:
            st.caption("Visualização Gráfica")
            # Decide tipo de gráfico baseado na quantidade de dados
            if len(df) > 10:
                fig = px.bar(df, x='Categoria', y='Valor', text='Valor', title=f"Distribuição - {title}")
            else:
                fig = px.pie(df, names='Categoria', values='Valor', title=f"Proporção - {title}", hole=0.4)
            
            st.plotly_chart(fig, use_container_width=True)

    def _render_consolidated_view(self, tables):
        st.header("Resumo Executivo")
        
        # Grid de métricas
        st.subheader("Indicadores Chave")
        
        # Tentar encontrar tabelas chaves para métricas (baseado nos nomes comuns do arquivo)
        metrics_col = st.columns(4)
        col_idx = 0
        
        for name, df in tables.items():
            # Exibir apenas métricas de tabelas pequenas ou relevantes no topo
            if len(df) < 15 and col_idx < 4:
                top_cat = df.sort_values('Valor', ascending=False).iloc[0]
                with metrics_col[col_idx]:
                    st.metric(
                        label=f"Maior {name}",
                        value=top_cat['Categoria'],
                        delta=f"{int(top_cat['Valor'])} pessoas"
                    )
                col_idx += 1
                if col_idx >= 4: break
        
        st.markdown("---")
        
        # Grid de gráficos menores
        st.subheader("Panorama Geral")
        
        # Criar um grid de 2 colunas para plotar vários gráficos
        chart_cols = st.columns(2)
        
        for i, (name, df) in enumerate(tables.items()):
            col = chart_cols[i % 2]
            with col:
                with st.container(border=True):
                    # Gráfico de barras horizontal para economizar espaço
                    fig = px.bar(df, x='Valor', y='Categoria', orientation='h', title=name)
                    fig.update_layout(height=300, margin=dict(l=0, r=0, t=30, b=0))
                    st.plotly_chart(fig, use_container_width=True)


# ==============================================================================
# 3. CONTROLADOR (CONTROLLER) - Orquestração
# ==============================================================================
class RHController:
    def __init__(self):
        self.model = RHDatenModel()
        self.view = RHView()

    def run(self):
        self.view.render_header()
        
        uploaded_file = self.view.render_sidebar()
        
        if uploaded_file is not None:
            with st.spinner("Processando tabelas complexas..."):
                success = self.model.load_data(uploaded_file)
                
            if success:
                self.view.render_tabs(self.model.tables)
            else:
                self.view.render_error("Não foi possível processar o arquivo. Verifique o formato.")
        else:
            self.view.render_empty_state()

# ==============================================================================
# 4. ENTRY POINT
# ==============================================================================
if __name__ == "__main__":
    app = RHController()
    app.run()


"""
### Explicação da Lógica (Como resolvemos o problema do arquivo)

1.  **Parsing Dinâmico (`_parse_multiple_tables`)**:
    * O problema principal do seu arquivo é que ele tem várias tabelas ("Diretoria", "Gênero", "Idade") na mesma aba. O método `pd.read_excel` padrão tentaria ler tudo como uma única tabela gigante cheia de vazios.
    * No `RHDatenModel`, criei um algoritmo que percorre a planilha procurando a chave **"Rótulos de Linha"**.
    * Quando ele encontra essa chave, ele olha para a célula de cima para tentar descobrir o **Nome da Tabela** (ex: "Diretoria").
    * Em seguida, o método `_extract_block` captura as linhas abaixo desse cabeçalho até encontrar um espaço vazio ou o texto "Total Geral".

2.  **Visualização Dinâmica**:
    * O `RHView` não sabe *quais* tabelas existem de antemão. Ele recebe um dicionário.
    * Ele usa `st.tabs` para criar uma aba para cada tabela encontrada automaticamente.
    * Ele decide automaticamente se usa um gráfico de **Pizza** (se forem poucos dados) ou de **Barras** (se forem muitos dados), tornando o dashboard inteligente.

3.  **Aba Consolidada**:
    * A primeira aba ("Visão Consolidada") itera sobre as tabelas e cria um grid de métricas ("Cards") com o item de maior valor de cada categoria e mini-gráficos para comparação rápida.

### Como usar

1.  Instale as dependências:
    ```bash
    pip install streamlit pandas plotly openpyxl
    ```
2.  Rode o aplicativo:
    ```bash
    streamlit run app.py

"""
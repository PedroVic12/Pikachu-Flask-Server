import streamlit as st
import pandas as pd
import altair as alt

st.set_page_config("📊 Dashboard de Notas Fiscais", layout="wide")

st.sidebar.title("📤 Importar dados")
arquivo = st.sidebar.file_uploader("Selecione seu arquivo Excel", type=["xlsx"])

if arquivo:
    abas = pd.ExcelFile(arquivo).sheet_names
    aba_selecionada = st.sidebar.selectbox("Escolha a aba", abas)

    df = pd.read_excel(arquivo, sheet_name=aba_selecionada, skiprows=1)

    # ===================== PRÉ-PROCESSAMENTO =====================
    df = df.rename(columns=lambda x: x.strip())
    df.columns = df.columns.str.replace("Valor da NF", "Valor", regex=False)

    df["Valor"] = (
        df["Valor"]
        .astype(str)
        .str.replace(r"R\$", "", regex=True)
        .str.replace(".", "", regex=False)
        .str.replace(",", ".", regex=False)
        .astype(float)
    )

    df["Emissao"] = pd.to_datetime(df["Emissão da NF"], dayfirst=True, errors="coerce")
    df["Conferencia"] = pd.to_datetime(df["Conferência"], dayfirst=True, errors="coerce")
    df["Dias_para_conferir"] = (df["Conferencia"] - df["Emissao"]).dt.days

    # ===================== HEADER =====================
    st.title("📊 Dashboard de Notas Fiscais")
    st.markdown(f"Aba selecionada: **{aba_selecionada}**")

    col1, col2, col3 = st.columns(3)
    col1.metric("🧾 Total de NFs", len(df))
    col2.metric(
        "💰 Valor Total",
        f"R${df['Valor'].sum():,.2f}".replace(",", "X").replace(".", ",").replace("X", "."),
    )
    col3.metric("⏱ Tempo médio p/ conferência", f"{df['Dias_para_conferir'].mean():.1f} dias")

    st.markdown("---")

    # ===================== GRÁFICO 1 =====================
    st.subheader("📈 Tempo Médio de Conferência (dias)")

    chart1 = alt.Chart(df).mark_circle(size=80).encode(
        x=alt.X("Emissao:T", title="Data de Emissão"),
        y=alt.Y("Valor:Q", title="Valor da NF (R$)"),
        color=alt.Color("Gestor Adm:N", title="Gestor"),
        tooltip=["Fornecedor", "Valor", "Gestor Adm", "Dias_para_conferir"]
    ).interactive()

    st.altair_chart(chart1, use_container_width=True)

    # ===================== GRÁFICO 2 =====================
    st.subheader("📌 Totais por Gestor")

    total_gestor = df.groupby("Gestor Adm")["Valor"].sum().reset_index().sort_values(by="Valor", ascending=False)

    chart2 = alt.Chart(total_gestor).mark_bar().encode(
        x=alt.X("Gestor Adm:N", title="Gestor"),
        y=alt.Y("Valor:Q", title="Total em R$"),
        color=alt.Color("Gestor Adm:N", legend=None),
        tooltip=["Valor"]
    )

    st.altair_chart(chart2, use_container_width=True)

    # ===================== GRÁFICO 3 =====================
    st.subheader("🏢 Top Fornecedores por Valor")

    top_fornecedores = (
        df.groupby("Fornecedor")["Valor"]
        .sum()
        .reset_index()
        .sort_values("Valor", ascending=False)
        .head(10)
    )

    chart3 = alt.Chart(top_fornecedores).mark_bar().encode(
        x=alt.X("Valor:Q", title="Total em R$"),
        y=alt.Y("Fornecedor:N", sort="-x", title="Fornecedor"),
        color=alt.Color("Fornecedor:N", legend=None),
        tooltip=["Valor"]
    )

    st.altair_chart(chart3, use_container_width=True)

    # ===================== GRÁFICO 4 =====================
    st.subheader("📈 Valor da NF ao longo do tempo por Gestor (barras empilhadas)")

    df['AnoMes'] = df['Emissao'].dt.to_period('M').astype(str)

    chart4 = alt.Chart(df).mark_bar().encode(
        x=alt.X("AnoMes:N", title="Ano-Mês"),
        y=alt.Y("Valor:Q", title="Valor Total"),
        color=alt.Color("Gestor Adm:N", title="Gestor"),
        tooltip=["Gestor Adm", "Valor"]
    )

    st.altair_chart(chart4, use_container_width=True)

    # ===================== TABELA FINAL =====================
    st.markdown("---")
    st.subheader("📋 Dados Brutos")
    st.dataframe(df)

else:
    st.warning("📂 Faça upload de um arquivo Excel para começar.")

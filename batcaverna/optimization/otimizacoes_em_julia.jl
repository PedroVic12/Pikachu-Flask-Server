using Statistics
using Plots


# ============================================================
# 1. DADOS
# ============================================================

consumo_2025 = [326, 300, 336, 414, 427, 439]
consumo_2026 = [540, 648, 761, 594, 548, 316, 319]

meses_2025 = [
    "Jul/25", "Ago/25", "Set/25",
    "Out/25", "Nov/25", "Dez/25"
]

meses_2026 = [
    "Jan/26", "Fev/26", "Mar/26",
    "Abr/26", "Mai/26", "Jun/26", "Jul/26"
]


# ============================================================
# 2. FUNÇÕES ESTATÍSTICAS DO CONSUMO
# ============================================================

function calcular_media(dados)
    return mean(dados)
end


function calcular_total(dados)
    return sum(dados)
end


function analisar_consumo(consumo_2025, consumo_2026)

    media_2025 = calcular_media(consumo_2025)
    media_2026 = calcular_media(consumo_2026)

    total_2025 = calcular_total(consumo_2025)
    total_2026 = calcular_total(consumo_2026)

    println("==============================================")
    println("ANÁLISE DE CONSUMO")
    println("==============================================")

    println("Média 2025 (Jul-Dez): ",
        round(media_2025, digits=2))

    println("Média 2026 (Jan-Jul): ",
        round(media_2026, digits=2))

    println("Total 2025 (Jul-Dez): ",
        total_2025)

    println("Total 2026 (Jan-Jul): ",
        total_2026)

    println()

    return media_2025, media_2026
end


# ============================================================
# 3. PLOT - CONSUMO 2025
# ============================================================

function plot_consumo_2025(consumo, meses)

    media = mean(consumo)

    p = plot(
        1:length(consumo),
        consumo,
        marker=:circle,
        linewidth=2,
        xlabel="Mês",
        ylabel="Consumo",
        title="Consumo mensal - 2025",
        xticks=(1:length(meses), meses),
        label="Consumo 2025"
    )

    hline!(
        p,
        [media],
        linestyle=:dash,
        linewidth=2,
        label="Média = $(round(media, digits=2))"
    )

    display(p)

    return p
end


# ============================================================
# 4. PLOT - CONSUMO 2026
# ============================================================

function plot_consumo_2026(consumo, meses)

    media = mean(consumo)

    p = plot(
        1:length(consumo),
        consumo,
        marker=:circle,
        linewidth=2,
        xlabel="Mês",
        ylabel="Consumo",
        title="Consumo mensal - 2026",
        xticks=(1:length(meses), meses),
        label="Consumo 2026"
    )

    hline!(
        p,
        [media],
        linestyle=:dash,
        linewidth=2,
        label="Média = $(round(media, digits=2))"
    )

    display(p)

    return p
end


# ============================================================
# 5. CÁLCULOS DO SAAS
# ============================================================

function calcular_saas(
    quantidade_vendas,
    valor_projeto,
    manutencao_mensal,
    meses_manutencao
)

    receita_projetos =
        quantidade_vendas * valor_projeto

    receita_manutencao_mensal =
        quantidade_vendas * manutencao_mensal

    receita_manutencao_total =
        receita_manutencao_mensal * meses_manutencao

    receita_total =
        receita_projetos + receita_manutencao_total

    media_mensal =
        receita_total / meses_manutencao

    println("==============================================")
    println("ANÁLISE SAAS")
    println("==============================================")

    println(
        "Receita dos projetos: R\$\$ ",
        round(receita_projetos, digits=2)
    )

    println(
        "Manutenção mensal: R\$\$ ",
        round(receita_manutencao_mensal, digits=2)
    )

    println(
        "Manutenção em 6 meses: R\$\$ ",
        round(receita_manutencao_total, digits=2)
    )

    println(
        "Receita total: R\$\$ ",
        round(receita_total, digits=2)
    )

    println(
        "Média mensal em 6 meses: R\$\$ ",
        round(media_mensal, digits=2)
    )

    println()

    return receita_total, media_mensal
end


# ============================================================
# 6. PLOT - RECEITA SAAS
# ============================================================

function plot_saas(
    quantidade_vendas,
    valor_projeto,
    manutencao_mensal,
    meses_manutencao
)

    receita_inicial =
        quantidade_vendas * valor_projeto

    receita_manutencao =
        quantidade_vendas * manutencao_mensal

    receita_mensal = zeros(meses_manutencao)

    # Novembro = venda inicial
    receita_mensal[1] = receita_inicial + receita_manutencao

    # Meses seguintes = apenas manutenção
    for i in 2:meses_manutencao
        receita_mensal[i] = receita_manutencao
    end

    meses = [
        "Nov/25",
        "Dez/25",
        "Jan/26",
        "Fev/26",
        "Mar/26",
        "Abr/26"
    ]

    p = bar(
        meses,
        receita_mensal,
        xlabel="Mês",
        ylabel="Receita (R\$)",
        title="Receita do SaaS",
        label="Receita mensal",
        legend=:topleft
    )

    display(p)

    return p
end


# ============================================================
# 7. CÁLCULOS DA DÍVIDA
# ============================================================

function calcular_divida(divida_inicial, taxa_anual)

    juros_anuais =
        divida_inicial * taxa_anual

    divida_apos_1_ano =
        divida_inicial + juros_anuais

    println("==============================================")
    println("ANÁLISE DA DÍVIDA")
    println("==============================================")

    println(
        "Dívida inicial: R\$ ",
        round(divida_inicial, digits=2)
    )

    println(
        "Taxa anual: ",
        taxa_anual * 100,
        "%"
    )

    println(
        "Juros em 1 ano: R\$ ",
        round(juros_anuais, digits=2)
    )

    println(
        "Dívida após 1 ano: R\$ ",
        round(divida_apos_1_ano, digits=2)
    )

    println()

    return juros_anuais, divida_apos_1_ano
end


# ============================================================
# 8. PLOT - EVOLUÇÃO DA DÍVIDA
# ============================================================

function plot_divida(divida_inicial, taxa_anual, numero_anos)

    anos = 0:numero_anos

    divida = [
        divida_inicial * (1 + taxa_anual)^ano
        for ano in anos
    ]

    p = plot(
        anos,
        divida,
        marker=:circle,
        linewidth=2,
        xlabel="Ano",
        ylabel="Dívida (R\$)",
        title="Evolução da dívida - juros compostos",
        label="Dívida"
    )

    display(p)

    return p
end


# ============================================================
# 9. EXECUÇÃO
# ============================================================

# ---------- Consumo ----------
analisar_consumo(
    consumo_2025,
    consumo_2026
)

plot_consumo_2025(
    consumo_2025,
    meses_2025
)

plot_consumo_2026(
    consumo_2026,
    meses_2026
)

print("Digite algo: ")
resposta = readline()
println("Você digitou: ", resposta)


# ---------- SaaS ----------
quantidade_vendas = 2000
valor_projeto = 3000.0
manutencao_mensal = 50.0
meses_manutencao = 6

calcular_saas(
    quantidade_vendas,
    valor_projeto,
    manutencao_mensal,
    meses_manutencao
)

plot_saas(
    quantidade_vendas,
    valor_projeto,
    manutencao_mensal,
    meses_manutencao
)


# ---------- Dívida ----------
divida_inicial = 13_000_000_000.0
taxa_anual = 0.14

calcular_divida(
    divida_inicial,
    taxa_anual
)

plot_divida(
    divida_inicial,
    taxa_anual,
    10
)
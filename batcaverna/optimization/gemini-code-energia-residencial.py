import matplotlib.pyplot as plt
import numpy as np

# 1. Gerar o gráfico das formas de onda e do desbalanceamento
t = np.linspace(0, 0.04, 1000) # 2 ciclos de 60 Hz (T = 1/60 ~ 0.0167 s)
f = 60
omega = 2 * np.pi * f

V_rms = 127.0
V_peak = V_rms * np.sqrt(2)

v_A = V_peak * np.sin(omega * t)
v_B = V_peak * np.sin(omega * t - 2 * np.pi / 3)
v_C = V_peak * np.sin(omega * t + 2 * np.pi / 3)

# Correntes com carga concentrada na Fase A (ex: 40A de pico) e Fase B e C vazias
i_A = 40.0 * np.sin(omega * t - np.deg2rad(15)) # fp ~ 0.96 indutivo
i_B = np.zeros_like(t)
i_C = np.zeros_like(t)
i_N = i_A + i_B + i_C # Corrente no neutro igual à da fase A

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 7), sharex=True)

# Subplot 1: Tensões
ax1.plot(t * 1000, v_A, label=r'Fase A ($v_A$ - 127 $V_{rms}$)', color='#d9381e', lw=2)
ax1.plot(t * 1000, v_B, label=r'Fase B ($v_B$ - 127 $V_{rms}$)', color='#e69500', lw=2)
ax1.plot(t * 1000, v_C, label=r'Fase C ($v_C$ - 127 $V_{rms}$)', color='#2e7d32', lw=2)
ax1.axhline(0, color='gray', linestyle='--', alpha=0.6)
ax1.set_ylabel('Tensão (V)', fontsize=11, fontweight='bold')
ax1.set_title('Tensões de Fase no Sistema Trifásico Estrela (127V / 220V - 60 Hz)', fontsize=12, fontweight='bold')
ax1.grid(True, linestyle=':', alpha=0.6)
ax1.legend(loc='upper right', frameon=True)

# Subplot 2: Correntes com Desbalanceamento Severo
ax2.plot(t * 1000, i_A, label=r'Corrente Fase A ($i_A$ - Sobrecarga)', color='#d9381e', lw=2.2)
ax2.plot(t * 1000, i_B, label=r'Corrente Fase B ($i_B = 0$ A)', color='#e69500', lw=1.5, linestyle='--')
ax2.plot(t * 1000, i_C, label=r'Corrente Fase C ($i_C = 0$ A)', color='#2e7d32', lw=1.5, linestyle=':')
ax2.plot(t * 1000, i_N, label=r'Corrente de Neutro ($i_N = i_A$)', color='#1565c0', lw=2, linestyle='-.')
ax2.axhline(0, color='gray', linestyle='--', alpha=0.6)
ax2.set_xlabel('Tempo (ms)', fontsize=11, fontweight='bold')
ax2.set_ylabel('Corrente (A)', fontsize=11, fontweight='bold')
ax2.set_title('Problema de Concentração em 1 Fase: Corrente no Neutro $i_N = i_A$', fontsize=12, fontweight='bold')
ax2.grid(True, linestyle=':', alpha=0.6)
ax2.legend(loc='upper right', frameon=True)

plt.tight_layout()
plot_path = "ondas_trifasicas_desbalanceamento.png"
plt.savefig(plot_path, dpi=300)
plt.close()


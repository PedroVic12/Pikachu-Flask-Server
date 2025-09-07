question_data = [
    {
        "question": r"Qual é a transformada de Laplace de $u(t)$, o degrau unitário?",
        "options": [r"$\frac{1}{s}$", r"$1$", r"$s$", r"$\frac{1}{s^2}$"],
        "correct_answer": r"$\frac{1}{s}$",
        "difficulty": "fácil",
        "solution": r"A transformada de Laplace de uma função $f(t)$ é definida como $L\{f(t)\} = \int_0^\infty e^{-st} f(t) \,dt$. Para o degrau unitário, $u(t)=1$ para $t \ge 0$. Portanto, $L\{u(t)\} = \int_0^\infty e^{-st} (1) \,dt = [-\frac{1}{s}e^{-st}]_0^\infty = 0 - (-\frac{1}{s}) = \frac{1}{s}$."
    },
    {
        "question": r"Um circuito RLC série tem $R=2\Omega$, $L=1H$ e $C=0.5F$. Qual é a frequência de ressonância ($\omega_0$) em rad/s?",
        "options": [r"$2$", r"$\sqrt{2}$", r"$1$", r"$0.5$"],
        "correct_answer": r"$\sqrt{2}$",
        "difficulty": "médio",
        "solution": r"A fórmula da frequência de ressonância angular é $\omega_0 = \frac{1}{\sqrt{LC}}$. Substituindo os valores, temos: $\omega_0 = \frac{1}{\sqrt{1 \times 0.5}} = \frac{1}{\sqrt{0.5}} = \frac{1}{1/\sqrt{2}} = \sqrt{2}$ rad/s."
    },
    {
        "question": r"Qual é o resultado de $\int (3x^2 + 2x + 1) \,dx$?",
        "options": [r"$x^3 + x^2 + x + C$", r"$6x + 2 + C$", r"$3x^3 + 2x^2 + x + C$", r"$x^3 + x^2 + C$"],
        "correct_answer": r"$x^3 + x^2 + x + C$",
        "difficulty": "fácil",
        "solution": r"Usando a regra da potência para integração, $\int x^n \,dx = \frac{x^{n+1}}{n+1}$, integramos termo a termo: $\int 3x^2 \,dx + \int 2x \,dx + \int 1 \,dx = 3(\frac{x^3}{3}) + 2(\frac{x^2}{2}) + x + C = x^3 + x^2 + x + C$."
    },
    {
        "question": r"Qual é o valor de $\nabla \times (\nabla f)$ para qualquer campo escalar $f$?",
        "options": [r"$0$", r"$1$", r"$\infty$", r"$f$"],
        "correct_answer": r"$0$",
        "difficulty": "difícil",
        "solution": r"Esta é uma identidade do cálculo vetorial. O rotacional ($\nabla \times$) do gradiente ($\nabla f$) de qualquer campo escalar $f$ é sempre igual a zero. Isso ocorre porque o gradiente de um campo escalar é sempre um campo vetorial conservativo (irrotacional)."
    },
    {
        "question": r"Em coordenadas cilíndricas, qual é o gradiente de $V = \rho z \sin(\phi)$?",
        "options": [
            r"$z \sin(\phi) \hat{a}_\rho + \rho z \cos(\phi) \hat{a}_\phi + \rho \sin(\phi) \hat{a}_z$",
            r"$z \cos(\phi) \hat{a}_\rho - z \sin(\phi) \hat{a}_\phi + \sin(\phi) \hat{a}_z$",
            r"$z \sin(\phi) \hat{a}_\rho + z \cos(\phi) \hat{a}_\phi + \rho \sin(\phi) \hat{a}_z$",
            r"Nenhuma das anteriores"
        ],
        "correct_answer": r"$z \sin(\phi) \hat{a}_\rho + z \cos(\phi) \hat{a}_\phi + \rho \sin(\phi) \hat{a}_z$",
        "difficulty": "difícil",
        "solution": r"A fórmula do gradiente em coordenadas cilíndricas é $\nabla V = \frac{\partial V}{\partial \rho} \hat{a}_\rho + \frac{1}{\rho}\frac{\partial V}{\partial \phi} \hat{a}_\phi + \frac{\partial V}{\partial z} \hat{a}_z$. Calculando as derivadas parciais de $V = \rho z \sin(\phi)$: $\frac{\partial V}{\partial \rho} = z \sin(\phi)$, $\frac{\partial V}{\partial \phi} = \rho z \cos(\phi)$, $\frac{\partial V}{\partial z} = \rho \sin(\phi)$. Substituindo na fórmula, obtemos a resposta correta.\"\n    }\n]"
    }
]
#


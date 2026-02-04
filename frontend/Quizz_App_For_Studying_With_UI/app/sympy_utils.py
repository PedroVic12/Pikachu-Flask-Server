from sympy import symbols, integrate, diff, latex, Eq, solve, sin, cos, Integral

class SympyCalculator:
    def __init__(self, x_sym='x', y_sym='y', z_sym='z', initial_z_value=0):
        self.x, self.y, self.z = symbols(x_sym), symbols(y_sym), symbols(z_sym)
        self.z_initial = initial_z_value

    def integrate_expression(self, expression_str, variable_sym='x'):
        expr = eval(expression_str, {'x': self.x, 'y': self.y, 'z': self.z, 'sin': sin, 'cos': cos, 'Integral': Integral})
        var = symbols(variable_sym)
        result = integrate(expr, var)
        return latex(result)

    def differentiate_expression(self, expression_str, variable_sym='x'):
        expr = eval(expression_str, {'x': self.x, 'y': self.y, 'z': self.z, 'sin': sin, 'cos': cos, 'Integral': Integral})
        var = symbols(variable_sym)
        result = diff(expr, var)
        return latex(result)

    def solve_equation(self, equation_str, variable_sym='x'):
        # Example: equation_str = "Eq(x**2 - 4, 0)"
        eq = eval(equation_str, {'x': self.x, 'y': self.y, 'z': self.z, 'Eq': Eq, 'sin': sin, 'cos': cos, 'Integral': Integral})
        var = symbols(variable_sym)
        result = solve(eq, var)
        return latex(result)

    def expression_to_latex(self, expression_str):
        expr = eval(expression_str, {'x': self.x, 'y': self.y, 'z': self.z, 'sin': sin, 'cos': cos, 'Integral': Integral})
        return latex(expr)

# Exemplo de uso (para teste interno)
if __name__ == '__main__':
    calc = SympyCalculator()
    
    # Integral
    integral_latex = calc.integrate_expression("x**2 + y", "x")
    print(f"Integral de x^2 + y em relação a x: ${integral_latex}$")

    # Derivada
    derivative_latex = calc.differentiate_expression("sin(x*y)", "x")
    print(f"Derivada de sin(x*y) em relação a x: ${derivative_latex}$")

    # Equação
    solve_latex = calc.solve_equation("Eq(x**2 - 9, 0)", "x")
    print(f"Solução de x^2 - 9 = 0: ${solve_latex}$")

    # Expressão para LaTeX
    expr_latex = calc.expression_to_latex("x**2 + y**2 - z")
    print(f"Expressão x^2 + y^2 - z em LaTeX: ${expr_latex}$")
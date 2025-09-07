from flask import Blueprint, render_template, jsonify, session, request
from . import db
from .models import QuizSession
from .question_model import Question
from .data import question_data
from .quiz_brain import QuizBrain
from .ai_quiz_generator import generate_questions_with_ai
from .sympy_utils import SympyCalculator
from .repositories import QuizSessionRepository

main = Blueprint('main', __name__)

def setup_quiz(questions):
    question_bank = []
    for item in questions:
        new_question = Question(item["question"], item["correct_answer"], item.get("options", []))
        question_bank.append(new_question)
    return QuizBrain(question_bank)

@main.route('/')
def dashboard():
    sessions = QuizSessionRepository.get_all_sessions()
    return render_template('dashboard.html', sessions=sessions)

@main.route('/quiz')
def quiz():
    # Carrega o quiz padrão
    session.clear()
    quiz_questions = question_data
    quiz = setup_quiz(quiz_questions)
    session['question_bank'] = [q.__dict__ for q in quiz.question_list]
    session['question_number'] = quiz.question_number
    session['score'] = quiz.score
    session['xp'] = 0
    time_per_question = request.args.get('time_per_question', type=int, default=30)
    session['time_per_question'] = time_per_question # Tempo padrão para o quiz padrão
    return render_template('index.html')

@main.route('/generate-quiz', methods=['POST'])
def generate_quiz():
    api_key = request.form.get('api_key')
    topic = request.form.get('topic')
    difficulty = request.form.get('difficulty')
    num_questions = int(request.form.get('num_questions', 5))
    time_per_question = int(request.form.get('time_per_question', 30)) # Novo campo
    commented_answers = request.form.get('commented_answers') == 'true'

    if not api_key or not topic:
        # Lidar com erro de falta de dados
        return render_template('dashboard.html', error="API Key e Assunto são obrigatórios.")

    # Gera as perguntas
    generated_questions = generate_questions_with_ai(api_key, topic, difficulty, num_questions, commented_answers)

    # Inicia o quiz com as perguntas geradas
    session.clear()
    quiz = setup_quiz(generated_questions)
    session['question_bank'] = [q.__dict__ for q in quiz.question_list]
    session['question_number'] = quiz.question_number
    session['score'] = quiz.score
    session['xp'] = 0
    session['time_per_question'] = time_per_question # Tempo escolhido pelo usuário
    return render_template('index.html')

@main.route('/next_question')
def get_next_question():
    if session['question_number'] < len(session['question_bank']):
        question_data = session['question_bank'][session['question_number']]
        session['question_number'] += 1
        return jsonify({
            'question': {
                'text': f"Q.{session['question_number']}: {question_data['text']}",
                'options': question_data['options']
            },
            'score': session['score'],
            'xp': session['xp'],
            'has_more_questions': True
        })
    else:
        # Fim do quiz, salvar no banco de dados
        QuizSessionRepository.add_session(
            score=session['score'],
            total_questions=session['question_number'],
            xp_gained=session['xp']
        )

        return jsonify({
            'has_more_questions': False,
            'score': session['score'],
            'xp': session['xp'],
            'final_message': f"Você completou o quiz!\nSua pontuação final foi: {session['score']}/{session['question_number']}"
        })

@main.route('/check_answer/', defaults={'user_answer': ''})
@main.route('/check_answer/<user_answer>')
def check_answer(user_answer):
    question_number = session.get('question_number', 1) - 1
    correct_answer = session['question_bank'][question_number]['answer']
    solution = session['question_bank'][question_number].get('solution', 'Nenhuma resolução disponível.')
    is_correct = user_answer.lower() == correct_answer.lower()
    
    if is_correct:
        session['score'] += 1
        session['xp'] += 10

    return jsonify({'is_correct': is_correct, 'correct_answer': correct_answer, 'solution': solution})

@main.route('/sympy_demo')
def sympy_demo():
    calc = SympyCalculator()

    # Exemplo de uso da classe SympyCalculator
    integral_expr = "x**2 + y"
    integral_latex = calc.integrate_expression(integral_expr, "x")

    diff_expr = "sin(x*y)"
    diff_latex = calc.differentiate_expression(diff_expr, "x")

    solve_eq = "Eq(x**2 - 9, 0)"
    solve_latex = calc.solve_equation(solve_eq, "x")

    return render_template('sympy_demo.html',
                           integral_expr=integral_expr,
                           integral_latex=integral_latex,
                           diff_expr=diff_expr,
                           diff_latex=diff_latex,
                           solve_eq=solve_eq,
                           solve_latex=solve_latex)

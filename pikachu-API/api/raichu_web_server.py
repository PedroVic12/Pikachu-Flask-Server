# Configurar a estrutura inicial do projeto RaichuWebServer e o CLI para geração de componentes.
# Implementar a integração com SQLAlchemy para SQLite e criar um modelo de exemplo.
# Desenvolver o dashboard CRUD com múltiplas opções de frameworks CSS e renderização de templates.
# Integrar os templates JSX/React para o frontend e garantir a renderização via Flask.
# Testar todas as funcionalidades do CRUD, CLI e integração de frontend/backend.
# Gerar documentação completa do projeto, incluindo o uso do CLI e a estrutura.
# Entregar o projeto RaichuWebServer completo e funcional.



#!/usr/bin/env python3
"""
RaichuWebServer - Sistema Flask com Arquitetura Limpa
Desenvolvido com SQLAlchemy, múltiplos frameworks CSS e componentes JSX
"""

import os
from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime

# Importações dos módulos internos
from src.database.models import db, User, Task, Project
from src.backend.controllers.user_controller import UserController
from src.backend.controllers.task_controller import TaskController
from src.backend.controllers.project_controller import ProjectController
from src.api.routes import api_bp


class RaichuWebServer:
    """
    Classe principal do servidor RaichuWebServer
    Implementa arquitetura limpa com separação de responsabilidades
    """
    
    def __init__(self):
        self.app = Flask(__name__, 
                        template_folder='src/templates',
                        static_folder='src/static')
        self.configure_app()
        self.setup_database()
        self.setup_routes()
        self.setup_error_handlers()
        
    def configure_app(self):
        """Configuração inicial da aplicação Flask"""
        # Configurações básicas
        self.app.config["SECRET_KEY"] = "raichu-secret-key-2025"
        self.app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///./database/raichu.db"
        self.app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
        
        # Configurações de desenvolvimento
        self.app.config["DEBUG"] = True
        self.app.config["TEMPLATES_AUTO_RELOAD"] = True
        
        # Habilitar CORS para todas as rotas
        CORS(self.app, origins="*")
        
    def setup_database(self):
        """Configuração e inicialização do banco de dados"""
        db.init_app(self.app)
        
        with self.app.app_context():
            # Criar diretório do banco se não existir
            os.makedirs('api/database', exist_ok=True)
            
            # Criar todas as tabelas
            db.create_all()
            
            # Dados iniciais para demonstração
            self.seed_initial_data()
            
    def seed_initial_data(self):
        """Inserir dados iniciais para demonstração"""
        # Verificar se já existem dados
        if User.query.first() is None:
            # Usuários de exemplo
            users = [
                User(name="João Silva", email="joao@example.com", role="admin"),
                User(name="Maria Santos", email="maria@example.com", role="user"),
                User(name="Pedro Costa", email="pedro@example.com", role="user")
            ]
            
            # Projetos de exemplo
            projects = [
                Project(name="Sistema de Vendas", description="Sistema completo de vendas online", status="active"),
                Project(name="App Mobile", description="Aplicativo mobile para delivery", status="planning"),
                Project(name="Dashboard Analytics", description="Dashboard para análise de dados", status="completed")
            ]
            
            # Tarefas de exemplo
            tasks = [
                Task(title="Implementar autenticação", description="Sistema de login e registro", status="pending", priority="high"),
                Task(title="Criar dashboard", description="Interface principal do sistema", status="in_progress", priority="medium"),
                Task(title="Testes unitários", description="Implementar testes automatizados", status="completed", priority="low")
            ]
            
            # Adicionar ao banco
            for user in users:
                db.session.add(user)
            for project in projects:
                db.session.add(project)
            for task in tasks:
                db.session.add(task)
                
            db.session.commit()
            print("✅ Dados iniciais inseridos com sucesso!")
            
    def setup_routes(self):
        """Configuração de todas as rotas da aplicação"""
        # Registrar blueprint da API
        self.app.register_blueprint(api_bp, url_prefix='/api')
        
        # Rotas principais da aplicação
        self.register_main_routes()
        self.register_dashboard_routes()
        
    def register_main_routes(self):
        """Rotas principais da aplicação"""
        
        @self.app.route('/')
        def index():
            """Página inicial com seleção de frameworks"""
            return render_template('index.html')
            
        @self.app.route('/framework/<framework_name>')
        def framework_dashboard(framework_name):
            """Dashboard específico para cada framework CSS"""
            valid_frameworks = ['bootstrap', 'tailwind', 'bulma', 'ionic', 'material']
            
            if framework_name not in valid_frameworks:
                return redirect(url_for('index'))
                
            # Buscar dados para o dashboard
            users = User.query.all()
            tasks = Task.query.all()
            projects = Project.query.all()
            
            # Estatísticas
            stats = {
                'total_users': len(users),
                'total_tasks': len(tasks),
                'total_projects': len(projects),
                'completed_tasks': len([t for t in tasks if t.status == 'completed']),
                'active_projects': len([p for p in projects if p.status == 'active'])
            }
            
            return render_template(f'dashboards/{framework_name}_dashboard.html',
                                 users=users,
                                 tasks=tasks,
                                 projects=projects,
                                 stats=stats,
                                 framework=framework_name)
    
    def register_dashboard_routes(self):
        """Rotas específicas para dashboards"""
        
        @self.app.route('/dashboard')
        def dashboard():
            """Dashboard principal (Bootstrap por padrão)"""
            return redirect(url_for('framework_dashboard', framework_name='bootstrap'))
            
        @self.app.route('/components/<framework_name>')
        def components_showcase(framework_name):
            """Showcase de componentes JSX para cada framework"""
            valid_frameworks = ['bootstrap', 'tailwind', 'bulma', 'ionic', 'material']
            
            if framework_name not in valid_frameworks:
                return redirect(url_for('index'))
                
            return render_template(f'components/{framework_name}_components.html',
                                 framework=framework_name)
    
    def setup_error_handlers(self):
        """Configuração de handlers de erro"""
        
        @self.app.errorhandler(404)
        def not_found(error):
            return render_template('errors/404.html'), 404
            
        @self.app.errorhandler(500)
        def internal_error(error):
            db.session.rollback()
            return render_template('errors/500.html'), 500
    
    def run(self, host='0.0.0.0', port=5000, debug=True):
        """Executar o servidor"""
        print(f"🚀 RaichuWebServer iniciando em http://{host}:{port}")
        print("📊 Dashboards disponíveis:")
        print("   • Bootstrap: /framework/bootstrap")
        print("   • Tailwind: /framework/tailwind") 
        print("   • Bulma: /framework/bulma")
        print("   • Ionic: /framework/ionic")
        print("   • Material: /framework/material")
        print("🔧 API disponível em: /api")
        
        self.app.run(host=host, port=port, debug=debug)


def main():
    """Função principal para executar o servidor"""
    server = RaichuWebServer()
    server.run()


if __name__ == '__main__':
    main()
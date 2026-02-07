import os
import subprocess
import csv
from datetime import datetime

# Configuração
root_dir = "."
output_file = "historico-projetos.csv"

def get_git_log(repo_path):
    try:
        # Pega os ultimos 10 commits: Hash Abreviado | Data | Autor | Mensagem
        cmd = [
            'git', '-C', repo_path, 'log', '-n', '10',
            '--pretty=format:%h|%ad|%an|%s', '--date=short'
        ]
        result = subprocess.check_output(cmd, stderr=subprocess.STDOUT).decode('utf-8').strip()
        if not result:
            return []
        return result.split('\n')
    except subprocess.CalledProcessError:
        return []
    except Exception as e:
        return [f"Erro|{str(e)}||"]

def main():
    print(f"Iniciando varredura em: {os.path.abspath(root_dir)}")
    
    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        # Cabeçalho do CSV
        writer.writerow(['Projeto', 'Hash', 'Data', 'Autor', 'Mensagem'])
        
        # Listar diretórios
        items = os.listdir(root_dir)
        items.sort()
        
        projects_found = 0
        
        for item in items:
            item_path = os.path.join(root_dir, item)
            
            # Verifica se é diretório e se tem .git
            if os.path.isdir(item_path) and os.path.exists(os.path.join(item_path, '.git')):
                projects_found += 1
                commits = get_git_log(item_path)
                
                if commits:
                    for commit in commits:
                        parts = commit.split('|')
                        if len(parts) >= 4:
                            # Reconstrói a mensagem se ela continha pipes
                            msg = "|".join(parts[3:])
                            writer.writerow([item, parts[0], parts[1], parts[2], msg])
                        else:
                            writer.writerow([item, "Formato Inválido", "", "", commit])
                else:
                    writer.writerow([item, "Sem commits", "", "", ""])
                    
    print(f"Concluido. {projects_found} projetos git analisados. Arquivo salvo em {output_file}")

if __name__ == "__main__":
    main()


    

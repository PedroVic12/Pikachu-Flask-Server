import re

def reset_checklist(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()

        new_content = content.replace('- [x]', '- [ ]')
        
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f"Checklists in '{file_path}' have been successfully reset.")
        else:
            print(f"No checked checklists found in '{file_path}'. Nothing to do.")

    except FileNotFoundError:
        print(f"Error: The file '{file_path}' was not found.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    KANBAN =  "/home/pedrov12/Documentos/GitHub/Jedi-CyberPunk/PVRV/KANBAN2025.md"
    BAT_CAVERNA = "/home/pedrov12/Documentos/GitHub/Jedi-CyberPunk/PVRV/batcaverna_pv.md"
    file_to_reset =BAT_CAVERNA
    reset_checklist(file_to_reset)
    print("Bom inicio de semana! Mestre Pedro Victor!")
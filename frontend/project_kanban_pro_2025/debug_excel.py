import pandas as pd
import os
import glob

# This script requires pandas and openpyxl:
# pip install pandas openpyxl

# Path to the database directory relative to the project root
# The script assumes it's run from the project_kanban_pro_2025 directory
DATABASE_DIR = 'database'

def inspect_excel_files(directory):
    """
    Reads all .xlsx files in the specified directory, prints their sheet names,
    and the header of the first sheet.
    """
    print(f"--- Inspecting Excel files in '{os.path.abspath(directory)}' ---")
    
    # Find all .xlsx files in the directory
    excel_files = glob.glob(os.path.join(directory, '*.xlsx'))
    
    if not excel_files:
        print("No .xlsx files found in the directory.")
        return

    for filepath in excel_files:
        print(f"--- Analyzing file: {os.path.basename(filepath)} ---")
        try:
            # Load the Excel file to get sheet names
            xls = pd.ExcelFile(filepath, engine='openpyxl')
            print(f"Sheet names: {xls.sheet_names}")
            
            if not xls.sheet_names:
                print("File contains no sheets.")
                print("-" * (len(os.path.basename(filepath)) + 20) + "\n")
                continue

            # Read the first sheet
            first_sheet_name = xls.sheet_names[0]
            print(f"Reading header and first 5 rows from sheet: '{first_sheet_name}'")
            
            # Read the first 5 rows to inspect headers and data types
            df = pd.read_excel(filepath, sheet_name=first_sheet_name, engine='openpyxl', nrows=5)
            
            print("\n[+] Columns and Data Types:")
            df.info(verbose=False) # Use verbose=False for a more compact output
            
            print("\n[+] Head of the DataFrame:")
            print(df.head())
            
            print("\n" + "-" * (len(os.path.basename(filepath)) + 20) + "\n")

        except Exception as e:
            print(f"\n[!] Error reading file {os.path.basename(filepath)}: {e}\n")

if __name__ == '__main__':
    if os.path.isdir(DATABASE_DIR):
        inspect_excel_files(DATABASE_DIR)
    else:
        print(f"Error: Directory '{DATABASE_DIR}' not found. Make sure you are running this script from the 'project_kanban_pro_2025' directory.")

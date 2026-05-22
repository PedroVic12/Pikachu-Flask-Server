import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

OUTPUT = 'Solicitacao_Contratacao_fillable.pdf'

def create_pdf():
    doc = SimpleDocTemplate(OUTPUT, pagesize=A4, rightMargin=10*mm, leftMargin=10*mm, topMargin=10*mm, bottomMargin=10*mm)
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        alignment=1, # Center
        fontSize=14,
        spaceAfter=10
    )
    
    label_style = ParagraphStyle(
        'LabelStyle',
        parent=styles['Normal'],
        fontSize=8,
        leading=10
    )

    elements = []

    # Title
    elements.append(Paragraph("FLUXO DE APROVAÇÃO POR CARGO", title_style))
    elements.append(Spacer(1, 5*mm))

    # Main Form Table (Table 0)
    # We use a 12-column grid for flexibility
    col_widths = [15*mm, 35*mm, 15*mm, 30*mm, 15*mm, 20*mm, 15*mm, 20*mm, 10*mm, 10*mm]
    # Sum of col_widths = 15+35+15+30+15+20+15+20+10+10 = 185mm (A4 is 210mm, margins 20mm total -> 190mm)
    
    data = [
        # Row 0: Solicitante & Data
        [Paragraph("Solicitante:", label_style), "", "", "", "", "", Paragraph("Data da Requisição:", label_style), "", "", ""],
        # Row 1: Diretoria, Ger. Exec, Ger, UA/Localidade
        [Paragraph("Diretoria:", label_style), "", Paragraph("Ger. Exec:", label_style), "", Paragraph("Gerência:", label_style), "", Paragraph("Localidade:", label_style), "", "", ""],
        # Empty rows for visual spacing if needed, but we'll use cell height
        # Row 2: Cargo
        [Paragraph("Cargo:", label_style), "", "", "", "", "", "", "", "", ""],
        # Row 3: Motivo (Dropdown)
        [Paragraph("Motivo:", label_style), "", "", "", "", "", "", "", "", ""],
        # Row 4: Em substituição a
        [Paragraph("Em substituição a:", label_style), "", "", "", "", "", "", "", "", ""],
        # Row 5: Observação
        [Paragraph("Observação:", label_style), "", "", "", "", "", "", "", "", ""],
        # Row 6: Header GP
        [Paragraph("<b>Preenchimento pela GP</b>", label_style), "", "", "", "", "", "", "", "", ""],
        # Row 7: Análise Remuneração
        [Paragraph("Análise da Remuneração", label_style), "", "", "", "", "", "", "", "", ""],
        # Row 8: Faixa salarial details
        [Paragraph("Faixa salarial:", label_style), Paragraph("Inicial:", label_style), "", Paragraph("Mediana:", label_style), "", Paragraph("Final:", label_style), "", Paragraph("Salário Admissão:", label_style), "", ""],
        # Row 9: Comentários
        [Paragraph("Comentários:", label_style), "", "", "", "", "", "", "", "", ""],
        # Row 10: Data Análise & Analista
        [Paragraph("Data da Análise:", label_style), "", "", "", "", Paragraph("Analista GPA:", label_style), "", "", "", ""],
        # Row 11: Header Quadro Pessoal
        [Paragraph("<b>Análise do Quadro de Pessoal</b>", label_style), "", "", "", "", "", "", "", "", ""],
        # Row 12: Quadro Aut, Atual, Vaga
        [Paragraph("Quadro Autorizado:", label_style), "", "", Paragraph("Quadro Atual:", label_style), "", "", Paragraph("Nº da Vaga:", label_style), "", "", ""],
        # Row 13: Comentários
        [Paragraph("Comentários:", label_style), "", "", "", "", "", "", "", "", ""],
        # Row 14: Header Gerencia Executiva Requisitante
        [Paragraph("<b>Preenchimento - Gerência Executiva Requisitante</b> (Justificativa)", label_style), "", "", "", "", "", "", "", "", ""],
        # Row 15: Justificativa
        [Paragraph("Justificativa:", label_style), "", "", "", "", "", "", "", "", ""],
        # Row 16: Candidato Aprovado, Data, Assinatura
        [Paragraph("Candidato Aprovado:", label_style), "", "", "", Paragraph("Data:", label_style), "", Paragraph("Assinatura:", label_style), "", "", ""],
    ]

    # Define spans and styles
    table_style = TableStyle([
        # Borders
        ('GRID', (0,0), (-1,-1), 0.5, colors.black),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        
        # Row 0: Solicitante (Col 1-5), Data (Col 7-9)
        ('SPAN', (1, 0), (5, 0)),
        ('SPAN', (7, 0), (9, 0)),
        
        # Row 1: Diretoria (Col 1), Ger. Exec (Col 3), Ger (Col 5), Localidade (Col 7-9)
        ('SPAN', (7, 1), (9, 1)),
        
        # Row 2: Cargo
        ('SPAN', (1, 2), (9, 2)),
        
        # Row 3: Motivo
        ('SPAN', (1, 3), (9, 3)),
        
        # Row 4: Em substituição
        ('SPAN', (1, 4), (9, 4)),
        
        # Row 5: Observação (Tall)
        ('SPAN', (1, 5), (9, 5)),
        
        # Row 6: Header GP
        ('SPAN', (0, 6), (9, 6)),
        ('BACKGROUND', (0, 6), (9, 6), colors.lightgrey),
        
        # Row 7: Análise Remuneração
        ('SPAN', (0, 7), (9, 7)),
        
        # Row 8: Faixa salarial
        ('SPAN', (2, 8), (2, 8)), # Inicial value
        ('SPAN', (4, 8), (4, 8)), # Mediana value
        ('SPAN', (6, 8), (6, 8)), # Final value
        ('SPAN', (9, 8), (9, 8)), # Salário value
        
        # Row 9: Comentários
        ('SPAN', (1, 9), (9, 9)),
        
        # Row 10: Data & Analista
        ('SPAN', (1, 10), (4, 10)),
        ('SPAN', (6, 10), (9, 10)),
        
        # Row 11: Header Quadro
        ('SPAN', (0, 11), (9, 11)),
        ('BACKGROUND', (0, 11), (9, 11), colors.lightgrey),
        
        # Row 12: Quadro Aut, Atual, Vaga
        ('SPAN', (1, 12), (2, 12)),
        ('SPAN', (4, 12), (5, 12)),
        ('SPAN', (7, 12), (9, 12)),
        
        # Row 13: Comentários
        ('SPAN', (1, 13), (9, 13)),
        
        # Row 14: Header Gerencia
        ('SPAN', (0, 14), (9, 14)),
        ('BACKGROUND', (0, 14), (9, 14), colors.lightgrey),
        
        # Row 15: Justificativa
        ('SPAN', (1, 15), (9, 15)),
        
        # Row 16: Candidato
        ('SPAN', (1, 16), (3, 16)),
        ('SPAN', (5, 16), (5, 16)),
        ('SPAN', (7, 16), (9, 16)),
    ])

    main_table = Table(data, colWidths=col_widths, rowHeights=[8*mm]*17)
    # Adjust some row heights
    main_table._argH[5] = 20*mm # Observação
    main_table._argH[9] = 15*mm # Comentários
    main_table._argH[13] = 15*mm # Comentários 2
    main_table._argH[15] = 25*mm # Justificativa
    
    main_table.setStyle(table_style)
    elements.append(main_table)
    
    elements.append(Spacer(1, 10*mm))
    
    # Secondary Table (Approval Flow)
    data_flow = [
        ["JOVEM APRENDIZ", "TRAINEE/EFETIVO/GERENTE"],
        ["PARA APROVAÇÃO", "PARA APROVAÇÃO"],
        ["Gerente Executivo GP", "Gerente Imediato"],
        ["", "Gerente Mediato"],
        ["", "Diretor da Área"],
        ["", "Gerente Executivo GP"],
        ["", "Diretor DAC"],
        ["", "Diretor DGL"]
    ]
    
    flow_table = Table(data_flow, colWidths=[90*mm, 90*mm])
    flow_style = TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.black),
        ('BACKGROUND', (0,0), (1,0), colors.lightgrey),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
    ])
    flow_table.setStyle(flow_style)
    elements.append(flow_table)

    # Function to add form fields
    def add_fields(canvas, doc):
        canvas.saveState()
        form = canvas.acroForm
        
        # Helper to get coordinates of a cell in the main table
        # This is tricky because platypus doesn't easily expose coordinates until draw time.
        # We'll use absolute positions for now, or better, we can use a custom Flowable.
        # But for a single page, absolute positions are okay if we know the margins.
        
        # Let's approximate based on margins and row heights
        # doc.topMargin = 10mm, doc.leftMargin = 10mm
        # Page height = 297mm. A4 width = 210mm.
        
        x_start = 10*mm
        y_top = 297*mm - 10*mm - 14 - 15 # Start of main table (Title + Spacer) - approx
        # Wait, title is Paragraph, Spacer is 5mm.
        # Title approx 10mm height.
        y_table_top = 297*mm - 10*mm - 10 - 5 # 272mm approx
        
        def get_y(row_idx):
            h = [8*mm]*17
            h[5] = 20*mm
            h[9] = 15*mm
            h[13] = 15*mm
            h[15] = 25*mm
            return y_table_top - sum(h[:row_idx]) - h[row_idx]

        # Field: Solicitante (Row 0, Col 1-5)
        form.textfield(name='solicitante', x=x_start + 15*mm + 1*mm, y=get_y(0) + 1*mm, width=35*mm+15*mm+30*mm+15*mm+20*mm - 2*mm, height=6*mm)
        # Field: Data Requisição (Row 0, Col 7-9)
        form.textfield(name='data_req', x=x_start + 15*mm+35*mm+15*mm+30*mm+15*mm+20*mm+15*mm + 1*mm, y=get_y(0) + 1*mm, width=20*mm+10*mm+10*mm - 2*mm, height=6*mm)
        
        # Row 1: Diretoria, Ger. Exec, Ger, Localidade
        form.textfield(name='diretoria', x=x_start + 15*mm + 1*mm, y=get_y(1) + 1*mm, width=35*mm - 2*mm, height=6*mm)
        form.textfield(name='ger_exec', x=x_start + 15*mm+35*mm+15*mm + 1*mm, y=get_y(1) + 1*mm, width=30*mm - 2*mm, height=6*mm)
        form.textfield(name='gerencia', x=x_start + 15*mm+35*mm+15*mm+30*mm+15*mm + 1*mm, y=get_y(1) + 1*mm, width=20*mm - 2*mm, height=6*mm)
        
        # DROPDOWN: Localidade (Row 1, Col 7-9)
        localidades = ['Brasília - DF', 'Rio de Janeiro - RJ', 'São Paulo - SP', 'Belo Horizonte - MG', 'Salvador - BA', 'Curitiba - PR', 'Recife - PE', 'Porto Alegre - RS']
        form.choice(name='localidade', x=x_start + 15*mm+35*mm+15*mm+30*mm+15*mm+20*mm+15*mm + 1*mm, y=get_y(1) + 1*mm, width=40*mm - 2*mm, height=6*mm, options=localidades, value='Brasília - DF')

        # Row 2: Cargo
        form.textfield(name='cargo', x=x_start + 15*mm + 1*mm, y=get_y(2) + 1*mm, width=170*mm - 2*mm, height=6*mm)
        
        # DROPDOWN: Motivo (Row 3, Col 1-9)
        motivos = ['Aumento de quadro', 'Efetivo', 'Trainee (prazo determinado)', 'Efetivo (prazo determinado)']
        form.choice(name='motivo', x=x_start + 15*mm + 1*mm, y=get_y(3) + 1*mm, width=170*mm - 2*mm, height=6*mm, options=motivos, value='Efetivo')
        
        # Row 4: Em substituição
        form.textfield(name='substituicao', x=x_start + 15*mm+35*mm+15*mm+30*mm+15*mm + 1*mm, y=get_y(4) + 1*mm, width=70*mm - 2*mm, height=6*mm)
        
        # Row 5: Observação
        form.textfield(name='observacao', x=x_start + 15*mm + 1*mm, y=get_y(5) + 1*mm, width=170*mm - 2*mm, height=18*mm, fieldFlags=4096)
        
        # Row 8: Faixa Salarial values
        form.textfield(name='inicial', x=x_start + 15*mm+35*mm + 1*mm, y=get_y(8) + 1*mm, width=15*mm - 2*mm, height=6*mm)
        form.textfield(name='mediana', x=x_start + 15*mm+35*mm+15*mm+30*mm + 1*mm, y=get_y(8) + 1*mm, width=15*mm - 2*mm, height=6*mm)
        form.textfield(name='final', x=x_start + 15*mm+35*mm+15*mm+30*mm+15*mm+20*mm + 1*mm, y=get_y(8) + 1*mm, width=15*mm - 2*mm, height=6*mm)
        form.textfield(name='salario_acordado', x=x_start + 15*mm+35*mm+15*mm+30*mm+15*mm+20*mm+15*mm+20*mm + 1*mm, y=get_y(8) + 1*mm, width=15*mm - 2*mm, height=6*mm)
        
        # Row 9: Comentários
        form.textfield(name='comentarios_gp', x=x_start + 15*mm + 1*mm, y=get_y(9) + 1*mm, width=170*mm - 2*mm, height=13*mm, fieldFlags=4096)
        
        # Row 10: Data & Analista
        form.textfield(name='data_analise', x=x_start + 15*mm + 1*mm, y=get_y(10) + 1*mm, width=35*mm + 15*mm + 30*mm - 2*mm, height=6*mm)
        form.textfield(name='analista_gpa', x=x_start + 15*mm+35*mm+15*mm+30*mm+15*mm+20*mm + 1*mm, y=get_y(10) + 1*mm, width=30*mm + 10*mm - 2*mm, height=6*mm)
        
        # Row 12: Quadro Aut, Atual, Vaga
        form.textfield(name='quadro_aut', x=x_start + 15*mm + 1*mm, y=get_y(12) + 1*mm, width=35*mm + 15*mm - 2*mm, height=6*mm)
        form.textfield(name='quadro_atual', x=x_start + 15*mm+35*mm+15*mm+30*mm + 1*mm, y=get_y(12) + 1*mm, width=15*mm + 20*mm - 2*mm, height=6*mm)
        form.textfield(name='n_vaga', x=x_start + 15*mm+35*mm+15*mm+30*mm+15*mm+20*mm+15*mm + 1*mm, y=get_y(12) + 1*mm, width=20*mm + 10*mm + 10*mm - 2*mm, height=6*mm)
        
        # Row 13: Comentários
        form.textfield(name='comentarios_quadro', x=x_start + 15*mm + 1*mm, y=get_y(13) + 1*mm, width=170*mm - 2*mm, height=13*mm, fieldFlags=4096)
        
        # Row 15: Justificativa
        form.textfield(name='justificativa', x=x_start + 15*mm + 1*mm, y=get_y(15) + 1*mm, width=170*mm - 2*mm, height=23*mm, fieldFlags=4096)
        
        # Row 16: Candidato, Data, Assinatura
        form.textfield(name='candidato_aprovado', x=x_start + 15*mm + 1*mm, y=get_y(16) + 1*mm, width=35*mm + 15*mm + 30*mm - 2*mm, height=6*mm)
        form.textfield(name='data_final', x=x_start + 15*mm+35*mm+15*mm+30*mm+15*mm+20*mm + 1*mm, y=get_y(16) + 1*mm, width=15*mm - 2*mm, height=6*mm)
        form.textfield(name='assinatura', x=x_start + 15*mm+35*mm+15*mm+30*mm+15*mm+20*mm+15*mm+20*mm + 1*mm, y=get_y(16) + 1*mm, width=15*mm + 10*mm + 10*mm - 2*mm, height=6*mm)
        
        canvas.restoreState()

    doc.build(elements, onFirstPage=add_fields)

if __name__ == '__main__':
    create_pdf()
    print(f'PDF editável gerado: {OUTPUT}')

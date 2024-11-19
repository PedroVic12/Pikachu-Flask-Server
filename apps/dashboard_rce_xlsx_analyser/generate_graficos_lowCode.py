import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from io import BytesIO
import base64
import io

def create_plot():
    try:
        csv_string = components.fileUploader.file[0].content
        graph_type = components.graphSelectionDropdown.value
        print("Debug info:", csv_string, graph_type)
        
        df = pd.read_csv(io.StringIO(csv_string))
        columns = df.columns.tolist()
        
        if len(columns) < 2:
            raise ValueError("CSV must contain at least two columns")
        
        x_column = columns[0]
        y_columns = columns[1:]
        
        plt.figure(figsize=(12, 6))
        
        if graph_type == 'line':
            for col in y_columns:
                plt.plot(df[x_column], df[col], label=col)
            plt.title(f'Line Plot: {x_column} vs {", ".join(y_columns)}')
            plt.legend()
            plt.xticks(rotation=45, ha='right')
        elif graph_type == 'scatter':
            if len(y_columns) >= 2:
                plt.scatter(df[y_columns[0]], df[y_columns[1]])
                plt.title(f'Scatter Plot: {y_columns[0]} vs {y_columns[1]}')
                plt.xlabel(y_columns[0])
                plt.ylabel(y_columns[1])
            else:
                plt.scatter(df[x_column], df[y_columns[0]])
                plt.title(f'Scatter Plot: {x_column} vs {y_columns[0]}')
                plt.xlabel(x_column)
                plt.ylabel(y_columns[0])
        elif graph_type == 'bar':
            x = range(len(df[x_column]))
            width = 0.8 / len(y_columns)
            for i, col in enumerate(y_columns):
                plt.bar([xi + i*width for xi in x], df[col], width, label=col)
            plt.xlabel(x_column)
            plt.ylabel('Value')
            plt.title(f'Bar Plot: {", ".join(y_columns)}')
            plt.xticks([xi + width*(len(y_columns)-1)/2 for xi in x], df[x_column], rotation=45, ha='right')
            plt.legend()
        elif graph_type == 'histogram':
            for col in y_columns:
                plt.hist(df[col], bins=10, alpha=0.5, label=col)
            plt.title(f'Histogram: {", ".join(y_columns)}')
            plt.xlabel('Value')
            plt.ylabel('Frequency')
            plt.legend()
        elif graph_type == 'box':
            plt.boxplot([df[col] for col in y_columns])
            plt.title(f'Box Plot: {", ".join(y_columns)}')
            plt.xticks(range(1, len(y_columns) + 1), y_columns, rotation=45, ha='right')
            plt.ylabel('Value')
        else:
            raise ValueError(f"Invalid graph type: {graph_type}. Choose 'line', 'scatter', 'bar', 'histogram', or 'box'.")
        
        plt.grid(True)
        plt.tight_layout()
        
        buffer = BytesIO()
        plt.savefig(buffer, format='png')
        buffer.seek(0)
        
        img_str = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        plt.close()
        
        return img_str
    except Exception as e:
        print(f"Error in create_plot: {str(e)}")
        return None

create_plot()
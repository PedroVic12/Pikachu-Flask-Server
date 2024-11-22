// Funções para integração com Tooljet

// 1. Função para carregar dados na tabela
async function loadTableData() {
  const response = await fetch('http://localhost:8000/api/items');
  const result = await response.json();
  
  if (result.success) {
    // No Tooljet, use o componente Table
    // e configure o data source como esta função
    return result.data;
  }
  
  throw new Error('Failed to load data');
}

// 2. Função para criar novo item
async function createItem(data) {
  const response = await fetch('http://localhost:8000/api/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  const result = await response.json();
  
  if (result.success) {
    // No Tooljet, use esta função no evento onClick
    // do botão de submit do formulário
    return result.data;
  }
  
  throw new Error('Failed to create item');
}

// 3. Função para buscar item específico
async function getItem(id) {
  const response = await fetch(`http://localhost:8000/api/items/${id}`);
  const result = await response.json();
  
  if (result.success) {
    // No Tooljet, use esta função para
    // carregar dados em um modal ou form
    return result.data;
  }
  
  throw new Error('Item not found');
}

// 4. Função para atualizar tabela após mudanças
function setupRealTimeUpdates(tableComponent) {
  setInterval(async () => {
    const newData = await loadTableData();
    tableComponent.setData(newData);
  }, 5000); // Atualiza a cada 5 segundos
}

// 5. Função para validar formulário
function validateForm(formData) {
  const errors = {};
  
  if (!formData.name) {
    errors.name = 'Name is required';
  }
  
  if (!formData.value || formData.value <= 0) {
    errors.value = 'Value must be greater than 0';
  }
  
  return Object.keys(errors).length === 0 ? null : errors;
}

// No Tooljet, use estas funções assim:
/*
  1. Table Component:
    - Data: {{queries.loadTableData()}}
    - Refresh: setupRealTimeUpdates(table1)
  
  2. Form Component:
    - onSubmit: async () => {
        const errors = validateForm(components.form1.data);
        if (errors) {
          actions.showAlert('Validation Error', 'error');
          return;
        }
        
        try {
          await createItem(components.form1.data);
          actions.showAlert('Item created!', 'success');
          queries.loadTableData();
        } catch (error) {
          actions.showAlert('Error creating item', 'error');
        }
      }
  
  3. Modal/Detail View:
    - onOpen: async (id) => {
        const item = await getItem(id);
        components.form2.setData(item);
      }
*/

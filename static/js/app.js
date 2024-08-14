const { useState, useEffect } = React;
const { Button, TextField, Grid, Container, Paper, Typography } = window['MaterialUI'];
const { IonButton, IonIcon } = window.Ionic;

function App() {
    const [clientes, setClientes] = useState([]);
    const [formData, setFormData] = useState({
        RG: '',
        Nome: '',
        Sobrenome: '',
        Telefone: '',
        Rua: '',
        Numero: '',
        Bairro: ''
    });

    useEffect(() => {
        fetch('/clientes')
            .then(response => response.json())
            .then(data => setClientes(data));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch('/add_cliente', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        }).then(response => response.json())
        .then(() => {
            setFormData({
                RG: '',
                Nome: '',
                Sobrenome: '',
                Telefone: '',
                Rua: '',
                Numero: '',
                Bairro: ''
            });
            fetch('/clientes')
                .then(response => response.json())
                .then(data => setClientes(data));
        });
    };

    const handleDelete = (id) => {
        fetch('/delete_cliente', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ID_Cliente: id })
        }).then(response => response.json())
        .then(() => {
            fetch('/clientes')
                .then(response => response.json())
                .then(data => setClientes(data));
        });
    };

    return (
        <Container>
            <Paper elevation={3} style={{ padding: '20px' }}>
                <Typography variant="h4" gutterBottom>
                    Clientes
                </Typography>
                <ul>
                    {clientes.map(cliente => (
                        <li key={cliente[0]}>
                            {cliente[2]} {cliente[3]}
                            <IonButton onClick={() => handleDelete(cliente[0])} color="danger" style={{ marginLeft: '10px' }}>
                                Delete
                            </IonButton>
                        </li>
                    ))}
                </ul>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="RG" 
                                name="RG" 
                                value={formData.RG} 
                                onChange={handleInputChange} 
                                fullWidth 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Nome" 
                                name="Nome" 
                                value={formData.Nome} 
                                onChange={handleInputChange} 
                                fullWidth 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Sobrenome" 
                                name="Sobrenome" 
                                value={formData.Sobrenome} 
                                onChange={handleInputChange} 
                                fullWidth 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Telefone" 
                                name="Telefone" 
                                value={formData.Telefone} 
                                onChange={handleInputChange} 
                                fullWidth 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Rua" 
                                name="Rua" 
                                value={formData.Rua} 
                                onChange={handleInputChange} 
                                fullWidth 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Numero" 
                                name="Numero" 
                                value={formData.Numero} 
                                onChange={handleInputChange} 
                                fullWidth 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Bairro" 
                                name="Bairro" 
                                value={formData.Bairro} 
                                onChange={handleInputChange} 
                                fullWidth 
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" color="primary" fullWidth>
                                Adicionar Cliente
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
}

ReactDOM.render(<App />, document.getElementById('app'));

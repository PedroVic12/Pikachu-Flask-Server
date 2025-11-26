import React from 'react';
import ServiceOrderAPI from '../services/ServiceOrderAPI';
import PDFModal from './PDFModal';
import { Snackbar, Alert } from '@mui/material';

class ServiceOrderForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formData: {
                rebocador: "",
                responsavel: "",
                dataAbertura: "",
                oficina: "",
                manutencao: "",
                equipamento: "",
                descricaoFalha: "",
                servicoExecutado: "",
                finalizado: false,
                foraOperacao: false
            },
            choices: {
                rebocador: [],
                oficina: [],
                manutencao: [],
                equipamento: []
            },
            snackbar: {
                open: false,
                message: '',
                severity: 'success'
            },
            showPDFModal: false,
            currentOrderId: null,
            pdfUrl: null
        };
    }

    async componentDidMount() {
        try {
            const response = await fetch('http://localhost:5000/api/choices');
            const choices = await response.json();
            this.setState({ choices });
        } catch (error) {
            this.setState({ 
                snackbar: {
                    open: true,
                    message: 'Erro ao carregar as opções',
                    severity: 'error'
                }
            });
        }
    }

    handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        this.setState(prevState => ({
            formData: {
                ...prevState.formData,
                [name]: type === 'checkbox' ? checked : value
            }
        }));
    }

    formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formattedData = {
                ...this.state.formData,
                dataAbertura: this.formatDate(this.state.formData.dataAbertura)
            };
            
            const response = await ServiceOrderAPI.createServiceOrder(formattedData);
            
            this.setState({ 
                snackbar: {
                    open: true,
                    message: 'Ordem de serviço criada com sucesso!',
                    severity: 'success'
                },
                showPDFModal: true,
                currentOrderId: response.order.id,
                pdfUrl: response.pdf_url
            });
            
            // Reset form
            this.setState({
                formData: {
                    rebocador: "",
                    responsavel: "",
                    dataAbertura: "",
                    oficina: "",
                    manutencao: "",
                    equipamento: "",
                    descricaoFalha: "",
                    servicoExecutado: "",
                    finalizado: false,
                    foraOperacao: false
                }
            });
        } catch (error) {
            this.setState({ 
                snackbar: {
                    open: true,
                    message: 'Erro ao criar ordem de serviço: ' + (error.message || 'Erro desconhecido'),
                    severity: 'error'
                }
            });
        }
    }

    handleCloseSnackbar = () => {
        this.setState(prevState => ({
            snackbar: {
                ...prevState.snackbar,
                open: false
            }
        }));
    }

    closeModal = () => {
        this.setState({ showPDFModal: false });
    }

    render() {
        const { formData, choices, showPDFModal, currentOrderId, pdfUrl, snackbar } = this.state;

        return (
            <div className="max-w-2xl mx-auto p-4 bg-[#f5f5f5]">
                <div className="flex items-center mb-6">
                    <i className="fas fa-arrow-left text-[#6B7280] mr-3"></i>
                    <h1 className="font-roboto text-xl">Cadastro de Ordem de Serviço</h1>
                </div>

                <form onSubmit={this.handleSubmit} className="space-y-4">
                    <div className="bg-[#f8e7ff] rounded-lg p-3">
                        <select
                            name="rebocador"
                            className="bg-transparent w-full outline-none font-roboto"
                            value={formData.rebocador}
                            onChange={this.handleChange}
                            required
                        >
                            <option value="">Selecione o Rebocador</option>
                            {choices.rebocador.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#f8e7ff] rounded-lg p-3">
                            <input
                                type="text"
                                name="responsavel"
                                placeholder="RESPONSÁVEL PELA EXECUÇÃO"
                                className="bg-transparent w-full outline-none font-roboto"
                                value={formData.responsavel}
                                onChange={this.handleChange}
                                required
                            />
                        </div>
                        <div className="bg-[#f8e7ff] rounded-lg p-3">
                            <input
                                type="date"
                                name="dataAbertura"
                                className="bg-transparent w-full outline-none font-roboto"
                                value={formData.dataAbertura}
                                onChange={this.handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#f8e7ff] rounded-lg p-3">
                            <select
                                name="oficina"
                                className="bg-transparent w-full outline-none font-roboto"
                                value={formData.oficina}
                                onChange={this.handleChange}
                                required
                            >
                                <option value="">Selecione a Oficina</option>
                                {choices.oficina.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        <div className="bg-[#f8e7ff] rounded-lg p-3">
                            <select
                                name="manutencao"
                                className="bg-transparent w-full outline-none font-roboto"
                                value={formData.manutencao}
                                onChange={this.handleChange}
                                required
                            >
                                <option value="">Selecione o Tipo de Manutenção</option>
                                {choices.manutencao.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="bg-[#f8e7ff] rounded-lg p-3">
                        <select
                            name="equipamento"
                            className="bg-transparent w-full outline-none font-roboto"
                            value={formData.equipamento}
                            onChange={this.handleChange}
                            required
                        >
                            <option value="">Selecione o Equipamento</option>
                            {choices.equipamento.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-[#f8e7ff] rounded-lg p-3">
                        <textarea
                            name="descricaoFalha"
                            placeholder="DESCRIÇÃO DA FALHA"
                            className="bg-transparent w-full outline-none font-roboto resize-none"
                            rows="3"
                            value={formData.descricaoFalha}
                            onChange={this.handleChange}
                            required
                        ></textarea>
                    </div>

                    <div className="bg-[#f8e7ff] rounded-lg p-3">
                        <textarea
                            name="servicoExecutado"
                            placeholder="SERVIÇO EXECUTADO"
                            className="bg-transparent w-full outline-none font-roboto resize-none"
                            rows="3"
                            value={formData.servicoExecutado}
                            onChange={this.handleChange}
                            required
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#f8e7ff] rounded-lg p-3 flex items-center">
                            <input
                                type="checkbox"
                                name="finalizado"
                                className="mr-2"
                                checked={formData.finalizado}
                                onChange={this.handleChange}
                            />
                            <label className="font-roboto">Serviço Finalizado</label>
                        </div>
                        <div className="bg-[#f8e7ff] rounded-lg p-3 flex items-center">
                            <input
                                type="checkbox"
                                name="foraOperacao"
                                className="mr-2"
                                checked={formData.foraOperacao}
                                onChange={this.handleChange}
                            />
                            <label className="font-roboto">FORA DE OPERAÇÃO</label>
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <button
                            type="submit"
                            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Cadastrar
                        </button>
                    </div>
                </form>

                {showPDFModal && (
                    <PDFModal
                        isOpen={showPDFModal}
                        onClose={this.closeModal}
                        pdfUrl={`http://localhost:5000${pdfUrl}`}
                    />
                )}

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={this.handleCloseSnackbar}
                >
                    <Alert
                        onClose={this.handleCloseSnackbar}
                        severity={snackbar.severity}
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </div>
        );
    }
}

export default ServiceOrderForm;

import React from 'react';

class PDFModal extends React.Component {
    render() {
        const { isOpen, onClose, pdfUrl, orderId, excelUrl } = this.props;

        if (!isOpen) return null;

        const baseUrl = 'http://localhost:5000';
        const fullPdfUrl = `${baseUrl}${pdfUrl}`;
        const fullExcelUrl = `${baseUrl}${excelUrl}`;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-4xl w-full h-[80vh]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Ordem de Serviço #{orderId}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div className="mb-4 flex-1" style={{ height: 'calc(100% - 120px)' }}>
                        <embed
                            src={fullPdfUrl}
                            type="application/pdf"
                            className="w-full h-full border-2 border-gray-200 rounded"
                        />
                    </div>
                    
                    <div className="flex justify-end space-x-4 mt-4">
                        <a
                            href={fullExcelUrl}
                            download
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors flex items-center"
                        >
                            <i className="fas fa-file-excel mr-2"></i>
                            Baixar Excel
                        </a>
                        <a
                            href={fullPdfUrl}
                            download
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center"
                        >
                            <i className="fas fa-file-pdf mr-2"></i>
                            Baixar PDF
                        </a>
                        <button
                            onClick={onClose}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors flex items-center"
                        >
                            <i className="fas fa-times mr-2"></i>
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default PDFModal;

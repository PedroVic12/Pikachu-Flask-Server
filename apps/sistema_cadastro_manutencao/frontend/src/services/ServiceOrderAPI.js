import axios from 'axios';

class ServiceOrderAPI {
    constructor() {
        this.api = axios.create({
            baseURL: 'http://localhost:5000/api'
        });
    }

    async createServiceOrder(data) {
        try {
            const response = await this.api.post('/service-orders', data);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Error creating service order');
        }
    }

    async getAllServiceOrders() {
        try {
            const response = await this.api.get('/service-orders');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Error fetching service orders');
        }
    }

    async downloadExcel() {
        try {
            const response = await this.api.get('/service-orders/excel', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'service_orders.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            throw new Error('Error downloading Excel file');
        }
    }

    async downloadPDF(orderId) {
        try {
            const response = await this.api.get(`/service-orders/${orderId}/pdf`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `service_order_${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            throw new Error('Error downloading PDF file');
        }
    }
}

export default new ServiceOrderAPI();

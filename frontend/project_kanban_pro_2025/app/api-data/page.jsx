'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';

// URL da sua API Flask. Certifique-se que seu servidor Python está rodando.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

const ApiDataScreen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Exemplo: buscando dados da tabela 'cliente' através do Blueprint
        const response = await fetch(`${API_URL}/floricultura/clientes`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (e) {
        setError(e.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          Dados da API
        </h1>
        <p className="text-gray-600">
          Esta tela busca e exibe dados diretamente da sua API Python/Flask.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Clientes (de `floricultura.db`)
        </h3>
        {loading && <p>Carregando dados...</p>}
        {error && <p className="text-red-500">Erro ao buscar dados: {error}</p>}
        {data && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  {Object.keys(data[0] || {}).map((key) => (
                    <th key={key} scope="col" className="px-6 py-3">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="bg-white border-b">
                    {Object.values(item).map((value, index) => (
                      <td key={index} className="px-6 py-4">
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiDataScreen;

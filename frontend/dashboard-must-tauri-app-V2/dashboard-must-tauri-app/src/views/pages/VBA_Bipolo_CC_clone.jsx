import React, { useState } from 'react';

export default function BipoloCCPageClone() {
    // Estado para os valores de Despacho (simulando a leitura do Pandas/Openpyxl)
    const [despacho, setDespacho] = useState({
        bipolo1: { novo: 3000, atual: 3000, maximo: 3150, minimo: 315, modo: 'BIPOLAR NORMAL' },
        bipolo2: { novo: 3000, atual: 3000, maximo: 3150, minimo: 315, modo: 'BIPOLAR NORMAL' },
        btb: { novo: 400, atual: 400, maximo: 800, minimo: 80, modo: '' }
    });

    const totalBipolos = Number(despacho.bipolo1.novo) + Number(despacho.bipolo2.novo);
    const totalMadeira = totalBipolos + Number(despacho.btb.novo);

    const handleDespachoChange = (elo, field, value) => {
        setDespacho(prev => ({
            ...prev,
            [elo]: { ...prev[elo], [field]: value }
        }));
    };

    const executarDespacho = () => {
        // Aqui no mundo real você chamaria sua API Python (FastAPI/Flask) ou rodaria a função Pandas
        console.log("Calculando novo despacho com Pandas...", despacho);
        alert(`Despacho Calculado!\nTotal Bipolos: ${totalBipolos} MW\nTotal Madeira: ${totalMadeira} MW`);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 font-sans text-sm">
            <div className="max-w-7xl mx-auto bg-white shadow-xl border border-gray-300">

                {/* Header simulando a Ribbon do Excel */}
                <div className="bg-green-700 text-white p-2 font-bold flex justify-between items-center">
                    <span>SISTEMA DE CONTROLE - DESPACHO DOS ELOS DE CORRENTE CONTÍNUA</span>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded shadow cursor-pointer">
                        Controle
                    </button>
                </div>

                <div className="flex flex-col xl:flex-row p-2 gap-4">

                    {/* LADO ESQUERDO: TABELAS DE CONTROLE */}
                    <div className="w-full xl:w-5/12 flex flex-col gap-4">

                        {/* Tabela: Despacho Elo Madeira */}
                        <div className="border-2 border-gray-800">
                            <div className="bg-gray-300 font-bold text-center p-1 border-b-2 border-gray-800">DESPACHO ELO
                                MADEIRA</div>
                            <table className="w-full text-center">
                                <thead>
                                    <tr className="bg-gray-200 text-xs">
                                        <th className="border border-gray-400 p-1 text-left"></th>
                                        <th className="border border-gray-400 p-1">DESPACHO NOVO</th>
                                        <th className="border border-gray-400 p-1">DESPACHO ATUAL</th>
                                        <th className="border border-gray-400 p-1">MÁXIMO</th>
                                        <th className="border border-gray-400 p-1">MÍNIMO</th>
                                        <th className="border border-gray-400 p-1">MODO DE OPERAÇÃO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border border-gray-400 p-1 font-bold text-left bg-gray-100">Bipolo 1</td>
                                        <td className="border border-gray-400 p-0 bg-[#d9ead3]">
                                            <input type="number" value={despacho.bipolo1.novo} onChange={(e) =>
                                                handleDespachoChange('bipolo1', 'novo', e.target.value)} className="w-full h-full
                                    bg-transparent text-center font-bold focus:outline-none" />
                                        </td>
                                        <td className="border border-gray-400 p-1">{despacho.bipolo1.atual.toFixed(3)}</td>
                                        <td className="border border-gray-400 p-1">{despacho.bipolo1.maximo.toFixed(3)}</td>
                                        <td className="border border-gray-400 p-1">{despacho.bipolo1.minimo}</td>
                                        <td className="border border-gray-400 p-1 text-xs">{despacho.bipolo1.modo}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-400 p-1 font-bold text-left bg-gray-100">Bipolo 2</td>
                                        <td className="border border-gray-400 p-0 bg-[#fce5cd]">
                                            <input type="number" value={despacho.bipolo2.novo} onChange={(e) =>
                                                handleDespachoChange('bipolo2', 'novo', e.target.value)} className="w-full h-full
                                    bg-transparent text-center font-bold focus:outline-none" />
                                        </td>
                                        <td className="border border-gray-400 p-1">{despacho.bipolo2.atual.toFixed(3)}</td>
                                        <td className="border border-gray-400 p-1">{despacho.bipolo2.maximo.toFixed(3)}</td>
                                        <td className="border border-gray-400 p-1">{despacho.bipolo2.minimo}</td>
                                        <td className="border border-gray-400 p-1 text-xs">{despacho.bipolo2.modo}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-400 p-1 font-bold text-left bg-gray-100">Back-to-Back
                                        </td>
                                        <td className="border border-gray-400 p-0 bg-[#d9ead3]">
                                            <input type="number" value={despacho.btb.novo} onChange={(e) =>
                                                handleDespachoChange('btb', 'novo', e.target.value)} className="w-full h-full
                                    bg-transparent text-center font-bold focus:outline-none" />
                                        </td>
                                        <td className="border border-gray-400 p-1">{despacho.btb.atual}</td>
                                        <td className="border border-gray-400 p-1">{despacho.btb.maximo}</td>
                                        <td className="border border-gray-400 p-1">{despacho.btb.minimo}</td>
                                        <td className="border border-gray-400 p-1 text-xs"></td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="flex justify-between items-center p-2 mt-2">
                                <table className="text-center w-1/2">
                                    <tbody>
                                        <tr>
                                            <td className="border border-gray-400 p-1 font-bold text-left bg-gray-100 w-1/2">
                                                Total Bipolos</td>
                                            <td className="border border-gray-400 p-1">{totalBipolos.toFixed(3)}</td>
                                        </tr>
                                        <tr>
                                            <td className="border border-gray-400 p-1 font-bold text-left bg-gray-100">Total
                                                Madeira</td>
                                            <td className="border border-gray-400 p-1">{totalMadeira.toFixed(3)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <button onClick={executarDespacho}
                                    className="bg-gray-200 hover:bg-gray-300 border border-gray-500 font-bold py-2 px-4 shadow-sm cursor-pointer rounded">
                                    Despacho Madeira
                                </button>
                            </div>
                        </div>

                        {/* Tabela: Filtragem Bipolos */}
                        <div className="border-2 border-gray-800">
                            <div className="bg-gray-300 font-bold text-center p-1 border-b-2 border-gray-800">FILTRAGEM BIPOLOS
                            </div>
                            <table className="w-full text-center text-xs">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="border border-gray-400 p-1">Subestação</th>
                                        <th className="border border-gray-400 p-1">Barra</th>
                                        <th className="border border-gray-400 p-1">Grupo</th>
                                        <th className="border border-gray-400 p-1">Instalado</th>
                                        <th className="border border-gray-400 p-1">MVAr</th>
                                        <th className="border border-gray-400 p-1">Tipo</th>
                                        <th className="border border-gray-400 p-1">Quantidade</th>
                                        <th className="border border-gray-400 p-1">Reativo (MVAr)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Araraquara */}
                                    <tr>
                                        <td rowSpan="4" className="border border-gray-400 p-1 font-bold bg-gray-100">Araraquara
                                        </td>
                                        <td rowSpan="4" className="border border-gray-400 p-1">7057</td>
                                        <td className="border border-gray-400 p-1">10</td>
                                        <td className="border border-gray-400 p-1">4</td>
                                        <td className="border border-gray-400 p-1">305</td>
                                        <td className="border border-gray-400 p-1">Filtro BP1</td>
                                        <td className="border border-gray-400 p-1 bg-[#d9ead3]">3</td>
                                        <td rowSpan="4" className="border border-gray-400 p-1">1830</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-400 p-1">20</td>
                                        <td className="border border-gray-400 p-1">3</td>
                                        <td className="border border-gray-400 p-1">305</td>
                                        <td className="border border-gray-400 p-1">BC BP1</td>
                                        <td className="border border-gray-400 p-1 bg-[#fce5cd]">0</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-400 p-1">30</td>
                                        <td className="border border-gray-400 p-1">4</td>
                                        <td className="border border-gray-400 p-1">305</td>
                                        <td className="border border-gray-400 p-1">Filtro BP2</td>
                                        <td className="border border-gray-400 p-1 bg-[#fce5cd]">3</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-400 p-1">40</td>
                                        <td className="border border-gray-400 p-1">2</td>
                                        <td className="border border-gray-400 p-1">316</td>
                                        <td className="border border-gray-400 p-1">BC BP2</td>
                                        <td className="border border-gray-400 p-1 bg-[#d9ead3]">0</td>
                                    </tr>
                                    {/* Porto Velho */}
                                    <tr>
                                        <td rowSpan="3" className="border border-gray-400 p-1 font-bold bg-gray-100">Porto Velho
                                        </td>
                                        <td rowSpan="3" className="border border-gray-400 p-1">7055</td>
                                        <td className="border border-gray-400 p-1">10</td>
                                        <td className="border border-gray-400 p-1">1</td>
                                        <td className="border border-gray-400 p-1">183</td>
                                        <td className="border border-gray-400 p-1">Filtro BP1</td>
                                        <td className="border border-gray-400 p-1 bg-[#d9ead3]">1</td>
                                        <td rowSpan="3" className="border border-gray-400 p-1">2223</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-400 p-1">20</td>
                                        <td className="border border-gray-400 p-1">5</td>
                                        <td className="border border-gray-400 p-1">263</td>
                                        <td className="border border-gray-400 p-1">Filtro BP1</td>
                                        <td className="border border-gray-400 p-1 bg-[#d9ead3]">4</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-400 p-1">30</td>
                                        <td className="border border-gray-400 p-1">5</td>
                                        <td className="border border-gray-400 p-1">247</td>
                                        <td className="border border-gray-400 p-1">Filtro BP2</td>
                                        <td className="border border-gray-400 p-1 bg-[#fce5cd]">4</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Tabela: Despacho Usinas Madeira (Simplificada) */}
                        <div className="border-2 border-gray-800">
                            <div className="bg-gray-300 font-bold text-center p-1 border-b-2 border-gray-800">DESPACHO USINAS
                                MADEIRA</div>
                            <table className="w-full text-center text-xs">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="border border-gray-400 p-1">Usina</th>
                                        <th className="border border-gray-400 p-1">Local</th>
                                        <th className="border border-gray-400 p-1">Despacho(MW)</th>
                                        <th className="border border-gray-400 p-1">Despacho(%)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td rowSpan="2" className="border border-gray-400 p-1 font-bold bg-gray-100">St. Antônio
                                        </td>
                                        <td className="border border-gray-400 p-1">Margem Direita</td>
                                        <td className="border border-gray-400 p-1">516</td>
                                        <td className="border border-gray-400 p-1">93%</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-400 p-1">Leito do Rio</td>
                                        <td className="border border-gray-400 p-1">802</td>
                                        <td className="border border-gray-400 p-1">93%</td>
                                    </tr>
                                    <tr>
                                        <td rowSpan="2" className="border border-gray-400 p-1 font-bold bg-gray-100">Jirau</td>
                                        <td className="border border-gray-400 p-1">Margem Direita</td>
                                        <td className="border border-gray-400 p-1">1948</td>
                                        <td className="border border-gray-400 p-1">93%</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-400 p-1">Margem Esquerda</td>
                                        <td className="border border-gray-400 p-1">1531</td>
                                        <td className="border border-gray-400 p-1">93%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                    </div>

                    {/* LADO DIREITO: ESQUEMÁTICO GRÁFICO */}
                    <div
                        className="w-full xl:w-7/12 border-2 border-gray-800 relative bg-white min-h-[600px] flex flex-col justify-center p-4">
                        <div className="absolute top-2 left-2 font-bold text-lg">Coletora Porto Velho</div>
                        <div className="absolute top-2 right-2 font-bold text-lg">Araraquara</div>

                        {/* Linha Vermelha (Porto Velho) */}
                        <div className="absolute left-10 top-10 bottom-10 w-1.5 bg-red-600 z-10"></div>

                        {/* Componente Gráfico Bipolo 1 */}
                        <div className="relative w-full h-40 flex items-center justify-between pl-16 pr-12 mt-8">
                            {/* Textos da esquerda */}
                            <div className="absolute left-2 text-xs text-red-600 flex flex-col items-end">
                                <span className="text-black">183 Mvar</span>
                                <div className="border border-red-600 px-1 font-bold bg-white">1</div>
                            </div>

                            {/* Retificador */}
                            <div className="flex items-center gap-1 z-20">
                                <div className="w-8 h-8 rounded-full border-2 border-red-600 bg-white"></div>
                                <div
                                    className="w-10 h-16 border-2 border-black flex flex-col justify-center items-center bg-white relative">
                                    <div
                                        className="w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-black border-r-[10px] border-r-transparent">
                                    </div>
                                    <div className="w-full h-0.5 bg-black absolute top-1/2 -mt-[1px]"></div>
                                </div>
                            </div>

                            {/* Linha de Transmissão */}
                            <div
                                className="flex-1 h-24 border-t-2 border-b-2 border-black relative mx-2 flex items-center justify-center">
                                <div className="absolute -top-6 text-sm font-bold">600 kV</div>
                                <div className="absolute top-2 font-bold text-lg">Bipolo 1</div>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[16px] border-l-green-600 border-b-[8px] border-b-transparent">
                                    </div>
                                    <span className="font-bold text-xl">{Number(despacho.bipolo1.novo).toFixed(3)}</span>
                                </div>
                            </div>

                            {/* Inversor */}
                            <div className="flex items-center gap-1 z-20">
                                <div
                                    className="w-10 h-16 border-2 border-black flex flex-col justify-center items-center bg-white relative">
                                    <div
                                        className="w-0 h-0 border-l-[10px] border-l-transparent border-b-[10px] border-b-black border-r-[10px] border-r-transparent">
                                    </div>
                                    <div className="w-full h-0.5 bg-black absolute top-1/2 -mt-[1px]"></div>
                                </div>
                                <div className="w-8 h-8 rounded-full border-2 border-red-800 bg-white"></div>
                            </div>
                        </div>

                        {/* Componente Gráfico Bipolo 2 */}
                        <div className="relative w-full h-40 flex items-center justify-between pl-16 pr-12">
                            <div className="absolute left-2 text-xs text-red-600 flex flex-col items-end">
                                <span className="text-black">263 Mvar</span>
                                <div className="border border-red-600 px-1 font-bold bg-white">4</div>
                            </div>

                            <div className="flex items-center gap-1 z-20">
                                <div className="w-8 h-8 rounded-full border-2 border-red-600 bg-white"></div>
                                <div
                                    className="w-10 h-16 border-2 border-black flex flex-col justify-center items-center bg-white relative">
                                    <div
                                        className="w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-black border-r-[10px] border-r-transparent">
                                    </div>
                                    <div className="w-full h-0.5 bg-black absolute top-1/2 -mt-[1px]"></div>
                                </div>
                            </div>

                            <div
                                className="flex-1 h-24 border-t-2 border-b-2 border-black relative mx-2 flex items-center justify-center">
                                <div className="absolute -top-6 text-sm font-bold">600 kV</div>
                                <div className="absolute top-2 font-bold text-lg">Bipolo 2</div>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[16px] border-l-green-600 border-b-[8px] border-b-transparent">
                                    </div>
                                    <span className="font-bold text-xl">{Number(despacho.bipolo2.novo).toFixed(3)}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 z-20">
                                <div
                                    className="w-10 h-16 border-2 border-black flex flex-col justify-center items-center bg-white relative">
                                    <div
                                        className="w-0 h-0 border-l-[10px] border-l-transparent border-b-[10px] border-b-black border-r-[10px] border-r-transparent">
                                    </div>
                                    <div className="w-full h-0.5 bg-black absolute top-1/2 -mt-[1px]"></div>
                                </div>
                                <div className="w-8 h-8 rounded-full border-2 border-red-800 bg-white"></div>
                            </div>
                        </div>

                        {/* Componente Gráfico Back-to-Back */}
                        <div className="relative w-full h-40 flex items-center justify-center pl-16 pr-12 mt-10">
                            <div className="absolute top-0 right-32 font-bold text-lg">Porto Velho</div>
                            {/* Linha Verde (Porto Velho Local) */}
                            <div className="absolute right-32 top-8 bottom-0 w-1.5 bg-green-500 z-10"></div>

                            <div className="absolute left-2 text-xs text-red-600 flex flex-col items-end">
                                <span className="text-black">142 Mvar</span>
                                <div className="border border-red-600 px-1 font-bold bg-white">2</div>
                            </div>

                            <div
                                className="w-3/5 h-24 border-2 border-black relative flex items-center justify-between px-2 bg-white z-20">
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 font-bold text-lg">
                                    Back-to-Back</div>

                                <div className="flex items-center gap-1">
                                    <div className="w-8 h-8 rounded-full border-2 border-red-600 bg-white -ml-8"></div>
                                    <div className="w-8 h-12 border-2 border-black flex justify-center items-center relative">
                                        <div
                                            className="w-0 h-0 border-l-[6px] border-l-transparent border-t-[6px] border-t-black border-r-[6px] border-r-transparent">
                                        </div>
                                        <div className="w-full h-0.5 bg-black absolute top-1/2 -mt-[1px]"></div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[12px] border-l-green-600 border-b-[6px] border-b-transparent">
                                    </div>
                                    <span className="font-bold text-xl">{Number(despacho.btb.novo)}</span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <div className="w-8 h-12 border-2 border-black flex justify-center items-center relative">
                                        <div
                                            className="w-0 h-0 border-l-[6px] border-l-transparent border-b-[6px] border-b-black border-r-[6px] border-r-transparent">
                                        </div>
                                        <div className="w-full h-0.5 bg-black absolute top-1/2 -mt-[1px]"></div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full border-2 border-green-600 bg-white -mr-8"></div>
                                </div>
                            </div>

                            <div className="absolute right-16 text-xs text-green-600 flex flex-col items-start z-20">
                                <span className="text-black">-63 Mvar</span>
                                <div className="border border-green-600 px-1 font-bold bg-white mb-2">1</div>
                                <span className="text-black">186 Mvar</span>
                                <div className="border border-green-600 px-1 font-bold bg-white">3</div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Rodapé - Simulação das abas do Excel */}
                <div className="bg-gray-200 border-t border-gray-400 flex gap-1 p-1 overflow-x-auto text-xs mt-2">
                    <div
                        className="px-3 py-1 bg-white border border-gray-400 font-bold border-b-transparent border-b-2 z-10 cursor-pointer">
                        R_ELOS CC</div>
                    <div className="px-3 py-1 bg-[#c9daf8] cursor-pointer hover:bg-white border border-gray-400">C_Mapas</div>
                    <div className="px-3 py-1 bg-[#b6d7a8] cursor-pointer hover:bg-white border border-gray-400">R_REDESPACHO
                    </div>
                    <div className="px-3 py-1 bg-[#d9d2e9] cursor-pointer hover:bg-white border border-gray-400">EOL_Geração
                    </div>
                    <div className="px-3 py-1 bg-[#fce5cd] cursor-pointer hover:bg-white border border-gray-400">F_Tensão_FPO
                    </div>
                </div>

            </div>
        </div>
    );
}
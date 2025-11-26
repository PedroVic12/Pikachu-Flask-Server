'use client';

import React from 'react';

// Este é um componente React simples.
// Ele exporta uma função que retorna um elemento JSX.
export default function OlaMundo() {
  return (
    <div className="p-8 bg-white rounded-xl shadow-md">
      <h1 className="text-3xl font-bold text-blue-600">
        Olá, Mundo! 👋
      </h1>
      <p className="mt-4 text-gray-700">
        Esta é uma nova tela que foi importada para dentro do `page.jsx`.
      </p>
      <p className="mt-2 text-sm text-gray-500">
        Você pode criar componentes assim em arquivos separados para organizar melhor seu código.
      </p>
    </div>
  );
}

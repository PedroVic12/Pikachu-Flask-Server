'use client';

import React from 'react';


// Cria um componente H1 com estilo personalizado
function H1({ children, color, size }) {
  return (
    <h1 className={`text-${size} font-bold text-${color}`}>
      {children}
    </h1>
  );
}

// Cria um componente P com estilo personalizado
function P({ children, color }) {
  return (
    <p className={`mt-2 text-sm text-${color}`}>
      {children}
    </p>
  );
}



// Este é um componente React simples.
// Ele exporta uma função que retorna um elemento JSX.
export default function OlaMundo() {
  return (
    <div className="p-8 bg-white rounded-xl shadow-md">
      <H1 color="blue-600" size="3xl">
        Olá, Mundo! 👋
      </H1>
      <P color="gray-700">
        Esta é uma nova tela que foi importada para dentro do `page.jsx`.
      </P>
      <P color="gray-500">
        Você pode criar componentes assim em arquivos separados para organizar melhor seu código.
      </P>
    </div>
  );
}

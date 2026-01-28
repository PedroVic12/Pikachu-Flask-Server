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


function getToday() {
  let today = new Date();
  let date = today.getDate().toString().padStart(2, '0');
  let month = (today.getMonth() + 1).toString().padStart(2, '0'); // month from 0 to 11
  let year = today.getFullYear();
  return `${date}/${month}/${year}`;
}

// Este é um componente React simples.
// Ele exporta uma função que retorna um elemento JSX.
export default function OlaMundo() {

  let dataAtual = getToday();

  return (
    <div className="p-8 bg-white rounded-xl shadow-md">
      <H1 color="blue-600" size="3xl">
        Olá, Mundo! 👋 Hoje é dia {`${dataAtual}`}
      </H1>
      <P color="gray-700">
        Esta é uma nova tela que foi importada para dentro do `page.jsx`. na pasta views/HTML
      </P>
      <P color="gray-500">
        Você pode criar componentes assim em arquivos separados para organizar melhor seu código.
      </P>

      <P>
        Neste trecho, vc criou componentes básicos HTML com React e tailwind para começar a refatoração de novas páginas dentro do projeto.
      </P>
    </div>
  );
}

'use client';

import React from 'react';
import { LayoutDashboard, Kanban, Table, FileText, Database, GitBranch } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    title: 'Dashboard de Projetos',
    description: 'Visão geral dos seus projetos e atividades.',
    href: '/',
    icon: LayoutDashboard,
    color: 'blue'
  },
  {
    title: 'Kanban Board',
    description: 'Organize seus projetos visualmente com o quadro Kanban.',
    href: '/', // Assuming this is the main screen with Kanban
    icon: Kanban,
    color: 'orange'
  },
  {
    title: 'CRM Floricultura',
    description: 'Acesse os dados de clientes, produtos e vendas da floricultura.',
    href: '/api-data',
    icon: Database,
    color: 'green'
  },
  {
    title: 'Gerenciador de Arquivos',
    description: 'Upload e gerenciamento de PDFs, imagens e planilhas.',
    href: '/', // Should link to the correct screen when 'files' is selected
    icon: FileText,
    color: 'purple'
  },
  {
    title: 'Gestão de Projetos',
    description: 'Acesse e gerencie os projetos do sistema.',
    href: '/projects',
    icon: GitBranch,
    color: 'red'
  }
];

const colorClasses = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', hover: 'hover:bg-blue-200' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600', hover: 'hover:bg-orange-200' },
  green: { bg: 'bg-green-100', text: 'text-green-600', hover: 'hover:bg-green-200' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600', hover: 'hover:bg-purple-200' },
  red: { bg: 'bg-red-100', text: 'text-red-600', hover: 'hover:bg-red-200' }
};

export default function PikachuDashboard() {
  return (
    <div className="p-4 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Pikachu Project Central
          </h1>
          <p className="text-lg text-gray-600">
            Seu hub centralizado para todos os serviços e aplicações.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const colors = colorClasses[feature.color];
            return (
              <Link href={feature.href} key={feature.title}>
                <a className={`block p-6 rounded-xl shadow-md transition-transform transform hover:-translate-y-1 ${colors.bg} ${colors.hover}`}>
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-lg mr-4 ${colors.bg}`}>
                      <feature.icon className={`h-8 w-8 ${colors.text}`} />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">{feature.title}</h2>
                  </div>
                  <p className="text-gray-600">{feature.description}</p>
                </a>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

export default function ProjectsScreen() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/projects`);
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error("Erro ao buscar projetos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          Gerenciamento de Projetos
        </h1>
        <p className="text-gray-600">
          Dados de projetos vindos da API Unificada.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        {loading ? (
          <p>Carregando projetos...</p>
        ) : (
          <ul className="space-y-4">
            {projects.map((project) => (
              <li key={project.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <h3 className="font-bold text-lg text-blue-700">{project.name}</h3>
                <p className="text-sm text-gray-600">{project.description}</p>
                <div className="mt-2 text-xs">
                  <span className={`px-2 py-1 rounded-full ${project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {project.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

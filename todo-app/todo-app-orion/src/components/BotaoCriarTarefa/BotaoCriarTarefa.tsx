import React, { useEffect, useState } from 'react';

interface Tarefa {
  id: number;
  titulo: string;
}

const LOCAL_STORAGE_KEY = 'tarefas';

const BotaoCriarTarefa: React.FC = () => {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);

  // Fallback seguro caso os dados estejam corrompidos ou ausentes
  const carregarTarefas = (): Tarefa[] => {
    try {
      const dados = localStorage.getItem(LOCAL_STORAGE_KEY);
      const tarefasConvertidas = dados ? JSON.parse(dados) : [];
      // Verifica se o conteúdo é realmente uma lista de tarefas válida
      if (
        Array.isArray(tarefasConvertidas) &&
        tarefasConvertidas.every(t => typeof t.id === 'number' && typeof t.titulo === 'string')
      ) {
        return tarefasConvertidas;
      } else {
        console.warn('Dados inválidos encontrados no localStorage. Inicializando com vazio.');
        return [];
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas do localStorage:', error);
      return [];
    }
  };

  const salvarTarefas = (tarefasAtualizadas: Tarefa[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tarefasAtualizadas));
    } catch (error) {
      console.error('Erro ao salvar tarefas no localStorage:', error);
    }
  };

  // Inicializa o estado com dados do localStorage
  useEffect(() => {
    const tarefasIniciais = carregarTarefas();
    setTarefas(tarefasIniciais);
  }, []);

  // Atualiza o estado e sincroniza com o localStorage
  const atualizarTarefas = (novasTarefas: Tarefa[]) => {
    setTarefas(novasTarefas);
    salvarTarefas(novasTarefas);
  };

  const criarTarefa = () => {
    const titulo = prompt('Digite o título da nova tarefa:');
    if (titulo && titulo.trim()) {
      const novaTarefa: Tarefa = {
        id: Date.now(),
        titulo: titulo.trim(),
      };
      atualizarTarefas([...tarefas, novaTarefa]);
    }
  };

  const editarTarefa = (id: number) => {
    const novaDescricao = prompt('Editar tarefa:');
    if (novaDescricao && novaDescricao.trim()) {
      const tarefasEditadas = tarefas.map(t =>
        t.id === id ? { ...t, titulo: novaDescricao.trim() } : t
      );
      atualizarTarefas(tarefasEditadas);
    }
  };

  const excluirTarefa = (id: number) => {
    const confirmacao = confirm('Tem certeza que deseja excluir esta tarefa?');
    if (confirmacao) {
      const tarefasFiltradas = tarefas.filter(t => t.id !== id);
      atualizarTarefas(tarefasFiltradas);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <button
        onClick={criarTarefa}
        className="mb-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded shadow"
      >
        ➕ Criar Tarefa
      </button>

      <ul className="space-y-2">
        {tarefas.length > 0 ? (
          tarefas.map(tarefa => (
            <li
              key={tarefa.id}
              className="flex justify-between items-center bg-gray-100 p-2 rounded shadow-sm"
            >
              <span>{tarefa.titulo}</span>
              <div className="space-x-2">
                <button
                  onClick={() => editarTarefa(tarefa.id)}
                  className="text-sm text-yellow-600 hover:text-yellow-800"
                >
                  Editar
                </button>
                <button
                  onClick={() => excluirTarefa(tarefa.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))
        ) : (
          <p className="text-gray-400 italic">Nenhuma tarefa criada ainda.</p>
        )}
      </ul>
    </div>
  );
};

export default BotaoCriarTarefa;
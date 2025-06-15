import React from 'react';
import ListaDeTarefas from '../ListaDeTarefas/ListaDeTarefas';

const Board: React.FC = () => {
  return (
    <div>
      <header>
        <h1>Board</h1>
      </header>

      <main>
        <ListaDeTarefas
          titulo="A fazer"
          exibirBotaoCriarTarefas={false}
        />

        <ListaDeTarefas
          titulo="Em Andamento"
        />

        <ListaDeTarefas
          titulo="Em Revisão"
        />

        <ListaDeTarefas
          titulo="Concluído"
        />
      </main>
    </div>
  );
};

export default Board;
import React from 'react';
import Tarefa from '../Tarefa/Tarefa';
import BotaoCriarTarefa from '../BotaoCriarTarefa/BotaoCriarTarefa';

interface ListaDeTarefasProps {
  titulo: string;
  exibirBotaoCriarTarefas?: boolean;
}

const ListaDeTarefas: React.FC<ListaDeTarefasProps> = ({ titulo, exibirBotaoCriarTarefas}) => {
  return (
    <div>
      <h2>
        {titulo}
      </h2>
      
      <div>
        {exibirBotaoCriarTarefas && <BotaoCriarTarefa />}
        <Tarefa />
        <Tarefa />
        <Tarefa />
        
        {titulo === "A fazer" && <Tarefa exibirDescricao={true} />}
      </div>
    </div>
  );
};

export default ListaDeTarefas;

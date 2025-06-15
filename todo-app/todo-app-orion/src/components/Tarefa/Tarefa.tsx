import React from 'react';

interface TarefaProps {
  tituloPlaceholder?: string;
  dataDeVencimento?: string;
  exibirDescricao?: boolean; 
}

const Tarefa: React.FC<TarefaProps> = ({ 
  tituloPlaceholder = "Título da tarefa", 
  dataDeVencimento = "00-00-00",
  exibirDescricao = true
}) => {
  return (
    <div>
      <div>
        <input
          type="text"
          placeholder={tituloPlaceholder}
        />
        <span>
          {dataDeVencimento}
        </span>
      </div>

      {exibirDescricao && (
        <div>
          Descrição da tarefa
        </div>
      )}
    </div>
  );
};

export default Tarefa;
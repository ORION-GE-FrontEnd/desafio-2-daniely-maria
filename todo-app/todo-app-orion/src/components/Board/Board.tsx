import ListaDeTarefas from '../ListaDeTarefas/ListaDeTarefas';
import Footer from "../Footer/Footer";

const Board = () => {
    const listas = [
        { titulo: "A fazer", exibirBotaoCriarTarefas: true, corDeFundo: "bg-pink-200" },
        { titulo: "Em Andamento", exibirBotaoCriarTarefas: true, corDeFundo: "bg-yellow-100" },
        { titulo: "Em Revisão", exibirBotaoCriarTarefas: true, corDeFundo: "bg-green-100" },
        { titulo: "Concluído", exibirBotaoCriarTarefas: true, corDeFundo: "bg-green-200" }
    ];
    return (
        <>
            <div className="bg-white min-h-screen">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-black font-bold text-2xl sm:text-3xl md:text-4xl">Board</h1>
                    <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        {listas.map((lista, index) => (
                            <ListaDeTarefas
                                key={index}
                                titulo={lista.titulo}
                                exibirBotaoCriarTarefas={lista.exibirBotaoCriarTarefas}
                                corDeFundo={lista.corDeFundo}
                            />
                        ))}
                    </main>
                </div>
                <Footer />
            </div>
        </>
    )
}

export default Board;
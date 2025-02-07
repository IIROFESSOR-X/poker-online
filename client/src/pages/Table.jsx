export default function Table() {
  const { id } = useParams();
  const { players, table, myHand, connectToTable, startGame, makeBet, fold } = useGameStore();

  useEffect(() => {
    connectToTable(id);
  }, [id]);

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold">Игровой стол #{id}</h1>

      <button className="mt-4 p-2 bg-green-500 text-white rounded" onClick={() => startGame(id)}>
        Начать игру
      </button>

      <h2 className="mt-4 text-lg">Банк: {table.pot} фишек</h2>

      <div className="mt-4">
        <h3 className="font-bold">Твои карты:</h3>
        <div className="flex space-x-2">
          {myHand.map((card, index) => (
            <div key={index} className="p-2 bg-blue-300 rounded">
              {card.rank} {card.suit}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-bold">Игроки:</h3>
        <ul>
          {players.map((player) => (
            <li key={player.id}>{player.name}: {player.chips} фишек</li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex space-x-4">
        <button className="p-2 bg-blue-500 text-white rounded" onClick={() => makeBet(id, 100)}>Ставка 100</button>
        <button className="p-2 bg-red-500 text-white rounded" onClick={() => fold(id)}>Пас</button>
      </div>
    </div>
  );
}

<button className="p-2 bg-purple-500 text-white rounded" onClick={() => nextRound(id)}>
  Следующий раунд
</button>
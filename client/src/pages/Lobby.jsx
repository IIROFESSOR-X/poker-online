import { useNavigate } from "react-router-dom";

export default function Lobby() {
  const navigate = useNavigate();

  const joinTable = (id) => {
    navigate(`/table/${id}`);
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold">Лобби</h1>
      <button
        className="mt-4 p-2 bg-blue-500 text-white rounded"
        onClick={() => joinTable(1)}
      >
        Войти за стол
      </button>
    </div>
  );
}
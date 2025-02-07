const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { createDeck, dealCards } = require("./deck");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" },
});

const tables = {}; // Данные всех столов

io.on("connection", (socket) => {
  console.log(`Игрок подключился: ${socket.id}`);

  socket.on("joinTable", (tableId) => {
    if (!tables[tableId]) {
      tables[tableId] = {
        players: [],
        pot: 0,
        communityCards: [],
        deck: createDeck(),
        currentTurn: 0,
        bigBlind: 50,
        smallBlind: 25,
        phase: "preflop", // Этап игры
      };
    }

    const player = { id: socket.id, name: `Игрок-${socket.id.slice(0, 4)}`, chips: 1000, hand: [], bet: 0 };
    tables[tableId].players.push(player);

    socket.join(tableId);
    io.to(tableId).emit("gameState", tables[tableId]);

    console.log(`Игрок ${player.name} присоединился к столу ${tableId}`);
  });

  socket.on("startGame", (tableId) => {
    const table = tables[tableId];
    if (!table || table.players.length < 2) return;

    table.deck = createDeck();
    table.pot = 0;
    table.communityCards = [];
    table.phase = "preflop";

    table.players.forEach((player) => {
      player.hand = dealCards(table.deck, 2);
      player.bet = 0;
    });

    // Устанавливаем блайнды
    table.players[0].chips -= table.smallBlind;
    table.players[0].bet = table.smallBlind;

    table.players[1].chips -= table.bigBlind;
    table.players[1].bet = table.bigBlind;

    table.pot += table.smallBlind + table.bigBlind;
    table.currentTurn = 2; // Следующий после блайндов ходит

    io.to(tableId).emit("gameState", table);
  });

  socket.on("makeBet", ({ tableId, betAmount }) => {
    const table = tables[tableId];
    if (!table) return;

    const player = table.players[table.currentTurn];
    if (!player || player.chips < betAmount) return;

    player.chips -= betAmount;
    player.bet += betAmount;
    table.pot += betAmount;

    table.currentTurn = (table.currentTurn + 1) % table.players.length; // Передаем ход следующему

    io.to(tableId).emit("gameState", table);
  });

  socket.on("fold", ({ tableId }) => {
    const table = tables[tableId];
    if (!table) return;

    const player = table.players[table.currentTurn];
    if (!player) return;

    table.players = table.players.filter((p) => p.id !== player.id); // Убираем игрока

    if (table.players.length === 1) {
      io.to(tableId).emit("winner", table.players[0]);
      return;
    }

    table.currentTurn = table.currentTurn % table.players.length;
    io.to(tableId).emit("gameState", table);
  });

  socket.on("nextRound", (tableId) => {
    const table = tables[tableId];
    if (!table) return;

    if (table.communityCards.length === 0) {
      table.communityCards = dealCards(table.deck, 3);
      table.phase = "flop";
    } else if (table.communityCards.length === 3) {
      table.communityCards.push(...dealCards(table.deck, 1));
      table.phase = "turn";
    } else if (table.communityCards.length === 4) {
      table.communityCards.push(...dealCards(table.deck, 1));
      table.phase = "river";
    } else {
      determineWinner(table);
      return;
    }

    io.to(tableId).emit("gameState", table);
  });

  const { determineWinner } = require("./handEvaluator");

function determineGameWinner(table) {
  if (table.players.length === 1) {
    io.to(table.players[0].id).emit("winner", table.players[0]);
    return;
  }

  const winner = determineWinner(table.players, table.communityCards);
  winner.chips += table.pot;
  table.pot = 0;
  table.communityCards = [];
  table.phase = "preflop";

  io.to(table.id).emit("winner", winner);
}

  socket.on("disconnect", () => {
    console.log(`Игрок отключился: ${socket.id}`);
    for (const tableId in tables) {
      tables[tableId].players = tables[tableId].players.filter(p => p.id !== socket.id);
      io.to(tableId).emit("gameState", tables[tableId]);
    }
  });
});

server.listen(3001, () => {
  console.log("Сервер запущен на порту 3001");
});

app.use(express.static(path.join(__dirname, 'client', 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});


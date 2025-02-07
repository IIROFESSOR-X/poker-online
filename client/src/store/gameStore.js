import { create } from "zustand";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

export const useGameStore = create((set) => ({
  players: [],
  table: { pot: 0, communityCards: [] },
  myHand: [],
  setPlayers: (players) => set({ players }),
  setTable: (table) => set({ table }),
  setMyHand: (hand) => set({ myHand: hand }),

  connectToTable: (tableId) => {
    socket.emit("joinTable", tableId);

    socket.on("gameState", (state) => {
      set({ players: state.players, table: state.table });
      const myPlayer = state.players.find((p) => p.id === socket.id);
      if (myPlayer) set({ myHand: myPlayer.hand });
    });

    socket.on("winner", (winner) => {
      alert(`Победитель: ${winner.name}`);
    });
  },

  startGame: (tableId) => {
    socket.emit("startGame", tableId);
  },

  makeBet: (tableId, amount) => {
    socket.emit("makeBet", { tableId, betAmount: amount });
  },

  fold: (tableId) => {
    socket.emit("fold", { tableId });
  },
}));

export const useGameStore = create((set) => ({
  nextRound: (tableId) => {
    socket.emit("nextRound", tableId);
  },
}));
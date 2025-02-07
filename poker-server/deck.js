const suits = ["♠", "♥", "♦", "♣"];
const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

function createDeck() {
  let deck = [];
  for (let suit of suits) {
    for (let rank of ranks) {
      deck.push({ rank, suit });
    }
  }
  return deck.sort(() => Math.random() - 0.5); // Перемешиваем колоду
}

function dealCards(deck, count) {
  return deck.splice(0, count); // Отдаем верхние карты
}

module.exports = { createDeck, dealCards };

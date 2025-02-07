const ranks = "23456789TJQKA";
const suits = "♠♥♦♣";

function getHandStrength(hand, communityCards) {
  const allCards = [...hand, ...communityCards];
  const values = allCards.map((card) => ranks.indexOf(card[0]));
  const suitsCount = allCards.reduce((acc, card) => {
    acc[card[1]] = (acc[card[1]] || 0) + 1;
    return acc;
  }, {});

  const flush = Object.values(suitsCount).some((count) => count >= 5);
  values.sort((a, b) => b - a);
  
  const straight = values.some((v, i, arr) => arr.slice(i, i + 5).every((x, j) => x - j === v));

  if (straight && flush) return { rank: 8, name: "Стрит-флеш", high: values[0] };
  if (flush) return { rank: 5, name: "Флеш", high: values[0] };
  if (straight) return { rank: 4, name: "Стрит", high: values[0] };

  return { rank: 0, name: "Старшая карта", high: values[0] };
}

function determineWinner(players, communityCards) {
  let bestPlayer = null;
  let bestHand = { rank: -1 };

  players.forEach((player) => {
    const handStrength = getHandStrength(player.hand, communityCards);
    if (handStrength.rank > bestHand.rank || (handStrength.rank === bestHand.rank && handStrength.high > bestHand.high)) {
      bestHand = handStrength;
      bestPlayer = player;
    }
  });

  return bestPlayer;
}

module.exports = { determineWinner };

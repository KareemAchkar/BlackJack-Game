import BlackjackGame from "./BlackjackGame";

async function runGame() {
  const game = new BlackjackGame(3, "Player1");

  console.log("Starting Blackjack game...");
  const result = await game.playRound();
  console.log("Round result:", result);
}

runGame();

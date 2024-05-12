import express, { Request, Response } from "express";
import bodyParser from "body-parser";

import BlackjackGame from "./BlackjackGame";
import generate_random_ID from "./utils/generate_random_ID";
import save_game from "./utils/save_game";

const Development = true;

const app = express();
const PORT = 3000;

const current_games: {
    [key: string]: BlackjackGame;
} = {};

app.use(bodyParser.json()); 

app.get("/start-game", (req: Request, res: Response) => {
    const { playerName } = req.query; 

    if (!playerName) {
        res.status(400).json({ error: "Delay and playerName are required" });
        return;
    }

    let player_name_string = playerName as string;

    if (player_name_string.length < 1) {
        res.status(400).json({ error: "PlayerName is required" });
        return;
    }

    const randomId = generate_random_ID(10);

    const game = new BlackjackGame(1, player_name_string); 

    const result = game.startGame();
    
    current_games[randomId] = game;

    res.status(200).json({ gameID: randomId, result });
});

app.get("/player-move", (req: Request, res: Response) => {
    const { gameID, move } = req.query; 

    if (!gameID || !move) {
        res.status(400).json({ error: "Missing parameters" });
        return;
    }

    let move_string = move as PlayerAction;
    let game_ID_string = gameID as string;

    if (!(game_ID_string in current_games)) {
        res.status(400).json({ message: "Something went wrong" })
        return;
    }

    if (current_games[game_ID_string].deck.length < 1) {
        delete current_games[game_ID_string];
        res.status(200).json({ message: "Deck is empty." });
        return;
    }

    const result = current_games[game_ID_string].playerMove(move_string);

    if (!result) {
        res.status(400).json({ error: "Something went wrong" });
        return;
    }

    if (result.isGameOver) {
        save_game(game_ID_string, current_games[game_ID_string]);
    }

    res.json({ result });
});

app.get("/generate-cards", (req: Request, res: Response) => {
    const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
    const values = [
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "Jack",
        "Queen",
        "King",
        "Ace",
    ];

    const randomSuit = suits[Math.floor(Math.random() * suits.length)];

    const randomValue = values[Math.floor(Math.random() * values.length)];

    const randomCard = { suit: randomSuit, value: randomValue };

    res.json({ card: randomCard });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

import fs from "fs";
import BlackjackGame from "../BlackjackGame";

export default function save_game(id: string, game: BlackjackGame) {
  let db: any;

  fs.readFile("./db.json", "utf8", (error, data) => {
    if (error) {
      // Log to server log.
      console.log(error);
    }

    try {
      db = JSON.parse(data);

      const date = new Date();

      db[id] = {
        game: game.determineWinner(),
        date: date.toJSON(),
      };

      fs.writeFile("./db.json", JSON.stringify(db), (error) => {
        if (error) {
          console.log("An error has occurred ", error);
          return false;
        }
        console.log("Data written successfully to disk");
      });

      return true;
    } catch (parseErr) {
      console.error("Error parsing JSON:", parseErr);
    }
  });
}

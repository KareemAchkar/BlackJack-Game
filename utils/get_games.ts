import fs from "fs";

export default async function get_games() {
  return new Promise((resolve, reject) => {
    let db: any;

    fs.readFile("./db.json", "utf8", (error, data) => {
      if (error) {
        reject(error);
      }

      try {
        db = JSON.parse(data);
        resolve(db);
      } catch (parseErr) {
        reject(parseErr);
      }
    });
  });
}

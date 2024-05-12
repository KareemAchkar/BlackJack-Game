import * as readline from "node:readline";

class BlackjackGame {
  public deck: Deck;

  public static actionOptions = ["hit", "stay"] as const;
  public static suits = ["Hearts", "Diamonds", "Clubs", "Spades"] as const;
  public static values = [
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
  ] as const;
  public static hidden: Card = { value: "?", suit: "?" };

  public isGameOver = false;

  private static icon = {
    Hearts: "♥",
    Diamonds: "♦",
    Clubs: "♠",
    Spades: "♣",
    "?": "?",
  };

  public playerHand: Card[] = [];
  public dealerHand: Card[] = [];

  constructor(public delay: number, public playerName: string) {
    this.deck = this.generateDeck();
    this.shuffleDeck();
    this.playerHand = [];
    this.dealerHand = [];
    this.isGameOver = false;
  }

  generateDeck() {
    let deck: Deck = [];
    const deckCount = 6;

    for (let i = 0; i < deckCount; i++) {
      for (let suit of BlackjackGame.suits) {
        for (let value of BlackjackGame.values) {
          deck.push({ value, suit });
        }
      }
    }
    return deck;
  }

  shuffleDeck() {
    for (let i = this.deck.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  dealInitialCards() {
    this.playerHand.push(this.deck.pop() as Card);
    this.dealerHand.push(this.deck.pop() as Card);
    this.playerHand.push(this.deck.pop() as Card);
    this.dealerHand.push(this.deck.pop() as Card);
  }

  getPlayerHandValue(hand: Card[]) {
    let value = 0;
    let aceCount = 0;

    for (let card of hand) {
      if (card.value === "Ace") {
        aceCount++;
      } else if (
        card.value === "Jack" ||
        card.value === "Queen" ||
        card.value === "King"
      ) {
        value += 10;
      } else {
        value += parseInt(card.value);
      }
    }

    while (aceCount > 0 && value + 11 <= 21) {
      value += 11;
      aceCount--;
    }
    while (aceCount > 0) {
      value += 1;
      aceCount--;
    }

    return value;
  }

  async playerAction() {
    this.printCurrentHands();
    let action: string = await this.getPlayerAction();

    while (!BlackjackGame.actionOptions.includes(action as PlayerAction)) {
      console.log('Please type either "hit" or "stay".');

      action = await this.getPlayerAction();
    }

    if (action === "hit") {
      this.playerHand.push(this.deck.pop() as Card);
      const playerHandValue = this.getPlayerHandValue(this.playerHand);

      if (playerHandValue > 21) {
        this.isGameOver = true;
      }
    } else if (action === "stay") {
      this.dealerAction();
      this.isGameOver = true;
    }
  }

  dealerAction() {
    let dealerHandValue = this.getPlayerHandValue(this.dealerHand);
    this.dealerHand.push(this.deck.pop() as Card);
    while (dealerHandValue < 17) {
      this.dealerHand.push(this.deck.pop() as Card);
      dealerHandValue = this.getPlayerHandValue(this.dealerHand);
    }
  }

  determineWinner() {
    const playerHandValue = this.getPlayerHandValue(this.playerHand);
    const dealerHandValue = this.getPlayerHandValue(this.dealerHand);

    if (playerHandValue > 21) {
      return { winner: this.dealerHand };
    } else if (dealerHandValue > 21) {
      return { winner: this.playerHand };
    } else if (playerHandValue === dealerHandValue) {
      return { draw: this.playerHand };
    } else if (playerHandValue > dealerHandValue) {
      return { winner: this.playerHand };
    } else {
      return { winner: this.dealerHand };
    }
  }

  // main
  async playRound() {
    await this.loadingAnimation();

    this.dealInitialCards();
    while (!this.isGameOver) {
      await this.playerAction();
    }

    const winner = this.determineWinner();
    return winner;
  }

  async getPlayerAction() {
    return new Promise<string>((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question(
        "Would you like to hit or stay? >> ",

        (input) => {
          resolve(input);
          rl.close();
        }
      );
    });
  }

  //#region Printing

  private async loadingAnimation() {
    if (this.delay < 0) {
      throw Error(
        "Delay value of the game should be in seconds and should not be below zero."
      );
    }

    let delay = this.delay;

    while (delay >= 0) {
      console.log(`${delay}...`);
      await this.waitFor(1);
      delay--;
    }
  }

  private printCurrentHands() {
    console.log(`${this.playerName} Hand`);
    this.playerHand.forEach((card) => this.printCard(card));
    console.log("\nDealer Hand");
    [BlackjackGame.hidden, ...this.dealerHand.slice(1)].forEach((card) =>
      this.printCard(card)
    );
  }

  private printCard(card: Card) {
    const { value, suit } = card;

    console.log(
      `
            ||||||||||
            |${this.feedCharacter(value, true)}      |
            |${BlackjackGame.icon[suit]}       |
            |        |
            |      ${this.feedCharacter(value, false)}|
            |       ${BlackjackGame.icon[suit]}|
            ||||||||||
            `
    );
  }

  private feedCharacter(str: string, isTop: boolean) {
    let res = `${isNaN(parseInt(str)) ? str[0] : str}`;
    if (res.length < 2) {
      if (isTop) {
        res = res + " ";
      } else {
        res = " " + res;
      }
    }

    return res;
  }

  //#endregion

  //#region Utils

  private assertDeck() {
    if (this.deck.length === 0) {
      throw Error(
        "Increase the number of decks to account for the player count.\nThe deck became empty before the game ends."
      );
    }
  }

  private async waitFor(seconds: number) {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve("");
      }, seconds * 1000);
    });
  }
  //#endregion

  //#region Server
  startGame() {
    this.dealInitialCards();

    const { playerHand, dealerHand } = this;

    return {
      playerHand,
      dealerHand: [BlackjackGame.hidden, ...dealerHand.slice(1)],
    };
  }

  playerMove(action: PlayerAction) {
    if (action === "hit") {
      const drawnCard = this.deck.pop() as Card;
      this.playerHand.push(drawnCard);
      const playerHandValue = this.getPlayerHandValue(this.playerHand);

      if (playerHandValue > 21) {
        this.isGameOver = true;
      }

      return {
        isGameOver: this.isGameOver,
        drawnCard,
      };
    }

    if (action === "stay") {
      this.dealerAction();
      this.isGameOver = true;

      const winner = this.determineWinner();
      return {
        isGameOver: this.isGameOver,
        winner,
      };
    }

    return false;
  }
  //#endregion
}

export default BlackjackGame;

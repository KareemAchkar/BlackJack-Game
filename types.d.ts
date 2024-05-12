
declare type PlayerAction = 'hit' | 'stay';
declare type Suit = 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades' | '?';
declare type Value = '?' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'Jack' | 'Queen' | 'King' | 'Ace';
declare type Card = {
    value: Value,
    suit: Suit
}
declare type Deck = Card[]
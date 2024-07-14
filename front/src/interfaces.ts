export interface Card {
    suit: string;
    rank: string;
  }
  
  export interface Player {
    id: string;
    hand: Card[];
    isDefender: boolean;
  }
  
  export interface Game {
    players: Player[];
    deck: Card[];
    trumpCard: Card;
    table: Card[];
    turn: number;
  }
  
  export interface LocationState {
    sid: string;
  }
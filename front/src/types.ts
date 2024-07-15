export interface Card {
  id: number
  rank: number
  type: TypeCard,
  img: string
}
export enum TypeCard {
  chervi = 'chervi',
  bubi = 'bubi',
  piki = 'piki',
  kresti = 'kresti'
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
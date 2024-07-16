// src/types.ts

export enum TypeCard {
  chervi = 'chervi',
  bubi = 'bubi',
  piki = 'piki',
  kresti = 'kresti'
}

export interface Card {
  id: number;
  rank: number;
  type: TypeCard;
  img: string;
}

export interface Player {
  sid: string;
  hand: Card[];
  isDefender: boolean;
}

export interface Game {
  players: Player[];
  deck: Card[];
  current_turn: string; // Изменено на тип string, если это идентификатор игрока
  trumpCard: Card;
  table: Card[];
  turn: number;
}

export interface LocationState {
  sid: string;
}

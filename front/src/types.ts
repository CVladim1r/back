export enum TypeCard {
  chervi = 'chervi',
  bubi = 'bubi',
  piki = 'piki',
  kresti = 'kresti'
}

export interface Card {
  suit: string;
  rank: string;
  img?: string;
}

export interface Player {
  sid: string;
  name: string;
  hand: Card[];
  isDefender: boolean;
}

export interface Game {
  players: Player[];
  trump_card: Card;
  current_turn: string;
  attacking_player: string;
  defending_player: string;
  active_cards: Card[];
  beaten_cards: Card[];
  deck: Card[];
  deck_count: number;
  winner?: string;
}

export interface ActiveCard extends Card {
  isPlayerCard: boolean;
  index: number;
}

export interface LocationState {
  sid: string;
}

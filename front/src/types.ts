export interface Card {
  id: number;
  rank: number;
  type: string;
  img: string;
}
export enum TypeCard {
  chervi = 'chervi',
  bubi = 'bubi',
  piki = 'piki',
  kresti = 'kresti'
}

export interface Player {
  sid: string;
  hand: Card[];
}

export interface Game {
  players: Player[];
  trump_card: Card | null;
  current_turn: string;
  attacking_player: string;
  defending_player: string;
  active_cards: Card[];
  deck: Card[];
}

export interface LocationState {
  sid: string;
}
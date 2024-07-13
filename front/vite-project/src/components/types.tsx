export interface CardProps {
  card: {
    rank: string;
    suit: string;
  };
  onClick: (card: { rank: string; suit: string }) => void;
}

export interface CardType {
  rank: string;
  suit: string;
}

export interface PlayerType {
  id: string;
  hand: CardType[];
}

export interface PlayerProps {
  player: PlayerType;
  onCardClick: (card: CardType) => void;
}

export interface CardType {
    rank: string;
    suit: string;
}

export interface PlayerType {
  id: string;
  hand: CardType[];
}

export interface ServerMessage {
  type: string;
  gameId?: string;
  players?: PlayerType[];
  trumpCard?: CardType;
  card?: CardType;
  playerId?: string;
  clientId?: string;
}
  
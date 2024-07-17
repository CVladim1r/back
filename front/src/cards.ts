import { Card } from "./types";

export enum TypeCard {
  bubi = 'bubi',
  chervi = 'chervi',
  kresti = 'kresti',
  piki = 'piki',
}

export const cards: Array<{ rank: string; type: string; img: string }> = [
  { rank: '6', type: TypeCard.bubi, img: 'cards/1b.bmp' },
  { rank: '6', type: TypeCard.chervi, img: 'cards/1c.bmp' },
  { rank: '6', type: TypeCard.kresti, img: 'cards/1k.bmp' },
  { rank: '6', type: TypeCard.piki, img: 'cards/1p.bmp' },
  { rank: '7', type: TypeCard.bubi, img: 'cards/2b.bmp' },
  { rank: '7', type: TypeCard.chervi, img: 'cards/2c.bmp' },
  { rank: '7', type: TypeCard.kresti, img: 'cards/2k.bmp' },
  { rank: '7', type: TypeCard.piki, img: 'cards/2p.bmp' },
  { rank: '8', type: TypeCard.bubi, img: 'cards/3b.bmp' },
  { rank: '8', type: TypeCard.chervi, img: 'cards/3c.bmp' },
  { rank: '8', type: TypeCard.kresti, img: 'cards/3k.bmp' },
  { rank: '8', type: TypeCard.piki, img: 'cards/3p.bmp' },
  { rank: '9', type: TypeCard.bubi, img: 'cards/4b.bmp' },
  { rank: '9', type: TypeCard.chervi, img: 'cards/4c.bmp' },
  { rank: '9', type: TypeCard.kresti, img: 'cards/4k.bmp' },
  { rank: '9', type: TypeCard.piki, img: 'cards/4p.bmp' },
  { rank: '10', type: TypeCard.bubi, img: 'cards/5b.bmp' },
  { rank: '10', type: TypeCard.chervi, img: 'cards/5c.bmp' },
  { rank: '10', type: TypeCard.kresti, img: 'cards/5k.bmp' },
  { rank: '10', type: TypeCard.piki, img: 'cards/5p.bmp' },
  { rank: '11', type: TypeCard.bubi, img: 'cards/6b.bmp' },
  { rank: '11', type: TypeCard.chervi, img: 'cards/6c.bmp' },
  { rank: '11', type: TypeCard.kresti, img: 'cards/6k.bmp' },
  { rank: '11', type: TypeCard.piki, img: 'cards/6p.bmp' },
  { rank: '12', type: TypeCard.bubi, img: 'cards/7b.bmp' },
  { rank: '12', type: TypeCard.chervi, img: 'cards/7c.bmp' },
  { rank: '12', type: TypeCard.kresti, img: 'cards/7k.bmp' },
  { rank: '12', type: TypeCard.piki, img: 'cards/7p.bmp' },
  { rank: '13', type: TypeCard.bubi, img: 'cards/8b.bmp' },
  { rank: '13', type: TypeCard.chervi, img: 'cards/8c.bmp' },
  { rank: '13', type: TypeCard.kresti, img: 'cards/8k.bmp' },
  { rank: '13', type: TypeCard.piki, img: 'cards/8p.bmp' },
  { rank: '14', type: TypeCard.bubi, img: 'cards/9b.bmp' },
  { rank: '14', type: TypeCard.chervi, img: 'cards/9c.bmp' },
  { rank: '14', type: TypeCard.kresti, img: 'cards/9k.bmp' },
  { rank: '14', type: TypeCard.piki, img: 'cards/9p.bmp' },
];


export const getCardImage = (rank: string, suit: string) => {
  const card = cards.find(c => c.rank === rank && c.type === suit);
  return card ? card.img : 'path/to/default/image.png'; 
};
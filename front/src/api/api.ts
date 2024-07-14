import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8080/api'
});

export const createGame = async (sid: string) => {
  const response = await api.get(`/find_room?sid=${sid}`);
  return response.data;
};

export const startGame = async (gameId: string) => {
  // Implementation of starting the game
};

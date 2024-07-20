# Telegram MiniApp Game API

Этот проект представляет собой серверную часть игры для мини-приложения Telegram, построенную с использованием FastAPI. API поддерживает создание комнат, добавление игроков, начало игры и взаимодействие с игроками через WebSocket соединения.

## Установка и запуск

### Требования

- Python 3.8+
- Виртуальное окружение (рекомендуется)

bash
```
python -m venv env
source env/bin/activate 
```

## API Эндпоинты

### Эндпоинты комнат

- POST /create_room/{room_id}: Создать новую комнату для игры.
- POST /room/{room_id}/add_player: Добавить игрока в комнату.
- GET /room/{room_id}/players: Получить список игроков в комнате.
- DELETE /room/{room_id}: Удалить комнату.
- GET /rooms: Получить список всех комнат с количеством игроков в каждой.

### Эндпоинты игры

- POST /room/{room_id}/start_game: Начать игру в комнате.
- GET /room/{room_id}/game_state: Получить текущее состояние игры в комнате.
- POST /room/{room_id}/end_game: Завершить игру в комнате.

### WebSocket

GET /room={room_id}&playerid={player_sid}&playername={player_name}: Подключиться к комнате через WebSocket.

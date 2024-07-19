// src/global.d.ts
interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
  }
  
  interface TelegramWebApp {
    initDataUnsafe: {
      user: TelegramUser;
    };
    ready: () => void;
  }
  
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
  }
  
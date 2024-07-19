import React, { useEffect, useState } from 'react';
import './Profile.css';

const Profile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const tg = window.Telegram.WebApp;

  useEffect(() => {
    if (tg) {
      // Telegram Web App API доступен
      setUser(tg.initDataUnsafe);
    }
  }, [tg]);

  // Функция для получения информации о пользователе из Telegram API
  const getUserInfo = () => {
    if (tg && tg.initDataUnsafe) {
      const userInfo = tg.initDataUnsafe.user;
      return userInfo ? userInfo : 'No user info available';
    }
    return 'No user info available';
  };

  return (
    <div className="profile-container">
      <h1>Profile Page</h1>
      {user ? (
        <div className="profile-info">
          <img
            src={user.photo_url || 'https://via.placeholder.com/150'}
            alt="User Photo"
            className="profile-photo"
          />
          <div className="profile-details">
            <h2>{user.first_name} {user.last_name}</h2>
            <p>@{user.username}</p>
            <p>User ID: {user.id}</p>
          </div>
        </div>
      ) : (
        <p>Loading user info...</p>
      )}
    </div>
  );
};

export default Profile;

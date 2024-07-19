import React, { useEffect, useState } from 'react';
import './Profile.css';

const tele = window.Telegram.WebApp;

const Profile: React.FC = () => {
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    tele.ready();
    const initDataUnsafe = tele.initDataUnsafe;
    setUser(initDataUnsafe.user);
  }, []);

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

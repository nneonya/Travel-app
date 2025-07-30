import React, { useState } from 'react';
import './Avatar.css';

interface AvatarProps {
  url?: string;
  name: string;
  size?: number;
}

const Avatar: React.FC<AvatarProps> = ({ url, name, size = 200 }) => {
  const [imageError, setImageError] = useState(false);

  // Generate a consistent color based on the name
  const getColorFromName = (name: string) => {
    const colors = [
      '#FF6B6B', // red
      '#4ECDC4', // teal
      '#45B7D1', // blue
      '#96CEB4', // green
      '#FFEEAD', // yellow
      '#D4A5A5', // pink
      '#9B59B6', // purple
      '#3498DB', // bright blue
      '#E67E22', // orange
      '#1ABC9C', // turquoise
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const firstLetter = name.charAt(0).toUpperCase();
  const backgroundColor = getColorFromName(name);

  const renderLetterAvatar = () => (
    <div 
      className="avatar-letter"
      style={{ 
        width: size,
        height: size,
        backgroundColor,
        fontSize: size * 0.4
      }}
    >
      {firstLetter}
    </div>
  );

  if (!url || imageError) {
    return renderLetterAvatar();
  }

  // Convert path format and get base URL
  let avatarUrl = url;
  const baseUrl = window.location.protocol + '//' + window.location.hostname + ':5000';

  if (url.startsWith('/uploads/avatars/')) {
    const filename = url.split('/').pop(); // Get the filename
    avatarUrl = `${baseUrl}/avatars/${filename}`;
  } else if (url.startsWith('/avatars/')) {
    const filename = url.split('/').pop(); // Get the filename
    avatarUrl = `${baseUrl}/public/avatars/${filename}`;
  } else if (url.startsWith('/public/')) {
    avatarUrl = `${baseUrl}${url}`;
  } else if (!url.startsWith('http')) {
    avatarUrl = `${baseUrl}/${url}`;
  }

  return (
    <div 
      className="avatar-image"
      style={{ 
        width: size,
        height: size
      }}
    >
      <img 
        src={avatarUrl} 
        alt={name}
        onError={(e) => {
          console.error('Failed to load avatar:', avatarUrl);
          console.error('Error event:', e);
          setImageError(true);
        }}
      />
    </div>
  );
};

export default Avatar; 
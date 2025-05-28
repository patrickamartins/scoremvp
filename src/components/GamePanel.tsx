import React, { useState } from 'react';
import { Card } from './ui/Card';

const GamePanel = () => {
  const [game, setGame] = useState(null);
  const [opponent] = useState(game?.opponent || "");
  const [date] = useState(game?.date ? game.date.split('T')[0] : "");
  const [time] = useState(game?.date ? (game.date.split('T')[1] || "") : "");
  const [location] = useState(game?.location || "");
  const [categoria] = useState(game?.categoria || "");

  const [stat, setStat] = useState({ key: '' });

  const handleStatChange = (e) => {
    setStat({ ...stat, key: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default GamePanel; 
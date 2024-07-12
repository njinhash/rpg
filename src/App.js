import React, { useState, useEffect } from 'react';
import './Game.css';

const Game = () => {
  const [player, setPlayer] = useState({
    name: 'Hero',
    health: 100,
    maxHealth: 100,
    xp: 0,
    gold: 50,
    level: 1,
    class: 'warrior',
    inventory: ['stick'],
    currentWeaponIndex: 0,
  });

  const [gameState, setGameState] = useState({
    location: 'town',
    fighting: null,
    monsterHealth: 0,
  });

  const [quests, setQuests] = useState([
    { id: 1, title: 'Slay 5 Slimes', description: 'Defeat 5 slimes in the cave.', target: 5, progress: 0, reward: 50, completed: false },
    { id: 2, title: 'Collect 100 Gold', description: 'Amass a fortune of 100 gold.', target: 100, progress: 50, reward: 20, completed: false },
  ]);

  const weapons = [
    { name: 'stick', power: 5 },
    { name: 'dagger', power: 30 },
    { name: 'sword', power: 100 },
  ];

  const monsters = [
    { name: 'slime', level: 2, health: 15 },
    { name: 'fanged beast', level: 8, health: 60 },
    { name: 'dragon', level: 20, health: 300 },
  ];

  const locations = {
    town: {
      name: 'Town Square',
      description: 'You are in the town square. You see a sign that says "Store".',
      options: ['Go to store', 'Go to cave', 'Check quests'],
    },
    store: {
      name: 'Store',
      description: 'You enter the store.',
      options: ['Buy health (10 gold)', 'Buy weapon (30 gold)', 'Go to town square'],
    },
    cave: {
      name: 'Cave',
      description: 'You enter the cave. You see some monsters.',
      options: ['Fight slime', 'Fight fanged beast', 'Go to town square'],
    },
  };

  useEffect(() => {
    updateGame();
  }, [gameState.location, player]);

  const updateGame = () => {
    if (player.xp >= player.level * 10) {
      levelUp();
    }
    checkQuestProgress();
  };

  const handleAction = (action) => {
    switch (action) {
      case 'Go to store':
        setGameState({ ...gameState, location: 'store' });
        break;
      case 'Go to cave':
        setGameState({ ...gameState, location: 'cave' });
        break;
      case 'Go to town square':
        setGameState({ ...gameState, location: 'town' });
        break;
      case 'Buy health (10 gold)':
        buyHealth();
        break;
      case 'Buy weapon (30 gold)':
        buyWeapon();
        break;
      case 'Fight slime':
        startFight('slime');
        break;
      case 'Fight fanged beast':
        startFight('fanged beast');
        break;
      case 'Check quests':
        checkQuests();
        break;
      default:
        console.log('Unknown action');
    }
  };

  const buyHealth = () => {
    if (player.gold >= 10) {
      setPlayer({
        ...player,
        health: Math.min(player.health + 10, player.maxHealth),
        gold: player.gold - 10,
      });
    } else {
      // Display "Not enough gold" message
    }
  };

  const buyWeapon = () => {
    if (player.gold >= 30 && player.currentWeaponIndex < weapons.length - 1) {
      setPlayer({
        ...player,
        gold: player.gold - 30,
        currentWeaponIndex: player.currentWeaponIndex + 1,
        inventory: [...player.inventory, weapons[player.currentWeaponIndex + 1].name],
      });
    } else {
      // Display "Not enough gold" or "You have the best weapon" message
    }
  };

  const startFight = (monsterName) => {
    const monster = monsters.find(m => m.name === monsterName);
    setGameState({
      ...gameState,
      fighting: monster,
      monsterHealth: monster.health,
    });
    simulateFightWin(monster);
  };

  const simulateFightWin = (monster) => {
    const xpGained = monster.level * 5;
    const goldGained = monster.level * 2;
    
    setPlayer(prevPlayer => ({
      ...prevPlayer,
      xp: prevPlayer.xp + xpGained,
      gold: prevPlayer.gold + goldGained,
    }));

    if (monster.name === 'slime') {
      updateQuestProgress(1, 1);
    }
    updateQuestProgress(2, goldGained);

    console.log(`You defeated the ${monster.name}! Gained ${xpGained} XP and ${goldGained} gold.`);
  };

  const checkQuests = () => {
    console.log('Current Quests:');
    quests.forEach(quest => {
      console.log(`${quest.title} - Progress: ${quest.progress}/${quest.target}`);
    });
  };

  const levelUp = () => {
    setPlayer(prevPlayer => ({
      ...prevPlayer,
      level: prevPlayer.level + 1,
      maxHealth: prevPlayer.maxHealth + 10,
      health: prevPlayer.maxHealth + 10,
      xp: prevPlayer.xp - (prevPlayer.level * 10),
    }));
    console.log(`Congratulations! You've reached level ${player.level + 1}!`);
  };

  const updateQuestProgress = (questId, amount) => {
    setQuests(prevQuests => prevQuests.map(quest => 
      quest.id === questId 
        ? { ...quest, progress: Math.min(quest.progress + amount, quest.target) } 
        : quest
    ));
  };

  const checkQuestProgress = () => {
    quests.forEach(quest => {
      if (quest.progress >= quest.target && !quest.completed) {
        completeQuest(quest.id);
      }
    });
  };

  const completeQuest = (questId) => {
    const quest = quests.find(q => q.id === questId);
    if (quest) {
      setPlayer(prevPlayer => ({
        ...prevPlayer,
        xp: prevPlayer.xp + quest.reward,
      }));
      setQuests(prevQuests => prevQuests.map(q => 
        q.id === questId ? { ...q, completed: true } : q
      ));
      console.log(`Quest completed: ${quest.title}! Rewarded ${quest.reward} XP.`);
    }
  };

  return (
    <div className="game-container">
      <h1>Cyber Quest RPG</h1>
      <div className="location-info">
        <h2>{locations[gameState.location].name}</h2>
        <p>{locations[gameState.location].description}</p>
      </div>
      <div className="player-stats">
        <div className="stat">
          <h3>Health</h3>
          <div className="health-bar">
            <div 
              className="health-bar-fill" 
              style={{width: `${(player.health / player.maxHealth) * 100}%`}}
            ></div>
          </div>
          <p>{player.health}/{player.maxHealth}</p>
        </div>
        <div className="stat">
          <h3>XP</h3>
          <p>{player.xp}</p>
        </div>
        <div className="stat">
          <h3>Gold</h3>
          <p>{player.gold}</p>
        </div>
        <div className="stat">
          <h3>Level</h3>
          <p>{player.level}</p>
        </div>
        <div className="stat">
          <h3>Class</h3>
          <p>{player.class}</p>
        </div>
        <div className="stat">
          <h3>Weapon</h3>
          <p>{weapons[player.currentWeaponIndex].name}</p>
        </div>
      </div>
      <div className="actions">
        <h3>Actions</h3>
        <div>
          {locations[gameState.location].options.map((option, index) => (
            <button key={index} onClick={() => handleAction(option)}>
              {option}
            </button>
          ))}
        </div>
      </div>
      <div className="quests">
        <h3>Quests</h3>
        {quests.map(quest => (
          <div key={quest.id} className="quest">
            <h4>{quest.title}</h4>
            <p>{quest.description}</p>
            <p>Progress: {quest.progress}/{quest.target}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Game;
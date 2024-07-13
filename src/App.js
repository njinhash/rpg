import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import fightSvg from './assets/fight.svg'; // Import the SVG file

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

  const [showQuests, setShowQuests] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false); // New state for Easter Egg
  const [easterEggPlayed, setEasterEggPlayed] = useState(false); // Track if Easter Egg has been played
  const [message, setMessage] = useState(''); // New state for messages

  const weapons = [
    { name: 'stick', power: 5 },
    { name: 'dagger', power: 30 },
    { name: 'claw hammer', power: 50 },
    { name: 'sword', power: 100 },
  ];

  const monsters = [
    { name: 'slime', level: 2, health: 15 },
    { name: 'fanged beast', level: 8, health: 60 },
    { name: 'dragon', level: 20, health: 300 },
  ];

  const levelUp = useCallback(() => {
    setPlayer(prevPlayer => ({
      ...prevPlayer,
      level: prevPlayer.level + 1,
      maxHealth: prevPlayer.maxHealth + 10,
      health: prevPlayer.maxHealth + 10,
      xp: prevPlayer.xp - (prevPlayer.level * 10),
    }));
    console.log(`Congratulations! You've reached level ${player.level + 1}!`);
  }, [player.level]);

  const completeQuest = useCallback((questId) => {
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
  }, [quests]);

  const checkQuestProgress = useCallback(() => {
    quests.forEach(quest => {
      if (quest.progress >= quest.target && !quest.completed) {
        completeQuest(quest.id);
      }
    });
  }, [quests, completeQuest]);

  useEffect(() => {
    const updateGame = () => {
      if (player.xp >= player.level * 10) {
        levelUp();
      }
      checkQuestProgress();
    };

    updateGame();
  }, [gameState.location, player, levelUp, checkQuestProgress]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleAction = (action) => {
    action();
    setShowQuests(false); // Hide quests display when a new button is clicked
    if (gameState.location === 'easterEgg') {
      setShowEasterEgg(false); // Reset Easter Egg availability
    }
  };

  const buyHealth = () => {
    if (player.health === player.maxHealth) {
      setMessage('You are already at full health.');
    } else if (player.gold >= 10) {
      setPlayer({
        ...player,
        health: Math.min(player.health + 10, player.maxHealth),
        gold: player.gold - 10,
      });
      setMessage(''); // Clear message
    } else {
      setMessage('Not enough gold to buy health.');
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
      setMessage(''); // Clear message
    } else if (player.gold < 30) {
      setMessage('Not enough gold to buy a weapon.');
    } else {
      setMessage('You have the best weapon.');
    }
  };

  const startFight = (monsterName) => {
    const monster = monsters.find(m => m.name === monsterName);
    setGameState({
      ...gameState,
      location: 'fight',
      fighting: monster,
      monsterHealth: monster.health,
    });
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
    if (!easterEggPlayed) {
      setShowEasterEgg(true); // Show Easter Egg option after winning a monster battle
    }
  };

  const checkQuests = () => {
    setShowQuests(!showQuests);
  };

  const updateQuestProgress = (questId, amount) => {
    setQuests(prevQuests => prevQuests.map(quest => 
      quest.id === questId 
        ? { ...quest, progress: Math.min(quest.progress + amount, quest.target) } 
        : quest
    ));
  };

  const goTown = () => {
    setGameState({ ...gameState, location: 'town' });
  };

  const goStore = () => {
    setGameState({ ...gameState, location: 'store' });
  };

  const goCave = () => {
    setGameState({ ...gameState, location: 'cave' });
  };

  const fightSlime = () => {
    startFight('slime');
  };

  const fightBeast = () => {
    startFight('fanged beast');
  };

  const fightDragon = () => {
    startFight('dragon');
  };

  const attack = () => {
    const monster = gameState.fighting;
    const monsterHealth = gameState.monsterHealth;
    const playerHealth = player.health;

    // Monster attacks
    const monsterAttackValue = getMonsterAttackValue(monster.level);
    const newPlayerHealth = playerHealth - monsterAttackValue;

    // Player attacks
    let newMonsterHealth = monsterHealth;
    if (isMonsterHit()) {
      newMonsterHealth -= weapons[player.currentWeaponIndex].power + Math.floor(Math.random() * player.xp) + 1;
    }

    setPlayer({ ...player, health: newPlayerHealth });
    setGameState({ ...gameState, monsterHealth: newMonsterHealth });

    if (newPlayerHealth <= 0) {
      lose();
    } else if (newMonsterHealth <= 0) {
      simulateFightWin(monster); // Call simulateFightWin when monster is defeated
      if (monster.name === 'dragon') {
        winGame();
      } else {
        defeatMonster();
      }
    }
  };

  const getMonsterAttackValue = (level) => {
    const hit = (level * 5) - (Math.floor(Math.random() * player.xp));
    return hit > 0 ? hit : 0;
  };

  const isMonsterHit = () => {
    return Math.random() > .2 || player.health < 20;
  };

  const dodge = () => {
    console.log(`You dodge the attack from the ${gameState.fighting.name}`);
  };

  const defeatMonster = () => {
    const monster = gameState.fighting;
    const goldGained = Math.floor(monster.level * 6.7);
    const xpGained = monster.level;

    setPlayer(prevPlayer => ({
      ...prevPlayer,
      gold: prevPlayer.gold + goldGained,
      xp: prevPlayer.xp + xpGained,
    }));

    setGameState({ ...gameState, location: 'killMonster' });
  };

  const lose = () => {
    setGameState({ ...gameState, location: 'lose' });
  };

  const winGame = () => {
    setGameState({ ...gameState, location: 'win' });
  };

  const restart = () => {
    setPlayer({
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
    setGameState({
      location: 'town',
      fighting: null,
      monsterHealth: 0,
    });
    setShowEasterEgg(false); // Reset Easter Egg availability on restart
    setEasterEggPlayed(false); // Reset Easter Egg played status on restart
  };

  const easterEgg = () => {
    setGameState({ ...gameState, location: 'easterEgg' });
  };
  
  const handlePick = (guess) => {
    if (easterEggPlayed) {
      alert('You can only choose once.');
      return;
    }
    pick(guess);
    setEasterEggPlayed(true); // Mark Easter Egg as played
    setShowEasterEgg(false); // Close Easter Egg after playing
  };
  
  const pickTwo = () => handlePick(2);
  const pickEight = () => handlePick(8);
  
  const pick = (guess) => {
    const numbers = [];
    while (numbers.length < 10) {
      numbers.push(Math.floor(Math.random() * 11));
    }
    console.log(`You picked ${guess}. Here are the random numbers:`);
    numbers.forEach(num => console.log(num));
    if (numbers.includes(guess)) {
      console.log('Right! You win 20 gold!');
      setPlayer(prevPlayer => ({ ...prevPlayer, gold: prevPlayer.gold + 20 }));
    } else {
      console.log('Wrong! You lose 10 health!');
      setPlayer(prevPlayer => ({ ...prevPlayer, health: prevPlayer.health - 10 }));
    }
    setShowEasterEgg(false); // Close Easter Egg after playing
  };

  // Randomly assign the Easter Egg action to one of the "Go to town square" buttons
  const getRandomTownSquareActions = () => {
    const actions = [goTown, goTown, goTown];
    if (showEasterEgg && !easterEggPlayed) {
      const randomIndex = Math.floor(Math.random() * actions.length);
      actions[randomIndex] = easterEgg;
    }
    return actions;
  };

  const locations = {
    town: {
      name: 'Town Square',
      description: 'You are in the town square. You see a sign that says "Store".',
      options: ['Go to store', 'Go to cave', 'Fight dragon'],
      actions: [goStore, goCave, fightDragon],
    },
    store: {
      name: 'Store',
      description: 'You enter the store.',
      options: ['Buy 10 health (10 gold)', 'Buy weapon (30 gold)', 'Go to town square'],
      actions: [buyHealth, buyWeapon, goTown],
    },
    cave: {
      name: 'Cave',
      description: 'You enter the cave. You see some monsters.',
      options: ['Fight slime', 'Fight fanged beast', 'Go to town square'],
      actions: [fightSlime, fightBeast, goTown],
    },
    fight: {
      name: 'Fight',
      description: 'You are fighting a monster.',
      options: ['Attack', 'Dodge', 'Run'],
      actions: [attack, dodge, goTown],
    },
    killMonster: {
      name: 'Kill Monster',
      description: 'The monster screams "Arg!" as it dies. You gain experience points and find gold.',
      options: ['Go to town square', 'Go to town square', 'Go to town square'],
      actions: getRandomTownSquareActions(),
    },
    lose: {
      name: 'Lose',
      description: 'You die. ☠️',
      options: ['REPLAY?', 'REPLAY?', 'REPLAY?'],
      actions: [restart, restart, restart],
    },
    win: {
      name: 'Win',
      description: 'You defeat the dragon! YOU WIN THE GAME! 🎉',
      options: ['REPLAY?', 'REPLAY?', 'REPLAY?'],
      actions: [restart, restart, restart],
    },
    easterEgg: {
      name: 'Easter Egg',
      description: 'You find a secret game. Pick a number above. Ten numbers will be randomly chosen between 0 and 10. If the number you choose matches one of the random numbers, you win!',
      options: ['2', '8', 'Go to town square?'],
      actions: [pickTwo, pickEight, goTown],
    },
  };

  return (
    <div className="game-container">
      <h1>Cyber Quest RPG</h1>
      <div className="location-info">
        <h2>{locations[gameState.location].name}</h2>
        <p>{locations[gameState.location].description}</p>
      </div>
      <div className="player-stats">
        <div className="stat stat-health">
          <h3>Health</h3>
          <div className="health-bar">
            <div 
              className="health-bar-fill" 
              style={{width: `${(player.health / player.maxHealth) * 100}%`}}
            ></div>
          </div>
          <p className="stat-health">{player.health}/{player.maxHealth}</p>
        </div>
        <div className="stat stat-xp">
          <h3>XP</h3>
          <p>{player.xp}</p>
        </div>
        <div className="stat stat-gold">
          <h3>Gold</h3>
          <p>{player.gold}</p>
        </div>
        <div className="stat stat-level">
          <h3>Level</h3>
          <p>{player.level}</p>
        </div>
        <div className="stat stat-class">
          <h3>Class</h3>
          <p>{player.class}</p>
        </div>
        <div className="stat stat-weapon">
          <h3>Weapon</h3>
          <p>{weapons[player.currentWeaponIndex].name}</p>
        </div>
      </div>
      {gameState.location === 'fight' && (
        <div className="monster-stats">
          <h3>Monster Health</h3>
          <div className="health-bar">
            <div 
              className="health-bar-fill monster-health-bar-fill" 
              style={{width: `${(gameState.monsterHealth / gameState.fighting.health) * 100}%`}}
            ></div>
          </div>
          <p className="monster-health-text">{gameState.monsterHealth}/{gameState.fighting.health}</p>
        </div>
      )}
      {gameState.location === 'fight' && (
        <div className="fight-animation">
          <img src={fightSvg} alt="Fight Animation" className="pulse-animation" />
        </div>
      )}
      <div className="actions">
        <h3>Actions</h3>
        <div>
          {locations[gameState.location].options.map((option, index) => (
            <button key={index} onClick={() => handleAction(locations[gameState.location].actions[index])}>
              {option}
            </button>
          ))}
          {gameState.location === 'town' && (
            <>
              <button onClick={checkQuests}>Check Quests</button>
            </>
          )}
        </div>
      </div>
      {showQuests && (
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
      )}
      {gameState.location === 'easterEgg' && (
        <div className="easter-egg">
          <h3>Easter Egg</h3>
          <p>You find a secret game. Pick a number above. Ten numbers will be randomly chosen between 0 and 10. If the number you choose matches one of the random numbers, you win!</p>
          <button onClick={pickTwo} disabled={easterEggPlayed}>2</button>
          <button onClick={pickEight} disabled={easterEggPlayed}>8</button>
          <button onClick={goTown}>Go to town square?</button>
        </div>
      )}
      {message && (
        <div className="message">
          <p>{message}</p>
        </div>
      )}
    </div>
  );
};

export default Game;

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import { colors, math } from './utils/game.utils';

const StarsDisplay = props => {
  return (
    <>
      {math.range(1, props.count).map(starID =>
        <div key={starID} className="star" />
      )}
    </>
  )
};

const PlayNumber = props => (
  <button
    className="number"
    style={{ backgroundColor: colors[props.status] }}
    onClick={() => props.onClick(props.number, props.status)}>
    {props.number}
  </button>
)

const PlayAgain = props => (
  <div className='game-done'>
    <div
      className='message'
      style={{ color: props.gameStatus === 'lost' ? 'red' : 'green' }}
    >
      {props.gameStatus === 'lost' ? 'Game Over' : 'Nice you win!'}
    </div>
    <button onClick={props.onClick}>Play Again</button>
  </div>
)

const useGameState = () => {
  const [stars, setStars] = useState(math.random(1, 9));
  const [availableNums, setAvailableNums] = useState(math.range(1, 9));
  const [candidateNums, setCandidateNums] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    if (secondsLeft > 0 && availableNums.length > 0) {
      const timerID = setTimeout(() => {
        setSecondsLeft(secondsLeft - 1);
      }, 1000);
      return () => clearTimeout(timerID);
    }
  });

  const setGameState = newCandidateNums => {
    if (math.sum(newCandidateNums) !== stars) {
      setCandidateNums(newCandidateNums);
    } else {
      const newAvailabeNums = availableNums.filter(
        n => !newCandidateNums.includes(n)
      );
      setStars(math.randomSumIn(newAvailabeNums, 9));
      setAvailableNums(newAvailabeNums);
      setCandidateNums([]);
    }
  };

  return {
    stars, availableNums, candidateNums, secondsLeft, setGameState
  };
};

const Game = (props) => {
  const {
    stars,
    availableNums,
    candidateNums,
    secondsLeft,
    setGameState
  } = useGameState();

  const isCandidatesWrong = math.sum(candidateNums) > stars;
  const gameStatus = availableNums.length === 0
    ? 'won'
    : secondsLeft === 0 ? 'lost' : 'active';


  const numberStatus = number => {
    if (!availableNums.includes(number)) return 'used';

    if (candidateNums.includes(number)) {
      return isCandidatesWrong ? 'wrong' : 'candidate'
    }

    return 'available';
  }

  const onNumberClick = (number, currentStatus) => {
    if (currentStatus === 'used' || gameStatus !== 'active') return;
    const newCandidateNums =
      currentStatus === 'available'
        ? candidateNums.concat(number)
        : candidateNums.filter(cNum => cNum !== number);
    setGameState(newCandidateNums);
  }

  return (
    <div className="game">
      <div className="help">
        Pick 1 or more numbers that sum to the number of stars
      </div>
      <div className="body">

        <div className="left">
          {gameStatus !== 'active' ? (
            <PlayAgain onClick={props.startNewGame} gameStatus={gameStatus} />
          ) : (
            <StarsDisplay count={stars} />
          )
          }
        </div>

        <div className="right">
          {math.range(1, 9).map(number =>
            <PlayNumber
              key={number}
              number={number}
              status={numberStatus(number)}
              onClick={onNumberClick}
            />
          )}
        </div>

      </div>
      <div className="timer">Time Remaining: {secondsLeft}</div>
    </div>
  );
};

const StarMatch = () => {
  const [gameID, setGameID] = useState(0);
  return <Game key={gameID} startNewGame={() => setGameID(gameID + 1)} />;
}

ReactDOM.render(<StarMatch />, document.getElementById('root'));


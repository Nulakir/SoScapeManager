import { useState, useEffect } from 'react'
import './App.css'
import React from 'react'
import {
  ref,
  set,
  push,
  remove,
  onValue,
} from "firebase/database";
import { auth, db } from "./components/Root";
import { useAuthState } from 'react-firebase-hooks/auth';

function App() {
  const [puzzleData, setPuzzleData] = useState({
    puzzleUrl: '',
    initialImg: '',
    completedImg: '',
    question: '',
    answer: '',
    questionImage: ''
  });
  const [puzzles, setPuzzles] = useState<Array<any>>([]); // Specify the type explicitly
  const [user, loading, error] = useAuthState(auth);

  if(user){
  useEffect(() => {
    const puzzlesRef = ref(db, 'puzzles');
    const puzzlesListener = onValue(puzzlesRef, (snapshot) => {
      const puzzleData = snapshot.val();
      if (puzzleData) {
        const puzzleList = Object.keys(puzzleData).map((key) => ({
          puzzleKey: key,
          ...puzzleData[key]
        }));
        setPuzzles(puzzleList);
      }
    });

    return () => {
      puzzlesListener();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const puzzlesRef = ref(db, 'puzzles');
      const newPuzzleRef = push(puzzlesRef);
      const newPuzzleKey = newPuzzleRef.key;
      await set(ref(db, `puzzles/${newPuzzleKey}`), puzzleData);

      console.log('Puzzle added successfully');
      setPuzzleData({
        puzzleUrl: '',
        initialImg: '',
        completedImg: '',
        question: '',
        answer: '',
        questionImage: ''
      });
    } catch (error) {
      console.error('Error adding puzzle:', error);
    }
  };

  const handleDelete = async (puzzleKey) => {
    try {
      await remove(ref(db, `puzzles/${puzzleKey}`));
      console.log('Puzzle deleted successfully');
    } catch (error) {
      console.error('Error deleting puzzle:', error);
    }
  };
  

  return (
    <div>
      <h1>SoScape Manager</h1>
      <div className="puzzles-list">
        {puzzles.map((puzzle) => (
          <div key={puzzle.puzzleKey} className="puzzle-card">
            <img src={puzzle.questionImage}  width="150" height="150" alt="Puzzle" />
            <p>Question: {puzzle.question}</p>
            <p>Answer: {puzzle.answer}</p>
            <button onClick={() => handleDelete(puzzle.puzzleKey)}>Delete</button>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Puzzle URL:
          <input 
          type='text' 
          className="form-control" 
          placeholder='Puzzle Url (/room1)' 
          value={puzzleData.puzzleUrl}
          onChange={(e) => setPuzzleData({ ...puzzleData, puzzleUrl: e.target.value })}
          />
          </label>
        </div>
        <div className="form-group">
          <label>Initial Image URL:
          <input 
          type='text' 
          className="form-control" 
          placeholder='Url from firebase cloud'
          value={puzzleData.initialImg}
          onChange={(e) => setPuzzleData({ ...puzzleData, initialImg: e.target.value })}
          />
          </label>

        </div>
        <div className="form-group">
          <label>Completed Image URL:
          <input 
          type='text' 
          className="form-control" 
          placeholder='Url from firebase cloud'
          value={puzzleData.completedImg}
          onChange={(e) => setPuzzleData({ ...puzzleData, completedImg: e.target.value })}
          />
          </label>
        </div>
        <div className="form-group">
          <label>Question:
          <input 
          type='text' 
          className="form-control" 
          placeholder='The question'
          value={puzzleData.question}
          onChange={(e) => setPuzzleData({ ...puzzleData, question: e.target.value })}
          />
          </label>
        </div>
        <div className="form-group">
          <label>Answer:
          <input 
          type='text' 
          className="form-control" 
          placeholder='The answer to the question'
          value={puzzleData.answer}
          onChange={(e) => setPuzzleData({ ...puzzleData, answer: e.target.value })}
          />
          </label>
        </div>
        <div className="form-group">
          <label>Question Image URL:
          <input 
          type='text' 
          className="form-control" 
          placeholder='The Url from firebase cloud'
          value={puzzleData.questionImage}
          onChange={(e) => setPuzzleData({ ...puzzleData, questionImage: e.target.value })}
          />
          </label>
        </div>
        <button type="submit">Add Puzzle</button>
      </form>
    </div>

  );
}
}

export default App;

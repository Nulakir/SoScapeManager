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
      <form onSubmit={handleSubmit}>
        {/* Input fields for puzzle data */}
        {/* Submit button */}
      </form>
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
          <label>Puzzle URL:</label>
          <input 
          type='text' 
          className="form-control" 
          placeholder='Puzzle Url (/room1)' 
          value={puzzleData.puzzleUrl}
          onChange={(e) => setPuzzleData({ ...puzzleData, puzzleUrl: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Initial Image URL:</label>
          <input 
          type='text' 
          className="form-control" 
          placeholder='Url from firebase cloud'
          value={puzzleData.initialImg}
          onChange={(e) => setPuzzleData({ ...puzzleData, initialImg: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Completed Image URL:</label>
          <input 
          type='text' 
          className="form-control" 
          placeholder='Url from firebase cloud'
          value={puzzleData.completedImg}
          onChange={(e) => setPuzzleData({ ...puzzleData, completedImg: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Question:</label>
          <input 
          type='text' 
          className="form-control" 
          placeholder='The question'
          value={puzzleData.question}
          onChange={(e) => setPuzzleData({ ...puzzleData, question: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Answer:</label>
          <input 
          type='text' 
          className="form-control" 
          placeholder='The answer to the question'
          value={puzzleData.answer}
          onChange={(e) => setPuzzleData({ ...puzzleData, answer: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Question Image URL:</label>
          <input 
          type='text' 
          className="form-control" 
          placeholder='The Url from firebase cloud'
          value={puzzleData.questionImage}
          onChange={(e) => setPuzzleData({ ...puzzleData, questionImage: e.target.value })}
          />
        </div>
        <button type="submit">Add Puzzle</button>
      </form>
    </div>

  );
}

export default App;

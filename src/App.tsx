// App.js
import { useState, useEffect } from 'react';
import './App.css';
import React from 'react';
import {
  ref as ref_database,
  set,
  push,
  remove,
  onValue,
} from "firebase/database";
import { auth, db, storage } from "./components/Root";
import { useAuthState } from 'react-firebase-hooks/auth';
import { getDownloadURL, list, ref as ref_storage, uploadBytes } from 'firebase/storage';
import ImageUploadForm from './components/UploadImageForm';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [puzzleData, setPuzzleData] = useState({
    hint: '',
    initialImg: '',
    completedImg: '',
    question: '',
    answer: '',
    questionImage: '', // Store the URL of the uploaded image
  });
  const [puzzles, setPuzzles] = useState<Array<any>>([]); // Specify the type explicitly
  const [user] = useAuthState(auth);
  const [currentPuzzleKey, setCurrentPuzzleKey] = useState<string | null>(null); // To store the current puzzle key
  const [imageOptions, setImageOptions] = useState<Array<string>>([]);
  const [completeImageOptions, setCompletedImageOptions] = useState<Array<string>>([]);
  const [selectedFile, setSelectedFile] = useState<any | null>(null); // Store the selected file
  const [resetUploadInput, setResetUploadInput] = useState(false);

  useEffect(() => {
    if (user) {
      const puzzlesRef = ref_database(db, 'puzzles');
      const puzzlesListener = onValue(puzzlesRef, (snapshot) => {
        const retrievedData = snapshot.val();

        if (retrievedData) {
          const puzzleList = Object.keys(retrievedData).map((key) => ({
            puzzleKey: key,
            ...retrievedData[key],
          }));
          setPuzzles(puzzleList);
        } else {
          setPuzzles([]);
        }
      });

      return () => {
        puzzlesListener();
      };
    }
  }, [user]);

  useEffect(() => {
    // Fetch the list of images from Firebase Storage
    const storageImageRef = ref_storage(storage, 'images/roomImages');
    list(storageImageRef)
      .then((result) => {
        const imageNames = result.items.map((item) => item.name);
        setImageOptions(imageNames);
      })
      .catch((error) => {
        toast.error('Error fetching images from storage:', error);
      });

    const storageImageCompleteRef = ref_storage(storage, 'images/completedRoomImages');
    list(storageImageCompleteRef)
      .then((result) => {
        const imageNames = result.items.map((item) => item.name);
        setCompletedImageOptions(imageNames);
      })
      .catch((error) => {
        toast.error('Error fetching images from storage:', error);
      });
  }, []); // Run this effect only once on component mount

  const handleSubmit = async (user) => {
    try {
      // Ensure that both the initial and completed images have been selected before submitting
      if (!puzzleData.initialImg || !puzzleData.completedImg) {
        toast.error('Please select both the initial and completed room images before submitting.');
        return;
      }
      // Ensure that an image has been selected before submitting
      if (!selectedFile) {
        toast.error('Please select an image before submitting.');
        return;
      }

      // Upload the selected image to Firebase Storage
      const timestamp = Date.now();
      const fileName = `${currentPuzzleKey}_${timestamp}_${selectedFile.name}`;
      const storageRef = ref_storage(storage, `images/${user.uid}/${fileName}`);
      const puzzlesRef = ref_database(db, 'puzzles');
      const newPuzzleRef = push(puzzlesRef); // Use the 'push' function from the 'query' module
      const newPuzzleKey = newPuzzleRef.key; // Get the generated puzzle key
      await uploadBytes(storageRef, selectedFile);

      // Get the download URL of the uploaded image
      const downloadURL = await getDownloadURL(storageRef);

      // Prepare the updated puzzle data with the image URL
      const updatedPuzzleData = {
        ...puzzleData,
        questionImage: downloadURL,
      };

      // Save the puzzle data to the Realtime Database
      await set(ref_database(db, `puzzles/${newPuzzleKey}`), updatedPuzzleData);

      toast.success('Puzzle added successfully');
      setPuzzleData({
        hint: "",
        initialImg: '',
        completedImg: '',
        question: '',
        answer: '',
        questionImage: '',
      });
      // Reset the selected file
      setSelectedFile(null);
      // Reset the input field by toggling the resetUploadInput state
      setResetUploadInput((prevState) => !prevState);
    } catch (error) {
      toast.error('Error adding puzzle:', error);
    }
  };

  // Delete the puzzle from the realtime database
  const handleDelete = async (puzzleKey) => {
    try {
      await remove(ref_database(db, `puzzles/${puzzleKey}`));
      toast.success('Puzzle deleted successfully');
    } catch (error) {
      toast.error('Error deleting puzzle:', error);
    }
  };

  return (
    <div className="container mt-5">
      <ToastContainer />
      <h1 className="mb-5 text-center">SoScape Manager</h1>
      <div className="row">
        {puzzles.map((puzzle) => (
          <div key={puzzle.puzzleKey} className="col-md-4 mb-4">
            <div className="card">
              <img src={puzzle.questionImage} className="card-img-top" width="150"
                height="150"
                alt="Puzzle" />
              <div className="card-body">
                <p className="card-text">Hint: {puzzle.hint}</p>
                <p className="card-text">Question: {puzzle.question}</p>
                <p className="card-text">Answer: {puzzle.answer}</p>
                <button className="btn btn-danger" onClick={() => handleDelete(puzzle.puzzleKey)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(user);
        }}
      >
        <div className="mb-3">
          <label className="form-label">hint:</label>
          <input
            type="text"
            className="form-control"
            placeholder="The hint"
            value={puzzleData.hint}
            onChange={(e) =>
              setPuzzleData({ ...puzzleData, hint: e.target.value })
            }
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Question:</label>
          <input
            type="text"
            className="form-control"
            placeholder="The question"
            value={puzzleData.question}
            onChange={(e) =>
              setPuzzleData({ ...puzzleData, question: e.target.value })
            }
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Answer:</label>
          <input
            type="text"
            className="form-control"
            placeholder="The answer to the question"
            value={puzzleData.answer}
            onChange={(e) =>
              setPuzzleData({ ...puzzleData, answer: e.target.value })
            }
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Select the Room Image:</label>
          <select
            className="form-control"
            value={puzzleData.initialImg}
            onChange={(e) => {
              setPuzzleData({ ...puzzleData, initialImg: e.target.value });
            }}
          >
            <option value="">Select the room image</option>
            {imageOptions.map((imageName) => (
              <option key={imageName} value={imageName}>
                {imageName}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Select the same Completed Room Image:</label>
          <select
            className="form-control"
            value={puzzleData.completedImg}
            onChange={(e) => {
              setPuzzleData({ ...puzzleData, completedImg: e.target.value });
            }}
          >
            <option value="">Select the same completed room image</option>
            {completeImageOptions.map((imageName) => (
              <option key={imageName} value={imageName}>
                {imageName}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <ImageUploadForm
            user={user}
            puzzleKey={currentPuzzleKey}
            setSelectedFile={setSelectedFile}
            resetUploadInput={resetUploadInput}
          />
        </div>
        <button className="btn btn-primary" type="submit">Add Puzzle</button>
      </form>
    </div>
  );
}

export default App;






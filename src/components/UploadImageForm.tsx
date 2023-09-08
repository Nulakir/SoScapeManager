// UploadImageForm.js
import { ref as ref_storage, uploadBytes } from 'firebase/storage';
import { useState } from 'react';
import { storage } from './Root';
import React from 'react';

function UploadImageForm({ user, puzzleKey, setSelectedFile, resetUploadInput }) {
  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    setSelectedFile(selectedImage); // Pass the selected file to the parent component
  };

  return (
    <div>
      <label>
        Upload Question Image:
        <input type="file" accept="image/*" onChange={handleImageChange} key={resetUploadInput ? 'reset' : 'no-reset'}/> 
      </label>
    </div>
  );
}

export default UploadImageForm;

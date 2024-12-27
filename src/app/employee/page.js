'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getCompanyID } from '@/utils/jwtUtils';
import styles from '@/styles/Employee.module.css';
import { RiCloseLine } from 'react-icons/ri'; // Import the icon

export default function Employee() {
  const { user } = useAuth();
  const router = useRouter();
  const [fileInfo, setFileInfo] = useState({
    name: '',
    size: 0,
    rowsCount: 0,
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [popupVisible, setPopupVisible] = useState(false);

  if (!user) {
    return <p>Loading...</p>;
  }

  const companyID = getCompanyID();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return; // Ensure a file is selected

    // Create a FileReader to read the file and calculate rows
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split('\n').length - 1; // Count rows, subtracting the header
      setFileInfo({ 
        name: selectedFile.name, 
        size: selectedFile.size, 
        rowsCount: rows 
      }); // Set the new file info
    };
    reader.readAsText(selectedFile); // Read the file content as text
  };

  const handleUpload = async () => {
    if (!fileInfo.name) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', new Blob([fileInfo.name], { type: 'text/csv' })); // Fix this line
    formData.append('companyID', companyID);

    setLoading(true);
    setUploadProgress(0);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload-employees`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setMessage(data.message);
      simulateLoading(data.rowsCount); // Simulate loading bar for the number of rows
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage('Error uploading file.');
    } finally {
      setLoading(false);
    }
  };

  const simulateLoading = (rowsCount) => {
    let progress = 0;
    const interval = setInterval(() => {
      if (progress < 100) {
        progress += (100 / rowsCount);
        setUploadProgress(Math.min(progress, 100));
      } else {
        clearInterval(interval);
        setPopupVisible(true); // Show popup after loading
      }
    }, (rowsCount > 0 ? 5000 / rowsCount : 5000)); // Adjust timing based on rows count
  };

  const handleRemoveFile = () => {
    setFileInfo({ name: '', size: 0, rowsCount: 0 }); // Reset the file info
    setMessage('');
    setUploadProgress(0);
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.value = ''; // Reset the file input value
    }
  };

  const handleClosePopup = () => {
    setPopupVisible(false);
    handleRemoveFile(); // Reset state if needed
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault(); // Prevent default behavior (open new tab)
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFileInfo({ 
        name: droppedFile.name, 
        size: droppedFile.size, 
        rowsCount: 0 // Reset row count until we read the file
      }); // Set the dropped file
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const rows = text.split('\n').length - 1; // Count rows, subtracting the header
        setFileInfo((prevInfo) => ({ 
          ...prevInfo, 
          rowsCount: rows 
        })); // Update row count
      };
      reader.readAsText(droppedFile); // Read the file content as text
    }
  };

  return (
    <div className="container">
      <h1>Employee</h1>
      <div className={styles.detailCard}>
        <div
          className={styles.uploadArea}
          onClick={() => document.getElementById('fileInput').click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {loading ? (
            <div className={styles.loader}></div> // Loading circle
          ) : (
            <>
              <input
                type="file"
                accept=".csv"
                id="fileInput"
                onChange={handleFileChange}
                style={{ display: 'none' }} // Hide the input
                onClick={(e) => {
                  e.stopPropagation();
                }}
              />
              {fileInfo.name ? (
                <p>{fileInfo.name}</p> // Show selected file name
              ) : (
                <p>Drag & drop a file here or click to select</p>
              )}
            </>
          )}
        </div>
        {fileInfo.name && (
          <div>
            <div className={styles.fileInfo}>
              <div className={styles.fileDetails}>
                <p className={styles.rowSizeText}>
                  {fileInfo.name} ({fileInfo.rowsCount} rows)
                </p>
                <p className={styles.rowSizeText}>
                  {(fileInfo.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <RiCloseLine
                onClick={handleRemoveFile}
                className={styles.removeIcon}
              />
            </div>
            <button onClick={handleUpload} disabled={loading} className={styles.submitButton}>
              {loading ? 'Uploading...' : 'Submit'}
            </button>
            {uploadProgress > 0 && (
              <div className={styles.progressBar} style={{ width: `${uploadProgress}%` }}></div>
            )}
            {message && <p>{message}</p>}
          </div>
        )}
      </div>
      {popupVisible && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <h2>Upload Successful!</h2>
            <p>{message}</p>
            <div className={styles.popupButtons}>
              <button onClick={() => router.push('/employees')} className={styles.popupButton}>
                Go to Employees
              </button>
              <button onClick={handleClosePopup} className={styles.popupButton}>
                Upload Another File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

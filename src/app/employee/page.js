'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getCompanyID } from '@/utils/jwtUtils';
import styles from '@/styles/Employee.module.css';
import popup from '@/styles/RequestForm.module.css';
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
    const selectedFile = document.getElementById('fileInput').files[0]; // Get the actual selected file
    formData.append('file', selectedFile); // Append the actual file
    formData.append('companyID', companyID);
  
    setLoading(true);
    setUploadProgress(0);
  
    // Set base time per row (in milliseconds)
    const baseTimePerRow = 4714; // 4714 ms per row based on your observations
    const estimatedUploadTime = fileInfo.rowsCount * baseTimePerRow; // Total estimated time based on rows
    const totalUploadTime = estimatedUploadTime + 1000; // Add 1 second for loading effect
  
    const startTime = Date.now();
  
    // Start a timer to simulate progress
    const intervalTime = 300; // Interval time to update progress (300 ms)
    const totalIntervals = totalUploadTime / intervalTime; // Total intervals to reach 100%
  
    const intervalId = setInterval(() => {
      setUploadProgress((prevProgress) => {
        const newProgress = Math.min(prevProgress + (100 / totalIntervals), 100);
        return newProgress;
      });
    }, intervalTime);
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload-employees`, {
        method: 'POST',
        body: formData,
      });
  
      const data = await response.json();
      setMessage(data.message);
  
      // Set the progress bar to 100% immediately upon receiving a response
      setUploadProgress(100);
  
      // Simulate loading complete instantly on response
      setTimeout(() => {
        setPopupVisible(true); // Show popup after loading
      }, 500); // Delay to give the loading bar time to fill
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage('Error uploading file.');
  
      // Set the progress bar to 100% on error
      setUploadProgress(100);
      setPopupVisible(true); // Show popup immediately on error
    } finally {
      clearInterval(intervalId); // Clear the interval
      setLoading(false);
    }
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
              {loading && (
                <div className={styles.progressBarWrapper}>
                  <div className={styles.progressBar} style={{ width: `${uploadProgress}%` }}>
                    {/* Removed progress percentage display */}
                  </div>
                </div>
              )}
              <RiCloseLine
                onClick={handleRemoveFile}
                className={styles.removeIcon}
              />
            </div>
            <button onClick={handleUpload} disabled={loading} className={styles.submitButton}>
              {loading ? 'Uploading...' : 'Submit'}
            </button>
            {message && <p>{message}</p>}
          </div>
        )}
      </div>
      {popupVisible && (
        <div className={popup.popup}>
          <div className={popup.popupContent}>
            <h2>{message.includes('Error') ? 'Upload Failed!' : 'Upload Successful!'}</h2>
            <p>{message}</p>
            <div className={popup.popupButtons}>
              <button onClick={() => router.push('/employees')} className={popup.popupButton}>
                Go to Employees
              </button>
              <button onClick={handleClosePopup} className={popup.popupButton}>
                Upload Another File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

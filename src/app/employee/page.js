'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getCompanyID } from '@/utils/jwtUtils';
import styles from '@/styles/Mycompany.module.css';

export default function Employee() {
  const { user } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // Loading state

  if (!user) {
    return <p>Loading...</p>; // Show a spinner or placeholder while verifying authentication
  }

  const companyID = getCompanyID();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Get the first file
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('companyID', companyID); // Append company ID

    setLoading(true); // Start loading

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload-employees`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setMessage(data.message);
      console.log(data); // Log the response to the console
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage('Error uploading file.');
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className="container">
      <h1>Employee</h1>
      <div className={styles.detailCard}> {/* Add detailCard class */}
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={loading}>
          {loading ? 'Uploading...' : 'Upload'}
        </button>
        {message && <p>{message}</p>} {/* Display the response message */}
        {loading && <div className={styles.loader}>Loading...</div>} {/* Show loading indicator */}
      </div>
    </div>
  );
}

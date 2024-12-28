'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import styles from '@/styles/RequestForm.module.css'

export default function Company() {
    const { user } = useAuth()
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(true)
    const [formData, setFormData] = useState({
        companyName: '',
        address: '',
        contactEmail: '',
        adminEmail: '', // Email for the company admin
    });
    const [popupVisible, setPopupVisible] = useState(false);
    const [isSubmissionSuccessful, setIsSubmissionSuccessful] = useState(false);

    useEffect(() => {
        if (user) {
            setIsLoading(false);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/create-company`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
    
            if (response.ok) {
                const result = await response.json();
                
                setIsSubmissionSuccessful(true);
                setPopupVisible(true);
            } else {
                console.error('Failed to create company:', response.statusText);
                alert('Failed to create company. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting company data:', error);
            alert('An error occurred. Please try again.');
        }
    };
    

    const handleClosePopup = () => {
        setPopupVisible(false);
        if (isSubmissionSuccessful) {
            // Reset form for creating another company
            setFormData({
                companyName: '',
                address: '',
                contactEmail: '',
                adminEmail: '', // Reset admin email
            });
            setIsSubmissionSuccessful(false);
        }
    }

    const handleGoToCompanies = () => {
        router.push('/companies'); // Redirect to companies page
        handleClosePopup();
    }

    if (isLoading || !user) {
        return <p>Loading...</p>;
    }

    return (
        <div className={styles.container}>
            <h1>Create Company</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label>Company Name</label>
                    <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Address</label>
                    <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Contact Email</label>
                    <input
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Company Admin Email</label>
                    <input
                        type="email"
                        value={formData.adminEmail}
                        onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                        required
                    />
                </div>
                <button type="submit" className={styles.companyFormButton}>
                    Create Company
                </button>
            </form>

            {popupVisible && (
                <div className={styles.popup}>
                    <div className={styles.popupContent}>
                        <h2>Company Created Successfully!</h2>
                        <p>Your company has been created. What would you like to do next?</p>
                        <div className={styles.popupButtons}>
                            <button onClick={handleGoToCompanies} className={styles.popupButton}>
                                Go to Companies
                            </button>
                            <button onClick={handleClosePopup} className={styles.popupButton}>
                                Create Another Company
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

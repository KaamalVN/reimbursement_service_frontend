'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getCompanyID, getEmployeeID } from '@/utils/jwtUtils';
import styles from '@/styles/RequestForm.module.css';

export default function NewRequest() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const companyID = getCompanyID();
    const employeeID = getEmployeeID();

    const [formData, setFormData] = useState({
        travelAmount: '',
        accommodationAmount: '',
        mealsAmount: '',
        miscellaneousAmount: '',
        travelStartDate: '',
        travelEndDate: '',
        purpose: '',
        description: '',
        receipts: []
    });

    const [popupVisible, setPopupVisible] = useState(false);
    const [isSubmissionSuccessful, setIsSubmissionSuccessful] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFileChange = (files) => {
        const updatedReceipts = [...formData.receipts, ...Array.from(files)];
        setFormData((prev) => ({
            ...prev,
            receipts: updatedReceipts
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const expenseTypes = [];
        const amounts = [];
        if (formData.travelAmount) expenseTypes.push('Travel') && amounts.push(parseFloat(formData.travelAmount));
        if (formData.accommodationAmount) expenseTypes.push('Accommodation') && amounts.push(parseFloat(formData.accommodationAmount));
        if (formData.mealsAmount) expenseTypes.push('Meals') && amounts.push(parseFloat(formData.mealsAmount));
        if (formData.miscellaneousAmount) expenseTypes.push('Miscellaneous') && amounts.push(parseFloat(formData.miscellaneousAmount));
    
        const requestData = {
            EmployeeID: employeeID,
            CompanyID: companyID,
            ExpenseTypes: expenseTypes,
            Amounts: amounts,
            TravelStartDate: formData.travelStartDate,
            TravelEndDate: formData.travelEndDate,
            Purpose: formData.purpose,
            Description: formData.description,
            Receipts: formData.receipts.map((file) => `/uploads/${file.name}`), // Dummy paths
        };

        
    
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reimbursement-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
            });
            const result = await response.json();
    
            if (response.ok) {
                // Trigger the popup instead of alert
                setPopupVisible(true);
                setIsSubmissionSuccessful(true);
            } else {
                console.error(result.error);
                alert('Failed to submit request!');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred!');
        }
    };
    
    

    const handleClosePopup = () => {
        setPopupVisible(false);
        if (isSubmissionSuccessful) {
            setFormData({
                travelAmount: '',
                accommodationAmount: '',
                mealsAmount: '',
                miscellaneousAmount: '',
                travelStartDate: '',
                travelEndDate: '',
                purpose: '',
                description: '',
                receipts: []
            });
            setIsSubmissionSuccessful(false);
        }
    };

    const handleGoToRequests = () => {
        router.push('/requests');
        handleClosePopup();
    };

    if (isLoading || !user) {
        return <p>Loading...</p>;
    }

    return (
        <div className={styles.reimbursementContainer}>
            <h1 className={styles.reimbursementTitle}>New Reimbursement Request</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.reimbursementFormAmounts}>
                    <div className={styles.reimbursementFormGroupRow}>
                        <div className={styles.reimbursementFormGroup}>
                            <label className={styles.reimbursementFormLabel}>Travel Amount</label>
                            <input
                                type="number"
                                className={styles.reimbursementFormInput}
                                value={formData.travelAmount}
                                onChange={(e) => handleInputChange('travelAmount', e.target.value)}
                            />
                        </div>
                        <div className={styles.reimbursementFormGroup}>
                            <label className={styles.reimbursementFormLabel}>Accommodation Amount</label>
                            <input
                                type="number"
                                className={styles.reimbursementFormInput}
                                value={formData.accommodationAmount}
                                onChange={(e) => handleInputChange('accommodationAmount', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className={styles.reimbursementFormGroupRow}>
                        <div className={styles.reimbursementFormGroup}>
                            <label className={styles.reimbursementFormLabel}>Meals Amount</label>
                            <input
                                type="number"
                                className={styles.reimbursementFormInput}
                                value={formData.mealsAmount}
                                onChange={(e) => handleInputChange('mealsAmount', e.target.value)}
                            />
                        </div>
                        <div className={styles.reimbursementFormGroup}>
                            <label className={styles.reimbursementFormLabel}>Miscellaneous Amount</label>
                            <input
                                type="number"
                                className={styles.reimbursementFormInput}
                                value={formData.miscellaneousAmount}
                                onChange={(e) => handleInputChange('miscellaneousAmount', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.reimbursementFormGroupRow}>
                    <div className={styles.reimbursementFormGroup}>
                        <label className={styles.reimbursementFormLabel}>Travel Start Date</label>
                        <input
                            type="date"
                            className={styles.reimbursementFormInput}
                            value={formData.travelStartDate}
                            onChange={(e) => handleInputChange('travelStartDate', e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.reimbursementFormGroup}>
                        <label className={styles.reimbursementFormLabel}>Travel End Date</label>
                        <input
                            type="date"
                            className={styles.reimbursementFormInput}
                            value={formData.travelEndDate}
                            onChange={(e) => handleInputChange('travelEndDate', e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className={styles.reimbursementFormGroup}>
                    <label className={styles.reimbursementFormLabel}>Purpose</label>
                    <input
                        type="text"
                        className={styles.reimbursementFormInput}
                        value={formData.purpose}
                        onChange={(e) => handleInputChange('purpose', e.target.value)}
                        required
                    />
                </div>

                <div className={styles.reimbursementFormGroup}>
                    <label className={styles.reimbursementFormLabel}>Description</label>
                    <textarea
                        className={styles.reimbursementFormTextarea}
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        required
                    />
                </div>

                <div className={styles.reimbursementFormGroup}>
                    <label className={styles.reimbursementFormLabel}>Upload Receipts</label>
                    <div className={styles.dottedUploadBox}>
                        <input
                            type="file"
                            className={styles.dottedUploadInput}
                            multiple
                            onChange={(e) => handleFileChange(e.target.files)}
                        />
                        <p>Drag & drop files here or click to upload</p>
                    </div>
                </div>

                <button type="submit" className={styles.reimbursementSubmitButton}>Submit Request</button>
            </form>

            {popupVisible && (
                <div className={styles.popup}>
                    <div className={styles.popupContent}>
                        <h2>Request Submitted Successfully!</h2>
                        <p>Your reimbursement request has been submitted. What would you like to do next?</p>
                        <div className={styles.popupButtons}>
                            <button onClick={handleGoToRequests} className={styles.popupButton}>Go to Requests List</button>
                            <button onClick={handleClosePopup} className={styles.popupButton}>Create Another Request</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

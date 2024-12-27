'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getCompanyID, getEmployeeID } from '@/utils/jwtUtils';
import table from '@/styles/Requests.module.css';
import styles from '@/styles/Tables.module.css'; // Import the CSS module
import popup from '@/styles/RequestForm.module.css';

const ITEMS_PER_PAGE = 5; // Change this value for different pagination sizes

export default function Requests() {
    const { user } = useAuth();
    const router = useRouter();
    const companyID = getCompanyID();
    const employeeID = getEmployeeID();

    // State management
    const [requests, setRequests] = useState([]);
    const [popupVisible, setPopupVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [filter, setFilter] = useState('');
    const [sort, setSort] = useState('none');
    const [loading, setLoading] = useState(true); // Loading state for requests

    // Fetch reimbursement requests from the backend
    useEffect(() => {
        const fetchRequests = async () => {
            if (!user) return; // Wait for user to be defined

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get-reimbursement-requests`, {
                    method: 'POST', // Change to POST
                    headers: {
                        'Content-Type': 'application/json' // Set content type to JSON
                    },
                    body: JSON.stringify({ companyID, employeeID }) // Send as JSON body
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch requests');
                }
                const data = await response.json();
                setRequests(data); // Set the fetched data to the requests state
            } catch (error) {
                console.error('Error fetching requests:', error);
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };

        fetchRequests();
    }, [user, companyID, employeeID]); // Re-fetch when user or IDs change

    // Show loading state if loading is true
    if (loading) {
        return <p>Loading requests...</p>; // Show loading state while fetching requests
    }

    // Filter and sort logic
    const filteredRequests = requests.filter(request =>
        request.Purpose.toLowerCase().includes(filter.toLowerCase())
    );

    const sortedRequests = [...filteredRequests].sort((a, b) => {
        switch (sort) {
            case 'Purpose asc':
                return a.Purpose.localeCompare(b.Purpose);
            case 'Purpose desc':
                return b.Purpose.localeCompare(a.Purpose);
            case 'Amount asc':
                return (
                    a.Amounts.reduce((total, amount) => total + amount, 0) -
                    b.Amounts.reduce((total, amount) => total + amount, 0)
                );
            case 'Amount desc':
                return (
                    b.Amounts.reduce((total, amount) => total + amount, 0) -
                    a.Amounts.reduce((total, amount) => total + amount, 0)
                );
            case 'TravelStartDate asc':
                return new Date(a.TravelStartDate) - new Date(b.TravelStartDate);
            case 'TravelStartDate desc':
                return new Date(b.TravelStartDate) - new Date(a.TravelStartDate);
            default:
                return 0; // No sorting
        }
    });

    const totalPages = Math.ceil(sortedRequests.length / ITEMS_PER_PAGE);
    const currentRequests = sortedRequests.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

    // Handle view button click
    const handleViewClick = (request) => {
        setSelectedRequest(request);
        setPopupVisible(true);
    };

    const handleClosePopup = () => {
        setPopupVisible(false);
        setSelectedRequest(null);
    };

    // Change page
    const handlePageChange = (direction) => {
        if (direction === 'next' && currentPage < totalPages - 1) {
            setCurrentPage(prev => prev + 1);
        } else if (direction === 'prev' && currentPage > 0) {
            setCurrentPage(prev => prev - 1);
        }
    };

    return (
        <div className="container">
            <h1>My Requests</h1>
            <div className={styles.controls}>
                <input
                    type="text"
                    placeholder="Filter by purpose"
                    className={styles.filterInput}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
                <select
                    className={styles.sortDropdown}
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                >
                    <option className={styles.options} value="none">Sort by...</option>
                    <option className={styles.options} value="Purpose asc">Purpose Ascending</option>
                    <option className={styles.options} value="Purpose desc">Purpose Descending</option>
                    <option className={styles.options} value="Amount asc">Amount Ascending</option>
                    <option className={styles.options} value="Amount desc">Amount Descending</option>
                    <option className={styles.options} value="TravelStartDate asc">Travel Start Ascending</option>
                    <option className={styles.options} value="TravelStartDate desc">Travel Start Descending</option>
                </select>
            </div>
            <div className={table.requestsTable}>
                <table>
                    <thead>
                        <tr>
                            <th>Purpose</th>
                            <th>Amount</th>
                            <th>Travel Dates</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRequests.map((request) => (
                            <tr key={request.RequestID}>
                                <td>{request.Purpose}</td>
                                <td>${request.Amounts.reduce((total, amount) => total + amount, 0).toFixed(2)}</td>
                                <td>
                                    {new Date(request.TravelStartDate).toLocaleDateString()} - {new Date(request.TravelEndDate).toLocaleDateString()}
                                </td>
                                <td>
                                    <span className={table[request.Status.toLowerCase()]}>{request.Status}</span>
                                </td>
                                <td>
                                    <button className={table.viewBtn} onClick={() => handleViewClick(request)}>View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className={styles.mobileTable}>
                {currentRequests.map((request) => (
                    <div key={request.RequestID} className={styles.mobileRow}>
                        <h5>
                            {`${request.Purpose} - ${request.Amounts.reduce((total, amount) => total + amount, 0).toFixed(2)} - [${new Date(request.TravelStartDate).toLocaleDateString()} - ${new Date(request.TravelEndDate).toLocaleDateString()}]`}
                        </h5>
                        <div className={styles.mobileInfoContainer}>
                            <span className={table[request.Status.toLowerCase()]}>{request.Status}</span>    
                            <button className={table.viewBtn} onClick={() => handleViewClick(request)}>View</button>         
                        </div>
                    </div>
                ))}
            </div>


            <div className={styles.pagination}>
                <button 
                    className={styles.pageButton} 
                    disabled={currentPage === 0} 
                    onClick={() => handlePageChange('prev')}
                >
                    Previous
                </button>
                <span className={styles.pageNumber}> Page {currentPage + 1} of {totalPages} </span>
                <button 
                    className={styles.pageButton} 
                    disabled={currentPage === totalPages - 1} 
                    onClick={() => handlePageChange('next')}
                >
                    Next
                </button>
            </div>
            {currentRequests.length === 0 && <p>No requests found.</p>}

            {popupVisible && selectedRequest && (
                <div className={popup.popup}>
                    <div className={popup.popupContent}>
                        <h2>Request Details</h2>
                        <p><strong>Purpose:</strong> {selectedRequest.Purpose}</p>
                        <p><strong>Total Amount:</strong> ${selectedRequest.Amounts.reduce((total, amount) => total + amount, 0).toFixed(2)}</p>
                        <p><strong>Expense Types:</strong> {selectedRequest.ExpenseTypes.join(', ')}</p>
                        <p><strong>Travel Start Date:</strong> {new Date(selectedRequest.TravelStartDate).toLocaleDateString()}</p>
                        <p><strong>Travel End Date:</strong> {new Date(selectedRequest.TravelEndDate).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> <span className={popup[selectedRequest.Status.toLowerCase()]}>{selectedRequest.Status}</span></p>
                        <div className={popup.popupButtons}>
                            <button onClick={handleClosePopup} className={popup.popupButton}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

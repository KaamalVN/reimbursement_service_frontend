'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getCompanyID, getEmployeeID } from '@/utils/jwtUtils';
import table from '@/styles/Requests.module.css';
import styles from '@/styles/Tables.module.css';
import popup from '@/styles/RequestForm.module.css';
import { RiCloseLine } from 'react-icons/ri'; // Importing close icon
import { FaCheck, FaTimes } from 'react-icons/fa'; // Importing approve and reject icons

const ITEMS_PER_PAGE = 5; // Change this value for different pagination sizes

export default function MyTeamRequests() {
    const { user } = useAuth();
    const router = useRouter();
    const companyID = getCompanyID();
    const employeeID = getEmployeeID();

    // State management
    const [requests, setRequests] = useState([]);
    const [popupVisible, setPopupVisible] = useState(false);
    const [confirmationPopupVisible, setConfirmationPopupVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [filter, setFilter] = useState('');
    const [loading, setLoading] = useState(true); // Loading state for requests
    const [action, setAction] = useState(null); // To track the action (approve/reject)

    // Fetch team requests from the backend
    useEffect(() => {
        const fetchRequests = async () => {
            if (!user) return; // Wait for user to be defined

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/my-team-requests`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ EmployeeID: employeeID }) // Send the EmployeeID
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch requests');
                }
                const data = await response.json();
                console.log('My Team Requests: ', data);
                setRequests(data);
            } catch (error) {
                console.error('Error fetching requests:', error);
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };

        fetchRequests();
    }, [user]);

    // Show loading state if loading is true
    if (loading) {
        return <p>Loading team requests...</p>; // Show loading state while fetching requests
    }

    // Filter and sort logic
    const filteredRequests = requests.filter(request =>
        request.Purpose.toLowerCase().includes(filter.toLowerCase())
    );

    const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
    const currentRequests = filteredRequests.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

    // Handle view button click
    const handleViewClick = (request) => {
        setSelectedRequest(request);
        setPopupVisible(true);
    };

    const handleClosePopup = () => {
        setPopupVisible(false);
        setSelectedRequest(null);
    };

    const handleConfirmationClose = () => {
        setConfirmationPopupVisible(false);
    };

    // Change page
    const handlePageChange = (direction) => {
        if (direction === 'next' && currentPage < totalPages - 1) {
            setCurrentPage(prev => prev + 1);
        } else if (direction === 'prev' && currentPage > 0) {
            setCurrentPage(prev => prev - 1);
        }
    };

    // Handle approve/reject action
    const handleActionClick = (action) => {
        setAction(action);
        setConfirmationPopupVisible(true);
    };

    const handleConfirmAction = async (confirm) => {
      if (confirm && selectedRequest) {
          try {
              // Log the action and request ID for debugging
              console.log(`${action} request ID: ${selectedRequest.RequestID} by Employee ID: ${employeeID}`);
  
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/approve-reject`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                      RequestID: selectedRequest.RequestID, 
                      Action: action, 
                      EmployeeID: employeeID  // Include the employee ID in the request body
                  }),
              });
  
              if (!response.ok) {
                  throw new Error('Failed to approve/reject request');
              }
  
              const result = await response.json(); // Optionally handle the response
              console.log('Action Result: ', result);
  
              // Update the local state for the requests array
              setRequests(prevRequests =>
                  prevRequests.map(request =>
                      request.RequestID === selectedRequest.RequestID
                          ? { ...request, Status: action === 'approve' ? 'Approved' : 'Rejected' }
                          : request
                  )
              );
  
          } catch (error) {
              console.error('Error approving/rejecting request:', error);
          } finally {
              setPopupVisible(false);
              setConfirmationPopupVisible(false);
              setSelectedRequest(null);
              setAction(null);
          }
      } else {
          // If confirm is false or no selected request, just close the popups
          setPopupVisible(false);
          setConfirmationPopupVisible(false);
          setSelectedRequest(null);
          setAction(null);
      }
  };
  
  

    return (
        <div className="container">
            <h1>My Team Requests</h1>
            <div className={styles.controls}>
                <input
                    type="text"
                    placeholder="Filter by purpose"
                    className={styles.filterInput}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>
            <div className={table.requestsTable}>
                <table>
                    <thead>
                        <tr>
                            <th>Employee ID</th>
                            <th>Purpose</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRequests.map((request) => (
                            <tr key={request.RequestID}>
                                <td>{request.CompanyEmployeeID}</td>
                                <td>{request.Purpose}</td>
                                <td>${request.Amounts.reduce((total, amount) => total + amount, 0).toFixed(2)}</td>
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
                    <div className={popup.popupRequestContent}>
                        <button onClick={handleClosePopup} className={popup.closeButton}>
                            <RiCloseLine size={24} />
                        </button>
                        <h2>Request Details</h2>
                        <p><strong>Purpose:</strong> {selectedRequest.Purpose}</p>
                        <p><strong>Total Amount:</strong> ${selectedRequest.Amounts.reduce((total, amount) => total + amount, 0).toFixed(2)}</p>
                        <p><strong>Expense Types:</strong> {selectedRequest.ExpenseTypes.join(', ')}</p>
                        <p><strong>Travel Start Date:</strong> {new Date(selectedRequest.TravelStartDate).toLocaleDateString()}</p>
                        <p><strong>Travel End Date:</strong> {new Date(selectedRequest.TravelEndDate).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> <span className={popup[selectedRequest.Status.toLowerCase()]}>{selectedRequest.Status}</span></p>
                        <div className={popup.popupButtons}>
                            <button onClick={() => handleActionClick('approve')} className={popup.popupButton}>Approve</button>
                            <button onClick={() => handleActionClick('reject')} className={popup.popupButton}>Reject</button>
                        </div>
                    </div>
                </div>
            )}

            {confirmationPopupVisible && (
                <div className={popup.popup}>
                    <div className={popup.popupContent}>
                        <h2>Confirmation</h2>
                        <p>Are you sure you want to {action} this request?</p>
                        <div className={popup.popupButtons}>
                            <button onClick={() => handleConfirmAction(true)} className={popup.popupButton}>Yes</button>
                            <button onClick={() => handleConfirmAction(false)} className={popup.popupButton}>No</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

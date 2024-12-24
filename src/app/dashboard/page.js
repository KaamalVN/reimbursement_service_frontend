'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getCompanyID, getPermissionLevel, getEmployeeID } from '@/utils/jwtUtils';
import styles from '@/styles/Dashboard.module.css';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const companyID = getCompanyID();
  const permissionLevel = getPermissionLevel();
  const employeeID = getEmployeeID();

  const [myRequests, setMyRequests] = useState([]);
  const [teamRequests, setTeamRequests] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchMyRequests = async () => {
      if (!user) return; // Wait for user to be defined

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get-reimbursement-requests`, {
          method: 'POST', // Use POST method
          headers: {
            'Content-Type': 'application/json' // Set content type to JSON
          },
          body: JSON.stringify({ companyID, employeeID }) // Send as JSON body
        });
        if (!response.ok) {
          throw new Error('Failed to fetch my requests');
        }
        const data = await response.json();
        setMyRequests(data); // Set the fetched data to the myRequests state
      } catch (error) {
        console.error('Error fetching my requests:', error);
      }
    };

    const fetchTeamRequests = async () => {
      if (!user || permissionLevel <= 1) return; // Wait for user to be defined and check permission level

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/my-team-requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ EmployeeID: employeeID }) // Send the EmployeeID
        });
        if (!response.ok) {
          throw new Error('Failed to fetch team requests');
        }
        const data = await response.json();
        setTeamRequests(data); // Set the fetched data to the teamRequests state
      } catch (error) {
        console.error('Error fetching team requests:', error);
      }
    };

    fetchMyRequests(); // Fetch my requests
    fetchTeamRequests(); // Fetch team requests
    setLoading(false); // Set loading to false after fetching
  }, [user, companyID, employeeID]); // Re-fetch when user or IDs change

  // Count the requests by status for my requests
  const countMyRequests = (status) => myRequests.filter(request => request.Status === status).length;

  // Count the requests by status for team requests
  const countTeamRequests = (status) => teamRequests.filter(request => request.Status === status).length;

  // Calculate total approved amount for my requests
  const totalApprovedMyRequests = myRequests
    .filter(request => request.Status === 'Approved')
    .reduce((total, request) => total + request.Amounts.reduce((sum, amount) => sum + amount, 0), 0)
    .toFixed(2);

  // Calculate total approved amount for team requests
  const totalApprovedTeamRequests = teamRequests
    .filter(request => request.Status === 'Approved')
    .reduce((total, request) => total + request.Amounts.reduce((sum, amount) => sum + amount, 0), 0)
    .toFixed(2);

  if (loading) {
    return <p>Loading...</p>; // Show a spinner or placeholder while verifying authentication
  }

  return (
    <div className={styles.dashboard}>
      <h1>Dashboard</h1>
      {permissionLevel > 1 ? (
        <>
          <div className={styles.section}>
            <h2>My Requests</h2>
            <div className={styles.stats}>
              <div className={`${styles.statCard} ${styles.warning}`}>
                <h3>{countMyRequests('Pending')}</h3>
                <p>Pending Requests</p>
              </div>
              <div className={`${styles.statCard} ${styles.success}`}>
                <h3>{countMyRequests('Approved')}</h3>
                <p>Approved</p>
              </div>
              <div className={`${styles.statCard} ${styles.danger}`}>
                <h3>{countMyRequests('Rejected')}</h3>
                <p>Rejected</p>
              </div>
              <div className={`${styles.statCard} ${styles.primary}`}>
                <h3>${totalApprovedMyRequests}</h3>
                <p>Total Approved Amount</p> {/* Updated label */}
              </div>
            </div>
          </div>
          <div className={styles.section}>
            <h2>My Team Requests</h2>
            <div className={styles.stats}>
              <div className={`${styles.statCard} ${styles.warning}`}>
                <h3>{countTeamRequests('Pending')}</h3>
                <p>Pending Requests</p>
              </div>
              <div className={`${styles.statCard} ${styles.success}`}>
                <h3>{countTeamRequests('Approved')}</h3>
                <p>Approved</p>
              </div>
              <div className={`${styles.statCard} ${styles.danger}`}>
                <h3>{countTeamRequests('Rejected')}</h3>
                <p>Rejected</p>
              </div>
              <div className={`${styles.statCard} ${styles.primary}`}>
                <h3>${totalApprovedTeamRequests}</h3>
                <p>Total Approved Amount</p> {/* Updated label */}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.stats}>
          <div className={`${styles.statCard} ${styles.warning}`}>
            <h3>{countMyRequests('Pending')}</h3>
            <p>Pending Requests</p>
          </div>
          <div className={`${styles.statCard} ${styles.success}`}>
            <h3>{countMyRequests('Approved')}</h3>
            <p>Approved</p>
          </div>
          <div className={`${styles.statCard} ${styles.danger}`}>
            <h3>{countMyRequests('Rejected')}</h3>
            <p>Rejected</p>
          </div>
          <div className={`${styles.statCard} ${styles.primary}`}>
            <h3>${totalApprovedMyRequests}</h3>
            <p>Total Approved Amount</p> {/* Updated label */}
          </div>
        </div>
      )}
    </div>
  );
}

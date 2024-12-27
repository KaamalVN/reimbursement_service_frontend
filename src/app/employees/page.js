'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getCompanyID } from '@/utils/jwtUtils';
import styles from '@/styles/Tables.module.css';
import popup from '@/styles/RequestForm.module.css'; // Import popup styles
import { RiEyeLine } from 'react-icons/ri'; // Import the eye icon

export default function Employees() {
    const { user } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [filter, setFilter] = useState('');
    const [sortOption, setSortOption] = useState('name-asc');
    const [popupVisible, setPopupVisible] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const companyID = getCompanyID();

    useEffect(() => {
        const fetchEmployees = async () => {
            if (!user) return;

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employees`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    },
                    body: JSON.stringify({ companyID })
                });

                if (response.ok) {
                    const data = await response.json();
                    setEmployees(data);
                } else {
                    console.error('Failed to fetch employees:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching employees:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, [user, companyID]);

    const sortedEmployees = [...employees].sort((a, b) => {
        const [key, order] = sortOption.split('-');
        if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
        return 0;
    });

    const filteredEmployees = sortedEmployees.filter(employee =>
        employee.name.toLowerCase().includes(filter.toLowerCase())
    );

    const indexOfLastEmployee = currentPage * itemsPerPage;
    const indexOfFirstEmployee = indexOfLastEmployee - itemsPerPage;
    const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

    const handleViewDetails = (employee) => {
        setSelectedEmployee(employee);
        setPopupVisible(true);
    };

    const handleClosePopup = () => {
        setPopupVisible(false);
        setSelectedEmployee(null);
    };

    if (loading || !user) {
        return <p>Loading...</p>;
    }

    return (
        <div className="container">
            <h1>Employees</h1>
            <div className={styles.controls}>
                <input
                    type="text"
                    placeholder="Filter by employee name"
                    className={styles.filterInput}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
                <select
                    className={styles.sortDropdown}
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                >
                    <option value="name-asc" className={styles.options}>Sort by Name Ascending</option>
                    <option value="name-desc" className={styles.options}>Sort by Name Descending</option>
                    <option value="role-asc" className={styles.options}>Sort by Role Ascending</option>
                    <option value="role-desc" className={styles.options}>Sort by Role Descending</option>
                </select>
            </div>

            {/* Desktop Table */}
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Employee ID</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {currentEmployees.map((employee) => (
                        <tr key={employee.companyEmployeeID}>
                            <td>{employee.companyEmployeeID}</td>
                            <td>{employee.name}</td>
                            <td>{employee.roleName}</td>
                            <td>
                                <button onClick={() => handleViewDetails(employee)} className={styles.submitButton}>View</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Mobile View */}
            <div className={styles.mobileTable}>
                {currentEmployees.map((employee) => (
                    <div key={employee.companyEmployeeID} className={styles.mobileRow}>
                        <div className={styles.mobileInfoContainer}>
                        <div className={styles.mobileInfo}>
                            <h4>{`${employee.companyEmployeeID} - ${employee.name}`}</h4>
                            <p className={styles.mobileRole}>{employee.roleName}</p>
                        </div>
                        <RiEyeLine 
                            className={styles.viewIcon} 
                            onClick={() => handleViewDetails(employee)} 
                            title="View Details"
                        />
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.pagination}>
                <button
                    className={styles.pageButton}
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                >
                    Previous
                </button>
                <span className={styles.pageNumber}> Page {currentPage} of {totalPages} </span>
                <button
                    className={styles.pageButton}
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                >
                    Next
                </button>
            </div>
            {filteredEmployees.length === 0 && <p>No employees found.</p>}

            {popupVisible && selectedEmployee && (
                <div className={popup.popup}>
                    <div className={popup.popupContent}>
                        <h2>Employee Details</h2>
                        <p><strong>Company Employee ID:</strong> {selectedEmployee.companyEmployeeID}</p>
                        <p><strong>Name:</strong> {selectedEmployee.name}</p>
                        <p><strong>Email:</strong> {selectedEmployee.email}</p>
                        <p><strong>Role:</strong> {selectedEmployee.roleName}</p>
                        <p><strong>Manager:</strong> {selectedEmployee.manager ? selectedEmployee.manager.name : 'N/A'}</p>
                        <div className={popup.popupButtons}>
                            <button onClick={handleClosePopup} className={popup.popupButton}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

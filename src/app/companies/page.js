'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import styles from '@/styles/Tables.module.css'; // Import the CSS module

export default function Companies() {
    const { user } = useAuth();
    const router = useRouter();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Number of items per page
    const [filter, setFilter] = useState('');
    const [sortOption, setSortOption] = useState('companyName-asc'); // New state for sort option

    useEffect(() => {
        const fetchCompanies = async () => {
            if (!user) {
                return <p>Loading...</p>;
            }

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/companies`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setCompanies(data); // Only set the fetched data
                } else {
                    console.error('Failed to fetch companies:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching companies:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();
    }, [user, router]);

    // Sort the companies based on the selected sort option
    const sortedCompanies = [...companies].sort((a, b) => {
        const [key, order] = sortOption.split('-');
        if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
        return 0;
    });

    // Filtered and paginated companies
    const filteredCompanies = sortedCompanies.filter(company =>
        company.companyName.toLowerCase().includes(filter.toLowerCase())
    );

    const indexOfLastCompany = currentPage * itemsPerPage;
    const indexOfFirstCompany = indexOfLastCompany - itemsPerPage;
    const currentCompanies = filteredCompanies.slice(indexOfFirstCompany, indexOfLastCompany);
    const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);

    // Show loading state
    if (loading || !user) {
        return <p>Loading...</p>;
    }

    return (
        <div className="container">
            <h1>Companies</h1>
            <div className={styles.controls}>
                <input
                    type="text"
                    placeholder="Filter by company name"
                    className={styles.filterInput}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
                <select 
                    className={styles.sortDropdown} 
                    value={sortOption} 
                    onChange={(e) => setSortOption(e.target.value)}
                >
                    <option value="companyName-asc" className={styles.options}>Sort by Company Name Ascending</option>
                    <option value="companyName-desc" className={styles.options}>Sort by Company Name Descending</option>
                    <option value="createdAt-asc" className={styles.options}>Sort by Created At Ascending</option>
                    <option value="createdAt-desc" className={styles.options}>Sort by Created At Descending</option>
                </select>
            </div>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Company Name</th>
                        <th>Address</th>
                        <th>Contact Email</th>
                        <th>Created At</th>
                    </tr>
                </thead>
                <tbody>
                    {currentCompanies.map((company) => (
                        <tr key={company.companyID}>
                            <td>{company.companyName}</td>
                            <td>{company.address}</td>
                            <td>{company.contactEmail}</td>
                            <td>{new Date(company.createdAt).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
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
            {filteredCompanies.length === 0 && <p>No companies found.</p>}
        </div>
    );
}

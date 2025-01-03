'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getCompanyID } from '@/utils/jwtUtils';
import { RiEdit2Line, RiCloseLine } from 'react-icons/ri';
import styles from '@/styles/Mycompany.module.css';
import tables from '@/styles/Tables.module.css';

export default function Mycompany() {
  const { user } = useAuth();
  const router = useRouter();
  const companyID = getCompanyID();

  const [isEditing, setIsEditing] = useState(false);
  const [companyDetails, setCompanyDetails] = useState({
    name: '',
    email: '',
    address: '',
  });
  const [buttonText, setButtonText] = useState('Save Changes');
  
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleLevel, setNewRoleLevel] = useState('');
  const [filter, setFilter] = useState('');
  const [sortOption, setSortOption] = useState('roleName-asc');

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setButtonText('Save Changes');
    }
  };

  const handleSaveChanges = () => {
    if (buttonText === 'Save Changes') {
      setButtonText('Saved Changes');
    } else {
      setButtonText('Save Changes');
    }
    setIsEditing(false);
  };

  const fetchCompanyDetails = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/company/${companyID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCompanyDetails({
          name: data.companyName,
          email: data.companyEmail,
          address: data.companyAddress,
        });
      } else {
        console.error('Failed to fetch company details:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
    }
  };

  const fetchRoles = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/roles/${companyID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      } else {
        console.error('Failed to fetch roles:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleAddRole = async () => {
    if (newRoleName && newRoleLevel) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/roles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`,
          },
          body: JSON.stringify({ roleName: newRoleName, permissionLevel: newRoleLevel, companyID }),
        });

        if (response.ok) {
          fetchRoles();
          setNewRoleName('');
          setNewRoleLevel('');
        } else {
          console.error('Failed to add role:', response.statusText);
        }
      } catch (error) {
        console.error('Error adding role:', error);
      }
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (confirm('Are you sure you want to delete this role?')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/roles/${roleId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });

        if (response.ok) {
          fetchRoles();
        } else {
          console.error('Failed to delete role:', response.statusText);
        }
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  useEffect(() => {
    fetchCompanyDetails();
    fetchRoles();
  }, [user, router]);

  // Sort roles based on the selected sort option
  const sortedRoles = [...roles].sort((a, b) => {
    const [key, order] = sortOption.split('-');
    const aValue = a[key.charAt(0).toUpperCase() + key.slice(1)] ? a[key.charAt(0).toUpperCase() + key.slice(1)].toString().toLowerCase() : '';
    const bValue = b[key.charAt(0).toUpperCase() + key.slice(1)] ? b[key.charAt(0).toUpperCase() + key.slice(1)].toString().toLowerCase() : '';
  
    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
  
  const filteredRoles = sortedRoles.filter(role =>
    role.RoleName && role.RoleName.toLowerCase().includes(filter.toLowerCase())
  );

  // Show loading state
  if (loadingRoles || !user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container">
      <h1>Manage Company</h1>
      <div className={styles.detailCard}>
        <div className={styles.cardHeader}>
          <h2>Company Information</h2>
          <div onClick={handleEditToggle} className={styles.editIcon}>
            {isEditing ? <RiCloseLine /> : <RiEdit2Line />}
          </div>
        </div>

        <div className={styles.detailField}>
          <div className={styles.companyInfo}>
            <div className={styles.fieldContainer}>
              <label>Company Name:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={companyDetails.name}
                  onChange={(e) => setCompanyDetails({ ...companyDetails, name: e.target.value })}
                />
              ) : (
                <p>{companyDetails.name || 'N/A'}</p>
              )}
            </div>
            <div className={styles.fieldContainer}>
              <label>Company Email:</label>
              {isEditing ? (
                <input
                  type="email"
                  value={companyDetails.email}
                  onChange={(e) => setCompanyDetails({ ...companyDetails, email: e.target.value })}
                />
              ) : (
                <p>{companyDetails.email || 'N/A'}</p>
              )}
            </div>
          </div>

          <label>Company Address:</label>
          {isEditing ? (
            <textarea
              value={companyDetails.address}
              onChange={(e) => setCompanyDetails({ ...companyDetails, address: e.target.value })}
              rows={4}
            />
          ) : (
            <p>{companyDetails.address || 'N/A'}</p>
          )}
        </div>

        {isEditing && (
          <button className={styles.submitButton} onClick={handleSaveChanges}>
            {buttonText}
          </button>
        )}
      </div>

      <div>
        <h2>Manage Roles</h2>
        <div className={styles.roleCard}>
          <input
            type="text"
            placeholder="Role Name"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Permission Level"
            value={newRoleLevel}
            onChange={(e) => setNewRoleLevel(e.target.value)}
          />
          <button className={styles.submitButton} onClick={handleAddRole}>Add Role</button>
        </div>
        <input
          type="text"
          placeholder="Filter by role name"
          className={tables.filterInput}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select 
          className={tables.sortDropdown} 
          value={sortOption} 
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="roleName-asc" className={tables.options}>Sort by Role Name Ascending</option>
          <option value="roleName-desc" className={tables.options}>Sort by Role Name Descending</option>
          <option value="permissionLevel-asc" className={tables.options}>Sort by Permission Level Ascending</option>
          <option value="permissionLevel-desc" className={tables.options}>Sort by Permission Level Descending</option>
        </select>
        <table className={tables.table}>
          <thead>
            <tr>
              <th>Role Name</th>
              <th>Permission Level</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoles.map((role) => (
              <tr key={role.RoleID}>
                <td>{role.RoleName}</td>
                <td>{role.PermissionLevel}</td>
                <td>
                  <button className={styles.submitButton} onClick={() => handleDeleteRole(role.RoleID)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={tables.mobileTable}>
          {filteredRoles.map((role) => (
            <div key={role.RoleID} className={tables.mobileRow}>
              <div className={tables.mobileInfoContainer}>
                <p className={tables.mobileP}>{`${role.RoleName} - Level[${role.PermissionLevel}]`}</p>
                <button className={tables.submitButton} onClick={() => handleDeleteRole(role.RoleID)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
        {filteredRoles.length === 0 && <p>No roles found.</p>}
      </div>
    </div>
  );
}

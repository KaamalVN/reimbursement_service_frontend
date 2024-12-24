'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { getCompanyID, getPermissionLevel, getRoleID } from '@/utils/jwtUtils';
import styles from '@/styles/Sidebar.module.css';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import {
  RiAccountCircleFill,
  RiDashboardLine,
  RiFileAddLine,
  RiFileListLine,
  RiCheckboxCircleLine,
  RiNotification3Line,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiLogoutBoxLine,
  RiBriefcaseLine,
  RiTeamLine
} from 'react-icons/ri';

export default function Sidebar() {
  const pathname = usePathname();
  const { isExpanded, setIsExpanded } = useSidebar();
  const { user, logout, isLoading, fetchUserDetails } = useAuth();

  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  const companyID = getCompanyID();
  const permissionLevel = getPermissionLevel();
  const roleID = getRoleID();

  // Fetch roles from the API
  const fetchRoles = async () => {
    if (!user || !companyID) {
      setLoadingRoles(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/roles/${companyID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
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

  useEffect(() => {
    fetchRoles();
  }, [user, companyID]);

  if (isLoading || !user) {
    return null; // Do not render sidebar while loading
  }

  if (loadingRoles) {
    return <div>Loading...</div>; // Show a loading state for roles
  }

  const menuItems = [
    {
      icon: <RiFileListLine size={24} />,
      label: 'Companies',
      path: '/companies',
      visible: roleID === 'productAdmin'
    },
    {
      icon: <RiFileAddLine size={24} />,
      label: 'Create Company',
      path: '/company',
      visible: roleID === 'productAdmin'
    },
    {
      icon: <RiBriefcaseLine size={24} />,
      label: 'My Company',
      path: '/mycompany',
      visible: roleID === 'companyAdmin'
    },
    {
      icon: <RiFileAddLine size={24} />,
      label: 'Employee',
      path: '/employee',
      visible: roleID === 'companyAdmin'
    },
    {
      icon: <RiFileListLine size={24} />,
      label: 'Employees',
      path: '/employees',
      visible: roleID === 'companyAdmin'
    },
    {
      icon: <RiDashboardLine size={24} />,
      label: 'Dashboard',
      path: '/dashboard',
      visible: roleID !== 'companyAdmin' && roleID !== 'productAdmin'
    },
    {
      icon: <RiFileAddLine size={24} />,
      label: 'New Request',
      path: '/newrequest',
      visible: permissionLevel !== null && roleID !== 'companyAdmin' && roleID !== 'productAdmin'
    },
    {
      icon: <RiFileListLine size={24} />,
      label: 'My Requests',
      path: '/requests',
      visible: permissionLevel !== null && roleID !== 'companyAdmin' && roleID !== 'productAdmin'
    },
    {
      icon: <RiTeamLine size={24} />,
      label: 'My Team Requests',
      path: '/myteamrequests',
      visible: permissionLevel > 1 && roleID !== 'productAdmin' && roleID !== 'companyAdmin'
    },
    {
      icon: <RiNotification3Line size={24} />,
      label: 'Notifications',
      path: '/notifications',
      visible: true
    }
  ];

  return (
    <aside className={`${styles.sidebar} ${!isExpanded ? styles.collapsed : ''}`}>
      <div className={styles.sidebarHeader}>
        <button
          className={styles.toggleButton}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <RiMenuFoldLine size={24} /> : <RiMenuUnfoldLine size={24} />}
        </button>
      </div>
      <nav className={styles.nav}>
        {menuItems.map((item) =>
          item.visible ? (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.menuItem} ${
                pathname === item.path ? styles.active : ''
              }`}
            >
              <span className={styles.icon}>{item.icon}</span>
              {isExpanded && <span className={styles.label}>{item.label}</span>}
            </Link>
          ) : null
        )}
      </nav>
      <div className={styles.profile}>
        <div className={styles.userInfo}>
          <div>
            <RiAccountCircleFill size={24} />
          </div>
          {isExpanded && (
            <div className={styles.userDetails}>
              <span className={styles.userEmail}>{user.email}</span>
            </div>
          )}
        </div>
        <button className={styles.logoutBtn} onClick={logout}>
          <RiLogoutBoxLine size={20} />
          {isExpanded && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  RiDashboardLine, 
  RiFileAddLine, 
  RiFileListLine, 
  RiCheckboxCircleLine,
  RiNotification3Line,
  RiLogoutBoxLine,
  RiUserLine
} from 'react-icons/ri'
import { useAuth } from '@/context/AuthContext'
import styles from '@/styles/MobileNav.module.css'

export default function MobileNav() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const menuItems = [
    {
      icon: <RiDashboardLine size={20} />,
      label: 'Dashboard',
      path: '/dashboard'
    },
    {
      icon: <RiFileAddLine size={20} />,
      label: 'New',
      path: '/requests/new'
    },
    {
      icon: <RiFileListLine size={20} />,
      label: 'Requests',
      path: '/requests'
    },
    {
      icon: <RiCheckboxCircleLine size={20} />,
      label: 'Approvals',
      path: '/approvals'
    },
    {
      icon: <RiNotification3Line size={20} />,
      label: 'Alerts',
      path: '/notifications'
    },
    {
      icon: <RiUserLine size={20} />,
      label: 'Profile',
      path: '/profile'
    }
  ]

  if (!user) return null;

  return (
    <nav className={styles.mobileNav}>
      {menuItems.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          className={`${styles.navItem} ${
            pathname === item.path ? styles.active : ''
          }`}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
        </Link>
      ))}
      <button className={styles.navItem} onClick={logout}>
        <span className={styles.icon}><RiLogoutBoxLine size={20} /></span>
        <span className={styles.label}>Logout</span>
      </button>
    </nav>
  )
} 
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import styles from './Navbar.module.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const handleProfile = () => {
    setDropdownOpen(false);
    // Profile page will come in later phase
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <svg className={styles.logoIcon} viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" />
          <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" />
          <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" />
          <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor"
            opacity="0.5" />
        </svg>
        <span
          className={styles.logoText}
          onClick={() => navigate('/boards')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/boards')}
        >
          TaskFlow
        </span>
      </div>

      <div className={styles.center}>
        <button className={styles.searchTrigger} type="button">
          <svg className={styles.searchIcon} viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor"
              strokeWidth="1.5" />
            <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" />
          </svg>
          <span>Search...</span>
        </button>
      </div>

      <div className={styles.right} ref={dropdownRef}>
        <button
          className={styles.avatar}
          onClick={() => setDropdownOpen((prev) => !prev)}
          type="button"
          aria-label="User menu"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className={styles.avatarImg} />
          ) : (
            <span className={styles.initials}>{getInitials(user?.name)}</span>
          )}
        </button>

        {dropdownOpen && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownHeader}>
              <span className={styles.dropdownName}>{user?.name}</span>
              <span className={styles.dropdownEmail}>{user?.email}</span>
            </div>
            <div className={styles.dropdownDivider} />
            <button
              className={styles.dropdownItem}
              onClick={handleProfile}
              type="button"
            >
              <svg viewBox="0 0 16 16" fill="none" className={styles.dropdownIcon}>
                <circle cx="8" cy="5" r="3" stroke="currentColor"
                  strokeWidth="1.5" />
                <path d="M2 14c0-2.761 2.686-5 6-5s6 2.239 6 5"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Profile
            </button>
            <div className={styles.dropdownDivider} />
            <button
              className={`${styles.dropdownItem} ${styles.dropdownLogout}`}
              onClick={handleLogout}
              type="button"
            >
              <svg viewBox="0 0 16 16" fill="none" className={styles.dropdownIcon}>
                <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                  strokeLinejoin="round" />
              </svg>
              Log out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

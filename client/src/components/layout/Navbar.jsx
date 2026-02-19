import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import SearchModal from './SearchModal';
import styles from './Navbar.module.css';

function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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

  // Ctrl/Cmd + K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const handleProfile = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };

  const getInitials = useCallback((name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);

  return (
    <>
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
          <button
            className={styles.searchTrigger}
            onClick={() => setSearchOpen(true)}
            type="button"
          >
            <svg className={styles.searchIcon} viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor"
                strokeWidth="1.5" />
              <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" />
            </svg>
            <span>Search...</span>
            <kbd className={styles.shortcutBadge}>⌘K</kbd>
          </button>
        </div>

        <div className={styles.right} ref={dropdownRef}>
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            type="button"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? (
              <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
                <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1M3.4 3.4l.7.7M11.9 11.9l.7.7M3.4 12.6l.7-.7M11.9 4.1l.7-.7"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
                <path d="M13.5 9.2A5.5 5.5 0 116.8 2.5a7 7 0 006.7 6.7z"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                  strokeLinejoin="round" />
              </svg>
            )}
          </button>

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
              <button
                className={styles.dropdownItem}
                onClick={toggleTheme}
                type="button"
              >
                <svg viewBox="0 0 16 16" fill="none" className={styles.dropdownIcon}>
                  {isDark ? (
                    <>
                      <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1M3.4 3.4l.7.7M11.9 11.9l.7.7M3.4 12.6l.7-.7M11.9 4.1l.7-.7"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </>
                  ) : (
                    <path d="M13.5 9.2A5.5 5.5 0 116.8 2.5a7 7 0 006.7 6.7z"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                      strokeLinejoin="round" />
                  )}
                </svg>
                {isDark ? 'Light mode' : 'Dark mode'}
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

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

export default Navbar;

import { useState, useRef, useEffect } from 'react';
import styles from './MemberPicker.module.css';

function MemberPicker({ boardMembers, cardMembers, onToggle, onClose }) {
  const [search, setSearch] = useState('');
  const pickerRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const cardMemberIds = (cardMembers || []).map((m) =>
    typeof m === 'string' ? m : m._id,
  );

  const isAssigned = (userId) => cardMemberIds.includes(userId);

  const filtered = (boardMembers || []).filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q)
    );
  });

  const getInitial = (name) => name?.charAt(0).toUpperCase() || '?';

  const AVATAR_COLORS = ['#0079BF', '#EB5A46', '#61BD4F', '#C377E0', '#FF9F1A', '#00C2E0'];

  const getAvatarColor = (index) => AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <div className={styles.picker} ref={pickerRef}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>Members</span>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          type="button"
          aria-label="Close"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M9 3L3 9M3 3l6 6" stroke="currentColor"
              strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className={styles.searchBox}>
        <input
          ref={searchRef}
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members..."
          type="text"
        />
      </div>

      <div className={styles.list}>
        <span className={styles.sectionLabel}>Board members</span>
        {filtered.map((member, idx) => (
          <button
            key={member._id}
            className={styles.memberRow}
            onClick={() => onToggle(member._id)}
            type="button"
          >
            <div
              className={styles.avatar}
              style={{ backgroundColor: getAvatarColor(idx) }}
            >
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} />
              ) : (
                <span>{getInitial(member.name)}</span>
              )}
            </div>
            <div className={styles.memberInfo}>
              <span className={styles.memberName}>{member.name}</span>
              {member.email && (
                <span className={styles.memberEmail}>{member.email}</span>
              )}
            </div>
            {isAssigned(member._id) && (
              <svg className={styles.checkIcon} width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8.5l3.5 3.5L13 4" stroke="#61BD4F"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        ))}
        {filtered.length === 0 && (
          <p className={styles.empty}>No members found</p>
        )}
      </div>
    </div>
  );
}

export default MemberPicker;

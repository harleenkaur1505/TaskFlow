import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useBoard from '../../hooks/useBoard';
import styles from './List.module.css';

function List({ list, dragHandleProps }) {
  const { boardId } = useParams();
  const { updateList, removeList } = useBoard();

  // Inline title editing
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(list.title);
  const inputRef = useRef(null);

  // Options menu
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setTitle(list.title);
  }, [list.title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setShowDeleteConfirm(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveTitle = () => {
    const trimmed = title.trim();
    if (trimmed && trimmed !== list.title) {
      updateList(boardId, list._id, trimmed);
    } else {
      setTitle(list.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setTitle(list.title);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    removeList(boardId, list._id);
    setMenuOpen(false);
    setShowDeleteConfirm(false);
  };

  return (
    <div className={styles.list}>
      <div className={styles.header} {...dragHandleProps}>
        {isEditing ? (
          <input
            ref={inputRef}
            className={styles.titleInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={handleKeyDown}
            maxLength={100}
          />
        ) : (
          <h3
            className={styles.title}
            onClick={() => setIsEditing(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditing(true)}
          >
            {list.title}
          </h3>
        )}

        <div className={styles.menuWrapper} ref={menuRef}>
          <button
            className={styles.menuButton}
            onClick={() => {
              setMenuOpen((prev) => !prev);
              setShowDeleteConfirm(false);
            }}
            type="button"
            aria-label="List options"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="3" r="1.5" fill="currentColor" />
              <circle cx="8" cy="8" r="1.5" fill="currentColor" />
              <circle cx="8" cy="13" r="1.5" fill="currentColor" />
            </svg>
          </button>

          {menuOpen && (
            <div className={styles.menu}>
              {showDeleteConfirm ? (
                <div className={styles.deleteConfirm}>
                  <p className={styles.deleteText}>
                    Delete this list and all its cards?
                  </p>
                  <div className={styles.deleteActions}>
                    <button
                      className={styles.deleteYes}
                      onClick={handleDelete}
                      type="button"
                    >
                      Delete
                    </button>
                    <button
                      className={styles.deleteNo}
                      onClick={() => setShowDeleteConfirm(false)}
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.menuHeader}>
                    <span>List actions</span>
                    <button
                      className={styles.menuClose}
                      onClick={() => setMenuOpen(false)}
                      type="button"
                      aria-label="Close menu"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M9 3L3 9M3 3l6 6" stroke="currentColor"
                          strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                  <div className={styles.menuDivider} />
                  <button
                    className={styles.menuItem}
                    onClick={() => setShowDeleteConfirm(true)}
                    type="button"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 4h10M5 4V2.5A.5.5 0 015.5 2h3a.5.5 0 01.5.5V4M11 4v7.5a1.5 1.5 0 01-1.5 1.5h-5A1.5 1.5 0 013 11.5V4"
                        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"
                        strokeLinejoin="round" />
                    </svg>
                    Delete list
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles.cards}>
        {list.cards && list.cards.length > 0 ? (
          list.cards.map((card) => (
            <div key={card._id} className={styles.cardPlaceholder}>
              {card.title}
            </div>
          ))
        ) : (
          <div className={styles.emptyCards} />
        )}
      </div>

      <div className={styles.footer}>
        <button className={styles.addCardButton} type="button">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" />
          </svg>
          Add a card
        </button>
      </div>
    </div>
  );
}

export default List;

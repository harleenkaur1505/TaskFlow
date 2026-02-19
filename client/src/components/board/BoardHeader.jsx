import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useBoard from '../../hooks/useBoard';
import styles from './BoardHeader.module.css';

function BoardHeader({ onToggleActivity, activityOpen }) {
  const { boardId } = useParams();
  const { board, updateBoardTitle } = useBoard();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (board) setTitle(board.title);
  }, [board]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = title.trim();
    if (trimmed && trimmed !== board.title) {
      updateBoardTitle(boardId, trimmed);
    } else {
      setTitle(board.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setTitle(board.title);
      setIsEditing(false);
    }
  };

  if (!board) return null;

  return (
    <div className={styles.header}>
      <div className={styles.left}>
        {isEditing ? (
          <input
            ref={inputRef}
            className={styles.titleInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            maxLength={50}
          />
        ) : (
          <button
            className={styles.titleButton}
            onClick={() => setIsEditing(true)}
            type="button"
          >
            {board.title}
          </button>
        )}
      </div>

      <div className={styles.right}>
        <div className={styles.members}>
          {board.members?.map((member) => (
            <div key={member._id} className={styles.memberAvatar} title={member.name}>
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} />
              ) : (
                <span>
                  {member.name
                    ?.split(' ')
                    .map((p) => p[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </span>
              )}
            </div>
          ))}
        </div>

        <button
          className={styles.activityBtn}
          onClick={onToggleActivity}
          type="button"
          aria-label={activityOpen ? 'Close activity' : 'Show activity'}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M14 8A6 6 0 112 8a6 6 0 0112 0z" stroke="currentColor" strokeWidth="1.3" />
            <path d="M8 4.5V8l2.5 1.5" stroke="currentColor"
              strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          Activity
        </button>
      </div>
    </div>
  );
}

export default BoardHeader;

import { useNavigate } from 'react-router-dom';
import styles from './BoardCard.module.css';

function BoardCard({ board, isStarred, onToggleStar }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/board/${board._id}`);
  };

  const handleStarClick = (e) => {
    e.stopPropagation();
    onToggleStar(board._id);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={styles.card}
      style={{ backgroundColor: board.background || '#0079BF' }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className={styles.overlay} />
      <button
        className={`${styles.star} ${isStarred ? styles.starred : ''}`}
        onClick={handleStarClick}
        type="button"
        aria-label={isStarred ? 'Unstar board' : 'Star board'}
      >
        <svg viewBox="0 0 16 16" fill={isStarred ? 'currentColor' : 'none'}>
          <path
            d="M8 1.5l1.854 3.956L14 6.086l-3 3.073L11.708 14 8 12.028 4.292 14 5 9.159l-3-3.073 4.146-.63L8 1.5z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <span className={styles.title}>{board.title}</span>
    </div>
  );
}

export default BoardCard;

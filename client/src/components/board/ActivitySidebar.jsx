import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { getBoardActivity } from '../../api/boardsApi';
import { formatAction, getInitial } from '../card/ActivityFeed';
import styles from './ActivitySidebar.module.css';

function ActivitySidebar({ boardId, onClose }) {
  const [activities, setActivities] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Escape to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const loadActivities = useCallback(async (pageNum, append = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const result = await getBoardActivity(boardId, pageNum, 20);
      if (append) {
        setActivities((prev) => [...prev, ...result.data]);
      } else {
        setActivities(result.data);
      }
      setTotalPages(result.pagination.pages);
      setPage(pageNum);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [boardId]);

  useEffect(() => {
    loadActivities(1);
  }, [loadActivities]);

  const handleLoadMore = () => {
    if (page < totalPages && !isLoadingMore) {
      loadActivities(page + 1, true);
    }
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h3 className={styles.title}>Activity</h3>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          type="button"
          aria-label="Close activity sidebar"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M9 3L3 9M3 3l6 6" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className={styles.feed}>
        {isLoading ? (
          <p className={styles.loading}>Loading activity...</p>
        ) : activities.length === 0 ? (
          <p className={styles.empty}>No activity yet</p>
        ) : (
          <>
            {activities.map((activity) => {
              const isComment = activity.type === 'card:comment';
              const timeAgo = activity.createdAt
                ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })
                : '';

              return (
                <div key={activity._id} className={styles.entry}>
                  <div className={styles.avatar}>
                    {activity.user?.avatar ? (
                      <img src={activity.user.avatar} alt={activity.user.name} />
                    ) : (
                      <span>{getInitial(activity.user?.name)}</span>
                    )}
                  </div>
                  <div className={styles.entryContent}>
                    {isComment ? (
                      <>
                        <div className={styles.commentHeader}>
                          <span className={styles.userName}>{activity.user?.name}</span>
                          <span className={styles.timestamp}>{timeAgo}</span>
                        </div>
                        <div className={styles.commentBody}>
                          {activity.data?.text || ''}
                        </div>
                      </>
                    ) : (
                      <p className={styles.action}>
                        <span className={styles.userName}>{activity.user?.name}</span>
                        {' '}
                        {formatAction(activity)}
                        <span className={styles.timestamp}> {timeAgo}</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {page < totalPages && (
              <button
                className={styles.loadMoreBtn}
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                type="button"
              >
                {isLoadingMore ? 'Loading...' : 'Load more'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ActivitySidebar;

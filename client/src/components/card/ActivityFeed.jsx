import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import styles from './ActivityFeed.module.css';

function ActivityFeed({ activities, onAddComment }) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = comment.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(trimmed);
      setComment('');
    } catch {
      // handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatAction = (activity) => {
    switch (activity.type) {
      case 'card:created':
        return 'created this card';
      case 'card:moved':
        return `moved this card from ${activity.data?.fromList?.title || '?'} to ${activity.data?.toList?.title || '?'}`;
      case 'card:title_changed':
        return 'changed the title';
      case 'card:description_changed':
        return 'updated the description';
      case 'card:due_date_set':
        return 'set the due date';
      case 'card:due_date_changed':
        return 'changed the due date';
      case 'card:due_date_removed':
        return 'removed the due date';
      case 'card:due_complete':
        return 'marked the due date complete';
      case 'card:due_incomplete':
        return 'marked the due date incomplete';
      case 'card:member_added':
        return `added ${activity.data?.member?.name || 'a member'}`;
      case 'card:member_removed':
        return `removed ${activity.data?.member?.name || 'a member'}`;
      case 'card:label_added':
        return 'added a label';
      case 'card:label_removed':
        return 'removed a label';
      case 'card:checklist_added':
        return `added checklist "${activity.data?.title || ''}"`;
      case 'card:checklist_deleted':
        return 'deleted a checklist';
      case 'card:comment':
        return null; // handled separately
      default:
        return activity.type?.replace('card:', '') || 'made a change';
    }
  };

  const getInitial = (name) => name?.charAt(0).toUpperCase() || '?';

  const items = activities || [];

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <svg className={styles.icon} width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M14 8A6 6 0 112 8a6 6 0 0112 0z" stroke="currentColor" strokeWidth="1.4" />
          <path d="M8 4.5V8l2.5 1.5" stroke="currentColor"
            strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <h4 className={styles.title}>Activity</h4>
      </div>

      <div className={styles.commentBox}>
        <textarea
          className={styles.commentInput}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a comment..."
          rows={1}
        />
        {comment.trim() && (
          <button
            className={styles.commentBtn}
            onClick={handleSubmit}
            disabled={isSubmitting}
            type="button"
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        )}
      </div>

      <div className={styles.list}>
        {items.map((activity) => {
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
        {items.length === 0 && (
          <p className={styles.empty}>No activity yet</p>
        )}
      </div>
    </div>
  );
}

export default ActivityFeed;

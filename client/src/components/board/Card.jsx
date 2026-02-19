import clsx from 'clsx';
import { format, isPast, isToday } from 'date-fns';
import styles from './Card.module.css';

function Card({ card }) {
  const hasLabels = card.labels && card.labels.length > 0;
  const hasMembers = card.members && card.members.length > 0;
  const hasDueDate = !!card.dueDate;
  const hasChecklist = card.checklists && card.checklists.length > 0;
  const hasAttachments = card.attachments && card.attachments.length > 0;
  const hasDescription = !!card.description;

  // Due date status
  const dueDate = card.dueDate ? new Date(card.dueDate) : null;
  const isOverdue = dueDate && !card.dueComplete && isPast(dueDate) && !isToday(dueDate);
  const isDueToday = dueDate && !card.dueComplete && isToday(dueDate);
  const isDueComplete = card.dueComplete;

  // Checklist counts
  let checklistTotal = 0;
  let checklistDone = 0;
  if (hasChecklist) {
    for (const cl of card.checklists) {
      checklistTotal += cl.items.length;
      checklistDone += cl.items.filter((item) => item.completed).length;
    }
  }

  return (
    <div className={styles.card}>
      {card.coverColor && (
        <div
          className={styles.cover}
          style={{ backgroundColor: card.coverColor }}
        />
      )}

      <div className={styles.content}>
        {hasLabels && (
          <div className={styles.labels}>
            {card.labels.map((label, i) => (
              <span
                key={i}
                className={styles.label}
                style={{ backgroundColor: label.color }}
                title={label.text || ''}
              />
            ))}
          </div>
        )}

        <span className={styles.title}>{card.title}</span>

        <div className={styles.badges}>
          {hasDescription && (
            <span className={styles.badge} title="This card has a description">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 3h8M2 5.5h8M2 8h5" stroke="currentColor"
                  strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </span>
          )}

          {hasDueDate && (
            <span
              className={clsx(styles.badge, styles.dueBadge, {
                [styles.overdue]: isOverdue,
                [styles.dueToday]: isDueToday,
                [styles.dueComplete]: isDueComplete,
              })}
              title={dueDate ? format(dueDate, 'MMM d, yyyy') : ''}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M6 3.5V6l2 1.5" stroke="currentColor"
                  strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              {format(dueDate, 'MMM d')}
            </span>
          )}

          {hasChecklist && (
            <span
              className={clsx(styles.badge, {
                [styles.checklistComplete]: checklistDone === checklistTotal && checklistTotal > 0,
              })}
              title={`${checklistDone}/${checklistTotal} items complete`}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1.5" y="1.5" width="9" height="9" rx="1.5"
                  stroke="currentColor" strokeWidth="1.2" />
                <path d="M3.5 6l2 2 3-3.5" stroke="currentColor"
                  strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {checklistDone}/{checklistTotal}
            </span>
          )}

          {hasAttachments && (
            <span className={styles.badge} title={`${card.attachments.length} attachment(s)`}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6.5 3L3.5 6a2.12 2.12 0 003 3l4-4a1.41 1.41 0 00-2-2L4.5 7a.71.71 0 001 1L8 5.5"
                  stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              {card.attachments.length}
            </span>
          )}

          {hasMembers && (
            <div className={styles.members}>
              {card.members.slice(0, 3).map((member) => (
                <div
                  key={member._id}
                  className={styles.memberAvatar}
                  title={member.name}
                >
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} />
                  ) : (
                    <span>{member.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              ))}
              {card.members.length > 3 && (
                <div className={styles.memberAvatar} title={`+${card.members.length - 3} more`}>
                  <span>+{card.members.length - 3}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Card;

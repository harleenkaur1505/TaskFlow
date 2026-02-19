import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, isPast, isToday } from 'date-fns';
import clsx from 'clsx';
import useBoard from '../../hooks/useBoard';
import { getCard, getCardActivity } from '../../api/cardsApi';
import CardDescription from './CardDescription';
import LabelPicker from './LabelPicker';
import MemberPicker from './MemberPicker';
import DueDatePicker from './DueDatePicker';
import Checklist from './Checklist';
import Attachments from './Attachments';
import ActivityFeed from './ActivityFeed';
import styles from './CardModal.module.css';

const COVER_COLORS = [
  '#61BD4F', '#F2D600', '#FF9F1A', '#EB5A46',
  '#C377E0', '#0079BF', '#00C2E0', '#51E898',
];

function CardModal() {
  const { boardId, cardId } = useParams();
  const navigate = useNavigate();
  const {
    board,
    lists,
    updateCard,
    fetchCard,
    removeCard,
    addMemberToCard,
    removeMemberFromCard,
    addChecklistToCard,
    updateChecklistItemOnCard,
    deleteChecklistFromCard,
    addCommentToCard,
    addAttachmentToCard,
    deleteAttachmentFromCard,
  } = useBoard();

  const [card, setCard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState([]);

  // Inline title editing
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const titleInputRef = useRef(null);

  // Popover states
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showMemberPicker, setShowMemberPicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddChecklist, setShowAddChecklist] = useState(false);
  const [checklistTitle, setChecklistTitle] = useState('');

  const modalRef = useRef(null);
  const checklistInputRef = useRef(null);

  // Find which list this card belongs to
  const cardList = lists.find((l) =>
    (l.cards || []).some((c) => c._id === cardId),
  );

  // Load card data
  const loadCard = useCallback(async () => {
    if (!boardId || !cardId) return;
    setIsLoading(true);
    try {
      const data = await getCard(boardId, cardId);
      setCard(data);
      setTitleValue(data.title || '');
    } catch {
      navigate(`/board/${boardId}`);
    } finally {
      setIsLoading(false);
    }
  }, [boardId, cardId, navigate]);

  useEffect(() => {
    loadCard();
  }, [loadCard]);

  // Load activities
  useEffect(() => {
    if (!boardId || !cardId) return;
    const loadActivities = async () => {
      try {
        const data = await getCardActivity(boardId, cardId);
        setActivities(data || []);
      } catch {
        // activity may not exist yet
      }
    };
    loadActivities();
  }, [boardId, cardId, card]);

  // Escape to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        // Close any open picker first
        if (showLabelPicker || showMemberPicker || showDueDatePicker || showCoverPicker) {
          setShowLabelPicker(false);
          setShowMemberPicker(false);
          setShowDueDatePicker(false);
          setShowCoverPicker(false);
          return;
        }
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showLabelPicker, showMemberPicker, showDueDatePicker, showCoverPicker]);

  useEffect(() => {
    if (showAddChecklist && checklistInputRef.current) {
      checklistInputRef.current.focus();
    }
  }, [showAddChecklist]);

  const handleClose = () => {
    navigate(`/board/${boardId}`);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Title editing
  const handleTitleEdit = () => {
    setIsEditingTitle(true);
    setTimeout(() => titleInputRef.current?.focus(), 0);
  };

  const handleTitleSave = async () => {
    const trimmed = titleValue.trim();
    if (trimmed && trimmed !== card.title) {
      const updated = await updateCard(boardId, cardId, { title: trimmed });
      setCard((prev) => ({ ...prev, ...updated }));
    } else {
      setTitleValue(card.title);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setTitleValue(card.title);
      setIsEditingTitle(false);
    }
  };

  // Description
  const handleDescriptionSave = async (desc) => {
    const updated = await updateCard(boardId, cardId, { description: desc });
    setCard((prev) => ({ ...prev, ...updated }));
  };

  // Labels
  const handleLabelToggle = async (color, text) => {
    const currentLabels = card.labels || [];
    const exists = currentLabels.some((l) => l.color === color);
    let newLabels;
    if (exists) {
      newLabels = currentLabels.filter((l) => l.color !== color);
    } else {
      newLabels = [...currentLabels, { color, text: text || '' }];
    }
    const updated = await updateCard(boardId, cardId, { labels: newLabels });
    setCard((prev) => ({ ...prev, ...updated }));
  };

  // Members
  const handleMemberToggle = async (userId) => {
    const cardMemberIds = (card.members || []).map((m) =>
      typeof m === 'string' ? m : m._id,
    );
    const isAssigned = cardMemberIds.includes(userId);

    let updated;
    if (isAssigned) {
      updated = await removeMemberFromCard(boardId, cardId, userId);
    } else {
      updated = await addMemberToCard(boardId, cardId, userId);
    }
    setCard((prev) => ({ ...prev, ...updated }));
  };

  // Due date
  const handleDueDateSave = async (dateISO) => {
    const updated = await updateCard(boardId, cardId, { dueDate: dateISO });
    setCard((prev) => ({ ...prev, ...updated }));
  };

  const handleDueDateToggle = async () => {
    const updated = await updateCard(boardId, cardId, { dueComplete: !card.dueComplete });
    setCard((prev) => ({ ...prev, ...updated }));
  };

  const handleDueDateRemove = async () => {
    const updated = await updateCard(boardId, cardId, { dueDate: null, dueComplete: false });
    setCard((prev) => ({ ...prev, ...updated }));
  };

  // Checklists
  const handleAddChecklist = async () => {
    const title = checklistTitle.trim() || 'Checklist';
    const updated = await addChecklistToCard(boardId, cardId, title);
    setCard((prev) => ({ ...prev, ...updated }));
    setChecklistTitle('');
    setShowAddChecklist(false);
  };

  const handleToggleChecklistItem = async (checklistId, itemId) => {
    const updated = await updateChecklistItemOnCard(
      boardId, cardId, checklistId, { action: 'toggle', itemId },
    );
    setCard((prev) => ({ ...prev, ...updated }));
  };

  const handleAddChecklistItem = async (checklistId, text) => {
    const updated = await updateChecklistItemOnCard(
      boardId, cardId, checklistId, { action: 'add', text },
    );
    setCard((prev) => ({ ...prev, ...updated }));
  };

  const handleDeleteChecklistItem = async (checklistId, itemId) => {
    const updated = await updateChecklistItemOnCard(
      boardId, cardId, checklistId, { action: 'delete', itemId },
    );
    setCard((prev) => ({ ...prev, ...updated }));
  };

  const handleDeleteChecklist = async (checklistId) => {
    const updated = await deleteChecklistFromCard(boardId, cardId, checklistId);
    setCard((prev) => ({ ...prev, ...updated }));
  };

  // Attachments
  const handleUploadAttachment = async (file) => {
    const updated = await addAttachmentToCard(boardId, cardId, file);
    setCard((prev) => ({ ...prev, ...updated }));
  };

  const handleDeleteAttachment = async (attachmentId) => {
    const updated = await deleteAttachmentFromCard(boardId, cardId, attachmentId);
    setCard((prev) => ({ ...prev, ...updated }));
  };

  // Comments
  const handleAddComment = async (text) => {
    await addCommentToCard(boardId, cardId, text);
    // Reload activities
    try {
      const data = await getCardActivity(boardId, cardId);
      setActivities(data || []);
    } catch {
      // ignore
    }
  };

  // Cover color
  const handleCoverColor = async (color) => {
    const updated = await updateCard(boardId, cardId, { coverColor: color });
    setCard((prev) => ({ ...prev, ...updated }));
    setShowCoverPicker(false);
  };

  // Delete card
  const handleDelete = async () => {
    if (!cardList) return;
    await removeCard(boardId, cardList._id, cardId);
    navigate(`/board/${boardId}`);
  };

  // Due date display helpers
  const dueDate = card?.dueDate ? new Date(card.dueDate) : null;
  const isOverdue = dueDate && !card?.dueComplete && isPast(dueDate) && !isToday(dueDate);
  const isDueToday = dueDate && !card?.dueComplete && isToday(dueDate);

  if (isLoading) {
    return (
      <div className={styles.backdrop}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div
        className={styles.modal}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Card: ${card.title}`}
      >
        {/* Cover color */}
        {card.coverColor && (
          <div
            className={styles.cover}
            style={{ backgroundColor: card.coverColor }}
          />
        )}

        {/* Close button */}
        <button
          className={styles.closeBtn}
          onClick={handleClose}
          type="button"
          aria-label="Close card"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M10.5 3.5l-7 7M3.5 3.5l7 7" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        {/* Title */}
        <div className={styles.titleArea}>
          <svg className={styles.titleIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2.5" y="2.5" width="15" height="15" rx="2"
              stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 7h8M6 10h8M6 13h4" stroke="currentColor"
              strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <div className={styles.titleContent}>
            {isEditingTitle ? (
              <textarea
                ref={titleInputRef}
                className={styles.titleInput}
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                maxLength={200}
                rows={1}
              />
            ) : (
              <h2
                className={styles.titleText}
                onClick={handleTitleEdit}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleEdit()}
              >
                {card.title}
              </h2>
            )}
            {cardList && (
              <p className={styles.subtitle}>
                in list <strong>{cardList.title}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Two column layout */}
        <div className={styles.body}>
          {/* Left column - main content */}
          <div className={styles.main}>
            {/* Labels bar */}
            {card.labels && card.labels.length > 0 && (
              <div className={styles.metaSection}>
                <span className={styles.metaLabel}>Labels</span>
                <div className={styles.labelsBar}>
                  {card.labels.map((label, i) => (
                    <span
                      key={i}
                      className={styles.labelChip}
                      style={{ backgroundColor: label.color }}
                      title={label.text || ''}
                    >
                      {label.text && (
                        <span className={styles.labelText}>{label.text}</span>
                      )}
                    </span>
                  ))}
                  <button
                    className={styles.addChipBtn}
                    onClick={() => setShowLabelPicker(true)}
                    type="button"
                    aria-label="Add label"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Members bar */}
            {card.members && card.members.length > 0 && (
              <div className={styles.metaSection}>
                <span className={styles.metaLabel}>Members</span>
                <div className={styles.membersBar}>
                  {card.members.map((member) => (
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
                  <button
                    className={styles.addChipBtn}
                    onClick={() => setShowMemberPicker(true)}
                    type="button"
                    aria-label="Add member"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Due date display */}
            {dueDate && (
              <div className={styles.metaSection}>
                <span className={styles.metaLabel}>Due date</span>
                <div className={styles.dueDateDisplay}>
                  <button
                    className={clsx(styles.dueCheckbox, {
                      [styles.dueChecked]: card.dueComplete,
                    })}
                    onClick={handleDueDateToggle}
                    type="button"
                    aria-label={card.dueComplete ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {card.dueComplete && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="white"
                          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <span className={styles.dueDateText}>
                    {format(dueDate, 'MMM d, yyyy')}
                  </span>
                  {card.dueComplete && (
                    <span className={clsx(styles.dueBadge, styles.dueBadgeComplete)}>Complete</span>
                  )}
                  {isOverdue && (
                    <span className={clsx(styles.dueBadge, styles.dueBadgeOverdue)}>Overdue</span>
                  )}
                  {isDueToday && (
                    <span className={clsx(styles.dueBadge, styles.dueBadgeSoon)}>Due today</span>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <CardDescription
              description={card.description}
              onSave={handleDescriptionSave}
            />

            {/* Checklists */}
            {(card.checklists || []).map((cl) => (
              <Checklist
                key={cl._id}
                checklist={cl}
                onToggleItem={handleToggleChecklistItem}
                onAddItem={handleAddChecklistItem}
                onDeleteItem={handleDeleteChecklistItem}
                onDeleteChecklist={handleDeleteChecklist}
              />
            ))}

            {/* Attachments */}
            {((card.attachments && card.attachments.length > 0) || true) && (
              <Attachments
                attachments={card.attachments}
                onUpload={handleUploadAttachment}
                onDelete={handleDeleteAttachment}
              />
            )}

            {/* Activity */}
            <ActivityFeed
              activities={activities}
              onAddComment={handleAddComment}
            />
          </div>

          {/* Right column - sidebar */}
          <div className={styles.sidebar}>
            <span className={styles.sidebarLabel}>Add to card</span>

            <div className={styles.sidebarGroup}>
              {/* Labels button */}
              <div className={styles.popoverWrapper}>
                <button
                  className={styles.sidebarBtn}
                  onClick={() => setShowLabelPicker(!showLabelPicker)}
                  type="button"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4.5a2 2 0 012-2h3.17a2 2 0 011.41.59l4.83 4.83a2 2 0 010 2.83l-3.17 3.17a2 2 0 01-2.83 0L2.59 9.09A2 2 0 012 7.67V4.5z"
                      stroke="currentColor" strokeWidth="1.3" />
                    <circle cx="5.5" cy="5.5" r="1" fill="currentColor" />
                  </svg>
                  Labels
                </button>
                {showLabelPicker && (
                  <LabelPicker
                    labels={card.labels}
                    onToggle={handleLabelToggle}
                    onClose={() => setShowLabelPicker(false)}
                  />
                )}
              </div>

              {/* Members button */}
              <div className={styles.popoverWrapper}>
                <button
                  className={styles.sidebarBtn}
                  onClick={() => setShowMemberPicker(!showMemberPicker)}
                  type="button"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M2 14c0-2.5 2.5-4.5 6-4.5s6 2 6 4.5" stroke="currentColor"
                      strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  Members
                </button>
                {showMemberPicker && (
                  <MemberPicker
                    boardMembers={board?.members || []}
                    cardMembers={card.members}
                    onToggle={handleMemberToggle}
                    onClose={() => setShowMemberPicker(false)}
                  />
                )}
              </div>

              {/* Due Date button */}
              <div className={styles.popoverWrapper}>
                <button
                  className={styles.sidebarBtn}
                  onClick={() => setShowDueDatePicker(!showDueDatePicker)}
                  type="button"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M8 4.5V8l3 2" stroke="currentColor"
                      strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  Due Date
                </button>
                {showDueDatePicker && (
                  <DueDatePicker
                    dueDate={card.dueDate}
                    dueComplete={card.dueComplete}
                    onSave={handleDueDateSave}
                    onToggleComplete={handleDueDateToggle}
                    onRemove={handleDueDateRemove}
                    onClose={() => setShowDueDatePicker(false)}
                  />
                )}
              </div>

              {/* Checklist button */}
              <div className={styles.popoverWrapper}>
                <button
                  className={styles.sidebarBtn}
                  onClick={() => setShowAddChecklist(!showAddChecklist)}
                  type="button"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="2" width="12" height="12" rx="2"
                      stroke="currentColor" strokeWidth="1.3" />
                    <path d="M5 8l2.5 2.5L11 6" stroke="currentColor"
                      strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Checklist
                </button>
                {showAddChecklist && (
                  <div className={styles.checklistPopover}>
                    <div className={styles.popoverHeader}>
                      <span>Add checklist</span>
                      <button
                        className={styles.popoverClose}
                        onClick={() => setShowAddChecklist(false)}
                        type="button"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M9 3L3 9M3 3l6 6" stroke="currentColor"
                            strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                    <div className={styles.popoverBody}>
                      <label className={styles.popoverLabel}>Title</label>
                      <input
                        ref={checklistInputRef}
                        className={styles.popoverInput}
                        value={checklistTitle}
                        onChange={(e) => setChecklistTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddChecklist();
                          if (e.key === 'Escape') setShowAddChecklist(false);
                        }}
                        placeholder="Checklist"
                        type="text"
                      />
                      <button
                        className={styles.popoverSaveBtn}
                        onClick={handleAddChecklist}
                        type="button"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Attachment button */}
              <button
                className={styles.sidebarBtn}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*,.pdf,.doc,.docx';
                  input.onchange = (e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadAttachment(file);
                  };
                  input.click();
                }}
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8.5 4L4.5 8a2.83 2.83 0 004 4l5.33-5.33a1.89 1.89 0 00-2.66-2.67L5.83 9.33a.94.94 0 001.34 1.34L10.5 7.33"
                    stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                Attachment
              </button>

              {/* Cover button */}
              <div className={styles.popoverWrapper}>
                <button
                  className={styles.sidebarBtn}
                  onClick={() => setShowCoverPicker(!showCoverPicker)}
                  type="button"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="2" width="12" height="12" rx="2"
                      stroke="currentColor" strokeWidth="1.3" />
                    <rect x="2" y="2" width="12" height="5" rx="2"
                      fill="currentColor" opacity="0.3" />
                  </svg>
                  Cover
                </button>
                {showCoverPicker && (
                  <div className={styles.coverPopover}>
                    <div className={styles.popoverHeader}>
                      <span>Cover</span>
                      <button
                        className={styles.popoverClose}
                        onClick={() => setShowCoverPicker(false)}
                        type="button"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M9 3L3 9M3 3l6 6" stroke="currentColor"
                            strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                    <div className={styles.coverGrid}>
                      {COVER_COLORS.map((color) => (
                        <button
                          key={color}
                          className={clsx(styles.coverSwatch, {
                            [styles.coverSelected]: card.coverColor === color,
                          })}
                          style={{ backgroundColor: color }}
                          onClick={() => handleCoverColor(color)}
                          type="button"
                          aria-label={`Set cover color ${color}`}
                        />
                      ))}
                      {card.coverColor && (
                        <button
                          className={styles.removeCoverBtn}
                          onClick={() => handleCoverColor(null)}
                          type="button"
                        >
                          Remove cover
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.sidebarDivider} />
            <span className={styles.sidebarLabel}>Actions</span>

            <div className={styles.sidebarGroup}>
              {showDeleteConfirm ? (
                <div className={styles.deleteConfirm}>
                  <p className={styles.deleteText}>Delete this card? This cannot be undone.</p>
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
                <button
                  className={clsx(styles.sidebarBtn, styles.dangerBtn)}
                  onClick={() => setShowDeleteConfirm(true)}
                  type="button"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2.5 5h11M6 5V3.5a1 1 0 011-1h2a1 1 0 011 1V5M12 5v8a1.5 1.5 0 01-1.5 1.5h-5A1.5 1.5 0 014 13V5"
                      stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"
                      strokeLinejoin="round" />
                  </svg>
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardModal;

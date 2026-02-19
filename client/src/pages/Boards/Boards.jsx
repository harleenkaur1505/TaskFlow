import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import Navbar from '../../components/layout/Navbar';
import BoardCard from '../../components/boards/BoardCard';
import CreateBoardModal from '../../components/boards/CreateBoardModal';
import { BoardsSkeleton } from '../../components/ui/Skeleton';
import {
  getBoards,
  createBoard,
  toggleStar as toggleStarApi,
} from '../../api/boardsApi';
import styles from './Boards.module.css';

function Boards() {
  const { user } = useAuth();
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const fetchBoards = useCallback(async () => {
    try {
      setError(null);
      const data = await getBoards();
      setBoards(data);
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to load boards';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleCreate = async ({ title, background }) => {
    try {
      const newBoard = await createBoard({ title, background });
      setBoards((prev) => [newBoard, ...prev]);
      toast.success('Board created');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to create board');
    }
  };

  const handleToggleStar = async (boardId) => {
    // Optimistic update
    setBoards((prev) =>
      prev.map((b) => {
        if (b._id !== boardId) return b;
        const isStarred = b.starred.includes(user._id);
        return {
          ...b,
          starred: isStarred
            ? b.starred.filter((id) => id !== user._id)
            : [...b.starred, user._id],
        };
      }),
    );

    try {
      await toggleStarApi(boardId);
    } catch {
      // Revert on failure
      fetchBoards();
    }
  };

  const starredBoards = boards.filter((b) => b.starred.includes(user?._id));

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className={styles.page}>
          <section className={styles.section}>
            <h3 className={styles.sectionHeader}>
              <svg className={styles.sectionIcon} viewBox="0 0 16 16"
                fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="1" width="5.5" height="5.5" rx="1" />
                <rect x="9.5" y="1" width="5.5" height="5.5" rx="1" />
                <rect x="1" y="9.5" width="5.5" height="5.5" rx="1" />
                <rect x="9.5" y="9.5" width="5.5" height="5.5" rx="1" />
              </svg>
              Your boards
            </h3>
            <BoardsSkeleton />
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        {error && <div className={styles.error}>{error}</div>}

        {boards.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIllustration}>
              <div className={styles.emptyCard} />
              <div className={styles.emptyCard} />
              <div className={styles.emptyCard} />
            </div>
            <h2 className={styles.emptyTitle}>No boards yet</h2>
            <p className={styles.emptyText}>
              Create your first board to get started
            </p>
            <button
              className={styles.emptyBtn}
              onClick={() => setModalOpen(true)}
              type="button"
            >
              Create Board
            </button>
          </div>
        ) : (
          <>
            {starredBoards.length > 0 && (
              <section className={styles.section}>
                <h3 className={styles.sectionHeader}>
                  <svg className={styles.sectionIcon} viewBox="0 0 16 16"
                    fill="#F2D600">
                    <path d="M8 1.5l1.854 3.956L14 6.086l-3 3.073L11.708 14 8 12.028 4.292 14 5 9.159l-3-3.073 4.146-.63L8 1.5z" />
                  </svg>
                  Starred boards
                </h3>
                <div className={styles.grid}>
                  {starredBoards.map((board) => (
                    <BoardCard
                      key={board._id}
                      board={board}
                      isStarred
                      onToggleStar={handleToggleStar}
                    />
                  ))}
                </div>
              </section>
            )}

            <section className={styles.section}>
              <h3 className={styles.sectionHeader}>
                <svg className={styles.sectionIcon} viewBox="0 0 16 16"
                  fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="1" width="5.5" height="5.5" rx="1" />
                  <rect x="9.5" y="1" width="5.5" height="5.5" rx="1" />
                  <rect x="1" y="9.5" width="5.5" height="5.5" rx="1" />
                  <rect x="9.5" y="9.5" width="5.5" height="5.5" rx="1" />
                </svg>
                Your boards
              </h3>
              <div className={styles.grid}>
                {boards.map((board) => (
                  <BoardCard
                    key={board._id}
                    board={board}
                    isStarred={board.starred.includes(user?._id)}
                    onToggleStar={handleToggleStar}
                  />
                ))}
                <button
                  className={styles.createCard}
                  onClick={() => setModalOpen(true)}
                  type="button"
                >
                  <svg className={styles.createIcon} viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="1.5"
                    strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span>Create new board</span>
                </button>
              </div>
            </section>
          </>
        )}
      </div>

      <CreateBoardModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
    </>
  );
}

export default Boards;

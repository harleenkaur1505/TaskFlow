import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { BoardProvider } from '../../context/BoardContext';
import useBoard from '../../hooks/useBoard';
import useSocket from '../../hooks/useSocket';
import Navbar from '../../components/layout/Navbar';
import List from '../../components/board/List';
import AddList from '../../components/board/AddList';
import BoardHeader from '../../components/board/BoardHeader';
import CardModal from '../../components/card/CardModal';
import ActivitySidebar from '../../components/board/ActivitySidebar';
import { BoardSkeleton } from '../../components/ui/Skeleton';
import styles from './Board.module.css';

function BoardContent() {
  const { boardId, cardId } = useParams();
  const navigate = useNavigate();
  const [showActivity, setShowActivity] = useState(false);
  const {
    board,
    lists,
    isLoading,
    fetchBoard,
    reorderLists,
    reorderCards,
    moveCard,
  } = useBoard();

  // Join socket room for real-time updates
  useSocket(boardId);

  useEffect(() => {
    fetchBoard(boardId).catch(() => {
      navigate('/boards');
    });
  }, [boardId, fetchBoard, navigate]);

  const handleDragEnd = useCallback((result) => {
    const { destination, source, type, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Dragging lists horizontally
    if (type === 'LIST') {
      const reordered = Array.from(lists);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      reorderLists(boardId, reordered);
      return;
    }

    // Dragging cards
    if (type === 'CARD') {
      const sourceListId = source.droppableId;
      const destListId = destination.droppableId;
      const sourceList = lists.find((l) => l._id === sourceListId);
      const destList = lists.find((l) => l._id === destListId);

      if (!sourceList || !destList) return;

      // Same list reorder
      if (sourceListId === destListId) {
        const reordered = Array.from(sourceList.cards || []);
        const [moved] = reordered.splice(source.index, 1);
        reordered.splice(destination.index, 0, moved);
        reorderCards(boardId, sourceListId, reordered);
        return;
      }

      // Cross-list move
      const sourceCards = Array.from(sourceList.cards || []);
      const destCards = Array.from(destList.cards || []);
      const [movedCard] = sourceCards.splice(source.index, 1);
      destCards.splice(destination.index, 0, movedCard);

      moveCard(
        boardId,
        sourceListId,
        destListId,
        sourceCards,
        destCards,
        draggableId,
        destination.index,
      );
    }
  }, [lists, boardId, reorderLists, reorderCards, moveCard]);

  if (isLoading) {
    return (
      <div className={styles.page} style={{ backgroundColor: '#0079BF' }}>
        <Navbar />
        <BoardSkeleton />
      </div>
    );
  }

  if (!board) return null;

  const bgStyle = { backgroundColor: board.background || '#0079BF' };

  return (
    <div className={styles.page} style={bgStyle}>
      <Navbar />
      <BoardHeader
        onToggleActivity={() => setShowActivity((prev) => !prev)}
        activityOpen={showActivity}
      />
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="board" direction="horizontal" type="LIST">
          {(provided) => (
            <div
              className={styles.listsContainer}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {lists.map((list, index) => (
                <Draggable
                  key={list._id}
                  draggableId={list._id}
                  index={index}
                >
                  {(dragProvided, snapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      className={styles.listWrapper}
                      style={{
                        ...dragProvided.draggableProps.style,
                        opacity: snapshot.isDragging ? 0.9 : 1,
                      }}
                    >
                      <List
                        list={list}
                        dragHandleProps={dragProvided.dragHandleProps}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              <AddList />
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {cardId && <CardModal />}
      {showActivity && (
        <ActivitySidebar
          boardId={boardId}
          onClose={() => setShowActivity(false)}
        />
      )}
    </div>
  );
}

function Board() {
  return (
    <BoardProvider>
      <BoardContent />
    </BoardProvider>
  );
}

export default Board;

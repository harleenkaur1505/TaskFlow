import { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { BoardProvider } from '../../context/BoardContext';
import useBoard from '../../hooks/useBoard';
import Navbar from '../../components/layout/Navbar';
import List from '../../components/board/List';
import AddList from '../../components/board/AddList';
import BoardHeader from '../../components/board/BoardHeader';
import Spinner from '../../components/ui/Spinner';
import styles from './Board.module.css';

function BoardContent() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const {
    board,
    lists,
    isLoading,
    fetchBoard,
    reorderLists,
  } = useBoard();

  useEffect(() => {
    fetchBoard(boardId).catch(() => {
      navigate('/boards');
    });
  }, [boardId, fetchBoard, navigate]);

  const handleDragEnd = useCallback((result) => {
    const { destination, source, type } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === 'LIST') {
      const reordered = Array.from(lists);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      reorderLists(boardId, reordered);
    }
  }, [lists, boardId, reorderLists]);

  if (isLoading) {
    return (
      <div className={styles.loadingWrapper}>
        <Spinner size={40} />
      </div>
    );
  }

  if (!board) return null;

  const bgStyle = { backgroundColor: board.background || '#0079BF' };

  return (
    <div className={styles.page} style={bgStyle}>
      <Navbar />
      <BoardHeader />
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

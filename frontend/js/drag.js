let draggingFromBoardId = null;

const initializeDraggingFeatures = signalDebouncer(function (controller) {
    const todoDropContainers = document.querySelectorAll('.todo-drop-container')
    const todoDraggableElements = document.querySelectorAll('.todo-draggable')
    const deleteDropZone = document.getElementById('delete-drop-zone')

    todoDraggableElements.forEach(draggable => {
        draggable.addEventListener('dragstart', () => {
            draggable.classList.add('dragging')
            draggingFromBoardId = draggable.parentElement.parentElement.getAttribute('id').replace('board-', '')
        }, {
            signal: controller.signal
        })
        draggable.addEventListener('dragend', () => {
            draggable.classList.remove('dragging')
        }, {
            signal: controller.signal,
        })
    })

    todoDropContainers.forEach(container => {
        container.addEventListener('dragover', evt => {
            evt.preventDefault()
            const draggable = document.querySelector('.dragging')
            const lastElement = getDragAfterElement(container, evt.clientY);
            if (!lastElement) {
                container.appendChild(draggable)
            } else {
                container.insertBefore(draggable, lastElement);
            }
        }, {
            signal: controller.signal
        })

        container.addEventListener('dragleave', evt=> {
            evt.preventDefault()
            console.log('leadfasd')
        })

        container.addEventListener('drop', evt => {
            evt.preventDefault();
            const draggable = document.querySelector('.dragging')
            const todoId = draggable.getAttribute('id').replace('todo-', '');
            const boardId = container.parentElement.getAttribute('id').replace('board-', '')
            updateTodoBoardId(todoId, boardId); // updates the todo previours boardId to new board Id; 
            const newBoardTotalTodoNoSpan = document.getElementById(`board-${boardId}`).querySelector('div div div .tasks-counter');
            const prevBoardTotalTodoNoSpan = document.getElementById(`board-${draggingFromBoardId}`).querySelector('div div div .tasks-counter');
            newBoardTotalTodoNoSpan.textContent = Number(newBoardTotalTodoNoSpan.textContent) + 1 // updating the total number of todos in a board.
            prevBoardTotalTodoNoSpan.textContent = Number(prevBoardTotalTodoNoSpan.textContent) - 1 // updating the total number of todos in a board.
        }, {
            signal: controller.signal
        })
    })

    deleteDropZone.addEventListener('dragover', evt => {
        evt.preventDefault()
        const draggable = document.querySelector('.dragging');
        deleteDropZone.appendChild(draggable);
    }, {
        signal: controller.signal
    })

    deleteDropZone.addEventListener('drop', evt => {
        evt.preventDefault();
        console.log('dropping')
        const draggable = document.querySelector('.dragging');
        const todoId = draggable.getAttribute('id').replace('todo-', '')
        deleteTodo(todoId)
    }, {
        signal: controller.signal
    })

    window.addEventListener("dragstart", () => {
        deleteDropZone.setAttribute("data-visible", "true")
    }, {
        signal: controller.signal
    })

    window.addEventListener("dragend", () => {
        deleteDropZone.setAttribute("data-visible", "false")
    }, {
        signal: controller.signal
    })
}, 1000);


function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.todo-draggable:not(.dragging)')]
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2
        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child }
        } else {
            return closest
        }
    }, {
        offset: Number.NEGATIVE_INFINITY
    }).element
}
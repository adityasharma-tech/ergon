const form = document.querySelector("#board-creator")
const cardNameInput = form.querySelector("div input[name='name']")
const addTaskForm = document.querySelector("#new-task-dialog form");
let boardId = null;

cardNameInput.addEventListener("input", evt => {
  if (evt.target.value.length >= 2) form.querySelector("div button[type='submit']").removeAttribute("disabled");
  else form.querySelector("div button[type='submit']").setAttribute("disabled", "true")
})

form.addEventListener("submit", handleCreateCard)
addTaskForm.addEventListener("submit", handleAddTask)

function addBoardToDiv(id, name, desc, color) {
  const boards = document.getElementById("boards");
  boards.innerHTML += `<div id="board-${id}" draggable="false" class="w-[300px] first:ml-10 overflow-hidden overflow-y-auto relative flex flex-col mb-auto bg-[#fafafa] rounded-lg p-3">
<div class="flex w-full gap-y-1 flex-col">
<div class="flex justify-between">
<div class="flex items-center gap-x-2">
  <div
  ${color.startsWith('#') ? `style="border-color: ${color}; --tw-ring-color: ${color};"` : null}
    class="w-3 h-3 rounded-full ring border-2 border-${color}-600 ring-${color}-500"
  ></div>
  <span class="text-sm text-neutral-900">${sanitize(name)}</span>
  <span
    class="text-[10px] tasks-counter bg-white px-1 rounded-lg border border-gray-300 text-center"
    >0</span
  >
</div>
<button onclick="openBoardMenu('${id}')" class="hover:bg-neutral-100 rounded-md">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="size-5"
    color="#000000"
    fill="none"
  >
    <path
      d="M11.9959 12H12.0049"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M17.9998 12H18.0088"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M5.99981 12H6.00879"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</button>
</div>
<p class="text-xs text-neutral-400">
${sanitize(desc)}
</p>
</div>
<div class="py-5 tasks min-h-[100px] flex flex-col gap-y-3 todo-drop-container h-full">

</div>
<div class="mt-auto">
<button onclick="showTaskDialog('${id}')" class="inline-flex items-center px-2 py-1 gap-x-2 text-gray-600 hover:bg-neutral-100 rounded-lg">
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  class="size-4"
  fill="none"
>
  <path
    d="M12 4V20M20 12H4"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
New task
</button>
</div>
</div>`
}

function addTaskToDiv(id, boardId, priority, title, desc, updatedAt) {
  console.log('task added to div ', boardId)
  const board = document.getElementById(`board-${boardId}`)
  const dropper = board.querySelector('.tasks');
  dropper.innerHTML += `
    <div id="todo-${id}" draggable="true"
        class="todo-draggable task px-2 py-2 relative bg-white border border-gray-300 shadow-xs w-full rounded-lg hover:border-blue-400 hover:bg-blue-100/50 cursor-grab"
      >
      <span class="absolute top-1 right-1 text-[10px] text-gray-400"> ${timeAgo(updatedAt)} </span>
        <div
          class="bg-neutral-100 inline-flex items-center px-1 text-xs rounded-md gap-x-1"
        >
          <svg
            class="size-3"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.0983 3.24076C8.49627 1.40591 5.58549 2.46876 4.09436 3.62736C3.87777 3.79513 3.60744 4.00454 3.4284 4.3704C3.24819 4.73864 3.24921 5.09828 3.25013 5.42129L3.25 20.7505C3.25 21.3028 3.69772 21.7505 4.25 21.7505C4.80229 21.7505 5.25 21.3028 5.25 20.7505L5.25 14.9583C5.25 14.7996 5.25 14.7202 5.28978 14.6509C5.32955 14.5815 5.39264 14.5446 5.51882 14.4708C6.73777 13.758 8.8104 13.2493 11.4174 14.5773C15.1323 16.4697 18.3455 15.704 19.9297 14.838C20.0869 14.7538 20.3963 14.5879 20.5754 14.2858C20.7559 13.9815 20.7522 13.5956 20.7503 13.4013L20.7503 5.83419C20.7503 5.45456 20.7503 5.10916 20.7212 4.84205C20.695 4.60284 20.6267 4.1657 20.2569 3.88447C20.0487 3.72616 19.8203 3.68039 19.6469 3.67004C19.4763 3.65985 19.305 3.68077 19.1532 3.70766C18.862 3.75922 18.4501 3.87345 18.0201 3.99272C16.603 4.38564 14.5003 4.46434 12.0983 3.24076Z"
              fill="${priority == '-1' ? '#1ab970' : priority == '0' ? '#f29008' : '#ee4735'}"
            />
          </svg>
          <span>${priority == '-1' ? 'low' : priority == '0' ? 'medium' : priority == '1' ? 'high' : `Priority - ${sanitize(priority)}`}</span>
        </div>
        <div class="flex flex-col py-1 gap-y-1">
          <span class="font-medium">${sanitize(title)}</span>
          <span class="text-xs text-gray-700">
            ${sanitize(desc)}
          </span>
        </div>
      </div>
  `
}

function handleListCards() {
  const tx = db.transaction("boards", "readonly");
  const store = tx.objectStore("boards")
  const index = store.index("projectId")
  /* this also do the same thing;
  const singleKeyRange = IDBKeyRange.only((new URLSearchParams(window.location.search)).get("pid"));
  const boards = [];
  index.openCursor(singleKeyRange).addEventListener("success", evt => {
    const cursor = evt.target.result;
    if (cursor) {
      boards.push({ id: cursor.value.id, name: cursor.value.name, desc: cursor.value.desc, color: cursor.value.color })
      cursor.continue();
    }
  })
  */
  index.getAll((new URLSearchParams(window.location.search)).get("pid")).addEventListener("success", evt => {
    evt.target.result.forEach((board) => {
      addBoardToDiv(board.id, board.name, board.desc, board.color);
      handleListTasks(board.id);
    })
  })
}

function handleListTasks(boardId) {
  const projectId = (new URLSearchParams(window.location.search)).get("pid")
  if (!projectId || projectId.trim() == "" || !boardId) throw new Error("Couldn't get projectId or boardId!");
  const tx = db.transaction("tasks", "readonly");
  const store = tx.objectStore("tasks");
  const index = store.index("dataId");
  const result = index.getAll([projectId, String(boardId)]);
  result.addEventListener("success", evt => {
    document.getElementById(`board-${boardId}`).querySelector('.tasks').innerHTML = '';
    evt.target.result.forEach(element => {
      addTaskToDiv(String(element.id), String(boardId), element.priority, element.title, element.desc, element.updatedAt);
    })
    document.getElementById(`board-${boardId}`).querySelector('div div div .tasks-counter').textContent = String(evt.target.result.length)
    // controller.abort() 
    initializeDraggingFeatures()
  })
}

function handleCreateCard(evt) {
  evt.preventDefault();
  if (!db) throw new Error("indexDb not initialized not yet!");
  const params = new URLSearchParams(window.location.search)
  const tx = db.transaction("boards", "readwrite");
  const store = tx.objectStore("boards");
  const data = {
    name: form.querySelector(`div input[name='name']`).value,
    desc: form.querySelector(`div textarea[name='desc']`).value,
    color: form.querySelector(`div .color-selector div button[aria-selected='true']`).getAttribute('data-value'),
    projectId: params.get("pid"),
    updatedAt: Date.now()
  }
  const result = store.add(data);
  result.addEventListener("success", evt => {
    addBoardToDiv(evt.target.result, data.name, data.desc, data.color);
    form.querySelector(`div input[name='name']`).value = ''
    form.querySelector(`div textarea[name='desc']`).value = ''
  })
}

function handleSetTitle() {
  const params = new URLSearchParams(window.location.search)
  const tx = db.transaction("projects", "readonly");
  const store = tx.objectStore("projects");
  store.get(params.get("pid")).addEventListener("success", evt => {
    document.getElementById("project-name").textContent = evt.target.result.name
  })
}

function handleAddTask(evt) {
  evt.preventDefault();
  if (!boardId) throw new Error("Can't get board id.");
  const tx = db.transaction("tasks", "readwrite");
  const store = tx.objectStore("tasks");

  const data = {
    boardId,
    projectId: (new URLSearchParams(window.location.search)).get("pid"),
    priority: addTaskForm.querySelector(`.priority-selector div button[aria-selected='true']`).getAttribute('data-value'),
    title: addTaskForm.querySelector('div input[name="name"]').value,
    desc: addTaskForm.querySelector('div textarea[name="desc"]').value,
    updatedAt: Date.now()
  }

  const result = store.add(data)
  result.addEventListener("success", evt => {
    handleListTasks(data.boardId)
    addTaskForm.reset();
  })


  closeTaskDialog();
}

function openBoardMenu(id) {
  const board = document.getElementById(`board-${id}`)
  if (!board) throw new Error("Specified board not found.");

  board.innerHTML += `
    <span role='button' tabindex='0' onclick="closeBoardMenu('${id}')" class='absolute z-20 bg-black/10 inset-0 backdrop'></span>
    <div class='absolute z-30 top-3 right-3 px-1 py-1 menu bg-white rounded-lg'>
        <button onclick="deleteBoard('${id}')" class="hover:bg-neutral-100 flex rounded-md items-center gap-x-2 px-1 py-1">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class='size-4 text-red-500' fill="none">
    <path d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    <path d="M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71729 2.41317C9.32164 2.7167 9.10063 3.20155 8.65861 4.17126L8.05292 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    <path d="M9.5 16.5L9.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    <path d="M14.5 16.5L14.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
</svg>
  <span class="text-xs text-red-500">Delete</span>
</button>
    </div>
    `
}

function closeBoardMenu(id) {
  const board = document.getElementById(`board-${id}`);
  board.querySelector('.backdrop').outerHTML = ''
  board.querySelector('.menu').outerHTML = ''
}

function showTaskDialog(id) {
  boardId = id;
  document.getElementById("new-task-dialog").removeAttribute("hidden");
}

function closeTaskDialog() {
  document.getElementById("new-task-dialog").setAttribute("hidden", "true");
}

function setSelectedColor(color) {
  const colorSelectorDiv = form.querySelector('div .color-selector div')
  colorSelectorDiv.querySelectorAll('button').forEach(element => {
    element.setAttribute("aria-selected", "false");
  })
  colorSelectorDiv.querySelector(`button[data-value='${color}']`).setAttribute("aria-selected", "true");
}

function setSelectedPriority(value) {
  const prioritySelectorDiv = addTaskForm.querySelector('div .priority-selector div')
  prioritySelectorDiv.querySelectorAll('button').forEach(element => {
    element.setAttribute("aria-selected", "false");
  })
  prioritySelectorDiv.querySelector(`button[data-value='${value}']`).setAttribute("aria-selected", "true");
}

function deleteBoard(id) {
  const tx = db.transaction('boards', 'readwrite');
  const store = tx.objectStore('boards')
  store.delete(Number(id)).addEventListener("success", () => {
    document.getElementById(`board-${id}`).outerHTML = ''
  })
}

const deleteTodo = throttling(function (todoId) {
  if (!todoId) throw new Error("Couldn't get boardId or todoId");

  const tx = db.transaction('tasks', 'readwrite');
  const store = tx.objectStore('tasks');
  store.delete(Number(todoId));
}, 200)

const updateTodoBoardId = throttling(function (todoId, boardId) {
  if (!todoId || !boardId) throw new Error('todoId or boardId not found.');
  console.log('todoid', Number(todoId), boardId)
  const tx = db.transaction('tasks', 'readwrite');
  const store = tx.objectStore('tasks');
  store.get(Number(todoId)).addEventListener('success', evt => {
    const data = evt.target.result
    data.boardId = boardId;
    store.put(data);
  })
})

function onDbInitialized() {
  handleSetTitle();
  handleListCards();
}
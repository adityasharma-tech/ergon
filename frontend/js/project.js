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

function addBoardToDiv(id, name, desc, color){
    const boards = document.getElementById("boards")
    boards.innerHTML += `<div id="${id}" draggable="false" class="w-[300px] first:ml-10 overflow-hidden overflow-y-scroll min-h-[200px] relative flex flex-col mb-auto bg-[#fafafa] rounded-lg p-3">
<div class="flex w-full gap-y-1 flex-col">
<div class="flex justify-between">
<div class="flex items-center gap-x-2">
  <div
  ${color.startsWith('#') ? `style="border-color: ${color}; --tw-ring-color: ${color};"` : null}
    class="w-3 h-3 rounded-full ring border-2 border-${color}-600 ring-${color}-500"
  ></div>
  <span class="text-sm text-neutral-900">${name}</span>
  <span
    class="text-[10px] bg-white px-1 rounded-lg border border-gray-300 text-center"
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
${desc}
</p>
</div>
<div class="py-5 tasks">

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

function addTaskToDiv(){

}

function handleListCards() {
    const tx = db.transaction("boards", "readonly");
    const store = tx.objectStore("boards")
    const index = store.index("projectId")
    console.log((new URLSearchParams(window.location.search)).get("pid"))
    const singleKeyRange = IDBKeyRange.only((new URLSearchParams(window.location.search)).get("pid"));
    index.openCursor(singleKeyRange).addEventListener("success", evt => {
        const cursor = evt.target.result;
        if (cursor) {
            addBoardToDiv(cursor.value.id, cursor.value.name, cursor.value.desc, cursor.value.color)
            cursor.continue();
        }
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
        console.log("Success", evt)
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

function handleAddTask(){
  if(!boardId) throw new Error("Can't get board id.");

}

function openBoardMenu(id){
    const board = document.getElementById(id)
    if(!board) throw new Error("Specified board not found.");

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

function closeBoardMenu(id){
    const board = document.getElementById(id);
    board.querySelector('.backdrop').outerHTML = ''
    board.querySelector('.menu').outerHTML = ''
}

function showTaskDialog(id){
    boardId = id;
    document.getElementById("new-task-dialog").removeAttribute("hidden");
}

function closeTaskDialog(){
    document.getElementById("new-task-dialog").setAttribute("hidden", "true");
}

function setSelectedColor(color){
  const colorSelectorDiv = form.querySelector('div .color-selector div')
  colorSelectorDiv.querySelectorAll('button').forEach(element=>{
    element.setAttribute("aria-selected", "false");
  })
  colorSelectorDiv.querySelector(`button[data-value='${color}']`).setAttribute("aria-selected", "true");
}

function deleteBoard(id){
    const tx = db.transaction('boards', 'readwrite');
    const store = tx.objectStore('boards')
    store.delete(Number(id)).addEventListener("success", ()=>{
        document.getElementById(id).outerHTML = ''
    })
}

function onDbInitialized() {
    handleSetTitle();
    handleListCards();
}
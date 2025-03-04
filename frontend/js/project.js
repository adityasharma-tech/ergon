const form = document.querySelector("form")
const cardNameInput = form.querySelector("div input[name='name']")

cardNameInput.addEventListener("input", evt => {
    if (evt.target.value.length >= 2) form.querySelector("div button[type='submit']").removeAttribute("disabled"); 
    else form.querySelector("div button[type='submit']").setAttribute("disabled", "true")
})

form.addEventListener("submit", handleCreateCard)


function handleListCards() {
    const tx = db.transaction("projects", "readonly");
    const result = tx.objectStore("projects").getAll()
    result.addEventListener("success", evt=>{
        const data = evt.target.result;
        data.forEach(element => {
            
        });
    })
}


function handleCreateCard(evt) {
    evt.preventDefault();
    if (!db) throw new Error("indexDb not initialized not yet!");
    const params = new URLSearchParams(window.location.search)
    const tx = db.transaction("cards", "readwrite");
    const store = tx.objectStore("cards");
    store.add({
        id: crypto.randomUUID(),
        name: form.querySelector(`div input[name='name']`).value,
        desc: form.querySelector(`div textarea[name='desc']`).value,
        color: form.querySelector(`div div input[name='color']`).value,
        projectId: params.get("pid"),
        updatedAt: Date.now()
    }).addEventListener("success", evt=>{
        console.log("Success")
    })
}


function handleSetTitle(){
    const params = new URLSearchParams(window.location.search)
    const tx = db.transaction("projects", "readonly");
    const store = tx.objectStore("projects");
    store.get(params.get("pid")).addEventListener("success", evt=>{
        document.getElementById("project-name").textContent = evt.target.result.name
    })
}

function onDbInitialized() {
    handleSetTitle();
    handleListCards();
}
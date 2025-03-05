const DB_NAME = "NewErgonDB"
const DB_VERSION = 3

let db;

if (!window.indexedDB) throw new Error("Please upgrade your internet explorer.")

const request = window.indexedDB.open(DB_NAME, DB_VERSION);

request.addEventListener("upgradeneeded", evt => {
    const db = evt.target.result;

    db.createObjectStore("projects", { keyPath: "id", autoIncrement: true }).createIndex("name", "name", { unique: false });
    db.createObjectStore("boards", { keyPath: "id", autoIncrement: true }).createIndex("projectId", "projectId", { unique: false });
    db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true }).createIndex("boardId", "boardId", { unique: false });
})

request.addEventListener("success", evt => {
    db = evt.target.result;
    onDbInitialized()

    db.addEventListener("error", (evt) => {
        console.error(`Database error: ${evt.target.error?.message}`);
    })
})

request.addEventListener("error", evt=>{
    console.log("SOme error occured")
})
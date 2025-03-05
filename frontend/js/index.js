const dialog = document.getElementById("new-project-dialog")
const closeBtn = dialog.querySelector("form button[type='button']")

closeBtn.addEventListener("click", toogleNewProjectDialog)

function toogleNewProjectDialog() {
    if (dialog.hasAttribute("hidden"))
        dialog.removeAttribute("hidden")
    else dialog.setAttribute("hidden", "true")
}

function handleCreateProject() {
    if (!db) throw new Error("indexDb not initialized not yet!");

    const tx = db.transaction("projects", "readwrite");
    const store = tx.objectStore("projects");
    store.add({
        id: crypto.randomUUID(),
        name: dialog.querySelector(`form div input[name='name']`).value,
        desc: dialog.querySelector(`form div textarea[name='desc']`).value,
        updatedAt: Date.now()
    });

    toogleNewProjectDialog();
}

function handleListProjects() {
    const tx = db.transaction(['projects'], "readonly");
    const projectStore = tx.objectStore("projects")
    projectStore.getAll().addEventListener("success", evt => {
        const result = evt.target.result;
        const projectsContainer = document.getElementById("projects-list");
        projectsContainer.innerHTML = '';
        if (result.length > 0)
            result.forEach(element => {
                projectsContainer.innerHTML +=
                    `<div
            id="project-${element.id}"
            class="project first:mt-0 mt-3"
            style="position: relative"
          >
          <div 
          tabindex="0"
            role="button"
            onclick="handleOpenProject('${element.id}')">
            <h4>${sanitize(element.name)}</h4>
            <p style="color: #797d7f; font-size: small">
              ${sanitize(element.desc)}
            </p>
            <ul hidden>
              <li>something here</li>
            </ul>
            <span class="text-neutral-500 -mr-6" style="margin-left: auto; font-size: 12px"
              >modified ${timeAgo(element.updatedAt)}</span
            >
            </div>
            <button onclick="deleteProject('${element.id}')" class="hover:bg-rose-50 px-5 z-10 rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                color="#000000"
                fill="none"
              >
                <path
                  d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <path
                  d="M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71729 2.41317C9.32164 2.7167 9.10063 3.20155 8.65861 4.17126L8.05292 5.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <path
                  d="M9.5 16.5L9.5 10.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <path
                  d="M14.5 16.5L14.5 10.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>`;
            });
        else {
            projectsContainer.innerHTML = `<div class="absolute inset-0 flex items-center text-neutral-500 justify-center"><span>No projects found!</span></div>`
        }
    })
}

function handleOpenProject(projectId){
    window.location.replace(`/frontend/project.html?pid=${projectId}`)
}

function deleteProject(projectId) {
    if (!db) throw new Error("indexDb not initialized yet!");
    const tx = db.transaction(["projects"], "readwrite");
    const store = tx.objectStore("projects");
    store.delete(projectId).addEventListener("success", () => {
        window.location.reload();
    })
}


function onDbInitialized(){
  handleListProjects()
}

setInterval(handleListProjects, 1000 * 60)
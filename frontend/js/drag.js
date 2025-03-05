document.addEventListener("dragstart", ev=>{
    document.getElementById("delete-zone").setAttribute("data-visible", "true")
})

document.addEventListener("dragend", ev=>{
    document.getElementById("delete-zone").setAttribute("data-visible", "false")
})

function handleTaskDrag(evt){
    evt.preventDefault();
    evt.dataTransfer.clearData();
    evt.dataTransfer.setData("text/plain", "someid")
}
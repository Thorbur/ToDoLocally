/* Function to show or hide new task form */
let showNewForm = function (stage, edit) {
    let addNewForm = document.getElementById("addNew");
    let stageDisplay = document.getElementById("stage-display");
    stageDisplay.innerText = stage;
    if (addNewForm.classList.contains("hidden")) {
        addNewForm.classList.remove('hidden');
    }

    // hide delete button for new tasks / no key
    if(!edit){
        document.getElementById("delete-button").style.display="none";
    } else {
        document.getElementById("delete-button").style.display="block";
    }
    resetForm();
};

function hideNewForm() {
    let addnewform = document.getElementById("addNew");
    if (!addnewform.classList.contains("hidden")) {
        addnewform.classList.add('hidden');
    }
}

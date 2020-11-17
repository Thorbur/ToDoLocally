let idb, dbobject;

/* Functions */
let addNewHandler, addCheckbox, buildTask, displayTasks, editHandler, hideHandler, init, searchHandler, sort,
    updateStatus, deleteHandler, errorHandler, timestamp;

utils.loadShim();

/* Elements */
let search = document.getElementById('search-button');
let addNew = document.getElementById('addNew');
let savebtn = document.getElementById('save-button');
let currenttasksbox = document.getElementById('current-tasks');
let ongoingtasksbox = document.getElementById('ongoing-tasks');
let backlogtasksbox = document.getElementById('backlog-tasks');
let deletebtn = document.getElementById('delete-button');
let backbtn = document.getElementById("back-button");

/* Global variables */
let displayMode = "normal";

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev, el) {
    ev.preventDefault();
    let data = ev.dataTransfer.getData("text");
    el.appendChild(document.getElementById(data));
    let key = parseInt(data.replace("task-", ""));
    let transaction, objectstore, index, request;
    transaction = dbobject.transaction(['tasks'], 'readwrite');
    objectstore = transaction.objectStore('tasks');

    index = objectstore.index('by_task');
    request = index.openCursor(IDBKeyRange.lowerBound(0), 'next');
    request.onerror = function (event) {
        console.log("Drop " + data + " failed! " + event);
    };

    request.onsuccess = function (successevent) {
        const cursor = request.result;
        if (cursor) {
            if (cursor.primaryKey === key) {
                let taskDataUpdate = cursor.value;
                taskDataUpdate.stage = el.id.replace("-tasks", "");

                const updaterequest = cursor.update(taskDataUpdate);
                updaterequest.onsuccess = function (e) {
                    console.log("Task " + key + " successfully updated.");
                }
                updaterequest.onerror = function (e) {
                    console.log("Update of task " + key + " failed!!");
                }
            }
            cursor.continue();
        }
    };
}


let taskareas = document.getElementsByClassName("task-area");
for (let el of taskareas) {
    el.addEventListener("drop", function (ev) {
        drop(ev, el)
    }, false);
    el.addEventListener("dragover", allowDrop, false);
}


function resetForm() {
    'use strict';
    const today = utils.yyyymmdd();
    window.location.hash = '';
    /*
    Reset add new form because some browsers like
    to hold on to that form data.
    */
    addNew.reset();

    /*
    Reset the key value, since reset() doesn't work on
    hidden fields
    */
    addNew.key.value = '';

    /* Set default start, due dates */
    //addNew.due.value = today;
}

/* Global error handler message */
errorHandler = function (errorevt) {
    console.error(errorevt.target.error.message);
    console.log('error');
    console.log(errorevt);
};

timestamp = function (datefield) {
    if (!isNaN(datefield.valueAsNumber)) {
        return datefield.valueAsNumber;
    } else {
        return new Date(datefield.value).getTime();
    }
};

/* 
Fired on page load. Creates the database and indexes if it
doesn't exist. Displays existing tasks if there are any.
*/
init = function () {
    'use strict';

    idb = indexedDB.open('IDBTaskList', 3);

    idb.onupgradeneeded = function (evt) {
        let tasks, transaction;

        dbobject = evt.target.result;

        if (evt.oldVersion < 1) {
            tasks = dbobject.createObjectStore('tasks', {autoIncrement: true});
            transaction = evt.target.transaction.objectStore('tasks');
            transaction.createIndex('by_task', 'task');
            transaction.createIndex('priority', 'priority');
            transaction.createIndex('status', 'status');
            transaction.createIndex('due', 'due');
            transaction.createIndex('resolved', 'resolved');
            transaction.createIndex('stage', 'stage');
            transaction.createIndex('display', 'display');
        }
    };

    idb.onsuccess = function (event) {
        if (dbobject === undefined) {
            dbobject = event.target.result;
        }
        displayTasks(dbobject);
    };
};

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

/* Retrieves and displays the list of tasks */
displayTasks = function (database) {
    'use strict';

    let transaction, objectstore, index, request, docfrag = document.createDocumentFragment();
    removeAllChildNodes(currenttasksbox);
    removeAllChildNodes(ongoingtasksbox);
    removeAllChildNodes(backlogtasksbox);

    transaction = dbobject.transaction(['tasks'], 'readonly');
    objectstore = transaction.objectStore('tasks');

    /* Search the by_task index since it's already sorted alphabetically */
    index = objectstore.index('by_task');
    request = index.openCursor(IDBKeyRange.lowerBound(0), 'next');

    request.onsuccess = function (successevent) {
        let cursor, task, stage = 'backlog';
        cursor = request.result;
        if (cursor) {
            stage = cursor.value.stage;
            task = buildTask(cursor);
            docfrag.appendChild(task);
            cursor.continue();
        }

        if (docfrag.childNodes.length) {
            if (stage === 'current') {
                currenttasksbox.appendChild(docfrag);
            } else if (stage === 'ongoing') {
                ongoingtasksbox.appendChild(docfrag);
            } else {
                backlogtasksbox.appendChild(docfrag);
            }
        }
    };
};

buildTask = function (recordobject) {
    'use strict';
    let div, status, record, p;
    div = document.createElement('div');
    div.setAttribute('class', 'task');
    div.setAttribute('id', 'task-' + recordobject.primaryKey);

    record = recordobject.value;
    record.primaryKey = recordobject.primaryKey;

    if (record.due && record.due < Date.now() && record.status === "open") {
        div.classList.add("overdue");
    }

    if (record) {
        // status
        status = addCheckbox(recordobject.primaryKey, record.status === "done");
        div.appendChild(status);

        // task
        p = document.createElement('p');
        p.setAttribute('data-recordid', record.primaryKey);
        p.setAttribute('class', 'task-title');
        p.classList.add("dont-break-out");
        p.innerText = record.task;
        div.appendChild(p);

        // edit button
        let editButton = document.createElement("button");
        editButton.innerText = "E";
        editButton.setAttribute("class", "edit-button");
        editButton.addEventListener('click', function () {
            editHandler(record.primaryKey);
        });
        div.appendChild(editButton);

        // priority
        p = document.createElement('p');
        p.setAttribute('class', 'task-priority');
        p.innerText = mapPriority(record.priority);
        div.appendChild(p);

        // hide button
        let hideButton = document.createElement("button");
        hideButton.innerText = "H";
        hideButton.setAttribute("class", "hide-button");
        hideButton.addEventListener('click', function () {
            hideHandler(record.primaryKey);
        });
        div.appendChild(hideButton);

        // due date
        p = document.createElement('p');
        p.setAttribute('class', 'task-due');
        if(record.due) {
            p.innerText = new Date(record.due).toDateString();
        } else {
            p.innerText = "No due date";
        }
        div.appendChild(p);

        // display or hidden
        if (!record.display) {
            div.classList.add("hidden");
        }

        // add drag event handlers
        div.setAttribute("draggable", "true");
        div.addEventListener("dragstart", drag, false);

        return div;
    }
};

addCheckbox = function (id, checked) {
    'use strict';
    let status = document.createElement('input');
    status.type = 'checkbox';
    status.id = id;
    status.checked = checked;
    status.setAttribute('class', 'task-status');
    status.addEventListener("change", updateStatus);
    return status;
};

addNewHandler = function (evt) {
    'use strict';
    evt.preventDefault();

    let entry = {}, transaction, objectstore, request, fields = document.getElementById('addNew'), results;

    /* Build our task object */
    entry.task = fields.task.value;

    /* If there's a date, save as time stamps instead of date strings. */
    entry.due = fields.due.value === '' ? null : timestamp(fields.due);

    /*  Convert to number */
    entry.priority = +fields.priority.value;
    entry.notes = fields.notes.value;
    entry.status = fields.status.checked ? "done" : "open";
    entry.stage = document.getElementById('stage-display').innerText;
    entry.resolved = null;
    if (fields.status.checked) {
        console.log("Resolved val:");
        console.log(+fields.resolved.value);
        if (fields.resolved.value) {
            entry.resolved = +fields.resolved.value;
        } else {
            entry.resolved = Date.now();
        }
    }
    entry.display = !fields.display.checked;
    console.log(entry);

    transaction = dbobject.transaction(['tasks'], 'readwrite');
    objectstore = transaction.objectStore('tasks');

    if (fields.key.value) {
        // Update existing task
        request = objectstore.put(entry, +fields.key.value);
    } else {
        // Add new task
        request = objectstore.add(entry);
    }
    /*
    Returns ID of last addition / update. Not necessary for
    this application. Here to show that it can be done.
    */
    request.onsuccess = function (evt) {
        results = request.result;
    };


    transaction.oncomplete = function (evt) {
        hideNewForm();
        if (displayMode === 'search') {
            searchHandler();
        } else {
            displayTasks(dbobject);
        }
        resetForm();
    };

    transaction.onerror = errorHandler;
};

updateStatus = function (evt) {
    'use strict';
    if (evt.target.nodeName === 'INPUT') {

        let transaction, objectstore, request, key = +evt.target.id;

        transaction = dbobject.transaction(['tasks'], 'readwrite');
        objectstore = transaction.objectStore('tasks');

        request = objectstore.get(key);

        request.onsuccess = function (reqevt) {
            if (+evt.target.checked) {
                reqevt.target.result.status = "done";
                reqevt.target.result.resolved = +new Date();
            } else {
                reqevt.target.result.status = "open";
                reqevt.target.result.resolved = null;
            }
            objectstore.put(reqevt.target.result, key);
        };
    }
};

function mapPriority(priorityNumber){
    switch (priorityNumber){
        case 0: return "none";
        case 1: return "low";
        case 2: return "medium";
        case 3: return "high";
        default: return "none";
    }
}

function evaluateStatement(statement, record) {
    if(Array.isArray(statement)) {
        const left = evaluateStatement(statement[1], record);
        let right = evaluateStatement(statement[2], record);
        if(["due", "resolved"].includes(statement[1])){
            if(left === undefined || left === null || left === ""){
                /* Invalid due dates should not be found */
                return false;
            }
            /* has to be a date string in this case */
            right = Date.parse(statement[2]);
        } else if(statement[1] === "priority"){
            /* has to be a priority string in this case */
            right = right.toLowerCase();
        }
        switch (statement[0]) {
            case "=": return left === right;
            case "!=": return left !== right;
            case "~": return left.includes(right);
            case "<": return left < right;
            case ">": return left > right;
            case "and": return left && right;
            case "or": return left || right;
        }
    } else{
        switch(statement){
            case "due": return record.value.due;
            case "resolved": return record.value.resolved;
            case "id": return record.primaryKey;
            case "title": return record.value.task;
            case "notes": return record.value.notes;
            case "priority": return mapPriority(record.value.priority);
            case "stage": return record.value.stage;
            case "hidden": return !record.value.display;
            case "done": return (record.value.status !== "open");
            default: return statement;
        }
    }
    return false;
}

function isMatching(query, record) {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    if (!query) {
        /* empty query -> matches all */
        return true;
    }
    try {
        parser.feed(query);
        if(parser.results.length !== 1){
            console.log("Ambiguous search query");
            return false;
        } else {
            return evaluateStatement(parser.results[0], record);
        }
    } catch (err) {
        console.log("Invalid search query!");
    }
}

searchHandler = function () {
    'use strict';
    let transaction, objectstore, index, request, list, query, found = false,
        docfrag = document.createDocumentFragment();
    list = document.getElementById("list");
    query = document.getElementById("find").value;

    /* Change display mode */
    displayMode = 'search';

    /* Display back button */
    backbtn.classList.remove("hidden");

    transaction = dbobject.transaction(['tasks'], 'readonly');
    objectstore = transaction.objectStore('tasks');
    index = objectstore.index('by_task');
    request = index.openCursor(IDBKeyRange.lowerBound(0), 'next');

    /* Clear the list */
    list.innerHTML = '';

    request.onsuccess = function (successevent) {
        let cursor, task;
        cursor = request.result;

        if (cursor !== null) {
            if (isMatching(query, cursor)) {
                task = buildTask(cursor);
                docfrag.appendChild(task);
                found = true;
            } else {
                console.log("Task " + cursor.primaryKey + " does not match.");
            }
            cursor.continue();
        }
        list.appendChild(docfrag);
    };

    transaction.oncomplete = function () {
        if (!found) {
            let resultMessage = document.createElement("p");
            resultMessage.innerText = "No matching tasks have been found...";
            list.appendChild(resultMessage);
        } else {
            /* Make all hidden elements visible in the search results */
            let el;
            for (el of document.getElementsByClassName("task")) {
                el.classList.remove("hidden");
            }
        }
    };
};

editHandler = function (taskId) {
    'use strict';
    let transaction, objectstore, request;

    if (taskId) {
        transaction = dbobject.transaction(['tasks'], 'readonly');
        objectstore = transaction.objectStore('tasks');
        request = objectstore.get(taskId);

        request.onsuccess = function (successevent) {
            showNewForm(successevent.target.result.stage, true);
            addNew.status.checked = successevent.target.result.status === "done";
            addNew.resolved.value = successevent.target.result.resolved;
            addNew.display.checked = !successevent.target.result.display;

            addNew.key.value = taskId;
            addNew.task.value = successevent.target.result.task;

            successevent.target.result.due ? addNew.due.value =
                utils.yyyymmdd(new Date(successevent.target.result.due)) : addNew.due.value = '';

            addNew.priority.value = successevent.target.result.priority;
            addNew.notes.value = successevent.target.result.notes;
        };
    }
};

hideHandler = function (taskId) {
    'use strict';
    let transaction, objectstore, request;

    transaction = dbobject.transaction(['tasks'], 'readwrite');
    objectstore = transaction.objectStore('tasks');
    request = objectstore.get(taskId);

    request.onsuccess = function (successevent) {
        successevent.target.result.display = false;
        objectstore.put(successevent.target.result, taskId);

        let taskDiv = document.getElementById("task-" + taskId);
        taskDiv.setAttribute("class", "hidden");
    };
};

deleteHandler = function (evt) {
    'use strict';
    let transaction, objectstore, request, key;
    key = +document.getElementById('addNew').key.value;

    transaction = dbobject.transaction(['tasks'], 'readwrite');
    objectstore = transaction.objectStore('tasks');
    request = objectstore.delete(key);

    /* Don't need to define an onsuccess function */
    request.onsuccess = function (successevent) {
        console.log("Deleted task " + key);
    };

    transaction.oncomplete = function (evt) {
        hideNewForm();
        displayTasks(dbobject);
        resetForm();
    };
    transaction.onerror = errorHandler;
};

sort = function (evt) {
    // todo: can be deleted?
    'use strict';
    let which, dir, docfrag = document.createDocumentFragment(), index, transaction, objectstore, request;

    /* Clear table body */
    currenttasksbox.innerHTML = '';

    /* Remove 'active' class from THs */
    Array.prototype.map.call(document.querySelectorAll('#list th'), function (th) {
        th.classList.remove('active');
    });

    if (evt.target.nodeName === 'TH') {
        evt.target.classList.add('active');

        switch (evt.target.innerHTML) {
            case 'Priority':
                which = 'priority';
                break;
            case 'Due':
                which = 'due';
                break;
            case 'Complete':
                which = 'status';
                break;
            case 'Task':
                which = 'by_task';
                break;
        }

        evt.target.classList.toggle('asc');

        dir = evt.target.classList.contains('asc') ? 'next' : 'prev';

        transaction = dbobject.transaction(['tasks'], 'readwrite');
        objectstore = transaction.objectStore('tasks');
        index = objectstore.index(which);
        request = index.openCursor(IDBKeyRange.lowerBound(0), dir);

        /* Clear table body */
        currenttasksbox.innerHTML = '';

        request.onsuccess = function (successevent) {
            let cursor, task;
            cursor = request.result;

            if (cursor !== null) {
                task = buildTask(cursor);
                docfrag.appendChild(task);
                cursor.continue();
            }
            if (docfrag.childNodes.length) {
                currenttasksbox.appendChild(docfrag);
            }
        };
    }
};

deletebtn.addEventListener('click', deleteHandler);
search.addEventListener('click', searchHandler);
document.getElementById("find").addEventListener("keyup", function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.code === "Enter") {
        event.preventDefault();
        // Trigger the button element with a click
        search.click();
    }
});
savebtn.addEventListener('click', addNewHandler);
backbtn.addEventListener('click', function () {
    location.reload()
});
window.addEventListener('load', init);

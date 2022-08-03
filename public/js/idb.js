let db;
//makes connection to database
const request = indexedDB.open('budget-tracker', 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectScore('new_transaction', {autoIncrement: true});
};

request.onsuccess = function(event) {
    db = event.target.result;
    //sends cache if you are online
    if(navigator.online) {
        uploadTransaction();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};
//saves new transaction when offline
function saveRecord(rec) {
    const transaction = db.transaction(['new_transaction'], 'readWrite');
    const entryObjectStore = transaction.objectStore('new_transaction');
    entryObjectStore.add(record);
};

function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readWrite');
    const entryObjectStore = transaction.objectStore('new_transaction');
    const getAll = entryObjectStore.getAll();

    getAll.onsuccess = function() {
        if(getAll.result.length > 0) {
            fetch("/api/transaction", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    'Content-Type': 'applcation/json',
                }
            })
            .then((response) => response.json())
            .then((serverResponse) => {
                if(serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new_transaction'], "readwrite");
                const entryObjectStore = transaction.objectStore('new_transaction');
                entryObjectStore.clear();

            })
            .catch((err) => {console.log(err);});
        }
    };
}

window.addEventListener('online', uploadTransaction);
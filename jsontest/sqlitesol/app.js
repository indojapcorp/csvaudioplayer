let db1;

function initDatabase() {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.5.0/sql-wasm.js', true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = () => {
            const uInt8Array = new Uint8Array(xhr.response);
            const worker = new Worker('wasm-worker.js');

            worker.onmessage = (event) => {
                db1 = new event.data.Database();
                resolve();
            };

            worker.postMessage(uInt8Array, [uInt8Array.buffer]);
        };

        xhr.onerror = (error) => {
            reject(error);
        };

        xhr.send();
    });
}








function searchDictionary() {
    const searchWord = document.getElementById('searchWord').value.trim();

    if (!searchWord) {
        alert('Please enter a word to search.');
        return;
    }

    const query = `SELECT * FROM DictTable WHERE word LIKE ?;`;
    const pattern = `%${searchWord}%`;
    const results = db1.exec(query, [pattern]);

    if (!results || !results.length) {
        alert('No matching records found.');
        return;
    }

    const data = results[0].values;
    populateTable(data);
}

function populateTable(data) {
    const resultTable = document.getElementById('resultTable');
    resultTable.innerHTML = `
        <tr>
            <th>ID</th>
            <th>Word</th>
            <th>Definition</th>
        </tr>
    `;

    data.forEach(row => {
        resultTable.innerHTML += `
            <tr>
                <td>${row[0]}</td>
                <td>${row[1]}</td>
                <td>${row[2]}</td>
            </tr>
        `;
    });
}

document.addEventListener('DOMContentLoaded', function () {
    initDatabase()
        .then(() => {
            const searchButton = document.getElementById('searchButton');
            searchButton.addEventListener('click', searchDictionary);
        })
        .catch(error => console.error('Error initializing database:', error));
});

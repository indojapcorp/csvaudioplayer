let db;
config = {
    locateFile: (filename, prefix) => {
      console.log(`prefix is : ${prefix}`);
      //return `../dist/${filename}`;
      return "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.5.0/sql-wasm.wasm";
    }
  }
  // The `initSqlJs` function is globally provided by all of the main dist files if loaded in the browser.
  // We must specify this locateFile function if we are loading a wasm file from anywhere other than the current html page's folder.
  initSqlJs(config).then(function (SQL) {



    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'dictionary.db', true);
    xhr.responseType = 'arraybuffer';
    
    xhr.onload = e => {
      const uInt8Array = new Uint8Array(xhr.response);
      db = new SQL.Database(uInt8Array);
    };
    xhr.send();

    
    //Create the database
    //var db = new SQL.Database();
    // db = new SQL.Database();
    // // Run a query without reading the results
    // db.run("CREATE TABLE DictTable (id, word,definition);");
    // // Insert two rows: (1,111) and (2,222)
    // db.run("INSERT INTO DictTable VALUES (?,?,?), (?,?,?)", [1, 'hello v','greeting v', 2, 'hello p','greeting p']);

    /*
    // Prepare a statement
    var stmt = db.prepare("SELECT * FROM DictTable WHERE col1 BETWEEN $start AND $end");
    stmt.getAsObject({ $start: 1, $end: 1 }); // {col1:1, col2:111}

    // Bind new values
    stmt.bind({ $start: 1, $end: 2 });
    while (stmt.step()) { //
      var row = stmt.getAsObject();
      console.log('Here is a row: ' + JSON.stringify(row));
    }
    */
  });

  function searchDictionary() {
    const searchInput = document.getElementById('searchWord').value.trim();

    if (searchInput === '') {
        // If the search input is blank, retrieve all records from the database
        const sqlQuery = 'SELECT * FROM DictTable ORDER BY id';
        const results = db.exec(sqlQuery);

        if (results && results.length > 0) {
            const data = results[0].values;
            populateTable(data);
        } else {
            clearTable();
        }
    } else {
        // If there is a search input, perform a search query
        const sqlQuery = 'SELECT * FROM DictTable WHERE word LIKE ? ORDER BY id';
        const results = db.exec(sqlQuery, [`%${searchInput}%`]);

        if (results && results.length > 0) {
            const data = results[0].values;
            populateTable(data);
        } else {
            clearTable();
        }
    }
}

  function searchDictionaryOld() {
    const searchWord = document.getElementById('searchWord').value.trim();

    if (!searchWord) {
        alert('Please enter a word to search.');
        return;
    }

    const query = `SELECT * FROM DictTable WHERE word LIKE ?;`;
    const pattern = `%${searchWord}%`;
    const results = db.exec(query, [pattern]);

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
    // initDatabase()
    //     .then(() => {
    //         const searchButton = document.getElementById('searchButton');
    //         searchButton.addEventListener('click', searchDictionary);
    //     })
    //     .catch(error => console.error('Error initializing database:', error));

        const searchButton = document.getElementById('searchButton');
        searchButton.addEventListener('click', searchDictionary);

});

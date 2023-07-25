let currentPage = 1;
const recordsPerPage = 2;

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

function populateTable(data,totalPages) {
    const table = document.getElementById('resultTable');
    table.innerHTML = '';

    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = Math.min(startIndex + recordsPerPage, data.length);
    console.log("data.startIndex="+startIndex);
    console.log("data.endIndex="+endIndex);
    console.log("data.length="+data.length);

    const headerRow = table.insertRow();
    headerRow.innerHTML = '<th>ID</th><th>Word</th><th>Definition</th>';

    for (let i = 0; i < endIndex; i++) {
        const row = table.insertRow();
        row.innerHTML = `<td>${data[i][0]}</td><td>${data[i][1]}</td><td>${data[i][2]}</td>`;
    }

    console.log("data.length="+totalPages);
    addPaginationButtons(totalPages);
}

function addPaginationButtons(totalPages) {
    //const totalPages = Math.ceil(totalRecords / recordsPerPage);
    const paginationContainer = document.getElementById('paginationContainer');
    paginationContainer.innerHTML = '';

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            searchDictionary();
        }
    });
    paginationContainer.appendChild(prevButton);
    console.log("totalPages.length="+totalPages);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            searchDictionary();
        });
        paginationContainer.appendChild(pageButton);
    }

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            searchDictionary();
        }
    });
    paginationContainer.appendChild(nextButton);
}

function getColumnNames(tableName) {
    const sqlQuery = `PRAGMA table_info(${tableName})`;
    const results = db.exec(sqlQuery);

    if (results && results.length > 0) {
        const columnNames = results[0].values.map(row => row[1]);
        return columnNames;
    }

    return [];
}

function getSQLStringNew(tableName){
    const columnNames = getColumnNames(tableName);

    let fromLimitClause = ' FROM (select ';
    // Generate the SQL query string
    let sqlQuery = '';
    sqlQuery = `
    SELECT '{"data":['|| 
    GROUP_CONCAT(
   '{'||
    `;
    // Loop over the column names and append them to the SQL query string
    for (let i = 0; i < columnNames.length; i++) {
        const columnName = columnNames[i];
        const formattedfromLimitClause = columnName + ",";
        const formattedColumnName = `
                          '"${columnName}":"'|| REPLACE(REPLACE(IFNULL(${columnName}, '-'), '"', '\\\\"'),'\\n','###')|| '",'||`;
        sqlQuery += formattedColumnName;
        fromLimitClause += formattedfromLimitClause;
    }
    fromLimitClause = fromLimitClause.slice(0, -1);

    //fromLimitClause += ` from ${tableName} WHERE word LIKE ? ORDER BY id LIMIT ?, ?) as subquery`;
    fromLimitClause += ` from ${tableName} WHERE word LIKE ? ORDER BY id LIMIT ?, ?) as subquery`;
    // Remove the trailing comma from the last column name
    sqlQuery = sqlQuery.slice(0, -6);

//     sqlQuery += `
//     '"'
//     ,'},'
//    ) 
//    || '}' || 
// ']}' AS json_data FROM ${tableName} WHERE word LIKE ? ORDER BY id LIMIT ?, ?
//     `;

sqlQuery += `
'"'
,'},'
) 
|| '}' || 
']}' AS json_data 
`;

sqlQuery += fromLimitClause;

    return sqlQuery;

}


function countRecords(searchInput) {
    const sqlQuery = 'SELECT COUNT(*) AS count FROM DictTable WHERE word LIKE ?';
    const results = db.exec(sqlQuery, [`%${searchInput}%`]);

    if (results && results.length > 0) {
        return results[0].values[0][0];
    }

    return 0;
}

function searchDictionary() {
    const searchInput = document.getElementById('searchWord').value.trim();
    const totalRecords = countRecords(searchInput);
    console.log("totalRecords="+totalRecords);
    const totalPages = Math.ceil(totalRecords / recordsPerPage);

    console.log("totalPages="+totalPages);

    if (totalPages === 0) {
        clearTable();
        return;
    }

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    var newSQL=getSQLStringNew("DictTable");
    console.log(newSQL);

    var temp=`
    SELECT '{"data":['|| GROUP_CONCAT(
        '{'||
        '"id":"'|| REPLACE(REPLACE(IFNULL(id, '-'), '"', '\\"'),'\n','###')|| '",'||
        '"word":"'|| REPLACE(REPLACE(IFNULL(word, '-'), '"', '\\"'),'\n','###')|| '",'||
        '"definition":"'|| REPLACE(REPLACE(IFNULL(definition, '-'), '"', '\\"'),'\n','###')|| '",'
        ) || '}]}' AS json_data
    FROM DictTable
    WHERE word LIKE ? ORDER BY id LIMIT ?, ?
            `
    const startIndex = (currentPage - 1) * recordsPerPage;
    var sqlQuery = 'SELECT * FROM DictTable WHERE word LIKE ? ORDER BY id LIMIT ?, ?';
    sqlQuery =  `
        SELECT '{"data":['|| 
                    GROUP_CONCAT(
                   '{'||
                          '"id":"'|| REPLACE(REPLACE(IFNULL(id, '-'), '"', '\\"'),'\n','###')|| '",'||
                          '"word":"'|| REPLACE(REPLACE(IFNULL(word, '-'), '"', '\\"'),'\n','###')|| '",'||
                          '"definition":"'|| REPLACE(REPLACE(IFNULL(definition, '-'), '"', '\\"'),'\n','###')|| 
                          '"'
                    ,'},'
                   ) 
                   || '}' || 
                ']}' AS json_data
        FROM DictTable WHERE word LIKE ? ORDER BY id LIMIT ?, ?
            `;
    
            console.log("searchInput="+searchInput);
            console.log("startIndex="+startIndex);
            console.log("recordsPerPage="+recordsPerPage);
    const results = db.exec(newSQL, [`%${searchInput}%`, startIndex, recordsPerPage]);

    if (results && results.length > 0) {
        const data = results[0].values;
        populateTable(data,totalPages);
    } else {
        clearTable();
    }
}


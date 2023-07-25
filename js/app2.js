let currentPage = 1;
const recordsPerPage = 1;

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
    xhr.open('GET', 'data/dictionary.db', true);
    xhr.responseType = 'arraybuffer';
    
    xhr.onload = e => {
      const uInt8Array = new Uint8Array(xhr.response);
      db = new SQL.Database(uInt8Array);
    };
    xhr.send();

  });

  document.addEventListener('DOMContentLoaded', function () {

        const searchButton = document.getElementById('searchButton');
        searchButton.addEventListener('click', searchDictionary);

});


function addPaginationButtons(tableName,totalPages) {
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
            searchDictionary(tableName);
        });
        paginationContainer.appendChild(pageButton);
    }

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            searchDictionary(tableName);
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

function searchDictionary(tableName) {
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

    //var newSQL=getSQLStringNew("DictTable");
    var newSQL=getSQLStringNew(tableName);
    console.log(newSQL);

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
        addPaginationButtons(tableName,totalPages);
        readJSONFromSQLite(data[0][0],currentPage);
    }
}

function loadTableNames() {
    console.log("loadTableNames");
    const tableNames = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
    const tableNameSelect = document.getElementById('tableNameSelect');
    tableNameSelect.innerHTML = '';
    const option = document.createElement('option');
    option.textContent = "select";
    tableNameSelect.appendChild(option);

    if (tableNames && tableNames.length > 0) {
        const tableList = tableNames[0].values;
        for (let i = 0; i < tableList.length; i++) {
            const tableName = tableList[i][0];
            const option = document.createElement('option');
            option.textContent = tableName;
            tableNameSelect.appendChild(option);
        }

        // Add event listener to call searchDictionary when an option is selected
        tableNameSelect.addEventListener('change', () => {
            const selectedOption = tableNameSelect.value;
            searchDictionary(selectedOption);
        });
    }
}

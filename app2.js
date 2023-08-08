let currentPage = 1;
let recordsPerPage = 10;
let columnNames = [];
let db;
var multiSelectInput;
var dropdownContent;

document.addEventListener('DOMContentLoaded', function () {

    //const searchButton = document.getElementById('searchButton');
    //  searchButton.addEventListener('click', searchDictionary);
    multiSelectInput = document.getElementById('searchWord');
    dropdownContent = document.getElementById('dropdownContent');

    searchButton.addEventListener('click', () => {

        const columnNameSelect = document.getElementById('columnNameSelect');
        const searchInput = document.getElementById('searchWord').value.trim();
        const checkboxes = dropdownContent.getElementsByTagName('input');

        if (columnNameSelect.value != "" && (searchInput !== '' || checkboxes.length != 0)) {
            searchDictionary(tableNameSelect.value, selectedColumnNames);
        }
    });


    // multiSelectInput.addEventListener('focus', function () {
    //   dropdownContent.style.display = 'block';
    // });

    // multiSelectInput.addEventListener('blur', function () {
    //   dropdownContent.style.display = 'none';
    // });

    document.addEventListener('click', function (event) {
        if (!multiSelectInput.contains(event.target) && !dropdownContent.contains(event.target)) {
            dropdownContent.style.display = 'none';
        } else {
            dropdownContent.style.display = 'block';
        }
    });


});

function toggleDropdown() {
    dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
}

async function loadDatabase() {
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

        var selectSQLiteDb = document.getElementById("selectSQLiteDb").value;

        const xhr = new XMLHttpRequest();
        //xhr.open('GET', 'data/localonly/dictionary.db', true);
        xhr.open('GET', selectSQLiteDb, true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = e => {
            const uInt8Array = new Uint8Array(xhr.response);
            db = new SQL.Database(uInt8Array);
        };
        xhr.send();

    });

    var table = document.getElementById("myTable");
    table.innerHTML = "";
    var paginationContainer = document.getElementById("paginationContainer");
    paginationContainer.innerHTML = "";
    loadTableNames();
}


function getWhereClause() {
    const columnNameSelect = document.getElementById('columnNameSelect');
    var paginationContainer = document.getElementById("paginationContainer");
    paginationContainer.innerHTML = "";

    var searchInput = document.getElementById('searchWord').value.trim();

    const checkboxes = dropdownContent.getElementsByTagName('input');

    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            searchInput += "'" + checkboxes[i].value + "' ,";
            //selectedOptions.push(checkboxes[i].value);
        }
    }

    if (columnNameSelect.value != "" && searchInput != "" && checkboxes.length == 0) {
        console.log("searchInput=" + searchInput);    
        console.log(" where " + columnNameSelect.value.trim() + " LIKE " + searchInput);
        return " WHERE " + columnNameSelect.value.trim() + " LIKE '" + searchInput + "' ";
        //searchDictionary(tableNameSelect.value,selectedColumnNames);
    } else if (columnNameSelect.value != "" && checkboxes.length > 0) {
        searchInput = searchInput.slice(0, -1);
        console.log("searchInput=" + searchInput);
    
        console.log(" where " + columnNameSelect.value.trim() + " IN ( " + searchInput + " ) ");
        return " WHERE " + columnNameSelect.value.trim() + " IN ( " + searchInput + " ) ";
        //searchDictionary(tableNameSelect.value,selectedColumnNames);
    } else {
        return "";
    }
}

function addPaginationButtons(tableName, totalPages, columnNames) {
    //const totalPages = Math.ceil(totalRecords / recordsPerPage);
    const paginationContainer = document.getElementById('paginationContainer');
    paginationContainer.innerHTML = '';

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            searchDictionary(tableName, columnNames);
        }
    });
    paginationContainer.appendChild(prevButton);
    console.log("totalPages.length=" + totalPages);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            searchDictionary(tableName, columnNames);
        });
        paginationContainer.appendChild(pageButton);
    }

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            searchDictionary(tableName, columnNames);
        }
    });
    paginationContainer.appendChild(nextButton);
}

function getColumnNames(tableName) {
    const sqlQuery = `PRAGMA table_info(${tableName})`;
    const results = db.exec(sqlQuery);

    if (results && results.length > 0) {
        const columnNames = results[0].values.map(row => row[1]);

        const columnNameSelect = document.getElementById('columnNameSelect');
        columnNameSelect.innerHTML = '';
        const option = document.createElement('option');
        option.textContent = "select";

        for (let i = 0; i < columnNames.length; i++) {
            const columnName = columnNames[i];
            const option = document.createElement('option');
            option.textContent = columnName;
            columnNameSelect.appendChild(option);
        }


        return columnNames;
    }


    return [];
}

function getColumnUniqueData(tableName, columnName) {

    const sqlUniqueCountQuery = `select COUNT(DISTINCT(${columnName})) as count from ${tableName}`;
    const uniqueCountResults = db.exec(sqlUniqueCountQuery);

    if (uniqueCountResults && uniqueCountResults.length > 0) {
        if (uniqueCountResults[0].values[0][0] > 500)
            return;
    }

    const sqlQuery = `select DISTINCT(${columnName}) from ${tableName}`;

    const results = db.exec(sqlQuery);

    if (results && results.length > 0) {
        const columnNames = results[0].values;

        const dropdownContent = document.getElementById('dropdownContent');
        dropdownContent.innerHTML = '';

        const option = document.createElement('option');
        option.textContent = "select";

        for (let i = 0; i < columnNames.length; i++) {
            const columnName = columnNames[i];
            const catchkbox = document.createElement('input');
            catchkbox.type = 'checkbox';
            catchkbox.value = columnName;
            var catchkboxlabel = document.createElement('label');
            catchkboxlabel.appendChild(catchkbox);
            catchkboxlabel.appendChild(document.createTextNode(columnName));
            dropdownContent.appendChild(catchkboxlabel);
        }
        return columnNames;
    }
    return [];
}

function getSQLStringNew(tableName, columnNames) {
    //const columnNames = getColumnNames(tableName);

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
        // const formattedColumnName = `
        //                   '"${columnName}":"'|| REPLACE(REPLACE(REPLACE(IFNULL(${columnName}, '-'), '"', '\\\\"'),CHAR(10),'==NEW-LINE=='),CHAR(9),'==TABS==')|| '",'||`;
        const formattedColumnName = `
                          '"${columnName}":"'|| REPLACE(REPLACE(REPLACE(IFNULL(${columnName}, '-'), '"', ''),CHAR(10),'==NEW-LINE=='),CHAR(9),'==TABS==')|| '",'||`;
        sqlQuery += formattedColumnName;
        fromLimitClause += formattedfromLimitClause;
    }
    fromLimitClause = fromLimitClause.slice(0, -1);

    var whereClause = getWhereClause();

    //fromLimitClause += ` from ${tableName} WHERE word LIKE ? ORDER BY id LIMIT ?, ?) as subquery`;
    //fromLimitClause += ` from ${tableName} ORDER BY id LIMIT ?, ?) as subquery`;
    fromLimitClause += ` from ${tableName} ${whereClause} ORDER BY id LIMIT ?, ?) as subquery`;
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


function countRecords(tableName,) {

    var whereClause = getWhereClause();

    const sqlQuery = 'SELECT COUNT(*) AS count FROM ' + tableName + " " + whereClause;


    const results = db.exec(sqlQuery);

    if (results && results.length > 0) {
        return results[0].values[0][0];
    }

    return 0;
}

function searchDictionary(tableName, colnameheaders) {
    var paginationContainer = document.getElementById("paginationContainer");
    paginationContainer.innerHTML = "";

    var table = document.getElementById("myTable");
    var rowCount = table.rows.length;

    // for (var i = 4; i < rowCount-4; i++) {
    //     table.deleteRow(i);
    //   }

    // Get all rows in the table
    var rows = table.getElementsByTagName("tr");

    // Loop through the rows in reverse order (to avoid skipping elements when deleting)
    for (var i = rows.length - 1; i >= 4; i--) {
        var row = rows[i];
        row.parentNode.removeChild(row);
    }


    //const searchInput = document.getElementById('searchWord').value.trim();
    const totalRecords = countRecords(tableName);
    recordsPerPage = parseInt(document.getElementById('recordsPerPageInput').value, 10);

    const totalPages = Math.ceil(totalRecords / recordsPerPage);

    if (totalPages === 0) {
        //clearTable();
        return;
    }

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    //var newSQL=getSQLStringNew("DictTable");
    //var newSQL=getSQLStringNew(tableName);


    var newSQL = getSQLStringNew(tableName, colnameheaders);
    //console.log(newSQL);

    const startIndex = (currentPage - 1) * recordsPerPage;
    var sqlQuery = 'SELECT * FROM DictTable WHERE word LIKE ? ORDER BY id LIMIT ?, ?';
    sqlQuery = `
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
        FROM DictTable ORDER BY id LIMIT ?, ?
            `;

    //console.log("searchInput="+searchInput);
    const results = db.exec(newSQL, [startIndex, recordsPerPage]);

    if (results && results.length > 0) {
        const data = results[0].values;
        if (data) {
            addPaginationButtons(tableName, totalPages, colnameheaders);
            //populateSQLLiteData(data[0][0]);
            readJSONFromSQLite(data[0][0], currentPage, totalRecords);
        }
    }
}

function loadTableNames() {

    //console.log("loadTableNames");
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
            dropdownContent.innerHTML = '';
            const selectedOption = tableNameSelect.value;
            showFileColPopup(getColumnNames(selectedOption));
            //searchDictionary(selectedOption);
        });

        // Add event listener to call searchDictionary when an option is selected
        columnNameSelect.addEventListener('change', () => {
            dropdownContent.innerHTML = '';
            const selectedOption = columnNameSelect.value;
            getColumnUniqueData(tableNameSelect.value, selectedOption);
            //searchDictionary(selectedOption);
        });

    }
}

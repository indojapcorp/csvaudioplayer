let csvfilename = '';
let recognition;

//let csvData = null;
let tableHeaders = [];


// Event listener for the file input element
const fileInput = document.getElementById("csvFileInput");
fileInput.addEventListener("change", function (event) {
  const file = fileInput.files[0];
  readCSV(event);
  //loadTable(event);
});
// create HTML table with two columns english and japanese.
// first column has english text , second column has Japanese text.
// render the table with few sample rows.
// Add speak button and on click of it speak the contents of the table using javascript TTS. 


function updateCounter() {
  //var checkboxes = document.getElementById("myTable").querySelectorAll('input[type="checkbox"]');
  var checkboxes = document.getElementById("myTable").querySelectorAll('input[type="checkbox"][name^="row"]');
  var counter = 0;
  checkboxes.forEach(function(checkbox) {
    if (checkbox.checked) {
      counter++;
    }
  });
  console.log(counter);
  document.getElementById('counterId').textContent = counter;
}

function downloadAsCSV(text) {
  const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(text.replaceAll(" .! ", ""));
  const link = document.createElement('a');
  var dwdfilename = csvfilename.replace(".csv", "_dwd.csv")
  link.setAttribute('href', csvContent);
  link.setAttribute('download', dwdfilename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function filterTable(columnIndex) {
  var input, filter, table, tr, td, i;
  input = document.getElementById("input_" + columnIndex);
  filter = input.value.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");

  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[columnIndex + 1];
    if (td) {
      if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}

function selectAll(source) {
  //var checkboxes = document.getElementById("myTable").getElementsByTagName("input");
 // var checkboxes = document.getElementById("myTable").querySelectorAll('tr:not([style*="display: none;"])').querySelectorAll('input[type="checkbox"][name^="row"]')
  //var tr = document.getElementById("myTable").getElementsByTagName("tr");
  var tr = document.getElementById("myTable").querySelectorAll('tr:not([style*="display: none;"])');

  tr.forEach(function(row) {
    //const tdElements = row.querySelectorAll('td');
    if(row.cells[0]){
    var checkbox = row.cells[0].querySelector('input[type="checkbox"]');
    if(checkbox)
      checkbox.checked = source.checked;
  }
  });
  updateCounter();
  // console.log("checkboxes len="+checkboxes.length);
  // console.log("tr len="+tr.length);
  // for (var i = 0; i < checkboxes.length; i++) {
  //   //if (tr[i].style.display != "none" && checkboxes[i].type == "checkbox" && checkboxes[i].name.includes("row")) {
  //     if (checkboxes[i].type == "checkbox" && checkboxes[i].name.includes("row")) {
  //     checkboxes[i].checked = source.checked;
  //   }
  // }
}


//let stories = document.querySelectorAll('*[id^="col"]');
let stories = [];
let favorites = [];

function createFavorites() {
  favorites = [];
  //let checked = document.querySelectorAll("[type='checkbox']:checked");
  let checked = document.querySelectorAll('*[id^="col"]:checked');
  checked.forEach(function (el) {
    favorites.push(el.value);
  });
  // console.log(favorites)
}



function speakRowDataWorkingBefHighlight(row) {
    var table = document.getElementById("myTable");
    const columnCheckboxes = document.getElementById("columnCheckboxes").getElementsByTagName("input");
    const columnLanguages = document.getElementById("columnCheckboxes").getElementsByTagName("select");
    var firstcheckboxrow = table.rows[0];
        for (var j = 0; j < columnCheckboxes.length; j++) {
          var colspkcheckBox = firstcheckboxrow.cells[j + 1].getElementsByTagName("input")[0];
          var collang = columnLanguages[j].value;
          if (columnCheckboxes[j].checked && colspkcheckBox.checked) {
            utterances.push(createUtterance(row.cells[j + 1].innerHTML, collang));
          }
        }
    speakUtterances();
}

function speakRowData(row) {
  speakcells = [];
  speakcellslang = [];
  currentCellIndex = 0;  

  var table = document.getElementById("myTable");
  const columnCheckboxes = document.getElementById("columnCheckboxes").getElementsByTagName("input");
  const columnLanguages = document.getElementById("columnCheckboxes").getElementsByTagName("select");
  var firstcheckboxrow = table.rows[0];
  var speakcellsIndex = 0;
      for (var j = 0; j < columnCheckboxes.length; j++) {
        var colspkcheckBox = firstcheckboxrow.cells[j + 1].getElementsByTagName("input")[0];
        var collang = columnLanguages[j].value;
        if (columnCheckboxes[j].checked && colspkcheckBox.checked) {
          speakcells[speakcellsIndex] = row.cells[j + 1];
          speakcellslang[speakcellsIndex] = collang;
          speakcellsIndex++;
        }
      }
  speakAndHighlight();
}

function deleteSelectedRows() {
  var table = document.getElementById("myTable");
  var rowCount = table.rows.length;

  for (var i = 3; i < rowCount; i++) {
    var row = table.rows[i];
    var checkBox = row.cells[0].getElementsByTagName("input")[0];

    if (checkBox != undefined && checkBox.checked) {
      table.deleteRow(i);
      rowCount--;
      i--;
    }
  }
  updateCounter(); // Update the selected record count
}

function deleteNonselectedRows() {
  var table = document.getElementById("myTable");
  var rowCount = table.rows.length;

  for (var i = 3; i < rowCount; i++) {
    var row = table.rows[i];
    var checkBox = row.cells[0].getElementsByTagName("input")[0];

    if (checkBox != undefined && !checkBox.checked) {
      table.deleteRow(i);
      rowCount--;
      i--;
    }
  }
  updateCounter(); // Update the selected record count
}

// Define the text-to-speech voice options
const voices = {
  "English": "Alex",
  "Español": "Monica",
  "Français": "Thomas",
  "Deutsch": "Anna",
  "Italiano": "Alice",
  "日本語": "Kyoko"
};
let isTtsEnabled = false;

let ttsUtterance = null;
let ttsPaused = false;
let deflang = 'en';
const synth = window.speechSynthesis;
//const utterance = new SpeechSynthesisUtterance();

const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const stopBtn = document.getElementById('stopBtn');
const downloadCsvBtn = document.getElementById('downloadCsvBtn');
const searchSpeechSearch = document.getElementById('searchSpeechSearch');
const searchSpeechSearchStop = document.getElementById('searchSpeechSearchStop');


let selectedData = "";
let selectedDwdData = "";
function getSelectedData() {
  var table = document.getElementById("myTable");
  var rowCount = table.rows.length;
  //  console.log(rowCount);
  //var selectedData = "";
  selectedData = "";

  for (var i = 3; i < rowCount; i++) {
    var row = table.rows[i];
    var checkBox = row.cells[0].getElementsByTagName("input")[0];
    if (checkBox != undefined && checkBox.checked) {
      for (var j = 1; j < row.cells.length; j++) {
        if (favorites.includes("" + j)) {
          selectedData += row.cells[j].innerHTML + " .! ";
        }
      }
      selectedData += "\n";
    }
  }
  //var utterance = new SpeechSynthesisUtterance(selectedData);
  //window.speechSynthesis.speak(utterance);

  //alert(selectedData);
}

function getSelectedDataForDownload() {
  var table = document.getElementById("myTable");
  var rowCount = table.rows.length;
  const columnCheckboxes = document.getElementById("columnCheckboxes").getElementsByTagName("input");

  var firstcheckboxrow = table.rows[0];

  //  console.log(rowCount);
  //var selectedData = "";
  selectedDwdData = "";

  const headerRow = [];

  for (let i = 0; i < tableHeaders.length; i++) {
    var headercheckBox = firstcheckboxrow.cells[i + 1].getElementsByTagName("input")[0];

    if (columnCheckboxes[i].checked && headercheckBox.checked) {
      headerRow.push(encodeURIComponent(tableHeaders[i]));
    }
  }
  selectedDwdData += headerRow.join(",") + "\r\n";

  for (var i = 3; i < rowCount; i++) {
    var row = table.rows[i];

    var checkBox = row.cells[0].getElementsByTagName("input")[0];
    const rowData = [];
    if (checkBox != undefined && checkBox.checked) {
      //for (var j = 1; j < row.cells.length; j++) {
      for (var j = 0; j < columnCheckboxes.length; j++) {
        var checkBox = firstcheckboxrow.cells[j + 1].getElementsByTagName("input")[0];

        //if (favorites.includes("" + j)) {
        //if (columnCheckboxes[j-1] && columnCheckboxes[j-1].checked) {
        if (columnCheckboxes[j].checked && checkBox.checked) {

          //selectedData += row.cells[j].innerHTML + ",";
          rowData.push(row.cells[j + 1].innerHTML);
        }
      }
      selectedDwdData += rowData.join(",") + "\r\n";
      //selectedData += "\r\n";
    }
  }
  //var utterance = new SpeechSynthesisUtterance(selectedData);
  //window.speechSynthesis.speak(utterance);

  //alert(selectedData);
}

let utterances = []; // Array to store the SpeechSynthesisUtterance objects

    // Function to create a SpeechSynthesisUtterance object
    function createUtterance(text, lang) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      return utterance;
    }

    var speakcells = [];
    var speakcellslang = [];
    var currentCellIndex = 0;
    var utterance = new SpeechSynthesisUtterance();
    var stopped = false;

    function speakThis() {
      var table = document.getElementById("myTable");
      var rowCount = table.rows.length;
      const columnCheckboxes = document.getElementById("columnCheckboxes").getElementsByTagName("input");
      const columnLanguages = document.getElementById("columnCheckboxes").getElementsByTagName("select");
      var firstcheckboxrow = table.rows[0];
      var speakcellsIndex = 0;
      for (var i = 3; i < rowCount; i++) {
        var row = table.rows[i];
    
        var checkBox = row.cells[0].getElementsByTagName("input")[0];
        const rowData = [];
        if (checkBox != undefined && checkBox.checked) {
          for (var j = 0; j < columnCheckboxes.length; j++) {
            var colspkcheckBox = firstcheckboxrow.cells[j + 1].getElementsByTagName("input")[0];
            var collang = columnLanguages[j].value;
            if (columnCheckboxes[j].checked && colspkcheckBox.checked) {
              speakcells[speakcellsIndex] = row.cells[j + 1];
              speakcellslang[speakcellsIndex] = collang;
              speakcellsIndex++;
            }
          }
        }
      }
      speakAndHighlight();
    }

    function speakAndHighlight() {

      if (currentCellIndex >= speakcells.length || stopped) {
        stopped = false;
        currentCellIndex = 0;
        playBtn.disabled = false;
        pauseBtn.disabled = true;
        resumeBtn.disabled = true;
        stopBtn.disabled = true;  
        return; // All cells have been spoken
      }

      playBtn.disabled = true;
      pauseBtn.disabled = false;
      resumeBtn.disabled = true;
      stopBtn.disabled = false;
      var currentCell = speakcells[currentCellIndex];
      utterance.text = currentCell.innerText;
      utterance.lang = speakcellslang[currentCellIndex];
      synth.speak(utterance);

      // Highlight the text in the current cell
      currentCell.style.backgroundColor = 'yellow';
      var table = document.getElementById("myTable");

        // Scroll to the cell being spoken
  var cellRect = currentCell.getBoundingClientRect();
  var tableRect = table.getBoundingClientRect();
  var cellTop = cellRect.top - tableRect.top;
  var cellLeft = cellRect.left - tableRect.left;
  var cellCenterX = cellLeft + cellRect.width / 2;
  var cellCenterY = cellTop + cellRect.height / 2;
  var scrollX = cellCenterX - window.innerWidth / 2;
  var scrollY = cellCenterY - window.innerHeight / 2;

  window.scrollTo({
    top: scrollY,
    left: scrollX,
    behavior: 'smooth'
  });

      // When the speech ends, move to the next cell
      utterance.onend = function() {
        currentCell.style.backgroundColor = ''; // Reset highlighting
        currentCellIndex++;
        speakAndHighlight(); // Speak the next cell
      };
    }

    function pause() {
      playBtn.disabled = true;
      pauseBtn.disabled = true;
      resumeBtn.disabled = false;
      stopBtn.disabled = false;

      synth.pause();
    }

    function resume() {
      playBtn.disabled = true;
      pauseBtn.disabled = false;
      resumeBtn.disabled = true;
      stopBtn.disabled = false;

      synth.resume();
    }

    function stop() {
      stopped = true;
      playBtn.disabled = false;
      pauseBtn.disabled = true;
      resumeBtn.disabled = true;
      stopBtn.disabled = true;

      synth.cancel();
      currentCellIndex = 0;  
      // Reset cell highlighting
      for (var i = 0; i < speakcells.length; i++) {
        speakcells[i].style.backgroundColor = '';
      }
      speakcells = [];
      speakcellslang = [];
    }

function speakThisWorkingBefHighlight() {
  var table = document.getElementById("myTable");
  var rowCount = table.rows.length;
  const columnCheckboxes = document.getElementById("columnCheckboxes").getElementsByTagName("input");
  const columnLanguages = document.getElementById("columnCheckboxes").getElementsByTagName("select");
  var firstcheckboxrow = table.rows[0];

  for (var i = 3; i < rowCount; i++) {
    var row = table.rows[i];

    var checkBox = row.cells[0].getElementsByTagName("input")[0];
    const rowData = [];
    if (checkBox != undefined && checkBox.checked) {
      for (var j = 0; j < columnCheckboxes.length; j++) {
        var colspkcheckBox = firstcheckboxrow.cells[j + 1].getElementsByTagName("input")[0];
        var collang = columnLanguages[j].value;
        if (columnCheckboxes[j].checked && colspkcheckBox.checked) {
          //speakTextNew(row.cells[j + 1].innerHTML,collang);
          console.log(collang);
          var utterance = createUtterance(row.cells[j + 1].innerHTML, collang);
          utterances.push(utterance);
          //highlightText(utterance, row.cells[j + 1]);
        }
      }
    }
  }
  speakUtterances();
}

function highlightText(utterance, cell) {
  var originalColor = cell.style.backgroundColor;

  utterance.onstart = function() {
    cell.style.backgroundColor = "yellow";
  };

  utterance.onend = function() {
    cell.style.backgroundColor = originalColor;
  };
}


function speakUtterances() {

  if (utterances.length === 0) {
    // Enable the speak button and disable the other buttons
    playBtn.disabled = false;
    pauseBtn.disabled = true;
    resumeBtn.disabled = true;
    stopBtn.disabled = true;
    return;
  }

  const currentUtterance = utterances.shift();

  // Enable the pause and resume buttons
  playBtn.disabled = true;
  pauseBtn.disabled = false;
  resumeBtn.disabled = true;
  stopBtn.disabled = false;

  currentUtterance.onstart = function() {
    // Remove the onstart event listener to prevent multiple executions
    currentUtterance.onstart = null;
  };

  currentUtterance.onend = function() {
    // Enable the resume button and speak the next utterance
    resumeBtn.disabled = false;
    speakUtterances();
  };

  // Speak the current utterance
  speechSynthesis.speak(currentUtterance);
}

playBtn.addEventListener('click', () => {
  // getSelectedData();
  // speakText(selectedData);
  speakThis();
});

// pause the TTS when the pause button is clicked
pauseBtn.addEventListener('click', () => {
  //synth.pause();
  pause();
});

// resume the TTS when the resume button is clicked
resumeBtn.addEventListener('click', () => {
  //synth.resume();
  resume();
});

// stop the TTS when the stop button is clicked
stopBtn.addEventListener('click', () => {
  //synth.cancel();
  stop();
  //  console.log('stopped');
});

downloadCsvBtn.addEventListener('click', () => {
  selectedDwdData = "";
  // set the text to speak
  //utterance.text = transcriptTextarea.value.substring(transcriptTextarea.selectionStart, transcriptTextarea.selectionEnd);
  getSelectedDataForDownload();
  downloadAsCSV(selectedDwdData);
});

searchSpeechSearch.addEventListener('click', () => {
  startRecognition()
});

searchSpeechSearchStop.addEventListener('click', () => {
  stopRecognition()
});


function requestMicrophonePermission() {
  return new Promise(function (resolve, reject) {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(function (stream) {
        stream.getTracks().forEach(function (track) {
          track.stop();
        });
        resolve();
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

function startRecognitionNew() {
  requestMicrophonePermission()
    .then(function () {
      recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
      recognition.lang = "en-IN"; // Specify the desired language for speech recognition
      //recognition.lang = languages[document.getElementById("language").value];
      recognition.onresult = function (event) {
        const speechResult = event.results[0][0].transcript;
        searchAndSelectWord(speechResult);
      };

      recognition.onend = function () {
        recognition.start(); // Restart speech recognition after it ends
      };

      recognition.start();
    })
    .catch(function (error) {
      console.error(error);
    });
  searchSpeechSearch.disabled = true;
  searchSpeechSearchStop.disabled = false;
}
let speechstop = false;
// Define the function to start speech recognition
function startRecognition() {
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
  speechstop = true;
  recognition.lang = "en-IN";

  recognition.onresult = function (event) {
    const speechResult = event.results[0][0].transcript;
    console.log("transcript=" + speechResult);

    searchAndSelectWord(speechResult);
  };

  recognition.onend = function () {
    if (!speechstop)
      recognition.start(); // Restart speech recognition after it ends  
  };

  recognition.start();
  searchSpeechSearch.disabled = true;
  searchSpeechSearchStop.disabled = false;
}

// Define the function to stop speech recognition
function stopRecognition() {
  if (recognition) {
    recognition.abort();
  }
  speechstop = true;
  //recognition.stop();
  searchSpeechSearch.disabled = false;
  searchSpeechSearchStop.disabled = true;
  if (window.getSelection) {
    if (window.getSelection().empty) {  // Chrome
      window.getSelection().empty();
    } else if (window.getSelection().removeAllRanges) {  // Firefox
      window.getSelection().removeAllRanges();
    }
  } else if (document.selection) {  // IE?
    document.selection.empty();
  }


}

// recognition.onerror = function (event) {
//     console.error(event.error);
// }

function searchAndSelectWord(word) {
  const table = document.getElementById("myTable"); // Replace "myTable" with the ID of your table element

  for (let i = 3; i < table.rows.length; i++) {
    const row = table.rows[i];

    for (let j = 0; j < row.cells.length; j++) {
      const cell = row.cells[j];
      const cellText = cell.textContent.toLowerCase();

      if (cellText.includes(word.toLowerCase())) {
        const checkbox = row.cells[0].querySelector('input[type="checkbox"]'); // Assuming the first column contains the checkboxes
        checkbox.checked = true;
        // Perform any desired action on the matching cell (e.g., highlight, select, etc.)
        cell.style.backgroundColor = "yellow";
      }
    }
  }
}

var columnHeaderLngDict = {}

// Function to create checkboxes for column selection
function createColumnCheckboxes() {
  const columnCheckboxes = document.getElementById("columnCheckboxes");
  columnCheckboxes.innerHTML = "";
  for (let header of tableHeaders) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = header;
    checkbox.checked = true;
    checkbox.onchange = function () {
      //toggleColumn(header, checkbox.checked);
    };

    const label = document.createElement("label");
    label.textContent = header;

    const checkboxContainer = document.createElement("div");
    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(label);

    columnHeaderLngDict[header]='en';

    const langlabel = document.createElement("label");
    langlabel.textContent = "Languge";
    checkboxContainer.appendChild(langlabel);
    const combobox = document.createElement('select');
    combobox.name = 'popupCombobox';
    const languages = ['English', 'Spanish', 'French', 'German','Japanese','Chinese','Korean','Italian','Hindi']; // Add your desired languages here
    const languagesval = ['en', 'sp', 'fr' ,'de','ja','zh','ko','it','hi']; // Add your desired languages here
    //for (const language of languages) {
    languages.forEach(function (language, i) {

      const option = document.createElement('option');
      //option.value = language.toLowerCase();
      option.value = languagesval[i];
      option.textContent = language;
      combobox.appendChild(option);
    });
    combobox.onchange = function () {
      columnHeaderLngDict[header] = combobox.value;
      console.log(columnHeaderLngDict);
    };
    checkboxContainer.appendChild(combobox);


    columnCheckboxes.appendChild(checkboxContainer);
  }
}

// Function to toggle the display of table columns
function toggleColumnApply() {
  const table = document.getElementById("myTable");
  const columnCheckboxes = document.getElementById("columnCheckboxes").getElementsByTagName("input");


  tableHeaders.forEach(function (header, i) {
    const columnIndex = tableHeaders.indexOf(header) + 1;

    var row = table.rows[0];
    var checkBox = row.cells[columnIndex].getElementsByTagName("input")[0];
    if (!columnCheckboxes[i].checked)
      checkBox.checked = false;

    for (let row of table.rows) {
      const cell = row.cells[columnIndex];
      if (cell ) {
        if (columnCheckboxes[i].checked) {
          cell.style.display = "";
        } else {
          cell.style.display = "none";
        }
      }
    }
  });


}

// Function to toggle the display of table columns
function toggleColumn(header, ischecked) {
  const table = document.getElementById("myTable");
  const columnIndex = tableHeaders.indexOf(header) + 1;

  var row = table.rows[0];
  var checkBox = row.cells[columnIndex].getElementsByTagName("input")[0];
  if (!ischecked)
    checkBox.checked = false;
  for (let row of table.rows) {
    const cell = row.cells[columnIndex];

    if (cell) {
      if (cell.style.display === "none") {
        cell.style.display = "";
      } else {
        cell.style.display = "none";
      }
    }
  }
}

// Function to show the column selection popup
function showColumnPopup() {
  const popup = document.getElementById("columnPopup");
  popup.style.display = "block";
}

// Function to hide the column selection popup
function hideColumnPopup() {
  const popup = document.getElementById("columnPopup");
  popup.style.display = "none";
  toggleColumnApply();
}

// Function to hide the column selection popup
function checkAll() {
  const columnCheckboxes = document.getElementById("columnCheckboxes").getElementsByTagName("input");

  tableHeaders.forEach(function (header,i) {
    columnCheckboxes[i].checked = true;
  });
}

// Function to hide the column selection popup
function uncheckAll() {
  const columnCheckboxes = document.getElementById("columnCheckboxes").getElementsByTagName("input");
  tableHeaders.forEach(function (header,i) {
    columnCheckboxes[i].checked = false;
  });
}


// Function to hide the column selection popup
function checkAllFileCols() {
  //const columnCheckboxes = document.getElementById("checkboxes").getElementsByTagName("input");
  var checkboxes = document.getElementsByName("column");

  checkboxes.forEach(function (chkbox) {
    chkbox.checked = true;
  });
}

// Function to hide the column selection popup
function uncheckAllFileCols() {
  var checkboxes = document.getElementsByName("column");

  checkboxes.forEach(function (chkbox) {
    chkbox.checked = false;
  });
}


//filecolpopup related


var headers; // Declare headers as a global variable
var csvData;
var lines;
// Function to display the popup with header checkboxes
function showFileColPopup(headers) {

var popup = document.getElementById("colpopup");
var checkboxes = document.getElementById("checkboxes");
checkboxes.innerHTML = "";

// Create checkboxes for each header
headers.forEach(function (header) {
var checkbox = document.createElement("input");
checkbox.type = "checkbox";
checkbox.name = "column";
checkbox.value = header;
checkbox.checked = true;
checkboxes.appendChild(checkbox);

var label = document.createElement("label");
label.appendChild(document.createTextNode(header));
checkboxes.appendChild(label);
checkboxes.appendChild(document.createElement("br"));
});

popup.style.display = "block";
}

// Function to show the popup
function showcolPopup() {
  var popup = document.getElementById("colpopup");
  popup.style.display = "block";
  }

  
// Function to hide the popup
function hideFileColPopup() {
var popup = document.getElementById("colpopup");
popup.style.display = "none";
}

// Function to read the selected CSV file
function readCSV(event) {
var file = event.target.files[0];

if(!file)
  return;
  
csvfilename = file.name;
var reader = new FileReader();

reader.onload = function (e) {
var contents = e.target.result;
lines = contents.split("\n");
headers = lines[0].split(",");

var popup = document.getElementById("colpopup");
popup.style.display = "block";

showFileColPopup(headers);
};

reader.readAsText(file);
}

// Function to populate the table with selected columns
function populateTableNew() {
var checkboxes = document.getElementsByName("column");
var selectedColumns = [];
// Get the selected checkboxes
checkboxes.forEach(function (checkbox) {
if (checkbox.checked) {
selectedColumns.push(checkbox.value);
tableHeaders.push(checkbox.value);
}
});

// Populate the table
var table = document.getElementById("myTable");
table.innerHTML = "";

var thead = document.createElement("thead");
//start
//var trcolcheck = table.insertRow();
var trcolcheck =  document.createElement("tr");
const td = document.createElement("th");
var input = document.createElement('input');
input.type = "checkbox";
input.id = "allcol";
input.setAttribute('onclick', 'selectAll(this)');
td.appendChild(input);
trcolcheck.appendChild(td);

selectedColumns.forEach(function (column,i) {
  const td = document.createElement("th");
  var input = document.createElement('input');
  input.type = "checkbox";
  input.id = "col" + (i + 1);
  input.value = (i + 1);
  input.onchange = () => createFavorites();
  //input.placeholder="Filter Column "+i;
  td.appendChild(input);
  trcolcheck.appendChild(td);
});
trcolcheck.appendChild(document.createElement("th"));

thead.appendChild(trcolcheck);


//var trcolsearch = table.insertRow();
var trcolsearch = document.createElement("tr");
const tdsearchblank = document.createElement("th");
var input = document.createTextNode("");

tdsearchblank.appendChild(input);
trcolsearch.appendChild(tdsearchblank);
selectedColumns.forEach(function (column,i) {
  const td = document.createElement("th");
  var input = document.createElement('input');
  input.type = "text";
  input.id = "input_" + i;
  input.setAttribute('onkeyup', 'filterTable(' + i + ')');
  input.placeholder = "Filter Column " + i;
  td.appendChild(input);
  trcolsearch.appendChild(td);
});
trcolsearch.appendChild(document.createElement("th"));
thead.appendChild(trcolsearch);

//end
//var headerRow = table.insertRow();
var headerRow = document.createElement("tr");
const tdheaderblank = document.createElement("th");
var blankheaderinput = document.createTextNode("");
tdheaderblank.appendChild(blankheaderinput);
headerRow.appendChild(tdheaderblank);

selectedColumns.forEach(function (column) {
var headerCell = document.createElement("th");
headerCell.innerHTML = column;
headerRow.appendChild(headerCell);
});
headerRow.appendChild(document.createElement("th"));

thead.appendChild(headerRow);
table.appendChild(thead);
csvData = [];

for (var i = 1; i < lines.length; i++) {
  if(lines[i].length==0)
    continue;

  var row = lines[i].split(",");
  
  if(row.length==1)
    console.log("blank row==="+row);
    csvData.push(row);  
  }

console.log("lines="+lines);
//csvData.push(lines); 
// for (var i = 1; i < lines.length; i++) {
//   var row = lines[i];
//   csvData.push(row);  
//   }


recordCount = csvData.length;
document.getElementById("recordCount").textContent = recordCount;

csvData.forEach(function (row,rowno) {
//var tr = table.insertRow();
var tr = document.createElement("tr");
const td = document.createElement("td");
var input = document.createElement('input');
input.type = "checkbox";
input.name = "row" + rowno;
input.value = rowno;
input.setAttribute('onchange', 'updateCounter()');
td.appendChild(input);
tr.appendChild(td);

selectedColumns.forEach(function (column) {
  var cell = document.createElement("td");
  cell.textContent = row[headers.indexOf(column)];
  //cell.innerHTML = row[headers.indexOf(column)];
  tr.appendChild(cell);
  });

const tdplay = document.createElement("td");
var input = document.createElement('button');
//input.type = "button";
input.innerText = "Play";
input.id = "button" + rowno;
input.setAttribute('onclick', 'speakRowData(this.parentNode.parentNode)');
tdplay.appendChild(input);
tr.appendChild(tdplay);
table.appendChild(tr);
});

downloadCsvBtn.disabled = false;
hideFileColPopup();
createColumnCheckboxes();
}


//translation related start

var transpopup = document.getElementById('transpopup');
var transpopupButton = document.getElementById('popupButton');
var translateButton = document.getElementById('translateButton');
var transapplyButton = document.getElementById('applyButton');
var srctxtPopup = document.getElementById('srctext-popup');
var tratextPopup = document.getElementById('tratext-popup');
var srclangSelect = document.getElementById('srclang');
var tgtlangSelect = document.getElementById('tgtlang');
var srclangval = 'en';
var tgtlangval = 'en';

transpopupButton.addEventListener('click', function () {
    transpopup.classList.add('active');
    //srctxtPopup.value = srctxt.value;
});

srclangSelect.addEventListener("change", () => {
    srclangval = document.getElementById("srclang").value;
});

// tgtlangSelect.addEventListener("change", () => {
//     tgtlangval = document.getElementById("tgtlang").value;
// });


translateButton.addEventListener('click', function () {
  var table = document.getElementById("transpopup-table");
  var rows = table.getElementsByTagName("tr");
    var totalcols = rows[0].getElementsByTagName("td").length;

    translate(srclangval, totalcols);
});

transapplyButton.addEventListener('click', function () {

  var totaldata="";
  lines = [];
  tableHeaders = [];

  var srcText = $("#srctext-popup").val();

  var table = document.getElementById("transpopup-table");
  var rows = table.getElementsByTagName("tr");
    var totalcols = rows[0].getElementsByTagName("td").length;
    var srcLines = srcText.split("\n");
    //lines[0] = ['word'];
    headers = ['word'];
    console.log("totalcols=="+totalcols);
    totaldata ="word,";
    // for(i=0;i<totalcols;i++){
    //   lines[0].push('trans-'+i);
    //   headers.push('trans-'+i);
    // }

    // for (var j = 0; j < srcLines.length; j++) {
    //   lines[j+1]=[];
    //   lines[j+1].push(srcLines[j]);

    // for(i=0;i<totalcols;i++){
    //     var tgtText = $("#tratext-popup-"+(i+1)).val();
    //     var tgtLines = tgtText.split("\n");
    //     lines[j+1].push(tgtLines[j]);
    //   }
    // }

    for(i=0;i<totalcols;i++){
      totaldata = totaldata+ "trans-"+i +",";
      headers.push('trans-'+i);
    }
    totaldata = totaldata+ "\n";

    for (var j = 0; j < srcLines.length; j++) {
    totaldata = totaldata + srcLines[j]+",";
    for(i=0;i<totalcols;i++){
        var tgtText = $("#tratext-popup-"+(i+1)).val();
        var tgtLines = tgtText.split("\n");
        totaldata = totaldata + tgtLines[j]+",";
      }
      totaldata = totaldata+ "\n";
    }

    lines=totaldata.split("\n");

        var popup = document.getElementById("colpopup");
        popup.style.display = "block";

        showFileColPopup(headers);
        console.log("linesssssddds=="+totaldata);
        console.log("linessssss length=="+lines.length);


        // $("#myTable").empty();
        // for (var i = 0; i < srcLines.length; i++) {
        //     var srcRow = "<tr><td>" + srcLines[i] + "</td><td>" + tgtLines[i] + "</td></tr>";
        //     $("#myTable").append(srcRow);
        // }
    transpopup.classList.remove('active'); // Close the transpopup
});

async function translate(sourceLang, totalcols) {

  document.getElementById('translateButton').disabled = true;
    var sourceText = $('textarea#srctext-popup').val();

    for(i=0;i<totalcols;i++){
      var tgtlangselectElement = document.getElementById("tgtlang-"+(i+1));
      var targetLang = tgtlangselectElement.value;
    var finalstr = "";
    //var sourceText = encodeURIComponent(document.getElementById('srctext-popup').value);

    var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(sourceText);
    console.log(url);
    // $.getJSON(url, function (data) {
    //     $.each(data[0], function (index, val) {
    //         finalstr += val[0];
    //     });
    //     $('textarea#tratext-popup').val(finalstr);
    // });

    await $.ajax({
      url: url,
      type: "GET",
      dataType: "json",
      success: function (response) {
          var translatedText = response[0][0][0];
          console.log('tratext-popup-'+(i+1));
          document.getElementById('tratext-popup-'+(i+1)).value = translatedText;
      },
      error: function (error) {
          console.log("Translation failed: " + error);
      },
      complete: function () {
          // Enable the translate button after the translation is complete
          document.getElementById('translateButton').disabled = false;
      }
  });
    }

}        

function addTransColumn() {
  var table = document.getElementById("transpopup-table");
  var rows = table.getElementsByTagName("tr");
  var columnNumber = rows[0].getElementsByTagName("td").length + 1;

  // Assuming you have a select element with the id "mySelect"
var selectElement = document.getElementById("srclang");
var options = selectElement.options;



  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var cell = row.insertCell(-1);
    
    var tralable = document.createElement("label");
    tralable.for = "traselect-";
    tralable.textContent = "Translation Language:";
    var traselect = document.createElement("select");
    traselect.id = "tgtlang-"+columnNumber;
    var tratextarea = document.createElement("textarea");
    tratextarea.id = "tratext-popup-"+columnNumber;
    tratextarea.rows = 4;
    tratextarea.cols = 30;
    tratextarea.readOnly = true;
    // Add options to the select element
    // var options = ["Option 1", "Option 2", "Option 3"];
    // for (var j = 0; j < options.length; j++) {
    //   var option = document.createElement("option");
    //   option.text = options[j];
    //   traselect.add(option);
    // }
    // Convert options to an array and use forEach to iterate over them
    Array.from(options).forEach(function(option) {
      var traoption = document.createElement("option");
      traoption.value = option.value;
      traoption.text = option.text;
      traselect.add(traoption);
    });

    cell.appendChild(tralable);
    cell.appendChild(traselect);
    cell.appendChild(tratextarea);
    cell.appendChild(document.createElement("br"));
    

  }
}
//translation related end
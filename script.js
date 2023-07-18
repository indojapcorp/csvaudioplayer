let csvfilename = '';
let recognition;
//let csvData = null;
let tableHeaders = [];
//event listener for studyList selection start
const fetchURL = window.location.origin.includes('localhost')
    ? '/data/'
    : '/csvaudioplayer/data/';

const studyListsElement = document.getElementById("studyLists");
studyListsElement.setAttribute('onchange', 'studyListsChanged()');
// Create a map of filepath and displayvalue
const fileMap = new Map();
fileMap.set(fetchURL+'50langvocab_all.csv', '50langvocab_all');
fileMap.set(fetchURL+'50langvocab_german_french.csv', '50langvocab_german_french');
fileMap.set(fetchURL+'50langvocab_japanese.csv', '50langvocab_japanese');
fileMap.set(fetchURL+'GRE_1300.csv', 'GRE_1300');

// Fill the options of selectElement using forEach
fileMap.forEach((displayValue, filePath) => {
  const option = document.createElement('option');
  option.text = displayValue;
  option.value = filePath;
  studyListsElement.appendChild(option);
});


function studyListsChanged() {
  const studyListsElement = document.getElementById("studyLists");
  const selectedValue = studyListsElement.value;
  const fileName = selectedValue;


  fetch(fileName)
    .then(response => response.text())
    .then(content => {
      // Set the fileContent variable with the retrieved content
      const fileContent = content;

      const mimeType = 'text/plain';

      // Create a Blob object from the file content
      const blob = new Blob([fileContent], { type: mimeType });

      // Create a File object from the Blob
      const file = new File([blob], fileName);
      showcolPopup();
      console.log("file="+file);
      readCSV(file);

      // Perform further operations with the file content
    })
    .catch(error => {
      console.error('Error fetching file content:', error);
    });

}
//event listener for studyList selection end


// Event listener for the file input element
const fileInput = document.getElementById("csvFileInput");
fileInput.addEventListener("change", function (event) {
  showcolPopup();
  const file = fileInput.files[0];

  if(file.name.endsWith("json")){
    readJSON(file);
  }else{
    readCSV(file);
  }



  //readCSV(event);
  //loadTable(event);
});
fileInput.addEventListener("click", function (event) {
  showcolPopup();
});

const csvURLInputBtn = document.getElementById("csvURLInputBtn");
csvURLInputBtn.addEventListener("click", function (event) {
  showcolPopup();
    var url = document.getElementById("urlInput").value;
    fetch(url, {
      headers: {
                      "Accept": "text/plain"
                  },
      responseType: "text"
    })
      .then(response => response.text())
      .then(data => {
        console.log("data=="+data);
        readJSONFromURL(url,data);
      })
      .catch(error => {
        console.log(error);
      });
});


function fetchText() {
  var url = document.getElementById("urlInput").value;
  fetch(url, {
    headers: {
                    "Accept": "text/plain"
                },
    responseType: "text"
  })
    .then(response => response.text())
    .then(data => {
      document.getElementById("textInput").value = data;
    })
    .catch(error => {
      console.log(error);
    });
}

// create HTML table with two columns english and japanese.
// first column has english text , second column has Japanese text.
// render the table with few sample rows.
// Add speak button and on click of it speak the contents of the table using javascript TTS. 


function updateCounter() {
  //var checkboxes = document.getElementById("myTable").querySelectorAll('input[type="checkbox"]');
  var checkboxes = document.getElementById("myTable").querySelectorAll('input[type="checkbox"][name^="row"]');
  var counter = 0;
  checkboxes.forEach(function (checkbox) {
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
  //hideDropdown(inputField);

  var input, filter, table, tr, td, i;
  input = document.getElementById("input_" + columnIndex);
  filter = input.value.toUpperCase();
  var filterType = determineFilterType(filter);

  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");
  var displayTRCount = 0;
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[columnIndex + 1];
    if (td) {
      var cellText = td.innerHTML.toUpperCase();
      var shouldDisplay = applyFilter(cellText, filter, filterType);
      if (shouldDisplay) {
        tr[i].style.display = "";
        displayTRCount++;
      } else {
        tr[i].style.display = "none";
      }
    }
  }
  recordCount = displayTRCount;
  document.getElementById("recordCount").textContent = recordCount;
}

function isNumeric(value) {
  return /^\d+$/.test(value);
}

function determineFilterType(filter) {
  if (filter.startsWith("^")) {
    return "starts-with";
  } else if (filter.startsWith("$")) {
    return "ends-with";
  } else if (filter.startsWith(">")) {
    return "length-greater";
  } else if (filter.startsWith("<")) {
    return "length-smaller";
  } else if (filter.startsWith("=")) {
    return "length-equals";
  } else if (filter.startsWith("%")) {
    return "numeric";
  } else if (filter.startsWith("!")) {
    return "hiragana";
  } else if (filter.startsWith("#")) {
    return "katakana";
  } else {
    return "default";
  }
}

function applyFilter(cellText, filter, filterType) {
  switch (filterType) {
    case "starts-with":
      var startingText = filter.substring(1);
      return cellText.startsWith(startingText);
    case "ends-with":
      var endingText = filter.substring(1);
      return cellText.endsWith(endingText);
    case "length-greater":
      var lengthThreshold = parseInt(filter.substring(1));
      return cellText.length > lengthThreshold;
    case "length-smaller":
      var lengthThreshold = parseInt(filter.substring(1));
      return cellText.length < lengthThreshold;
    case "length-equals":
      var lengthThreshold = parseInt(filter.substring(1));
      return cellText.length == lengthThreshold;
    case "numeric":
      return isNumeric(cellText);
    case "hiragana":
      var hiraganaRegex = /^[\u3040-\u309F]+$/;
      return hiraganaRegex.test(cellText);
    case "katakana":
      var katakanaRegex = /^[\u30A0-\u30FF]+$/;
      return katakanaRegex.test(cellText);
    // if (isNumeric(cellText)) {
    //   console.log("numeric");
    //   return true;
    // }
    // return false;
    default:
      filter = filter.replace(/^[\^|\$|>]/, ""); // Remove the filter type character
      return cellText.indexOf(filter) > -1;
  }
}

// Sort table function
function sortTable(columnIndex) {
  var table = document.getElementById("myTable");
  var rows = Array.from(table.rows).slice(4); // Exclude the header rows

  var dir = table.getAttribute("data-sort-dir") || "asc"; // Get the sorting direction from the data attribute

  //  var dir = "asc"; // Set the sorting direction to ascending by default

  if (table.rows[3].getElementsByTagName("TH")[columnIndex].innerHTML.includes("&#9650;")) {
    dir = "desc";
  }


  rows.sort(function (a, b) {
    var cellA = a.getElementsByTagName("TD")[columnIndex].innerText.toLowerCase();
    var cellB = b.getElementsByTagName("TD")[columnIndex].innerText.toLowerCase();

    if (isNumeric(cellA) && isNumeric(cellB)) {
      return parseFloat(cellA) - parseFloat(cellB);
    } else {
      if (cellA < cellB) return -1;
      if (cellA > cellB) return 1;
      return 0;
    }

    // if (cellA < cellB) return -1;
    // if (cellA > cellB) return 1;
    // return 0;
  });

  if (dir === "desc") {
    rows.reverse();
    dir = "asc"; // Update the sorting direction to ascending
  } else {
    dir = "desc"; // Update the sorting direction to descending
  }


  // Re-append sorted rows to the table
  for (var i = 0; i < rows.length; i++) {
    table.appendChild(rows[i]);
  }

  // Update the sorting indicator in the table header
  var th = table.rows[3].getElementsByTagName("TH")[columnIndex];
  // if (dir === "asc") {
  //   th.innerHTML = th.innerHTML.replace("&#9660;", "&#9650;");
  // } else if (dir === "desc") {
  //   th.innerHTML = th.innerHTML.replace("&#9650;", "&#9660;");
  // }
  //th.innerHTML = th.innerHTML.replace("▲▼", "&#9660;");
  //th.innerHTML += (dir === "asc") ? "&#9650;" : "&#9660;";
  table.setAttribute("data-sort-dir", dir); // Set the updated sorting direction in the data attribute

  // if (dir === "asc") {
  //   th.innerHTML = th.innerHTML.replace("▲▼", "▲");
  // } else if (dir === "desc") {
  //   th.innerHTML = th.innerHTML.replace("▲▼", "▼");
  // }


}

// Sort table function
function sortTableNormal(columnIndex) {
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  table = document.getElementById("myTable");
  switching = true;
  dir = "asc"; // Set the sorting direction to ascending by default

  while (switching) {
    switching = false;
    rows = table.rows;

    console.log("col ind=" + columnIndex);
    for (i = 4; i < rows.length - 1; i++) {
      shouldSwitch = false;
      x = rows[i].getElementsByTagName("TD")[columnIndex];
      y = rows[i + 1].getElementsByTagName("TD")[columnIndex];

      // Compare the cell values for sorting
      if (dir === "asc") {
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          shouldSwitch = true;
          break;
        }
      } else if (dir === "desc") {
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          shouldSwitch = true;
          break;
        }
      }
    }

    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      switchcount++;
    } else {
      if (switchcount === 0 && dir === "asc") {
        dir = "desc";
        switching = true;
      }
    }
  }

  // Update the sorting indicator in the table header
  var th = table.rows[3].getElementsByTagName("TH")[columnIndex];
  if (dir === "asc") {
    th.innerHTML = th.innerHTML.replace("&#9660;", "&#9650;");
  } else if (dir === "desc") {
    th.innerHTML = th.innerHTML.replace("&#9650;", "&#9660;");
  }

  // if (dir === "asc") {
  //   th.innerHTML = th.innerHTML.replace("▼", "▲");
  // } else if (dir === "desc") {
  //   th.innerHTML = th.innerHTML.replace("▲", "▼");
  // }
}

function selectAll(source) {
  //var checkboxes = document.getElementById("myTable").getElementsByTagName("input");
  // var checkboxes = document.getElementById("myTable").querySelectorAll('tr:not([style*="display: none;"])').querySelectorAll('input[type="checkbox"][name^="row"]')
  //var tr = document.getElementById("myTable").getElementsByTagName("tr");
  var tr = document.getElementById("myTable").querySelectorAll('tr:not([style*="display: none;"])');

  tr.forEach(function (row) {
    //const tdElements = row.querySelectorAll('td');
    if (row.cells[0]) {
      var checkbox = row.cells[0].querySelector('input[type="checkbox"]');
      if (checkbox)
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


function speakRowData(row) {
  speakcells = [];
  speakcellslang = [];
  currentCellIndex = 0;

  var table = document.getElementById("myTable");
  const columnCheckboxes = document.getElementById("columnCheckboxes").getElementsByTagName("input");
  var columnLanguages = document.getElementById("columnCheckboxes").querySelectorAll('select[id^="voices3"]');

  console.log("columnLanguages="+columnLanguages.length);
  var firstcheckboxrow = table.rows[1];
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
//const synth = window.speechSynthesis;
//var synth = window.speechSynthesis;

//const utterance = new SpeechSynthesisUtterance();

// const playBtn = document.getElementById('playBtn');
// const pauseBtn = document.getElementById('pauseBtn');
// const resumeBtn = document.getElementById('resumeBtn');
// const stopBtn = document.getElementById('stopBtn');
const downloadCsvBtn = document.getElementById('downloadCsvBtn');
const searchSpeechSearch = document.getElementById('searchSpeechSearch');
const searchSpeechSearchStop = document.getElementById('searchSpeechSearchStop');

var playBtn, pauseBtn, resumeBtn, stopBtn, playingCellSpan;
var counter = 1;
var maxCellSpeakCounter = document.getElementById('maxCellSpeakCounter'); // Speak each cell thrice
var speakSilenceTime = document.getElementById('speakSilenceTime'); //milisecond

function initButton() {
  playBtn = document.getElementById('playBtn');
  pauseBtn = document.getElementById('pauseBtn');
  resumeBtn = document.getElementById('resumeBtn');
  stopBtn = document.getElementById('stopBtn');
  playingCellSpan = document.getElementById("playingCellSpan");
  speakSilenceTime.value = 500;
}

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

  var firstcheckboxrow = table.rows[1];

  //  console.log(rowCount);
  //var selectedData = "";
  selectedDwdData = "";

  const headerRow = [];

  for (let i = 0; i < tableHeaders.length; i++) {
    var headercheckBox = firstcheckboxrow.cells[i + 1].getElementsByTagName("input")[0];
    console.log("headercheckBox i"+i);
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
var originalFontSize = '';//table.style.fontSize; // Store the original font size    
var cellsTotalSpeakTime = 0;
var currentCellSpeakTime = 0;
function speakThis() {
  var table = document.getElementById("myTable");
  originalFontSize = table.style.fontSize; // Store the original font size    
  var rowCount = table.rows.length;
  const columnCheckboxes = document.getElementById("columnCheckboxes").getElementsByTagName("input");
  //const columnLanguages = document.getElementById("columnCheckboxes").getElementsByTagName("select");
  const columnLanguages = document.getElementById("columnCheckboxes").querySelectorAll('select[id^="voices3"]');

  var firstcheckboxrow = table.rows[1];
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
  cellsTotalSpeakTime = getTotalSpeakTime();
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

  currentCellSpeakTime = currentCellSpeakTime + getApproximateSpeakTime(currentCell.innerText);

  playingCellSpan.textContent = "   Playing " + (currentCellIndex + 1) + " / " + speakcells.length + "       " + formatTime(currentCellSpeakTime) + " / " + formatTime(cellsTotalSpeakTime);

  var cellTextValue = currentCell.innerText.replace(/^\d+\.\s*/, "").replace(/^\d+\)\s*/, "").replace(/Question:|Answer:|Ans:/gi, "").replace(/[.:?]/g, '!');

  if (isMacOS) {

  //utterance.text = currentCell.innerText.replace(/[.,:?]/g, '!!!!!!');
    // Replace number and dot at the beginning with a blank
  // Replace occurrences of "Question:", "Answer:", and "Ans:" with a blank
  utterance.text = cellTextValue

  for (var i = 0; i < uttvoices.length; i++) {
      if (uttvoices[i].name === speakcellslang[currentCellIndex]) {
          utterance.voice = uttvoices[i];
          break;
      }
  }
  
  window.speechSynthesis.speak(utterance);
  // When the speech ends, move to the next cell
  utterance.onend = function () {
    if (counter < maxCellSpeakCounter.value) {
      counter++;
    } else {
      counter = 1; // Reset the counter for the next cell
    }

    setTimeout(function () {
      currentCell.style.fontSize = originalFontSize; // Reset font size
      currentCell.style.backgroundColor = ''; // Reset highlighting
      currentCellIndex++;
      playingCellSpan.textContent = "";
      speakAndHighlight(); // Speak the next cell
    }, speakSilenceTime.value);

  };
  }else{
    
    console.log("speakcellslang[currentCellIndex]="+speakcellslang[currentCellIndex]);
    responsiveVoice.speak(cellTextValue, ""+speakcellslang[currentCellIndex], {
      onstart: function() {
        console.log("Speech started");
      },
      onend: function() {
        console.log("Speech ended");
        if (counter < maxCellSpeakCounter.value) {
          counter++;
        } else {
          counter = 1; // Reset the counter for the next cell
        }
    
        setTimeout(function () {
          currentCell.style.fontSize = originalFontSize; // Reset font size
          currentCell.style.backgroundColor = ''; // Reset highlighting
          currentCellIndex++;
          playingCellSpan.textContent = "";
          speakAndHighlight(); // Speak the next cell
        }, speakSilenceTime.value);    
        // Perform additional actions or trigger other events
      }
    });
    
  }

  // Highlight the text in the current cell
  currentCell.style.fontSize = '3em';// 'larger'; // Enlarge the text
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

  // // When the speech ends, move to the next cell
  // utterance.onend = function () {
  //   if (counter < maxCellSpeakCounter.value) {
  //     counter++;
  //   } else {
  //     counter = 1; // Reset the counter for the next cell
  //   }

  //   setTimeout(function () {
  //     currentCell.style.fontSize = originalFontSize; // Reset font size
  //     currentCell.style.backgroundColor = ''; // Reset highlighting
  //     currentCellIndex++;
  //     playingCellSpan.textContent = "";
  //     speakAndHighlight(); // Speak the next cell
  //   }, speakSilenceTime.value);

  // };
}

function pause() {
  playBtn.disabled = true;
  pauseBtn.disabled = true;
  resumeBtn.disabled = false;
  stopBtn.disabled = false;

  window.speechSynthesis.pause();
}

function resume() {
  playBtn.disabled = true;
  pauseBtn.disabled = false;
  resumeBtn.disabled = true;
  stopBtn.disabled = false;

  window.speechSynthesis.resume();
}

function stop() {
  stopped = true;
  playBtn.disabled = false;
  pauseBtn.disabled = true;
  resumeBtn.disabled = true;
  stopBtn.disabled = true;

  window.speechSynthesis.cancel();
  currentCellIndex = 0;
  // Reset cell highlighting
  for (var i = 0; i < speakcells.length; i++) {
    speakcells[i].style.backgroundColor = '';
  }
  speakcells = [];
  speakcellslang = [];
}

function getApproximateSpeakTime(text) {
  // Adjust this value according to the average speech rate (in seconds per word)
  var averageSpeechRate = 0.5;

  // Split the text into words and calculate the approximate speak time
  var words = text.split(' ');
  var speakTime = words.length * averageSpeechRate;
  return speakTime + (speakSilenceTime.value / 1000);
}

function getTotalSpeakTime() {
  var totalSpeakTime = 0;

  for (var i = 0; i < speakcells.length; i++) {
    var cell = speakcells[i];
    var cellSpeakTime = getApproximateSpeakTime(cell.innerText);
    totalSpeakTime += cellSpeakTime + 0.4;
  }

  return totalSpeakTime;
}

function formatTime(seconds) {
  var hours = Math.floor(seconds / 3600);
  var minutes = Math.floor((seconds % 3600) / 60);
  var remainingSeconds = Math.floor(seconds % 60);

  var formattedTime = '';

  if (hours > 0) {
    formattedTime += hours + 'hr:';
  }

  if (minutes < 10) {
    formattedTime += '0';
  }
  formattedTime += minutes + 'min:';

  if (remainingSeconds < 10) {
    formattedTime += '0';
  }
  formattedTime += remainingSeconds + "sec";

  return formattedTime;
}

function highlightText(utterance, cell) {
  var originalColor = cell.style.backgroundColor;

  utterance.onstart = function () {
    cell.style.backgroundColor = "yellow";
  };

  utterance.onend = function () {
    cell.style.backgroundColor = originalColor;
  };
}



downloadCsvBtn.addEventListener('click', () => {
  selectedDwdData = "";
  // set the text to speak
  //utterance.text = transcriptTextarea.value.substring(transcriptTextarea.selectionStart, transcriptTextarea.selectionEnd);
  getSelectedDataForDownload();
  downloadAsCSV(selectedDwdData);
});

if(searchSpeechSearch){
searchSpeechSearch.addEventListener('click', () => {
  startRecognition()
});

searchSpeechSearchStop.addEventListener('click', () => {
  stopRecognition()
});
}

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
  const columnCheckboxesTable = document.getElementById("columnCheckboxes");
  columnCheckboxesTable.innerHTML = "";
    
  tableHeaders.forEach(function (header, rownum) {

    addRowWin(header,rownum);


  });
}


// Function to toggle the display of table columns
function toggleColumnApply() {
  const table = document.getElementById("myTable");
  const columnCheckboxes = document.getElementById("columnCheckboxes").getElementsByTagName("input");


  tableHeaders.forEach(function (header, i) {
    const columnIndex = tableHeaders.indexOf(header) + 1;

    var row = table.rows[1];
    var checkBox = row.cells[columnIndex].getElementsByTagName("input")[0];
    if (!columnCheckboxes[i].checked)
      checkBox.checked = false;

    for (let row of table.rows) {
      const cell = row.cells[columnIndex];
      if (cell) {
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

  var row = table.rows[1];
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
}

// Function to hide the column selection popup
function hideAndApplyColumnPopup() {
  const popup = document.getElementById("columnPopup");
  popup.style.display = "none";
  toggleColumnApply();
}

// Function to hide the column selection popup
function checkAll() {
  const columnCheckboxes = document.getElementById("columnCheckboxes").getElementsByTagName("input");

  tableHeaders.forEach(function (header, i) {
    columnCheckboxes[i].checked = true;
  });
}

// Function to hide the column selection popup
function uncheckAll() {
  const columnCheckboxes = document.getElementById("columnCheckboxes").getElementsByTagName("input");
  tableHeaders.forEach(function (header, i) {
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
var headersLanguage; // Declare headers as a global variable
// Function to display the popup with header checkboxes
function showFileColPopup(headers) {

  var filecolpopup = document.getElementById("colpopup");
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


    // is category start
    var isCategorycheckbox = document.createElement("input");
    isCategorycheckbox.type = "checkbox";
    isCategorycheckbox.name = "categorycolumn";
    //isCategorycheckbox.value = "Is Category Col?";
    isCategorycheckbox.checked = false;
    checkboxes.appendChild(isCategorycheckbox);

    var isCategorylabel = document.createElement("label");
    isCategorylabel.appendChild(document.createTextNode("Is Category Col?"));
    checkboxes.appendChild(isCategorylabel);
    // is category end



    checkboxes.appendChild(document.createElement("br"));
  });

  filecolpopup.style.display = "block";
}

// Function to show the popup
function showcolPopup() {
  var filecolpopup = document.getElementById("colpopup");
  filecolpopup.style.display = "block";
}


// Function to hide the popup
function hideFileColPopup() {
  var filecolpopup = document.getElementById("colpopup");
  filecolpopup.style.display = "none";
}

// Function to read the selected CSV file
// function readCSV(event) {
// var file = event.target.files[0];

function readCSV(file) {
  if (!file)
    return;

  csvfilename = file.name;
  var reader = new FileReader();

  reader.onload = function (e) {
    var contents = e.target.result;
    lines = contents.split("\n");
    headers = lines[0].split(",");
    headersLanguage = [];
    headers.forEach(function () {
      headersLanguage.push('en');
    });

    var filecolpopup = document.getElementById("colpopup");
    filecolpopup.style.display = "block";

    csvData = [];

    for (var i = 1; i < lines.length; i++) {
      if (lines[i].length == 0)
        continue;
  
      var row = lines[i].split(",");
      csvData.push(row);
    }
  


    showFileColPopup(headers);
  };

  reader.readAsText(file);
}

function readJSONFromURL(url,data) {
  lines = [];
  headersLanguage = [];
  headers = [];

  csvfilename = "online";

  const jsonData = JSON.parse(data);

  csvData = [];

  const attributes = Object.keys(jsonData.data[0]);
  attributes.forEach(function(item) {
    headers.push(item);
    // lines.push(item.id);
    // lines.push(item.text);
  });

  //headers = ["ID","TEXT"];
  headers.forEach(function () {
    headersLanguage.push('en');
  });

  for (var i = 0; i < jsonData.data.length; i++) {

    var rowdata="";
    for (var key in jsonData.data[i]) {
      rowdata += jsonData.data[i][key]+"#####";
    }
    lines.push(rowdata);

  } 
  // jsonData.data.forEach(function(item) {
  //   lines.push(item.id+"#####"+item.text);
  //   // lines.push(item.id);
  //   // lines.push(item.text);
  // });

  var filecolpopup = document.getElementById("colpopup");
  filecolpopup.style.display = "block";


  for (var i = 0; i < lines.length; i++) {
    if (lines[i].length == 0)
      continue;

      var row = lines[i].split("#####");
      csvData.push(row);

  }


  showFileColPopup(headers);

}

function readJSON(file) {
  if (!file)
    return;

    lines = [];
    headersLanguage = [];
    headers = [];

  csvfilename = file.name;
  var reader = new FileReader();

  reader.onload = function (e) {

    readJSONFromURL(csvfilename,event.target.result);

    /*
    const jsonData = JSON.parse(event.target.result);

    csvData = [];

    const attributes = Object.keys(jsonData.data[0]);
    attributes.forEach(function(item) {
      headers.push(item);
    });

    headers.forEach(function () {
      headersLanguage.push('en');
    });

    for (var i = 0; i < jsonData.data.length; i++) {

      var rowdata="";
      for (var key in jsonData.data[i]) {
        rowdata += jsonData.data[i][key]+"#####";
      }
      lines.push(rowdata);

    } 

    var filecolpopup = document.getElementById("colpopup");
    filecolpopup.style.display = "block";


    for (var i = 0; i < lines.length; i++) {
      if (lines[i].length == 0)
        continue;
  
        var row = lines[i].split("#####");
        csvData.push(row);
  
    }


    showFileColPopup(headers);

    */
  };

  reader.readAsText(file);
}

function showHintPopup(colnum) {
  document.getElementById("hintPopup_" + colnum).style.display = "block";
}

function hideHintPopup(colnum) {
  document.getElementById("hintPopup_" + colnum).style.display = "none";
}
var searchHint = `Search Hint:
^ starts-with
$ ends-with
> length-greater
< length-smaller
= length-equals
% numeric
! hiragana
# katakana`;

// Function to populate the table with selected columns
function populateTableNew() {
  var checkboxes = document.getElementsByName("column");
  var categorycolumncheckboxes = document.getElementsByName("categorycolumn");
  var selectedColumns = [];
  var isCategorySelectedForColumns = [];
  tableHeaders = [];
  // csvData = [];

  // for (var i = 1; i < lines.length; i++) {
  //   if (lines[i].length == 0)
  //     continue;

  //   var row = lines[i].split(",");
  //   csvData.push(row);
  // }


  // Get the selected checkboxes
  checkboxes.forEach(function (checkbox, i) {
    if (checkbox.checked) {
      selectedColumns.push(checkbox.value);
      tableHeaders.push(checkbox.value);
      isCategorySelectedForColumns.push(categorycolumncheckboxes[i].checked);
    }
  });
  // Populate the table
  var table = document.getElementById("myTable");
  table.innerHTML = "";

  var thead = document.createElement("thead");
  //var thead = document.getElementsByTagName("thead")[0];
  //start
  //var trcolcheck = table.insertRow();


  //Buttons row start
  var trcolbuttons = document.createElement("tr");
  var thcolbuttons = document.createElement("th");
  thcolbuttons.setAttribute("colspan", selectedColumns.length + 3);
  trcolbuttons.appendChild(thcolbuttons);

  var playBtn = document.createElement('button');
  playBtn.innerText = "Play";
  playBtn.id = "playBtn";
  playBtn.setAttribute('onclick', 'speakThis()');
  thcolbuttons.appendChild(playBtn);

  var pauseBtn = document.createElement('button');
  pauseBtn.innerText = "Pause";
  pauseBtn.id = "pauseBtn";
  pauseBtn.setAttribute('onclick', 'pause()');
  thcolbuttons.appendChild(pauseBtn);

  var resumeBtn = document.createElement('button');
  resumeBtn.innerText = "Resume";
  resumeBtn.id = "resumeBtn";
  resumeBtn.setAttribute('onclick', 'resume()');
  thcolbuttons.appendChild(resumeBtn);

  var stopBtn = document.createElement('button');
  stopBtn.innerText = "Stop";
  stopBtn.id = "stopBtn";
  stopBtn.setAttribute('onclick', 'stop()');
  thcolbuttons.appendChild(stopBtn);

  var playingCellSpan = document.createElement('span');
  playingCellSpan.innerText = "";
  playingCellSpan.id = "playingCellSpan";
  thcolbuttons.appendChild(playingCellSpan);

  thead.appendChild(trcolbuttons);
  //Buttons Row end

  var trcolcheck = document.createElement("tr");
  const td = document.createElement("th");
  var input = document.createElement('input');
  input.type = "checkbox";
  input.id = "allcol";
  input.setAttribute('onclick', 'selectAll(this)');
  td.appendChild(input);
  trcolcheck.appendChild(td);

  selectedColumns.forEach(function (column, i) {
    const td = document.createElement("th");
    var input = document.createElement('input');
    input.type = "checkbox";
    input.id = "col" + (i + 1);
    input.value = (i + 1);
    input.onchange = () => createFavorites();
    //input.placeholder="Filter Column "+i;

    var checkboxLabel = document.createElement('label');
    checkboxLabel.className = 'speaker-icon'; // Add the CSS class for the speaker icon
    td.appendChild(input);
    td.appendChild(checkboxLabel);

    trcolcheck.appendChild(td);
  });
  trcolcheck.appendChild(document.createElement("th"));
  //trcolcheck.appendChild(document.createElement("th"));
  thead.appendChild(trcolcheck);


  //var trcolsearch = table.insertRow();
  var trcolsearch = document.createElement("tr");
  const tdsearchblank = document.createElement("th");
  var input = document.createTextNode("");

  tdsearchblank.appendChild(input);
  trcolsearch.appendChild(tdsearchblank);
  selectedColumns.forEach(function (column, i) {

    const td = document.createElement("th");
    var input = document.createElement('input');
    input.type = "text";
    input.id = "input_" + i;
    //input.id = "searchInput";
    input.setAttribute('class', 'search-input');
    //input.setAttribute('placeholder', 'Search ...');

    input.setAttribute('onkeyup', 'filterTable(' + i + ')');
    input.placeholder = "Filter Column " + i;
    if (isCategorySelectedForColumns[i] == true) {
      input.setAttribute('onclick', 'showDropdown(this,"' + column + '")');
      input.setAttribute('onkeydown', 'hideDropdown(this)');
      td.appendChild(input);
      var catdiv = document.createElement('div');
      catdiv.setAttribute('class', 'category-dropdown');
      td.appendChild(catdiv);
    } else {
      input.setAttribute('onmouseover', 'showHintPopup(' + i + ')');
      input.setAttribute('onmouseout', 'hideHintPopup(' + i + ')');
      input.setAttribute('onclick', 'hideHintPopup(' + i + ');');
      td.appendChild(input);
      var hintdiv = document.createElement('div');
      hintdiv.id = "hintPopup_" + i;
      hintdiv.innerText = searchHint;
      hintdiv.setAttribute('class', 'hint-popup');
      td.appendChild(hintdiv);
    }

    trcolsearch.appendChild(td);
  });
  trcolsearch.appendChild(document.createElement("th"));
  //trcolsearch.appendChild(document.createElement("th"));
  thead.appendChild(trcolsearch);

  //end
  //var headerRow = table.insertRow();
  var headerRow = document.createElement("tr");
  const tdheaderblank = document.createElement("th");
  var blankheaderinput = document.createTextNode("");
  tdheaderblank.appendChild(blankheaderinput);
  headerRow.appendChild(tdheaderblank);

  selectedColumns.forEach(function (column, i) {
    var headerCell = document.createElement("th");
    headerCell.setAttribute('class', 'sortable');
    headerCell.innerHTML = column + "&#9650;&#9660;";
    headerCell.setAttribute('onclick', 'sortTable(' + (i + 1) + ')');

    headerRow.appendChild(headerCell);
  });

  // const tdheaderplaycnt = document.createElement("th");
  // tdheaderplaycnt.textContent = 'PlayCnt'
  // headerRow.appendChild(tdheaderplaycnt);
  headerRow.appendChild(document.createElement("th"));

  thead.appendChild(headerRow);
  table.appendChild(thead);
  initButton();

  // csvData = [];

  // for (var i = 1; i < lines.length; i++) {
  //   if(lines[i].length==0)
  //     continue;

  //   var row = lines[i].split(",");

  //   if(row.length==1)
  //     console.log("blank row==="+row);
  //     csvData.push(row);  
  // }


  recordCount = csvData.length;
  document.getElementById("recordCount").textContent = recordCount;

  //var uniqueCategories = [...new Set()];


  csvData.forEach(function (row, rowno) {
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


    selectedColumns.forEach(function (column, i) {
      var cell = document.createElement("td");
      var rowcoldata=row[headers.indexOf(column)];

      cell.textContent = rowcoldata;
      if (isNumeric(rowcoldata)) {
        var filterInput = document.getElementById("input_" + i);
        filterInput.setAttribute('class', 'search-input-small');
        cell.classList.add('numeric-column');
      }

      //cell.innerHTML = row[headers.indexOf(column)];
      tr.appendChild(cell);
    });

    // const tdplaycnt = document.createElement("td");
    // tdplaycnt.textContent = '0';
    // tr.appendChild(tdplaycnt);

    const tdplay = document.createElement("td");
    var input = document.createElement('button');
    input.innerText = "Play";
    input.id = "button" + rowno;
    input.setAttribute('onclick', 'speakRowData(this.parentNode.parentNode)');
    tdplay.appendChild(input);

    var recinput = document.createElement('button');
    recinput.textContent = "\u25C9";
    recinput.id = "recbutton" + rowno;
    recinput.setAttribute('onclick', 'startStopRecording(this,this.parentNode.parentNode)');
    tdplay.appendChild(recinput);

    var resultspan = document.createElement('label');
    resultspan.innerHTML = "";
    resultspan.id = "resultrecbutton" + rowno;
    tdplay.appendChild(resultspan);


    tr.appendChild(tdplay);
    table.appendChild(tr);
  });

  downloadCsvBtn.disabled = false;
  hideFileColPopup();
  //getVoices();
  createColumnCheckboxes();

}

function isNumeric(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

function showDropdown(inputField, column) {
  console.log("showDropdown column=" + column);
  var uniqueCategories = new Set();
  csvData.forEach(function (row) {
    uniqueCategories.add(row[headers.indexOf(column)]);
  });
  // uniqueCategories.forEach(function(category) {
  //   console.log("category===="+category);
  // });

  const dropdown = inputField.parentElement.querySelector('.category-dropdown');
  dropdown.innerHTML = '';
  console.log("uniqueCategories.length =" + uniqueCategories.length);

  if (uniqueCategories.size > 0) {
    for (const category of uniqueCategories) {
      const button = document.createElement('button');
      button.textContent = category;
      dropdown.appendChild(button);
    }
    dropdown.style.display = 'block';
    dropdown.addEventListener('click', (event) => {
      const target = event.target;
      if (target.nodeName === 'BUTTON') {
        inputField.value = target.textContent;
        filterTable(headers.indexOf(column));
        hideDropdown(inputField);
        console.log("hideDropdown");
      }
    });
  }
}

function hideDropdown(inputField) {
  const dropdown = inputField.parentElement.querySelector('.category-dropdown');
  dropdown.style.display = 'none';
}

function filterCategories(inputField) {
  const filterValue = inputField.value.trim().toLowerCase();
  const filteredRows = allRows.filter(row => {
    const category = row.querySelector('td:first-child').textContent.trim().toLowerCase();
    return category.includes(filterValue);
  });

  allRows.forEach(row => {
    if (filteredRows.includes(row)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

//translation related start

var transpopup = document.getElementById('transpopup');
var transpopupButton = document.getElementById('popupButton');
var translateButton = document.getElementById('translateButton');
var transapplyButton = document.getElementById('applyButton');
var transcancelButton = document.getElementById('canceltransButton');
var srctxtPopup = document.getElementById('srctext-popup');
var tratextPopup = document.getElementById('tratext-popup');
var srclangSelect = document.getElementById('srclang');
var tgtlangSelect = document.getElementById('tgtlang');
var srclangval = 'en';
var tgtlangval = 'en';

transpopupButton.addEventListener('click', function () {

  selectedDwdData = "";
  getSelectedDataForDownload();
  srctxtPopup.value = selectedDwdData;

  transpopup.classList.add('active');
  resetPopup();
  //srctxtPopup.value = srctxt.value;
});

srclangSelect.addEventListener("change", () => {
  srclangval = document.getElementById("srclang").value;
});

// tgtlangSelect.addEventListener("change", () => {
//     tgtlangval = document.getElementById("tgtlang").value;
// });

transcancelButton.addEventListener('click', function () {
  transpopup.classList.remove('active'); // Close the transpopup
});


translateButton.addEventListener('click', function () {
  var table = document.getElementById("transpopup-table");
  var rows = table.getElementsByTagName("tr");
  var totalcols = rows[0].getElementsByTagName("td").length;

  if (transCheck())
    translate(srclangval, totalcols);
});

transapplyButton.addEventListener('click', function () {

  var totaldata = "";
  lines = [];
  tableHeaders = [];

  var srcText = $("#srctext-popup").val();

  var table = document.getElementById("transpopup-table");
  var rows = table.getElementsByTagName("tr");
  var totalcols = rows[0].getElementsByTagName("td").length;
  var srcLines = srcText.split("\n");


  var srcLang = document.getElementById("srclang").value;


  //lines[0] = ['word'];
  headers = ['word'];
  headersLanguage = [srcLang];
  totaldata = "word,";
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

  for (i = 0; i < totalcols; i++) {
    totaldata = totaldata + "trans-" + i + ",";
    headers.push('trans-' + i);
    var tgtlangselectElement = document.getElementById("tgtlang-" + (i + 1));
    var targetLang = tgtlangselectElement.value;
    headersLanguage.push(targetLang);
  }
  totaldata = totaldata + "\n";

  for (var j = 0; j < srcLines.length; j++) {
    totaldata = totaldata + srcLines[j] + ",";
    for (i = 0; i < totalcols; i++) {
      var tgtText = $("#tratext-popup-" + (i + 1)).val();
      var tgtLines = tgtText.split("\n");
      totaldata = totaldata + tgtLines[j] + ",";
    }
    totaldata = totaldata + "\n";
  }

  lines = totaldata.split("\n");

  var filecolpopup = document.getElementById("colpopup");
  filecolpopup.style.display = "block";

  showFileColPopup(headers);

  // $("#myTable").empty();
  // for (var i = 0; i < srcLines.length; i++) {
  //     var srcRow = "<tr><td>" + srcLines[i] + "</td><td>" + tgtLines[i] + "</td></tr>";
  //     $("#myTable").append(srcRow);
  // }
  transpopup.classList.remove('active'); // Close the transpopup
});

async function translate(sourceLang, totalcols) {

  //document.getElementById('translateButton').disabled = true;
  var sourceText = $('textarea#srctext-popup').val();

  for (i = 0; i < totalcols; i++) {
    var tgtlangselectElement = document.getElementById("tgtlang-" + (i + 1));
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
    var translatedText = "";
    await $.getJSON(url, function (data) {
      //$('textarea#resultText').val(data[0][0][0]);

      $.each(data[0], function (index, val) {
        translatedText += val[0];
      });

      document.getElementById('tratext-popup-' + (i + 1)).value = translatedText;

      //  console.log(finalstr);
      //$('textarea#resultText').val(finalstr);
    });

    //   await $.ajax({
    //     url: url,
    //     type: "GET",
    //     dataType: "json",
    //     success: function (response) {
    //         var translatedText = response[0][0][0];
    //         console.log('tratext-popup-'+(i+1));
    //         document.getElementById('tratext-popup-'+(i+1)).value = translatedText;
    //     },
    //     error: function (error) {
    //         console.log("Translation failed: " + error);
    //     },
    //     complete: function () {
    //         // Enable the translate button after the translation is complete
    //         document.getElementById('translateButton').disabled = false;
    //     }
    // });
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
    traselect.id = "tgtlang-" + columnNumber;
    var tratextarea = document.createElement("textarea");
    tratextarea.id = "tratext-popup-" + columnNumber;
    tratextarea.rows = 4;
    tratextarea.cols = 30;
    tratextarea.readOnly = true;
    var delButton = document.createElement("button");
    delButton.textContent = 'Delete';
    delButton.id = "delbutton" + columnNumber;
    delButton.setAttribute('onclick', 'removeTransColumn(' + columnNumber + ')');


    // Add options to the select element
    // var options = ["Option 1", "Option 2", "Option 3"];
    // for (var j = 0; j < options.length; j++) {
    //   var option = document.createElement("option");
    //   option.text = options[j];
    //   traselect.add(option);
    // }
    // Convert options to an array and use forEach to iterate over them
    Array.from(options).forEach(function (option) {
      var traoption = document.createElement("option");
      traoption.value = option.value;
      traoption.text = option.text;
      traselect.add(traoption);
    });

    cell.appendChild(tralable);
    cell.appendChild(traselect);
    cell.appendChild(tratextarea);
    cell.appendChild(delButton);
    cell.appendChild(document.createElement("br"));


  }
}


function removeTransColumn(colnum) {
  var table = document.getElementById("transpopup-table");
  var rows = table.getElementsByTagName("tr");
  rows[0].deleteCell(colnum - 1);
}

function resetPopup() {
  // Reset the select elements and textareas in the popup
  var table = document.getElementById("transpopup-table");
  var rows = table.getElementsByTagName("tr");
  var columnNumber = rows[0].getElementsByTagName("td").length - 1;

  for (var i = columnNumber; i > 0; i--) {
    rows[0].deleteCell(i);
  }

  // var popup = document.getElementById("popup");
  // var selects = popup.getElementsByTagName("select");
  // var textareas = popup.getElementsByTagName("textarea");

  // for (var i = 0; i < selects.length; i++) {
  //   selects[i].selectedIndex = 0;
  // }

  // for (var j = 0; j < textareas.length; j++) {
  //   textareas[j].value = "";
  // }
}


function transCheck() {
  var sourceText = $('textarea#srctext-popup').val();
  var table = document.getElementById("transpopup-table");
  var rows = table.getElementsByTagName("tr");

  var allSelected = true;
  var allFilled = true;

  for (var i = 0; i < rows.length; i++) {
    var select = rows[i].getElementsByTagName("select")[0];
    var selectedIndex = select.selectedIndex;

    if (selectedIndex === 0) {
      allSelected = false;
    }
  }

  if (!allSelected || document.getElementById("srclang").selectedIndex === 0 || sourceText == "") {
    alert("All select elements must have a value selected and the text area should not be empty.");
    return false;
  }

  console.log("ok");
  return true;
}

//translation related end


//recording test start
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

var recordingrecognition = new SpeechRecognition();
recordingrecognition.continuous = false;
recordingrecognition.interimResults = true;
recordingrecognition.lang = "en-IN"; // Set speech recordingrecognition language to Japanese
var recordingIsRecording = false;
var recordingFinalTranscript = "";

recordingrecognition.onresult = function (event) {
  var interimTranscript = "";
  for (var i = event.resultIndex; i < event.results.length; ++i) {
    if (event.results[i].isFinal) {
      recordingFinalTranscript += event.results[i][0].transcript;
    } else {
      interimTranscript += event.results[i][0].transcript;
    }
  }
  // Optionally, you can use interimTranscript if you want to display partial results during speech recordingrecognition

  // Display only the final transcript
  //console.log("Final Transcript:", recordingFinalTranscript);
};

recordingrecognition.onend = async function () {
  // Stop recording
  var button = this.button;
  //button.innerHTML = "◉"; // Recording icon
  button.innerHTML = "\u25C9";
  recordingIsRecording = false;
  var resultCell = document.getElementById(this.cellId);
  var recordedSpeech = recordingFinalTranscript.toLowerCase();
  var expectedSpeech = this.expectedSpeech.toLowerCase();

  if (recordingrecognition.lang === 'ja' || recordingrecognition.lang === 'ja-JP') {
    try {
      var parts = await convertToHiragana(expectedSpeech + "#####" + recordedSpeech);

      if (parts.length === 2 && parts[0] === parts[1]) {
        expectedSpeech = parts[0];
        recordedSpeech = parts[1];
      }
    } catch (error) {
      console.log("Error:", error);
    }
  }

  // console.log("expectedSpeech=" + expectedSpeech);
  // console.log("recordedSpeech=" + recordedSpeech);


  var icon = document.createElement("span");
  icon.classList.add("result-icon");

  if (recordedSpeech === expectedSpeech) {
    icon.innerHTML = "&#10004;"; // Checkmark icon
    icon.classList.add("correct");
  } else {
    icon.innerHTML = "&#10006;"; // Crossmark icon
    icon.classList.add("incorrect");
  }

  resultCell.innerHTML = "";
  resultCell.appendChild(icon);

  if (recordedSpeech != expectedSpeech) {
    var spokenText = document.createElement("div");
    spokenText.classList.add("spoken-text");
    spokenText.textContent = recordedSpeech;
    resultCell.appendChild(spokenText);
  }

};

function startStopRecording(button, row) { //WithoutMicRequest
  var cellId = "result" + button.getAttribute('id');
  var expectedSpeech = button.parentElement.parentElement.firstElementChild.innerText; // Get text from first column of the corresponding row
  var buttonText = button.innerHTML;
  getRowCellData(row);
  var currentCell = speakcells[0];
  var speechLang = speakcellslang[0];
  if (speechLang == 'en') {
    recordingrecognition.lang = "en-IN";
  } else {
    recordingrecognition.lang = speechLang;
  }
  expectedSpeech = currentCell.innerText;

  //if (buttonText === "◉") { // Recording icon
  if (buttonText === "\u25C9") {
    //requestMicrophonePermissionRecording(button,row);
    // Start recording
    button.innerHTML = "\u25A0"; // Stop recording icon
    recordingrecognition.expectedSpeech = expectedSpeech;
    recordingrecognition.cellId = cellId;
    recordingrecognition.button = button;
    recordingrecognition.row = row;
    recordingFinalTranscript = ""; // Reset final transcript
    recordingrecognition.start();
    recordingIsRecording = true;
  } //else if (buttonText === "■") { // Stop recording icon
  else if (buttonText === "\u25A0") { // Stop recording icon
    // Stop recording
    //button.innerHTML = "◉"; // Recording icon
    button.innerHTML = "\u25C9"; // Recording icon
    recordingrecognition.stop();
  }
}

function getRowCellData(row) {
  clearRowResults(row);
  speakcells = [];
  speakcellslang = [];
  currentCellIndex = 0;

  var table = document.getElementById("myTable");
  const columnCheckboxes = document.getElementById("columnCheckboxes").getElementsByTagName("input");
  //const columnLanguages = document.getElementById("columnCheckboxes").getElementsByTagName("select");
  const columnLanguages = document.getElementById("columnCheckboxes").querySelectorAll('select[id^="languageCode3"]');
  var firstcheckboxrow = table.rows[1];
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
}

function clearResults() {
  var resultIcons = document.getElementsByClassName("result-icon");
  for (var i = resultIcons.length - 1; i >= 0; i--) {
    var resultIcon = resultIcons[i];
    resultIcon.parentNode.removeChild(resultIcon);
  }
  var spokentextDivs = document.getElementsByClassName("spoken-text");
  for (var i = spokentextDivs.length - 1; i >= 0; i--) {
    var spokentextDiv = spokentextDivs[i];
    spokentextDiv.parentNode.removeChild(spokentextDiv);
  }
}

function clearRowResults(row) {
  var resultIcons = row.getElementsByClassName("result-icon");
  for (var i = resultIcons.length - 1; i >= 0; i--) {
    var resultIcon = resultIcons[i];
    resultIcon.parentNode.removeChild(resultIcon);
  }
  var spokentextDivs = row.getElementsByClassName("spoken-text");
  for (var i = spokentextDivs.length - 1; i >= 0; i--) {
    var spokentextDiv = spokentextDivs[i];
    spokentextDiv.parentNode.removeChild(spokentextDiv);
  }
}

async function convertToHiragana(sentence) {
  var appId = "b4cf281c36eab27083cff91633e536f6100388c124766f9949fb635fab6c7b3b";
  var requestId = "record003";
  console.log("sentence=" + sentence);

  var requestData = {
    "app_id": appId,
    "request_id": requestId,
    "sentence": sentence,
    "output_type": "hiragana"
  };

  return new Promise(function (resolve, reject) {
    $.ajax({
      url: "https://labs.goo.ne.jp/api/hiragana",
      type: "POST",
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify(requestData),
      success: function (response) {
        //console.log("response.converted=" + response.converted);

        var parts = response.converted.split("#####");
        console.log("parts.length=" + parts.length);
        if (parts.length === 2 && parts[0] === parts[1]) {
          //console.log("The string at index 0 is equal to the string at index 1.");
          resolve(parts);
        } else {
          //console.log("The string does not meet the conditions.");
          reject("The string does not meet the conditions.");
        }
      },
      error: function (error) {
        console.log("Error:", error);
        reject(error);
      }
    });
  });
}
//recording test end
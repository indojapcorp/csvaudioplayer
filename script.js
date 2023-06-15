let csvfilename='';
let recognition;
//= new webkitSpeechRecognition();

// document.addEventListener("DOMContentLoaded", function() {
//   requestMicrophonePermission()
//     .then(function() {
//       console.log("Microphone permission granted.");
//     })
//     .catch(function(error) {
//       console.error("Failed to obtain microphone permission:", error);
//     });
// });

let csvData = null;
let tableHeaders = [];

        // Function to read the selected CSV file
        function readCSVFile(file) {
          const reader = new FileReader();
          
          reader.onload = function(e) {
              csvData = e.target.result;
              populateTable();
              createColumnCheckboxes();
          };
          
          reader.readAsText(file);
      }

              // Event listener for the file input element
              const fileInput = document.getElementById("csvFileInput");
              fileInput.addEventListener("change", function(event) {
                  const file = fileInput.files[0];
                  //readCSVFile(file);
                  loadTable(event);
                  
              });

function loadTable(event) {
  const file = event.target.files[0];
  csvfilename = file.name;
  const reader = new FileReader();
  reader.onload = () => {

    const table = document.querySelector("#myTable");
    const rows = reader.result.split("\n");
    let rowno = 1;
    downloadCsvBtn.disabled = false;

    rows.forEach(row => {
      const cells = row.split(",");

      if (rowno == 1) {
        const trcolcheck = document.createElement("tr");

        const td = document.createElement("th");
        var input = document.createElement('input');
        input.type = "checkbox";
        input.id = "allcol";
        input.setAttribute('onclick', 'selectAll(this)');
        td.appendChild(input);
        trcolcheck.appendChild(td);

        for (let i = 0; i < cells.length; i++) {
          const td = document.createElement("th");
          var input = document.createElement('input');
          input.type = "checkbox";
          input.id = "col" + (i + 1);
          input.value = (i + 1);
          input.onchange = () => createFavorites();
          //input.placeholder="Filter Column "+i;
          td.appendChild(input);
          trcolcheck.appendChild(td);
        }
        table.appendChild(trcolcheck);


        const trcolsearch = document.createElement("tr");

        const tdsearchblank = document.createElement("th");
        var input = document.createTextNode("");

        tdsearchblank.appendChild(input);
        trcolsearch.appendChild(tdsearchblank);

        for (let i = 0; i < cells.length; i++) {
          const td = document.createElement("th");
          var input = document.createElement('input');
          input.type = "text";
          input.id = "input_" + i;
          input.setAttribute('onkeyup', 'filterTable(' + i + ')');
          input.placeholder = "Filter Column " + i;
          td.appendChild(input);
          trcolsearch.appendChild(td);
        }
        table.appendChild(trcolsearch);

        const trcolheader = document.createElement("tr");

        const tdblank = document.createElement("th");
        var input = document.createTextNode("");
        tdblank.appendChild(input);
        trcolheader.appendChild(tdblank);

        for (let i = 0; i < cells.length; i++) {
          const td = document.createElement("th");
          td.textContent = cells[i];
          tableHeaders.push(cells[i]);
          trcolheader.appendChild(td);
        }
        table.appendChild(trcolheader);
      } else {
        const tr = document.createElement("tr");


        const td = document.createElement("td");
        var input = document.createElement('input');
        input.type = "checkbox";
        input.name = "row" + rowno;
        input.value = rowno;
        td.appendChild(input);
        tr.appendChild(td);

        for (let i = 0; i < cells.length; i++) {
          const td = document.createElement("td");
          td.textContent = cells[i];
          tr.appendChild(td);
        }

        const tdplay = document.createElement("th");
        var input = document.createElement('button');
        //input.type = "button";
        input.innerText = "Play";
        input.id = "button" + rowno;
        input.setAttribute('onclick', 'speakRowData(this.parentNode.parentNode)');
        tdplay.appendChild(input);
        tr.appendChild(tdplay);

        table.appendChild(tr);
      }
      rowno++;
    });
    createColumnCheckboxes();    
  };
  reader.readAsText(file);
  console.log("fname="+csvfilename);
}

function downloadAsCSV(text) {
  const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(text.replaceAll(" .! ",""));
  const link = document.createElement('a');
  var dwdfilename=csvfilename.replace(".csv","_dwd.csv")
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
    td = tr[i].getElementsByTagName("td")[columnIndex+1];
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
  var checkboxes = document.getElementsByTagName("input");
  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].type == "checkbox" && checkboxes[i].name.includes("row")) {
      checkboxes[i].checked = source.checked;
    }
  }
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
  var selectedData = "";
  for (var i = 1; i < row.cells.length; i++) {

    if (favorites.includes("" + i)) {
      selectedData += row.cells[i].innerHTML + " .!  ";
    }
  }
  var utterance = new SpeechSynthesisUtterance(selectedData);
  window.speechSynthesis.speak(utterance);
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
}



// Define the language options
const languages = {
  "English": "en-US",
  "Español": "es-ES",
  "Français": "fr-FR",
  "Deutsch": "de-DE",
  "Italiano": "it-IT",
  "日本語": "ja-JP"
};

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
const utterance = new SpeechSynthesisUtterance();

const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const stopBtn = document.getElementById('stopBtn');
const downloadCsvBtn = document.getElementById('downloadCsvBtn');
const searchSpeechSearch = document.getElementById('searchSpeechSearch');
const searchSpeechSearchStop = document.getElementById('searchSpeechSearchStop');

const languageSelect = document.getElementById("language");
languageSelect.addEventListener("change", () => {
  utterance.lang = languageSelect.value;
  deflang = languages[document.getElementById("language").value].slice(0, 2);
//  console.log(deflang);
});


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
    var headercheckBox = firstcheckboxrow.cells[i+1].getElementsByTagName("input")[0];

    if (columnCheckboxes[i].checked && headercheckBox.checked) {
        headerRow.push(encodeURIComponent(tableHeaders[i]));
    }
  }
  selectedDwdData += headerRow.join(",") + "\r\n";


            // // Add table headers to the CSV content
            // const headerRow = [];
            // for (let i = 0; i < favorites.length; i++) {
            //         headerRow.push(encodeURIComponent(table.rows[2].cells[favorites[i]].innerHTML));
            // }
            // selectedDwdData += headerRow.join(",") + "\r\n";

            
  for (var i = 3; i < rowCount; i++) {
    var row = table.rows[i];

    var checkBox = row.cells[0].getElementsByTagName("input")[0];
    const rowData = [];
    if (checkBox != undefined && checkBox.checked) {
      //for (var j = 1; j < row.cells.length; j++) {
      for (var j = 0; j < columnCheckboxes.length; j++) {  
        var checkBox = firstcheckboxrow.cells[j+1].getElementsByTagName("input")[0];

        //if (favorites.includes("" + j)) {
        //if (columnCheckboxes[j-1] && columnCheckboxes[j-1].checked) {
          if (columnCheckboxes[j].checked && checkBox.checked) {  
  
          //selectedData += row.cells[j].innerHTML + ",";
          rowData.push(row.cells[j+1].innerHTML);
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

playBtn.addEventListener('click', () => {
  // set the text to speak
  //utterance.text = transcriptTextarea.value.substring(transcriptTextarea.selectionStart, transcriptTextarea.selectionEnd);
  getSelectedData();
  speakText(selectedData);
});

// pause the TTS when the pause button is clicked
pauseBtn.addEventListener('click', () => {
  synth.pause();
});

// resume the TTS when the resume button is clicked
resumeBtn.addEventListener('click', () => {
  synth.resume();
});

// stop the TTS when the stop button is clicked
stopBtn.addEventListener('click', () => {
  synth.cancel();
//  console.log('stopped');
});

downloadCsvBtn.addEventListener('click', () => {
  selectedDwdData="";
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
  return new Promise(function(resolve, reject) {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(function(stream) {
        stream.getTracks().forEach(function(track) {
          track.stop();
        });
        resolve();
      })
      .catch(function(error) {
        reject(error);
      });
  });
}

function startRecognitionNew() {
  requestMicrophonePermission()
    .then(function() {
      recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
      recognition.lang = "en-IN"; // Specify the desired language for speech recognition
      //recognition.lang = languages[document.getElementById("language").value];
      recognition.onresult = function(event) {
        const speechResult = event.results[0][0].transcript;
        searchAndSelectWord(speechResult);
      };

      recognition.onend = function() {
        recognition.start(); // Restart speech recognition after it ends
      };

      recognition.start();
    })
    .catch(function(error) {
      console.error(error);
    });
    searchSpeechSearch.disabled = true;
    searchSpeechSearchStop.disabled = false;
}
let speechstop=false;
        // Define the function to start speech recognition
        function startRecognition() {
          recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
          speechstop=true;
          recognition.lang = "en-IN";

          recognition.onresult = function(event) {
            const speechResult = event.results[0][0].transcript;
            console.log("transcript="+speechResult);

            searchAndSelectWord(speechResult);
          };
        
          recognition.onend = function() {
            if(!speechstop)
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
        speechstop=true;
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
      
      function searchAndSelectWord2(word) {
        const textNode = document.createTextNode(word);
        const searchRange = document.createRange();
        searchRange.selectNodeContents(document.body);
      
        console.log("word="+document.body.textContent);
        let startOffset = 0;
        let endOffset = 0;
        const regex = new RegExp(word, "gi");
        
        while (window.find(regex, false, false, false, false, false, false)) {
          const range = window.getSelection().getRangeAt(0);
          if (range.compareBoundaryPoints(Range.START_TO_START, searchRange) < 0) {
            startOffset = range.toString().length;
          }
          endOffset = startOffset + range.toString().length;
        }
      
        if (startOffset !== 0 || endOffset !== 0) {
          const rangeToSelect = document.createRange();
          rangeToSelect.setStart(textNode, startOffset);
          rangeToSelect.setEnd(textNode, endOffset);
      
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(rangeToSelect);
        }
      }
      

      
function speakText(text) {
  utterance.text = text;

  var words = text.split(" ");
  var currentWord = 0;
  utterance.voice = speechSynthesis.getVoices()
    .find(voice => voice.name === voices[document.getElementById("language").value]);

  var words = text.split(" ");
  var currentWord = 0;
  var startOffset = 0;
  var endOffset = 0;
  var intervalId = null;

  // add event listeners to utterance
  utterance.onstart = () => {
    playBtn.disabled = true;
    pauseBtn.disabled = false;
    resumeBtn.disabled = true;
    stopBtn.disabled = false;
  };

  utterance.onpause = () => {
    playBtn.disabled = true;
    pauseBtn.disabled = true;
    resumeBtn.disabled = false;
    stopBtn.disabled = false;
  };

  utterance.onresume = () => {
    playBtn.disabled = true;
    pauseBtn.disabled = false;
    resumeBtn.disabled = true;
    stopBtn.disabled = false;
  };

  utterance.onend = () => {
    playBtn.disabled = false;
    pauseBtn.disabled = true;
    resumeBtn.disabled = true;
    stopBtn.disabled = true;
    window.getSelection().empty();
  };

  // speak the text
  synth.speak(utterance);
}


function speakMessage(message, PAUSE_MS = 500, lang) {
  try {
    const messageParts = message.split(/\r?\n/)




    let currentIndex = 0

    const speak = (textToSpeak) => {
      const utterance = new SpeechSynthesisUtterance();
      const voices = window.speechSynthesis.getVoices();
      utterance.voice = speechSynthesis.getVoices()
        .find(voice => voice.name === voices[document.getElementById("language").value]);
      utterance.volume = 1; // 0 to 1
      utterance.rate = 1; // 0.1 to 10
      utterance.pitch = 1; // 0 to 2
      utterance.text = textToSpeak;
      utterance.lang = lang;

      // add event listeners to utterance


      utterance.onstart = () => {
        playBtn.disabled = true;
        pauseBtn.disabled = false;
        resumeBtn.disabled = true;
        stopBtn.disabled = false;
      };

      utterance.onpause = () => {
        playBtn.disabled = true;
        pauseBtn.disabled = true;
        resumeBtn.disabled = false;
        stopBtn.disabled = false;
      };

      utterance.onresume = () => {
        playBtn.disabled = true;
        pauseBtn.disabled = false;
        resumeBtn.disabled = true;
        stopBtn.disabled = false;
      };


      utterance.onend = function () {
        currentIndex++;
        if (currentIndex < messageParts.length) {
          setTimeout(() => {
            speak(messageParts[currentIndex])
          }, PAUSE_MS)
        }
      };
      //speechSynthesis.speak(msg);
      synth.speak(utterance);
    }
    speak(messageParts[0])
  } catch (e) {
    console.error(e)
  }
}


        // Function to populate the table with CSV data
        function populateTable() {
          const table = document.getElementById("myTable");
          table.innerHTML = "";
          
          const rows = csvData.split("\n");
          
          // Create table headers
          const headerRow = document.createElement("tr");
          for (let header of rows[0].split(",")) {
              const th = document.createElement("th");
              th.textContent = header;
              headerRow.appendChild(th);
              tableHeaders.push(header);
          }
          table.appendChild(headerRow);
          
          // Create table rows
          for (let i = 1; i < rows.length; i++) {
              const row = document.createElement("tr");
              const rowData = rows[i].split(",");
              
              for (let j = 0; j < rowData.length; j++) {
                  const cell = document.createElement(i === 1 ? "th" : "td");
                  cell.textContent = rowData[j];
                  row.appendChild(cell);
              }
              
              table.appendChild(row);
          }
      }

        // Function to create checkboxes for column selection
        function createColumnCheckboxes() {
          const columnCheckboxes = document.getElementById("columnCheckboxes");
          columnCheckboxes.innerHTML = "";

          for (let header of tableHeaders) {
              const checkbox = document.createElement("input");
              checkbox.type = "checkbox";
              checkbox.value = header;
              checkbox.checked = true;
              checkbox.onchange = function() {
                  toggleColumn(header,checkbox.checked);
              };

              const label = document.createElement("label");
              label.textContent = header;
              
              const checkboxContainer = document.createElement("div");
              checkboxContainer.appendChild(checkbox);
              checkboxContainer.appendChild(label);
              
              columnCheckboxes.appendChild(checkboxContainer);
          }
      }
      
      // Function to toggle the display of table columns
      function toggleColumn(header,ischecked) {
          const table = document.getElementById("myTable");
          const columnIndex = tableHeaders.indexOf(header)+1;
          
          var row = table.rows[0];
          var checkBox = row.cells[columnIndex].getElementsByTagName("input")[0];
          if(!ischecked)
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
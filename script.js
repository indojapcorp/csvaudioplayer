function loadTable(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    const table = document.querySelector("#myTable");
    const rows = reader.result.split("\n");
    let rowno = 1;
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
        //var input = document.createElement('input');
        //input.type = "hidden";
        //input.name="rowh"+rowno;
        //input.value=rowno;
        tdblank.appendChild(input);
        trcolheader.appendChild(tdblank);

        for (let i = 0; i < cells.length; i++) {
          const td = document.createElement("th");
          td.textContent = cells[i];
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
  };
  reader.readAsText(file);
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
  console.log(favorites)
}



function speakRowData(row) {
  var selectedData = "";
  for (var i = 1; i < row.cells.length; i++) {

    if (favorites.includes("" + i)) {
      selectedData += row.cells[i].innerHTML + " .!  ";
    }
  }
  console.log("selectedData=" + selectedData);
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

const languageSelect = document.getElementById("language");
languageSelect.addEventListener("change", () => {
  utterance.lang = languageSelect.value;
  deflang = languages[document.getElementById("language").value].slice(0, 2);
  console.log(deflang);
});


let selectedData = "";

function getSelectedData() {
  var table = document.getElementById("myTable");
  var rowCount = table.rows.length;
  console.log(rowCount);
  //var selectedData = "";
  selectedData = "";

  for (var i = 3; i < rowCount; i++) {
    var row = table.rows[i];
    var checkBox = row.cells[0].getElementsByTagName("input")[0];
    console.log("checkBox=" + checkBox);
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
  console.log('stopped');
});


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
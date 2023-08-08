var langCodeVoicesDict = {}; // Define the langCodeVoicesDict variable
var selectedLanguageCode = {}; // Track the selected language code for each row
var selectedVoiceGroup = {}; // Track the selected voice group for each row
var voiceGroups = {};
var uttvoices;

// Check if the page is loaded from a mobile device
var isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|Windows Phone/i.test(navigator.userAgent);

// Check if the page is loaded from Windows
var isWindows = /Windows/i.test(navigator.userAgent);

// Check if the page is loaded from macOS
var isMacOS = /Macintosh|Mac OS X/i.test(navigator.userAgent);
//isMacOS = false;
//var synth = window.speechSynthesis;

function getLanguageDisplayName(langcode) {

    const languageName = new Intl.DisplayNames(['en'], { type: 'language' }).of(langcode);
    return languageName;

    // if(isMacOS){
    // const languageName = new Intl.DisplayNames(['en'], { type: 'language' }).of(langcode);
    // return languageName;
    // }else{
    //     return langcode;
    // }
}

function getMobileVoices(){
    if ('speechSynthesis' in window) {


        let voices = [];

        function populateVoiceList() {

            console.log("getMobileVoices uttvoices.length="+uttvoices.length);
            //voices = window.speechSynthesis.getVoices();
            // Group voices by language
            voiceGroups = {};
            for (var i = 0; i < uttvoices.length; i++) {
                var voice = uttvoices[i];
                console.log("voice="+voice);
                console.log("voice.lang="+voice.name);
    
                var lang = voice.lang;
    
    
                if (!(lang in voiceGroups)) {
                    voiceGroups[lang] = [];
                }
    
                voiceGroups[lang].push(voice);
            }
            console.log("voiceGroups="+voiceGroups.length);
    
            // Fill the langCodeVoicesDict dictionary
            for (var lang in voiceGroups) {
                var langCode = lang.split('-')[0]; // Get the language code
    
                if (!(langCode in langCodeVoicesDict)) {
                    langCodeVoicesDict[langCode] = [];
                }
    
                langCodeVoicesDict[langCode].push(voiceGroups[lang]);
            }
    
            // Populate the languageCode select for each row
            var rows = document.querySelectorAll('.voice-row');
    
            rows.forEach(function (row) {
                var languageCodeSelect = row.querySelector('.languageCode');
                languageCodeSelect.innerHTML = ''; // Clear existing options
                var seloption = document.createElement('option');
                languageCodeSelect.appendChild(seloption);
    
                Object.keys(langCodeVoicesDict).forEach(function (langCode) {
                    var option = document.createElement('option');
                    option.value = langCode;
                    //option.textContent = langCode;
                    option.textContent = getLanguageDisplayName(langCode);

                    languageCodeSelect.appendChild(option);
                });
            });
    
            // Get sorted languages
            var sortedLanguages = Object.keys(voiceGroups).sort();

        }

        function loadVoices() {
            uttvoices = speechSynthesis.getVoices();
            if (uttvoices.length === 0) {
                setTimeout(loadVoices, 100);
            } else {
                populateVoiceList();
            }
        }

        loadVoices();

    } else {
        console.log('Text-to-Speech not supported in this browser.');
    }
}
function getResponsiveVoices() {

    if ('speechSynthesis' in window) {
        // Wait for the voices to be loaded
        //var voices = window.speechSynthesis.getVoices();
        uttvoices = responsiveVoice.getVoices();

        console.log("uttvoices.length="+uttvoices.length);
        //voices = window.speechSynthesis.getVoices();
        // Group voices by language
        voiceGroups = {};
        for (var i = 0; i < uttvoices.length; i++) {
            var voice = uttvoices[i];
            console.log("voice="+voice);
            console.log("voice.lang="+voice.name);

            var lang = voice.name;


            if (!(lang in voiceGroups)) {
                voiceGroups[lang] = [];
            }

            voiceGroups[lang].push(voice);
        }
        console.log("voiceGroups="+voiceGroups.length);

        // Fill the langCodeVoicesDict dictionary
        for (var lang in voiceGroups) {
            var langCode = lang.split('-')[0]; // Get the language code

            if (!(langCode in langCodeVoicesDict)) {
                langCodeVoicesDict[langCode] = [];
            }

            langCodeVoicesDict[langCode].push(voiceGroups[lang]);
        }

        // Populate the languageCode select for each row
        var rows = document.querySelectorAll('.voice-row');

        rows.forEach(function (row) {
            var languageCodeSelect = row.querySelector('.languageCode');
            languageCodeSelect.innerHTML = ''; // Clear existing options
            var seloption = document.createElement('option');
            languageCodeSelect.appendChild(seloption);

            Object.keys(langCodeVoicesDict).forEach(function (langCode) {
                var option = document.createElement('option');
                option.value = langCode;
                option.textContent = langCode;
                languageCodeSelect.appendChild(option);
            });
        });

        // Get sorted languages
        var sortedLanguages = Object.keys(voiceGroups).sort();
    } else {
        console.log('Text-to-Speech not supported in this browser.');
    }
}

function getVoices() {

    if ('speechSynthesis' in window) {
        // Wait for the voices to be loaded
        window.speechSynthesis.onvoiceschanged = function () {
            //var voices = window.speechSynthesis.getVoices();
            uttvoices = window.speechSynthesis.getVoices();
            //voices = window.speechSynthesis.getVoices();
            // Group voices by language
            voiceGroups = {};
            for (var i = 0; i < uttvoices.length; i++) {
                var voice = uttvoices[i];
                var lang = voice.lang;

                if (!(lang in voiceGroups)) {
                    voiceGroups[lang] = [];
                }

                voiceGroups[lang].push(voice);
            }

            // Fill the langCodeVoicesDict dictionary
            for (var lang in voiceGroups) {
                var langCode = lang.split('-')[0]; // Get the language code

                if (!(langCode in langCodeVoicesDict)) {
                    langCodeVoicesDict[langCode] = [];
                }

                langCodeVoicesDict[langCode].push(voiceGroups[lang]);
            }

            // Populate the languageCode select for each row
            var rows = document.querySelectorAll('.voice-row');

            rows.forEach(function (row) {
                var languageCodeSelect = row.querySelector('.languageCode');
                languageCodeSelect.innerHTML = ''; // Clear existing options
                var seloption = document.createElement('option');
                languageCodeSelect.appendChild(seloption);

                Object.keys(langCodeVoicesDict).forEach(function (langCode) {
                    var option = document.createElement('option');
                    option.value = langCode;
                    option.textContent = getLanguageDisplayName(langCode);
                    languageCodeSelect.appendChild(option);
                });
            });

            // Get sorted languages
            var sortedLanguages = Object.keys(voiceGroups).sort();
        };

        // Trigger voice loading by retrieving the voices
        window.speechSynthesis.getVoices();
    } else {
        console.log('Text-to-Speech not supported in this browser.');
    }
}

function populateVoiceGroups(event) {
    var voiceGroupSelect = event.target.parentNode.parentNode.querySelector('.voiceGroup');
    voiceGroupSelect.innerHTML = ''; // Clear existing options
    var seloption = document.createElement('option');
    voiceGroupSelect.appendChild(seloption);

    selectedLanguageCode[event.target.id] = event.target.value;
    Object.keys(voiceGroups).forEach(function (langCode) {
        if (langCode.split('-')[0] === selectedLanguageCode[event.target.id]) {
            var option = document.createElement('option');
            option.value = langCode;
            option.textContent = langCode;
            voiceGroupSelect.appendChild(option);
        }
    });

    populateVoices(event);
}

function populateVoices(event) {
    var voiceSelect = event.target.parentNode.parentNode.querySelector('.voices');
    voiceSelect.innerHTML = ''; // Clear existing options

    selectedVoiceGroup[event.target.id] = event.target.value;

    var voices = langCodeVoicesDict[selectedLanguageCode[event.target.id]];
    var voiceGroup = voiceGroups[selectedVoiceGroup[event.target.id]];

    if (voiceGroup) {
        var seloption = document.createElement('option');
        voiceSelect.appendChild(seloption);

        for (var i = 0; i < voiceGroup.length; i++) {
            var speechSynthesisVoice = voiceGroup[i];
            var option = document.createElement('option');
            option.value = speechSynthesisVoice.name;
            option.textContent = speechSynthesisVoice.name;
            voiceSelect.appendChild(option);
        }
    }
}

function speakText(text, voice, rate, pitch, volume) {
    var utterance = new SpeechSynthesisUtterance(text);
    var voices = window.speechSynthesis.getVoices();

    for (var i = 0; i < voices.length; i++) {
        if (voices[i].name === voice) {
            utterance.voice = voices[i];
            break;
        }
    }

    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    window.speechSynthesis.speak(utterance);
}

window.addEventListener('load', function () {


    console.log('Is Mobile:', isMobile);
    console.log('Is Windows:', isWindows);
    console.log('Is macOS:', isMacOS);

    if(isMacOS){
        getVoices();
    }else{
        getMobileVoices();
        //getResponsiveVoices();
    }

    
    //getVoices();
    //addRow("ID",4);
    // addRow("ID",5);

});

function addRow(header, rownum) {
    addRowWin(header, rownum);
}

function addRowWin(header, rownum) {
    // Create the main row element
    var row = document.createElement('tr');
    row.className = 'voice-row';

    var chkCell = document.createElement('td');
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = header;
    checkbox.checked = true;
    chkCell.appendChild(checkbox);
    row.appendChild(chkCell);

    // column
    var colCodeCell = document.createElement('td');
    var colCodeLabel = document.createElement('label');
    colCodeLabel.textContent = header;
    colCodeCell.appendChild(colCodeLabel);
    row.appendChild(colCodeCell);

    // Language Code column
    var langCodeCell = document.createElement('td');
    var langCodeLabel = document.createElement('label');
    langCodeLabel.setAttribute('for', 'languageCode');
    langCodeLabel.textContent = 'Language Code:';
    langCodeCell.appendChild(langCodeLabel);
    row.appendChild(langCodeCell);

    var langCodeSelectCell = document.createElement('td');
    var langCodeSelect = document.createElement('select');
    langCodeSelect.id = 'languageCode3' + rownum;
    langCodeSelect.className = 'languageCode';
    langCodeSelect.setAttribute('onchange', 'populateVoiceGroups(event)');
    langCodeSelectCell.appendChild(langCodeSelect);
    row.appendChild(langCodeSelectCell);

    // Voice Group column
    var voiceGroupCell = document.createElement('td');
    var voiceGroupLabel = document.createElement('label');
    voiceGroupLabel.setAttribute('for', 'voiceGroup');
    voiceGroupLabel.textContent = 'Voice Group:';
    voiceGroupCell.appendChild(voiceGroupLabel);
    row.appendChild(voiceGroupCell);

    var voiceGroupSelectCell = document.createElement('td');
    var voiceGroupSelect = document.createElement('select');
    voiceGroupSelect.id = 'voiceGroup3' + rownum;
    voiceGroupSelect.className = 'voiceGroup';
    voiceGroupSelect.setAttribute('onchange', 'populateVoices(event)');
    voiceGroupSelectCell.appendChild(voiceGroupSelect);
    row.appendChild(voiceGroupSelectCell);

    // Voices column
    var voicesCell = document.createElement('td');
    var voicesLabel = document.createElement('label');
    voicesLabel.setAttribute('for', 'voices');
    voicesLabel.textContent = 'Voices:';
    voicesCell.appendChild(voicesLabel);
    row.appendChild(voicesCell);

    var voicesSelectCell = document.createElement('td');
    var voicesSelect = document.createElement('select');
    voicesSelect.id = 'voices3' + rownum;
    voicesSelect.className = 'voices';
    voicesSelectCell.appendChild(voicesSelect);
    row.appendChild(voicesSelectCell);

    // Append the row to the table
    var voiceTable = document.getElementById('columnCheckboxes');
    voiceTable.appendChild(row);

    // Populate the languageCode select for the new row
    var languageCodeSelect = row.querySelector('.languageCode');
    languageCodeSelect.innerHTML = ''; // Clear existing options
    var seloption = document.createElement('option');
    seloption.value = 'en';
    seloption.textContent = getLanguageDisplayName('en');
    languageCodeSelect.appendChild(seloption);

    Object.keys(langCodeVoicesDict).forEach(function (langCode) {
        if (langCode !== 'en') {
            var option = document.createElement('option');
            option.value = langCode;
            option.textContent = getLanguageDisplayName(langCode);
            languageCodeSelect.appendChild(option);
        }
    });

    // Set default values for voice group and voice
    selectedLanguageCode[langCodeSelect.id] = 'en';
    populateVoiceGroups({ target: langCodeSelect }); // Trigger voice group population

    var voiceGroupSelect = row.querySelector('.voiceGroup');
    voiceGroupSelect.addEventListener('change', populateVoices);
    var voicesSelect = row.querySelector('.voices');

    if (voiceGroups['en-US']) {
        voiceGroupSelect.value = 'en-US';
        selectedVoiceGroup[voiceGroupSelect.id] = 'en-US';
        populateVoices({ target: voiceGroupSelect }); // Trigger voice population
        voicesSelect.value = 'Alex';
    } else {
        var voiceGroupOptions = voiceGroupSelect.options;
        if (voiceGroupOptions.length > 0) {
            voiceGroupSelect.value = voiceGroupOptions[0].value;
            selectedVoiceGroup[voiceGroupSelect.id] = voiceGroupOptions[0].value;
            populateVoices({ target: voiceGroupSelect }); // Trigger voice population
            var voicesOptions = voicesSelect.options;
            if (voicesOptions.length > 0) {
                voicesSelect.value = voicesOptions[0].value;
            }
        }
    }
}

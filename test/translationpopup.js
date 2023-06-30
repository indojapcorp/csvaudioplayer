var transpopup = document.getElementById('transpopup');
var popupButton = document.getElementById('popupButton');
var translateButton = document.getElementById('translateButton');
var applyButton = document.getElementById('applyButton');
var srctxtPopup = document.getElementById('srctext-popup');
var tratextPopup = document.getElementById('tratext-popup');
var srclangSelect = document.getElementById('srclang');
var tgtlangSelect = document.getElementById('tgtlang');
var srclangval = 'en';
var tgtlangval = 'en';

popupButton.addEventListener('click', function () {
console.log("hshdhshd");
    transpopup.classList.add('active');
    //srctxtPopup.value = srctxt.value;
});

srclangSelect.addEventListener("change", () => {
    srclangval = document.getElementById("srclang").value;
});

tgtlangSelect.addEventListener("change", () => {
    tgtlangval = document.getElementById("tgtlang").value;
});


translateButton.addEventListener('click', function () {
    translate(srclangval, tgtlangval);
});

applyButton.addEventListener('click', function () {

        var srcText = $("#srctext-popup").val();
        var tgtText = $("#tratext-popup").val();

        var srcLines = srcText.split("\n");
        var tgtLines = tgtText.split("\n");

        $("#myTable").empty();
        for (var i = 0; i < srcLines.length; i++) {
            var srcRow = "<tr><td>" + srcLines[i] + "</td><td>" + tgtLines[i] + "</td></tr>";
            $("#myTable").append(srcRow);
        }
    transpopup.classList.remove('active'); // Close the transpopup
});

function translate(sourceLang, targetLang) {

    var sourceText = $('textarea#srctext-popup').val();
    var finalstr = "";

    var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(sourceText);
    console.log(url);
    $.getJSON(url, function (data) {
        $.each(data[0], function (index, val) {
            finalstr += val[0];
        });
        $('textarea#tratext-popup').val(finalstr);
    });

}        
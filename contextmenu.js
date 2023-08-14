const table = document.getElementById("myTable");
let selectedCell;
// Create and append the context menu element
const contextMenu = document.createElement("div");
contextMenu.className = "context-menu";
contextMenu.innerHTML = `
<ul>
<li id="populateSentences">Populate Sentences</li>
</ul>
`;
document.body.appendChild(contextMenu);

// Hide context menu
function hideContextMenu() {
    contextMenu.style.display = "none";
}

// Show context menu at the mouse click position
function showContextMenu(event) {
    event.preventDefault();
    contextMenu.style.left = `${event.clientX}px`;
    contextMenu.style.top = `${event.clientY}px`;
    contextMenu.style.display = "block";
}

// Attach context menu event to the table
table.addEventListener("contextmenu", function (event) {
    selectedCell = event.target.closest("td");
    if (!selectedCell || selectedCell.cellIndex !== 0) {
        hideContextMenu();
        return;
    }
    showContextMenu(event);
});

// Attach click event to context menu items
contextMenu.addEventListener("click", function (event) {
    const selectedText = window.getSelection().toString().trim();
    //const selectedCell = event.target.closest("td");
    if (!selectedCell || selectedCell.cellIndex !== 0) {
        hideContextMenu();
        return;
    }

    // Find the row for the selected cell
    const selectedRow = selectedCell.parentElement;

    const sentenceColumnIndex = Array.from(table.querySelectorAll("th")).findIndex(th => th.textContent === "Sentences");
    console.log("Index of 'Sentences' column:", sentenceColumnIndex);

    // Find the cell in the "Vocab" column of the same row
    const sentenceCell = selectedRow.querySelector("td:nth-child(" + (sentenceColumnIndex + 1) + ")");

    if (event.target.id === "populateSentences") {
        if (sentenceCell) {
            sentenceCell.textContent = "OK";
        }
    }
    hideContextMenu();
});
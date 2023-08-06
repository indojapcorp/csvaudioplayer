const listItems = document.getElementsByTagName('li');
  for (let i = 0; i < listItems.length; i++) {
    const text = listItems[i].textContent;
      const trimmedText = text.match(/^\s*([^()]+)/)[1].trim();
console.log(trimmedText); // Output: "accolade"
  }

  const listItems = document.querySelectorAll('li')
  for (let i = 0; i < listItems.length; i++) {
    const text = listItems[i].textContent;
      const trimmedText = text.match(/^\s*([^()]+)/)[1].trim();
console.log(trimmedText); // Output: "accolade"
  }

  const listItems = document.querySelectorAll('li')
  for (let i = 0; i < listItems.length; i++) {
    const text = listItems[i].textContent;
    const trimmedText = text.match(/:(.*)/)[1].trim();
console.log(trimmedText); // Output: "accolade"
  }

  


  const list = document.getElementByTagName('ol');

  // Get all list items inside the list element
  const listItems = list.getElementsByTagName('li');

  // Loop through each list item and log the text to the console
  for (let i = 0; i < listItems.length; i++) {
    const text = listItems[i].textContent;
    console.log(text);
  }


  const list = document.getElementByTagName('div');
  const list = document.querySelectorAll('li[type="checkbox"][name^="row"]')
  const list = document.querySelectorAll('li')
const questionsData = [
    {
      "question": "What is the capital of Germany?",
      "options": ["Berlin", "Madrid", "Paris", "Rome"],
      "correctAnswer": 0
    },
    {
      "question": "Which planet is known as the Red Planet?",
      "options": ["Mars", "Venus", "Jupiter", "Saturn"],
      "correctAnswer": 0
    },
    {
      "question": "What is the largest mammal?",
      "options": ["Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
      "correctAnswer": 1
    }
  ];
  
  let currentQuestion = 0;
  let userAnswers = [];
  // Variable to store user's selected option for each question
const userSelectedOptions = new Array(questionsData.length);

function startTest() {
  document.getElementById('startBtn').style.display = 'none';
  document.getElementById('testContainer').style.display = 'block';
  shuffleQuestions();
  shuffleOptions(); // Shuffle options for the first question
  displayQuestion();
}

function displayQuestion() {
    // Clear radio button selections
    const radioButtons = document.getElementsByName('option');
    radioButtons.forEach(radio => (radio.checked = false));
  
    const currentQuestionData = questionsData[currentQuestion];
    document.getElementById('question').textContent = currentQuestionData.question;
    for (let i = 0; i < 4; i++) {
      document.getElementById(`option${i}`).textContent = currentQuestionData.options[i];
    }
  
    // Restore user's selected option if available
    const userSelectedOption = userSelectedOptions[currentQuestion];
    if (userSelectedOption !== undefined) {
      radioButtons[userSelectedOption].checked = true;
    }
  
    updateButtons();
  }

function nextQuestion() {
  const selectedOption = document.querySelector('input[name="option"]:checked');
  if (selectedOption) 
  {
    userSelectedOptions[currentQuestion] = parseInt(selectedOption.value);
    userAnswers[currentQuestion] = parseInt(selectedOption.value);
  }
    currentQuestion++;
    shuffleOptions();
    displayQuestion();
    updateButtons();
   
  /*else {
    alert('Please select an option before proceeding.');
  }*/
}

function prevQuestion() {
  currentQuestion--;
  shuffleOptions();
  displayQuestion();
  updateButtons();
}

function updateButtons() {
    document.getElementById('prevBtn').disabled = currentQuestion === 0;
    document.getElementById('nextBtn').disabled = currentQuestion === questionsData.length - 1;
    document.getElementById('reviewBtn').disabled = false;
    //document.getElementById('resultBtn').style.display = currentQuestion === questionsData.length - 1 ? 'block' : 'none';
}

// ... (previous code remains unchanged)

function showReview() {
  
    const selectedOption = document.querySelector('input[name="option"]:checked');

    if(selectedOption){
        userAnswers[currentQuestion] = parseInt(selectedOption.value);
    }

    const totalQuestions = questionsData.length;
    const attemptedQuestions = userAnswers.filter(answer => typeof answer !== 'undefined').length;
    let correctAnswers = 0;
  
    const reviewTable = document.getElementById('reviewTable');
    reviewTable.innerHTML = ''; // Clear existing content
  
    for (let index = 0; index < totalQuestions; index++) {
      const currentQuestionData = questionsData[index];
      const userAnswerIndex = userAnswers[index];
      //const isCorrect = userAnswerIndex === currentQuestionData.correctAnswer;
      const isCorrect = userAnswerIndex >-1;
  
      // Update correct answer count
      if (isCorrect) {
        correctAnswers++;
      }
  
      // Create a table row for each question in the review table
      const row = reviewTable.insertRow();
      const cellQuestion = row.insertCell(0);
      const cellResultIcon = row.insertCell(1);
      const cellJumpLink = row.insertCell(2);
  
      cellQuestion.textContent = currentQuestionData.question;
      cellResultIcon.innerHTML = isCorrect ? '&#10004;' : '&#10008;';
      cellResultIcon.style.color = isCorrect ? 'green' : 'red';
  
      // Provide a link to jump back to the question
      const jumpLink = document.createElement('a');
      jumpLink.href = '#';
      jumpLink.textContent = 'Jump to Question';
      jumpLink.onclick = function () {
        closeReviewModal();
        jumpToQuestion(index);
      };
  
      cellJumpLink.appendChild(jumpLink);
    }
    document.getElementById('reviewsummary').textContent = `
    Total Questions: ${totalQuestions}
    Attempted Questions: ${attemptedQuestions}
  `;

    // Display the review modal
    document.getElementById('reviewModal').style.display = 'block';
  }
  
  function closeReviewModal() {
    // Close the review modal
    document.getElementById('reviewModal').style.display = 'none';
  }
  
  // Function to jump to a specific question
  function jumpToQuestion(questionIndex) {
    currentQuestion = questionIndex;
    displayQuestion();
    updateButtons();
  }
    

function showResult() {
    const isConfirmed = window.confirm("Are you sure you want to see the results?");

    if(!isConfirmed){
        return;
    }

    closeReviewModal();
    const resultTable = document.getElementById('resultTable');
    resultTable.innerHTML = ''; // Clear existing content
  
    const selectedOption = document.querySelector('input[name="option"]:checked');

    if(selectedOption){
        userAnswers[currentQuestion] = parseInt(selectedOption.value);
    }
    
    const totalQuestions = questionsData.length;
    const attemptedQuestions = userAnswers.filter(answer => typeof answer !== 'undefined').length;
    let correctAnswers = 0;
  
    for (let index = 0; index < totalQuestions; index++) {
      const currentQuestionData = questionsData[index];
      const userAnswerIndex = userAnswers[index];
      //const isCorrect = userAnswerIndex === currentQuestionData.correctAnswer;
      const isCorrect = userAnswerIndex === questionsData[index].correctAnswer;
      
    //   const correctIndex = questionsData[index].correctAnswer;
    // const isCorrect = answer === correctIndex;

      // Update correct answer count
      if (isCorrect) {
        correctAnswers++;
      }
  
      // Create a table row for each question
      const row = resultTable.insertRow();
      const cellQuestion = row.insertCell(0);
      const cellOriginalAnswer = row.insertCell(1);
      const cellUserAnswer = row.insertCell(2);
      const cellResultIcon = row.insertCell(3);
  
      cellQuestion.textContent = currentQuestionData.question;
      cellOriginalAnswer.textContent = currentQuestionData.options[currentQuestionData.correctAnswer];
      cellUserAnswer.textContent = currentQuestionData.options[userAnswerIndex];
      cellResultIcon.innerHTML = isCorrect ? '&#10004;' : '&#10008;';
      cellResultIcon.style.color = isCorrect ? 'green' : 'red';
    }
  
    // Display total summary
    document.getElementById('testContainer').style.display = 'none';
    document.getElementById('resultContainer').style.display = 'block';
    document.getElementById('summary').textContent = `
      Total Questions: ${totalQuestions}
      Attempted Questions: ${attemptedQuestions}
      Correctly Answered: ${correctAnswers}
    `;
  }
  
function shuffleQuestions() {
    // Fisher-Yates (Knuth) Shuffle algorithm for shuffling questions
    for (let i = questionsData.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questionsData[i], questionsData[j]] = [questionsData[j], questionsData[i]];
    }
  }
  
  
function shuffleOptions() {
    const currentQuestionData = questionsData[currentQuestion];
    const originalCorrectAnswer = currentQuestionData.options[currentQuestionData.correctAnswer];
    currentQuestionData.options = shuffleArray(currentQuestionData.options);
    // Update correct answer with the new index
    currentQuestionData.correctAnswer = currentQuestionData.options.indexOf(originalCorrectAnswer);
  }
  
  function shuffleArray(array) {
    // Fisher-Yates (Knuth) Shuffle algorithm
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
      
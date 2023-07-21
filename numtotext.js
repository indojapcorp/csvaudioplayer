function numberToText(number) {
    // Array to hold textual representations of numbers
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const teens = ['', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', 'ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const thousands = ['', 'thousand', 'million', 'billion', 'trillion'];
  
    if (number === 0) {
      return 'zero';
    }
  
    // Convert the number to an array of digits
    const digits = number.toString().split('').map(Number);
  
    // Function to convert two-digit numbers
    function twoDigitsToText(numArr) {
      const [tensDigit, onesDigit] = numArr;
      if (tensDigit === 1) {
        return teens[onesDigit];
      } else {
        return tens[tensDigit] + (onesDigit !== 0 ? ` ${ones[onesDigit]}` : '');
      }
    }
  
    // Function to convert three-digit numbers
    function threeDigitsToText(numArr) {
      const [hundredsDigit, tensDigit, onesDigit] = numArr;
      return (
        (hundredsDigit !== 0 ? `${ones[hundredsDigit]} hundred` : '') +
        (tensDigit !== 0 ? (hundredsDigit !== 0 ? ' ' : '') + twoDigitsToText([tensDigit, onesDigit]) : ones[onesDigit])
      );
    }
  
    // Main conversion logic
    let text = '';
    let segmentCount = 0;
  
    while (digits.length > 0) {
      const segment = digits.splice(-3);
      const segmentText = threeDigitsToText(segment);
  
      if (segmentText.trim() !== '') {
        text = segmentText + (segmentCount > 0 ? ` ${thousands[segmentCount]}` : '') + (text !== '' ? ' ' + text : '');
      }
  
      segmentCount++;
    }
  
    return text;
  }
  // Example usage:
//   console.log(numberToText(1)); // Output: "one"
//   console.log(numberToText(12)); // Output: "twelve"
//   console.log(numberToText(123)); // Output: "one hundred twenty-three"
//   console.log(numberToText(1234)); // Output: "one thousand two hundred thirty-four"
//   console.log(numberToText(1234567)); // Output: "one million two hundred thirty-four thousand five hundred sixty-seven"

function numberToJapaneseText(number) {
    const ones = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const placeValues = ['', '万', '億', '兆', '京', '垓', '𥝱', '穣', '溝', '澗', '正', '載', '極', '恒河沙', '阿僧祇', '那由他', '不可思議', '無量大数'];
  
    if (number === 0) {
      return '零';
    }
  
    function toJapaneseTextBelow10000(num) {
      if (num < 10) {
        return ones[num];
      } else if (num < 100) {
        return (num === 10 ? '十' : ones[Math.floor(num / 10)] + '十') + (num % 10 !== 0 ? ones[num % 10] : '');
      } else if (num < 1000) {
        return ones[Math.floor(num / 100)] + '百' + toJapaneseTextBelow10000(num % 100);
      } else {
        return ones[Math.floor(num / 1000)] + '千' + toJapaneseTextBelow10000(num % 1000);
      }
    }
  
    let text = '';
    let placeIndex = 0;
  
    while (number > 0) {
      const segment = number % 10000;
      if (segment !== 0) {
        const segmentText = toJapaneseTextBelow10000(segment);
        text = segmentText + placeValues[placeIndex] + text;
      }
      placeIndex++;
      number = Math.floor(number / 10000);
    }
  
    return text;
  }


  function numberToFrenchText(number) {
    const ones = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];
    const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const bigs = ['', 'mille', 'million', 'milliard', 'billion', 'billiard', 'trillion', 'trilliard', 'quadrillion', 'quadrilliard', 'quintillion', 'quintilliard', 'sextillion', 'sextilliard', 'septillion', 'septilliard', 'octillion', 'octilliard', 'nonillion', 'nonilliard', 'décillion', 'décilliard']; // Extend this array for larger numbers if needed
  
    if (number === 0) {
      return 'zéro';
    }
  
    function toFrenchTextBelow1000(num) {
      if (num === 100) {
        return 'cent';
      } else if (num < 100) {
        if (num < 10) {
          return ones[num];
        } else if (num < 20) {
          return teens[num - 10];
        } else {
          const tenDigit = Math.floor(num / 10);
          const oneDigit = num % 10;
          if (oneDigit === 0) {
            return tens[tenDigit];
          } else if (tenDigit === 7 || tenDigit === 9) {
            return tens[tenDigit] + '-' + ones[oneDigit + 10];
          } else {
            return tens[tenDigit] + (oneDigit === 1 ? ' et ' : '-') + ones[oneDigit];
          }
        }
      } else {
        const hundredDigit = Math.floor(num / 100);
        const remainder = num % 100;
        const separator = remainder === 0 ? '' : ' ';
        return ones[hundredDigit] + ' cent' + separator + toFrenchTextBelow1000(remainder);
      }
    }
  
    function formatBigNumberText(segmentText, bigsIndex) {
      const bigName = bigs[bigsIndex];
      const separator = bigName === 'mille' ? '-' : ' ';
  
      return segmentText + (bigsIndex > 0 ? separator + bigName + (bigsIndex > 1 ? 's' : '') : '');
    }
  
    let text = '';
    let bigsIndex = 0;
  
    while (number > 0) {
      const segment = number % 1000;
      if (segment !== 0) {
        const segmentText = toFrenchTextBelow1000(segment);
        text = formatBigNumberText(segmentText, bigsIndex) + ' ' + text;
      }
      bigsIndex++;
      number = Math.floor(number / 1000);
    }
  
    return text.trim();
  }
  

  function numberToGermanText(number) {
    const ones = ['', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];
    const tens = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];
    const teens = ['zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
    const bigs = ['', 'tausend', 'Millionen', 'Milliarden', 'Billionen', 'Billiarden', 'Trillionen', 'Trilliarden', 'Quadrillionen', 'Quadrilliarden', 'Quintillionen', 'Quintilliarden', 'Sextillionen', 'Sextilliarden', 'Septillionen', 'Septilliarden', 'Oktillionen', 'Oktilliarden', 'Nonillionen', 'Nonilliarden', 'Dezillionen', 'Dezilliarden']; // Extend this array for larger numbers if needed
  
    if (number === 0) {
      return 'null';
    }
  
    function toGermanTextBelow1000(num) {
      if (num === 100) {
        return 'hundert';
      } else if (num < 100) {
        if (num < 10) {
          return ones[num];
        } else if (num < 20) {
          return teens[num - 10];
        } else {
          const tenDigit = Math.floor(num / 10);
          const oneDigit = num % 10;
          return ones[oneDigit] + (oneDigit !== 0 ? 'und' + tens[tenDigit] : tens[tenDigit]);
        }
      } else {
        const hundredDigit = Math.floor(num / 100);
        const remainder = num % 100;
        return ones[hundredDigit] + 'hundert' + (remainder !== 0 ? 'und' + toGermanTextBelow1000(remainder) : '');
      }
    }
  
    let text = '';
    let bigsIndex = 0;
  
    while (number > 0) {
      const segment = number % 1000;
      if (segment !== 0) {
        const segmentText = toGermanTextBelow1000(segment);
        text = segmentText + (bigsIndex > 0 ? ' ' + bigs[bigsIndex] : '') + ' ' + text;
      }
      bigsIndex++;
      number = Math.floor(number / 1000);
    }
  
    return text.trim();
  }

  
function numberToTextFromLang(lang, number) {
    if (lang === "en") {
      return numberToText(number);
    } else if (lang === "fr") {
      return numberToFrenchText(number);
    } else if (lang === "de") {
        return numberToGermanText(number);
    } else if (lang === "ja") {
        return numberToJapaneseText(number);
    } else if (lang === "zh-CN") {
        return numberToJapaneseText(number);
    }
    // Add more language conditions as needed
    else {
      return ""+number;
    }
  }
  
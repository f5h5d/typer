import { useSelector } from "react-redux";
import { addToMistakesList, reset, setEndTime, setFinishedTest, setIncorrectText, setKeepTypingText, setLastTyped, setMistakes, setRefillTypingText, setRestart, setStartTime, setTypedAtAll, setUserTyped, setWordsTyped, setWpm, setWpmRecord } from "../redux/typingSlice";

export const updateText = (e, typingRef, typingText, dispatch, wordsTyped, incorrectText, mistakes, wpmRecord, typedAtAll, wpm, startTime, typingType, selectedLength, isMultiplayer, hasRaceStarted, mistakesList, isNewLine) => {
  
  if (isMultiplayer && !hasRaceStarted) { // user should not be able to type pre game
    e.preventDefault();
    return;
  }
  
  let updateIncorrectText = [0, 0];
  let currentlyTyped = typingRef.current.value;

  if(currentlyTyped[currentlyTyped.length-1] !== typingText[currentlyTyped.length-1] && e.nativeEvent.inputType !== "deleteContentBackward") {
    dispatch(setMistakes(mistakes+1))
  }

  if (!isMultiplayer && !typedAtAll) { 
    dispatch(setTypedAtAll(true));
    dispatch(setStartTime(Date.now()))
  }

  if (currentlyTyped.length / typingText.length > 0.8 && typingType == 1 && selectedLength >= 4) { // if 80% done then refill text if timed 
    dispatch(setRefillTypingText(1))
  }


  if (currentlyTyped == typingText && typingText !== "") { 
    // check if user has completed the test, making sure the typing texts is not blank
    dispatch(setWordsTyped(wordsTyped + 1));
    setTimeout(() => {
      const currentTime = Date.now()
      const newWpm = Math.round(typingText.length / 5 / ((Date.now() - startTime) / 60000))
      dispatch(setWpm(newWpm));
      dispatch(setWpmRecord([...wpmRecord, {time: Math.round((currentTime - startTime)/1000 * 100) / 100, wpm: newWpm, mistakes: mistakes}])) // add last record for the ending graph
      dispatch(setEndTime(currentTime))
      console.log("finished test")
      dispatch(setFinishedTest(true));
    }, 100)

  }


  if (
    e.nativeEvent.data == " " &&
    currentlyTyped == typingText.substring(0, currentlyTyped.length)
  ) {
    // checks if user has completed a word
    dispatch(setWordsTyped(wordsTyped + 1));
    setTimeout(() => { isNewLine() }, 1) // delay call by 1 ms so cursor has enough time to go to next line to be detected

  }


      // check if user has typed anything wrong uptil this point
  if (currentlyTyped != typingText.substring(0, currentlyTyped.length)) {
    const currentWord = typingText.split(" ")[wordsTyped];
    // adds to mistakes list if it is not already in there
    if (!mistakesList.includes(currentWord)) {
      dispatch(addToMistakesList(currentWord))
    } 

    if (incorrectText[1] == 0) {
      // check if this is first mistake and change the starting point of incorrect text
      updateIncorrectText[0] = currentlyTyped.length - 1;
    } else {
      updateIncorrectText[0] = incorrectText[0];
    }
    updateIncorrectText[1] = currentlyTyped.length;
    dispatch(setIncorrectText(updateIncorrectText));
  }
  dispatch(setUserTyped(typingRef.current.value));
};



export const checkBeforeKeyPress = (e, incorrectText, typingText, wordsTyped, isMultiplayer, hasRaceStarted, typingRef, typingTextRef, cursorRef, dispatch) => {
  if (isMultiplayer && !hasRaceStarted) { // user should not be able to type pregame
    e.preventDefault();
    return;
  }
  
  
  
  dispatch(setLastTyped(Date.now())) // just update that user has interacted with keyboard (for the void rule)
  
  
  const distanceFromEdge = typingTextRef.current.getBoundingClientRect().right - cursorRef.current.getBoundingClientRect().x // - 39 // subtract cursor x value from typing text right side, including a -40 to account for padding
  const invalidCharacter =  (e.key.length == 1 && (e.key !== " " || e.key == " " && incorrectText[0] !== 0)) // check if user typed character or invalid space
  if ((incorrectText[1] - incorrectText[0] > 5 && e.keyCode !== 8) || (distanceFromEdge <= 0 && invalidCharacter)) { // typed too many incorrect or at edge of line
    e.preventDefault()
  }
  if (e.keyCode == 65 && e.nativeEvent.ctrlKey) { // user highlights all text => Ctrl + A
    e.preventDefault();
    return
  }

  if (e.keyCode == 9) { // go in this block if user types tab
    // dispatch(reset())
    dispatch(setKeepTypingText(false));
    dispatch(setRestart(true)) // resets race
  }

  if (e.keyCode >= 37 && e.keyCode <=40) e.preventDefault() // checks if user used arrow keys

  if (e.keyCode !== 8) return; // return if not a backspace
  if (
    typingRef.current.value == typingText.substring(0, typingRef.current.value.length) &&
    typingRef.current.value.lastIndexOf(" ") == typingRef.current.value.length - 1
  ) {
    // if it is at end of word where typed text is correct doesnt allow to backspace
    e.preventDefault();
    return;
  }

  let updateIncorrectText = [0, 0];
  const userTypedArr = typingRef.current.value.split(" ");

  if (e.keyCode == 8 && e.nativeEvent.ctrlKey) {
    // checks if user ctrl + backspace
    e.preventDefault();
    let updatedUserText = userTypedArr.slice(0, wordsTyped).join(" ") + " " // gets rid of everything
    
    updatedUserText = updatedUserText == " " ? "" : updatedUserText;
    typingRef.current.value = updatedUserText;

    dispatch(setUserTyped(typingRef.current.value)); 
    dispatch(setIncorrectText([0,0]));
    return;
  }

  // checks for else case if there is a mistake
  if (incorrectText[1] != 0) {
    if (incorrectText[0] == typingRef.current.value.length - 1) {
      // check if user has deleted all the wrong characters
      updateIncorrectText[0] = 0;
      updateIncorrectText[1] = 0;
    } else {
      updateIncorrectText[0] = incorrectText[0];
      updateIncorrectText[1] = typingRef.current.value.length; // IF NOT WORK ADD -1
    }
  }
  
  dispatch(setIncorrectText(updateIncorrectText));
  dispatch(setUserTyped(typingRef.current.value));
};




// func for updating the "false new words" as each word is split up with space and user might accidentally type accidental space
// causing "false" words to be created => fixes this issue
export const getRidOfExtraSpaces = (arr, typed) => {
  if (arr.length == typed) return;
  let valueOfLastIndex = "" // value of the actual last "word" user typed

  // gets values of all false words, aka the incidies after the last completed word
  for(let i = typed + 1; i < arr.length; i++) {
      if (arr[i] == "" && i) {
        valueOfLastIndex += " ";
      } else {
        valueOfLastIndex += " " + arr[i]
      }
  }

  // adds them to the actual value for what user is typing and slices off the unnecessary garbage
  arr[typed] += valueOfLastIndex
  arr = arr.slice(0, typed)
}


export const getStyledText = (typingText, typingRef, typingTextRef, wordsTyped, wordsPerLine, cursorRef) => {
  const typingTextArr = typingText.split(" ");
  let userTyped = (typingRef.current == null ? "" : typingRef.current.value);
  let userTypedArr = userTyped.split(" ");
  
  getRidOfExtraSpaces(userTypedArr, wordsTyped)
  const invisibleCount = [...wordsPerLine.slice(0, -3)].reduce((accumulator, currentValue) => accumulator + currentValue, 0); // reduce the array into the total number of words that need to be made invisible
  return (
    <div className="typingTextContainer" ref={typingTextRef}>
      {typingTextArr.map((word, i) => {
        const invisible = i < invisibleCount ? "invisible" : "" // used for seeing if invisible class should be set on word

        if (i < wordsTyped) {
          return (
            <div className={`word finished ${invisible}`} key={i}>{word}</div>
          );
        } else if (i == wordsTyped) {
          let userWord = userTypedArr[i];

          if (userWord == "" || userWord == undefined) { // user not typed anything in the current word
            return (
              <div className={"word current"} key={i}>
                <span ref={cursorRef} className="cursor"></span>
                {word}
              </div>
            );
          }
            
            return (
              <div className="word current" key={i}>
                {userWord.split("").map((letter, index) => (
                  <span key={index} className={`letter ` + getLetterClass(word, userWord, index)}>
                    {word.length > index ? word.substring(index, index + 1) : letter === " " ? <>&nbsp;</> : letter}
                    {index === userWord.length - 1 && <span ref={cursorRef} className="cursor"></span>}
                  </span>
                ))}
                {/* Render remaining letters in the word if user typed less */}
                {word.slice(userWord.length).split("").map((letter, index) => (
                  <span key={`letter remaining-${index}`} className="remaining">
                    {letter}
                  </span>
                ))}
              </div>
            );
        } else {
          return (
            <div className="word" key={i}>
              {word}
            </div>
          );
        }
      })}
    </div>
  );
};

const getLetterClass = (word, userWord, index) => {
  return word.substring(0, index + 1) === userWord.substring(0, index + 1)
    ? "finished"
    : "incorrect";
};
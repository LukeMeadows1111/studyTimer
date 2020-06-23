const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const displayTimeLeft = $('.display-time-left');
const rotationButtons = $$('[data-rotation]');
const bell = new Audio('https://freesound.org/data/previews/378/378394_7020630-lq.mp3')
const hammer = new Audio('https://freesound.org/data/previews/193/193353_2593738-lq.mp3')
const rotationsEl = $('.rotation-counter');
const cancelButton = $('.cancel-button');
const studyLogButton = $('.study-log-button');
const closeModalButton = $('.close-modal');
const studyLog = JSON.parse(localStorage.getItem('studyLog')) || [];
const logList = $('.log-list');
const displayTotalTimeWorked = $('.accrued-time');
let working = true;
let rotations;
let countdown;
clearInterval(countdown);


function timer(){  
    clearInterval(countdown); // Clears when called so multiple timers dont run simultaneously
    displayRotationsLeft(); // Puts rotations left on screen
    if (rotations <= 0) return // Stops function when alotted rotations are complete 
    const seconds = working ? 2700000 : 900000; // Determines if it should be break or work time
    displayTime(seconds / 1000) // Displays the seconds left immediatley as interval takes a second to kick in
    const now = Date.now(); 
    const then = now + seconds // Calculates when in the future the time should stop
    
    countdown = setInterval(()=>{
        const secondsLeft = Math.round((then - Date.now()) / 1000) // Compares time now with end time and calculates seconds left
        displayTime(secondsLeft); // Displays time left every second
        if(!working && secondsLeft <= hammer.duration){ // Calls the time to work audio at the audio duration in seconds before the timer ends
            hammer.currentTime = 0;
            hammer.play()
        }
        if (secondsLeft <= 0){ 
        if (working) {
                rotations = rotations - 1; // After a working session it deducts 1 from rotation count
                addRecord(); // Adds new record to study log after working session complete
                bell.currentTime = 0; // Plays end work time audio at the end of working session
                bell.play();
                if (rotations <= 0){
                    displayTimeLeft.innerHTML = ''
                    document.querySelector('title').innerHTML = `Study Timer`
                }
            };
            working = !working; // Swaps the working flag to tell the timer if it should be working time or break time 
            timer();
        }
    }, 1000)
    // return
}

function displayTime(seconds){  // Calculates Mins and Secs and displays them to the timer element
const secondsRemaining = seconds % 60;
const minutesLeft = Math.floor(seconds / 60);
document.querySelector('title').innerHTML = `Study Timer ${minutesLeft < 10 ? '0':''}${minutesLeft}:${secondsRemaining < 10 ? '0':''}${secondsRemaining}`
displayTimeLeft.innerHTML = `<p class="count-down">${minutesLeft < 10 ? '0':''}${minutesLeft}:${secondsRemaining < 10 ? '0':''}${secondsRemaining}</p>`
}

function pushToLocalStorage(entry){
    localStorage.setItem('studyLog', JSON.stringify(entry));
}


function addRecord(){ // Logs the rotations as records in the studyLog
    const longDate = new Date(Date.now());
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]; // getMonth() returns value 1 - 11 so need to create an array so we can select month by that value
    const date = `${longDate.getDate()} ${months[longDate.getMonth()]} ${longDate.getFullYear()}`; // Calculates and formats todays date into a variable
    const index = studyLog.findIndex(i => i.date === date); // Checks study log Array for an entry for today
    if(index >= 0){ 
        studyLog[index].count = studyLog[index].count + 1 // If entry found for today then adds a count to todays record
    } else { 
    const entry = {date, count: 1} // If cannot find Array entry for today creates one and pushes to study log  
    studyLog.push(entry);
    }
    pushToLocalStorage(studyLog)
}

function displayRotationsLeft(){
    if(rotations === 0) rotationsEl.innerHTML = `Roatations left: 0` // Resets the rotations Element to 0 after all rotations complete
    rotationsEl.innerHTML = `Roatations left: ${rotations}` // Sets rotations Element to how many rotations are left
}

function cancelRotations(){ // Cancel button cancels rotations
    clearInterval(countdown);
    rotations = 0;
    displayRotationsLeft()
    displayTimeLeft.innerHTML = ''
    document.querySelector('title').innerHTML = `Study Timer`
}

function closeLog(e){
    studyLogButton.classList.remove('active');
    $('.cover').classList.remove('cover-log-open')
    closeModalButton.removeEventListener('click', closeLog)
}

function openLog(e){
    if(e.target === closeModalButton) return;
    studyLogButton.classList.add('active');
    $('.cover').classList.add('cover-log-open')
    closeModalButton.addEventListener('click', closeLog)
}


function populateLog(){
    const totalTimeWorked = studyLog.reduce((total, log) => {
            return total + (log.count * 45);
        }, 0)
    const totalHoursWorked = Math.floor(totalTimeWorked / 60);
    const totalMinutesWorked = totalTimeWorked % 60
    displayTotalTimeWorked.innerHTML = `Total: ${totalHoursWorked}hrs : ${totalMinutesWorked}mins`
    
logList.innerHTML = studyLog.map(log => {
    const totalDailyHours = Math.floor((log.count * 45) / 60);
    const totalDailyMins = (log.count * 45) % 60;
        return `<li><span>${log.date}</span><span>Count: ${log.count}</span><span>${totalDailyHours < 1 ? '': totalDailyHours} ${totalDailyHours < 1 ? '': 'hrs'} ${totalDailyMins} mins</span></li>`
    }).join('')
}

studyLogButton.addEventListener('transitionend', populateLog);

cancelButton.addEventListener('click', cancelRotations)

rotationButtons.forEach(button => button.addEventListener('click', (e) => {
working = true;
rotations = e.currentTarget.dataset.rotation;
timer();
}));

studyLogButton.addEventListener('click', openLog)
populateLog()

/* LAUNDRY LIST:

- Allow user to input custom intervals
*/

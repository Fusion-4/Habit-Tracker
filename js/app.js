/* ==========================================
   Habit Tracker
   Day 3
========================================== */

"use strict";

/* ==========================================
   Configuration
========================================== */

const STORAGE_KEY = "habit_tracker_data";
const THEME_KEY = "habit_tracker_theme";

/* ==========================================
   Application Data
========================================== */

let habits = [];

/* ==========================================
   DOM Elements
========================================== */

const habitInput =
    document.getElementById("habitInput");

const addButton =
    document.getElementById("addButton");

const habitList =
    document.getElementById("habitList");

const emptyState =
    document.getElementById("emptyState");

const habitTotal =
    document.getElementById("habitTotal");

const habitCount =
    document.getElementById("habitCount");

const completedToday =
    document.getElementById("completedToday");

const progressBar =
    document.getElementById("progressBar");

const themeButton =
    document.getElementById("themeButton");

/* ==========================================
   Date Helpers
========================================== */

function getTodayString(){

    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth()+1
    ).padStart(2,"0");

    const day = String(
        today.getDate()
    ).padStart(2,"0");

    return `${year}-${month}-${day}`;

}

/* ==========================================
   Storage
========================================== */

function loadHabits(){

    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );

    if(!saved){

        habits = [];

        return;

    }

    try{

        habits = JSON.parse(saved);

    }

    catch{

        habits = [];

    }

}

function saveHabits(){

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(habits)

    );

}

/* ==========================================
   Upgrade Older Saves
========================================== */

function upgradeHabitData(){

    habits.forEach(habit=>{

        if(typeof habit.name!=="string"){

            habit.name="New Habit";

        }

        if(typeof habit.created!=="number"){

            habit.created=Date.now();

        }

        if(typeof habit.history!=="object"
            || habit.history===null){

            habit.history={};

        }

        if(typeof habit.streak!=="number"){

            habit.streak=0;

        }

    });

}

/* ==========================================
   Theme
========================================== */

function loadTheme(){

    const theme =
        localStorage.getItem(
            THEME_KEY
        );

    if(theme==="dark"){

        document.body.classList.add(
            "dark"
        );

        themeButton.innerHTML =
        '<i class="fa-solid fa-sun"></i>';

    }

    else{

        document.body.classList.remove(
            "dark"
        );

        themeButton.innerHTML =
        '<i class="fa-solid fa-moon"></i>';

    }

}

function toggleTheme(){

    document.body.classList.toggle(
        "dark"
    );

    const dark =
        document.body.classList.contains(
            "dark"
        );

    localStorage.setItem(

        THEME_KEY,

        dark
        ? "dark"
        : "light"

    );

    themeButton.innerHTML = dark

        ? '<i class="fa-solid fa-sun"></i>'

        : '<i class="fa-solid fa-moon"></i>';

}

/* ==========================================
   History System
========================================== */

function isCompletedToday(habit){

    const today = getTodayString();

    return habit.history[today] === true;

}

function toggleHabit(index){

    const habit = habits[index];

    const today = getTodayString();

    if(isCompletedToday(habit)){

        delete habit.history[today];

    }

    else{

        habit.history[today] = true;

    }

    renderHabits();

}

/* ==========================================
   Streak Calculation
========================================== */

function calculateStreak(habit){

    let streak = 0;

    const date = new Date();

    while(true){

        const key =

            date.getFullYear() + "-" +

            String(date.getMonth()+1)
            .padStart(2,"0") + "-" +

            String(date.getDate())
            .padStart(2,"0");

        if(habit.history[key]){

            streak++;

        }

        else{

            break;

        }

        date.setDate(

            date.getDate()-1

        );

    }

    return streak;

}

/* ==========================================
   Weekly Statistics
========================================== */

function getWeeklyCompletion(habit){

    let completed = 0;

    for(let i=0;i<7;i++){

        const date = new Date();

        date.setDate(

            date.getDate()-i

        );

        const key =

            date.getFullYear()+"-"+

            String(date.getMonth()+1)
            .padStart(2,"0")+"-"+

            String(date.getDate())
            .padStart(2,"0");

        if(habit.history[key]){

            completed++;

        }

    }

    return completed;

}

/* ==========================================
   Last Completed
========================================== */

function getLastCompleted(habit){

    const dates =

        Object.keys(habit.history);

    if(dates.length===0){

        return "Never";

    }

    dates.sort();

    const latest = dates[dates.length-1];

    const today = getTodayString();

    if(latest===today){

        return "Today";

    }

    return latest;

}

/* ==========================================
   Progress
========================================== */

function updateProgress(){

    if(habits.length===0){

        completedToday.textContent="0%";

        if(progressBar){

            progressBar.style.width="0%";

        }

        return;

    }

    const completed = habits.filter(

        habit=>isCompletedToday(habit)

    ).length;

    const percent = Math.round(

        completed/habits.length*100

    );

    completedToday.textContent=

        percent+"%";

    if(progressBar){

        progressBar.style.width=

            percent+"%";

    }

}

/* ==========================================
   Counters
========================================== */

function updateCounters(){

    habitTotal.textContent = habits.length;

    habitCount.textContent =

        habits.length +

        (habits.length===1

            ? " Habit"

            : " Habits");

}

/* ==========================================
   Habit Card
========================================== */

function createHabitCard(habit,index){

    const card = document.createElement("div");

    card.className = "habit";

    card.innerHTML = `

        <div class="habitHeader">

            <div class="habitLeft">

                <div class="habitName">

                    ${habit.name}

                </div>

                <div class="habitInfo">

                    <span class="badge">

                        <i class="fa-solid fa-fire"></i>

                        ${habit.streak} Day${habit.streak===1?"":"s"}

                    </span>

                    <span class="badge">

                        <i class="fa-solid fa-chart-column"></i>

                        ${getWeeklyCompletion(habit)}/7 Week

                    </span>

                </div>

                <div class="lastCompleted">

                    Last Completed:

                    <strong>

                        ${getLastCompleted(habit)}

                    </strong>

                </div>

            </div>

            <div class="habitButtons">

                <button

                    class="completeButton ${isCompletedToday(habit) ? "completed" : ""}"

                    data-index="${index}">

                    <i class="fa-solid fa-check"></i>

                </button>

                <button

                    class="deleteButton"

                    data-index="${index}">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        </div>

    `;

    return card;

}

/* ==========================================
   Rendering
========================================== */

function renderHabits(){

    habitList.innerHTML="";

    if(habits.length===0){

        emptyState.classList.remove(

            "hidden"

        );

    }

    else{

        emptyState.classList.add(

            "hidden"

        );

    }

    habits.forEach(habit=>{

        habit.streak =

            calculateStreak(habit);

    });

    habits.forEach((habit,index)=>{

        habitList.appendChild(

            createHabitCard(

                habit,

                index

            )

        );

    });

    attachEvents();

    updateCounters();

    updateProgress();

    saveHabits();

}

/* ==========================================
   Add Habit
========================================== */

function addHabit(){

    const name =

        habitInput.value.trim();

    if(name===""){

        alert(

            "Please enter a habit."

        );

        return;

    }

    habits.push({

        name:name,

        created:Date.now(),

        history:{},

        streak:0

    });

    habitInput.value="";

    renderHabits();

}

/* ==========================================
   Delete Habit
========================================== */

function deleteHabit(index){

    if(!confirm(

        "Delete this habit?"

    )){

        return;

    }

    habits.splice(index,1);

    renderHabits();

}

/* ==========================================
   Button Events
========================================== */

function attachEvents(){

    document
        .querySelectorAll(".completeButton")
        .forEach(button=>{

            button.addEventListener(

                "click",

                ()=>{

                    toggleHabit(

                        Number(
                            button.dataset.index
                        )

                    );

                }

            );

        });

    document
        .querySelectorAll(".deleteButton")
        .forEach(button=>{

            button.addEventListener(

                "click",

                ()=>{

                    deleteHabit(

                        Number(
                            button.dataset.index
                        )

                    );

                }

            );

        });

}

/* ==========================================
   Input Events
========================================== */

addButton.addEventListener(

    "click",

    addHabit

);

habitInput.addEventListener(

    "keydown",

    function(event){

        if(event.key==="Enter"){

            addHabit();

        }

    }

);

themeButton.addEventListener(

    "click",

    toggleTheme

);

/* ==========================================
   Daily Maintenance
========================================== */

function cleanupHistory(){

    const cutoff = new Date();

    cutoff.setDate(

        cutoff.getDate()-365

    );

    const cutoffKey =

        cutoff.getFullYear()+"-"+

        String(cutoff.getMonth()+1)
        .padStart(2,"0")+"-"+

        String(cutoff.getDate())
        .padStart(2,"0");

    habits.forEach(habit=>{

        Object.keys(habit.history)

        .forEach(date=>{

            if(date < cutoffKey){

                delete habit.history[date];

            }

        });

    });

}

/* ==========================================
   Initialization
========================================== */

function initialize(){

    loadHabits();

    upgradeHabitData();

    cleanupHistory();

    loadTheme();

    renderHabits();

}

/* ==========================================
   Start App
========================================== */

initialize();

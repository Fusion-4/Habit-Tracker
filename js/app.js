/* ==========================================
   Habit Tracker
   Day 2
========================================== */

"use strict";

/* ==========================================
   Configuration
========================================== */

const STORAGE_KEY = "habit_tracker_data";
const THEME_KEY = "habit_tracker_theme";

/* ==========================================
   Data
========================================== */

let habits = [];

/* ==========================================
   DOM Elements
========================================== */

const habitInput = document.getElementById("habitInput");
const addButton = document.getElementById("addButton");
const habitList = document.getElementById("habitList");
const emptyState = document.getElementById("emptyState");

const habitTotal = document.getElementById("habitTotal");
const habitCount = document.getElementById("habitCount");
const completedToday = document.getElementById("completedToday");

const themeButton = document.getElementById("themeButton");

/* ==========================================
   Storage
========================================== */

function loadHabits(){

    const saved =
        localStorage.getItem(STORAGE_KEY);

    if(saved){

        try{

            habits = JSON.parse(saved);

        }

        catch{

            habits = [];

        }

    }

}

function saveHabits(){

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(habits)

    );

}

/* ==========================================
   Theme
========================================== */

function loadTheme(){

    const theme =
        localStorage.getItem(THEME_KEY);

    if(theme === "dark"){

        document.body.classList.add("dark");

        themeButton.innerHTML =
        '<i class="fa-solid fa-sun"></i>';

    }

    else{

        document.body.classList.remove("dark");

        themeButton.innerHTML =
        '<i class="fa-solid fa-moon"></i>';

    }

}

function toggleTheme(){

    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){

        localStorage.setItem(

            THEME_KEY,

            "dark"

        );

        themeButton.innerHTML =
        '<i class="fa-solid fa-sun"></i>';

    }

    else{

        localStorage.setItem(

            THEME_KEY,

            "light"

        );

        themeButton.innerHTML =
        '<i class="fa-solid fa-moon"></i>';

    }

}

/* ==========================================
   Helpers
========================================== */

function updateCounters(){

    habitTotal.textContent =
        habits.length;

    habitCount.textContent =
        habits.length +
        (habits.length === 1
            ? " Habit"
            : " Habits");

}

/* ==========================================
   Progress
========================================== */

function updateProgress(){

    if(habits.length === 0){

        completedToday.textContent = "0%";
        return;

    }

    const completed =
        habits.filter(habit => habit.completed).length;

    const percent =
        Math.round((completed / habits.length) * 100);

    completedToday.textContent = percent + "%";

}

/* ==========================================
   Habit Card
========================================== */

function createHabitCard(habit,index){

    const card = document.createElement("div");

    card.className = "habit";

    card.innerHTML = `

        <div class="habitHeader">

            <div>

                <div class="habitName">
                    ${habit.name}
                </div>

                <div class="habitInfo">

                    <span class="badge">

                        <i class="fa-solid fa-calendar-day"></i>

                        Daily Habit

                    </span>

                </div>

            </div>

            <div style="display:flex;gap:10px;">

                <button
                    class="completeButton ${habit.completed ? "completed" : ""}"
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
   Add Habit
========================================== */

function addHabit(){

    const name =
        habitInput.value.trim();

    if(name === ""){

        alert("Please enter a habit.");

        return;

    }

    habits.push({

        name:name,

        completed:false,

        created:Date.now()

    });

    habitInput.value = "";

    renderHabits();

}

/* ==========================================
   Complete Habit
========================================== */

function toggleHabit(index){

    habits[index].completed =
        !habits[index].completed;

    renderHabits();

}

/* ==========================================
   Delete Habit
========================================== */

function deleteHabit(index){

    const confirmed = confirm(
        "Delete this habit?"
    );

    if(!confirmed){

        return;

    }

    habits.splice(index,1);

    renderHabits();

}

/* ==========================================
   Attach Button Events
========================================== */

function attachEvents(){

    /* Complete Buttons */

    document
        .querySelectorAll(".completeButton")
        .forEach(button=>{

            button.addEventListener("click",()=>{

                toggleHabit(

                    Number(
                        button.dataset.index
                    )

                );

            });

        });

    /* Delete Buttons */

    document
        .querySelectorAll(".deleteButton")
        .forEach(button=>{

            button.addEventListener("click",()=>{

                deleteHabit(

                    Number(
                        button.dataset.index
                    )

                );

            });

        });

}

/* ==========================================
   Update Render Function
========================================== */

/*
Replace your current renderHabits()
function with this one.
*/

function renderHabits(){

    habitList.innerHTML = "";

    if(habits.length===0){

        emptyState.classList.remove("hidden");

    }

    else{

        emptyState.classList.add("hidden");

    }

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
   Global Events
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
   Daily Reset
========================================== */

function getTodayString(){

    const today = new Date();

    return today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2,"0") + "-" +
        String(today.getDate()).padStart(2,"0");

}

function resetDailyCompletion(){

    const today = getTodayString();

    habits.forEach(habit=>{

        if(habit.lastCompleted !== today){

            habit.completed = false;

        }

    });

}

/* ==========================================
   Future Compatibility
========================================== */

function upgradeHabitData(){

    habits.forEach(habit=>{

        if(habit.completed === undefined){

            habit.completed = false;

        }

        if(habit.created === undefined){

            habit.created = Date.now();

        }

        if(habit.lastCompleted === undefined){

            habit.lastCompleted = "";

        }

        if(habit.streak === undefined){

            habit.streak = 0;

        }

    });

}

/* ==========================================
   Update Toggle Function
========================================== */

/*
Replace your current toggleHabit()
function with this version.
*/

function toggleHabit(index){

    habits[index].completed =
        !habits[index].completed;

    if(habits[index].completed){

        habits[index].lastCompleted =
            getTodayString();

    }

    renderHabits();

}

/* ==========================================
   Mobile Improvements
========================================== */

document.addEventListener(

    "touchstart",

    function(){},

    {

        passive:true

    }

);

/* ==========================================
   Initialize App
========================================== */

function initialize(){

    loadHabits();

    upgradeHabitData();

    resetDailyCompletion();

    loadTheme();

    renderHabits();

}

initialize();


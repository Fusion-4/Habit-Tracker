/* ==========================================================
   HABIT TRACKER
   Day 5
   app.js
   Part 1 / 4
========================================================== */

"use strict";

/* ==========================================================
   STORAGE
========================================================== */

const STORAGE_KEY = "habit_tracker_data";
const THEME_KEY = "habit_tracker_theme";

/* ==========================================================
   CATEGORIES
========================================================== */

const CATEGORIES = [

    "General",
    "Health",
    "Fitness",
    "School",
    "Work",
    "Reading",
    "Personal"

];

/* ==========================================================
   APP STATE
========================================================== */

let habits = [];

let currentSearch = "";

let currentSort = "favorite";

/* ==========================================================
   DOM ELEMENTS
========================================================== */

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

/* ==========================================================
   DATE HELPERS
========================================================== */

function todayKey(){

    const d = new Date();

    return [

        d.getFullYear(),

        String(d.getMonth()+1)
            .padStart(2,"0"),

        String(d.getDate())
            .padStart(2,"0")

    ].join("-");

}

function daysBetween(a,b){

    return Math.round(

        (b-a)/86400000

    );

}

/* ==========================================================
   STORAGE
========================================================== */

function saveHabits(){

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(habits)

    );

}

function loadHabits(){

    const data =

        localStorage.getItem(STORAGE_KEY);

    if(!data){

        habits=[];

        return;

    }

    try{

        habits=JSON.parse(data);

    }

    catch{

        habits=[];

    }

}

/* ==========================================================
   CREATE HABIT
========================================================== */

function createHabit(name){

    return{

        id:

            Date.now()+

            Math.floor(

                Math.random()*100000

            ),

        name:name,

        category:"General",

        favorite:false,

        notes:"",

        created:Date.now(),

        history:{},

        streak:0,

        longestStreak:0,

        totalCompletions:0

    };

}

/* ==========================================================
   UPGRADE OLD SAVES
========================================================== */

function upgradeHabitData(){

    habits.forEach(habit=>{

        if(!habit.id){

            habit.id=

                Date.now()+

                Math.floor(

                    Math.random()*100000

                );

        }

        if(typeof habit.category!=="string"){

            habit.category="General";

        }

        if(typeof habit.favorite!=="boolean"){

            habit.favorite=false;

        }

        if(typeof habit.notes!=="string"){

            habit.notes="";

        }

        if(typeof habit.history!=="object"){

            habit.history={};

        }

        if(typeof habit.streak!=="number"){

            habit.streak=0;

        }

        if(typeof habit.longestStreak!=="number"){

            habit.longestStreak=0;

        }

        if(typeof habit.totalCompletions!=="number"){

            habit.totalCompletions=0;

        }

    });

}

/* ==========================================================
   THEME
========================================================== */

function loadTheme(){

    const theme=

        localStorage.getItem(THEME_KEY);

    if(theme==="dark"){

        document.body.classList.add("dark");

    }

    else{

        document.body.classList.remove("dark");

    }

}

function toggleTheme(){

    document.body.classList.toggle("dark");

    localStorage.setItem(

        THEME_KEY,

        document.body.classList.contains("dark")

        ? "dark"

        : "light"

    );

}

/* ==========================================================
   SEARCH
========================================================== */

function searchHabits(){

    if(currentSearch===""){

        return habits;

    }

    return habits.filter(habit=>{

        const search=

            currentSearch.toLowerCase();

        return(

            habit.name

                .toLowerCase()

                .includes(search)

            ||

            habit.category

                .toLowerCase()

                .includes(search)

        );

    });

}

/* ==========================================================
   SORT
========================================================== */

function sortHabits(list){

    const sorted=[...list];

    switch(currentSort){

        case "favorite":

            sorted.sort((a,b)=>{

                if(a.favorite===b.favorite){

                    return 0;

                }

                return a.favorite ? -1 : 1;

            });

            break;

        case "alphabetical":

            sorted.sort((a,b)=>

                a.name.localeCompare(b.name)

            );

            break;

        case "streak":

            sorted.sort((a,b)=>

                b.streak-a.streak

            );

            break;

        case "completed":

            sorted.sort((a,b)=>

                b.totalCompletions-

                a.totalCompletions

            );

            break;

        case "newest":

            sorted.sort((a,b)=>

                b.created-a.created

            );

            break;

        case "oldest":

            sorted.sort((a,b)=>

                a.created-b.created

            );

            break;

    }

    return sorted;

}

function visibleHabits(){

    return sortHabits(

        searchHabits()

    );

}

/* ==========================================================
   DAY 5
   app.js
   Part 2 / 4
========================================================== */

/* ==========================================================
   HISTORY HELPERS
========================================================== */

function completionDates(habit){

    return Object.keys(habit.history)

        .filter(date=>habit.history[date])

        .sort();

}

function completedToday(habit){

    return habit.history[todayKey()]===true;

}

/* ==========================================================
   COMPLETE HABIT
========================================================== */

function toggleHabit(index){

    const habit=visibleHabits()[index];

    const today=todayKey();

    if(habit.history[today]){

        delete habit.history[today];

    }

    else{

        habit.history[today]=true;

    }

    refreshHabit(habit);

    renderHabits();

}

/* ==========================================================
   CURRENT STREAK
========================================================== */

function calculateCurrentStreak(habit){

    let streak=0;

    const date=new Date();

    while(true){

        const key=[

            date.getFullYear(),

            String(date.getMonth()+1)
            .padStart(2,"0"),

            String(date.getDate())
            .padStart(2,"0")

        ].join("-");

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

/* ==========================================================
   LONGEST STREAK
========================================================== */

function calculateLongestStreak(habit){

    const dates=completionDates(habit);

    if(dates.length===0){

        return 0;

    }

    let best=1;

    let current=1;

    for(let i=1;i<dates.length;i++){

        const previous=new Date(dates[i-1]);

        const next=new Date(dates[i]);

        if(daysBetween(previous,next)===1){

            current++;

        }

        else{

            current=1;

        }

        if(current>best){

            best=current;

        }

    }

    return best;

}

/* ==========================================================
   TOTAL COMPLETIONS
========================================================== */

function calculateTotalCompletions(habit){

    return completionDates(habit).length;

}

/* ==========================================================
   COMPLETION RATE
========================================================== */

function calculateCompletionRate(habit){

    const totalDays=Math.max(

        1,

        Math.floor(

            (Date.now()-habit.created)

            /86400000

        )+1

    );

    return Math.round(

        habit.totalCompletions

        /totalDays

        *100

    );

}

/* ==========================================================
   WEEKLY COMPLETION
========================================================== */

function weeklyCompletion(habit){

    let completed=0;

    for(let i=0;i<7;i++){

        const date=new Date();

        date.setDate(

            date.getDate()-i

        );

        const key=[

            date.getFullYear(),

            String(date.getMonth()+1)
            .padStart(2,"0"),

            String(date.getDate())
            .padStart(2,"0")

        ].join("-");

        if(habit.history[key]){

            completed++;

        }

    }

    return completed;

}

/* ==========================================================
   LAST COMPLETED
========================================================== */

function lastCompleted(habit){

    const dates=completionDates(habit);

    if(dates.length===0){

        return "Never";

    }

    const latest=

        dates[dates.length-1];

    if(latest===todayKey()){

        return "Today";

    }

    return latest;

}

/* ==========================================================
   REFRESH STATS
========================================================== */

function refreshHabit(habit){

    habit.streak=

        calculateCurrentStreak(habit);

    habit.longestStreak=

        calculateLongestStreak(habit);

    habit.totalCompletions=

        calculateTotalCompletions(habit);

}

function refreshAllHabits(){

    habits.forEach(refreshHabit);

}

/* ==========================================================
   FAVORITES
========================================================== */

function toggleFavorite(index){

    const habit=

        visible+Habits()[index];

    habit.favorite=

        !habit.favorite;

    renderHabits();

}

/* ==========================================================
   RENAME
========================================================== */

function renameHabit(index){

    const habit=

        visibleHabits()[index];

    const value=prompt(

        "Rename Habit",

        habit.name

    );

    if(value===null){

        return;

    }

    const name=value.trim();

    if(name===""){

        return;

    }

    habit.name=name;

    renderHabits();

}

/* ==========================================================
   NOTES
========================================================== */

function editNotes(index){

    const habit=

        visibleHabits()[index];

    const value=prompt(

        "Notes",

        habit.notes

    );

    if(value===null){

        return;

    }

    habit.notes=value;

    saveHabits();

}

/* ==========================================================
   CATEGORY
========================================================== */

function changeCategory(index){

    const habit=

        visibleHabits()[index];

    const value=prompt(

        "Category:\n"+

        CATEGORIES.join(", "),

        habit.category

    );

    if(value===null){

        return;

    }

    const category=value.trim();

    if(category===""){

        return;

    }

    habit.category=category;

    renderHabits();

}

/* ==========================================================
   DAY 5
   app.js
   Part 3 / 4
========================================================== */

/* ==========================================================
   HABIT CARD
========================================================== */

function createHabitCard(habit,index){

    const card = document.createElement("div");

    card.className = "habit fadeIn";

    const rate = calculateCompletionRate(habit);

    const weekly = weeklyCompletion(habit);

    card.innerHTML = `

        <div class="habitHeader">

            <div class="habitLeft">

                <div class="habitTitleRow">

                    <div class="habitName">

                        ${
                            habit.favorite
                            ? '<i class="fa-solid fa-star favoriteIcon"></i>'
                            : ''
                        }

                        ${habit.name}

                    </div>

                    <span class="categoryBadge">

                        <i class="fa-solid fa-tag"></i>

                        ${habit.category}

                    </span>

                </div>

                <div class="habitInfo">

                    <span class="badge">

                        <i class="fa-solid fa-fire"></i>

                        ${habit.streak}

                    </span>

                    <span class="badge">

                        <i class="fa-solid fa-trophy"></i>

                        ${habit.longestStreak}

                    </span>

                    <span class="badge">

                        <i class="fa-solid fa-calendar-week"></i>

                        ${weekly}/7

                    </span>

                    <span class="badge">

                        <i class="fa-solid fa-chart-line"></i>

                        ${rate}%

                    </span>

                    <span class="badge">

                        <i class="fa-solid fa-check-double"></i>

                        ${habit.totalCompletions}

                    </span>

                </div>

                <div class="lastCompleted">

                    <i class="fa-regular fa-clock"></i>

                    Last Completed:

                    <strong>

                        ${lastCompleted(habit)}

                    </strong>

                </div>

                ${
                    habit.notes.trim() !== ""

                    ?

                    `<div class="habitNotes">

                        <i class="fa-solid fa-note-sticky"></i>

                        ${habit.notes}

                    </div>`

                    :

                    ""

                }

            </div>

            <div class="habitButtons">

                <button
                    class="favoriteButton"
                    data-index="${index}"
                    title="Favorite">

                    <i class="${
                        habit.favorite
                        ? "fa-solid fa-star"
                        : "fa-regular fa-star"
                    }"></i>

                </button>

                <button
                    class="editButton"
                    data-index="${index}"
                    title="Rename">

                    <i class="fa-solid fa-pen"></i>

                </button>

                <button
                    class="notesButton"
                    data-index="${index}"
                    title="Notes">

                    <i class="fa-solid fa-note-sticky"></i>

                </button>

                <button
                    class="categoryButton"
                    data-index="${index}"
                    title="Category">

                    <i class="fa-solid fa-tag"></i>

                </button>

                <button
                    class="completeButton ${
                        completedToday(habit)
                        ? "completed"
                        : ""
                    }"
                    data-index="${index}"
                    title="Complete">

                    <i class="fa-solid fa-check"></i>

                </button>

                <button
                    class="deleteButton"
                    data-index="${index}"
                    title="Delete">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        </div>

    `;

    return card;

}

/* ==========================================================
   RENDER
========================================================== */

function renderHabits(){

    habitList.innerHTML = "";

    refreshAllHabits();

    const list = visibleHabits();

    if(list.length === 0){

        emptyState.classList.remove("hidden");

    }else{

        emptyState.classList.add("hidden");

    }

    list.forEach((habit,index)=>{

        habitList.appendChild(

            createHabitCard(habit,index)

        );

    });

    attachEvents();

    updateCounters();

    updateProgress();

    saveHabits();

}

/* ==========================================================
   ADD HABIT
========================================================== */

function addHabit(){

    const name = habitInput.value.trim();

    if(name === ""){

        alert("Please enter a habit.");

        return;

    }

    habits.push(

        createHabit(name)

    );

    habitInput.value = "";

    renderHabits();

}

/* ==========================================================
   DELETE HABIT
========================================================== */

function deleteHabit(index){

    const habit = visibleHabits()[index];

    if(!confirm(`Delete "${habit.name}"?`)){

        return;

    }

    habits = habits.filter(

        h => h.id !== habit.id

    );

    renderHabits();

}

/* ==========================================================
   COUNTERS
========================================================== */

function updateCounters(){

    habitTotal.textContent = habits.length;

    habitCount.textContent =

        habits.length +

        (habits.length === 1

            ? " Habit"

            : " Habits");

}

/* ==========================================================
   PROGRESS
========================================================== */

function updateProgress(){

    if(habits.length === 0){

        completedToday.textContent = "0%";

        if(progressBar){

            progressBar.style.width = "0%";

        }

        return;

    }

    const completed = habits.filter(

        completedToday

    ).length;

    const percent = Math.round(

        completed /

        habits.length *

        100

    );

    completedToday.textContent = percent + "%";

    if(progressBar){

        progressBar.style.width = percent + "%";

    }

}

/* ==========================================================
   DAY 5
   app.js
   Part 4 / 4
========================================================== */

/* ==========================================================
   EVENT LISTENERS
========================================================== */

function attachEvents(){

    document.querySelectorAll(".completeButton").forEach(button=>{

        button.onclick=()=>{

            toggleHabit(

                Number(button.dataset.index)

            );

        };

    });

    document.querySelectorAll(".deleteButton").forEach(button=>{

        button.onclick=()=>{

            deleteHabit(

                Number(button.dataset.index)

            );

        };

    });

    document.querySelectorAll(".favoriteButton").forEach(button=>{

        button.onclick=()=>{

            toggleFavorite(

                Number(button.dataset.index)

            );

        };

    });

    document.querySelectorAll(".editButton").forEach(button=>{

        button.onclick=()=>{

            renameHabit(

                Number(button.dataset.index)

            );

        };

    });

    document.querySelectorAll(".notesButton").forEach(button=>{

        button.onclick=()=>{

            editNotes(

                Number(button.dataset.index)

            );

        };

    });

    document.querySelectorAll(".categoryButton").forEach(button=>{

        button.onclick=()=>{

            changeCategory(

                Number(button.dataset.index)

            );

        };

    });

}

/* ==========================================================
   SEARCH
========================================================== */

const searchInput =

    document.getElementById("searchInput");

if(searchInput){

    searchInput.addEventListener(

        "input",

        function(){

            currentSearch=this.value;

            renderHabits();

        }

    );

}

/* ==========================================================
   SORT
========================================================== */

const sortSelect =

    document.getElementById("sortSelect");

if(sortSelect){

    sortSelect.addEventListener(

        "change",

        function(){

            currentSort=this.value;

            renderHabits();

        }

    );

}

/* ==========================================================
   INPUT EVENTS
========================================================== */

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

/* ==========================================================
   CLEANUP
========================================================== */

function cleanupHistory(){

    const cutoff=new Date();

    cutoff.setFullYear(

        cutoff.getFullYear()-2

    );

    const cutoffDate=cutoff.toISOString()

        .split("T")[0];

    habits.forEach(habit=>{

        Object.keys(habit.history)

        .forEach(date=>{

            if(date<cutoffDate){

                delete habit.history[date];

            }

        });

    });

}

/* ==========================================================
   SAVE BEFORE EXIT
========================================================== */

window.addEventListener(

    "beforeunload",

    saveHabits

);

/* ==========================================================
   INITIALIZE
========================================================== */

function initialize(){

    loadHabits();

    upgradeHabitData();

    cleanupHistory();

    refreshAllHabits();

    loadTheme();

    renderHabits();

}

/* ==========================================================
   START APP
========================================================== */

initialize();
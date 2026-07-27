"use strict";

/* ==========================================================
   CONFIGURATION
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
   APPLICATION STATE
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

const progressText =
    document.getElementById("completedToday");

const progressBar =
    document.getElementById("progressBar");

const themeButton =
    document.getElementById("themeButton");

const searchInput =
    document.getElementById("searchInput");

const sortSelect =
    document.getElementById("sortSelect");

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

/* ==========================================================
   THEME
========================================================== */

function loadTheme(){

    const saved =

        localStorage.getItem(

            THEME_KEY

        );

    if(saved === "dark"){

        document.body.classList.add(

            "dark"

        );

    }

}

function toggleTheme(){

    document.body.classList.toggle(

        "dark"

    );

    localStorage.setItem(

        THEME_KEY,

        document.body.classList.contains(

            "dark"

        )

        ? "dark"

        : "light"

    );

}

/* ==========================================================
   DATE UTILITIES
========================================================== */

function todayKey(){

    const date = new Date();

    return [

        date.getFullYear(),

        String(

            date.getMonth()+1

        ).padStart(2,"0"),

        String(

            date.getDate()

        ).padStart(2,"0")

    ].join("-");

}

function daysBetween(a,b){

    return Math.floor(

        (b-a)/86400000

    );

}

/* ==========================================================
   HABIT MODEL
========================================================== */

function createHabit(name){

    return{

        id:

            crypto.randomUUID(),

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
   SAVE UPGRADE
========================================================== */

function upgradeHabitData(){

    habits.forEach(habit=>{

        if(!habit.id){

            habit.id =

                crypto.randomUUID();

        }

        if(!habit.category){

            habit.category =

                "General";

        }

        if(typeof habit.favorite

            !== "boolean"){

            habit.favorite =

                false;

        }

        if(typeof habit.notes

            !== "string"){

            habit.notes = "";

        }

        if(typeof habit.history

            !== "object"

            ||

            habit.history===null){

            habit.history = {};

        }

        if(typeof habit.streak

            !== "number"){

            habit.streak = 0;

        }

        if(typeof habit.longestStreak

            !== "number"){

            habit.longestStreak = 0;

        }

        if(typeof habit.totalCompletions

            !== "number"){

            habit.totalCompletions = 0;

        }

    });

}

/* ==========================================================
   FIND HABIT
========================================================== */

function getHabit(id){

    return habits.find(

        habit =>

        habit.id === id

    );

}

/* ==========================================================
   FILTERING
========================================================== */

function getVisibleHabits(){

    let list = [...habits];

    if(currentSearch !== ""){

        const search =

            currentSearch

            .toLowerCase();

        list = list.filter(habit =>

            habit.name

                .toLowerCase()

                .includes(search)

            ||

            habit.category

                .toLowerCase()

                .includes(search)

        );

    }

    switch(currentSort){

        case "favorite":

            list.sort(

                (a,b)=>

                Number(b.favorite)

                -

                Number(a.favorite)

            );

            break;

        case "alphabetical":

            list.sort(

                (a,b)=>

                a.name.localeCompare(

                    b.name

                )

            );

            break;

        case "streak":

            list.sort(

                (a,b)=>

                b.streak-a.streak

            );

            break;

        case "completed":

            list.sort(

                (a,b)=>

                b.totalCompletions

                -

                a.totalCompletions

            );

            break;

        case "newest":

            list.sort(

                (a,b)=>

                b.created-a.created

            );

            break;

        case "oldest":

            list.sort(

                (a,b)=>

                a.created-b.created

            );

            break;

    }

    return list;

}

/* ==========================================================
   HISTORY HELPERS
========================================================== */

function isCompletedToday(habit){

    return habit.history[todayKey()] === true;

}

function getCompletionDates(habit){

    return Object.keys(habit.history)

        .filter(date => habit.history[date])

        .sort();

}

/* ==========================================================
   TOGGLE COMPLETION
========================================================== */

function toggleHabit(id){

    const habit = getHabit(id);

    if(!habit){

        return;

    }

    const today = todayKey();

    if(habit.history[today]){

        delete habit.history[today];

    }

    else{

        habit.history[today] = true;

    }

    updateHabitStats(habit);

    renderHabits();

}

/* ==========================================================
   CURRENT STREAK
========================================================== */

function calculateCurrentStreak(habit){

    let streak = 0;

    const date = new Date();

    while(true){

        const key = [

            date.getFullYear(),

            String(date.getMonth()+1).padStart(2,"0"),

            String(date.getDate()).padStart(2,"0")

        ].join("-");

        if(habit.history[key]){

            streak++;

            date.setDate(

                date.getDate()-1

            );

        }

        else{

            break;

        }

    }

    return streak;

}

/* ==========================================================
   LONGEST STREAK
========================================================== */

function calculateLongestStreak(habit){

    const dates = getCompletionDates(habit);

    if(dates.length===0){

        return 0;

    }

    let longest = 1;

    let current = 1;

    for(let i=1;i<dates.length;i++){

        const previous = new Date(dates[i-1]);

        const next = new Date(dates[i]);

        if(daysBetween(previous,next)===1){

            current++;

        }

        else{

            current=1;

        }

        if(current>longest){

            longest=current;

        }

    }

    return longest;

}

/* ==========================================================
   TOTAL COMPLETIONS
========================================================== */

function calculateTotalCompletions(habit){

    return getCompletionDates(habit).length;

}

/* ==========================================================
   WEEKLY COMPLETION
========================================================== */

function calculateWeeklyCompletion(habit){

    let count = 0;

    for(let i=0;i<7;i++){

        const date = new Date();

        date.setDate(

            date.getDate()-i

        );

        const key=[

            date.getFullYear(),

            String(date.getMonth()+1).padStart(2,"0"),

            String(date.getDate()).padStart(2,"0")

        ].join("-");

        if(habit.history[key]){

            count++;

        }

    }

    return count;

}

/* ==========================================================
   COMPLETION %
========================================================== */

function calculateCompletionRate(habit){

    const days = Math.max(

        1,

        Math.floor(

            (Date.now()-habit.created)

            /86400000

        )+1

    );

    return Math.round(

        habit.totalCompletions /

        days *

        100

    );

}

/* ==========================================================
   LAST COMPLETED
========================================================== */

function getLastCompleted(habit){

    const dates = getCompletionDates(habit);

    if(dates.length===0){

        return "Never";

    }

    const latest = dates[dates.length-1];

    if(latest===todayKey()){

        return "Today";

    }

    return latest;

}

/* ==========================================================
   UPDATE STATS
========================================================== */

function updateHabitStats(habit){

    habit.streak =

        calculateCurrentStreak(habit);

    habit.longestStreak =

        calculateLongestStreak(habit);

    habit.totalCompletions =

        calculateTotalCompletions(habit);

}

function updateAllHabitStats(){

    habits.forEach(habit=>{

        updateHabitStats(habit);

    });

}

/* ==========================================================
   ADD HABIT
========================================================== */

function addHabit(){

    const name =

        habitInput.value.trim();

    if(name===""){

        alert(

            "Please enter a habit."

        );

        return;

    }

    habits.push(

        createHabit(name)

    );

    habitInput.value="";

    renderHabits();

}

/* ==========================================================
   DELETE HABIT
========================================================== */

function deleteHabit(id){

    const habit = getHabit(id);

    if(!habit){

        return;

    }

    if(!confirm(

        `Delete "${habit.name}"?`

    )){

        return;

    }

    habits = habits.filter(

        h => h.id !== id

    );

    renderHabits();

}

/* ==========================================================
   FAVORITES
========================================================== */

function toggleFavorite(id){

    const habit = getHabit(id);

    if(!habit){

        return;

    }

    habit.favorite =

        !habit.favorite;

    renderHabits();

}

/* ==========================================================
   RENAME
========================================================== */

function renameHabit(id){

    const habit = getHabit(id);

    if(!habit){

        return;

    }

    const value = prompt(

        "Rename habit",

        habit.name

    );

    if(value===null){

        return;

    }

    const name = value.trim();

    if(name===""){

        return;

    }

    habit.name = name;

    renderHabits();

}

/* ==========================================================
   NOTES
========================================================== */

function editNotes(id){

    const habit = getHabit(id);

    if(!habit){

        return;

    }

    const value = prompt(

        "Notes",

        habit.notes

    );

    if(value===null){

        return;

    }

    habit.notes = value;

    saveHabits();

    renderHabits();

}

/* ==========================================================
   CATEGORY
========================================================== */

function changeCategory(id){

    const habit = getHabit(id);

    if(!habit){

        return;

    }

    const value = prompt(

        "Category\n\n"+

        CATEGORIES.join(", "),

        habit.category

    );

    if(value===null){

        return;

    }

    if(value.trim()===""){

        return;

    }

    habit.category =

        value.trim();

    renderHabits();

}

/* ==========================================================
   HABIT CARD
========================================================== */

function createHabitCard(habit){

    const card = document.createElement("div");

    card.className = "habit fadeIn";

    const weekly = calculateWeeklyCompletion(habit);

    const completionRate = calculateCompletionRate(habit);

    card.innerHTML = `

        <div class="habitHeader">

            <div class="habitLeft">

                <div class="habitTitleRow">

                    <div class="habitName">

                        ${
                            habit.favorite
                            ? '<i class="fa-solid fa-star favoriteIcon"></i>'
                            : ""
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

                        ${completionRate}%

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

                        ${getLastCompleted(habit)}

                    </strong>

                </div>

                ${
                    habit.notes.trim() !== ""

                    ?

                    `

                    <div class="habitNotes">

                        <i class="fa-solid fa-note-sticky"></i>

                        ${habit.notes}

                    </div>

                    `

                    :

                    ""

                }

            </div>

            <div class="habitButtons">

                <button

                    class="favoriteButton"

                    data-id="${habit.id}"

                    title="Favorite">

                    <i class="${
                        habit.favorite

                        ?

                        "fa-solid fa-star"

                        :

                        "fa-regular fa-star"

                    }"></i>

                </button>

                <button

                    class="renameButton"

                    data-id="${habit.id}"

                    title="Rename">

                    <i class="fa-solid fa-pen"></i>

                </button>

                <button

                    class="notesButton"

                    data-id="${habit.id}"

                    title="Notes">

                    <i class="fa-solid fa-note-sticky"></i>

                </button>

                <button

                    class="categoryButton"

                    data-id="${habit.id}"

                    title="Category">

                    <i class="fa-solid fa-tag"></i>

                </button>

                <button

                    class="completeButton ${

                        isCompletedToday(habit)

                        ?

                        "completed"

                        :

                        ""

                    }"

                    data-id="${habit.id}"

                    title="Complete">

                    <i class="fa-solid fa-check"></i>

                </button>

                <button

                    class="deleteButton"

                    data-id="${habit.id}"

                    title="Delete">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        </div>

    `;

    return card;

}

/* ==========================================================
   COUNTERS
========================================================== */

function updateCounters(){

    habitTotal.textContent = habits.length;

    habitCount.textContent =

        habits.length +

        (

            habits.length === 1

            ?

            " Habit"

            :

            " Habits"

        );

}

/* ==========================================================
   DAILY PROGRESS
========================================================== */

function updateProgress(){

    if(!progressText || !progressBar){

        return;

    }

    if(habits.length===0){

        progressText.textContent = "0%";

        progressBar.style.width = "0%";

        return;

    }

    const completed = habits.filter(

        habit => isCompletedToday(habit)

    ).length;

    const percent = Math.round(

        completed /

        habits.length *

        100

    );

    progressText.textContent =

        percent + "%";

    progressBar.style.width =

        percent + "%";

}

/* ==========================================================
   RENDER
========================================================== */

function renderHabits(){

    updateAllHabitStats();

    habitList.innerHTML = "";

    const visible =

        getVisibleHabits();

    if(visible.length===0){

        emptyState.classList.remove(

            "hidden"

        );

    }

    else{

        emptyState.classList.add(

            "hidden"

        );

    }

    visible.forEach(habit=>{

        habitList.appendChild(

            createHabitCard(habit)

        );

    });

    attachEvents();

    updateCounters();

    updateProgress();

    saveHabits();

}

/* ==========================================================
   BUTTON EVENTS
========================================================== */

function attachEvents(){

    document.querySelectorAll(".completeButton").forEach(button=>{

        button.onclick=()=>{

            toggleHabit(

                button.dataset.id

            );

        };

    });

    document.querySelectorAll(".deleteButton").forEach(button=>{

        button.onclick=()=>{

            deleteHabit(

                button.dataset.id

            );

        };

    });

    document.querySelectorAll(".favoriteButton").forEach(button=>{

        button.onclick=()=>{

            toggleFavorite(

                button.dataset.id

            );

        };

    });

    document.querySelectorAll(".renameButton").forEach(button=>{

        button.onclick=()=>{

            renameHabit(

                button.dataset.id

            );

        };

    });

    document.querySelectorAll(".notesButton").forEach(button=>{

        button.onclick=()=>{

            editNotes(

                button.dataset.id

            );

        };

    });

    document.querySelectorAll(".categoryButton").forEach(button=>{

        button.onclick=()=>{

            changeCategory(

                button.dataset.id

            );

        };

    });

}

/* ==========================================================
   SEARCH
========================================================== */

if(searchInput){

    searchInput.addEventListener(

        "input",

        function(){

            currentSearch = this.value;

            renderHabits();

        }

    );

}

/* ==========================================================
   SORT
========================================================== */

if(sortSelect){

    sortSelect.addEventListener(

        "change",

        function(){

            currentSort = this.value;

            renderHabits();

        }

    );

}

/* ==========================================================
   ADD HABIT
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

/* ==========================================================
   THEME
========================================================== */

themeButton.addEventListener(

    "click",

    toggleTheme

);

/* ==========================================================
   CLEAN OLD HISTORY
========================================================== */

function cleanupHistory(){

    const cutoff = new Date();

    cutoff.setFullYear(

        cutoff.getFullYear()-2

    );

    const oldest = [

        cutoff.getFullYear(),

        String(

            cutoff.getMonth()+1

        ).padStart(2,"0"),

        String(

            cutoff.getDate()

        ).padStart(2,"0")

    ].join("-");

    habits.forEach(habit=>{

        Object.keys(

            habit.history

        ).forEach(date=>{

            if(date<oldest){

                delete habit.history[date];

            }

        });

    });

}

/* ==========================================================
   SAVE WHEN LEAVING
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

    updateAllHabitStats();

    loadTheme();

    renderHabits();

}

/* ==========================================================
   START APP
========================================================== */

initialize();
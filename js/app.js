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
   DAY 6
   STATISTICS ENGINE
========================================================== */

function completedTodayCount(){

    return habits.filter(

        habit => isCompletedToday(habit)

    ).length;

}

function overallCompletionRate(){

    if(habits.length===0){

        return 0;

    }

    const total = habits.reduce(

        (sum,habit)=>

        sum+calculateCompletionRate(habit),

        0

    );

    return Math.round(

        total/habits.length

    );

}

function longestOverallStreak(){

    if(habits.length===0){

        return 0;

    }

    return Math.max(

        ...habits.map(

            habit=>habit.longestStreak

        )

    );

}

function currentOverallStreak(){

    if(habits.length===0){

        return 0;

    }

    return Math.max(

        ...habits.map(

            habit=>habit.streak

        )

    );

}

function mostCompletedHabit(){

    if(habits.length===0){

        return null;

    }

    let winner = habits[0];

    habits.forEach(habit=>{

        if(

            habit.totalCompletions >

            winner.totalCompletions

        ){

            winner = habit;

        }

    });

    return winner;

}

function updateDashboard(){

    const rate =

        document.getElementById(

            "overallRate"

        );

    const longest =

        document.getElementById(

            "overallLongest"

        );

    const current =

        document.getElementById(

            "overallCurrent"

        );

    const top =

        document.getElementById(

            "topHabit"

        );

    if(rate){

        rate.textContent =

            overallCompletionRate()+"%";

    }

    if(longest){

        longest.textContent =

            longestOverallStreak();

    }

    if(current){

        current.textContent =

            currentOverallStreak();

    }

    if(top){

        const winner =

            mostCompletedHabit();

        top.textContent =

            winner

            ?

            winner.name

            :

            "None";

    }

}

let calendarDate = new Date();

/* ==========================================================
   CALENDAR HELPERS
========================================================== */

function formatDateKey(year, month, day){

    return [

        year,

        String(month + 1).padStart(2,"0"),

        String(day).padStart(2,"0")

    ].join("-");

}

function completedOnDate(dateKey){

    return habits.filter(

        habit => habit.history[dateKey]

    );

}

/* ==========================================================
   CALENDAR
========================================================== */

function renderCalendar(){

    const container = document.getElementById("calendar");

    if(!container){

        return;

    }

    container.innerHTML = "";

    const year = calendarDate.getFullYear();

    const month = calendarDate.getMonth();

    const firstDay = new Date(year, month, 1);

    const lastDay = new Date(year, month + 1, 0);

    const startWeekday = firstDay.getDay();

    const totalDays = lastDay.getDate();

    /* ======================
       HEADER
    ====================== */

    const header = document.createElement("div");

    header.className = "calendarHeader";

    header.innerHTML = `

        <button id="calendarPrev">

            <i class="fa-solid fa-chevron-left"></i>

        </button>

        <h3>

            ${calendarDate.toLocaleString("default",{
                month:"long",
                year:"numeric"
            })}

        </h3>

        <button id="calendarNext">

            <i class="fa-solid fa-chevron-right"></i>

        </button>

    `;

    container.appendChild(header);

    /* ======================
       WEEKDAYS
    ====================== */

    const weekdays = document.createElement("div");

    weekdays.className = "calendarWeekdays";

    ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

    .forEach(day=>{

        const div = document.createElement("div");

        div.textContent = day;

        weekdays.appendChild(div);

    });

    container.appendChild(weekdays);

    /* ======================
       GRID
    ====================== */

    const grid = document.createElement("div");

    grid.className = "calendarGrid";

    for(let i=0;i<startWeekday;i++){

        grid.appendChild(

            document.createElement("div")

        );

    }

    const today = todayKey();

    for(let day=1;day<=totalDays;day++){

        const key = formatDateKey(

            year,

            month,

            day

        );

        const completed = completedOnDate(key);

        const cell = document.createElement("div");

        cell.className = "calendarDay";

        if(key===today){

            cell.classList.add("today");

        }

        if(completed.length>0){

            cell.classList.add("completed");

        }

        cell.innerHTML = `

            <span>${day}</span>

        `;

        cell.onclick=()=>{

            showDaySummary(

                key,

                completed

            );

        };

        grid.appendChild(cell);

    }

    container.appendChild(grid);

    /* ======================
       BUTTONS
    ====================== */

    document.getElementById(

        "calendarPrev"

    ).onclick=()=>{

        calendarDate.setMonth(

            calendarDate.getMonth()-1

        );

        renderCalendar();

    };

    document.getElementById(

        "calendarNext"

    ).onclick=()=>{

        calendarDate.setMonth(

            calendarDate.getMonth()+1

        );

        renderCalendar();

    };

}

/* ==========================================================
   DAY SUMMARY
========================================================== */

function showDaySummary(dateKey,list){

    if(list.length===0){

        alert(

            `${dateKey}\n\nNo habits completed.`

        );

        return;

    }

    const names = list

        .map(h=>`• ${h.name}`)

        .join("\n");

    alert(

`${dateKey}

Completed ${list.length} habit${

list.length===1?"":"s"

}

-------------------------

${names}`

    );

}

/* ==========================================================
   WEEKLY DATA
========================================================== */

function getWeeklyData(){

    const data = [];

    for(let i=6;i>=0;i--){

        const date = new Date();

        date.setDate(date.getDate()-i);

        const key = todayKeyFromDate(date);

        let completed = 0;

        habits.forEach(habit=>{

            if(habit.history[key]){

                completed++;

            }

        });

        data.push({

            label:date.toLocaleDateString("en-US",{

                weekday:"short"

            }),

            completed:completed

        });

    }

    return data;

}

function todayKeyFromDate(date){

    return [

        date.getFullYear(),

        String(date.getMonth()+1).padStart(2,"0"),

        String(date.getDate()).padStart(2,"0")

    ].join("-");

}

/* ==========================================================
   CATEGORY STATS
========================================================== */

function categoryStats(){

    const stats = {};

    habits.forEach(habit=>{

        if(!stats[habit.category]){

            stats[habit.category]=0;

        }

        stats[habit.category]++;

    });

    return stats;

}

/* ==========================================================
   UPDATE DASHBOARD
========================================================== */

function updateDashboard(){

    const overallRate = document.getElementById("overallRate");
    const overallLongest = document.getElementById("overallLongest");
    const overallCurrent = document.getElementById("overallCurrent");
    const topHabit = document.getElementById("topHabit");

    if(overallRate){

        overallRate.textContent =

            overallCompletionRate()+"%";

    }

    if(overallLongest){

        overallLongest.textContent =

            longestOverallStreak();

    }

    if(overallCurrent){

        overallCurrent.textContent =

            currentOverallStreak();

    }

    if(topHabit){

        const winner = mostCompletedHabit();

        topHabit.textContent =

            winner

            ?

            winner.name

            :

            "None";

    }

    renderWeeklyChart();

    renderCategoryChart();

}

/* ==========================================================
   WEEKLY CHART
========================================================== */

function renderWeeklyChart(){

    const chart = document.getElementById("weeklyChart");

    if(!chart){

        return;

    }

    chart.innerHTML="";

    const data = getWeeklyData();

    const max = Math.max(

        habits.length,

        1

    );

    data.forEach(day=>{

        const bar = document.createElement("div");

        bar.className="weekBar";

        const height =

            (day.completed/max)*100;

        bar.innerHTML = `

            <div
                class="bar"
                style="height:${height}%">
            </div>

            <span>

                ${day.label}

            </span>

        `;

        chart.appendChild(bar);

    });

}

/* ==========================================================
   CATEGORY CHART
========================================================== */

function renderCategoryChart(){

    const chart = document.getElementById(

        "categoryChart"

    );

    if(!chart){

        return;

    }

    chart.innerHTML="";

    const stats = categoryStats();

    Object.keys(stats).forEach(category=>{

        const row = document.createElement("div");

        row.className="categoryRow";

        row.innerHTML = `

            <span>

                ${category}

            </span>

            <strong>

                ${stats[category]}

            </strong>

        `;

        chart.appendChild(row);

    });

}

/* ==========================================================
   REFRESH EVERYTHING
========================================================== */

const originalRender = renderHabits;

renderHabits = function(){

    originalRender();

    updateDashboard();

    renderCalendar();

};

/* ==========================================================
   ACHIEVEMENTS
========================================================== */

const achievements = [

    {
        id:"firstHabit",
        icon:"fa-seedling",
        color:"#22C55E",
        title:"First Habit Created",
        check:()=>habits.length>=1
    },

    {
        id:"fiveHabits",
        icon:"fa-list-check",
        color:"#2563EB",
        title:"Five Habits Added",
        check:()=>habits.length>=5
    },

    {
        id:"weekStreak",
        icon:"fa-fire",
        color:"#F97316",
        title:"7 Day Streak",
        check:()=>longestOverallStreak()>=7
    },

    {
        id:"monthStreak",
        icon:"fa-trophy",
        color:"#FACC15",
        title:"30 Day Streak",
        check:()=>longestOverallStreak()>=30
    },

    {
        id:"hundred",
        icon:"fa-star",
        color:"#8B5CF6",
        title:"100 Total Completions",
        check:()=>{

            let total=0;

            habits.forEach(h=>{

                total+=h.totalCompletions;

            });

            return total>=100;

        }

    }

];

/* ==========================================================
   STORAGE
========================================================== */

function unlockedAchievements(){

    return JSON.parse(

        localStorage.getItem(

            "habitAchievements"

        ) || "[]"

    );

}

function saveAchievements(list){

    localStorage.setItem(

        "habitAchievements",

        JSON.stringify(list)

    );

}

/* ==========================================================
   CHECK
========================================================== */

function checkAchievements(){

    const unlocked=unlockedAchievements();

    achievements.forEach(a=>{

        if(

            !unlocked.includes(a.id)

            &&

            a.check()

        ){

            unlocked.push(a.id);

            showAchievement(a);

        }

    });

    saveAchievements(unlocked);

}

/* ==========================================================
   POPUP
========================================================== */

function showAchievement(achievement){

    const popup=document.createElement("div");

    popup.className="achievementPopup";

    popup.innerHTML=`

        <div class="achievementIcon"

             style="background:${achievement.color};">

            <i class="fa-solid ${achievement.icon}"></i>

        </div>

        <div class="achievementContent">

            <h4>

                Achievement Unlocked

            </h4>

            <p>

                ${achievement.title}

            </p>

        </div>

    `;

    document.body.appendChild(popup);

    requestAnimationFrame(()=>{

        popup.classList.add("show");

    });

    setTimeout(()=>{

        popup.classList.remove("show");

        setTimeout(()=>{

            popup.remove();

        },400);

    },3500);

}

/* ==========================================================
   DAILY CELEBRATION
========================================================== */

function dailyReminder(){

    if(habits.length===0){

        return;

    }

    if(

        completedTodayCount()===habits.length

    ){

        showAchievement({

            icon:"fa-circle-check",

            color:"#22C55E",

            title:"Every habit completed today!"

        });

    }

}

/* ==========================================================
   YEAR HEATMAP
========================================================== */

function renderHeatmap(){

    const heatmap=document.getElementById("heatmap");

    if(!heatmap){

        return;

    }

    heatmap.innerHTML="";

    for(let i=364;i>=0;i--){

        const date=new Date();

        date.setDate(

            date.getDate()-i

        );

        const key=todayKeyFromDate(date);

        let completed=0;

        habits.forEach(h=>{

            if(h.history[key]){

                completed++;

            }

        });

        const cell=document.createElement("div");

        cell.className="heatCell";

        if(completed>0){

            cell.classList.add("active");

            cell.style.opacity=Math.min(

                .25+

                completed/

                Math.max(habits.length,1),

                1

            );

        }

        cell.innerHTML=

            completed

            ?

            '<i class="fa-solid fa-check"></i>'

            :

            "";

        cell.title=

            `${key}\n${completed} completed`;

        heatmap.appendChild(cell);

    }

}

/* ==========================================================
   ANIMATED DASHBOARD
========================================================== */

function refreshDashboard(){

    updateDashboard();

    renderCalendar();

    renderHeatmap();

    checkAchievements();

    dailyReminder();

}

/* ==========================================================
   WRAP RENDER
========================================================== */

const previousRenderHabits=renderHabits;

renderHabits=function(){

    previousRenderHabits();

    refreshDashboard();

};

/* ==========================================================
   START APP
========================================================== */

initialize();
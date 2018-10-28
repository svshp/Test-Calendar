'use strict'

//**********************************************************************
// var

let storage = {
    curentFormat: 'YYYY-MM-DD',
    curentMonth: null,
    longPeriod: false,
    tableEvents: null,
    startDate: null,
    endDate: null,
    outputDate: null
}

//**********************************************************************

window.onload = function () {
    storage.curentMonth = moment().date(1).hours(0).minutes(0).seconds(0);

    setUpButtons();
    calculateDates();
    buildLayoutTable();
    outputPeriod();
    readData();
}

//**********************************************************************
// Events

function setUpButtons() {
    let btnAdd = document.querySelector('.block-header__btn-add');
    btnAdd.addEventListener('click', addEvent);

    let btnUpdate = document.querySelector('.block-header__btn-update');
    btnUpdate.addEventListener('click', updateEvent);

    let btnFind = document.querySelector('.block-header__find_find');
    btnFind.addEventListener('click', findEvents);

    let btnMonthMinus = document.querySelector('.section-dates__select-period_month-minus');
    btnMonthMinus.addEventListener('click', monthMinus);

    let btnMonthPlus = document.querySelector('.section-dates__select-period_month-plus');
    btnMonthPlus.addEventListener('click', monthPlus);

    let btnToday = document.querySelector('.section-dates__select-period_today');
    btnToday.addEventListener('click', setToday);
}

function addEvent() {
    console.log('addEvent()');
}

function updateEvent() {
    localStorage.setItem('arrayEvents', JSON.stringify(storage.tableEvents));
}

function findEvents() {
    console.log('findEvents()');
}

function monthMinus() {
    let prevMaxRows = storage.longPeriod ? 6 : 5;

    storage.curentMonth = moment(storage.curentMonth).add(-1, 'month');

    calculateDates();
    correctLayoutTable(prevMaxRows);
    outputPeriod();
    fillTable();
}

function monthPlus() {
    let prevMaxRows = storage.longPeriod ? 6 : 5;

    storage.curentMonth = moment(storage.curentMonth).add(+1, 'month');

    calculateDates();
    correctLayoutTable(prevMaxRows);
    outputPeriod();
    fillTable();
}

function setToday() {
    let prevMaxRows = storage.longPeriod ? 6 : 5;

    storage.curentMonth = moment().date(1).hours(0).minutes(0).seconds(0);

    calculateDates();
    correctLayoutTable(prevMaxRows);
    outputPeriod();
    fillTable();
}

//**********************************************************************

function calculateDates() {
    let shiftDate = -(storage.curentMonth.day() - 1);

    if (storage.curentMonth.day() === 0) {
        shiftDate = -6;
    }

    storage.startDate = moment(storage.curentMonth).add(shiftDate, 'days');
    storage.endDate = moment(storage.startDate).add(42, 'days').add(-1,'seconds');
    storage.outputDate = moment(storage.startDate);

    if (storage.endDate.date() > 6 ) {
        storage.endDate.add(-7, 'days');
        storage.longPeriod = false;
    }
    else{
        storage.longPeriod = true;
    }
}

function buildLayoutTable() {
    let sectionDatesTable = document.querySelector('.section-dates__table');

    let maxRows = storage.longPeriod ? 6 : 5;

    for (let i = 0; i < maxRows; i++) {
        let sectionDatesTableRow = generateTableRow();
        sectionDatesTableRow.classList.add('section-dates__table_row');

        sectionDatesTable.appendChild(sectionDatesTableRow);
    }
}

function correctLayoutTable(prevMaxRows) {
    let sectionDatesTable = document.querySelector('.section-dates__table');

    let maxRows = storage.longPeriod ? 6 : 5;

    if (maxRows > prevMaxRows) {
        let sectionDatesTableRow = generateTableRow();
        sectionDatesTableRow.classList.add('section-dates__table_row');

        sectionDatesTable.appendChild(sectionDatesTableRow);
    }
    else if (maxRows < prevMaxRows) {
        let sectionDatesTableRow = generateTableRow();

        sectionDatesTable.removeChild(sectionDatesTable.lastChild);
    }
}

function generateTableRow() {
    let tableRow = document.createElement( 'div' );

    for (let y = 0; y < 7; y++) {
        let sectionDatesTableCol = generateTableRowCol();
        sectionDatesTableCol.classList.add('section-dates__table_col');

        tableRow.appendChild(sectionDatesTableCol);
    }

    return tableRow;
}

function generateTableRowCol() {
    let tableRowCol = document.createElement( 'div' );
    let span = document.createElement( 'span' );
    let div1 = document.createElement( 'div' );
    let div2 = document.createElement( 'div' );

    div1.classList.add('section-dates__table_col-event');
    div2.classList.add('section-dates__table_col-participant');

    tableRowCol.appendChild(span);
    tableRowCol.appendChild(div1);
    tableRowCol.appendChild(div2);

    storage.outputDate.add(1, 'days');
    
    return tableRowCol;
}

function outputPeriod() {
    let selectedPeriod = document.querySelector('.section-dates__select-period_month-text');
    selectedPeriod.textContent = getSelectedPeriod();
}

function getSelectedPeriod() {
    // moment.locale('ru');
    return moment(storage.curentMonth).format('MMMM YYYY');
}

function fillTable() {
    storage.outputDate = moment(storage.startDate);

    let countDate = 0;
    let firstEventIndex = findFirstEventIndex(storage.outputDate);

    let curTable = document.querySelector('.section-dates__table');

    for (let r = 0; r < curTable.children.length; r++) {
        let childrenRow = curTable.children[r];

        for (let c = 0; c < childrenRow.children.length; c++) {
            let curTableCol = childrenRow.children[c];
            let curTableColSpan = curTableCol.querySelector('span');

            curTableCol.classList.remove('today');
            curTableCol.classList.remove('event');

            curTableColSpan.textContent = countDate < 7 ? storage.outputDate.format('dddd') + ', ' : '';
            curTableColSpan.textContent += storage.outputDate.date();
    
            if (storage.outputDate.format(storage.curentFormat) === moment().hours(0).minutes(0).seconds(0).format(storage.curentFormat)) {
                curTableCol.classList.add('today');
            }

            let curTableColEvent = curTableCol.querySelector('.section-dates__table_col-event');
            curTableColEvent.textContent = '';
            let curTableColParticipants = curTableCol.querySelector('.section-dates__table_col-participant');
            curTableColParticipants.textContent = '';

            if ((firstEventIndex !== -1) && (firstEventIndex < storage.tableEvents.length)) {
                if (equalDates(firstEventIndex)) {
                    curTableColEvent.textContent = storage.tableEvents[firstEventIndex].title;

                    curTableCol.classList.add('event');

                    addParticipants(curTableColParticipants, firstEventIndex);

                    firstEventIndex++;
                }
            }
            
            countDate++;
            storage.outputDate.add(1, 'days');
        }
    }
}

function findFirstEventIndex(startDate) {
    let curIndex = -1;

    for (let i = 0; i < storage.tableEvents.length; i++) {
        if (moment(storage.tableEvents[i].date) >= moment(startDate)) {
            curIndex = i;
            break;
        }
    }

    return curIndex;
}

function equalDates(firstEventIndex) {
    return moment(storage.tableEvents[firstEventIndex].date).hours(0).minutes(0).seconds(0).format(storage.curentFormat)
           === moment(storage.outputDate).hours(0).minutes(0).seconds(0).format(storage.curentFormat);
}

function addParticipants(curTableColParticipants, firstEventIndex) {
    let quantParticipants = storage.tableEvents[firstEventIndex].participants.length;

    let listParticipants = '';

    for (let i = 0; i < quantParticipants; i++) {
        listParticipants += storage.tableEvents[firstEventIndex].participants[i].name
                         + ' '
                         + storage.tableEvents[firstEventIndex].participants[i].surname;

        if (i === (quantParticipants - 1)) {
            listParticipants += '.';
        }
        else {
            listParticipants += ', ';
        }
    }

    curTableColParticipants.textContent = listParticipants;
}

function readData() {
    storage.tableEvents = JSON.parse(localStorage.getItem('arrayEvents'));

    if (storage.tableEvents === null) {
        let xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    storage.tableEvents = JSON.parse(xhr.responseText).events;
                
                    storage.tableEvents.sort((first, second) => (moment(first.date) - moment(second.date)));
    
                    fillTable();
                }
            }
        }
    
        xhr.open('GET', './events.json', true);
        xhr.send();
        }
    else {
        storage.tableEvents.sort((first, second) => (moment(first.date) - moment(second.date)));

        fillTable();
    }
}
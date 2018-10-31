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

    calculateDates();
    buildLayoutTable();
    outputPeriod();
    readData();
    setUpButtons();
}

//**********************************************************************
// Setup

function setUpButtons() {
    let btnAdd = document.querySelector('.block-header__btn-add');
    btnAdd.addEventListener('click', addEvent);

    let btnUpdate = document.querySelector('.block-header__btn-update');
    btnUpdate.addEventListener('click', updateEvent);

    let fieldFind = document.querySelector('.block-header__find_field');
    fieldFind.addEventListener('keyup', fieldFindEvents);

    let btnClear = document.querySelector('.block-header__find_btn-clear');
    btnClear.addEventListener('click', fieldFindBtnClear);

    let btnMonthMinus = document.querySelector('.section-dates__select-period_month-minus');
    btnMonthMinus.addEventListener('click', monthMinus);

    let btnMonthPlus = document.querySelector('.section-dates__select-period_month-plus');
    btnMonthPlus.addEventListener('click', monthPlus);

    let btnToday = document.querySelector('.section-dates__select-period_today');
    btnToday.addEventListener('click', setToday);

    let btnClose = document.querySelector('.add-events__body_btn-close');
    btnClose.addEventListener('click', addEventsBtnClose);

    let btnCreate = document.querySelector('.add-events__body_btn-create');
    btnCreate.addEventListener('click', addEventsBtnCreate);

    let btnOk = document.querySelector('.add-events__body_btn-ok');
    btnOk.addEventListener('click', addEventsBtnOk);

    let btnDelete = document.querySelector('.add-events__body_btn-delete');
    btnDelete.addEventListener('click', addEventsBtnDelete);

    let tableCol = document.querySelectorAll('.section-dates__table_col');
    for (let i =0; i < tableCol.length; i++) {
        tableCol[i].addEventListener('dblclick', editEvent);
    }
}

//**********************************************************************
// Events

function addEvent() {
    let btnAddEvent = document.querySelector('.block-header__btn-add');
    let addEvent = document.querySelector('.add-events');

    document.querySelector('.add-events__body_btn-ok').style.display = 'none';
    document.querySelector('.add-events__body_btn-delete').style.display = 'none';

    addEvent.style.top = (btnAddEvent.offsetTop + btnAddEvent.offsetHeight + 10) + 'px';
    addEvent.style.left = btnAddEvent.offsetLeft + 'px';
    addEvent.style.height = '500px';
    addEvent.style.width = '350px';
    addEvent.style.display = 'block';
}

function addEventsBtnClose() {
    closeAddEvents();
}

function addEventsBtnCreate() {
    if (verifeEvent()) {
        createEvent();
        closeAddEvents();
    }
}

function addEventsBtnOk() {
    console.log('addEventsBtnOk()');
}

function addEventsBtnDelete() {
    console.log('addEventsBtnDelete()');
}

function updateEvent() {
    localStorage.setItem('arrayEvents', JSON.stringify(storage.tableEvents));
}

function monthMinus() {
    let prevMaxRows = storage.longPeriod ? 6 : 5;

    storage.curentMonth = moment(storage.curentMonth).add(-1, 'month');

    calculateDates();
    correctLayoutTable(prevMaxRows);
    outputPeriod();
    sortTableEvents();
    fillTable();
}

function monthPlus() {
    let prevMaxRows = storage.longPeriod ? 6 : 5;

    storage.curentMonth = moment(storage.curentMonth).add(+1, 'month');

    calculateDates();
    correctLayoutTable(prevMaxRows);
    outputPeriod();
    sortTableEvents();
    fillTable();
}

function setToday() {
    let prevMaxRows = storage.longPeriod ? 6 : 5;

    storage.curentMonth = moment().date(1).hours(0).minutes(0).seconds(0);

    calculateDates();
    correctLayoutTable(prevMaxRows);
    outputPeriod();
    sortTableEvents();
    fillTable();
}

function fieldFindEvents(e) {
    let searchingText = document.querySelector('.block-header__find_field').value;
    let btnClear = document.querySelector('.block-header__find_btn-clear');

    if (e.keyCode === 27) {
        document.querySelector('.block-header__find_field').value = '';
        btnClear.style.color = '#fff';
        hideFindEvents();
    }
    else if (searchingText.length < 3) {
        btnClear.style.color = '#fff';
        hideFindEvents();
    }
    else {
        btnClear.style.color = '#000';

        findEvents();
    }
}

function fieldFindBtnClear() {
    document.querySelector('.block-header__find_field').value = '';

    hideFindEvents();

    let btnClear = document.querySelector('.block-header__find_btn-clear');
    btnClear.style.color = '#fff';
    btnClear.blur();
}

function editEvent(e) {
    console.log(e.path[0]);
    console.log(e.path[1]);
    console.log('editEvent()');
}

//**********************************************************************
// Ouput data

function outputPeriod() {
    let selectedPeriod = document.querySelector('.section-dates__select-period_month-text');
    selectedPeriod.textContent = getSelectedPeriod();
}

function getSelectedPeriod() {
    // moment.locale('ru');
    return moment(storage.curentMonth).format('MMMM YYYY');
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

function generateTableRow() {
    let tableRow = document.createElement('div');

    for (let y = 0; y < 7; y++) {
        let sectionDatesTableCol = generateTableRowCol();
        sectionDatesTableCol.classList.add('section-dates__table_col');

        tableRow.appendChild(sectionDatesTableCol);
    }

    return tableRow;
}

function generateTableRowCol() {
    let tableRowCol = document.createElement('div');
    let span = document.createElement('span');
    let div1 = document.createElement('div');
    let div2 = document.createElement('div');

    div1.classList.add('section-dates__table_col-event');
    div2.classList.add('section-dates__table_col-participant');

    tableRowCol.appendChild(span);
    tableRowCol.appendChild(div1);
    tableRowCol.appendChild(div2);

    storage.outputDate.add(1, 'days');
    
    return tableRowCol;
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

function fillTable() {
    storage.outputDate = moment(storage.startDate);

    let countDate = 0;
    let firstEventIndex = findFirstEventIndex(storage.outputDate);

    let curTable = document.querySelector('.section-dates__table');

    for (let r = 0; r < curTable.children.length; r++) {
        let childrenRow = curTable.children[r];

        for (let c = 0; c < childrenRow.children.length; c++) {
            let curTableCol = childrenRow.children[c];

            curTableCol.classList.remove('today');
            curTableCol.classList.remove('event');

            if (equalToday(storage.outputDate.format(storage.curentFormat))) {
                curTableCol.classList.add('today');
            }
        
            let curTableColSpan = curTableCol.querySelector('span');

            curTableColSpan.textContent = countDate < 7 ? storage.outputDate.format('dddd') + ', ' : '';
            curTableColSpan.textContent += storage.outputDate.date();
        
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

function addParticipants(curTableColParticipants, firstEventIndex) {
    let quantParticipants = storage.tableEvents[firstEventIndex].participants.length;

    let listParticipants = '';

    for (let i = 0; i < quantParticipants; i++) {
        listParticipants += storage.tableEvents[firstEventIndex].participants[i].name;

        if (storage.tableEvents[firstEventIndex].participants[i].surname !== undefined) {
            listParticipants += (' ' + storage.tableEvents[firstEventIndex].participants[i].surname);
        }

        if (i === (quantParticipants - 1)) {
            listParticipants += '.';
        }
        else {
            listParticipants += ', ';
        }
    }

    curTableColParticipants.textContent = listParticipants;
}

function hideFindEvents() {
    let findEvents = document.querySelector('.find-events');
    findEvents.style.display = 'none';
}

function findEvents() {
    let fieldFindEvents = document.querySelector('.block-header__find_find');

    let findEvents = searchEvents();

    findEvents.style.top = (fieldFindEvents.offsetTop + fieldFindEvents.offsetHeight + 9) + 'px';
    findEvents.style.left = fieldFindEvents.offsetLeft + 'px';
    findEvents.style.display = 'block';
}

function searchEvents() {
    let findEvents = document.querySelector('.find-events');
    let findEventsList = getListEvents();
    let searchValue = document.querySelector('.block-header__find_field').value.toLowerCase();

    let resultSearch = storage.tableEvents.filter((item) => {
        return item.title.toLowerCase().search(searchValue) !== -1;
    });

    for (let i = 0; i < resultSearch.length; i++) {
        let findEventsRow = document.createElement('div');
        findEventsRow.classList.add('find-events__list_row');

        let rowTitle = document.createElement('div');
        rowTitle.textContent = resultSearch[i].title;
        rowTitle.classList.add('find-events__list_row-title');

        let rowInfo = document.createElement('div');
        rowInfo.textContent = moment(resultSearch[i].date).format('Do MMMM');
        rowInfo.classList.add('find-events__list_row-Info');

        findEventsRow.appendChild(rowTitle);
        findEventsRow.appendChild(rowInfo);

        findEventsList.appendChild(findEventsRow);
    }

    findEvents.appendChild(findEventsList);

    return findEvents;
}

function getListEvents() {
    let findEventsList = document.querySelector('.find-events__list');

    while (findEventsList.hasChildNodes()) {
        findEventsList.removeChild(findEventsList.lastChild);
    }

    return findEventsList;
}

//**********************************************************************
// Other

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
    else {
        storage.longPeriod = true;
    }
}

function closeAddEvents() {
    let addEvent = document.querySelector('.add-events');

    document.querySelector('.add-events__body_title-field').value = '';
    document.querySelector('.add-events__body_date-field').value = '';
    document.querySelector('.add-events__body_participant-field').value = '';
    document.querySelector('.add-events__body_description-field').value = '';

    addEvent.style.display = 'none';
}

function createEvent() {
    let newEvent = {
        'id': 0,
        'title': document.querySelector('.add-events__body_title-field').value,
        'date': document.querySelector('.add-events__body_date-field').value,
        'participants': [],
        'description': document.querySelector('.add-events__body_description-field').value,
    }

    let arrPartisipants = document.querySelector('.add-events__body_participant-field').value.split(',');

    for (let i = 0; i < arrPartisipants.length; i++) {
        let arrName = arrPartisipants[i].trim().split(' ');
    
        try {
            newEvent.participants.push({
                'id': 0,
                'name': arrName[0],
                'surname': arrName[1]
            });
        
        }
        catch {}
    }

    let indexEvent = findDateEvent(newEvent);

    if (indexEvent === -1) {
        indexEvent = storage.tableEvents.length;
    }

    storage.tableEvents[indexEvent] = newEvent;

    localStorage.setItem('arrayEvents', JSON.stringify(storage.tableEvents));

    updateTableCol(indexEvent);
}

function equalDates(indexEvent) {
    return moment(storage.tableEvents[indexEvent].date).hours(0).minutes(0).seconds(0).format(storage.curentFormat)
           === moment(storage.outputDate).hours(0).minutes(0).seconds(0).format(storage.curentFormat);
}

function equalToday(curDate) {
    return moment().hours(0).minutes(0).seconds(0).format(storage.curentFormat)
           === curDate;
}

function findDateEvent(event) {
    let result = -1;

    for (let i = 0; i < storage.tableEvents.length; i++) {
        if (moment(storage.tableEvents[i].date).hours(0).minutes(0).seconds(0).format(storage.curentFormat)
            === moment(event.date).hours(0).minutes(0).seconds(0).format(storage.curentFormat)) {
            result = i;
            break;
        }
    }
    return result;
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

function readData() {
    storage.tableEvents = JSON.parse(localStorage.getItem('arrayEvents'));

    if (storage.tableEvents === null) {
        let xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    storage.tableEvents = JSON.parse(xhr.responseText).events;

                    sortTableEvents();

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

function sortTableEvents() {
    storage.tableEvents.sort((first, second) => (moment(first.date) - moment(second.date)));
}

function verifeEvent() {
    if (!document.querySelector('.add-events__body_title-field').value) {
        alert('Empty title!');

        return false;
    }

    let dateTime = document.querySelector('.add-events__body_date-field');

    if (!dateTime.value) {
        if (dateTime.validationMessage) {
            alert(dateTime.validationMessage);
        }
        else {
            alert('Empty date!');
        }

        return false;
    }

    return true;
}

function updateTableCol(indexEvent) {
    storage.outputDate = moment(storage.startDate);

    let curTable = document.querySelector('.section-dates__table');

    for (let r = 0; r < curTable.children.length; r++) {
        let childrenRow = curTable.children[r];

        for (let c = 0; c < childrenRow.children.length; c++) {
            let curTableCol = childrenRow.children[c];
        
            if (equalDates(indexEvent)) {
                addNewEvent(curTableCol, indexEvent);
            }
        
            storage.outputDate.add(1, 'days');
        }
    }
}

function addNewEvent(curTableCol, indexEvent) {
    curTableCol.classList.add('event');

    let curTableColEvent = curTableCol.querySelector('.section-dates__table_col-event');
    curTableColEvent.textContent = '';
    let curTableColParticipants = curTableCol.querySelector('.section-dates__table_col-participant');
    curTableColParticipants.textContent = '';

    curTableColEvent.textContent = storage.tableEvents[indexEvent].title;

    addParticipants(curTableColParticipants, indexEvent);
}
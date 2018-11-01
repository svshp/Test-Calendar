'use strict'

//**********************************************************************
// var

let storage = {
    currentFormat: 'YYYY-MM-DD',
    currentMonth: null,
    longPeriod: false,
    tableEvents: null,
    startDate: null,
    endDate: null,
    outputDate: null,
    needSorting: false,
    currentEvent: null
}

//**********************************************************************

window.onload = function () {
    storage.currentMonth = moment().date(1).hours(0).minutes(0).seconds(0);

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

    // Set arrow
    removeAllArrows(addEvent);
    addEvent.classList.add('top');

    document.querySelector('.add-events__body_btn-create').style.display = 'block';
    document.querySelector('.add-events__body_btn-ok').style.display = 'none';
    document.querySelector('.add-events__body_btn-delete').style.display = 'none';

    addEvent.style.top = (btnAddEvent.offsetTop + btnAddEvent.offsetHeight + 10) + 'px';
    addEvent.style.left = btnAddEvent.offsetLeft + 'px';
    addEvent.style.height = '300px';
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
    let currentIndexEvent = +storage.currentEvent.getAttribute('data-array');
    let confirmText = 'Удалить событие "' + storage.tableEvents[currentIndexEvent].title + '" ' + storage.tableEvents[currentIndexEvent].date + '!';
    let answer = confirm(confirmText);

    if (answer === true) {
        // Clear event
        storage.currentEvent.classList.remove('event');
        storage.currentEvent.querySelector('.section-dates__table_col-event').textContent = '';
        storage.currentEvent.querySelector('.section-dates__table_col-participant').textContent = '';

        deleteEvent();
        closeAddEvents();
    }
}

function updateEvent() {
    localStorage.setItem('arrayEvents', JSON.stringify(storage.tableEvents));
}

function monthMinus() {
    let prevMaxRows = storage.longPeriod ? 6 : 5;

    storage.currentMonth = moment(storage.currentMonth).add(-1, 'month');

    calculateDates();
    correctLayoutTable(prevMaxRows);
    outputPeriod();
    sortTableEvents();
    fillTable();
}

function monthPlus() {
    let prevMaxRows = storage.longPeriod ? 6 : 5;

    storage.currentMonth = moment(storage.currentMonth).add(+1, 'month');

    calculateDates();
    correctLayoutTable(prevMaxRows);
    outputPeriod();
    sortTableEvents();
    fillTable();
}

function setToday() {
    let prevMaxRows = storage.longPeriod ? 6 : 5;

    storage.currentMonth = moment().date(1).hours(0).minutes(0).seconds(0);

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
    let findEvent = null;

    for (let i = 0; i < e.path.length; i++) {
        if (e.path[i].classList.contains('section-dates__table_col')) {
            findEvent = e.path[i];
            break;
        }
    }

    if (findEvent.classList.contains('event')) {
        let indexArrayEvents = +findEvent.getAttribute('data-array');

        let editEvent = document.querySelector('.add-events');

        document.querySelector('.add-events__body_btn-create').style.display = 'none';
        document.querySelector('.add-events__body_btn-ok').style.display = 'inline-block';
        document.querySelector('.add-events__body_btn-delete').style.display = 'inline-block';

        let windowInnerHeight = window.innerHeight;
        let windowInnerWidth = window.innerWidth;

        // Current position
        let findEventOffsetTop = findEvent.offsetTop;
        let findEventOffsetLeft = findEvent.offsetLeft;
        let findEventOffsetHeight = findEvent.offsetHeight;
        let findEventOffsetWidth = findEvent.offsetWidth;
        
        let editEventHeight = 300;
        let editEventWidth = 350;

        // Calculate coordinates
        let editEventTop = 0;
        let editEventLeft = 0;

        removeAllArrows(editEvent);

        editEventTop = findEventOffsetTop;

        if ((findEventOffsetTop + editEventHeight) <= windowInnerHeight) {
            /* editEventTop = findEventOffsetTop; */
        }
        else {
            /* editEventTop = findEventOffsetTop + findEventOffsetHeight - editEventHeight; */
        }

        if ((findEventOffsetLeft + findEventOffsetWidth + editEventWidth) <= windowInnerWidth) {
            editEventLeft = findEventOffsetLeft + findEventOffsetWidth + 10;
            editEvent.classList.add('left');
        }
        else {
            editEventLeft = findEventOffsetLeft - editEventWidth - 10;
            editEvent.classList.add('right');
        }

        editEvent.style.top = editEventTop + 'px';
        editEvent.style.left = editEventLeft + 'px';
        editEvent.style.height = editEventHeight + 'px';
        editEvent.style.width = editEventWidth + 'px';
        editEvent.style.display = 'block';

        editEvent.querySelector('.add-events__body_title-field').value = storage.tableEvents[indexArrayEvents].title;
        editEvent.querySelector('.add-events__body_date-field').value = moment(storage.tableEvents[indexArrayEvents].date).format('YYYY-MM-DDThh:mm');
        editEvent.querySelector('.add-events__body_participant-field').value = readListParticipants(indexArrayEvents);
    
        if (storage.tableEvents[indexArrayEvents].description) {
            editEvent.querySelector('.add-events__body_description-field').value = storage.tableEvents[indexArrayEvents].description;
        }

        storage.currentEvent = findEvent;
    }
}

//**********************************************************************
// Ouput data

function outputPeriod() {
    let selectedPeriod = document.querySelector('.section-dates__select-period_month-text');
    selectedPeriod.textContent = getSelectedPeriod();
}

function getSelectedPeriod() {
    // moment.locale('ru');
    return moment(storage.currentMonth).format('MMMM YYYY');
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
            curTableCol.removeAttribute('data-array');

            if (equalToday(storage.outputDate.format(storage.currentFormat))) {
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
                    curTableCol.setAttribute('data-array', firstEventIndex);
        
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
    let listParticipants = readListParticipants(firstEventIndex) + '.';

    curTableColParticipants.textContent = listParticipants;
}

function readListParticipants(firstEventIndex) {
    let quantParticipants = storage.tableEvents[firstEventIndex].participants.length;

    let listParticipants = '';

    for (let i = 0; i < quantParticipants; i++) {
        listParticipants += storage.tableEvents[firstEventIndex].participants[i].name;

        if (storage.tableEvents[firstEventIndex].participants[i].surname !== undefined) {
            listParticipants += (' ' + storage.tableEvents[firstEventIndex].participants[i].surname);
        }

        if (i === (quantParticipants - 1)) {
        }
        else {
            listParticipants += ', ';
        }
    }

    return listParticipants;
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
    let shiftDate = -(storage.currentMonth.day() - 1);

    if (storage.currentMonth.day() === 0) {
        shiftDate = -6;
    }

    storage.startDate = moment(storage.currentMonth).add(shiftDate, 'days');
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

    storage.needSorting = true;
}

function deleteEvent() {
    let indexArrayEvents = +storage.currentEvent.getAttribute('data-array');

    storage.tableEvents.splice(indexArrayEvents, 1);

    localStorage.setItem('arrayEvents', JSON.stringify(storage.tableEvents));
}

function equalDates(indexEvent) {
    return moment(storage.tableEvents[indexEvent].date).hours(0).minutes(0).seconds(0).format(storage.currentFormat)
           === moment(storage.outputDate).hours(0).minutes(0).seconds(0).format(storage.currentFormat);
}

function equalToday(curDate) {
    return moment().hours(0).minutes(0).seconds(0).format(storage.currentFormat)
           === curDate;
}

function findDateEvent(event) {
    let result = -1;

    for (let i = 0; i < storage.tableEvents.length; i++) {
        if (moment(storage.tableEvents[i].date).hours(0).minutes(0).seconds(0).format(storage.currentFormat)
            === moment(event.date).hours(0).minutes(0).seconds(0).format(storage.currentFormat)) {
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

                    sortTableEvents(true);

                    fillTable();
                }
            }
        }

        xhr.open('GET', './events.json', true);
        xhr.send();
        }
    else {
        sortTableEvents(true);

        fillTable();
    }
}

function removeAllArrows(editEvent) {
    editEvent.classList.remove('top');
    editEvent.classList.remove('left');
    editEvent.classList.remove('bottom');
    editEvent.classList.remove('right');
}

function sortTableEvents(necessarily = false) {
    if (storage.needSorting || necessarily) {
        storage.tableEvents.sort((first, second) => (moment(first.date) - moment(second.date)));

        storage.needSorting = false;
    }
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
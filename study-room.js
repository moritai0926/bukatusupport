document.addEventListener('DOMContentLoaded', () => {
    const timetableContainer = document.getElementById('timetable-container');
    const weekRangeElement = document.getElementById('week-range');
    const prevWeekBtn = document.getElementById('prev-week-btn');
    const nextWeekBtn = document.getElementById('next-week-btn');

    if (!timetableContainer) return;

    let currentDate = new Date();
    let reservations = {};

    const loadReservations = () => {
        const saved = localStorage.getItem('studyRoomReservations');
        reservations = saved ? JSON.parse(saved) : {};
    };

    const saveReservations = () => {
        localStorage.setItem('studyRoomReservations', JSON.stringify(reservations));
    };

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const renderTimetable = () => {
        timetableContainer.innerHTML = '';
        const today = new Date();
        const todayStr = formatDate(today);

        // Set week range text
        const weekStart = new Date(currentDate);
        const weekEnd = new Date(currentDate);
        weekEnd.setDate(weekEnd.getDate() + 13);
        weekRangeElement.textContent = `${formatDate(weekStart)} ~ ${formatDate(weekEnd)}`;

        // --- Render Headers ---
        // Top-left empty cell
        const cornerCell = document.createElement('div');
        cornerCell.classList.add('grid-cell', 'header-cell');
        timetableContainer.appendChild(cornerCell);

        // Date headers
        for (let i = 0; i < 14; i++) {
            const date = new Date(currentDate);
            date.setDate(date.getDate() + i);
            const dateHeader = document.createElement('div');
            dateHeader.classList.add('grid-cell', 'header-cell');
            if (formatDate(date) === todayStr) {
                dateHeader.classList.add('today');
            }
            const day = date.getDate();
            const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
            dateHeader.innerHTML = `${day}<span class="day-of-week">${dayOfWeek}</span>`;
            timetableContainer.appendChild(dateHeader);
        }

        // --- Render Time Slots ---
        for (let hour = 7; hour <= 23; hour++) {
            // Time cell
            const timeCell = document.createElement('div');
            timeCell.classList.add('grid-cell', 'time-cell');
            timeCell.textContent = `${String(hour).padStart(2, '0')}:00`;
            timetableContainer.appendChild(timeCell);

            // Slot cells for each day
            for (let day = 0; day < 14; day++) {
                const date = new Date(currentDate);
                date.setDate(date.getDate() + day);
                const dateStr = formatDate(date);
                const slotId = `${dateStr}-${String(hour).padStart(2, '0')}`;

                const slotCell = document.createElement('div');
                slotCell.classList.add('grid-cell', 'slot-cell');
                slotCell.dataset.slotId = slotId;

                if (reservations[slotId]) {
                    slotCell.classList.add('reserved');
                }
                timetableContainer.appendChild(slotCell);
            }
        }
    };

    const toggleReservation = (e) => {
        if (!e.target.classList.contains('slot-cell')) return;

        const slotId = e.target.dataset.slotId;
        if (reservations[slotId]) {
            delete reservations[slotId];
            e.target.classList.remove('reserved');
        } else {
            reservations[slotId] = true;
            e.target.classList.add('reserved');
        }
        saveReservations();
    };

    // --- Event Listeners ---
    timetableContainer.addEventListener('click', toggleReservation);

    prevWeekBtn.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() - 7); // Move back by 7 days
        renderTimetable();
    });

    nextWeekBtn.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() + 7); // Move forward by 7 days
        renderTimetable();
    });

    // --- Initial Load ---
    loadReservations();
    renderTimetable();
});

document.addEventListener('DOMContentLoaded', function() {
    const timetableHeader = document.querySelector('.timetable-header');
    const timetableBody = document.querySelector('.timetable-body');
    const modal = document.getElementById('event-modal');
    const closeButton = document.querySelector('.close-button');
    const saveEventButton = document.getElementById('save-event');
    const eventTitleInput = document.getElementById('event-title');

    const days = ['月', '火', '水', '木', '金', '土', '日'];
    const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8:00 to 22:00

    let selectedSlot = null;
    let events = JSON.parse(localStorage.getItem('events')) || {};

    // タイムテーブルを生成
    function createTimetable() {
        // ヘッダー（曜日）
        timetableHeader.appendChild(createCornerCell());
        days.forEach(day => timetableHeader.appendChild(createDayHeader(day)));

        // 本体（時間とスロット）
        hours.forEach(hour => {
            timetableBody.appendChild(createTimeLabel(hour));
            days.forEach((day, dayIndex) => {
                const slotId = `slot-${dayIndex}-${hour}`;
                const slot = createTimeSlot(slotId);
                timetableBody.appendChild(slot);
            });
        });
        renderEvents();
    }

    function createCornerCell() {
        const corner = document.createElement('div');
        corner.className = 'corner-cell';
        return corner;
    }

    function createDayHeader(day) {
        const header = document.createElement('div');
        header.className = 'day-header';
        header.textContent = day;
        return header;
    }

    function createTimeLabel(hour) {
        const label = document.createElement('div');
        label.className = 'time-label';
        label.textContent = `${hour}:00`;
        return label;
    }

    function createTimeSlot(id) {
        const slot = document.createElement('div');
        slot.className = 'time-slot';
        slot.dataset.id = id;
        slot.addEventListener('click', () => openModal(id));
        return slot;
    }

    // モーダルを開く
    function openModal(slotId) {
        selectedSlot = slotId;
        // 既存のイベントがあればタイトルをインプットに表示
        if (events[slotId]) {
            eventTitleInput.value = events[slotId].title;
        } else {
            eventTitleInput.value = '';
        }
        modal.style.display = 'block';
        eventTitleInput.focus();
    }

    // モーダルを閉じる
    function closeModal() {
        modal.style.display = 'none';
        selectedSlot = null;
    }

    // イベントを保存
    function saveEvent() {
        const title = eventTitleInput.value.trim();
        if (title) {
            events[selectedSlot] = { title };
        } else {
            // タイトルが空の場合はイベントを削除
            delete events[selectedSlot];
        }
        localStorage.setItem('events', JSON.stringify(events));
        renderEvents();
        closeModal();
    }

    // イベントを描画
    function renderEvents() {
        // 既存のイベント表示をクリア
        document.querySelectorAll('.event').forEach(el => el.remove());

        for (const slotId in events) {
            const slot = document.querySelector(`[data-id='${slotId}']`);
            if (slot) {
                const eventEl = document.createElement('div');
                eventEl.className = 'event';
                eventEl.textContent = events[slotId].title;
                slot.appendChild(eventEl);
            }
        }
    }

    // イベントリスナー
    closeButton.addEventListener('click', closeModal);
    saveEventButton.addEventListener('click', saveEvent);
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            closeModal();
        }
    });
    // Enterキーで保存
    eventTitleInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            saveEvent();
        }
    });

    // 初期化
    createTimetable();
});

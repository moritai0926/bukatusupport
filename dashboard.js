document.addEventListener('DOMContentLoaded', () => {
    const welcomeMessage = document.getElementById('welcome-message');
    if (welcomeMessage) {
        // --- DOM Elements ---
        const quoteTextElem = document.querySelector('.quote-text');
        const quoteAuthorElem = document.querySelector('.quote-author');
        const reloadQuoteBtn = document.querySelector('.btn-reload-quote');
        const achievementChartCanvas = document.getElementById('achievementChart');
        const chartContainer = document.getElementById('chart-container');
        const noTodoMessage = document.getElementById('no-todo-message');
        
        // ToDo List Elements
        const todoList = document.getElementById('todo-list');
        const addTodoBtn = document.getElementById('add-todo-btn');

        // Modal Elements
        const modal = document.getElementById('todo-modal');
        const modalHeading = document.getElementById('modal-heading');
        const modalTitle = document.getElementById('modal-title');
        const modalTags = document.getElementById('modal-tags');
        const modalMemo = document.getElementById('modal-memo');
        const modalSaveBtn = document.getElementById('modal-save-btn');
        const modalDeleteBtn = document.getElementById('modal-delete-btn');
        const modalCloseBtn = document.getElementById('modal-close-btn');

        // --- State Variables ---
        let todoData = [];
        let currentlyEditingTodoId = null;
        let achievementChart = null;

        // --- Data Persistence ---
        const loadTodoData = () => {
            const savedData = localStorage.getItem('todoData');
            todoData = savedData ? JSON.parse(savedData) : [];
        };
        const saveTodoData = () => {
            localStorage.setItem('todoData', JSON.stringify(todoData));
        };

        // --- Quote of the Day ---
        const setupQuotes = () => {
            if (!quoteTextElem || !quoteAuthorElem) return;
            const quotes = [
                { text: "私たちの最大の弱点は諦めることにある。成功する最も確実な方法は、常にもう一回だけ試すことだ。", author: "トーマス・エジソン" },
                { text: "成功の反対は失敗ではなく、何もしないことだ。", author: "不明" },
                { text: "夢見ることができれば、それは実現できる。", author: "ウォルト・ディズニー" },
                { text: "困難の中に機会がある。", author: "アルベルト・アインシュタイン" },
                { text: "今日という日は、残りの人生の最初の一日。", author: "チャールズ・ディードリッヒ" },
                { text: "未来を予測する最善の方法は、それを創造することだ。", author: "ピーター・ドラッカー" },
                { text: "唯一の真の知恵は、自分が何も知らないということを知ることにある。", author: "ソクラテス" },
                { text: "人生とは、あなたが他の計画を立てるのに忙しい間に起こるものだ。", author: "ジョン・レノン" },
                { text: "成功は幸福の鍵ではない。幸福が成功の鍵だ。自分のしていることが好きならば、あなたは成功するだろう。", author: "アルバート・シュバイツァー" },
                { text: "行動は必ずしも幸福をもたらさないかもしれないが、行動なくして幸福はない。", author: "ベンジャミン・ディズレーリ" },
                { text: "完璧を目指すより、まず終わらせろ。", author: "マーク・ザッカーバーグ" },
                { text: "もしあなたが何かを十分に強く望むなら、あなたはそれを手に入れるだろう。", author: "エイブラハム・リンカーン" },
                { text: "最も偉大な栄光は、一度も失敗しないことではなく、失敗するたびに立ち上がることにある。", author: "ネルソン・マンデラ" },
                { text: "夢なき者に理想なし、理想なき者に計画なし、計画なき者に実行なし、実行なき者に成功なし。故に、夢なき者に成功なし。", author: "吉田松陰" },
            ];
            const setRandomQuote = () => {
                const randomIndex = Math.floor(Math.random() * quotes.length);
                quoteTextElem.textContent = `"${quotes[randomIndex].text}"`;
                quoteAuthorElem.textContent = `- ${quotes[randomIndex].author}`;
            };
            setRandomQuote();
            if (reloadQuoteBtn) reloadQuoteBtn.addEventListener('click', setRandomQuote);
        };

        // --- Advisor Comments ---
        const getGreetingByTime = () => {
            const hour = new Date().getHours();
            if (hour < 5) return "夜更かし、お疲れ様。";
            if (hour < 10) return "おはよう！";
            if (hour < 18) return "こんにちは！";
            return "こんばんは！";
        };

        const updateAdvisorGreeting = () => {
            const greetingElement = document.getElementById('advisor-greeting');
            if (greetingElement) {
                greetingElement.textContent = getGreetingByTime();
            }
        };

        // --- Achievement Chart ---
        const updateAchievementChart = () => {
            const advisorComment = document.getElementById('advisor-comment');
            const completedTasks = todoData.filter(item => item.completed);

            const chartContainer = document.getElementById('chart-container');
            const noTodoMessage = document.getElementById('no-todo-message');

            if (todoData.length === 0) {
                if(chartContainer) chartContainer.style.display = 'none';
                if(noTodoMessage) noTodoMessage.style.display = 'block';
                if(advisorComment) advisorComment.textContent = '今日のToDoを作成して、学習を始めよう！';
                const achievementChartCard = document.querySelector('.achievement-chart .chart-and-text');
                if(achievementChartCard) achievementChartCard.style.display = 'none';
                return;
            }

            const achievementChartCard = document.querySelector('.achievement-chart .chart-and-text');
            if(achievementChartCard) achievementChartCard.style.display = 'flex';
            if(chartContainer) chartContainer.style.display = 'block';
            if(noTodoMessage) noTodoMessage.style.display = 'none';

            const achievementRate = Math.round((completedTasks.length / todoData.length) * 100);
            
            if (advisorComment) {
                if (achievementRate === 100) advisorComment.textContent = '素晴らしい、完璧だ！目標達成おめでとう！🎉';
                else if (achievementRate >= 70) advisorComment.textContent = 'すごい！目標達成まであと少し！';
                else if (achievementRate >= 30) advisorComment.textContent = '良い調子だね！このペースで頑張ろう。！';
                else if (achievementRate > 0) advisorComment.textContent = 'まだ始まったばかりだね。一歩ずつ着実に進もう。！';
                else advisorComment.textContent = 'さあ、最初のタスクを完了させよう！';
            }

            const data = {
                datasets: [{
                    data: [achievementRate, 100 - achievementRate],
                    backgroundColor: [ '#9F7AEA', getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() ],
                    borderWidth: 0,
                    hoverBackgroundColor: ['#B794F4', '#6A7588']
                }]
            };

            if (achievementChart) {
                achievementChart.data.datasets[0].data = data.datasets[0].data;
                achievementChart.options.plugins.centerText.text = achievementRate + '%';
                achievementChart.update();
            } else if (achievementChartCanvas) {
                const ctx = achievementChartCanvas.getContext('2d');
                achievementChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: data,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '75%',
                        plugins: {
                            legend: { display: false },
                            tooltip: { enabled: false },
                            centerText: { text: achievementRate + '%' }
                        }
                    },
                    plugins: [{
                        id: 'doughnutCenterText',
                        afterDraw: function(chart) {
                            if (chart.options.plugins.centerText) {
                                const { ctx, width, height } = chart;
                                ctx.restore();
                                const fontSize = (height / 114).toFixed(2);
                                ctx.font = `bold ${fontSize}em Noto Sans JP`;
                                ctx.textBaseline = 'middle';
                                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-headings').trim();
                                const text = chart.options.plugins.centerText.text;
                                const textX = Math.round((width - ctx.measureText(text).width) / 2);
                                const textY = height / 2;
                                ctx.fillText(text, textX, textY);
                                ctx.save();
                            }
                        }
                    }]
                });
            }
        };
    
        // --- Todo List Rendering ---
        const renderTodoList = () => {
            if (!todoList) return;
            todoList.innerHTML = '';

            if (todoData.length === 0) {
                const li = document.createElement('li');
                li.classList.add('no-todo-item');
                li.textContent = 'ToDoを追加して学習を始めましょう！';
                todoList.appendChild(li);
                return;
            }

            todoData.forEach(item => {
                const li = document.createElement('li');
                li.classList.add('todo-item');
                li.dataset.id = item.id;
                if (item.completed) {
                    li.classList.add('completed');
                }

                const checkboxWrapper = document.createElement('div');
                checkboxWrapper.classList.add('checkbox-wrapper');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = item.completed;
                checkbox.dataset.id = item.id;
                checkboxWrapper.appendChild(checkbox);

                const detailsDiv = document.createElement('div');
                detailsDiv.classList.add('details');
                const titleSpan = document.createElement('span');
                titleSpan.classList.add('title');
                titleSpan.textContent = item.title;
                detailsDiv.appendChild(titleSpan);

                if (item.memo) {
                    const memoSpan = document.createElement('span');
                    memoSpan.classList.add('memo');
                    memoSpan.textContent = item.memo;
                    detailsDiv.appendChild(memoSpan);
                }

                const editBtn = document.createElement('button');
                editBtn.classList.add('edit-btn', 'btn-icon');
                editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>';
                editBtn.dataset.id = item.id;

                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add('delete-btn', 'btn-icon');
                deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
                deleteBtn.dataset.id = item.id;

                li.appendChild(checkboxWrapper);
                li.appendChild(detailsDiv);
                li.appendChild(editBtn);
                li.appendChild(deleteBtn);
                todoList.appendChild(li);
            });
        };

        // --- Modal Logic ---
        const openModal = (todoId = null) => {
            currentlyEditingTodoId = todoId;
            if (todoId) {
                const todo = todoData.find(item => item.id === todoId);
                if (todo) {
                    modalHeading.textContent = 'ToDoの編集';
                    modalTitle.value = todo.title;
                    modalMemo.value = todo.memo;
                    modalTags.querySelectorAll('.tag-option').forEach(btn => {
                        btn.classList.toggle('selected', btn.dataset.tag === todo.tag);
                    });
                    modalDeleteBtn.style.display = 'block';
                }
            } else {
                modalHeading.textContent = 'ToDoの追加';
                modalTitle.value = '';
                modalMemo.value = '';
                modalTags.querySelector('.selected')?.classList.remove('selected');
                modalDeleteBtn.style.display = 'none';
            }
            modal.style.display = 'flex';
        };

        const closeModal = () => {
            modal.style.display = 'none';
            currentlyEditingTodoId = null;
        };

        const saveTodo = () => {
            const title = modalTitle.value.trim();
            if (!title) {
                alert('タイトルを入力してください。');
                return;
            }
            const selectedTagEl = modalTags.querySelector('.selected');
            const tag = selectedTagEl ? selectedTagEl.dataset.tag : null;
            const memo = modalMemo.value.trim();

            if (currentlyEditingTodoId) {
                const todo = todoData.find(item => item.id === currentlyEditingTodoId);
                if (todo) {
                    todo.title = title;
                    todo.tag = tag;
                    todo.memo = memo;
                }
            } else {
                const newTodo = {
                    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    title,
                    tag,
                    memo,
                    completed: false
                };
                todoData.push(newTodo);
            }
            saveTodoData();
            renderTodoList();
            updateAchievementChart();
            closeModal();
        };

        const deleteTodo = () => {
            if (!currentlyEditingTodoId) return;
            if (confirm('このToDoを削除しますか？')) {
                todoData = todoData.filter(item => item.id !== currentlyEditingTodoId);
                saveTodoData();
                renderTodoList();
                updateAchievementChart();
                closeModal();
            }
        };

        // --- Event Listeners ---
        addTodoBtn.addEventListener('click', () => openModal());
        modalCloseBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
        modalSaveBtn.addEventListener('click', saveTodo);
        modalDeleteBtn.addEventListener('click', deleteTodo);

        modalTags.addEventListener('click', (e) => {
            const target = e.target.closest('.tag-option');
            if (!target) return;
            modalTags.querySelector('.selected')?.classList.remove('selected');
            target.classList.add('selected');
        });

        todoList.addEventListener('click', (e) => {
            const target = e.target;
            const todoId = target.closest('.todo-item')?.dataset.id;
            if (!todoId) return;

            if (target.closest('.checkbox-wrapper')) {
                const todo = todoData.find(item => item.id === todoId);
                if (todo) {
                    todo.completed = !todo.completed;
                    saveTodoData();
                    renderTodoList();
                    updateAchievementChart();
                }
            } else if (target.closest('.edit-btn')) {
                openModal(todoId);
            } else if (target.closest('.delete-btn')) {
                currentlyEditingTodoId = todoId;
                deleteTodo();
            }
        });

        // --- Initial Load ---
        loadTodoData();
        renderTodoList();
        setupQuotes();
        updateAdvisorGreeting();
        updateAchievementChart();
        setInterval(updateAdvisorGreeting, 60000);
    }

    // --- Calendar Logic for details.html ---
    const calendarContainer = document.getElementById('calendar-container');
    if (calendarContainer) {
        // --- DOM Elements ---
        const monthYearElement = document.getElementById('month-year');
        const calendarBody = document.getElementById('calendar-body');
        const prevMonthBtn = document.getElementById('prev-month-btn');
        const nextMonthBtn = document.getElementById('next-month-btn');
        const scheduleModeBtn = document.getElementById('schedule-mode-btn');
        const calendarControls = document.getElementById('calendar-controls');

        const eventModal = document.getElementById('calendar-event-modal');
        const modalDateElement = document.getElementById('modal-date');
        const modalCloseBtn = document.getElementById('modal-close-btn');
        const eventTitleInput = document.getElementById('event-title');
        const eventStartTimeInput = document.getElementById('event-start-time');
        const eventEndTimeInput = document.getElementById('event-end-time');
        const eventMemoInput = document.getElementById('event-memo');
        const eventSaveBtn = document.getElementById('event-save-btn');
        const eventDeleteBtn = document.getElementById('event-delete-btn');

        // --- State ---
        let currentDate = new Date();
        let calendarEvents = {}; // { 'YYYY-MM-DD': [{id: ..., title: ..., ...}] }
        let currentlyEditingDate = null;
        let currentlyEditingEventId = null;
        let isScheduleMode = false;
        let selectedDates = [];

        // --- Data Persistence ---
        const loadCalendarEvents = () => {
            const savedEvents = localStorage.getItem('calendarEvents');
            calendarEvents = savedEvents ? JSON.parse(savedEvents) : {};
        };
        const saveCalendarEvents = () => {
            localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents));
        };

        // --- Schedule Adjustment Mode ---
        const toggleScheduleMode = () => {
            isScheduleMode = !isScheduleMode;
            scheduleModeBtn.classList.toggle('active', isScheduleMode);
            selectedDates = []; // Reset selection when mode changes
            renderCalendar(); // Re-render to apply/remove styles
            renderBulkAddButton();
        };

        const selectDate = (date) => {
            const index = selectedDates.indexOf(date);
            if (index > -1) {
                selectedDates.splice(index, 1); // Deselect
            } else {
                selectedDates.push(date); // Select
            }
            renderCalendar();
            renderBulkAddButton();
        };

        const renderBulkAddButton = () => {
            let bulkAddBtn = document.getElementById('bulk-add-btn');
            if (isScheduleMode && selectedDates.length > 0) {
                if (!bulkAddBtn) {
                    bulkAddBtn = document.createElement('button');
                    bulkAddBtn.id = 'bulk-add-btn';
                    bulkAddBtn.textContent = `${selectedDates.length}日に一括登録`;
                    bulkAddBtn.classList.add('btn', 'btn-primary');
                    calendarControls.appendChild(bulkAddBtn);
                    bulkAddBtn.addEventListener('click', openBulkAddModal);
                } else {
                    bulkAddBtn.textContent = `${selectedDates.length}日に一括登録`;
                }
            } else {
                if (bulkAddBtn) {
                    bulkAddBtn.remove();
                }
            }
        };

        const openBulkAddModal = () => {
            // Use the same modal, but change its behavior
            currentlyEditingDate = null; // Clear single-date editing
            currentlyEditingEventId = null;

            modalDateElement.textContent = `${selectedDates.length}日に一括登録`;
            eventTitleInput.value = '';
            eventStartTimeInput.value = '09:00';
            eventEndTimeInput.value = '10:00';
            eventMemoInput.value = '';
            eventDeleteBtn.style.display = 'none';
            
            // Temporarily change save button to bulk save
            eventSaveBtn.removeEventListener('click', saveEvent);
            eventSaveBtn.addEventListener('click', saveBulkEvents);
            
            eventModal.style.display = 'flex';
        };

        const saveBulkEvents = () => {
            const title = eventTitleInput.value.trim();
            if (!title) {
                alert('タイトルを入力してください。');
                return;
            }

            selectedDates.forEach(date => {
                const newEvent = {
                    id: Date.now() + Math.random(), // Ensure unique ID for each event
                    title,
                    startTime: eventStartTimeInput.value,
                    endTime: eventEndTimeInput.value,
                    memo: eventMemoInput.value.trim(),
                };
                if (!calendarEvents[date]) {
                    calendarEvents[date] = [];
                }
                calendarEvents[date].push(newEvent);
                calendarEvents[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
            });

            saveCalendarEvents();
            toggleScheduleMode(); // Exit schedule mode after bulk add
            closeEventModal();
        };

        // --- Single Event Modal Logic ---
        const openEventModal = (date, eventId = null) => {
            currentlyEditingDate = date;
            currentlyEditingEventId = eventId;

            const [year, month, day] = date.split('-').map(Number);
            modalDateElement.textContent = `${year}年${month}月${day}日`;

            if (eventId) {
                const event = calendarEvents[date]?.find(e => e.id === eventId);
                if (event) {
                    eventTitleInput.value = event.title;
                    eventStartTimeInput.value = event.startTime;
                    eventEndTimeInput.value = event.endTime;
                    eventMemoInput.value = event.memo;
                    eventDeleteBtn.style.display = 'block';
                }
            } else {
                eventTitleInput.value = '';
                eventStartTimeInput.value = '09:00';
                eventEndTimeInput.value = '10:00';
                eventMemoInput.value = '';
                eventDeleteBtn.style.display = 'none';
            }
            eventSaveBtn.removeEventListener('click', saveBulkEvents);
            eventSaveBtn.addEventListener('click', saveEvent);
            eventModal.style.display = 'flex';
        };

        const closeEventModal = () => {
            eventModal.style.display = 'none';
            currentlyEditingDate = null;
            currentlyEditingEventId = null;
            // Restore original save button event listener
            eventSaveBtn.removeEventListener('click', saveBulkEvents);
            eventSaveBtn.addEventListener('click', saveEvent);
        };

        const saveEvent = () => {
            const title = eventTitleInput.value.trim();
            if (!title) {
                alert('タイトルを入力してください。');
                return;
            }

            const newEvent = {
                id: currentlyEditingEventId || Date.now(),
                title,
                startTime: eventStartTimeInput.value,
                endTime: eventEndTimeInput.value,
                memo: eventMemoInput.value.trim(),
            };

            if (!calendarEvents[currentlyEditingDate]) {
                calendarEvents[currentlyEditingDate] = [];
            }

            if (currentlyEditingEventId) {
                const eventIndex = calendarEvents[currentlyEditingDate].findIndex(e => e.id === currentlyEditingEventId);
                calendarEvents[currentlyEditingDate][eventIndex] = newEvent;
            } else {
                calendarEvents[currentlyEditingDate].push(newEvent);
            }
            
            calendarEvents[currentlyEditingDate].sort((a, b) => a.startTime.localeCompare(b.startTime));

            saveCalendarEvents();
            renderCalendar();
            closeEventModal();
        };

        const deleteEvent = () => {
            if (!currentlyEditingDate || !currentlyEditingEventId) return;

            if (confirm('この予定を削除しますか？')) {
                calendarEvents[currentlyEditingDate] = calendarEvents[currentlyEditingDate].filter(e => e.id !== currentlyEditingEventId);
                if (calendarEvents[currentlyEditingDate].length === 0) {
                    delete calendarEvents[currentlyEditingDate];
                }
                saveCalendarEvents();
                renderCalendar();
                closeEventModal();
            }
        };

        // --- Calendar Rendering ---
        const renderCalendar = () => {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();

            monthYearElement.textContent = `${year}年 ${month + 1}月`;
            calendarBody.innerHTML = '';

            const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
            weekdays.forEach(day => {
                const dayElement = document.createElement('div');
                dayElement.classList.add('calendar-day', 'weekday');
                dayElement.textContent = day;
                calendarBody.appendChild(dayElement);
            });

            const firstDayOfMonth = new Date(year, month, 1).getDay();
            const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
            const lastDateOfPrevMonth = new Date(year, month, 0).getDate();

            for (let i = firstDayOfMonth; i > 0; i--) {
                const dayElement = document.createElement('div');
                dayElement.classList.add('calendar-day', 'other-month');
                dayElement.innerHTML = `<div class="day-number">${lastDateOfPrevMonth - i + 1}</div>`;
                calendarBody.appendChild(dayElement);
            }

            const today = new Date();
            for (let i = 1; i <= lastDateOfMonth; i++) {
                const dayElement = document.createElement('div');
                dayElement.classList.add('calendar-day');
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                dayElement.dataset.date = dateStr;

                if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
                    dayElement.classList.add('today');
                }
                if (selectedDates.includes(dateStr)) {
                    dayElement.classList.add('selected');
                }

                let innerHTML = `<div class="day-number">${i}</div>`;
                const eventsForDay = calendarEvents[dateStr];
                if (eventsForDay) {
                    innerHTML += '<div class="events-list">';
                    eventsForDay.forEach(event => {
                        innerHTML += `<div class="calendar-event" data-event-id="${event.id}">${event.startTime} ${event.title}</div>`;
                    });
                    innerHTML += '</div>';
                }
                dayElement.innerHTML = innerHTML;
                calendarBody.appendChild(dayElement);
            }

            const totalDays = firstDayOfMonth + lastDateOfMonth;
            const nextMonthDays = (7 - (totalDays % 7)) % 7;
            for (let i = 1; i <= nextMonthDays; i++) {
                const dayElement = document.createElement('div');
                dayElement.classList.add('calendar-day', 'other-month');
                dayElement.innerHTML = `<div class="day-number">${i}</div>`;
                calendarBody.appendChild(dayElement);
            }
        };
        // --- Event Listeners ---
        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });

        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });

        scheduleModeBtn.addEventListener('click', toggleScheduleMode);

        calendarBody.addEventListener('click', (e) => {
            const dayElement = e.target.closest('.calendar-day:not(.other-month)');
            if (!dayElement) return;
            const date = dayElement.dataset.date;

            if (isScheduleMode) {
                selectDate(date);
            } else {
                const eventElement = e.target.closest('.calendar-event');
                if (eventElement) {
                    const eventId = Number(eventElement.dataset.eventId);
                    openEventModal(date, eventId);
                } else {
                    openEventModal(date);
                }
            }
        });
        
        modalCloseBtn.addEventListener('click', closeEventModal);
        eventModal.addEventListener('click', (e) => { if (e.target === eventModal) closeEventModal(); });
        eventSaveBtn.addEventListener('click', saveEvent);
        eventDeleteBtn.addEventListener('click', deleteEvent);

        // --- Initial Load ---
        loadCalendarEvents();
        renderCalendar();
    }

    // --- Logout (existing) ---
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('loggedInUser');
            alert('ログアウトしました。');
            window.location.href = 'index.html';
        });
    }
});
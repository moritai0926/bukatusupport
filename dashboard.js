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
        const scheduleList = document.getElementById('schedule-list');
        const modal = document.getElementById('schedule-modal');
        const modalTime = document.getElementById('modal-time');
        const modalTitle = document.getElementById('modal-title');
        const modalEndTime = document.getElementById('modal-end-time');
        const modalTags = document.getElementById('modal-tags');
        const modalMemo = document.getElementById('modal-memo');
        const modalSaveBtn = document.getElementById('modal-save-btn');
        const modalDeleteBtn = document.getElementById('modal-delete-btn');
        const modalCloseBtn = document.getElementById('modal-close-btn');

        // --- State Variables ---
        let scheduleData = {};
        let currentlyEditingTime = null;
        let achievementChart = null;

        // --- Data Persistence ---
        const loadScheduleData = () => {
            const savedData = localStorage.getItem('scheduleData');
            scheduleData = savedData ? JSON.parse(savedData) : {};
        };
        const saveScheduleData = () => {
            localStorage.setItem('scheduleData', JSON.stringify(scheduleData));
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
                { text: "唯一の真の知恵は、自分が何も知らないということを知ることにある。", author: "ソクラテス" }
            ];
            const setRandomQuote = () => {
                const randomIndex = Math.floor(Math.random() * quotes.length);
                quoteTextElem.textContent = `"${quotes[randomIndex].text}"`;
                quoteAuthorElem.textContent = `- ${quotes[randomIndex].author}`;
            };
            setRandomQuote();
            if (reloadQuoteBtn) reloadQuoteBtn.addEventListener('click', setRandomQuote);
        };

        // --- Achievement Chart ---
        const updateAchievementChart = () => {
            const allTasks = Object.values(scheduleData);
            const todoTasks = allTasks.filter(item => item.tag === 'todo');
            const completedTodoTasks = todoTasks.filter(item => item.completed);

            if (todoTasks.length === 0) {
                chartContainer.style.display = 'none';
                noTodoMessage.style.display = 'block';
                return;
            }

            chartContainer.style.display = 'block';
            noTodoMessage.style.display = 'none';

            const achievementRate = Math.round((completedTodoTasks.length / todoTasks.length) * 100);
            const data = {
                datasets: [{
                    data: [achievementRate, 100 - achievementRate],
                    backgroundColor: [
                        getComputedStyle(document.documentElement).getPropertyValue('--tag-todo').trim(),
                        getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim()
                    ],
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
                        beforeDraw: function(chart) {
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

        // --- Schedule Rendering ---
        const renderSchedule = () => {
            scheduleList.innerHTML = '';
            for (let i = 7; i <= 23; i++) {
                const time = `${String(i).padStart(2, '0')}:00`;
                const item = scheduleData[time] || {};
                const li = document.createElement('li');
                li.dataset.time = time;

                if (item.tag) li.classList.add(`tag-${item.tag}`);
                if (item.completed) li.classList.add('completed');
                if (!item.title) li.classList.add('has-no-title');

                const timeSpan = document.createElement('span');
                timeSpan.className = 'time';
                timeSpan.textContent = time;
                li.appendChild(timeSpan);

                if (item.tag === 'todo') {
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.className = 'task-checkbox';
                    checkbox.checked = item.completed || false;
                    checkbox.dataset.time = time;
                    li.appendChild(checkbox);
                }

                const detailsDiv = document.createElement('div');
                detailsDiv.className = 'details';
                const titleSpan = document.createElement('span');
                titleSpan.className = 'title';
                if (item.title) {
                    titleSpan.textContent = item.title;
                } else {
                    titleSpan.textContent = '予定を追加';
                    titleSpan.classList.add('placeholder');
                }
                detailsDiv.appendChild(titleSpan);

                if (item.memo) {
                    const memoSpan = document.createElement('span');
                    memoSpan.className = 'memo';
                    memoSpan.textContent = item.memo;
                    detailsDiv.appendChild(memoSpan);
                }
                li.appendChild(detailsDiv);
                scheduleList.appendChild(li);
            }
        };

        // --- Modal Logic ---
        const openModal = (time) => {
            currentlyEditingTime = time;
            const item = scheduleData[time] || {};
            modalTime.textContent = `${time}の予定`;
            modalTitle.value = item.title || '';
            modalMemo.value = item.memo || '';

            modalEndTime.innerHTML = '';
            for (let i = parseInt(time.split(':')[0]); i <= 23; i++) {
                const optionTime = `${String(i).padStart(2, '0')}:00`;
                const option = document.createElement('option');
                option.value = optionTime;
                option.textContent = optionTime;
                modalEndTime.appendChild(option);
            }

            let endTime = time;
            if (item.title) {
                const startTimeInt = parseInt(time.split(':')[0]);
                for (let i = startTimeInt + 1; i <= 23; i++) {
                    const nextTime = `${String(i).padStart(2, '0')}:00`;
                    if (scheduleData[nextTime] && scheduleData[nextTime].title === item.title && scheduleData[nextTime].tag === item.tag) {
                        endTime = nextTime;
                    } else {
                        break;
                    }
                }
            }
            modalEndTime.value = endTime;

            modalTags.querySelectorAll('.tag-option').forEach(btn => {
                btn.classList.remove('selected');
                if (btn.dataset.tag === item.tag) {
                    btn.classList.add('selected');
                }
            });
            modal.style.display = 'flex';
        };

        const closeModal = () => {
            modal.style.display = 'none';
            currentlyEditingTime = null;
        };

        // --- Event Listeners ---
        scheduleList.addEventListener('click', (e) => {
            if (e.target.classList.contains('task-checkbox')) {
                const time = e.target.dataset.time;
                if (scheduleData[time]) {
                    scheduleData[time].completed = e.target.checked;
                    saveScheduleData();
                    renderSchedule();
                    updateAchievementChart();
                }
                return;
            }
            const li = e.target.closest('li:not(.has-no-title)');
            if (li) {
                openModal(li.dataset.time);
            }
        });

        modalCloseBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

        modalTags.addEventListener('click', (e) => {
            const target = e.target.closest('.tag-option');
            if (!target) return;

            // Toggle selected class
            const currentSelected = modalTags.querySelector('.selected');
            if (currentSelected) {
                currentSelected.classList.remove('selected');
            }
            target.classList.add('selected');

            // Automatically fill the title with the tag name
            modalTitle.value = target.textContent;
        });

        modalSaveBtn.addEventListener('click', () => {
            if (!currentlyEditingTime) return;
            const newTitle = modalTitle.value.trim();
            if (!newTitle) { alert('タイトルを入力してください。'); return; }

            const selectedTagEl = modalTags.querySelector('.selected');
            const newTag = selectedTagEl ? selectedTagEl.dataset.tag : null;
            const newMemo = modalMemo.value.trim();
            const startTime = parseInt(currentlyEditingTime.split(':')[0]);
            const endTime = parseInt(modalEndTime.value.split(':')[0]);

            for (let i = startTime; i <= endTime; i++) {
                const time = `${String(i).padStart(2, '0')}:00`;
                const existingItem = scheduleData[time] || {};
                scheduleData[time] = {
                    title: newTitle,
                    tag: newTag,
                    memo: newMemo,
                    completed: newTag === 'todo' ? (existingItem.tag === 'todo' ? existingItem.completed : false) : false
                };
            }
            saveScheduleData();
            renderSchedule();
            updateAchievementChart();
            closeModal();
        });

        modalDeleteBtn.addEventListener('click', () => {
            if (!currentlyEditingTime) return;
            const itemToDelete = scheduleData[currentlyEditingTime];
            if (!itemToDelete) { closeModal(); return; }

            let startTime = parseInt(currentlyEditingTime.split(':')[0]);
            let endTime = startTime;
            for (let i = startTime - 1; i >= 7; i--) {
                const prevTime = `${String(i).padStart(2, '0')}:00`;
                if (scheduleData[prevTime] && scheduleData[prevTime].title === itemToDelete.title && scheduleData[prevTime].tag === itemToDelete.tag) {
                    startTime = i;
                } else {
                    break;
                }
            }
            for (let i = endTime + 1; i <= 23; i++) {
                const nextTime = `${String(i).padStart(2, '0')}:00`;
                if (scheduleData[nextTime] && scheduleData[nextTime].title === itemToDelete.title && scheduleData[nextTime].tag === itemToDelete.tag) {
                    endTime = i;
                } else {
                    break;
                }
            }

            const startTimeStr = `${String(startTime).padStart(2, '0')}:00`;
            const endTimeStr = `${String(endTime).padStart(2, '0')}:00`;
            if (confirm(`${startTimeStr}から${endTimeStr}の予定「${itemToDelete.title}」を削除しますか？`)) {
                for (let i = startTime; i <= endTime; i++) {
                    const time = `${String(i).padStart(2, '0')}:00`;
                    delete scheduleData[time];
                }
                saveScheduleData();
                renderSchedule();
                updateAchievementChart();
                closeModal();
            }
        });

        // --- Initial Load ---
        loadScheduleData();
        renderSchedule();
        setupQuotes();
        updateAchievementChart();
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

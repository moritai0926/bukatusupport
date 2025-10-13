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
        const modalIsTodo = document.getElementById('modal-is-todo');
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
                { text: "唯一の真の知恵は、自分が何も知らないということを知ることにある。", author: "ソクラテス" },
                { text: "人生とは、あなたが他の計画を立てるのに忙しい間に起こるものだ。", author: "ジョン・レノン" },
                { text: "成功は幸福の鍵ではない。幸福が成功の鍵だ。自分のしていることが好きならば、あなたは成功するだろう。", author: "アルバート・シュバイツァー" },
                { text: "行動は必ずしも幸福をもたらさないかもしれないが、行動なくして幸福はない。", author: "ベンジャミン・ディズレーリ" },
                { text: "完璧を目指すより、まず終わらせろ。", author: "マーク・ザッカーバーグ" },
                { text: "もしあなたが何かを十分に強く望むなら、あなたはそれを手に入れるだろう。", author: "エイブラハム・リンカーン" },
                { text: "最も偉大な栄光は、一度も失敗しないことではなく、失敗するたびに立ち上がることにある。", author: "ネルソン・マンデラ" },
                { text: "夢なき者に理想なし、理想なき者に計画なし、計画なき者に実行なし、実行なき者に成功なし。故に、夢なき者に成功なし。", author: "吉田松陰" },
                { text: "死して不朽の見込みあらばいつでも死すべし。生きて大業の見込みあらばいつでも生くべし。", author: "吉田松陰" },
                { text: "身はたとひ武蔵の野辺に朽ちぬとも留め置かまし大和魂", author: "吉田松陰" },
                { text: "志を立てるのに老いも若きもない。そして志あるところ、事また成る。", author: "吉田松陰" },
                { text: "人間は、今日より明日、明日より明後日と、常に向上を求める生き物である。", author: "吉田松陰" },
                { text: "大事をなさんとすれば、小事を怠らず。", author: "吉田松陰" },
                { text: "一燈を提げて暗夜を行く。暗夜を憂うることなかれ。ただ一燈を頼め。", author: "吉田松陰" }
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
            if (hour < 5) {
                return "夜更かし、お疲れ様。";
            } else if (hour < 10) {
                return "おはよう！";
            } else if (hour < 18) {
                return "こんにちは！";
            } else {
                return "こんばんは！";
            }
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
            const allTasks = Object.values(scheduleData);
            const todoTasks = allTasks.filter(item => item.isTodo);
            const uniqueTodoTasks = [...new Map(todoTasks.map(item => [item.title, item])).values()];
            const completedTodoTasks = uniqueTodoTasks.filter(item => item.completed);

            // This part is for the chart itself
            const chartContainer = document.getElementById('chart-container');
            const noTodoMessage = document.getElementById('no-todo-message');

            if (uniqueTodoTasks.length === 0) {
                if(chartContainer) chartContainer.style.display = 'none';
                if(noTodoMessage) noTodoMessage.style.display = 'block';
                if(advisorComment) advisorComment.textContent = '今日のToDoを作成して、学習を始めよう！';
                // Hide the chart but keep the advisor visible
                const achievementChartCard = document.querySelector('.achievement-chart .chart-and-text');
                if(achievementChartCard) achievementChartCard.style.display = 'none';
                return;
            }

            const achievementChartCard = document.querySelector('.achievement-chart .chart-and-text');
            if(achievementChartCard) achievementChartCard.style.display = 'flex';
            if(chartContainer) chartContainer.style.display = 'block';
            if(noTodoMessage) noTodoMessage.style.display = 'none';

            const achievementRate = Math.round((completedTodoTasks.length / uniqueTodoTasks.length) * 100);
            
            // Update advisor comment based on rate
            if (advisorComment) {
                if (achievementRate === 100) {
                    advisorComment.textContent = '素晴らしい、完璧だ！目標達成おめでとう！🎉';
                } else if (achievementRate >= 70) {
                    advisorComment.textContent = 'すごい！目標達成まであと少し！';
                } else if (achievementRate >= 30) {
                    advisorComment.textContent = '良い調子だね！このペースで頑張ろう。！';
                } else if (achievementRate > 0) {
                    advisorComment.textContent = 'まだ始まったばかりだね。一歩ずつ着実に進もう。！';
                } else {
                    advisorComment.textContent = 'さあ、最初のタスクを完了させよう！';
                }
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
                        const todoListElement = document.getElementById('todo-list');
                        if (!todoListElement) return;
            
                        todoListElement.innerHTML = ''; // Clear existing list
            
                        const allTasks = Object.values(scheduleData);
                        const uniqueTodoTasks = [...new Map(allTasks.filter(item => item.isTodo).map(item => [item.title, item])).values()];
            
                        const noTodoMessage = document.getElementById('no-todo-message');
            
                        if (uniqueTodoTasks.length === 0) {
                            if (noTodoMessage) noTodoMessage.style.display = 'block';
                            return;
                        } else {
                            if (noTodoMessage) noTodoMessage.style.display = 'none';
                        }
            
                                    uniqueTodoTasks.forEach(item => {
                                        const li = document.createElement('li');
                                        li.classList.add('todo-item');
                                        if (item.completed) {
                                            li.classList.add('completed');
                                        }
                        
                                        const checkboxWrapper = document.createElement('div');
                                        checkboxWrapper.classList.add('checkbox-wrapper');
                        
                                        const checkbox = document.createElement('input');
                                        checkbox.type = 'checkbox';
                                        checkbox.checked = item.completed || false;
                                        checkbox.dataset.title = item.title; // Use title to identify for completion
                                        checkbox.dataset.tag = item.tag; // Use tag to identify for completion
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
                        
                                        const deleteBtn = document.createElement('button');
                                        deleteBtn.classList.add('delete-btn');
                                        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
                                        deleteBtn.dataset.title = item.title; // Use title to identify for deletion
                                        deleteBtn.dataset.tag = item.tag; // Use tag to identify for deletion
                        
                                        li.appendChild(checkboxWrapper);
                                        li.appendChild(detailsDiv);
                                        li.appendChild(deleteBtn);
                                        todoListElement.appendChild(li);
                                    });            
                        // Add event listeners for checkboxes and delete buttons
                        todoListElement.querySelectorAll('.todo-item input[type="checkbox"]').forEach(checkbox => {
                            checkbox.addEventListener('change', (e) => {
                                const itemTitle = e.target.dataset.title;
                                const itemTag = e.target.dataset.tag;
                                const newCompletedState = e.target.checked;
            
                                // Update all occurrences of this todo item in scheduleData
                                for (const time in scheduleData) {
                                    if (scheduleData[time].title === itemTitle && scheduleData[time].tag === itemTag && scheduleData[time].isTodo) {
                                        scheduleData[time].completed = newCompletedState;
                                    }
                                }
                                saveScheduleData();
                                updateAchievementChart();
                                renderTodoList(); // Re-render todo list to update styles
                            });
                        });
            
                        todoListElement.querySelectorAll('.todo-item .delete-btn').forEach(button => {
                            button.addEventListener('click', (e) => {
                                const itemTitle = e.target.closest('.delete-btn').dataset.title;
                                const itemTag = e.target.closest('.delete-btn').dataset.tag;
            
                                if (confirm(`ToDo「${itemTitle}」を削除しますか？`)) {
                                    // Delete all occurrences of this todo item in scheduleData
                                    for (const time in scheduleData) {
                                        if (scheduleData[time].title === itemTitle && scheduleData[time].tag === itemTag && scheduleData[time].isTodo) {
                                            delete scheduleData[time];
                                        }
                                    }
                                    saveScheduleData();
                                    renderSchedule(); // Update main schedule view
                                    updateAchievementChart();
                                    renderTodoList(); // Re-render todo list
                                }
                            });
                        });
                    };
            
                    // --- Schedule Rendering ---
                    const renderSchedule = () => {
                        const savedReservations = localStorage.getItem('studyRoomReservations');
                        const studyRoomReservations = savedReservations ? JSON.parse(savedReservations) : {};
                        
                        const today = new Date();
                        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            
                        scheduleList.innerHTML = '';
                        let previousItem = null;
                        const scheduleItems = [];
            
                        // First, build a complete schedule item list for the day
                        for (let i = 7; i <= 23; i++) {
                            const hour = String(i).padStart(2, '0');
                            const time = `${hour}:00`;
                            const studyRoomSlotId = `${todayStr}-${hour}`;
                            
                            let item = scheduleData[time] || {};
                            let isStudyRoom = false;
            
                            if (studyRoomReservations[studyRoomSlotId]) {
                                item = {
                                    title: 'オンライン自習室',
                                    tag: 'study-room',
                                    memo: '集中して学習する時間です！',
                                    isStudyRoom: true
                                };
                            }
                            scheduleItems.push({ time, item });
                        }
            
                        // Now, process the list to add classes for continuous blocks
                        for (let i = 0; i < scheduleItems.length; i++) {
                            const { time, item } = scheduleItems[i];
                            const li = document.createElement('li');
                            li.dataset.time = time;
            
                            const prevItem = (i > 0) ? scheduleItems[i - 1].item : null;
                            const nextItem = (i < scheduleItems.length - 1) ? scheduleItems[i + 1].item : null;
            
                            const isSameAsPrev = prevItem && item.title && prevItem.title === item.title && prevItem.tag === item.tag;
                            const isSameAsNext = nextItem && item.title && nextItem.title === item.title && nextItem.tag === item.tag;
            
                            if (isSameAsPrev) {
                                li.classList.add('is-continuous');
                            }
                            if (!isSameAsPrev && isSameAsNext) {
                                li.classList.add('is-block-start');
                            }
                            if (isSameAsPrev && !isSameAsNext) {
                                li.classList.add('is-block-end');
                            }
            
                            if (item.tag) li.classList.add(`tag-${item.tag}`);
                            if (item.completed) li.classList.add('completed');
                            if (!item.title) {
                                li.classList.add('has-no-title');
                            } else if (item.isStudyRoom) {
                                li.classList.add('is-study-room-event');
                            }
            
                            const timeSpan = document.createElement('span');
                            timeSpan.className = 'time';
                            timeSpan.textContent = time;
                            li.appendChild(timeSpan);
            
                            if (item.isTodo && !item.isStudyRoom) {
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
                        highlightCurrentTime(); // Re-apply highlight after rendering
                    };
            
                    // --- Modal Logic ---
                    const openModal = (time) => {
                        currentlyEditingTime = time;
                        const item = scheduleData[time] || {};
                        modalTime.textContent = `${time}の予定`;
                        modalTitle.value = item.title || '';
                        modalMemo.value = item.memo || '';
                        modalIsTodo.checked = item.isTodo || false;
            
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
                                if (scheduleData[nextTime] && scheduleData[nextTime].title === item.title && scheduleData[nextTime].tag === item.tag && scheduleData[nextTime].isTodo === item.isTodo) {
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
                            const item = scheduleData[time];
                            if (item && item.isTodo) {
                                const newCompletedState = e.target.checked;
                                // Propagate change to all items in the same block
                                for (const key in scheduleData) {
                                    if (scheduleData[key].title === item.title && scheduleData[key].tag === item.tag && scheduleData[key].isTodo) {
                                        scheduleData[key].completed = newCompletedState;
                                    }
                                }
                                saveScheduleData();
                                renderSchedule();
                                updateAchievementChart();
                                renderTodoList(); // Add this line
                            }
                            return;
                        }
                        // Do not open modal for study room events
                        const li = e.target.closest('li:not(.is-study-room-event)');
                        if (li) {
                            openModal(li.dataset.time);
                        }
                    });
            
                    modalCloseBtn.addEventListener('click', closeModal);
                    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
            
                    modalTags.addEventListener('click', (e) => {
                        const target = e.target.closest('.tag-option');
                        if (!target) return;
                        const currentSelected = modalTags.querySelector('.selected');
                        if (currentSelected) currentSelected.classList.remove('selected');
                        target.classList.add('selected');
                        if (!modalTitle.value) {
                            modalTitle.value = target.textContent;
                        }
                    });
            
                    modalSaveBtn.addEventListener('click', () => {
                        if (!currentlyEditingTime) return;
                        const newTitle = modalTitle.value.trim();
                        if (!newTitle) { alert('タイトルを入力してください。'); return; }
            
                        const selectedTagEl = modalTags.querySelector('.selected');
                        const newTag = selectedTagEl ? selectedTagEl.dataset.tag : null;
                        const newIsTodo = modalIsTodo.checked;
                        const newMemo = modalMemo.value.trim();
                        const startTime = parseInt(currentlyEditingTime.split(':')[0]);
                        const endTime = parseInt(modalEndTime.value.split(':')[0]);
            
                        for (let i = startTime; i <= endTime; i++) {
                            const time = `${String(i).padStart(2, '0')}:00`;
                            scheduleData[time] = {
                                title: newTitle,
                                tag: newTag,
                                memo: newMemo,
                                isTodo: newIsTodo,
                                completed: newIsTodo ? (scheduleData[time]?.completed || false) : false
                            };
                        }
                        saveScheduleData();
                        renderSchedule();
                        updateAchievementChart();
                        renderTodoList(); // Add this line
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
                            if (scheduleData[prevTime] && scheduleData[prevTime].title === itemToDelete.title && scheduleData[prevTime].tag === itemToDelete.tag && scheduleData[prevTime].isTodo === itemToDelete.isTodo) {
                                startTime = i;
                            } else {
                                break;
                            }
                        }
                        for (let i = endTime + 1; i <= 23; i++) {
                            const nextTime = `${String(i).padStart(2, '0')}:00`;
                            if (scheduleData[nextTime] && scheduleData[nextTime].title === itemToDelete.title && scheduleData[nextTime].tag === itemToDelete.tag && scheduleData[nextTime].isTodo === itemToDelete.isTodo) {
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
                            renderTodoList(); // Add this line
                            closeModal();
                        }
                    });
            
                    // --- Current Time Highlight ---
                    const highlightCurrentTime = (shouldScroll = false) => {
                        updateAdvisorGreeting(); // Update greeting periodically
                        const now = new Date();
                        const currentHour = now.getHours();
            
                        // Remove previous highlight from all items
                        scheduleList.querySelectorAll('.current-time').forEach(el => {
                            el.classList.remove('current-time');
                        });
            
                        // Find the specific li for the current hour
                        const timeString = `${String(currentHour).padStart(2, '0')}:00`;
                        const currentLi = scheduleList.querySelector(`li[data-time="${timeString}"]`);
            
                        if (currentLi) {
                            // If the current item is part of a block, highlight the whole block
                            if (currentLi.classList.contains('is-continuous') || currentLi.classList.contains('is-block-start') || currentLi.classList.contains('is-block-end')) {
                                let blockStart = currentLi;
                                // Find the start of the block
                                while (blockStart.previousElementSibling && (blockStart.classList.contains('is-continuous') || blockStart.classList.contains('is-block-end'))) {
                                    blockStart = blockStart.previousElementSibling;
                                }
            
                                // Highlight all items from the start of the block to the end
                                let currentBlockItem = blockStart;
                                while (currentBlockItem && (currentBlockItem.classList.contains('is-block-start') || currentBlockItem.classList.contains('is-continuous') || currentBlockItem.classList.contains('is-block-end'))) {
                                    currentBlockItem.classList.add('current-time');
                                    if (!currentBlockItem.classList.contains('is-block-end')) {
                                        currentBlockItem = currentBlockItem.nextElementSibling;
                                    } else {
                                        break; // End of block
                                    }
                                }
                            } else {
                                // Not part of a block, just highlight the single item
                                currentLi.classList.add('current-time');
                            }
                            
                            // Scroll into view only on initial load
                            if (shouldScroll) {
                                currentLi.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'center'
                                });
                            }
                        }
                    };
            
                    // --- Initial Load ---
                    loadScheduleData();
                    renderSchedule();
                    setupQuotes();
                    updateAdvisorGreeting(); // Set initial greeting
                    updateAchievementChart();
                    renderTodoList(); // Add this line for initial load
                    highlightCurrentTime(true); // Initial call with scroll
                    setInterval(highlightCurrentTime, 60000); // Subsequent calls without scroll
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

document.addEventListener('DOMContentLoaded', () => {
    // Mock Exam Chart (from original profile.js)
    const mockExamCtx = document.getElementById('mockExamChart');
    if (mockExamCtx) {
        new Chart(mockExamCtx, {
            type: 'line',
            data: {
                labels: ['4月', '5月', '6月', '7月', '8月', '9月'],
                datasets: [
                    {
                        label: '数学',
                        data: [55, 58, 62, 65, 68, 72],
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        fill: true,
                    },
                    {
                        label: '英語',
                        data: [60, 62, 65, 64, 67, 70],
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        fill: true,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 50,
                        max: 80
                    }
                }
            }
        });
    }

    // --- 2-Week Plan ---
    const planGrid = document.getElementById('plan-grid');
    const editPlanBtn = document.getElementById('edit-plan-btn');
    
    // Modal Elements
    const modal = document.getElementById('plan-modal');
    const modalHeading = document.getElementById('plan-modal-heading');
    const modalTitleInput = document.getElementById('plan-modal-title');
    const modalTagsContainer = document.getElementById('plan-modal-tags');
    const modalSaveBtn = document.getElementById('plan-modal-save-btn');
    const modalDeleteBtn = document.getElementById('plan-modal-delete-btn');
    const modalCloseBtn = document.getElementById('plan-modal-close-btn');

    if (planGrid) {
        const MENTOR_PASSWORD = 'mentor2025';
        let isEditMode = false;
        let planData = {};
        let currentlyEditingCellId = null;

        const loadPlanData = () => {
            const savedData = localStorage.getItem('twoWeekPlan');
            planData = savedData ? JSON.parse(savedData) : {};
        };

        const savePlanData = () => {
            localStorage.setItem('twoWeekPlan', JSON.stringify(planData));
        };

        const renderPlanGrid = () => {
            planGrid.innerHTML = ''; // Clear grid
            const today = new Date();
            const days = [];
            const dayFormatter = new Intl.DateTimeFormat('ja-JP', { month: 'numeric', day: 'numeric' });
            const weekdayFormatter = new Intl.DateTimeFormat('ja-JP', { weekday: 'short' });

            // Header row (days)
            planGrid.appendChild(document.createElement('div')); // Empty corner
            for (let i = 0; i < 14; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                days.push(date);

                const headerCell = document.createElement('div');
                headerCell.classList.add('plan-header');
                headerCell.innerHTML = `${dayFormatter.format(date)}<br>(${weekdayFormatter.format(date)})`;
                if (date.toDateString() === today.toDateString()) {
                    headerCell.style.backgroundColor = 'var(--secondary-accent)';
                    headerCell.style.color = 'white';
                }
                planGrid.appendChild(headerCell);
            }

            // Time rows
            for (let hour = 7; hour <= 23; hour++) {
                const timeLabel = document.createElement('div');
                timeLabel.classList.add('plan-time-label');
                timeLabel.textContent = `${hour}:00`;
                planGrid.appendChild(timeLabel);

                for (let i = 0; i < 14; i++) {
                    const date = days[i];
                    const cellId = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${hour}`;
                    
                    const cell = document.createElement('div');
                    cell.classList.add('plan-cell');
                    cell.dataset.cellId = cellId;

                    const task = planData[cellId];
                    if (task) {
                        cell.dataset.tag = task.tag;
                        const title = document.createElement('div');
                        title.classList.add('task-title');
                        title.textContent = task.title;
                        cell.appendChild(title);
                    }
                    
                    if (isEditMode) {
                        cell.classList.add('editable');
                    }

                    planGrid.appendChild(cell);
                }
            }
        };

        const toggleEditMode = () => {
            const password = prompt('メンター用のパスワードを入力してください:');
            if (password === MENTOR_PASSWORD) {
                isEditMode = !isEditMode;
                editPlanBtn.classList.toggle('active', isEditMode);
                if (isEditMode) {
                    editPlanBtn.innerHTML = '<i class="fas fa-lock-open"></i> 編集完了';
                } else {
                    editPlanBtn.innerHTML = '<i class="fas fa-lock"></i> 編集';
                }
                renderPlanGrid(); // Re-render to apply/remove 'editable' class
            } else if (password) {
                alert('パスワードが違います。');
            }
        };

        const openModal = (cellId) => {
            currentlyEditingCellId = cellId;
            const task = planData[cellId];
            
            const [year, month, day, hour] = cellId.split('-');
            modalHeading.textContent = `${month}/${day} ${hour}:00 のタスク`;

            if (task) {
                modalTitleInput.value = task.title;
                modalTagsContainer.querySelectorAll('.tag-option').forEach(btn => {
                    btn.classList.toggle('selected', btn.dataset.tag === task.tag);
                });
            } else {
                modalTitleInput.value = '';
                modalTagsContainer.querySelector('.selected')?.classList.remove('selected');
            }
            modal.style.display = 'flex';
        };

        const closeModal = () => {
            modal.style.display = 'none';
            currentlyEditingCellId = null;
        };

        const saveTask = () => {
            if (!currentlyEditingCellId) return;

            const title = modalTitleInput.value.trim();
            const selectedTagEl = modalTagsContainer.querySelector('.selected');
            const tag = selectedTagEl ? selectedTagEl.dataset.tag : null;

            if (title && tag) {
                planData[currentlyEditingCellId] = { title, tag };
            } else {
                delete planData[currentlyEditingCellId];
            }
            
            savePlanData();
            renderPlanGrid();
            closeModal();
        };

        const deleteTask = () => {
            if (!currentlyEditingCellId) return;
            delete planData[currentlyEditingCellId];
            savePlanData();
            renderPlanGrid();
            closeModal();
        };

        // Event Listeners
        editPlanBtn.addEventListener('click', toggleEditMode);
        modalCloseBtn.addEventListener('click', closeModal);
        modalSaveBtn.addEventListener('click', saveTask);
        modalDeleteBtn.addEventListener('click', deleteTask);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        modalTagsContainer.addEventListener('click', (e) => {
            const target = e.target.closest('.tag-option');
            if (!target) return;
            modalTagsContainer.querySelector('.selected')?.classList.remove('selected');
            target.classList.add('selected');
        });
        planGrid.addEventListener('click', (e) => {
            if (!isEditMode) return;
            const cell = e.target.closest('.plan-cell');
            if (cell) {
                openModal(cell.dataset.cellId);
            }
        });

        // Initial Load
        loadPlanData();
        renderPlanGrid();
    }
});
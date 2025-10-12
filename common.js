document.addEventListener('DOMContentLoaded', () => {
    // --- テーマ切り替え機能 ---
    const themeToggleBtn = document.querySelector('.theme-toggle-btn');
    const sunIcon = document.querySelector('.icon-sun');
    const moonIcon = document.querySelector('.icon-moon');

    if (themeToggleBtn) {
        const applyTheme = (theme) => {
            if (theme === 'light') {
                document.body.classList.add('light-mode');
                if (sunIcon) sunIcon.style.display = 'none';
                if (moonIcon) moonIcon.style.display = 'block';
            } else {
                document.body.classList.remove('light-mode');
                if (sunIcon) sunIcon.style.display = 'block';
                if (moonIcon) moonIcon.style.display = 'none';
            }
        };

        themeToggleBtn.addEventListener('click', () => {
            let currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
            let newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });

        // 初期テーマを適用
        applyTheme(localStorage.getItem('theme') || 'dark');
    }
});

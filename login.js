document.addEventListener('DOMContentLoaded', () => {
    // --- ログイン機能 ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('email');
            // 簡単のため、メールアドレスの @ より前をユーザー名として使用
            const username = emailInput.value.split('@')[0];
            if (username) {
                localStorage.setItem('loggedInUser', username);
                window.location.href = 'dashboard.html';
            }
        });
    }
});

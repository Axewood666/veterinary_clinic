document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('loginForm');
    const errorElem = document.getElementById('loginError');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        errorElem.textContent = '';

        const formData = new FormData(form);
        const data = {
            username: formData.get('username'),
            password: formData.get('password')
        };
        try {
            const response = await fetch(`${window.BACKEND_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });

            if (response.ok) {
                window.location.href = '/';
            } else {
                const result = await response.json();
                errorElem.textContent = result.message || 'Ошибка входа';
            }
        } catch (err) {
            errorElem.textContent = 'Ошибка сети';
        }
    });
});
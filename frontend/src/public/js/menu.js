document.addEventListener('DOMContentLoaded', function () {
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', async function (e) {
            e.preventDefault();
            try {
                await fetch(`${window.BACKEND_URL}/api/auth/logout`, {
                    method: 'POST',
                    credentials: 'include'
                });
            } catch (err) {
                console.log(err)
            }
            window.location.href = '/';
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const signinButton = document.getElementById('signin-button');
    if (signinButton) {
        signinButton.addEventListener('click', function () {
            window.location.href = '/login';
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const signupButton = document.getElementById('signup-button');
    if (signupButton) {
        signupButton.addEventListener('click', function () {
            window.location.href = '/register';
        });
    }
})

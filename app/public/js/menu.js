document.addEventListener('DOMContentLoaded', function () {
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = '/auth/logout';
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const signinButton = document.getElementById('signin-button');
    if (signinButton) {
        signinButton.addEventListener('click', function () {
            window.location.href = '/auth/login';
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const signupButton = document.getElementById('signup-button');
    if (signupButton) {
        signupButton.addEventListener('click', function () {
            window.location.href = '/auth/register';
        });
    }
})

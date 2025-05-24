document.addEventListener('DOMContentLoaded', function () {
    const signupButton = document.getElementById('signup-button');
    if (signupButton) {
        signupButton.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = '/auth/register';
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
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function () {
            window.location.href = '/auth/logout';
        });
    }
})

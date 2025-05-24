document.addEventListener('DOMContentLoaded', () => {
    const banModal = document.getElementById('banModal');
    const banForm = document.getElementById('banForm');
    document.body.addEventListener('click', (e) => {
        const banBtn = e.target.closest('.ban-btn');
        if (banBtn) {
            const userId = banBtn.dataset.userid;
            if (!userId) {
                console.error('No userid found on ban button');
                return;
            }
            document.getElementById('banUserId').value = userId;
            banModal.style.display = 'flex';
        }
    });
    document.querySelector('.cancel-btn').addEventListener('click', () => {
        banModal.style.display = 'none';
    });
    banForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = document.getElementById('banUserId').value;
        const reason = document.getElementById('banReason').value.trim();
        try {
            const response = await fetch(`/api/ban-user`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userid: userId,
                    reason
                })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to ban user');
            }
            showNotification('User banned successfully');
            setTimeout(() => location.reload(), 1500);
        } catch (error) {
            console.error('Ban failed:', error);
            showNotification(error.message, 'error');
        }
    });
    function showNotification(message, type = 'success') {
        const modalContent = document.querySelector('.modal-content');
        if (!modalContent) return;
        let notificationsContainer = modalContent.querySelector('.notifications-container');
        if (!notificationsContainer) {
            notificationsContainer = document.createElement('div');
            notificationsContainer.className = 'notifications-container';
            modalContent.insertBefore(notificationsContainer, modalContent.firstChild);
        }
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notificationsContainer.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('fade-out');
            notification.addEventListener('transitionend', () => notification.remove());
        }, 2500);
    }
});
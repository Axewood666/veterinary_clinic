/**
 * JavaScript-функции для клиентского интерфейса
 */

document.addEventListener('DOMContentLoaded', function() {
  // Обработка мобильной навигации в клиентском интерфейсе
  const sidebarToggleBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  
  if (sidebarToggleBtn && sidebar) {
    sidebarToggleBtn.addEventListener('click', function() {
      sidebar.classList.toggle('sidebar-mobile-open');
    });
  }
  
  // Обработка форм с подтверждением
  const confirmForms = document.querySelectorAll('.confirm-form');
  confirmForms.forEach(form => {
    form.addEventListener('submit', function(e) {
      const message = this.getAttribute('data-confirm') || 'Вы уверены, что хотите выполнить это действие?';
      if (!confirm(message)) {
        e.preventDefault();
      }
    });
  });
  
  // Обработка отмены приема
  const cancelButtons = document.querySelectorAll('.cancel-appointment');
  cancelButtons.forEach(button => {
    button.addEventListener('click', function() {
      const appointmentId = this.getAttribute('data-id');
      if (confirm('Вы уверены, что хотите отменить этот прием?')) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/client/appointments/${appointmentId}/cancel`;
        document.body.appendChild(form);
        form.submit();
      }
    });
  });
  
  // Обработка удаления питомца
  const deletePetButtons = document.querySelectorAll('.delete-pet');
  deletePetButtons.forEach(button => {
    button.addEventListener('click', function() {
      const petId = this.getAttribute('data-id');
      if (confirm('Вы уверены, что хотите удалить этого питомца? Это действие нельзя отменить.')) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/client/pets/${petId}/delete`;
        document.body.appendChild(form);
        form.submit();
      }
    });
  });
  
  // Выбор времени приема в зависимости от выбранного ветеринара
  const vetSelect = document.getElementById('vetid');
  const dateInput = document.getElementById('date');
  const timeSelect = document.getElementById('time');
  
  if (vetSelect && dateInput && timeSelect) {
    const updateAvailableTimes = function() {
      const vetId = vetSelect.value;
      const date = dateInput.value;
      
      if (!vetId || !date) return;
      
      // Очистка текущего списка времени
      timeSelect.innerHTML = '<option value="" disabled selected>Загрузка доступного времени...</option>';
      
      // Запрос доступного времени для выбранного ветеринара и даты
      fetch(`/api/appointments/available-times?vetid=${vetId}&date=${date}`)
        .then(response => response.json())
        .then(data => {
          timeSelect.innerHTML = '<option value="" disabled selected>Выберите время</option>';
          
          if (data.length === 0) {
            timeSelect.innerHTML += '<option value="" disabled>Нет доступного времени</option>';
            return;
          }
          
          data.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            timeSelect.appendChild(option);
          });
        })
        .catch(error => {
          console.error('Ошибка при загрузке доступного времени:', error);
          timeSelect.innerHTML = '<option value="" disabled selected>Ошибка загрузки</option>';
        });
    };
    
    vetSelect.addEventListener('change', updateAvailableTimes);
    dateInput.addEventListener('change', updateAvailableTimes);
  }
  
  // Валидация форм
  const forms = document.querySelectorAll('.needs-validation');
  
  forms.forEach(form => {
    form.addEventListener('submit', function(event) {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      form.classList.add('was-validated');
    }, false);
  });
});

// Функция для отображения всплывающих уведомлений
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <p>${message}</p>
    </div>
    <button class="notification-close">&times;</button>
  `;
  
  document.body.appendChild(notification);
  
  // Показываем уведомление
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Скрываем уведомление через некоторое время
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 5000);
  
  // Обработка кнопки закрытия
  const closeButton = notification.querySelector('.notification-close');
  closeButton.addEventListener('click', () => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  });
}

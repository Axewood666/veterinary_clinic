$(document).ready(function () {
    // Плавная анимация для кнопок
    $('.button').hover(
        function () {
            $(this).css('transform', 'scale(1.05)');
        },
        function () {
            $(this).css('transform', 'scale(1)');
        }
    );

    // Плавная прокрутка к секциям
    $('a[href^="#"]').click(function (e) {
        e.preventDefault();
        var target = $(this.hash);
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top - 70
            }, 800);
        }
    });

    // Анимация появления карточек при скролле
    function animateOnScroll() {
        $('.service-card, .vet-card, .testimonial-card').each(function () {
            var elementTop = $(this).offset().top;
            var elementBottom = elementTop + $(this).outerHeight();
            var viewportTop = $(window).scrollTop();
            var viewportBottom = viewportTop + $(window).height();

            if (elementBottom > viewportTop && elementTop < viewportBottom) {
                $(this).addClass('fade-in');
            }
        });
    }

    // Запускаем анимацию при скролле
    $(window).scroll(animateOnScroll);
    animateOnScroll(); // Запускаем сразу для элементов в видимой области

    // Простая валидация форм
    $('form').submit(function (e) {
        var isValid = true;
        $(this).find('input[required], select[required], textarea[required]').each(function () {
            if (!$(this).val()) {
                $(this).addClass('error');
                isValid = false;
            } else {
                $(this).removeClass('error');
            }
        });

        if (!isValid) {
            e.preventDefault();
            alert('Пожалуйста, заполните все обязательные поля');
        }
    });

    // Убираем класс ошибки при вводе
    $('input, select, textarea').on('input change', function () {
        $(this).removeClass('error');
    });

    // Показ/скрытие мобильного меню (если есть)
    $('.menu-toggle').click(function () {
        $('.menu').toggleClass('active');
    });

    console.log('jQuery загружен и готов к работе!');
}); 
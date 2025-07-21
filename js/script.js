document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section[id]'); // Todas las secciones con un ID
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link'); // Todos los enlaces del navbar
    const navbar = document.querySelector('.navbar.fixed-top'); // La barra de navegación
    const isScrolling = { value: false }; // Bandera para controlar si el scroll es por clic (evita conflictos)

    // --- Función para Activar el Enlace del Navbar ---
    const setActiveLink = (targetId) => {
        // Remueve la clase 'active' de todos los enlaces y el atributo 'aria-current'
        navLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        });
        // Añade la clase 'active' y 'aria-current' al enlace correspondiente
        navLinks.forEach(link => {
            const linkHrefId = link.getAttribute('href').substring(1); 
            // Si el ID del enlace coincide con el ID de la sección actual
            // O si el enlace es '#' (inicio) y la sección actual es 'inicio'
            if (linkHrefId === targetId || (linkHrefId === '' && targetId === 'inicio')) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });
    };

    // --- Función para Activar Enlaces al Scrollear la Página ---
    const activateNavLinkOnScroll = () => {
        if (isScrolling.value) return; 

        let currentActiveSectionId = null;
        let offsetForDetection;
        if (window.innerWidth < 768) { 
            offsetForDetection = 110; // Ajusta este para móviles
        } else { 
            offsetForDetection = 90; // Ajusta este para escritorio
        }
        const currentScroll = window.scrollY; 
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;

        // Si estamos cerca del final de la página, activa la última sección
        if (currentScroll + 10 >= documentHeight) { 
            if (sections.length > 0) {
                currentActiveSectionId = sections[sections.length - 1].getAttribute('id');
            }
        } else {
            // Itera sobre las secciones de abajo hacia arriba para encontrar la activa
            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                let specificOffsetForDetection = offsetForDetection; 
                switch (section.id) {
                    case 'nosotros':
                        specificOffsetForDetection = 120; 
                        break;
                    case 'historias':
                        specificOffsetForDetection = 50; 
                        break;
                    case 'contacto':
                        specificOffsetForDetection = 60; 
                        break;
                }
                if (currentScroll >= (section.offsetTop - specificOffsetForDetection)) { 
                    currentActiveSectionId = section.getAttribute('id');
                    break; // Encontramos la sección activa, salimos del bucle
                }
            }
        }
        if (!currentActiveSectionId) {
            if (sections.length > 0 && sections[0].getAttribute('id') === 'inicio' && window.scrollY < sections[0].offsetTop + (sections[0].offsetHeight / 2) - offsetForDetection) {
                currentActiveSectionId = 'inicio';
            } else if (navLinks.length > 0 && navLinks[0].getAttribute('href') === '#') {
                currentActiveSectionId = 'inicio';
            } else if (sections.length > 0) { 
                 currentActiveSectionId = sections[0].getAttribute('id');
            }
        }
        
        setActiveLink(currentActiveSectionId);
    };

    // --- Event Listeners para Scroll y Resize ---
    window.addEventListener('scroll', activateNavLinkOnScroll);
    window.addEventListener('resize', activateNavLinkOnScroll); 
    activateNavLinkOnScroll(); 
    // --- Event Listener para Clic en Enlaces del Navbar ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Previene el comportamiento por defecto (salto instantáneo)
            let targetId = link.getAttribute('href').substring(1); 
            if (targetId === '') { // Si el href es solo '#', apunta a 'inicio'
                targetId = 'inicio';
            }
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                // Cierra el navbar colapsable si está abierto (para móviles)
                const navbarCollapse = document.getElementById('navbarNav');
                if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                    const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                    if (bsCollapse) {
                        bsCollapse.hide();
                    } else {
                        navbarCollapse.classList.remove('show');
                    }
                }
                setActiveLink(targetId); // Marca el enlace como activo inmediatamente al hacer clic
                isScrolling.value = true; // Establece la bandera de scroll por clic
                // Pequeño retardo para asegurar que el navbar se haya cerrado antes del scroll
                setTimeout(() => {
                    let offsetForClickScroll;
                    switch (targetId) {
                        case 'nosotros':
                            offsetForClickScroll = 100; 
                            break;
                        case 'historias':
                            offsetForClickScroll = 10; 
                            break;
                        case 'contacto':
                            offsetForClickScroll = 20; 
                            break;
                        default:
                            offsetForClickScroll = 80; 
                            break;
                    }
                    const scrollToPosition = targetSection.offsetTop - offsetForClickScroll;
                    window.scrollTo({
                        top: scrollToPosition,
                        behavior: 'smooth' 
                    });
                    setTimeout(() => {
                        isScrolling.value = false;
                        activateNavLinkOnScroll(); 
                    }, 800); // 800ms es la duración de la animación de scroll
                }, 100); 
            } else {
                console.warn(`Sección con ID '${targetId}' no encontrada.`); 
            }
        });
    });
    // Validacion de recaptcha
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (event) {
            const recaptchaResponse = typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : '';
            const recaptchaErrorDiv = document.getElementById('recaptcha-error');
            if (!this.checkValidity() || recaptchaResponse.length === 0) {
                event.preventDefault(); 
                event.stopPropagation(); 
                if (recaptchaResponse.length === 0) {
                    if (recaptchaErrorDiv) {
                        recaptchaErrorDiv.textContent = 'Por favor, completa la verificación "No soy un robot".';
                        recaptchaErrorDiv.classList.add('d-block'); 
                    }
                } else {
                    if (recaptchaErrorDiv) {
                        recaptchaErrorDiv.textContent = '';
                        recaptchaErrorDiv.classList.remove('d-block');
                    }
                }
                this.classList.add('was-validated');
            } else {
                const recaptchaInput = document.querySelector('[name="g-recaptcha-response"]');
                if (recaptchaInput) {
                    recaptchaInput.remove(); 
                }   
                this.classList.remove('was-validated');
                if (recaptchaErrorDiv) {
                    recaptchaErrorDiv.textContent = '';
                    recaptchaErrorDiv.classList.remove('d-block');
                }
            }
        });
    }
});




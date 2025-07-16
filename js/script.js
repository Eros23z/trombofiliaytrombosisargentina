document.addEventListener('DOMContentLoaded', () => {
    // --- Variables Globales y Selectores ---
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
        // Si el scroll fue iniciado por un clic en el navbar, no hagas nada (para evitar conflictos)
        if (isScrolling.value) return; 

        let currentActiveSectionId = null;
        
        // Offset predeterminado para la detección de la sección activa al scrollear
        // Este valor debe ser menor que el offsetForClickScroll para que el link se active ANTES
        // de que la sección esté completamente arriba.
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
                
                let specificOffsetForDetection = offsetForDetection; // Valor predeterminado
                
                // *** AJUSTES ESPECÍFICOS para la DETECCIÓN al SCROLLEAR ***
                // Si el navbar detecta tarde la sección (el título ya está tapado),
                // haz este 'specificOffsetForDetection' MÁS PEQUEÑO.
                // Si la detecta demasiado pronto, hazlo MÁS GRANDE.
                switch (section.id) {
                    case 'nosotros':
                        specificOffsetForDetection = 120; // PRUEBA con 30, 20, 10, 0 o incluso -20
                        break;
                    case 'historias':
                        specificOffsetForDetection = 50; // PRUEBA con 30, 20
                        break;
                    case 'contacto':
                        specificOffsetForDetection = 60; // PRUEBA con 30, 20, 10, 0 o incluso -20
                        break;
                    // Agrega otros casos si más secciones tienen problemas de detección al scrollear
                }

                // Si el scroll actual ha pasado el inicio de la sección (ajustado por el offset)
                if (currentScroll >= (section.offsetTop - specificOffsetForDetection)) { 
                    currentActiveSectionId = section.getAttribute('id');
                    break; // Encontramos la sección activa, salimos del bucle
                }
            }
        }

        // Caso especial: Si no hay ninguna sección activa (ej. al inicio de la página)
        if (!currentActiveSectionId) {
            if (sections.length > 0 && sections[0].getAttribute('id') === 'inicio' && window.scrollY < sections[0].offsetTop + (sections[0].offsetHeight / 2) - offsetForDetection) {
                currentActiveSectionId = 'inicio';
            } else if (navLinks.length > 0 && navLinks[0].getAttribute('href') === '#') {
                currentActiveSectionId = 'inicio';
            } else if (sections.length > 0) { // Fallback, si hay secciones, la primera por defecto
                 currentActiveSectionId = sections[0].getAttribute('id');
            }
        }
        
        setActiveLink(currentActiveSectionId);
    };

    // --- Event Listeners para Scroll y Resize ---
    window.addEventListener('scroll', activateNavLinkOnScroll);
    window.addEventListener('resize', activateNavLinkOnScroll); 
    activateNavLinkOnScroll(); // Llama una vez al cargar para establecer la sección inicial

    // --- Event Listener para Clic en Enlaces del Navbar ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Previene el comportamiento por defecto (salto instantáneo)

            // Obtiene el ID de la sección de destino desde el href del enlace
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
                    
                    // *** AJUSTES ESPECÍFICOS para el SCROLL por CLIC ***
                    // Este offset determina DÓNDE termina el scroll.
                    // Si el título queda cubierto, haz este número MÁS GRANDE.
                    // Si hay demasiado espacio, hazlo MÁS PEQUEÑO.
                    switch (targetId) {
                        case 'nosotros':
                            offsetForClickScroll = 100; // PRUEBA este valor (ej. 100, 110, 130)
                            break;
                        case 'historias':
                            offsetForClickScroll = 10; // PRUEBA este valor (ej. 80, 90, 100)
                            break;
                        case 'contacto':
                            offsetForClickScroll = 20; // PRUEBA este valor (ej. 70, 90, 100)
                            break;
                        default:
                            offsetForClickScroll = 80; // Valor predeterminado para el resto
                            break;
                    }
                    
                    const scrollToPosition = targetSection.offsetTop - offsetForClickScroll;

                    // Realiza el scroll suave
                    window.scrollTo({
                        top: scrollToPosition,
                        behavior: 'smooth' 
                    });

                    // Después de que el scroll ha terminado (o un tiempo razonable), resetea la bandera
                    setTimeout(() => {
                        isScrolling.value = false;
                        activateNavLinkOnScroll(); // Vuelve a permitir la detección por scroll
                    }, 800); // 800ms es la duración de la animación de scroll
                }, 100); 
            } else {
                console.warn(`Sección con ID '${targetId}' no encontrada.`); // Mensaje de depuración si la sección no existe
            }
        });
    });

    // Validacion de recaptcha
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (event) {
            const recaptchaResponse = typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : '';
            const recaptchaErrorDiv = document.getElementById('recaptcha-error');

            // checkValidity() verifica las validaciones HTML5 (required, type="email", etc.)
            // y grecaptcha.getResponse() verifica si reCAPTCHA fue marcado.
            if (!this.checkValidity() || recaptchaResponse.length === 0) {
                event.preventDefault(); // Prevenir el envío si HTML5 o reCAPTCHA fallan
                event.stopPropagation(); // Detener la propagación del evento

                // Si la validación HTML5 falla, Bootstrap mostrará sus propios mensajes.
                // Aquí manejamos solo el mensaje de reCAPTCHA.
                if (recaptchaResponse.length === 0) {
                    if (recaptchaErrorDiv) {
                        recaptchaErrorDiv.textContent = 'Por favor, completa la verificación "No soy un robot".';
                        recaptchaErrorDiv.classList.add('d-block'); // Mostrar el div de error
                    }
                } else {
                    // Limpiar el error de reCAPTCHA si ya fue marcado
                    if (recaptchaErrorDiv) {
                        recaptchaErrorDiv.textContent = '';
                        recaptchaErrorDiv.classList.remove('d-block');
                    }
                }

                // Añadir la clase de Bootstrap para mostrar los estilos de validación
                this.classList.add('was-validated');
            } else {
                const recaptchaInput = document.querySelector('[name="g-recaptcha-response"]');
                if (recaptchaInput) {
                    recaptchaInput.remove(); // Elimina el elemento del DOM
                }   
                // Si todo es válido (HTML5 y reCAPTCHA), no prevenimos el envío.
                // El formulario se enviará de forma nativa via method="POST" a Formsubmit.co
                // Quitar la clase was-validated si se envía con éxito para un futuro uso
                this.classList.remove('was-validated');
                // Limpiar el error de reCAPTCHA si estaba presente
                if (recaptchaErrorDiv) {
                    recaptchaErrorDiv.textContent = '';
                    recaptchaErrorDiv.classList.remove('d-block');
                }
            }
        });
    }
});




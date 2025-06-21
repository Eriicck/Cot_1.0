// js/main.js

document.addEventListener('DOMContentLoaded', function() {

    // --- DATOS (simulados, luego vendrán del backend) ---
    const profesionalesData = {
        traumatologia: [
            { id: 1, nombre: "Dr. Juan Pérez", matricula: "MN 12345", foto: "img/Raul.avif", bio: "Especialista en rodilla y cadera, artroscopias y reemplazos articulares." },
            { id: 2, nombre: "Dra. Ana Gómez", matricula: "MN 67890", foto: "img/dra2.avif", bio: "Experta en medicina deportiva y rehabilitación de lesiones de hombro y codo." }
        ],
        pediatria: [
            { id: 3, nombre: "Dr. Carlos López", matricula: "MN 11223", foto: "img/doc1.jpg", bio: "Pediatra con enfoque en neonatología y seguimiento del desarrollo infantil." },
            { id: 4, nombre: "Dra. Laura Fernández", matricula: "MN 44556", foto: "img/doc2pediatra.jpg", bio: "Atención integral del niño y adolescente, puericultura y vacunas." }
        ],
        neurologia: [ // Asumo que querías 'neurocirugia' aquí basado en tu HTML, o ajusta la clave
            { id: 5, nombre: "Dr. Martín Rodríguez", matricula: "MN 77889", foto: "img/Dr. 2.avif", bio: "Especializado en enfermedades neurodegenerativas como Alzheimer y Parkinson." },
            { id: 6, nombre: "Dra. Sofía Torres", matricula: "MN 99001", foto: "img/Dra. Victoria.avif", bio: "Neurología clínica general, cefaleas, epilepsia y trastornos del sueño." }
        ]
    };

    const especialidadesParaTurnos = [
        { id_db: 1, clave_js: 'traumatologia', nombre: 'Traumatología' },
        { id_db: 2, clave_js: 'pediatria', nombre: 'Pediatría' },
        { id_db: 3, clave_js: 'neurologia', nombre: 'Neurocirugía' } // Ajustado a Neurocirugía si esa es la especialidad
    ];

    // --- MENÚ HAMBURGUESA ---
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = navToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        // Cerrar menú al hacer clic en un enlace de navegación
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = navToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }

    // --- MOSTRAR/OCULTAR PROFESIONALES ---
    const botonesVerProfesionales = document.querySelectorAll('.especialidad-card .btn-ver-profesionales');
    const seccionProfesionales = document.getElementById('profesionales');
    const listaProfesionalesDiv = document.getElementById('lista-profesionales');
    const nombreEspecialidadSeleccionadaSpan = document.getElementById('nombre-especialidad-seleccionada');
    const btnCerrarProfesionales = document.getElementById('btn-cerrar-profesionales');

    if (botonesVerProfesionales.length > 0 && seccionProfesionales && listaProfesionalesDiv && nombreEspecialidadSeleccionadaSpan && btnCerrarProfesionales) {
        botonesVerProfesionales.forEach(button => {
            button.addEventListener('click', (e) => {
                const card = e.target.closest('.especialidad-card');
                if (!card) return;
                const especialidadKey = card.dataset.especialidad; // 'traumatologia', 'pediatria', 'neurocirugia'
                const profesionales = profesionalesData[especialidadKey];
                const especialidadNombre = card.querySelector('h3')?.textContent || especialidadKey;
                
                if(nombreEspecialidadSeleccionadaSpan) nombreEspecialidadSeleccionadaSpan.textContent = `- ${especialidadNombre}`;
                if(listaProfesionalesDiv) listaProfesionalesDiv.innerHTML = '';

                if (profesionales) {
                    profesionales.forEach(prof => {
                        const profHTML = `
                            <div class="profesional-card animate-on-scroll fade-in-up-1">
                                <img src="${prof.foto}" alt="Foto de ${prof.nombre}">
                                <h4>${prof.nombre}</h4>
                                <p>Matrícula: ${prof.matricula}</p>
                                <p class="bio">${prof.bio}</p>
                            </div>
                        `;
                        listaProfesionalesDiv.innerHTML += profHTML;
                    });
                    seccionProfesionales.style.display = 'block';
                    seccionProfesionales.scrollIntoView({ behavior: 'smooth' });
                    // Re-observar los nuevos elementos para animación
                    document.querySelectorAll('.profesional-card.animate-on-scroll').forEach(el => observer.observe(el));
                } else {
                    console.warn(`No se encontraron datos de profesionales para la clave: ${especialidadKey}`);
                }
            });
        });

        btnCerrarProfesionales.addEventListener('click', () => {
            seccionProfesionales.style.display = 'none';
            const seccionEspecialidades = document.getElementById('especialidades');
            if (seccionEspecialidades) seccionEspecialidades.scrollIntoView({ behavior: 'smooth' });
        });
    }


    // --- MAPA CON LEAFLET.JS ---
    const mapaDiv = document.getElementById('mapa');
    if (mapaDiv) {
        if (typeof L !== 'undefined') {
            try {
                const map = L.map('mapa').setView([-34.64948297063554, -58.78710022512634], 15);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);
                L.marker([-34.64948297063554, -58.78710022512634]).addTo(map)
                    .bindPopup('Consultorios Médicos Aquí.<br> Uruguay 123.')
                    .openPopup();
            } catch (mapError) {
                console.error("Error al inicializar el mapa de Leaflet:", mapError);
            }
        } else {
            console.warn("Advertencia en main.js: Leaflet (L) no está definido. El mapa no se cargará. Verifica el orden de los scripts en index.html.");
        }
    }


    // --- LÓGICA DEL FORMULARIO DE TURNOS (Obra Social, Especialidad y Doctor) ---
    const selectObraSocialTurno = document.getElementById('obra-social-turno');
    const obraSocialInfoDiv = document.getElementById('obra-social-info');
    const selectEspecialidadTurno = document.getElementById('especialidad-turno');
    const selectDoctorTurno = document.getElementById('doctor-turno');
    const fechaInput = document.getElementById('fecha-turno');
    const horaSelect = document.getElementById('hora-turno');
    const nombrePacienteInput = document.getElementById('nombre-paciente');
    const dniPacienteInput = document.getElementById('dni-paciente');
    const emailPacienteInput = document.getElementById('email-paciente');
    const telefonoPacienteInput = document.getElementById('telefono-paciente');
    const confirmTurnoButton = document.querySelector('#form-turno button[type="submit"]');


    // Función para deshabilitar/habilitar campos del formulario
    function toggleFormFields(enable) {
        const fieldsToToggle = [
            selectEspecialidadTurno,
            selectDoctorTurno,
            fechaInput,
            horaSelect,
            nombrePacienteInput,
            dniPacienteInput,
            emailPacienteInput,
            telefonoPacienteInput,
            confirmTurnoButton
        ];

        fieldsToToggle.forEach(field => {
            if (field) {
                field.disabled = !enable;
                // Si se deshabilita, añadir clase para un estilo visual de "deshabilitado"
                if (!enable) {
                    field.classList.add('opacity-50', 'cursor-not-allowed');
                } else {
                    field.classList.remove('opacity-50', 'cursor-not-allowed');
                }
            }
        });

        // Limpiar selects cuando se deshabilitan
        if (!enable) {
            if (selectEspecialidadTurno) {
                selectEspecialidadTurno.value = "";
                // Mantener solo la opción de "Seleccione una especialidad"
                while (selectEspecialidadTurno.options.length > 1) {
                    selectEspecialidadTurno.remove(1);
                }
            }
            if (selectDoctorTurno) {
                selectDoctorTurno.innerHTML = '<option value="">Seleccione un Especialista</option>';
                selectDoctorTurno.value = "";
            }
            if (horaSelect) {
                horaSelect.innerHTML = '<option value="">Seleccione una hora</option>';
                horaSelect.value = "";
            }
            // Limpiar valores de inputs de texto
            if (nombrePacienteInput) nombrePacienteInput.value = "";
            if (dniPacienteInput) dniPacienteInput.value = "";
            if (emailPacienteInput) emailPacienteInput.value = "";
            if (telefonoPacienteInput) telefonoPacienteInput.value = "";
        }
    }

    // Event listener para el cambio de Obra Social
    if (selectObraSocialTurno) {
        selectObraSocialTurno.addEventListener('change', () => {
            const selectedOption = selectObraSocialTurno.options[selectObraSocialTurno.selectedIndex];
            const obraSocialValue = selectedOption.value;
            const redirectUrl = selectedOption.dataset.redirectUrl;
            const copagoAmount = selectedOption.dataset.copagoAmount; // Obtener el monto del copago

            // Limpiar clases y contenido del div de info
            obraSocialInfoDiv.innerHTML = '';
            obraSocialInfoDiv.className = 'text-sm mt-2 p-2 rounded-md flex items-center transition-all duration-300'; // Resetear clases
            
            toggleFormFields(true); // Por defecto, habilitar todo
            if (confirmTurnoButton) confirmTurnoButton.textContent = "Confirmar Turno"; // Restaurar texto del botón

            if (obraSocialValue === 'OSDE' && redirectUrl) {
                obraSocialInfoDiv.classList.add('bg-blue-100', 'text-blue-800', 'border', 'border-blue-300');
                obraSocialInfoDiv.innerHTML = `<i class="fas fa-info-circle text-blue-500 mr-2"></i> Para pacientes de OSDE, soliciten su turno directamente en su cartilla online:`;
                const osdeLink = document.createElement('a');
                osdeLink.href = redirectUrl;
                osdeLink.target = '_blank';
                osdeLink.rel = 'noopener noreferrer';
                osdeLink.className = 'font-bold underline ml-1 text-blue-700 hover:text-blue-900';
                osdeLink.textContent = 'Cartilla OSDE';
                obraSocialInfoDiv.appendChild(osdeLink);
                
                toggleFormFields(false); // Deshabilitar el resto del formulario
                // Habilitar solo el botón de submit para que pueda ser clickeado para la redirección
                if (confirmTurnoButton) {
                    confirmTurnoButton.disabled = false;
                    confirmTurnoButton.classList.remove('opacity-50', 'cursor-not-allowed'); // Asegurar que el botón se vea activo
                    confirmTurnoButton.textContent = "Ir a Cartilla OSDE"; // Cambiar texto del botón
                }
            } else if (copagoAmount) {
                obraSocialInfoDiv.classList.add('bg-yellow-100', 'text-yellow-800', 'border', 'border-yellow-300');
                obraSocialInfoDiv.innerHTML = `<i class="fas fa-exclamation-triangle text-yellow-600 mr-2"></i> Esta obra social tiene un copago de <strong>$${parseInt(copagoAmount).toLocaleString('es-AR')}</strong> por consulta.`;
            } else if (obraSocialValue === 'Particular') {
                 obraSocialInfoDiv.classList.add('bg-green-100', 'text-green-800', 'border', 'border-green-300');
                 obraSocialInfoDiv.innerHTML = `<i class="fas fa-dollar-sign text-green-600 mr-2"></i> Las consultas particulares tienen un costo. Ver <a href="#aranceles" class="font-bold underline text-green-700 hover:text-green-900">Aranceles y Coberturas</a>.`;
            } else {
                obraSocialInfoDiv.textContent = ''; // Vaciar si no hay mensaje específico
            }

            // Después de la lógica de obra social, cargar especialidades y disparar el cambio en doctorSelect
            cargarEspecialidadesSelect();
            if (selectDoctorTurno) {
                selectDoctorTurno.dispatchEvent(new Event('change'));
            }
        });
        // Llamada inicial para establecer el estado de los campos al cargar la página
        selectObraSocialTurno.dispatchEvent(new Event('change'));
    }

    // Cargar especialidades en el select de turnos
    function cargarEspecialidadesSelect() {
        if (!selectEspecialidadTurno) return;
        // Limpiar opciones existentes excepto la primera (placeholder)
        while (selectEspecialidadTurno.options.length > 1) {
            selectEspecialidadTurno.remove(1);
        }
        especialidadesParaTurnos.forEach(esp => {
            const option = document.createElement('option');
            option.value = esp.clave_js;
            option.textContent = esp.nombre;
            selectEspecialidadTurno.appendChild(option);
        });
    }
    
    if (selectEspecialidadTurno) {
        cargarEspecialidadesSelect(); // Cargar al inicio

        // Cargar doctores cuando se selecciona una especialidad
        selectEspecialidadTurno.addEventListener('change', function() {
            const especialidadKey = this.value;

            if (selectDoctorTurno) {
                while (selectDoctorTurno.options.length > 1) {
                    selectDoctorTurno.remove(1);
                }
                selectDoctorTurno.value = "";
                selectDoctorTurno.disabled = true;
            }

            if (horaSelect) {
                horaSelect.innerHTML = '<option value="">Seleccione una hora</option>';
                horaSelect.disabled = true;
            }
            
            if (especialidadKey && profesionalesData[especialidadKey] && selectDoctorTurno) {
                profesionalesData[especialidadKey].forEach(doc => {
                    const option = document.createElement('option');
                    option.value = doc.nombre;
                    option.textContent = doc.nombre;
                    selectDoctorTurno.appendChild(option);
                });
                selectDoctorTurno.disabled = false;
            }
            
            if (selectDoctorTurno) {
                selectDoctorTurno.dispatchEvent(new Event('change'));
            }
        });
    }

    // --- LÓGICA DEL ACORDEÓN (Aranceles y Coberturas) ---
    document.querySelectorAll('.accordion-item').forEach(item => {
        const header = item.querySelector('.accordion-header');
        if (header) {
            header.addEventListener('click', () => {
                const content = item.querySelector('.accordion-content');
                const icon = header.querySelector('.fa-chevron-down');

                if (content && icon) {
                    // Cierra todos los otros acordeones abiertos - Este loop es ahora menos relevante con un solo acordeón,
                    // pero no causa problemas y es una buena práctica si se añaden más en el futuro.
                    document.querySelectorAll('.accordion-item').forEach(otherItem => {
                        if (otherItem !== item) {
                            const otherContent = otherItem.querySelector('.accordion-content');
                            const otherIcon = otherItem.querySelector('.fa-chevron-down');
                            if (otherContent && otherIcon) {
                                otherContent.style.maxHeight = '0';
                                otherContent.classList.remove('open');
                                otherIcon.classList.remove('rotate-180');
                                otherItem.classList.remove('active');
                            }
                        }
                    });

                    // Abre o cierra el acordeón clickeado
                    if (content.style.maxHeight === '0px' || content.style.maxHeight === '') {
                        content.style.maxHeight = content.scrollHeight + 'px';
                        content.classList.add('open');
                        icon.classList.add('rotate-180');
                        item.classList.add('active');
                    } else {
                        content.style.maxHeight = '0';
                        content.classList.remove('open');
                        icon.classList.remove('rotate-180');
                        item.classList.remove('active');
                    }
                }
            });
        }
    });


    // --- ANIMACIONES AL SCROLL (Intersection Observer) ---
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% del elemento visible para disparar
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Si el elemento entra en la vista, añadimos la clase 'visible'
                // que activará la animación CSS.
                entry.target.classList.add('visible');
                // Dejar de observar si la animación solo debe ocurrir una vez
                // observer.unobserve(entry.target); // Descomentar si solo se anima una vez
            } else {
                // Si el elemento sale de la vista, podemos remover la clase 'visible'
                // para que la animación se reinicie cuando vuelva a entrar (si queremos).
                // entry.target.classList.remove('visible'); // Comentar si la animación es "one-shot"
            }
        });
    }, observerOptions);

    // Observar todos los elementos con la clase 'animate-on-scroll'
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // --- AÑO ACTUAL EN FOOTER ---
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

}); // Fin del primer DOMContentLoaded

// --- CAROUSEL (Explicación para Banner Rotativo) ---
// Para implementar un banner rotativo en la sección #hero,
// primero deberás modificar el HTML de la sección #hero
// para incluir múltiples imágenes. Por ejemplo:
/*
<section id="hero" class="hero-banner animate-on-scroll">
    <div class="carousel-inner">
        <div class="carousel-item active">
            <img src="img/hero-bg-1.jpg" alt="Imagen de Banner 1">
            <div class="hero-content container">
                <h1>Cuidado experto para toda la familia</h1>
                <p>Accede a nuestros especialistas...</p>
                <a href="#turnos" class="btn btn-primary">Solicitar Turno Online</a>
            </div>
        </div>
        <div class="carousel-item">
            <img src="img/hero-bg-2.jpg" alt="Imagen de Banner 2">
            <div class="hero-content container">
                <h1>Tu salud, nuestra prioridad</h1>
                <p>Atención personalizada en cada etapa de tu vida.</p>
                <a href="#turnos" class="btn btn-primary">Conocé más</a>
            </div>
        </div>
        // Puedes añadir más carousel-item aquí
    </div>
</section>
*/

// Luego, añadir la siguiente lógica JS para alternar las imágenes:
/*
document.addEventListener("DOMContentLoaded", () => {
    const carouselItems = document.querySelectorAll('.carousel-item');
    let currentIndex = 0;

    function showNextItem() {
        if (carouselItems.length === 0) return;

        // Ocultar el item actual
        carouselItems[currentIndex].classList.remove('active');
        carouselItems[currentIndex].style.opacity = 0; // Para animación de fundido

        // Calcular el siguiente índice
        currentIndex = (currentIndex + 1) % carouselItems.length;

        // Mostrar el siguiente item
        carouselItems[currentIndex].classList.add('active');
        carouselItems[currentIndex].style.opacity = 1; // Para animación de fundido
    }

    // Asegurarse de que solo el primer elemento sea visible al cargar
    if (carouselItems.length > 0) {
        carouselItems.forEach((item, index) => {
            if (index === 0) {
                item.classList.add('active');
                item.style.opacity = 1;
            } else {
                item.classList.remove('active');
                item.style.opacity = 0;
            }
        });
        // Iniciar el carrusel para cambiar cada 5 segundos (5000 ms)
        setInterval(showNextItem, 5000);
    }
});
*/

// Y los estilos CSS correspondientes en style.css:
/*
#hero {
    position: relative;
    overflow: hidden;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.carousel-inner {
    position: absolute;
    width: 100%;
    height: 100%;
}

.carousel-item {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: 0;
    transition: opacity 1.5s ease-in-out; // Transición de fundido
    display: flex; // Para centrar el contenido hero-content dentro de cada item
    align-items: center;
    justify-content: center;
    background-size: cover;
    background-position: center;
}

.carousel-item.active {
    opacity: 1;
    z-index: 1; // Asegura que el item activo esté arriba
}

.carousel-item img { // Si usas <img> directamente en lugar de background-image
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1; // Detrás del contenido
}

.carousel-item .hero-content {
    position: relative;
    z-index: 2; // Asegura que el texto esté sobre la imagen
    color: white; // Asegúrate de que el texto sea legible
    background: rgba(0, 0, 0, 0.4); // Fondo semitransparente para legibilidad
    padding: 30px;
    border-radius: 10px;
}
*/

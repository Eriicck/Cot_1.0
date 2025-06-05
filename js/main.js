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
        // o 'neurocirugia' si la clave_js debe coincidir con el data-especialidad del HTML
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
                            <div class="profesional-card">
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


    // --- LÓGICA DEL FORMULARIO DE TURNOS QUE PERMANECE EN MAIN.JS ---
    // (Poblar selects de Especialidad y Doctor)
    const selectEspecialidadTurno = document.getElementById('especialidad-turno');
    const selectDoctorTurno = document.getElementById('doctor-turno');
    const selectHoraTurno = document.getElementById('hora-turno'); // Necesario para limpiarlo aquí

    // Cargar especialidades en el select de turnos
    function cargarEspecialidadesSelect() {
        if (!selectEspecialidadTurno) return;
        // Limpiar opciones existentes excepto la primera (placeholder)
        while (selectEspecialidadTurno.options.length > 1) {
            selectEspecialidadTurno.remove(1);
        }
        especialidadesParaTurnos.forEach(esp => {
            const option = document.createElement('option');
            option.value = esp.clave_js; // Esta clave debe coincidir con las claves en profesionalesData
            // option.dataset.idDb = esp.id_db; // Puedes mantenerlo si lo usas en otro lado
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
                // Limpiar opciones de doctores excepto la primera (placeholder)
                while (selectDoctorTurno.options.length > 1) {
                    selectDoctorTurno.remove(1);
                }
                selectDoctorTurno.value = ""; // Resetear al placeholder
                selectDoctorTurno.disabled = true;
            }

            // Limpiar y deshabilitar horas (scripts.js se encargará de cargarlas)
            if (selectHoraTurno) {
                selectHoraTurno.innerHTML = '<option value="">Seleccione una hora</option>';
                selectHoraTurno.disabled = true;
            }
            
            // Limpiar y deshabilitar fecha (scripts.js se encargará de esto con Flatpickr)
            // No es necesario hacerlo explícitamente aquí si scripts.js maneja bien el estado
            // del input de fecha cuando cambia el doctor.

            if (especialidadKey && profesionalesData[especialidadKey] && selectDoctorTurno) {
                profesionalesData[especialidadKey].forEach(doc => {
                    const option = document.createElement('option');
                    // Usaremos el NOMBRE del doctor como value para consistencia con lo que
                    // scripts.js probablemente envíe al backend.
                    // Si tu backend espera un ID, entonces usa doc.id.
                    option.value = doc.nombre; // ENVIAR NOMBRE DEL DOCTOR
                    option.textContent = doc.nombre;
                    selectDoctorTurno.appendChild(option);
                });
                selectDoctorTurno.disabled = false;
            }
            
            // Disparar un evento 'change' en doctorSelect para que scripts.js (Flatpickr) reaccione
            // si el select de doctores se ha poblado y tiene un valor (aunque sea el placeholder)
            // Esto es para asegurar que la lógica de habilitar/deshabilitar fecha en scripts.js se ejecute.
            if (selectDoctorTurno) {
                selectDoctorTurno.dispatchEvent(new Event('change'));
            }
        });
    }

    /*
    // --- SECCIONES COMENTADAS PORQUE SERÁN MANEJADAS POR scripts.js (el de la raíz) ---

    // const inputFechaTurno = document.getElementById('fecha-turno'); // Ya no es necesario aquí

    // // Cargar horas disponibles (simulado) cuando se selecciona un doctor y fecha
    // // ESTA FUNCIÓN Y SUS LISTENERS DEBEN SER MANEJADOS POR scripts.js
    // function cargarHorasDisponibles() {
    //     if (!selectDoctorTurno || !inputFechaTurno || !selectHoraTurno) return;
    //     selectHoraTurno.innerHTML = '<option value="">Seleccione una hora disponible</option>';
    //     if(selectDoctorTurno.value && inputFechaTurno.value) {
    //         const horasMock = ["09:00", "09:30", "10:00", "10:30", "11:00", "15:00", "15:30", "16:00"];
    //         horasMock.forEach(hora => {
    //             const option = new Option(hora, hora);
    //             selectHoraTurno.add(option);
    //         });
    //         selectHoraTurno.disabled = false;
    //     } else {
    //         selectHoraTurno.disabled = true;
    //     }
    // }
    // if(selectDoctorTurno) selectDoctorTurno.addEventListener('change', cargarHorasDisponibles);
    // if(inputFechaTurno) inputFechaTurno.addEventListener('change', cargarHorasDisponibles);


    // // Envío del Formulario (simulado, luego irá al backend)
    // // ESTA SIMULACIÓN DEBE SER MANEJADA POR scripts.js CON EL FETCH REAL
    // const formTurnos = document.getElementById('form-turnos'); // ID incorrecto en el original, el real es 'form-turno'
    // const mensajeTurnoDiv = document.getElementById('mensaje-turno'); // Ya declarado arriba
    // if (formTurnos) { // Esta condición no se cumpliría por el ID incorrecto
    //     formTurnos.addEventListener('submit', async function(e) {
    //         e.preventDefault();
    //         if(mensajeTurnoDiv) mensajeTurnoDiv.textContent = 'Procesando solicitud...';
    //         const formData = new FormData(this);
    //         const data = Object.fromEntries(formData.entries());
    //         const selectedEspecialidadOption = selectEspecialidadTurno.options[selectEspecialidadTurno.selectedIndex];
    //         data.especialidad_id_db = selectedEspecialidadOption ? selectedEspecialidadOption.dataset.idDb : null;
    //         console.log("Datos a enviar (simulado desde main.js - ESTO NO DEBERÍA EJECUTARSE):", data);
    //         setTimeout(() => {
    //             // ... simulación ...
    //         }, 1500);
    //     });
    // }
    */

    // --- AÑO ACTUAL EN FOOTER ---
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

}); // Fin del primer DOMContentLoaded


// --- CAROUSEL ---
// (Mantenido con la corrección)
document.addEventListener("DOMContentLoaded", () => { // Segundo DOMContentLoaded (para el carrusel)
  const images = document.querySelectorAll('.carousel-image');
  let current = 0;

  function nextImage() {
    if (images.length === 0 || !images[current]) return; // Guardia
    images[current].classList.remove('active');
    current = (current + 1) % images.length;
    if (images[current]) { // Guardia
        images[current].classList.add('active');
    }
  }

  if (images.length > 0) {
    if (images[0] && !images[0].classList.contains('active')) {
        images[0].classList.add('active');
    }
    setInterval(nextImage, 4000);
  } else {
    console.warn("Advertencia en main.js: No se encontraron elementos con la clase '.carousel-image'. El carrusel no se iniciará.");
  }
});
// scripts.js (Archivo en la raíz del proyecto) - VERSIÓN CON DEBUG ADICIONAL

document.addEventListener('DOMContentLoaded', () => {
    // --- IDs de Elementos del DOM ---
    const formTurno = document.getElementById('form-turno');
    const obraSocialSelect = document.getElementById('obra-social-turno'); // Nuevo
    const especialidadSelect = document.getElementById('especialidad-turno');
    const doctorSelect = document.getElementById('doctor-turno');
    const fechaInput = document.getElementById('fecha-turno'); // Input para Flatpickr
    const horaSelect = document.getElementById('hora-turno');   // Select para las horas
    const nombrePacienteInput = document.getElementById('nombre-paciente');
    const dniPacienteInput = document.getElementById('dni-paciente');
    const emailPacienteInput = document.getElementById('email-paciente');
    const telefonoPacienteInput = document.getElementById('telefono-paciente');
    const mensajeTurnoDiv = document.getElementById('mensaje-turno');

    // --- URL DE TU GOOGLE APPS SCRIPT DESPLEGADO ---
    // ¡¡¡REEMPLAZA ESTO CON TU URL REAL Y ACTUALIZADA!!!
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzKbzC0A6oNzJJTkBgQmlN7eF0hySig0Knfzrks28uwh_IUWOtb6koGgft5FL--i-8Vow/exec';

    let flatpickrInstance = null; // Para mantener la instancia de Flatpickr

    // --- Días Feriados (para deshabilitar en el calendario) ---
    // Formato: 'YYYY-MM-DD'
    const HOLIDAYS = [
        '2025-01-01', // Año Nuevo
        '2025-03-24', // Día Nacional de la Memoria por la Verdad y la Justicia
        '2025-04-02', // Día del Veterano y de los Caídos en la Guerra de Malvinas
        '2025-04-18', // Viernes Santo (variable) - Ajustar anualmente
        '2025-05-01', // Día del Trabajador
        '2025-05-25', // Día de la Revolución de Mayo
        '2025-06-17', // Paso a la Inmortalidad del Gral. Don Martín Güemes
        '2025-06-20', // Paso a la Inmortalidad del Gral. Manuel Belgrano
        '2025-07-09', // Día de la Independencia
        '2025-08-18', // Paso a la Inmortalidad del Gral. José de San Martín (feriado trasladable)
        '2025-10-13', // Día del Respeto a la Diversidad Cultural (feriado trasladable)
        '2025-11-20', // Día de la Soberanía Nacional
        '2025-12-08', // Inmaculada Concepción de María
        '2025-12-25'  // Navidad
        // Agrega aquí los feriados para años futuros según sea necesario.
    ];

    // Función para deshabilitar sábados, domingos y feriados
    const disableWeekendsAndHolidays = (date) => {
        const day = date.getDay();
        // Deshabilitar sábados (6) y domingos (0)
        if (day === 0 || day === 6) {
            return true;
        }
        // Deshabilitar feriados
        const dateString = flatpickr.formatDate(date, "Y-m-d");
        return HOLIDAYS.includes(dateString);
    };


    // --- INICIALIZACIÓN DE FLATPICKR PARA EL CAMPO DE FECHA ---
    if (fechaInput) {
        console.log("[scripts.js] Input original ANTES de Flatpickr:", fechaInput.outerHTML);
        flatpickrInstance = flatpickr(fechaInput, {
            locale: "es",               // Idioma español
            dateFormat: "Y-m-d",        // Formato que se envía al backend (YYYY-MM-DD)
            altInput: true,             // Muestra un input formateado amigablemente
            altFormat: "j F, Y",        // Formato del input visible (ej: 15 Noviembre, 2023)
            minDate: "today",           // No permitir fechas pasadas
            disableMobile: "true",      // Opcional: usa Flatpickr en móviles en lugar del nativo
            clickOpens: true,           // Asegurar que se abra al hacer clic (default)
            disable: [disableWeekendsAndHolidays], // Aplica la función de deshabilitar

            onOpen: function(selectedDates, dateStr, instance) {
                console.log("[scripts.js] Flatpickr onOpen - Calendario abierto.");
            },
            onChange: function(selectedDates, dateStr, instance) {
                console.log("[scripts.js] Flatpickr onChange - Fecha seleccionada:", dateStr, "Nº Fechas:", selectedDates.length);
                if (selectedDates.length > 0 && dateStr) { // Solo cargar si hay una fecha real
                    cargarHorasDisponibles();
                } else {
                    if (horaSelect) {
                        horaSelect.innerHTML = '<option value="">Seleccione una hora</option>';
                        horaSelect.disabled = true;
                    }
                    console.log("[scripts.js] Flatpickr onChange - Fecha limpiada o inválida, horas limpiadas.");
                }
            },
            onClose: function(selectedDates, dateStr, instance){
                if(selectedDates.length === 0){ // Si se cierra sin seleccionar fecha
                     console.log("[scripts.js] Flatpickr onClose - Sin fecha seleccionada, horas limpiadas.");
                     if (horaSelect) {
                        horaSelect.innerHTML = '<option value="">Seleccione una hora</option>';
                        horaSelect.disabled = true;
                    }
                }
            }
        });
        console.log("[scripts.js] Flatpickr inicializado. Instancia:", flatpickrInstance);
        if (flatpickrInstance && flatpickrInstance.altInput) {
            console.log("[scripts.js] AltInput de Flatpickr (después de inicializar):", flatpickrInstance.altInput.outerHTML);
            // Asegurar que el altInput también esté deshabilitado si el original lo está
            if(fechaInput.disabled){
                 flatpickrInstance.altInput.disabled = true;
                 flatpickrInstance.altInput.placeholder = "Seleccione primero un doctor";
            }
        }
    } else {
        console.error("[scripts.js] CRÍTICO: No se encontró el input #fecha-turno para Flatpickr.");
    }

    // --- FUNCIÓN PARA HABILITAR/DESHABILITAR FLATPICKR (Y EL INPUT DE FECHA) BASADO EN EL DOCTOR ---
    function actualizarEstadoFechaInput() {
        console.log("[scripts.js] actualizarEstadoFechaInput llamada.");
        if (!doctorSelect || !fechaInput) {
            console.warn("[scripts.js] actualizarEstadoFechaInput: Faltan doctorSelect o fechaInput para lógica principal.");
            return;
        }
        if (!flatpickrInstance) {
             console.warn("[scripts.js] actualizarEstadoFechaInput: flatpickrInstance aún no está definido. El input de fecha puede no comportarse como se espera con Flatpickr.");
             // Intentar manejar el input original directamente si Flatpickr no está listo
             fechaInput.disabled = !(doctorSelect.value && doctorSelect.value !== "");
             if(fechaInput.disabled) fechaInput.placeholder = "Seleccione primero un doctor";
             else fechaInput.placeholder = "Seleccione una fecha";
             return;
        }

        if (doctorSelect.value && doctorSelect.value !== "") { // Si hay un doctor seleccionado
            console.log("[scripts.js] Doctor SELECCIONADO:", doctorSelect.value, "- Habilitando campo de fecha.");
            fechaInput.disabled = false; // Habilitar input original (importante para Flatpickr)
            if (flatpickrInstance.altInput) {
                flatpickrInstance.altInput.disabled = false;
                flatpickrInstance.altInput.placeholder = "Seleccione una fecha";
                console.log("[scripts.js] AltInput HABILITADO. HTML:", flatpickrInstance.altInput.outerHTML);
            }
            flatpickrInstance.set("clickOpens", true); // Permitir que se abra

            if (fechaInput.value) {
                // Ya no es necesario llamar a cargarHorasDisponibles aquí,
                // el onChange de Flatpickr lo hará si la fecha es válida
            }
        } else { // Si NO hay doctor seleccionado (o es el placeholder vacío)
            console.log("[scripts.js] Doctor NO seleccionado o valor vacío - Deshabilitando campo de fecha.");
            if (flatpickrInstance) flatpickrInstance.clear(); // Esto disparará onChange
            fechaInput.disabled = true;
            if (flatpickrInstance.altInput) {
                flatpickrInstance.altInput.disabled = true;
                flatpickrInstance.altInput.placeholder = "Seleccione primero un doctor";
                 console.log("[scripts.js] AltInput DESHABILITADO. HTML:", flatpickrInstance.altInput.outerHTML);
            }
            // flatpickrInstance.set("clickOpens", false); // Es mejor solo deshabilitar el input

            if (horaSelect) {
                horaSelect.innerHTML = '<option value="">Seleccione una hora</option>';
                horaSelect.disabled = true;
            }
        }
    }

    // Event listener para cuando cambia el doctor
    if (doctorSelect) {
        console.log("[scripts.js] Añadiendo event listener 'change' a doctorSelect.");
        doctorSelect.addEventListener('change', actualizarEstadoFechaInput);
        // Llamar después de un pequeño delay para asegurar que Flatpickr esté 100% listo
        // y que cualquier cambio inicial en doctorSelect (hecho por main.js) se procese.
        setTimeout(actualizarEstadoFechaInput, 50); // Pequeño delay
    } else {
        console.warn("[scripts.js] No se encontró doctorSelect para añadir event listener.");
        if(fechaInput) { // Si no hay doctorSelect, el campo de fecha debe permanecer deshabilitado
            fechaInput.disabled = true;
            if(flatpickrInstance && flatpickrInstance.altInput) {
                flatpickrInstance.altInput.disabled = true;
                flatpickrInstance.altInput.placeholder = "Funcionalidad de doctor no disponible";
            }
        }
    }


    // --- FUNCIÓN PARA CARGAR HORAS DISPONIBLES DESDE EL BACKEND ---
    function cargarHorasDisponibles() {
        console.log("[scripts.js] cargarHorasDisponibles llamada.");
        const doctorNombre = doctorSelect ? doctorSelect.value : null; // main.js ahora pone el NOMBRE en el value
        const fecha = fechaInput.value;
        
        console.log("[scripts.js] Cargando horas para Doctor:", doctorNombre, "Fecha:", fecha);

        if (horaSelect) {
            horaSelect.innerHTML = '<option value="">Cargando horas...</option>';
            horaSelect.disabled = true;
        }
        mensajeTurnoDiv.textContent = '';

        if (doctorNombre && fecha) { // Asegurarse que ambos tengan valor
            mensajeTurnoDiv.textContent = 'Consultando horarios...';
            mensajeTurnoDiv.className = 'info';

            const params = new URLSearchParams({
                action: 'getAvailableSlots',
                doctor: doctorNombre,
                fecha: fecha
            });

            fetch(`${SCRIPT_URL}?${params.toString()}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    mensajeTurnoDiv.textContent = '';
                    if (horaSelect) horaSelect.innerHTML = '<option value="">Seleccione una hora</option>';
                    
                    if (data.error) {
                        console.error("[scripts.js] Error desde Apps Script (getAvailableSlots):", data.error);
                        throw new Error(data.error);
                    }
                    if (Array.isArray(data) && data.length > 0) {
                        data.forEach(slot => {
                            const option = document.createElement('option');
                            option.value = slot.hora;
                            option.textContent = slot.hora;
                            if (horaSelect) horaSelect.appendChild(option);
                        });
                        if (horaSelect) horaSelect.disabled = false;
                    } else {
                        if (horaSelect) horaSelect.innerHTML = '<option value="">No hay horarios</option>';
                    }
                })
                .catch(error => {
                    console.error('[scripts.js] Error al cargar horas:', error);
                    mensajeTurnoDiv.textContent = `Error al cargar horarios: ${error.message}.`;
                    mensajeTurnoDiv.className = 'error';
                    if (horaSelect) horaSelect.innerHTML = '<option value="">Error al cargar</option>';
                });
        } else {
             if (horaSelect) {
                horaSelect.innerHTML = '<option value="">Seleccione fecha y doctor</option>';
                horaSelect.disabled = true;
            }
             console.log("[scripts.js] No se cargan horas: falta doctor o fecha.");
        }
    }

    // --- LÓGICA PARA ENVIAR EL FORMULARIO DE RESERVA ---
    if (formTurno) {
        formTurno.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("[scripts.js] Intento de envío de formulario.");

            const selectedObraSocialOption = obraSocialSelect ? obraSocialSelect.options[obraSocialSelect.selectedIndex] : null;
            const obraSocial = selectedObraSocialOption ? selectedObraSocialOption.value : '';
            const redirectUrl = selectedObraSocialOption ? selectedObraSocialOption.dataset.redirectUrl : null;

            // Manejar la redirección de OSDE
            if (obraSocial === 'OSDE' && redirectUrl) {
                // Si el usuario selecciona OSDE, redirigir directamente
                // No es necesario validar otros campos si la intención es solo redirigir
                mensajeTurnoDiv.textContent = 'Redirigiendo a la cartilla de OSDE...';
                mensajeTurnoDiv.className = 'info';
                // Usar un pequeño delay antes de redirigir para que el mensaje sea visible
                setTimeout(() => {
                    window.open(redirectUrl, '_blank'); // Abre en una nueva pestaña
                    mensajeTurnoDiv.textContent = 'Redirección completada.';
                    mensajeTurnoDiv.className = 'success';
                    formTurno.reset(); // Limpia el formulario después de la redirección
                }, 1000);
                return; // Detener el proceso de envío del formulario aquí
            }

            // Continuar con la lógica normal si no es OSDE
            const nombreDoctorSeleccionado = doctorSelect ? doctorSelect.value : ''; // main.js pone el NOMBRE aquí
            const nombreEspecialidadSeleccionada = especialidadSelect ? (especialidadSelect.options[especialidadSelect.selectedIndex]?.text || especialidadSelect.value) : '';

            const datosTurno = {
                action: 'reservarTurno',
                especialidad: nombreEspecialidadSeleccionada,
                doctor: nombreDoctorSeleccionado,
                fecha: fechaInput.value,
                hora: horaSelect ? horaSelect.value : '',
                nombrePaciente: nombrePacienteInput.value.trim(),
                dniPaciente: dniPacienteInput.value.trim(),
                emailPaciente: emailPacienteInput.value.trim(),
                telefonoPaciente: telefonoPacienteInput.value.trim(),
                obraSocial: obraSocial // Añadir la obra social aquí
            };
            console.log("[scripts.js] Datos a enviar para la reserva:", datosTurno);

            if (!datosTurno.especialidad || !datosTurno.doctor || !datosTurno.fecha || !datosTurno.hora ||
                !datosTurno.nombrePaciente || !datosTurno.dniPaciente || !datosTurno.emailPaciente || !datosTurno.obraSocial) {
                mensajeTurnoDiv.textContent = 'Por favor, complete todos los campos obligatorios (Obra Social, Especialidad, Doctor, Fecha, Hora, Nombre, DNI, Email).';
                mensajeTurnoDiv.className = 'error';
                console.warn("[scripts.js] Validación de formulario fallida:", datosTurno);
                return;
            }

            mensajeTurnoDiv.textContent = 'Procesando reserva...';
            mensajeTurnoDiv.className = 'info';

            fetch(SCRIPT_URL, {
                method: 'POST',
                body: new URLSearchParams(datosTurno).toString(),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log("[scripts.js] Respuesta del servidor al reservar:", data);
                if (data.status === "success") {
                    mensajeTurnoDiv.textContent = data.message;
                    mensajeTurnoDiv.className = 'success';
                    formTurno.reset();
                    if (flatpickrInstance) flatpickrInstance.clear();
                    
                    if (obraSocialSelect) obraSocialSelect.value = ""; // Resetear Obra Social
                    if (especialidadSelect) especialidadSelect.value = "";
                    if (doctorSelect) {
                        while (doctorSelect.options.length > 1) { doctorSelect.remove(1); }
                        doctorSelect.value = "";
                    }
                    actualizarEstadoFechaInput(); // Esto deshabilitará la fecha y limpiará horas
                } else {
                    mensajeTurnoDiv.textContent = `Error: ${data.message || "Respuesta no exitosa del servidor."}`;
                    mensajeTurnoDiv.className = 'error';
                }
            })
            .catch(error => {
                console.error('[scripts.js] Error al reservar turno (fetch catch):', error);
                mensajeTurnoDiv.textContent = `Error de comunicación al reservar: ${error.message}.`;
                mensajeTurnoDiv.className = 'error';
            });
        });
    }

    // Estilos básicos para los mensajes
    const style = document.createElement('style');
    style.textContent = `
        #mensaje-turno { padding: 10px; margin-top:15px; border-radius: 4px; border: 1px solid transparent; }
        #mensaje-turno.info { color: #004085; background-color: #cce5ff; border-color: #b8daff; }
        #mensaje-turno.success { color: #155724; background-color: #d4edda; border-color: #c3e6cb; }
        #mensaje-turno.warning { color: #856404; background-color: #fff3cd; border-color: #ffeeba; }
        #mensaje-turno.error { color: #721c24; background-color: #f8d7da; border-color: #f5c6cb; }
    `;
    document.head.appendChild(style);

}); // Fin de DOMContentLoaded

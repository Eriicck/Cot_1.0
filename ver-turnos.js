document.addEventListener('DOMContentLoaded', () => {
  const tablaTurnosBody = document.querySelector('#tabla-turnos tbody');

  async function cargarTurnos() {
    try {
      const res = await fetch('http://localhost:3000/api/turnos');
      const turnos = await res.json();
      tablaTurnosBody.innerHTML = '';
      turnos.forEach(turno => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${turno.nombre}</td>
          <td>${turno.email}</td>
          <td>${turno.telefono}</td>
          <td>${turno.fecha}</td>
          <td>${turno.hora}</td>
          <td>${turno.especialidad}</td>
          <td>${turno.medico}</td>
        `;
        tablaTurnosBody.appendChild(tr);
      });
    } catch (error) {
      console.error('Error al cargar turnos:', error);
    }
  }

  cargarTurnos();
});

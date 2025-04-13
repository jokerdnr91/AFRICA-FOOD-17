document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('fade-in');

  const links = document.querySelectorAll('nav a');
  const sections = document.querySelectorAll('section');

  function showSection(id) {
    sections.forEach(sec => {
      sec.classList.remove('active');
      if (sec.id === id) sec.classList.add('active');
    });
  }

  links.forEach(link => {
    const target = link.getAttribute('href').replace('#', '');
    link.addEventListener('click', (e) => {
      e.preventDefault();
      history.pushState(null, '', '#' + target);
      showSection(target);
      if (target === 'calendrier') loadReservations();
    });
  });

  const initial = location.hash.replace('#', '') || 'accueil';
  showSection(initial);

  const form = document.getElementById('reservationForm');
  const confirmation = document.getElementById('confirmationReservation');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const nom = document.getElementById('nomReservation').value;
    const email = document.getElementById('emailReservation').value;
    const date = document.getElementById('dateReservation').value;
    const heure = document.getElementById('heureReservation').value;

    const reservation = { title: nom, start: date + 'T' + heure };
    let reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    reservations.push(reservation);
    localStorage.setItem('reservations', JSON.stringify(reservations));

    confirmation.innerHTML = "<p>Réservation confirmée pour " + nom + ".</p>";
    form.reset();
  });

  const fideliteForm = document.getElementById('registerForm');
  const confirmationFid = document.getElementById('confirmationFidelite');

  fideliteForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const nom = document.getElementById('nomFidelite').value;
    const email = document.getElementById('emailFidelite').value;
    let clients = JSON.parse(localStorage.getItem('clients') || '[]');
    clients.push({ nom, email, points: 0 });
    localStorage.setItem('clients', JSON.stringify(clients));
    confirmationFid.innerHTML = "<p>Bienvenue, " + nom + " !</p>";
    fideliteForm.reset();
  });

  const searchBtn = document.getElementById('searchClientBtn');
  const searchInput = document.getElementById('searchClientInput');
  const resultBox = document.getElementById('clientResult');

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const search = searchInput.value.trim().toLowerCase();
      const clients = JSON.parse(localStorage.getItem('clients') || '[]');
      const found = clients.find(c => c.nom.toLowerCase() === search || c.email.toLowerCase() === search);
      if (found) {
        resultBox.innerHTML = `
          <p><strong>Nom :</strong> ${found.nom}</p>
          <p><strong>Email :</strong> ${found.email}</p>
          <p><strong>Points :</strong> <span id="pointsDisplay">${found.points}</span></p>
          <button id="addPoint">+ Ajouter 1 point</button>
          <button id="removePoint">– Retirer 1 point</button>
        `;
        document.getElementById('addPoint').addEventListener('click', () => {
          found.points += 1;
          updateClient(found);
        });
        document.getElementById('removePoint').addEventListener('click', () => {
          found.points = Math.max(0, found.points - 1);
          updateClient(found);
        });
      } else {
        resultBox.innerHTML = "<p>Aucun client trouvé.</p>";
      }
    });
  }

  function updateClient(updatedClient) {
    let clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const index = clients.findIndex(c => c.email === updatedClient.email);
    if (index !== -1) {
      clients[index] = updatedClient;
      localStorage.setItem('clients', JSON.stringify(clients));
      document.getElementById('pointsDisplay').innerText = updatedClient.points;
    }
  }

  const showAllClientsBtn = document.getElementById('showAllClients');
  const clientList = document.getElementById('clientList');

  if (showAllClientsBtn) {
    showAllClientsBtn.addEventListener('click', () => {
      const clients = JSON.parse(localStorage.getItem('clients') || '[]');
      clientList.innerHTML = '';
      if (clients.length === 0) {
        clientList.innerHTML = '<li>Aucun client enregistré.</li>';
      } else {
        clients.forEach(client => {
          const li = document.createElement('li');
          li.textContent = `${client.nom} (${client.email}) – ${client.points} point(s)`;
          clientList.appendChild(li);
        });
      }
    });
  }

  function loadReservations() {
    const calendarEl = document.getElementById('calendar');
    calendarEl.innerHTML = '';
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      locale: 'fr',
      height: 500,
      events: JSON.parse(localStorage.getItem('reservations') || '[]')
    });
    calendar.render();
  }

  if (initial === 'calendrier') loadReservations();
});

const body = document.querySelector('body');
const menuButton = document.querySelector('.button-ghost');
const searchInput = document.querySelector('#searchProduct');

// Check admin session
window.addEventListener('load', () => {
  const isAdminLogged = sessionStorage.getItem('adminLogged');
  if (!isAdminLogged) {
    window.location.href = 'login.html';
    return;
  }

  setupDashboard();
  loadReservations();
  loadClients();
});

function setupDashboard() {
  // Setup logo click to go back
  const logo = document.querySelector('.brand');
  if (logo) {
    logo.style.cursor = 'pointer';
    logo.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  // Logout button in profile card
  const profileCard = document.querySelector('.profile-card');
  if (profileCard) {
    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Déconnexion';
    logoutBtn.style.cssText = `
      width: 100%;
      background: rgba(255, 71, 87, 0.2);
      color: #ff4757;
      border: 1px solid rgba(255, 71, 87, 0.3);
      padding: 0.75rem;
      border-radius: 12px;
      cursor: pointer;
      margin-top: 1rem;
      font-weight: 600;
      transition: all 0.3s ease;
    `;
    logoutBtn.addEventListener('mouseover', () => {
      logoutBtn.style.background = 'rgba(255, 71, 87, 0.3)';
    });
    logoutBtn.addEventListener('mouseout', () => {
      logoutBtn.style.background = 'rgba(255, 71, 87, 0.2)';
    });
    logoutBtn.addEventListener('click', () => {
      sessionStorage.clear();
      window.location.href = 'login.html';
    });
    profileCard.appendChild(logoutBtn);
  }

  // Menu toggle
  menuButton?.addEventListener('click', () => {
    document.querySelector('.page')?.classList.toggle('collapsed-sidebar');
  });
}

function loadReservations() {
  const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
  
  if (reservations.length === 0) {
    const tbody = document.querySelector('tbody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999; padding: 2rem;">Aucune réservation pour le moment</td></tr>';
    }
    return;
  }

  const tbody = document.querySelector('tbody');
  if (tbody) {
    tbody.innerHTML = reservations.reverse().map(res => {
      const clientName = res.clientEmail || 'Client anonyme';
      return `
        <tr class="reservation-row">
          <td><strong class="product-name">${res.items.map(i => i.name).join(', ')}</strong></td>
          <td><span class="client-name">${clientName}</span></td>
          <td>${res.date}</td>
          <td><span class="status-pill status-pending reservation-status">${res.status}</span></td>
          <td>${res.total.toLocaleString('fr-FR')} €</td>
        </tr>
      `;
    }).join('');
  }

  // Update stats
  const totalReservations = reservations.length;
  const totalProducts = reservations.reduce((sum, res) => sum + res.items.length, 0);
  const totalRevenue = reservations.reduce((sum, res) => sum + res.total, 0);

  const statCards = document.querySelectorAll('.stat-card strong');
  if (statCards[0]) statCards[0].textContent = totalReservations;
  if (statCards[1]) statCards[1].textContent = totalProducts;
  if (statCards[3]) statCards[3].textContent = totalRevenue.toLocaleString('fr-FR') + ' €';
}

function loadClients() {
  const searchInput = document.querySelector('#searchClient');
  if (!searchInput) return;

  const renderClients = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const tbody = document.getElementById('clients-tbody');
    
    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #999; padding: 2rem;">Aucun client inscrit</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(user => {
      const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
      const userReservations = reservations.filter(r => r.clientId == user.id);
      return `
        <tr data-client-row="${user.id}">
          <td><strong class="client-name-cell">${user.name}</strong></td>
          <td><span class="client-email-cell">${user.email}</span></td>
          <td>${user.phone || '-'}</td>
          <td>${user.createdAt}</td>
          <td><span class="status-pill status-confirmed">${user.status}</span></td>
          <td>
            <button onclick="viewClientDetails(${user.id})" style="background: var(--primary); color: var(--dark); border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9rem;">Détails</button>
          </td>
        </tr>
      `;
    }).join('');
  };

  renderClients();

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('[data-client-row]').forEach((row) => {
      const name = row.querySelector('.client-name-cell')?.textContent.toLowerCase() || '';
      const email = row.querySelector('.client-email-cell')?.textContent.toLowerCase() || '';
      const show = name.includes(query) || email.includes(query);
      row.style.display = show ? '' : 'none';
    });
  });
}

function viewClientDetails(clientId) {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.id == clientId);
  const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
  const clientReservations = reservations.filter(r => r.clientId == clientId);
  const totalSpent = clientReservations.reduce((s, r) => s + r.total, 0);

  alert(`Détails du client:\n\nNom: ${user.name}\nEmail: ${user.email}\nTéléphone: ${user.phone || 'N/A'}\nInscription: ${user.createdAt}\nReservations: ${clientReservations.length}\nTotal dépensé: ${totalSpent.toLocaleString('fr-FR')} €`);
}

// Search functionality
searchInput?.addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase();
  document.querySelectorAll('.reservation-row').forEach((row) => {
    const product = row.querySelector('.product-name')?.textContent.toLowerCase() || '';
    const client = row.querySelector('.client-name')?.textContent.toLowerCase() || '';
    const status = row.querySelector('.reservation-status')?.textContent.toLowerCase() || '';
    const show = product.includes(query) || client.includes(query) || status.includes(query);
    row.style.display = show ? '' : 'none';
  });
});

// Go to site button
const btnNewReservation = document.querySelector('.button-primary');
if (btnNewReservation) {
  btnNewReservation.addEventListener('click', () => {
    window.location.href = 'products.html';
  });
}

// Refresh data periodically
setInterval(() => {
  loadReservations();
  loadClients();
}, 5000);
(() => {
  const page = document.querySelector('[data-player-slug]');
  if (!page) return;

  const player = window.CRRIHC_ROSTER?.[page.dataset.playerSlug];
  if (!player) return;

  const image = document.querySelector('.player-profile-image');
  const isPlaceholder = player.photo === 'temp-player-image.png';
  image.src = `../../../assets/${player.photo}`;
  image.alt = `${player.name} — Chester Road Reapers`;
  image.classList.toggle('is-placeholder', isPlaceholder);

  document.title = `${player.name} - Chester Road Reapers`;
  document.querySelector('.player-profile-name').textContent = player.name;
  document.querySelector('.player-profile-role').textContent = player.role;
  document.querySelector('.player-profile-description').textContent = player.description;
  const number = document.querySelector('.player-profile-number');
  number.textContent = player.number ? `#${player.number}` : 'NUMBER TBC';

  const statNames = {
    GP: 'Games played', G: 'Goals', A: 'Assists', P: 'Points',
    GA: 'Goals against', GAA: 'Goals against average', SO: 'Shutouts'
  };
  const statsGrid = document.querySelector('.player-stats-grid');
  for (const key of player.statLabels) {
    const card = document.createElement('div');
    card.className = 'player-stat-card';
    const label = document.createElement('span');
    label.textContent = statNames[key] || key;
    const value = document.createElement('strong');
    value.textContent = player.stats[key] ?? '—';
    card.append(label, value);
    statsGrid.append(card);
  }

  const careerBody = document.querySelector('.player-career-table tbody');
  if (careerBody) {
    const row = document.createElement('tr');
    const values = [
      'TBC', 'Chester Road Reapers', 'TBC',
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0
    ];
    for (const [index, value] of values.entries()) {
      const cell = document.createElement('td');
      cell.textContent = value;
      if (index > 2) cell.className = 'career-stat-value';
      row.append(cell);
    }
    careerBody.append(row);
  }
})();

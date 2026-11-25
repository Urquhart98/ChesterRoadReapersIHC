// Hide the implementation filename in published profile URLs.
if (/^https?:$/.test(window.location.protocol) && /\/index\.html$/.test(window.location.pathname)) {
  const cleanPath = window.location.pathname.replace(/index\.html$/, '');
  window.history.replaceState(window.history.state, '', `${cleanPath}${window.location.search}${window.location.hash}`);
}

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
  document.querySelector('.player-profile-role').textContent = player.position
    ? `${player.role} · ${player.position}`
    : player.role;
  document.querySelector('.player-profile-description').textContent = player.description;
  const profileDetails = document.createElement('dl');
  profileDetails.className = 'player-profile-details';
  for (const detail of player.profileDetails || []) {
    const row = document.createElement('div');
    row.className = 'player-profile-detail';
    const label = document.createElement('dt');
    label.textContent = detail.label;
    const value = document.createElement('dd');
    value.textContent = detail.value;
    row.append(label, value);
    profileDetails.append(row);
  }
  if (profileDetails.childElementCount) {
    document.querySelector('.player-profile-description').after(profileDetails);
  }
  if (player.song?.spotifyId) {
    const songPlayer = document.createElement('section');
    songPlayer.className = 'player-song-player';
    songPlayer.setAttribute('aria-label', `Favourite song: ${player.song.title} by ${player.song.artist}`);
    const songHeading = document.createElement('p');
    songHeading.className = 'player-song-heading';
    songHeading.textContent = 'PLAYER SOUNDTRACK';
    const songTitle = document.createElement('p');
    songTitle.className = 'player-song-title';
    songTitle.textContent = `${player.song.title} · ${player.song.artist}`;
    const spotify = document.createElement('iframe');
    spotify.title = `Spotify player: ${player.song.title} by ${player.song.artist}`;
    spotify.src = `https://open.spotify.com/embed/track/${encodeURIComponent(player.song.spotifyId)}?utm_source=generator&theme=0`;
    spotify.width = '100%';
    spotify.height = '80';
    spotify.loading = 'lazy';
    spotify.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    spotify.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    songPlayer.append(songHeading, songTitle, spotify);
    if (profileDetails.isConnected) profileDetails.after(songPlayer);
    else document.querySelector('.player-profile-description').after(songPlayer);
  }
  const number = document.querySelector('.player-profile-number');
  number.textContent = player.number ? `#${player.number}` : 'NUMBER TBC';
  if (player.position) number.setAttribute('title', `Playing position: ${player.position}`);

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

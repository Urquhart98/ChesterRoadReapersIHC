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
  const currentHockeyExperience = tracking => {
    if (!tracking?.baselineExperience || !tracking?.baselineDate) return tracking?.baselineExperience || '';
    const [year, month, day] = tracking.baselineDate.split('-').map(Number);
    const baseline = new Date(year, month - 1, day);
    const today = new Date();
    let elapsedMonths = (today.getFullYear() - baseline.getFullYear()) * 12 + today.getMonth() - baseline.getMonth();
    if (today.getDate() < baseline.getDate()) elapsedMonths -= 1;
    elapsedMonths = Math.max(0, elapsedMonths);
    if (!elapsedMonths) return tracking.baselineExperience;

    const match = tracking.baselineExperience.match(/^\s*(.*?)\s*(\d+)\s*(?:[–-]\s*(\d+)\s*)?(months?|years?)\s*$/i);
    if (!match) return tracking.baselineExperience;
    const [, qualifier, first, second, unit] = match;
    const toMonths = count => /^year/i.test(unit) ? Number(count) * 12 : Number(count);
    const formatMonths = total => {
      const years = Math.floor(total / 12);
      const months = total % 12;
      return [years ? `${years} year${years === 1 ? '' : 's'}` : '', months ? `${months} month${months === 1 ? '' : 's'}` : ''].filter(Boolean).join(' ');
    };
    const low = toMonths(first) + elapsedMonths;
    const high = second ? toMonths(second) + elapsedMonths : null;
    return `${qualifier ? `${qualifier.trim()} ` : ''}${formatMonths(low)}${high ? `–${formatMonths(high)}` : ''}`;
  };
  const profileDetails = document.createElement('dl');
  profileDetails.className = 'player-profile-details';
  for (const detail of player.profileDetails || []) {
    const row = document.createElement('div');
    row.className = 'player-profile-detail';
    const label = document.createElement('dt');
    label.textContent = detail.label;
    const value = document.createElement('dd');
    value.textContent = detail.label.trim().toLowerCase() === 'hockey experience'
      ? currentHockeyExperience(player.experienceTracking || { baselineExperience: detail.value })
      : detail.value;
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

  const highlights = document.createElement('section');
  highlights.className = 'player-highlights';
  highlights.setAttribute('aria-labelledby', 'player-highlights-title');

  const highlightsHeader = document.createElement('div');
  highlightsHeader.className = 'player-highlights-heading';
  const headingCopy = document.createElement('div');
  const eyebrow = document.createElement('p');
  eyebrow.className = 'section-label';
  const eyebrowRule = document.createElement('i');
  eyebrow.append(eyebrowRule, document.createTextNode(' PLAYER HIGHLIGHTS'));
  const highlightsTitle = document.createElement('h2');
  highlightsTitle.id = 'player-highlights-title';
  highlightsTitle.append(document.createTextNode('Highlights '));
  const highlightsAccent = document.createElement('em');
  highlightsAccent.textContent = 'reel.';
  highlightsTitle.append(highlightsAccent);
  headingCopy.append(eyebrow, highlightsTitle);
  const highlightsIntro = document.createElement('p');
  highlightsIntro.className = 'player-highlights-intro';
  highlightsIntro.textContent = 'Photos and video moments from the season.';
  highlightsHeader.append(headingCopy, highlightsIntro);
  highlights.append(highlightsHeader);

  const highlightItems = (player.highlights || []).filter(item => item?.src && ['image', 'video'].includes(item.type));
  if (highlightItems.length) {
    const highlightsGrid = document.createElement('div');
    highlightsGrid.className = 'player-highlights-grid';
    for (const item of highlightItems) {
      const card = document.createElement('figure');
      card.className = 'player-highlight-card';
      const media = document.createElement('div');
      media.className = 'player-highlight-media';
      const source = /^(?:https?:)?\/\//i.test(item.src) ? item.src : `../../../${item.src.replace(/^\/+/, '')}`;
      if (item.type === 'video') {
        const video = document.createElement('video');
        video.controls = true;
        video.playsInline = true;
        video.preload = 'metadata';
        if (item.poster) video.poster = /^(?:https?:)?\/\//i.test(item.poster) ? item.poster : `../../../${item.poster.replace(/^\/+/, '')}`;
        const videoSource = document.createElement('source');
        videoSource.src = source;
        video.append(videoSource);
        media.append(video);
      } else {
        const photo = document.createElement('img');
        photo.src = source;
        photo.alt = item.alt || item.title || `${player.name} highlight`;
        photo.loading = 'lazy';
        media.append(photo);
      }
      card.append(media);
      if (item.title || item.caption) {
        const caption = document.createElement('figcaption');
        if (item.title) {
          const title = document.createElement('strong');
          title.textContent = item.title;
          caption.append(title);
        }
        if (item.caption) {
          const detail = document.createElement('span');
          detail.textContent = item.caption;
          caption.append(detail);
        }
        card.append(caption);
      }
      highlightsGrid.append(card);
    }
    highlights.append(highlightsGrid);
  } else {
    const emptyState = document.createElement('div');
    emptyState.className = 'player-highlights-empty';
    const emptyTitle = document.createElement('strong');
    emptyTitle.textContent = 'Highlights coming soon';
    const emptyCopy = document.createElement('span');
    emptyCopy.textContent = 'Player photos and videos will appear here.';
    emptyState.append(emptyTitle, emptyCopy);
    highlights.append(emptyState);
  }

  const rosterBackLink = document.querySelector('.player-statistics .directory-back');
  if (rosterBackLink) rosterBackLink.before(highlights);
  else document.querySelector('.player-statistics .wrap')?.append(highlights);
})();

(() => {
  const audio = document.querySelector('#heist-audio');
  const button = document.querySelector('#heist-toggle');
  const label = button?.querySelector('[data-heist-label]');
  const playIcon = button?.querySelector('[data-heist-icon="play"]');
  const pauseIcon = button?.querySelector('[data-heist-icon="pause"]');
  const status = document.querySelector('#heist-status');
  const cassette = document.querySelector('.sound-easter');
  if (!audio || !button || !label || !playIcon || !pauseIcon || !status || !cassette) return;

  let ended = false;
  const sync = () => {
    const playing = !audio.paused && !audio.ended;
    playIcon.hidden = playing;
    pauseIcon.hidden = !playing;
    cassette.classList.toggle('is-playing', playing);
    label.textContent = playing
      ? 'Mettre en pause'
      : ended ? 'Rejouer la bande' : audio.currentTime > 0 ? 'Reprendre la bande' : 'Lancer la bande';
  };

  button.addEventListener('click', () => {
    if (!audio.paused) { audio.pause(); return; }
    if (audio.ended) audio.currentTime = 0;
    ended = false;
    const playback = audio.play();
    if (playback && typeof playback.catch === 'function') {
      playback.catch(() => {
        status.textContent = 'La cassette ne démarre pas. Vérifie le son et réessaie.';
      });
    }
  });

  audio.addEventListener('play', () => {
    ended = false;
    sync();
    status.textContent = 'Lecture en cours. La bande garde ses secrets.';
  });
  audio.addEventListener('pause', () => {
    sync();
    if (!audio.ended && audio.currentTime > 0) status.textContent = 'Pause. Pas un mot.';
  });
  audio.addEventListener('ended', () => {
    ended = true;
    sync();
    status.textContent = 'Fin de bande. Aucun nom lâché.';
  });
})();

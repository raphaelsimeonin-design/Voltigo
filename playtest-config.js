// Pour utiliser un formulaire hébergé, renseigner formUrl : tous les CTA y mèneront.
// endpoint est une adresse publique de réception, jamais une clé privée.
const VOLTIGO_PLAYTEST = Object.freeze({
  formUrl: "",
  endpoint: "https://hook.eu1.make.com/4oj0keo8nwtq5lptokxxpfrie1ogno7a"
});
(() => {
  const form = document.querySelector('#playtest-form');
  const validUrl = value => {
    try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; }
    catch { return ''; }
  };
  const externalForm = validUrl(VOLTIGO_PLAYTEST.formUrl);
  if (externalForm) {
    document.querySelectorAll('[data-playtest]').forEach(link => { link.href = externalForm; });
    if (form) window.location.replace(externalForm);
    return;
  }
  if (!form) return;
  const endpoint = validUrl(VOLTIGO_PLAYTEST.endpoint);
  const button = form.querySelector('button[type="submit"]');
  const status = document.querySelector('#form-status');
  const originalLabel = button.innerHTML;
  let pending = false, complete = false;
  const showStatus = (text, kind) => {
    status.textContent = text;
    status.dataset.kind = kind;
    status.hidden = false;
    status.focus();
  };
  if (!endpoint) {
    button.disabled = true;
    showStatus('L’inscription n’est pas encore disponible. Reviens un peu plus tard.', 'error');
  } else form.action = endpoint;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!endpoint || pending || complete || !form.reportValidity()) return;
    pending = true;
    button.disabled = true;
    button.textContent = 'Envoi en cours…';
    form.setAttribute('aria-busy', 'true');
    status.hidden = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const fields = new FormData(form);
      const body = new URLSearchParams();
      for (const [key, value] of fields) body.append(key, String(value).trim());
      const response = await fetch(endpoint, {
        method: 'POST', body, signal: controller.signal,
        credentials: 'omit', referrerPolicy: 'no-referrer'
      });
      if (!response.ok) {
        showStatus(response.status === 429
          ? 'Beaucoup de complices se présentent en même temps. Patiente un peu avant de réessayer.'
          : 'L’envoi a été refusé. Ton inscription n’est pas confirmée. Réessaie un peu plus tard.', 'error');
        return;
      }
      complete = true;
      window.location.replace('merci.html');
    } catch {
      // Une coupure réseau ne permet pas de savoir si le serveur a reçu le POST.
      // Ne pas annoncer un succès ni relancer automatiquement la requête.
      showStatus('Impossible de confirmer la réception. Vérifie ta connexion avant de réessayer. Si tu as déjà reçu une confirmation, inutile de renvoyer.', 'error');
    } finally {
      clearTimeout(timeout);
      pending = false;
      form.setAttribute('aria-busy', 'false');
      if (!complete) { button.disabled = false; button.innerHTML = originalLabel; }
    }
  });
})();

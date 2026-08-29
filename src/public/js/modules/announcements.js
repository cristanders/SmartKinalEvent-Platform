/**
 * Live Broadcasts & Announcement JS Module (Corporate Theme)
 * Handles broadcasting alerts, WebSocket listeners, and rendering live announcement logs.
 */

window.AnnouncementsModule = (function() {

  function init() {
    bindForm();
    loadAnnouncements();
  }

  function bindForm() {
    const form = document.getElementById('form-broadcast');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        title: document.getElementById('broad-title').value.trim(),
        category: document.getElementById('broad-category').value,
        message: document.getElementById('broad-message').value.trim(),
        author: 'Organizer'
      };

      try {
        const res = await fetch('/api/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to publish broadcast');
        }

        window.App.showToast('Broadcast published to all participants!', 'success');
        form.reset();
        loadAnnouncements();
      } catch (err) {
        window.App.showToast(err.message, 'error');
      }
    });
  }

  async function loadAnnouncements() {
    try {
      const res = await fetch('/api/announcements');
      const data = await res.json();
      if (data.success) {
        renderFeed(data.data);
      }
    } catch (err) {
      console.error('Announcements load error', err);
    }
  }

  function renderFeed(items = []) {
    const feed = document.getElementById('announcements-feed');
    const badge = document.getElementById('announcement-count-badge');
    if (!feed) return;

    if (badge) badge.textContent = `${items.length} Active Broadcasts`;

    if (items.length === 0) {
      feed.innerHTML = '<p class="text-xs text-slate-500">No broadcasts published yet.</p>';
      return;
    }

    feed.innerHTML = items.map(item => renderBroadcastCard(item)).join('');
  }

  function renderBroadcastCard(item) {
    let catBadge = 'bg-blue-50 text-blue-700 border-blue-200';
    let icon = 'fa-circle-info';

    if (item.category === 'Urgent') {
      catBadge = 'bg-red-50 text-red-700 border-red-200';
      icon = 'fa-triangle-exclamation';
    } else if (item.category === 'Workshop') {
      catBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      icon = 'fa-chalkboard-user';
    } else if (item.category === 'Schedule') {
      catBadge = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      icon = 'fa-clock';
    }

    const formattedTime = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `
      <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 shadow-xs">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${catBadge}">
              <i class="fa-solid ${icon} mr-1" aria-hidden="true"></i> ${item.category}
            </span>
            <span class="text-xs font-semibold text-slate-600">${item.author || 'Organizer'}</span>
          </div>
          <span class="text-[11px] font-mono text-slate-500">${formattedTime}</span>
        </div>
        
        <h4 class="font-bold text-slate-900 text-sm">${item.title}</h4>
        <p class="text-xs text-slate-700 leading-relaxed">${item.message}</p>
      </div>
    `;
  }

  function onNewBroadcast(broadcast) {
    const feed = document.getElementById('announcements-feed');
    if (feed) {
      const html = renderBroadcastCard(broadcast);
      feed.insertAdjacentHTML('afterbegin', html);
    }
  }

  return {
    init,
    loadAnnouncements,
    onNewBroadcast
  };
})();

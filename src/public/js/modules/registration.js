/**
 * Registration & Scanner Module (Corporate Theme)
 * Manages participant registration, QR ticket generation, modal display,
 * and working check-in simulator validation.
 */

window.RegistrationModule = (function() {
  
  function init() {
    bindFormRegister();
    bindFormCheckIn();
    loadParticipants();
  }

  function bindFormRegister() {
    const form = document.getElementById('form-register');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const payload = {
        name: document.getElementById('reg-name').value.trim(),
        email: document.getElementById('reg-email').value.trim(),
        role: document.getElementById('reg-role').value,
        skills: document.getElementById('reg-skills').value,
        interests: document.getElementById('reg-interests').value,
        bio: document.getElementById('reg-bio').value.trim()
      };

      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Registration failed');
        }

        window.App.showToast('Registration successful! Badge generated.', 'success');
        form.reset();
        
        // Show QR Ticket Modal
        showTicketModal(data.data.participant, data.data.qrDataUrl);
        loadParticipants();
      } catch (err) {
        window.App.showToast(err.message, 'error');
      }
    });
  }

  function bindFormCheckIn() {
    const form = document.getElementById('form-checkin');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const identifier = document.getElementById('checkin-input').value.trim();
      if (!identifier) return;

      await processCheckIn(identifier);
    });
  }

  async function processCheckIn(identifier) {
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });

      const data = await res.json();
      const box = document.getElementById('checkin-result-box');

      if (!res.ok || !data.success) {
        box.className = 'p-4 rounded-lg border border-red-200 bg-red-50 text-red-900 text-xs space-y-1 block';
        box.innerHTML = `
          <div class="font-bold flex items-center space-x-2 text-red-700">
            <i class="fa-solid fa-circle-xmark text-sm"></i>
            <span>Check-in Failed</span>
          </div>
          <p>${data.error || 'Invalid code or participant not found'}</p>
        `;
        return;
      }

      const p = data.participant;
      box.className = 'p-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs space-y-1 block';
      box.innerHTML = `
        <div class="font-bold text-xs flex items-center space-x-2 text-emerald-700">
          <i class="fa-solid fa-circle-check"></i>
          <span>${data.alreadyCheckedIn ? 'Already Checked In' : 'Check-in Verified!'}</span>
        </div>
        <p class="font-bold text-slate-900 text-sm">${p.name} (${p.role})</p>
        <p class="text-slate-600">Email: ${p.email}</p>
        <p class="font-mono text-blue-700 text-[11px]">Badge: ${p.qrCode}</p>
      `;

      window.App.showToast(`${p.name} check-in verified!`, 'success');
      loadParticipants();
    } catch (err) {
      window.App.showToast(err.message, 'error');
    }
  }

  function showTicketModal(participant, qrDataUrl) {
    const modal = document.getElementById('modal-ticket');
    const qrImg = document.getElementById('modal-qr-image');
    const qrText = document.getElementById('modal-qr-code-text');
    const details = document.getElementById('modal-user-details');
    const simBtn = document.getElementById('btn-sim-checkin-from-modal');

    qrImg.src = qrDataUrl;
    qrText.textContent = participant.qrCode;

    details.innerHTML = `
      <p class="text-slate-700"><strong class="text-slate-900">Name:</strong> ${participant.name}</p>
      <p class="text-slate-700"><strong class="text-slate-900">Email:</strong> ${participant.email}</p>
      <p class="text-slate-700"><strong class="text-slate-900">Role:</strong> <span class="text-blue-600 font-semibold">${participant.role}</span></p>
      <p class="text-slate-700"><strong class="text-slate-900">Status:</strong> <span class="${participant.checkedIn ? 'text-emerald-700 font-bold' : 'text-amber-700 font-semibold'}">${participant.checkedIn ? 'Checked In' : 'Registered (Pending Scan)'}</span></p>
    `;

    simBtn.onclick = async () => {
      await processCheckIn(participant.qrCode);
      window.App.closeModal('modal-ticket');
    };

    window.App.openModal('modal-ticket');
  }

  async function loadParticipants() {
    try {
      const res = await fetch('/api/participants');
      const data = await res.json();
      if (data.success) {
        renderQuickBadges(data.data);
      }
    } catch (err) {
      console.error('Failed to load participants', err);
    }
  }

  function renderQuickBadges(participants) {
    const container = document.getElementById('quick-badge-list');
    if (!container) return;

    if (participants.length === 0) {
      container.innerHTML = '<p class="text-xs text-slate-500">No participants registered yet.</p>';
      return;
    }

    container.innerHTML = participants.slice(0, 5).map(p => `
      <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
        <div>
          <span class="font-bold text-slate-800">${p.name}</span>
          <span class="block text-[11px] text-slate-500 font-mono">${p.qrCode}</span>
        </div>
        <button onclick="RegistrationModule.triggerQuickScan('${p.qrCode}')"
          class="px-3 py-1.5 rounded text-xs font-semibold ${p.checkedIn ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 text-white'} transition-all shadow-sm">
          ${p.checkedIn ? 'Checked In' : 'Simulate Scan'}
        </button>
      </div>
    `).join('');
  }

  function triggerQuickScan(code) {
    document.getElementById('checkin-input').value = code;
    processCheckIn(code);
  }

  return {
    init,
    loadParticipants,
    triggerQuickScan
  };
})();

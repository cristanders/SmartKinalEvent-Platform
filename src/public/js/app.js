/**
 * Main Client Application Entry Point (Corporate Theme)
 * Orchestrates WCAG accessible tab navigation, toasts, modal windows, and modules.
 */

window.App = (function() {
  
  document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initModals();
    
    // Initialize Socket.io Connection
    if (window.SocketClient) {
      window.SocketClient.init();
    }

    // Initialize Submodules
    if (window.RegistrationModule) window.RegistrationModule.init();
    if (window.MatchmakingModule) window.MatchmakingModule.init();
    if (window.AnnouncementsModule) window.AnnouncementsModule.init();
    if (window.JudgingModule) window.JudgingModule.init();
    if (window.AnalyticsModule) window.AnalyticsModule.init();

    console.log('[SmartKinalEventPlatform] Corporate UI initialized successfully.');
  });

  // WCAG Compliant Keyboard Navigation & Accessible Tabs
  function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        const targetId = btn.id.replace('tab-', '');
        switchTab(targetId);
      });

      btn.addEventListener('keydown', (e) => {
        let targetIndex = index;
        if (e.key === 'ArrowRight') {
          targetIndex = (index + 1) % tabBtns.length;
        } else if (e.key === 'ArrowLeft') {
          targetIndex = (index - 1 + tabBtns.length) % tabBtns.length;
        } else if (e.key === 'Home') {
          targetIndex = 0;
        } else if (e.key === 'End') {
          targetIndex = tabBtns.length - 1;
        } else {
          return;
        }
        e.preventDefault();
        tabBtns[targetIndex].focus();
        tabBtns[targetIndex].click();
      });
    });
  }

  function switchTab(targetId) {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
      const isSelected = btn.id === `tab-${targetId}`;
      btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      btn.setAttribute('tabindex', isSelected ? '0' : '-1');

      if (isSelected) {
        btn.className = 'tab-btn px-4 py-3 text-xs font-semibold border-b-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-t-md flex items-center space-x-2 border-blue-500 text-blue-400 bg-slate-800/60';
      } else {
        btn.className = 'tab-btn px-4 py-3 text-xs font-semibold border-b-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-t-md flex items-center space-x-2 border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700';
      }
    });

    tabPanels.forEach(panel => {
      const isTarget = panel.id === `panel-${targetId}`;
      if (isTarget) {
        panel.classList.remove('hidden');
      } else {
        panel.classList.add('hidden');
      }
    });

    // Refresh module data if needed
    if (targetId === 'matchmaking' && window.MatchmakingModule) window.MatchmakingModule.fetchMatches();
    if (targetId === 'announcements' && window.AnnouncementsModule) window.AnnouncementsModule.loadAnnouncements();
    if (targetId === 'judging' && window.JudgingModule) window.JudgingModule.loadProjects();
    if (targetId === 'analytics' && window.AnalyticsModule) window.AnalyticsModule.loadAnalytics();
  }

  // Toast Notification System (Corporate Styling)
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    
    let badgeClass = 'bg-slate-900 border-slate-800 text-white';
    let icon = 'fa-circle-info text-blue-400';

    if (type === 'success') {
      badgeClass = 'bg-slate-900 border-slate-800 text-white';
      icon = 'fa-circle-check text-emerald-400';
    } else if (type === 'error') {
      badgeClass = 'bg-slate-900 border-slate-800 text-white';
      icon = 'fa-circle-xmark text-red-400';
    }

    toast.className = `p-4 rounded-lg border ${badgeClass} shadow-xl flex items-center space-x-3 text-xs pointer-events-auto transition-all transform translate-y-2 opacity-0 duration-200`;
    toast.innerHTML = `
      <i class="fa-solid ${icon} text-base"></i>
      <span class="flex-1 font-semibold">${message}</span>
    `;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    // Auto dismiss
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 200);
    }, 4000);
  }

  // Modal Dialog System
  function initModals() {
    const closeBtn = document.getElementById('btn-close-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeModal('modal-ticket'));
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal('modal-ticket');
      }
    });
  }

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      const closeBtn = modal.querySelector('button');
      if (closeBtn) closeBtn.focus();
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  return {
    switchTab,
    showToast,
    openModal,
    closeModal
  };
})();

/**
 * Socket.io Client Connection Manager
 * Manages WebSocket real-time event listeners and connection indicators.
 */

window.SocketClient = (function() {
  let socket = null;

  function init() {
    if (typeof io !== 'undefined') {
      socket = io();

      socket.on('connect', () => {
        console.log('[Socket.io Client] Connected with ID:', socket.id);
        const statusEl = document.getElementById('connection-status');
        if (statusEl) statusEl.textContent = 'Live Connected';
      });

      socket.on('disconnect', () => {
        console.warn('[Socket.io Client] Disconnected');
        const statusEl = document.getElementById('connection-status');
        if (statusEl) statusEl.textContent = 'Reconnecting...';
      });

      // Listen for Live Broadcast announcements
      socket.on('announcement:new', (broadcast) => {
        console.log('[Socket.io Client] New Broadcast:', broadcast);
        if (window.AnnouncementsModule && window.AnnouncementsModule.onNewBroadcast) {
          window.AnnouncementsModule.onNewBroadcast(broadcast);
        }
        if (window.App && window.App.showToast) {
          window.App.showToast(`BROADCAST [${broadcast.category}]: ${broadcast.title}`, 'info');
        }
      });

      // Listen for Check-in events
      socket.on('checkin:success', (data) => {
        if (window.App && window.App.showToast) {
          window.App.showToast(`${data.participant.name} checked in!`, 'success');
        }
      });

      // Listen for Leaderboard updates
      socket.on('leaderboard:update', (leaderboardData) => {
        if (window.AnalyticsModule && window.AnalyticsModule.updateLeaderboard) {
          window.AnalyticsModule.updateLeaderboard(leaderboardData);
        }
      });

      // Listen for global Analytics updates
      socket.on('analytics:update', (analyticsData) => {
        if (window.AnalyticsModule && window.AnalyticsModule.updateAnalytics) {
          window.AnalyticsModule.updateAnalytics(analyticsData);
        }
      });
    } else {
      console.warn('[Socket.io Client] socket.io script not loaded.');
    }
  }

  function getSocket() {
    return socket;
  }

  return {
    init,
    getSocket
  };
})();

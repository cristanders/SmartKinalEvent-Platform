/**
 * Leaderboard & Organizer Analytics JS Module (Corporate Theme)
 * Manages live metrics cards, leaderboard sorting, category score progress bars,
 * and real-time activity event streams.
 */

window.AnalyticsModule = (function() {

  function init() {
    loadAnalytics();
  }

  async function loadAnalytics() {
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      if (data.success) {
        updateAnalytics(data.data);
      }
    } catch (err) {
      console.error('Analytics load error', err);
    }
  }

  function updateAnalytics(data) {
    if (!data) return;

    // 1. Metric Cards
    const m = data.metrics || {};
    document.getElementById('metric-registrations').textContent = m.totalRegistrations || 0;
    document.getElementById('metric-checkin-rate').textContent = `${m.checkInRate || 0}%`;
    document.getElementById('metric-checkedin-count').textContent = `${m.checkedInCount || 0} of ${m.totalRegistrations || 0} checked in`;
    
    document.getElementById('metric-team-rate').textContent = `${m.teamFormationRate || 0}%`;
    document.getElementById('metric-team-count').textContent = `${m.totalTeams || 0} Active Teams`;

    document.getElementById('metric-projects-evaluated').textContent = `${m.evaluatedProjects || 0} / ${m.submittedProjects || 0}`;

    // 2. Leaderboard Table
    if (data.leaderboard) {
      updateLeaderboard(data.leaderboard);
    }

    // 3. Category Score Averages
    if (data.categoryAverages) {
      renderCategoryBars(data.categoryAverages);
    }

    // 4. Activity Log Feed
    if (data.recentActivity) {
      renderActivityFeed(data.recentActivity);
    }
  }

  function updateLeaderboard(leaderboard = []) {
    const tbody = document.getElementById('leaderboard-table-body');
    if (!tbody) return;

    if (leaderboard.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="py-6 text-center text-xs text-slate-500">No project evaluations recorded yet.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = leaderboard.map(item => {
      let rankBadge = 'bg-slate-100 text-slate-600 border-slate-200';
      if (item.rank === 1) rankBadge = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
      if (item.rank === 2) rankBadge = 'bg-slate-200 text-slate-800 border-slate-300 font-bold';
      if (item.rank === 3) rankBadge = 'bg-amber-50 text-amber-800 border-amber-200 font-bold';

      const cat = item.categoryAverages || {};

      return `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="py-3.5 px-4">
            <span class="inline-flex items-center justify-center w-7 h-7 rounded-full border text-xs ${rankBadge}">
              #${item.rank}
            </span>
          </td>
          <td class="py-3.5 px-4">
            <div class="font-bold text-slate-900">${item.title}</div>
            <div class="text-xs text-slate-500">Team: ${item.teamName}</div>
          </td>
          <td class="py-3.5 px-4">
            <span class="px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              ${item.track}
            </span>
          </td>
          <td class="py-3.5 px-4 text-xs text-slate-600 font-medium">
            <i class="fa-solid fa-user-check text-blue-600 mr-1"></i> ${item.judgeCount} ${item.judgeCount === 1 ? 'Judge' : 'Judges'}
          </td>
          <td class="py-3.5 px-4">
            <div class="flex flex-wrap gap-1 text-[10px]">
              <span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">Inno: ${cat.innovation}</span>
              <span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">Tech: ${cat.techComplexity}</span>
              <span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">UI: ${cat.uiUx}</span>
            </div>
          </td>
          <td class="py-3.5 px-4 text-right">
            <span class="text-sm font-extrabold text-blue-600">
              ${item.totalScore.toFixed(1)} <span class="text-xs font-normal text-slate-400">/ 100</span>
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderCategoryBars(catAvg = {}) {
    const container = document.getElementById('category-breakdown-bars');
    if (!container) return;

    const categories = [
      { label: 'Innovation & Originality (25%)', val: catAvg.innovation || 0 },
      { label: 'Technical Complexity (25%)', val: catAvg.techComplexity || 0 },
      { label: 'UI/UX & Accessibility (20%)', val: catAvg.uiUx || 0 },
      { label: 'Potential Impact (15%)', val: catAvg.impact || 0 },
      { label: 'Presentation & Demo (15%)', val: catAvg.presentation || 0 }
    ];

    container.innerHTML = categories.map(c => {
      const pct = (c.val / 10) * 100;
      return `
        <div class="space-y-1">
          <div class="flex justify-between text-xs font-semibold text-slate-700">
            <span>${c.label}</span>
            <span class="text-blue-600 font-bold">${c.val.toFixed(1)} / 10</span>
          </div>
          <div class="w-full h-2 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
            <div class="h-full bg-blue-600 transition-all duration-500" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderActivityFeed(activities = []) {
    const feed = document.getElementById('activity-log-feed');
    if (!feed) return;

    if (activities.length === 0) {
      feed.innerHTML = '<p class="text-xs text-slate-500">No activity recorded yet.</p>';
      return;
    }

    feed.innerHTML = activities.map(act => {
      let icon = 'fa-bell text-blue-600';
      if (act.type === 'REGISTRATION') icon = 'fa-user-plus text-blue-600';
      if (act.type === 'CHECKIN') icon = 'fa-qrcode text-emerald-600';
      if (act.type === 'JUDGING') icon = 'fa-gavel text-amber-600';

      const timeStr = new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return `
        <div class="flex items-start space-x-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <div class="mt-0.5">
            <i class="fa-solid ${icon}"></i>
          </div>
          <div class="flex-1">
            <p class="text-slate-800 font-medium">${act.message}</p>
            <span class="text-[10px] text-slate-500 font-mono">${timeStr}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  return {
    init,
    loadAnalytics,
    updateAnalytics,
    updateLeaderboard
  };
})();

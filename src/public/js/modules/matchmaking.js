/**
 * Smart Matchmaking JS Module (Corporate Theme)
 * Fetches match recommendations, handles skill filters, and renders compatibility cards.
 */

window.MatchmakingModule = (function() {

  function init() {
    bindControls();
    fetchMatches();
  }

  function bindControls() {
    const btn = document.getElementById('btn-run-matchmaking');
    if (btn) {
      btn.addEventListener('click', fetchMatches);
    }
  }

  async function fetchMatches() {
    const role = document.getElementById('match-role-filter')?.value || 'All';
    const skill = document.getElementById('match-skill-filter')?.value.trim() || '';

    const params = new URLSearchParams();
    if (role !== 'All') params.append('role', role);
    if (skill) params.append('skill', skill);

    try {
      const res = await fetch(`/api/matchmaking?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        renderMatchGrid(data.matches);
      }
    } catch (err) {
      console.error('Matchmaking fetch error', err);
    }
  }

  function renderMatchGrid(matches = []) {
    const grid = document.getElementById('matchmaking-grid');
    if (!grid) return;

    if (matches.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full bg-white p-8 rounded-xl border border-slate-200 text-center space-y-3 shadow-sm">
          <i class="fa-solid fa-user-slash text-3xl text-slate-400"></i>
          <p class="text-sm font-semibold text-slate-800">No matching participants found</p>
          <p class="text-xs text-slate-500">Try adjusting your skill search or role filter options.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = matches.map(m => {
      const p = m.candidate;
      const score = m.matchScore;

      let scoreBadge = 'bg-emerald-50 border-emerald-200 text-emerald-700';
      if (score < 60) scoreBadge = 'bg-amber-50 border-amber-200 text-amber-700';
      if (score < 40) scoreBadge = 'bg-slate-100 border-slate-200 text-slate-600';

      return `
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between">
          <div class="space-y-3">
            
            <!-- Header with Match % Badge -->
            <div class="flex items-start justify-between">
              <div>
                <h3 class="font-bold text-base text-slate-900">${p.name}</h3>
                <span class="inline-block text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 mt-1">
                  ${p.role}
                </span>
              </div>
              <div class="text-right">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${scoreBadge}">
                  <i class="fa-solid fa-bolt text-[10px] mr-1"></i> ${score}% Match
                </span>
              </div>
            </div>

            <!-- Bio -->
            <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed">${p.bio || 'No bio summary provided.'}</p>

            <!-- Skills Breakdown -->
            <div class="space-y-2 pt-2 border-t border-slate-100">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Skills & Tech Stack</span>
              <div class="flex flex-wrap gap-1.5">
                ${p.skills.map(s => {
                  const isMatched = m.matchedSkills.includes(s);
                  return `
                    <span class="px-2 py-0.5 rounded text-[11px] font-medium ${isMatched ? 'bg-blue-50 border border-blue-200 text-blue-700 font-bold' : 'bg-slate-100 border border-slate-200 text-slate-600'}">
                      ${s} ${isMatched ? '✓' : ''}
                    </span>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Interests -->
            ${p.interests && p.interests.length ? `
              <div class="space-y-1">
                <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Interests</span>
                <p class="text-xs text-slate-600">${p.interests.join(', ')}</p>
              </div>
            ` : ''}

          </div>

          <!-- Action Button -->
          <div class="pt-4 border-t border-slate-100">
            <button onclick="MatchmakingModule.sendInvite('${p.name}')"
              class="w-full py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all flex items-center justify-center space-x-1.5">
              <i class="fa-solid fa-paper-plane text-xs"></i>
              <span>Send Team Invite</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function sendInvite(candidateName) {
    window.App.showToast(`Team invitation sent to ${candidateName}!`, 'success');
  }

  return {
    init,
    fetchMatches,
    sendInvite
  };
})();

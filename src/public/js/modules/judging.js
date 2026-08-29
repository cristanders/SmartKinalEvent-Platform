/**
 * Secure Judging Portal JS Module (Corporate Theme)
 * Handles project selection, 5-criteria rubric sliders, weighted calculation,
 * and submitting evaluation scores.
 */

window.JudgingModule = (function() {
  let selectedProjectId = null;

  function init() {
    bindSliders();
    bindForm();
    loadProjects();
  }

  function bindSliders() {
    const sliders = [
      { id: 'rubric-innovation', valId: 'val-innovation' },
      { id: 'rubric-tech', valId: 'val-tech' },
      { id: 'rubric-uiux', valId: 'val-uiux' },
      { id: 'rubric-impact', valId: 'val-impact' },
      { id: 'rubric-pres', valId: 'val-pres' }
    ];

    sliders.forEach(s => {
      const el = document.getElementById(s.id);
      const valEl = document.getElementById(s.valId);
      if (el && valEl) {
        el.addEventListener('input', () => {
          valEl.textContent = `${el.value} / 10`;
          calculateWeightedTotal();
        });
      }
    });
  }

  function calculateWeightedTotal() {
    const inno = Number(document.getElementById('rubric-innovation')?.value || 5);
    const tech = Number(document.getElementById('rubric-tech')?.value || 5);
    const uiux = Number(document.getElementById('rubric-uiux')?.value || 5);
    const impact = Number(document.getElementById('rubric-impact')?.value || 5);
    const pres = Number(document.getElementById('rubric-pres')?.value || 5);

    // Weights: Innovation (25%), Tech (25%), UI/UX (20%), Impact (15%), Presentation (15%)
    const weightedSum = (inno * 0.25) + (tech * 0.25) + (uiux * 0.20) + (impact * 0.15) + (pres * 0.15);
    const total100 = Math.round(weightedSum * 10 * 10) / 10;

    const totalEl = document.getElementById('rubric-calculated-total');
    if (totalEl) {
      totalEl.textContent = `${total100.toFixed(1)} / 100`;
    }
  }

  function bindForm() {
    const form = document.getElementById('form-judging-rubric');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const projectId = document.getElementById('judge-project-id').value;
      if (!projectId) {
        window.App.showToast('Please select a project to evaluate first.', 'error');
        return;
      }

      const payload = {
        projectId,
        judgeName: 'Dr. Aris Thorne (Judge)',
        rubric: {
          innovation: Number(document.getElementById('rubric-innovation').value),
          techComplexity: Number(document.getElementById('rubric-tech').value),
          uiUx: Number(document.getElementById('rubric-uiux').value),
          impact: Number(document.getElementById('rubric-impact').value),
          presentation: Number(document.getElementById('rubric-pres').value)
        },
        feedback: document.getElementById('rubric-feedback').value.trim()
      };

      try {
        const res = await fetch('/api/judging', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to submit score');
        }

        window.App.showToast(`Score submitted! Weighted Total: ${data.calculatedScore}/100`, 'success');
        form.reset();
        resetSliders();
        loadProjects();

        // Switch to Leaderboard to see real-time rank update
        if (window.App && window.App.switchTab) {
          setTimeout(() => window.App.switchTab('analytics'), 1000);
        }
      } catch (err) {
        window.App.showToast(err.message, 'error');
      }
    });
  }

  function resetSliders() {
    ['rubric-innovation', 'rubric-tech', 'rubric-uiux', 'rubric-impact', 'rubric-pres'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = 5;
    });
    ['val-innovation', 'val-tech', 'val-uiux', 'val-impact', 'val-pres'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '5 / 10';
    });
    calculateWeightedTotal();
  }

  async function loadProjects() {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success) {
        renderProjectList(data.data);
      }
    } catch (err) {
      console.error('Projects load error', err);
    }
  }

  function renderProjectList(projects = []) {
    const list = document.getElementById('judging-project-list');
    if (!list) return;

    if (projects.length === 0) {
      list.innerHTML = '<p class="text-xs text-slate-500">No project submissions available.</p>';
      return;
    }

    list.innerHTML = projects.map(proj => {
      const isSelected = selectedProjectId === proj.id;
      return `
        <div onclick="JudgingModule.selectProject('${proj.id}', '${proj.title.replace(/'/g, "\\'")}')"
          class="p-3.5 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-blue-50/80 border-blue-500 shadow-xs' : 'bg-slate-50 border-slate-200 hover:border-slate-300'} space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-blue-700">${proj.track}</span>
            <span class="text-[11px] text-slate-500 font-medium">${proj.teamName}</span>
          </div>
          <h4 class="font-bold text-slate-900 text-xs">${proj.title}</h4>
          <p class="text-[11px] text-slate-600 line-clamp-2">${proj.description}</p>
        </div>
      `;
    }).join('');

    // Auto select first project if none selected
    if (!selectedProjectId && projects.length > 0) {
      selectProject(projects[0].id, projects[0].title);
    }
  }

  function selectProject(id, title) {
    selectedProjectId = id;
    document.getElementById('judge-project-id').value = id;
    
    const header = document.getElementById('rubric-header');
    if (header) {
      header.querySelector('h3').textContent = `Evaluating: ${title}`;
    }

    loadProjects();
  }

  return {
    init,
    loadProjects,
    selectProject
  };
})();

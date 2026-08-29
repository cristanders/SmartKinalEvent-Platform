/**
 * Scoring & Leaderboard Engine (High Efficiency O(N) Aggregation)
 * Calculates weighted scores per rubric, aggregates scores across multiple judges,
 * breaks ties deterministically, and builds live leaderboard metrics.
 */

class ScoringEngine {
  constructor() {
    // Rubric weights according to evaluation matrix
    this.weights = {
      innovation: 0.25,     // 25%
      techComplexity: 0.25, // 25%
      uiUx: 0.20,           // 20%
      impact: 0.15,         // 15%
      presentation: 0.15    // 15%
    };
  }

  /**
   * Calculates weighted total score (0 - 100) for a single rubric entry.
   * @param {Object} rubric - { innovation, techComplexity, uiUx, impact, presentation }
   * @returns {number} Weighted score scaled to 100
   */
  calculateRubricScore(rubric) {
    if (!rubric) return 0;

    const innovation = Math.min(10, Math.max(0, Number(rubric.innovation) || 0));
    const techComplexity = Math.min(10, Math.max(0, Number(rubric.techComplexity) || 0));
    const uiUx = Math.min(10, Math.max(0, Number(rubric.uiUx) || 0));
    const impact = Math.min(10, Math.max(0, Number(rubric.impact) || 0));
    const presentation = Math.min(10, Math.max(0, Number(rubric.presentation) || 0));

    const rawWeightedSum = (
      innovation * this.weights.innovation +
      techComplexity * this.weights.techComplexity +
      uiUx * this.weights.uiUx +
      impact * this.weights.impact +
      presentation * this.weights.presentation
    );

    return Math.round(rawWeightedSum * 10 * 10) / 10;
  }

  /**
   * Aggregates judging scores for projects into sorted leaderboard ranks in O(P + S) linear time.
   * @param {Array} projects 
   * @param {Array} scores 
   * @returns {Array} Ranked Leaderboard array
   */
  generateLeaderboard(projects = [], scores = []) {
    // Group scores by projectId in O(S) linear time to eliminate nested array filtering
    const scoresByProject = new Map();
    scores.forEach(s => {
      let group = scoresByProject.get(s.projectId);
      if (!group) {
        group = [];
        scoresByProject.set(s.projectId, group);
      }
      group.push(s);
    });

    const projectStats = projects.map(proj => {
      const projScores = scoresByProject.get(proj.id) || [];
      
      if (projScores.length === 0) {
        return {
          id: proj.id,
          title: proj.title,
          teamName: proj.teamName || "Independent",
          track: proj.track || "General",
          repoUrl: proj.repoUrl,
          demoUrl: proj.demoUrl,
          judgeCount: 0,
          totalScore: 0,
          categoryAverages: {
            innovation: 0,
            techComplexity: 0,
            uiUx: 0,
            impact: 0,
            presentation: 0
          },
          evaluations: []
        };
      }

      let sumInnovation = 0;
      let sumTech = 0;
      let sumUiUx = 0;
      let sumImpact = 0;
      let sumPres = 0;
      let sumWeighted = 0;

      projScores.forEach(entry => {
        const weightedScore = this.calculateRubricScore(entry.rubric);
        sumWeighted += weightedScore;
        sumInnovation += Number(entry.rubric.innovation) || 0;
        sumTech += Number(entry.rubric.techComplexity) || 0;
        sumUiUx += Number(entry.rubric.uiUx) || 0;
        sumImpact += Number(entry.rubric.impact) || 0;
        sumPres += Number(entry.rubric.presentation) || 0;
      });

      const count = projScores.length;
      const avgTotal = Math.round((sumWeighted / count) * 10) / 10;

      return {
        id: proj.id,
        title: proj.title,
        teamName: proj.teamName || "Independent",
        track: proj.track || "General",
        repoUrl: proj.repoUrl,
        demoUrl: proj.demoUrl,
        judgeCount: count,
        totalScore: avgTotal,
        categoryAverages: {
          innovation: Math.round((sumInnovation / count) * 10) / 10,
          techComplexity: Math.round((sumTech / count) * 10) / 10,
          uiUx: Math.round((sumUiUx / count) * 10) / 10,
          impact: Math.round((sumImpact / count) * 10) / 10,
          presentation: Math.round((sumPres / count) * 10) / 10
        },
        evaluations: projScores
      };
    });

    // Sort by Total Score DESC, with tie breakers (Tech Complexity DESC, Innovation DESC)
    projectStats.sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      if (b.categoryAverages.techComplexity !== a.categoryAverages.techComplexity) {
        return b.categoryAverages.techComplexity - a.categoryAverages.techComplexity;
      }
      return b.categoryAverages.innovation - a.categoryAverages.innovation;
    });

    // Assign rank positions with tie handling
    let currentRank = 1;
    return projectStats.map((item, index) => {
      if (index > 0 && item.totalScore < projectStats[index - 1].totalScore) {
        currentRank = index + 1;
      }
      return {
        rank: currentRank,
        ...item
      };
    });
  }

  /**
   * Generates aggregated metrics for Organizer Dashboard.
   * @param {Object} dataStoreInstance 
   */
  generateOrganizerAnalytics(dataStoreInstance) {
    const participants = dataStoreInstance.getParticipants();
    const teams = dataStoreInstance.teams;
    const projects = dataStoreInstance.getProjects();
    const scores = dataStoreInstance.getJudgingScores();

    const totalRegistrations = participants.length;
    
    // Single pass accumulation for participant checkins and team membership (O(N) vs multiple .filter())
    let checkedInCount = 0;
    let participantsInTeams = 0;

    participants.forEach(p => {
      if (p.checkedIn) checkedInCount++;
      if (p.teamId !== null) participantsInTeams++;
    });

    const checkInRate = totalRegistrations > 0 ? Math.round((checkedInCount / totalRegistrations) * 100) : 0;
    const teamFormationRate = totalRegistrations > 0 ? Math.round((participantsInTeams / totalRegistrations) * 100) : 0;

    const leaderboard = this.generateLeaderboard(projects, scores);

    let globalCategoryAverages = {
      innovation: 0,
      techComplexity: 0,
      uiUx: 0,
      impact: 0,
      presentation: 0
    };

    const evaluatedProjects = leaderboard.filter(p => p.judgeCount > 0);
    if (evaluatedProjects.length > 0) {
      let sumInno = 0, sumTech = 0, sumUi = 0, sumImp = 0, sumPres = 0;
      evaluatedProjects.forEach(p => {
        sumInno += p.categoryAverages.innovation;
        sumTech += p.categoryAverages.techComplexity;
        sumUi += p.categoryAverages.uiUx;
        sumImp += p.categoryAverages.impact;
        sumPres += p.categoryAverages.presentation;
      });
      const len = evaluatedProjects.length;
      globalCategoryAverages = {
        innovation: Math.round((sumInno / len) * 10) / 10,
        techComplexity: Math.round((sumTech / len) * 10) / 10,
        uiUx: Math.round((sumUi / len) * 10) / 10,
        impact: Math.round((sumImp / len) * 10) / 10,
        presentation: Math.round((sumPres / len) * 10) / 10
      };
    }

    return {
      metrics: {
        totalRegistrations,
        checkedInCount,
        checkInRate,
        totalTeams: teams.length,
        teamFormationRate,
        submittedProjects: projects.length,
        evaluatedProjects: evaluatedProjects.length
      },
      categoryAverages: globalCategoryAverages,
      leaderboard,
      recentActivity: dataStoreInstance.getActivityLog()
    };
  }
}

module.exports = new ScoringEngine();

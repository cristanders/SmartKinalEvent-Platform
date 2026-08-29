const scoringEngine = require('../../src/services/scoringEngine');

describe('Scoring & Leaderboard Engine Unit Tests', () => {

  test('should calculate correct weighted rubric score scaled to 100', () => {
    // 10 across all criteria should equal 100
    const perfectRubric = {
      innovation: 10,
      techComplexity: 10,
      uiUx: 10,
      impact: 10,
      presentation: 10
    };
    expect(scoringEngine.calculateRubricScore(perfectRubric)).toBe(100);

    // 5 across all criteria should equal 50
    const halfRubric = {
      innovation: 5,
      techComplexity: 5,
      uiUx: 5,
      impact: 5,
      presentation: 5
    };
    expect(scoringEngine.calculateRubricScore(halfRubric)).toBe(50);
  });

  test('should sort leaderboard by total score descending and assign correct ranks', () => {
    const projects = [
      { id: 'proj-A', title: 'Project A', teamName: 'Team A', track: 'AI' },
      { id: 'proj-B', title: 'Project B', teamName: 'Team B', track: 'Web3' }
    ];

    const scores = [
      {
        id: 's-1',
        projectId: 'proj-A',
        judgeId: 'j-1',
        rubric: { innovation: 10, techComplexity: 10, uiUx: 10, impact: 10, presentation: 10 }
      },
      {
        id: 's-2',
        projectId: 'proj-B',
        judgeId: 'j-1',
        rubric: { innovation: 5, techComplexity: 5, uiUx: 5, impact: 5, presentation: 5 }
      }
    ];

    const leaderboard = scoringEngine.generateLeaderboard(projects, scores);
    expect(leaderboard.length).toBe(2);
    expect(leaderboard[0].id).toBe('proj-A');
    expect(leaderboard[0].rank).toBe(1);
    expect(leaderboard[0].totalScore).toBe(100);

    expect(leaderboard[1].id).toBe('proj-B');
    expect(leaderboard[1].rank).toBe(2);
    expect(leaderboard[1].totalScore).toBe(50);
  });
});

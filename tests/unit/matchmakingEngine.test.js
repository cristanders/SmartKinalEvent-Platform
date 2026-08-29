const matchmakingEngine = require('../../src/services/matchmakingEngine');

describe('Matchmaking Engine Unit Tests', () => {
  const seeker = {
    id: 'usr-1',
    name: 'Seeker',
    role: 'Team Lead',
    skills: ['Node.js', 'Express', 'TailwindCSS'],
    interests: ['Smart Cities', 'AI']
  };

  const candidateComplementary = {
    id: 'usr-2',
    name: 'Backend Dev',
    role: 'Backend Architect',
    skills: ['Node.js', 'Docker', 'PostgreSQL'],
    interests: ['Smart Cities']
  };

  const candidateIdentical = {
    id: 'usr-1',
    name: 'Self',
    role: 'Team Lead',
    skills: ['Node.js'],
    interests: []
  };

  test('should return 0 match score for self match', () => {
    const result = matchmakingEngine.calculateMatch(seeker, candidateIdentical);
    expect(result.score).toBe(0);
  });

  test('should calculate high match score for complementary skills and role synergy', () => {
    const result = matchmakingEngine.calculateMatch(seeker, candidateComplementary);
    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.matchedSkills).toContain('Node.js');
    expect(result.complementarySkills).toContain('Docker');
  });

  test('should correctly filter candidate list by role and skill', () => {
    const candidateList = [candidateComplementary, candidateIdentical];
    const filtered = matchmakingEngine.findMatches(seeker, candidateList, {
      roleFilter: 'Backend Architect',
      skillFilter: 'Docker'
    });

    expect(filtered.length).toBe(1);
    expect(filtered[0].candidate.id).toBe('usr-2');
  });
});

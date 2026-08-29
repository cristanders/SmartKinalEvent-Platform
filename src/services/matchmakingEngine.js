/**
 * Smart Team Matchmaking Engine (High Efficiency Optimization)
 * Evaluates skill complementarity, role synergy, and interest alignment
 * between participants and teams to calculate compatibility percentages.
 */

const ROLE_SYNERGY_MATRIX = Object.freeze({
  "Team Lead": ["Backend Architect", "AI/ML Developer", "UI/UX Designer", "Frontend Specialist"],
  "Frontend Specialist": ["Backend Architect", "AI/ML Developer", "UI/UX Designer"],
  "Backend Architect": ["Frontend Specialist", "UI/UX Designer", "AI/ML Developer"],
  "AI/ML Developer": ["Frontend Specialist", "Backend Architect", "UI/UX Designer"],
  "UI/UX Designer": ["Frontend Specialist", "Backend Architect", "AI/ML Developer"]
});

class MatchmakingEngine {
  /**
   * Calculate compatibility score (0-100%) between a seeker profile and a candidate participant.
   * @param {Object} seeker - Participant object or target search criteria
   * @param {Object} candidate - Candidate participant object
   * @param {Set<string>} [seekerSkillsSet] - Pre-computed lowercase seeker skills Set for O(1) lookups
   * @param {Set<string>} [seekerInterestsSet] - Pre-computed lowercase seeker interests Set for O(1) lookups
   * @returns {Object} { score: number, breakdown: Object, matchedSkills: Array, complementarySkills: Array }
   */
  calculateMatch(seeker, candidate, seekerSkillsSet = null, seekerInterestsSet = null) {
    if (!seeker || !candidate) {
      return { score: 0, breakdown: {}, matchedSkills: [], complementarySkills: [] };
    }

    if (seeker.id && seeker.id === candidate.id) {
      return { score: 0, breakdown: {}, matchedSkills: [], complementarySkills: [] };
    }

    // Pre-computed Sets for O(1) constant time membership checks
    const sSkillsSet = seekerSkillsSet || new Set((seeker.skills || []).map(s => s.toLowerCase()));
    const sInterestsSet = seekerInterestsSet || new Set((seeker.interests || []).map(i => i.toLowerCase()));

    const candidateSkills = candidate.skills || [];
    const candidateInterests = candidate.interests || [];

    const matchedSkills = [];
    const complementarySkills = [];

    candidateSkills.forEach(s => {
      if (sSkillsSet.has(s.toLowerCase())) {
        matchedSkills.push(s);
      } else {
        complementarySkills.push(s);
      }
    });

    // 1. Skill Score (40% Weight)
    const seekerSkillsCount = Math.max(1, sSkillsSet.size);
    const overlapScore = Math.min(1.0, matchedSkills.length / seekerSkillsCount) * 50;
    const complementarityScore = Math.min(1.0, complementarySkills.length / 3) * 50;
    const skillScore = Math.round(overlapScore + complementarityScore);

    // 2. Role Synergy (30% Weight)
    const preferredRoles = ROLE_SYNERGY_MATRIX[seeker.role] || [];
    let roleScore = 50;
    if (preferredRoles.includes(candidate.role)) {
      roleScore = 100;
    } else if (seeker.role !== candidate.role) {
      roleScore = 80;
    } else {
      roleScore = 40;
    }

    // 3. Interest Alignment (30% Weight)
    let matchedInterestsCount = 0;
    candidateInterests.forEach(i => {
      if (sInterestsSet.has(i.toLowerCase())) matchedInterestsCount++;
    });

    let interestScore = 50;
    if (sInterestsSet.size > 0) {
      interestScore = Math.round((matchedInterestsCount / sInterestsSet.size) * 100);
    }

    const finalScore = Math.min(
      99,
      Math.max(
        15,
        Math.round(skillScore * 0.4 + roleScore * 0.3 + interestScore * 0.3)
      )
    );

    return {
      score: finalScore,
      breakdown: {
        skillScore,
        roleScore,
        interestScore
      },
      matchedSkills,
      complementarySkills
    };
  }

  /**
   * Filters and ranks candidates based on seeker requirements with high efficiency.
   * @param {Object} seeker 
   * @param {Array} candidateList 
   * @param {Object} filters - { skillFilter, roleFilter, minMatch }
   */
  findMatches(seeker, candidateList = [], filters = {}) {
    const { skillFilter, roleFilter, minMatch = 0 } = filters;

    // Pre-compute seeker sets once for linear scan O(N) efficiency
    const seekerSkillsSet = new Set((seeker.skills || []).map(s => s.toLowerCase()));
    const seekerInterestsSet = new Set((seeker.interests || []).map(i => i.toLowerCase()));

    const lowerSkillFilter = skillFilter && skillFilter !== "All" ? skillFilter.toLowerCase() : null;

    const matches = [];

    candidateList.forEach(candidate => {
      if (candidate.id === seeker.id) return;

      if (roleFilter && roleFilter !== "All" && candidate.role !== roleFilter) {
        return;
      }

      if (lowerSkillFilter) {
        const hasSkill = candidate.skills.some(s => s.toLowerCase().includes(lowerSkillFilter));
        if (!hasSkill) return;
      }

      const matchResult = this.calculateMatch(seeker, candidate, seekerSkillsSet, seekerInterestsSet);
      
      if (matchResult.score >= minMatch) {
        matches.push({
          candidate,
          matchScore: matchResult.score,
          breakdown: matchResult.breakdown,
          matchedSkills: matchResult.matchedSkills,
          complementarySkills: matchResult.complementarySkills
        });
      }
    });

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }
}

module.exports = new MatchmakingEngine();

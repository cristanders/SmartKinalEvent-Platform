/**
 * Smart Team Matchmaking Engine
 * Evaluates skill complementarity, role synergy, and interest alignment
 * between participants and teams to calculate compatibility percentages.
 */

class MatchmakingEngine {
  /**
   * Calculate compatibility score (0-100%) between a seeker profile and a candidate participant.
   * @param {Object} seeker - Participant object or target search criteria
   * @param {Object} candidate - Candidate participant object
   * @returns {Object} { score: number, breakdown: Object, matchedSkills: Array }
   */
  calculateMatch(seeker, candidate) {
    if (!seeker || !candidate) {
      return { score: 0, breakdown: {}, matchedSkills: [] };
    }

    if (seeker.id && seeker.id === candidate.id) {
      return { score: 0, breakdown: {}, matchedSkills: [] }; // Cannot match with self
    }

    // 1. Skill Complementarity & Overlap (40% Weight)
    const seekerSkills = (seeker.skills || []).map(s => s.toLowerCase());
    const candidateSkills = (candidate.skills || []).map(s => s.toLowerCase());

    const matchedSkills = candidateSkills.filter(s => seekerSkills.includes(s));
    const uniqueCandidateSkills = candidateSkills.filter(s => !seekerSkills.includes(s));

    // Complementarity bonus: If candidate has skills seeker doesn't have, higher tech stack coverage!
    const overlapScore = Math.min(1.0, matchedSkills.length / Math.max(1, seekerSkills.length)) * 50;
    const complementarityScore = Math.min(1.0, uniqueCandidateSkills.length / 3) * 50;
    const skillScore = Math.round(overlapScore + complementarityScore);

    // 2. Role Synergy (30% Weight)
    const roleSynergyMatrix = {
      "Team Lead": ["Backend Architect", "AI/ML Developer", "UI/UX Designer", "Frontend Specialist"],
      "Frontend Specialist": ["Backend Architect", "AI/ML Developer", "UI/UX Designer"],
      "Backend Architect": ["Frontend Specialist", "UI/UX Designer", "AI/ML Developer"],
      "AI/ML Developer": ["Frontend Specialist", "Backend Architect", "UI/UX Designer"],
      "UI/UX Designer": ["Frontend Specialist", "Backend Architect", "AI/ML Developer"]
    };

    const preferredRoles = roleSynergyMatrix[seeker.role] || [];
    let roleScore = 50; // default base
    if (preferredRoles.includes(candidate.role)) {
      roleScore = 100;
    } else if (seeker.role !== candidate.role) {
      roleScore = 80; // Different roles are good for hackathon balance
    } else {
      roleScore = 40; // Same role is slightly lower unless highly specialized
    }

    // 3. Project Interest Vector Matching (30% Weight)
    const seekerInterests = (seeker.interests || []).map(i => i.toLowerCase());
    const candidateInterests = (candidate.interests || []).map(i => i.toLowerCase());

    const matchedInterests = candidateInterests.filter(i => seekerInterests.includes(i));
    let interestScore = 0;
    if (seekerInterests.length > 0) {
      interestScore = Math.round((matchedInterests.length / Math.max(1, seekerInterests.length)) * 100);
    } else {
      interestScore = 50;
    }

    // Weighted Overall Score Calculation
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
      matchedSkills: candidate.skills.filter(s => seekerSkills.includes(s.toLowerCase())),
      complementarySkills: candidate.skills.filter(s => !seekerSkills.includes(s.toLowerCase()))
    };
  }

  /**
   * Filters and ranks candidates based on seeker requirements.
   * @param {Object} seeker 
   * @param {Array} candidateList 
   * @param {Object} filters - { skillFilter, roleFilter, minMatch }
   */
  findMatches(seeker, candidateList = [], filters = {}) {
    const { skillFilter, roleFilter, minMatch = 0 } = filters;

    return candidateList
      .filter(candidate => candidate.id !== seeker.id)
      .filter(candidate => {
        if (roleFilter && roleFilter !== "All" && candidate.role !== roleFilter) {
          return false;
        }
        if (skillFilter && skillFilter !== "All") {
          const lowerSkill = skillFilter.toLowerCase();
          const hasSkill = candidate.skills.some(s => s.toLowerCase().includes(lowerSkill));
          if (!hasSkill) return false;
        }
        return true;
      })
      .map(candidate => {
        const matchResult = this.calculateMatch(seeker, candidate);
        return {
          candidate,
          matchScore: matchResult.score,
          breakdown: matchResult.breakdown,
          matchedSkills: matchResult.matchedSkills,
          complementarySkills: matchResult.complementarySkills
        };
      })
      .filter(result => result.matchScore >= minMatch)
      .sort((a, b) => b.matchScore - a.matchScore);
  }
}

module.exports = new MatchmakingEngine();

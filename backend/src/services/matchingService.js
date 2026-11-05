/**
 * CareerConnect Skill Matching Service
 * Provides transparent, honest, rule-based matching calculation.
 * No black-box or invented AI claims - completely transparent logic.
 */

export const calculateSkillMatch = (candidateSkills = [], jobRequiredSkills = []) => {
  if (!jobRequiredSkills || jobRequiredSkills.length === 0) {
    return {
      matchPercentage: 100,
      matchedSkills: [],
      missingSkills: [],
      scoreLabel: 'Open to all skillsets',
      details: 'No specific prerequisite skills required for this role.'
    };
  }

  const normalizedCandidate = candidateSkills.map(s => s.toLowerCase().trim());
  const matchedSkills = [];
  const missingSkills = [];

  jobRequiredSkills.forEach(reqSkill => {
    const normReq = reqSkill.toLowerCase().trim();
    // Direct or partial match
    const isMatched = normalizedCandidate.some(cand =>
      cand === normReq ||
      cand.includes(normReq) ||
      normReq.includes(cand)
    );

    if (isMatched) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });

  const percentage = Math.round((matchedSkills.length / jobRequiredSkills.length) * 100);

  let scoreLabel = 'Low Match';
  if (percentage >= 80) scoreLabel = 'Strong Match';
  else if (percentage >= 50) scoreLabel = 'Good Match';
  else if (percentage >= 25) scoreLabel = 'Moderate Match';

  return {
    matchPercentage: percentage,
    matchedSkills,
    missingSkills,
    scoreLabel,
    details: `Matched ${matchedSkills.length} of ${jobRequiredSkills.length} required skills (${percentage}%) based on your profile.`
  };
};

/**
 * Rank job recommendations for a student profile
 */
export const rankJobsForStudent = (studentProfile, jobs) => {
  const candidateSkills = studentProfile.skills || [];
  const preferredRoles = (studentProfile.preferences?.roles || []).map(r => r.toLowerCase().trim());
  const preferredLocations = (studentProfile.preferences?.locations || []).map(l => l.toLowerCase().trim());

  return jobs.map(job => {
    const skillMatch = calculateSkillMatch(candidateSkills, job.requiredSkills);
    let finalScore = skillMatch.matchPercentage;

    // Bonus for matching preferred role title
    if (preferredRoles.some(role => job.title.toLowerCase().includes(role))) {
      finalScore += 10;
    }

    // Bonus for matching preferred location
    if (preferredLocations.some(loc => job.location.toLowerCase().includes(loc) || job.workMode === 'remote')) {
      finalScore += 5;
    }

    return {
      job,
      match: skillMatch,
      rankingScore: Math.min(finalScore, 100)
    };
  }).sort((a, b) => b.rankingScore - a.rankingScore);
};

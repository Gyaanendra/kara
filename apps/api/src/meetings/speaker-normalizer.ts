/**
 * Speaker normalization engine ported from Python rapidfuzz.
 * Maps raw diarized speaker tokens (e.g. "sarah c", "alex", "subash k")
 * to canonical company_members records.
 */

export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 100;
  if (!s1 || !s2) return 0;

  // Split tokens
  const t1 = s1.split(/\s+/);
  const t2 = s2.split(/\s+/);

  // If first name matches and last initial matches (e.g. "sarah c" vs "sarah chen")
  if (t1[0] === t2[0]) {
    if (t1[1] && t2[1] && (t1[1][0] === t2[1][0] || t2[1].startsWith(t1[1]))) {
      return 95;
    }
    // Only first name provided (e.g. "sarah" vs "sarah chen")
    if (t1.length === 1 || t2.length === 1) {
      return 88;
    }
  }

  // Substring or prefix match
  if (s1.includes(s2) || s2.includes(s1)) {
    return 85;
  }

  // Levenshtein distance
  const matrix: number[][] = [];
  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1,     // deletion
        );
      }
    }
  }

  const distance = matrix[s2.length][s1.length];
  const maxLen = Math.max(s1.length, s2.length);
  return Math.round(((maxLen - distance) / maxLen) * 100);
}

export interface CanonicalMember {
  id: string;
  name: string;
  email: string;
}

export function normalizeSpeakerName(
  rawName: string,
  knownMembers: CanonicalMember[],
  threshold = 75,
): { canonicalName: string; memberId?: string; score: number } {
  if (!rawName || rawName === "Speaker") {
    return { canonicalName: rawName || "Speaker", score: 0 };
  }

  const rawLower = rawName.toLowerCase().trim();

  // 1. Exact case-insensitive match
  for (const m of knownMembers) {
    if (m.name.toLowerCase().trim() === rawLower) {
      return { canonicalName: m.name, memberId: m.id, score: 100 };
    }
  }

  // 2. Best fuzzy match
  let bestMatch: CanonicalMember | null = null;
  let highestScore = 0;

  for (const m of knownMembers) {
    const score = calculateSimilarity(rawName, m.name);
    if (score > highestScore) {
      highestScore = score;
      bestMatch = m;
    }
  }

  if (bestMatch && highestScore >= threshold) {
    return {
      canonicalName: bestMatch.name,
      memberId: bestMatch.id,
      score: highestScore,
    };
  }

  return { canonicalName: rawName, score: highestScore };
}

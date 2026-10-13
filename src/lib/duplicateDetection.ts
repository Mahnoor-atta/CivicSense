import { ComplaintSubmission, LocationData, DuplicateMatch } from '../types/civic';

/**
 * Calculates geographical distance in meters between two lat/lng points using Haversine formula.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Tokenize and compute word overlap similarity between two strings.
 */
function computeTextSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0;

  const clean = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3);

  const tokens1 = new Set(clean(text1));
  const tokens2 = new Set(clean(text2));

  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  let common = 0;
  tokens1.forEach((token) => {
    if (tokens2.has(token)) common++;
  });

  return (2 * common) / (tokens1.size + tokens2.size);
}

/**
 * Scans active municipal complaints to detect potential duplicate reports
 * based on proximity (meters) and issue similarity.
 */
export function detectDuplicates(
  newReport: {
    category: string;
    description: string;
    location: LocationData;
    customCategoryDetail?: string;
  },
  existingComplaints: ComplaintSubmission[],
  maxDistanceThresholdMeters = 350
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];

  for (const existing of existingComplaints) {
    // Only flag against unresolved/active complaints (Received, Under Review, Forwarded)
    if (existing.status === 'Rejected') continue;

    const distance = calculateDistanceMeters(
      newReport.location.lat,
      newReport.location.lng,
      existing.location.lat,
      existing.location.lng
    );

    const isSameCategory =
      existing.category.toLowerCase() === newReport.category.toLowerCase() ||
      (newReport.category === 'Other' &&
        newReport.customCategoryDetail &&
        existing.customCategoryDetail &&
        newReport.customCategoryDetail.toLowerCase() ===
          existing.customCategoryDetail.toLowerCase());

    const textSim = computeTextSimilarity(newReport.description, existing.description);

    let isDuplicate = false;
    let matchReason = '';
    let similarityScore = 0;

    // Condition 1: Same category within proximity threshold
    if (isSameCategory && distance <= maxDistanceThresholdMeters) {
      isDuplicate = true;
      similarityScore = Math.min(0.98, 0.7 + (1 - distance / maxDistanceThresholdMeters) * 0.28);
      matchReason = `Identical category reported ${distance}m away`;
    }
    // Condition 2: Very close proximity (< 120m) even with partial category match
    else if (distance <= 120) {
      isDuplicate = true;
      similarityScore = 0.85;
      matchReason = `Issue reported at virtually the same location (${distance}m away)`;
    }
    // Condition 3: High text similarity within 600m
    else if (textSim > 0.45 && distance <= 600) {
      isDuplicate = true;
      similarityScore = 0.8;
      matchReason = `Similar issue description (${Math.round(textSim * 100)}% match) within neighborhood`;
    }

    if (isDuplicate) {
      matches.push({
        existingComplaint: existing,
        distanceMeters: distance,
        similarityScore,
        matchReason,
      });
    }
  }

  // Sort by closest distance and highest similarity score
  return matches.sort((a, b) => a.distanceMeters - b.distanceMeters);
}

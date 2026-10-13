import { TriageResult, PriorityLevel } from '../types/civic';

/**
 * Civic Triaging categories mapped to responsible municipal departments.
 */
export const CIVIC_CATEGORIES = [
  'Potholes & Road Damage',
  'Streetlights & Traffic Signals',
  'Waste & Illegal Dumping',
  'Parks & Public Greenery',
  'Water Leakage & Drainage',
  'Sidewalks & Pedestrian Hazards',
  'Graffiti & Vandalism',
  'Public Safety & Other',
] as const;

/**
 * Intelligent client-side rule-based civic triage fallback
 * when offline or when backend API is unreachable.
 */
export function heuristicCivicTriage(text: string): TriageResult {
  const lower = (text || '').toLowerCase();

  // High priority indicators: immediate danger, live wire, flood, deep sinkhole, gas leak
  const isHighDanger =
    /electric|sparking|live wire|sinkhole|gas leak|flooding|open manhole|broken water main|hazard|collapsed|dangerous|fire|sewage spill/.test(
      lower
    );

  // Medium priority: road disruption, uncollected waste, dark street, traffic hazard
  const isMedium =
    /pothole|street light|dark|traffic light|signal|broken glass|overflowing|trash|dumping|drain blocked|blocked|damaged bench/.test(
      lower
    );

  let priority: PriorityLevel = 'Medium';
  if (isHighDanger) {
    priority = 'High';
  } else if (!isMedium && (lower.length > 0 && /graffiti|tag|paint|cosmetic|litter|overgrown grass|weeds/.test(lower))) {
    priority = 'Low';
  }

  // Category determination
  if (/pothole|asphalt|cracked road|road|crater|pavement defect|bump/.test(lower)) {
    return {
      category: 'Potholes & Road Damage',
      priority,
      department: 'Department of Transportation & Paving',
      reasoning: 'Road surface defect detected. Assigned for asphalt repair crew inspection.',
      confidence: 0.92,
    };
  }

  if (/light|lamp|streetlight|dark street|bulb|traffic light|signal|crossing light/.test(lower)) {
    return {
      category: 'Streetlights & Traffic Signals',
      priority: isHighDanger ? 'High' : 'Medium',
      department: 'Bureau of Street Lighting & Electrical',
      reasoning: 'Illumination or electrical signal irregularity flagged for safety assessment.',
      confidence: 0.94,
    };
  }

  if (/trash|garbage|dumping|waste|overflow|recycling|debris|mattress|furniture/.test(lower)) {
    return {
      category: 'Waste & Illegal Dumping',
      priority: isHighDanger ? 'High' : 'Medium',
      department: 'Sanitation & Solid Waste Management',
      reasoning: 'Solid waste accumulation reported. Scheduled for neighborhood sanitization sweep.',
      confidence: 0.91,
    };
  }

  if (/tree|branch|grass|park|foliage|leaves|playground|bush|flower|weeds/.test(lower)) {
    return {
      category: 'Parks & Public Greenery',
      priority: isHighDanger ? 'High' : 'Low',
      department: 'Parks, Recreation & Urban Forestry',
      reasoning: 'Public park or botanical maintenance need identified.',
      confidence: 0.88,
    };
  }

  if (/water|leak|pipe|drain|flooding|puddle|hydrant|sewage|storm drain|gutter/.test(lower)) {
    return {
      category: 'Water Leakage & Drainage',
      priority: isHighDanger ? 'High' : 'Medium',
      department: 'Municipal Water & Stormwater Authority',
      reasoning: 'Hydrological or drainage issue reported. Dispatched for pipeline monitoring.',
      confidence: 0.95,
    };
  }

  if (/sidewalk|curb|trip|pedestrian|ramp|walkway|concrete slab/.test(lower)) {
    return {
      category: 'Sidewalks & Pedestrian Hazards',
      priority,
      department: 'Pedestrian Safety & Public Works',
      reasoning: 'Pedestrian pathway irregularity identified for accessibility audit.',
      confidence: 0.89,
    };
  }

  if (/graffiti|vandalism|spray paint|tagging|scratched|sticker/.test(lower)) {
    return {
      category: 'Graffiti & Vandalism',
      priority: 'Low',
      department: 'Neighborhood Beautification & Rapid Abatement',
      reasoning: 'Cosmetic civic defacement logged for anti-graffiti restoration.',
      confidence: 0.96,
    };
  }

  return {
    category: 'Public Safety & Other',
    priority,
    department: 'General Civic Services & Citizen Care',
    reasoning: 'General civic request logged. Forwarded to neighborhood liaison office.',
    confidence: 0.8,
  };
}

/**
 * Calls Gemini API to analyze the issue description and return triaged category & priority.
 *
 * @param description - Citizen text description of the issue
 * @param imageBase64 - Optional base64 encoded photo preview
 * @returns Promise<{ category: string; priority: 'High' | 'Medium' | 'Low'; department?: string; reasoning?: string }>
 */
export async function analyzeIssue(
  description: string,
  imageBase64?: string | null
): Promise<TriageResult> {
  const cleanDescription = (description || '').trim();

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: cleanDescription,
        imageBase64: imageBase64 || undefined,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.category && data.priority) {
        return {
          category: data.category,
          priority: (data.priority === 'High' || data.priority === 'Low' ? data.priority : 'Medium') as PriorityLevel,
          department: data.department || 'Municipal Public Works',
          reasoning: data.reasoning || 'Triaged via Gemini AI Civic Intelligence.',
          confidence: data.confidence || 0.95,
        };
      }
    }
  } catch (error) {
    console.warn('Network call to /api/analyze failed, using local smart triaging:', error);
  }

  // Graceful local heuristic fallback
  return heuristicCivicTriage(cleanDescription);
}

import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middleware
  app.use(express.json({ limit: '15mb' }));

  // AI Triaging Endpoint for Civic Complaints
  app.post('/api/analyze', async (req, res) => {
    try {
      const { description, imageBase64 } = req.body;

      if (!description && !imageBase64) {
        return res.status(400).json({ error: 'Description or image required for triaging' });
      }

      const apiKey = process.env.GEMINI_API_KEY;

      // If no valid Gemini API key is configured in secrets, use intelligent civic triaging logic
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        const simulated = simulateCivicTriage(description || 'Issue reported');
        return res.json(simulated);
      }

      const ai = new GoogleGenAI();

      const prompt = `You are an expert Municipal Civic Triaging System for city 311 complaints.
Citizen Description: "${description || 'No written description, see photo evidence.'}"

Your job:
1. Categorize into EXACTLY one of these categories:
- Potholes & Road Damage
- Streetlights & Traffic Signals
- Waste & Illegal Dumping
- Parks & Public Greenery
- Water Leakage & Drainage
- Sidewalks & Pedestrian Hazards
- Graffiti & Vandalism
- Public Safety & Other

2. Determine safety priority:
- "High": Immediate hazard (deep sinkhole, sparking electrical wire, open manhole, water main burst, gas leak, collapsed structure)
- "Medium": Significant civic disruption (standard pothole, dark streetlight, overflowing dumpster, blocked storm drain)
- "Low": Cosmetic or minor maintenance (graffiti, overgrown weeds, park bench scratch, small litter)

3. Identify the responsible municipal department and write a 1-sentence assessment.

Respond ONLY with valid JSON in this exact structure:
{
  "category": "string",
  "priority": "High" | "Medium" | "Low",
  "department": "string",
  "reasoning": "string"
}`;

      const contents: any[] = [];

      // If citizen attached a photo, send inline image to Gemini model for multimodal visual triaging
      if (imageBase64 && typeof imageBase64 === 'string') {
        const matches = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (matches && matches[1] && matches[2]) {
          contents.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2],
            },
          });
        }
      }

      contents.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);

      return res.json({
        category: parsed.category || 'Public Safety & Other',
        priority: parsed.priority || 'Medium',
        department: parsed.department || 'Municipal Public Works',
        reasoning: parsed.reasoning || 'Triaged by Gemini Civic Intelligence.',
      });
    } catch (error) {
      console.error('Gemini triaging error in server:', error);
      // Fallback so citizen submission is never blocked
      return res.json(simulateCivicTriage(req.body.description || ''));
    }
  });

  // Heuristic rule engine for fallback
  function simulateCivicTriage(text: string) {
    const lower = text.toLowerCase();
    const isHigh = /wire|electric|sinkhole|gas|flooding|open manhole|hazard|collapsed|fire|burst/.test(lower);
    const isLow = /graffiti|tag|paint|cosmetic|litter|weeds/.test(lower);
    const priority = isHigh ? 'High' : isLow ? 'Low' : 'Medium';

    if (/pothole|road|asphalt|crater|pavement/.test(lower)) {
      return {
        category: 'Potholes & Road Damage',
        priority,
        department: 'Dept. of Transportation & Paving',
        reasoning: 'Road surface defect detected from citizen report.',
      };
    }
    if (/light|lamp|streetlight|dark|traffic light|signal/.test(lower)) {
      return {
        category: 'Streetlights & Traffic Signals',
        priority: isHigh ? 'High' : 'Medium',
        department: 'Bureau of Street Lighting & Signals',
        reasoning: 'Illumination or electrical hazard flagged for rapid crew inspection.',
      };
    }
    if (/trash|garbage|dumping|waste|recycle|dump/.test(lower)) {
      return {
        category: 'Waste & Illegal Dumping',
        priority,
        department: 'Sanitation & Solid Waste Management',
        reasoning: 'Sanitation hazard queued for neighborhood collection.',
      };
    }
    if (/water|pipe|leak|drain|hydrant|puddle/.test(lower)) {
      return {
        category: 'Water Leakage & Drainage',
        priority: isHigh ? 'High' : 'Medium',
        department: 'Municipal Water & Stormwater Authority',
        reasoning: 'Hydrological irregularity dispatched to water maintenance unit.',
      };
    }
    if (/tree|branch|park|foliage|leaves|grass/.test(lower)) {
      return {
        category: 'Parks & Public Greenery',
        priority: isHigh ? 'High' : 'Low',
        department: 'Parks & Urban Forestry',
        reasoning: 'Public greenery maintenance request logged.',
      };
    }
    if (/sidewalk|curb|trip|ramp|walkway/.test(lower)) {
      return {
        category: 'Sidewalks & Pedestrian Hazards',
        priority,
        department: 'Public Works & Pedestrian Safety',
        reasoning: 'Pedestrian right-of-way repair queued for assessment.',
      };
    }
    if (/graffiti|vandal|paint|sticker/.test(lower)) {
      return {
        category: 'Graffiti & Vandalism',
        priority: 'Low',
        department: 'Neighborhood Beautification Unit',
        reasoning: 'Cosmetic civic defacement queued for cleaning squad.',
      };
    }

    return {
      category: 'Public Safety & Other',
      priority,
      department: 'General Civic Services & Citizen Care',
      reasoning: 'General civic inquiry assigned to district liaison office.',
    };
  }

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CivicSense Server active on port ${PORT}`);
  });
}

startServer();

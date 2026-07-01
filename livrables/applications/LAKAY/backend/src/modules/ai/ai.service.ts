import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../../config/database';
import { env } from '../../config/env';

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Tu es un assistant immobilier expert en Haïti. Tu connais le marché haïtien, les quartiers de Port-au-Prince (Pétion-Ville, Delmas, Tabarre, Laboule, etc.), Cap-Haïtien, Gonaïves et autres villes. Tu aides les utilisateurs à trouver des biens, estimer des prix et obtenir des conseils immobiliers. Réponds en français, de manière concise et professionnelle.`;

export class AIService {
  async estimatePrice(data: {
    propertyType: string;
    listingType: string;
    department: string;
    city: string;
    neighborhood?: string;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    amenities?: string[];
  }): Promise<{ estimatedMin: number; estimatedMax: number; currency: string; explanation: string }> {
    const amenitiesStr = data.amenities?.length
      ? `Équipements: ${data.amenities.join(', ')}.`
      : '';

    const prompt = `Estime le prix pour ce bien immobilier en Haïti:
- Type: ${data.propertyType} (${data.listingType === 'RENT' ? 'location' : 'vente'})
- Localisation: ${data.city}, ${data.neighborhood || ''}, Département: ${data.department}
- Chambres: ${data.bedrooms ?? 'N/A'}, Salles de bain: ${data.bathrooms ?? 'N/A'}, Surface: ${data.area ?? 'N/A'} m²
${amenitiesStr}

Donne une fourchette de prix réaliste en HTG et en USD, avec une brève explication. Format JSON: {"minHTG": number, "maxHTG": number, "minUSD": number, "maxUSD": number, "explanation": "string"}`;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected AI response type');

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not parse AI response');

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      estimatedMin: parsed.minHTG,
      estimatedMax: parsed.maxHTG,
      currency: 'HTG',
      explanation: parsed.explanation,
    };
  }

  async generateDescription(data: {
    propertyType: string;
    listingType: string;
    city: string;
    neighborhood?: string;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    amenities?: string[];
    landmark?: string;
    notes?: string;
  }): Promise<string> {
    const prompt = `Génère une description attrayante pour cette annonce immobilière haïtienne:
- Type: ${data.propertyType} (${data.listingType === 'RENT' ? 'à louer' : 'à vendre'})
- Localisation: ${data.city}${data.neighborhood ? `, ${data.neighborhood}` : ''}
- Chambres: ${data.bedrooms ?? 'N/A'}, SDB: ${data.bathrooms ?? 'N/A'}, Surface: ${data.area ?? 'N/A'} m²
- Point de repère: ${data.landmark ?? 'N/A'}
- Équipements: ${data.amenities?.join(', ') ?? 'standard'}
- Notes: ${data.notes ?? 'aucune'}

Écris une description de 3-4 paragraphes en français, professionnelle et attrayante. Mets en avant les points forts. Adapte au contexte haïtien.`;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected AI response type');
    return content.text;
  }

  async naturalLanguageSearch(query: string): Promise<{
    propertyType?: string;
    listingType?: string;
    department?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    amenities?: string[];
  }> {
    const prompt = `Analyse cette recherche immobilière et extrait les critères de filtrage:
"${query}"

Retourne un JSON avec les champs applicables parmi: propertyType (ROOM/STUDIO/APARTMENT/HOUSE/VILLA/LAND/COMMERCIAL/OFFICE/WAREHOUSE), listingType (RENT/SALE), department (OUEST/NORD/NORD_EST/NORD_OUEST/ARTIBONITE/CENTRE/SUD/SUD_EST/NIPPES/GRANDE_ANSE), city (string), minPrice (number HTG), maxPrice (number HTG), bedrooms (number), amenities (array: hasPool/hasParking/hasGenerator/hasSolarPanel/hasAC/isFurnished/hasSecurity).

N'inclus que les champs explicitement mentionnés. Format JSON uniquement.`;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') return {};

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return {};

    return JSON.parse(jsonMatch[0]);
  }

  async chat(userId: string, message: string, listingId?: string): Promise<string> {
    let contextPrompt = message;

    if (listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: {
          title: true, propertyType: true, listingType: true, price: true, currency: true,
          city: true, neighborhood: true, landmark: true, bedrooms: true, bathrooms: true, area: true,
          description: true,
        },
      });

      if (listing) {
        contextPrompt = `Contexte de l'annonce:
Titre: ${listing.title}
Type: ${listing.propertyType} (${listing.listingType})
Prix: ${listing.price} ${listing.currency}
Localisation: ${listing.city}${listing.neighborhood ? ', ' + listing.neighborhood : ''}
Point de repère: ${listing.landmark}
Chambres: ${listing.bedrooms}, SDB: ${listing.bathrooms}, Surface: ${listing.area} m²

Question de l'utilisateur: ${message}`;
      }
    }

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: contextPrompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected AI response type');
    return content.text;
  }
}

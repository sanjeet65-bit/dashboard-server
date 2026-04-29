/**
 * Claude AI - Image OCR Utility
 */

import  claude  from '../../config/claude.js'
import crypto from 'crypto';

/**
 * Extract pharmacy data from image using Claude Vision API
 */
async function extractPharmacyDataFromImage(base64Image) {
  try {
    const message = await claude.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Image
              }
            },
            {
              type: 'text',
              text: `Look at this image carefully. It may be a pharmacy shop front, banner, signboard, visiting card, or invoice.

Extract:
1. Shop/Pharmacy Name (any business name visible)
2. Phone Numbers — list ALL phone numbers visible, separated by commas (e.g. "9554858929, 8318450296"). Each number should be exactly as printed. If only one number, return just that number.
3. Email (if visible, else NOT_FOUND)
4. City (if visible, else NOT_FOUND)
5. Address — the full postal address printed on the banner/card (door number, building, street, area, city). Only extract what is literally printed; do NOT guess. If no address line is visible, return NOT_FOUND.

Rules:
- Extract whatever text you can see, even if partially visible
- For phone: each individual number must be kept separate — never merge two numbers into one. Separate multiple numbers with ", "
- For address: look for lines like "Shop No. X, Street Name, Area, City - Pincode". Return the full address as one string.
- confidence: 0.0 to 1.0. Set to at least 0.5 if you found a name or phone.
- If truly no text is visible, set confidence to 0

Return ONLY this JSON (no markdown):
{"name":"...","phone":"...","email":"...","city":"...","address":"...","confidence":0.0}`
            }
          ]
        }
      ]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Could not parse Claude response');
    }

    const extracted = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      name: extracted.name || 'NOT_FOUND',
      phone: extracted.phone || 'NOT_FOUND',
      email: extracted.email || 'NOT_FOUND',
      city: extracted.city || 'NOT_FOUND',
      address: extracted.address || 'NOT_FOUND',
      confidence: extracted.confidence != null ? extracted.confidence : 0.7
    };
  } catch (error) {
    console.error('OCR extraction error:', error.message, error.status, error.error);
    return {
      success: false,
      error: error.message,
      confidence: 0
    };
  }
}

/**
 * Generate SHA-256 hash of image
 */
function hashImage(base64Image) {
  return crypto.createHash('sha256').update(base64Image).digest('hex');
}

export  {
  extractPharmacyDataFromImage,
  hashImage
};

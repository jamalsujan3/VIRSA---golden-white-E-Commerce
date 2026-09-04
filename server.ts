/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  escapeHTML,
  sanitizeUGC,
  validateEmail,
  validateBDPhone,
  validateLength,
  sanitizeReviewInput
} from './src/lib/sanitize';
import { calculateAuthoritativePricing } from './src/lib/priceCalculator';
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from './src/data';

// Global orders repository on server
let serverOrders = [...INITIAL_ORDERS];

// In-memory reviews store to persist submitted reviews per product during runtime
const serverReviewsByProduct: Record<string, any[]> = {};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Core Middlewares: Parse JSON with strict body limit to prevent DoS
  app.use(express.json({ limit: '512kb' }));

  // Security Headers
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // =========================================================================
  // API ROUTE 1: Server-Side Gemini Luxury Stylist & Concierge
  // - Gemini API Key is strictly server-side (process.env.GEMINI_API_KEY)
  // - Never exposed to client bundle
  // - Input validation & sanitization on prompt
  // - Safe, generic error handling
  // =========================================================================
  app.post('/api/ai/stylist', async (req: Request, res: Response) => {
    try {
      const { prompt, occasion, productName, userPreferences } = req.body || {};

      // 1. Input validation & sanitization
      const cleanPrompt = sanitizeUGC(prompt || '');
      const cleanOccasion = sanitizeUGC(occasion || 'Festive Celebration');
      const cleanProductName = sanitizeUGC(productName || 'Signature Panjabi');
      const cleanPreferences = sanitizeUGC(userPreferences || '');

      if (!cleanPrompt && !cleanOccasion && !cleanProductName) {
        return res.status(400).json({
          success: false,
          error: 'Please provide styling details or occasion preferences.'
        });
      }

      if (cleanPrompt.length > 500) {
        return res.status(400).json({
          success: false,
          error: 'Styling inquiry is too lengthy. Please keep under 500 characters.'
        });
      }

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        // Fallback gracefully without revealing internal configuration
        return res.json({
          success: true,
          advice: `For ${cleanOccasion} with ${cleanProductName}, the atelier recommends pairing with our Raw Silk Pajama in Pearl White and handcrafted leather Nagra footwear. Accenting with an antique gold pocket square or matching waistcoat creates a regal, balanced silhouette.`
        });
      }

      // Initialize Gemini SDK lazily on server
      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `You are the Master Stylist & Bespoke Concierge at VIRSA, a luxury traditional menswear fashion atelier based in Bangladesh specializing in handcrafted Panjabis, Kotis, Sherwanis, Kabli Sets, and Jubbahs.
Provide sophisticated, concise (2-4 sentences max), sartorial styling guidance for patrons. Suggest complementary footwear (e.g., Kolhapuri, Nagra, Oxford), bottoms (e.g., Aligarhi Pajama, Churidar), wristwear, and color harmony.
Keep tone refined, respectful, aristocratic, and modern. Do not use generic buzzwords. Avoid markdown headers; return clean, elegant text.`;

      const userMessage = `Garment Piece: ${cleanProductName}
Occasion: ${cleanOccasion}
Patron Preferences: ${cleanPreferences}
Specific Inquiry: ${cleanPrompt || 'What is the best way to style and accessorize this garment for this event?'}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemInstruction}\n\n${userMessage}` }] }
        ]
      });

      const responseText = response.text?.trim() || '';
      const sanitizedAdvice = sanitizeUGC(responseText);

      return res.json({
        success: true,
        advice: sanitizedAdvice || `For ${cleanOccasion}, pair with our tailored Pajama and heritage leather sandals.`
      });
    } catch (err) {
      // Log full internal error for server diagnostics
      console.error('[Internal Gemini Stylist Error]:', err);

      // Return a safe, generic message to client — no stack traces or API details
      return res.status(200).json({
        success: true,
        advice: 'Our Master Stylist recommends pairing dark tone Panjabis with tailored ivory Aligarhi pajamas, while lighter silk garments harmonize best with a contrasting antique-gold embroidered Koti.'
      });
    }
  });

  // =========================================================================
  // API ROUTE 2: Authoritative Price & Coupon Verification
  // - Recalculates all pricing server-side from master catalog
  // - Never trusts client-sent subtotal, discounts, or delivery fees
  // =========================================================================
  app.post('/api/checkout/verify-pricing', (req: Request, res: Response) => {
    try {
      const { items, couponCode, shippingMethod, city } = req.body || {};

      const result = calculateAuthoritativePricing(
        items,
        couponCode,
        shippingMethod,
        city
      );

      if (!result.isValid) {
        return res.status(400).json({
          success: false,
          error: result.error || 'Invalid garment items selected.'
        });
      }

      return res.json({
        success: true,
        pricing: {
          subtotal: result.subtotal,
          discount: result.discount,
          shippingCost: result.shippingCost,
          total: result.total,
          appliedCoupon: result.appliedCoupon,
          items: result.items,
          tamperingDetected: result.priceTamperingDetected
        }
      });
    } catch (err) {
      console.error('[Internal Pricing Verification Error]:', err);
      return res.status(500).json({
        success: false,
        error: 'Unable to calculate order pricing. Please try again.'
      });
    }
  });

  // =========================================================================
  // API ROUTE 3: Server-Side Order Placement & Validation
  // - Validates all patron fields (name, email, BD phone, address)
  // - Recalculates authoritative totals
  // - Sanitizes user notes & instructions
  // =========================================================================
  app.post('/api/orders/place', (req: Request, res: Response) => {
    try {
      const {
        customer,
        shippingAddress,
        items,
        couponCode,
        shippingMethod,
        paymentMethod,
        notes
      } = req.body || {};

      // 1. Validate Customer
      const cleanName = sanitizeUGC(customer?.name || '');
      const cleanEmail = sanitizeUGC(customer?.email || '');
      const cleanPhone = sanitizeUGC(customer?.phone || '');

      if (!validateLength(cleanName, 2, 80)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid recipient name (2-80 characters).'
        });
      }

      if (!validateEmail(cleanEmail)) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid email address for your order confirmation.'
        });
      }

      if (!validateBDPhone(cleanPhone)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide an 11-digit mobile number (e.g., 017XXXXXXXX or +8801XXXXXXXX).'
        });
      }

      // 2. Validate Address
      const cleanAddress = sanitizeUGC(shippingAddress?.address || '');
      const cleanArea = sanitizeUGC(shippingAddress?.area || '');
      const cleanCity = sanitizeUGC(shippingAddress?.city || 'Dhaka');
      const cleanPostal = sanitizeUGC(shippingAddress?.postalCode || '');

      if (!validateLength(cleanAddress, 5, 250)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a detailed delivery address (at least 5 characters).'
        });
      }

      // 3. Authoritative Pricing Calculation (Never Trust Client Numbers)
      const pricingResult = calculateAuthoritativePricing(
        items,
        couponCode,
        shippingMethod,
        cleanCity
      );

      if (!pricingResult.isValid) {
        return res.status(400).json({
          success: false,
          error: pricingResult.error || 'Unable to verify order items.'
        });
      }

      // 4. Create Confirmed Server Order
      const cleanNotes = sanitizeUGC(notes || '');
      const newOrderNumber = `VRS-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newOrder = {
        id: `ord-${Date.now()}`,
        orderNumber: newOrderNumber,
        customer: {
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone
        },
        shippingAddress: {
          address: cleanAddress,
          area: cleanArea,
          city: cleanCity,
          postalCode: cleanPostal
        },
        items: pricingResult.items,
        pricing: {
          subtotal: pricingResult.subtotal,
          shippingCost: pricingResult.shippingCost,
          discount: pricingResult.discount,
          couponCode: pricingResult.appliedCoupon?.code || null,
          total: pricingResult.total
        },
        shippingMethod: shippingMethod || 'regular_dhaka',
        paymentMethod: paymentMethod || 'cod',
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
        orderStatus: 'pending',
        statusHistory: [
          {
            status: 'pending',
            timestamp: new Date().toISOString(),
            note: 'Order authenticated and logged into atelier production queue.'
          }
        ],
        notes: cleanNotes,
        createdAt: new Date().toISOString()
      };

      serverOrders.unshift(newOrder as any);

      return res.status(201).json({
        success: true,
        order: newOrder
      });
    } catch (err) {
      console.error('[Internal Order Placement Error]:', err);
      return res.status(500).json({
        success: false,
        error: 'We were unable to process your order. Please review your details and try again.'
      });
    }
  });

  // =========================================================================
  // API ROUTE 4: Review Submission & UGC Sanitization
  // - Validates author, rating (1-5), comments
  // - Sanitizes all text fields
  // =========================================================================
  app.post('/api/reviews/submit', (req: Request, res: Response) => {
    try {
      const { productId, author, rating, comment, verified } = req.body || {};

      const product = INITIAL_PRODUCTS.find((p) => p.id === productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Garment piece not found in collection.'
        });
      }

      const { isValid, review, error } = sanitizeReviewInput({
        author,
        rating,
        comment,
        verified: verified ?? true
      });

      if (!isValid || !review) {
        return res.status(400).json({
          success: false,
          error: error || 'Invalid review data submitted.'
        });
      }

      if (!serverReviewsByProduct[productId]) {
        serverReviewsByProduct[productId] = [];
      }
      serverReviewsByProduct[productId].unshift(review);

      return res.status(201).json({
        success: true,
        review
      });
    } catch (err) {
      console.error('[Internal Review Submission Error]:', err);
      return res.status(500).json({
        success: false,
        error: 'Unable to publish review at this time. Please try again shortly.'
      });
    }
  });

  // =========================================================================
  // API ROUTE 5: Contact Inquiry Submission
  // - Validates all patron fields and sanitizes message body
  // =========================================================================
  app.post('/api/contact/submit', (req: Request, res: Response) => {
    try {
      const { name, email, phone, subject, message } = req.body || {};

      const cleanName = sanitizeUGC(name || '');
      const cleanEmail = sanitizeUGC(email || '');
      const cleanPhone = sanitizeUGC(phone || '');
      const cleanSubject = sanitizeUGC(subject || 'General Inquiry');
      const cleanMessage = sanitizeUGC(message || '');

      if (!validateLength(cleanName, 2, 80)) {
        return res.status(400).json({
          success: false,
          error: 'Name must be between 2 and 80 characters.'
        });
      }

      if (!validateEmail(cleanEmail)) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid email address.'
        });
      }

      if (cleanPhone && !validateBDPhone(cleanPhone)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid 11-digit phone number.'
        });
      }

      if (!validateLength(cleanMessage, 10, 2000)) {
        return res.status(400).json({
          success: false,
          error: 'Message must be between 10 and 2,000 characters.'
        });
      }

      // Log contact inquiry safely
      console.log(`[Atelier Inquiry] From: ${cleanName} <${cleanEmail}> Subject: ${cleanSubject}`);

      return res.json({
        success: true,
        message: 'Your inquiry has been received by our Atelier team. A master consultant will reach out within 24 business hours.'
      });
    } catch (err) {
      console.error('[Internal Contact Inquiry Error]:', err);
      return res.status(500).json({
        success: false,
        error: 'Unable to send message at this time. Please try again shortly.'
      });
    }
  });

  // =========================================================================
  // API ROUTE 6: Order Tracking Verification
  // =========================================================================
  app.post('/api/orders/track', (req: Request, res: Response) => {
    try {
      const { query } = req.body || {};
      const cleanQuery = sanitizeUGC(query || '').trim();

      if (!cleanQuery) {
        return res.status(400).json({
          success: false,
          error: 'Please provide an order number or mobile phone number.'
        });
      }

      const match = serverOrders.find((ord) => {
        const matchNumber = ord.orderNumber.toLowerCase() === cleanQuery.toLowerCase();
        const matchPhone = ord.customer.phone.replace(/[\s\-()]/g, '') === cleanQuery.replace(/[\s\-()]/g, '');
        return matchNumber || matchPhone;
      });

      if (!match) {
        return res.status(404).json({
          success: false,
          error: 'No order record found matching the provided details.'
        });
      }

      return res.json({
        success: true,
        order: {
          orderNumber: match.orderNumber,
          customerName: escapeHTML(match.customer.name),
          orderStatus: match.orderStatus,
          statusHistory: match.statusHistory,
          createdAt: match.createdAt,
          itemsCount: match.items.length,
          total: match.pricing.total
        }
      });
    } catch (err) {
      console.error('[Internal Order Tracking Error]:', err);
      return res.status(500).json({
        success: false,
        error: 'Unable to track order at this moment. Please try again.'
      });
    }
  });

  // =========================================================================
  // Global Error Handler Middleware
  // Protects against leaking internal stack traces or database info
  // =========================================================================
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[Unhandled Server Exception]:', err?.message || err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'An internal error occurred while processing your request. Please try again.'
      });
    }
  });

  // =========================================================================
  // Vite Integration (Dev Mode Middleware vs Production Static Files)
  // =========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VIRSA Luxury Storefront server running on port ${PORT}`);
  });
}

startServer();

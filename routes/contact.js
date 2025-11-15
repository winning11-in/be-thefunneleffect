import express from 'express';

const router = express.Router();

/**
 * @swagger
 * /api/contact:
 *   post:
 *     tags:
 *       - Contact
 *     summary: Submit contact form
 *     description: Endpoint for landing page contact form submissions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Contact person's name
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Contact person's email
 *                 example: "john.doe@example.com"
 *               mobile:
 *                 type: string
 *                 description: Contact person's mobile number
 *                 example: "+1234567890"
 *               description:
 *                 type: string
 *                 description: Message or inquiry description
 *                 example: "I'm interested in your services"
 *     responses:
 *       200:
 *         description: Contact form submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Contact form submitted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "contact_1699999999999"
 *                     submittedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-11-15T12:00:00.000Z"
 *                     contact:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         mobile:
 *                           type: string
 *                         description:
 *                           type: string
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid input data"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

// Contact form submission endpoint
router.post('/', async (req, res) => {
  try {
    const { name, email, mobile, description } = req.body;
    
    // Basic validation (optional, as per requirements)
    const errors = [];
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.push('Name is required and must be a valid string');
    }
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      errors.push('Email is required and must be a valid email address');
    }
    
    if (mobile && typeof mobile !== 'string') {
      errors.push('Mobile number must be a valid string');
    }
    
    if (description && typeof description !== 'string') {
      errors.push('Description must be a valid string');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: errors
      });
    }
    
    // Generate a unique ID for this contact form submission
    const contactId = `contact_${Date.now()}`;
    const submittedAt = new Date().toISOString();
    
    // Sanitize and prepare the contact data
    const contactData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      mobile: mobile ? mobile.trim() : '',
      description: description ? description.trim() : ''
    };
    
    // Log the contact form submission (for debugging/monitoring)
    console.log('Contact form submission received:', {
      id: contactId,
      submittedAt: submittedAt,
      contact: contactData,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    // Here you could:
    // 1. Save to database (if needed in future)
    // 2. Send email notification
    // 3. Send to CRM system
    // 4. Send to webhook
    // For now, we'll just return success response
    
    res.status(200).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: {
        id: contactId,
        submittedAt: submittedAt,
        contact: contactData
      }
    });
    
  } catch (error) {
    console.error('Error processing contact form:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @swagger
 * /api/contact/test:
 *   get:
 *     tags:
 *       - Contact
 *     summary: Test contact endpoint
 *     description: Simple endpoint to test if the contact routes are working
 *     responses:
 *       200:
 *         description: Contact endpoint is working
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Contact endpoint is working"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */

// Test endpoint for contact routes
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Contact endpoint is working',
    timestamp: new Date().toISOString()
  });
});

export default router;
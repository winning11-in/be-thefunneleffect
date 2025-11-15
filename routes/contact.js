import express from 'express';
import Contact from '../models/Contact.js';
import { authenticate } from '../middleware/index.js';

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
    
    // Sanitize and prepare the contact data
    const contactData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      mobile: mobile ? mobile.trim() : '',
      description: description ? description.trim() : ''
    };
    
    // Save contact to database
    const contact = new Contact(contactData);
    const savedContact = await contact.save();
    
    // Log the contact form submission (for debugging/monitoring)
    console.log('Contact form submission saved:', {
      id: savedContact._id,
      submittedAt: savedContact.createdAt,
      contact: contactData,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(200).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: {
        id: savedContact._id,
        submittedAt: savedContact.createdAt,
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
 * /api/contacts:
 *   get:
 *     tags:
 *       - Contact
 *     summary: Get all contact submissions (Admin only)
 *     description: Retrieve paginated list of contact form submissions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of contacts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       mobile:
 *                         type: string
 *                       description:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       401:
 *         description: Unauthorized - Admin access required
 *       500:
 *         description: Internal server error
 */

// Get all contacts (Admin only)
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Contact.countDocuments(query);
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: contacts,
      page: parseInt(page),
      totalPages,
      total,
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @swagger
 * /api/contacts/{id}:
 *   delete:
 *     tags:
 *       - Contact
 *     summary: Delete a contact submission (Admin only)
 *     description: Delete a specific contact form submission
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact ID
 *     responses:
 *       200:
 *         description: Contact deleted successfully
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
 *                   example: "Contact deleted successfully"
 *       404:
 *         description: Contact not found
 *       401:
 *         description: Unauthorized - Admin access required
 *       500:
 *         description: Internal server error
 */

// Delete a contact (Admin only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndDelete(id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact',
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
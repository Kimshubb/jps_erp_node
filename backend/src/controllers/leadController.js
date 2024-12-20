// src/controllers/leadController.js


const prisma = require('../utils/prismaClient');
const nodemailer = require('nodemailer');

//  Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const leadController = {
  // Capture new lead
  async captureLead(req, res) {
    try {
      const { name, email, schoolName, phoneNumber } = req.body;

      // Validate required fields
      if (!name || !email || !schoolName) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and school name are required'
        });
      }

      // Create lead in database
      const lead = await prisma.lead.create({
        data: {
          name,
          email,
          schoolName,
          phoneNumber,
          status: 'new'
        }
      });

      // Send notification to sales team
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.SALES_TEAM_EMAIL,
        subject: `New Lead from ${schoolName}`,
        html: `
          <h2>New Lead Details:</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>School:</strong> ${schoolName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phoneNumber || 'Not provided'}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          <p>Please follow up within 24 hours.</p>
          <p><a href="${process.env.ADMIN_URL}/leads/${lead.id}">View in Admin Panel</a></p>
        `
      });

      // Send confirmation to lead
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Thank you for your interest in OneClickSMIS',
        html: `
          <h2>Thank you for your interest, ${name}!</h2>
          <p>We've received your inquiry about OneClickSMIS for ${schoolName}.</p>
          <p>One of our education specialists will contact you within 24 hours to discuss how we can help transform your school's management system.</p>
          <p>In the meantime, you might be interested in:</p>
          <ul>
            <li><a href="${process.env.WEBSITE_URL}/demo">Watch our product demo</a></li>
            <li><a href="${process.env.WEBSITE_URL}/case-studies">Read our case studies</a></li>
            <li><a href="${process.env.WEBSITE_URL}/features">Browse our features</a></li>
          </ul>
          <p>Best regards,<br>The OneClickSMIS Team</p>
        `
      });

      res.json({
        success: true,
        message: 'Lead captured successfully',
        leadId: lead.id
      });

    } catch (error) {
      console.error('Lead capture error:', error);
      console.log('Additional error details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process lead'
      });
    }
  },

  // Get all leads (protected route for admin)
  async getLeads(req, res) {
    try {
      const leads = await prisma.lead.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json({
        success: true,
        leads
      });
    } catch (error) {
      console.error('Get leads error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch leads'
      });
    }
  },

  // Update lead status (protected route for admin)
  async updateLeadStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const lead = await prisma.lead.update({
        where: { id },
        data: { status, notes }
      });

      res.json({
        success: true,
        lead
      });
    } catch (error) {
      console.error('Update lead error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update lead'
      });
    }
  }
};

module.exports = leadController;
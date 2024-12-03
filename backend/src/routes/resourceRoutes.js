const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const isAuthenticated = require('../middleware/authMiddleware');

// Resource metadata
const resources = {
  whitepaper: {
    filename: 'ai-in-education-whitepaper.pdf',
    title: 'AI in Education Whitepaper',
    requiresAuth: false
  },
  'case-study': {
    filename: 'success-case-study.pdf',
    title: 'School Success Case Study',
    requiresAuth: false
  },
  brochure: {
    filename: 'oneclicksmis-brochure.pdf',
    title: 'Product Brochure',
    requiresAuth: false
  },
  // Add more resources as needed
};

// Download endpoint
router.get('/download/:resourceId', async (req, res) => {
  const { resourceId } = req.params;
  const resource = resources[resourceId];

  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }

  if (resource.requiresAuth && !req.isAuthenticated) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const filePath = path.join(__dirname, '../resources', resource.filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Log download
  console.log(`Resource downloaded: ${resource.title}`);

  // Send file
  res.download(filePath, resource.filename, (err) => {
    if (err) {
      console.error(`Error downloading resource: ${err}`);
      res.status(500).json({ error: 'Error downloading file' });
    }
  });
});

// Get resource metadata
router.get('/metadata/:resourceId', (req, res) => {
  const { resourceId } = req.params;
  const resource = resources[resourceId];

  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }

  res.json({
    id: resourceId,
    title: resource.title,
    requiresAuth: resource.requiresAuth
  });
});

module.exports = router;
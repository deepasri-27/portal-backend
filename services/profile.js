const https = require('https');
const express = require('express');
const axios = require('axios');

const router = express.Router();

// Trust unverified SAP SSL cert
const agent = new https.Agent({ rejectUnauthorized: false });

// SAP Basic Auth credentials
const SAP_USERNAME = 'K901554';
const SAP_PASSWORD = 'Deepasri@27';

// Base URL
const SAP_BASE_URL = 'https://AZKTLDS5CP.kcloud.com:44300/sap/opu/odata/SAP/ZMM_VENDORPORTAL_SRV';

// Route: GET /api/vendor-profile/:lifnr
router.get('/vendor-profile/:lifnr', async (req, res) => {
  const lifnr = req.params.lifnr;

  if (!lifnr) {
    return res.status(400).json({ error: 'Vendor ID (lifnr) is required' });
  }

  // OData URL with JSON format for profile data
  const profileURL = `${SAP_BASE_URL}/ZMMVProfileSet(VendorId='${lifnr}')?$format=json`;

  try {
    const response = await axios.get(profileURL, {
      httpsAgent: agent,
      auth: {
        username: SAP_USERNAME,
        password: SAP_PASSWORD,
      },
      headers: {
        Accept: 'application/json',
      },
    });

    const result = response.data.d;

    if (!result) {
      return res.status(404).json({ status: 'failure', message: 'Profile not found' });
    }

    // Send profile data back
    res.status(200).json({
      status: 'success',
      profile: {
        vendorId: result.VendorId,
        name: result.Name,
        city: result.City,
        country: result.Country,
        postcode: result.Postcode,
        street: result.Street,
      },
    });
  } catch (error) {
    console.error('SAP profile error:', error.response?.data || error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve vendor profile',
      details: error.response?.data?.error?.message?.value || error.message,
    });
  }
});

module.exports = router;

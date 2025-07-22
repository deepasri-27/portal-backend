const https = require('https');
const express = require('express');
const axios = require('axios');

const router = express.Router();

// Trust SAP SSL certificate even if it's self-signed
const agent = new https.Agent({ rejectUnauthorized: false });

// 👉 SAP OData Basic Auth credentials (Your ID & Password)
const SAP_USERNAME = 'K901554';
const SAP_PASSWORD = 'Deepasri@27';

// 👉 Your SAP OData Base URL
const SAP_BASE_URL = 'https://AZKTLDS5CP.kcloud.com:44300/sap/opu/odata/SAP/ZMM_VENDORPORTAL_SRV';

// 🔐 API Route: POST /api/vendor-login
router.post('/vendor-login', async (req, res) => {
  const { lifnr, password } = req.body;

  // 🔍 Input validation
  if (!lifnr || !password) {
    return res.status(400).json({ error: 'Missing lifnr or password' });
  }

  // 🧭 Construct the SAP OData URL
 const loginURL = `${SAP_BASE_URL}/ZMMVLoginSet(Lifnr='${lifnr}',Password='${password}')?$format=json`;
  

  try {
    // 🚀 Call SAP OData service using Axios
    const response = await axios.get(loginURL, {
      httpsAgent: agent, // Ignore cert warnings
      auth: {
        username: SAP_USERNAME,
        password: SAP_PASSWORD
      },
      headers: {
        'Accept': 'application/json'
      }
    });

    const result = response.data.d;

    // ✅ Check if SAP returned valid password
    if (result.Password === 'VALID') {
      
      res.status(200).json({ status: 'success', lifnr: result.Lifnr });
    } else {
      res.status(401).json({ status: 'failure', message: 'Invalid credentials' });
    }

  } catch (error) {
    console.error('SAP login error:', error.response?.data || error.message);
    res.status(500).json({
      status: 'error',
      message: 'SAP login failed',
      details: error.response?.data?.error?.message?.value || error.message
    });
  }
});

module.exports = router;
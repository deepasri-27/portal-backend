    const express = require('express');
const axios = require('axios');
const https = require('https');
const router = express.Router();

// Replace these with actual credentials
const SAP_URL = 'https://AZKTLDS5CP.kcloud.com:44300/sap/opu/odata/SAP/ZMM_VENDORPORTAL_SRV';
const SAP_USERNAME = 'K901554';
const SAP_PASSWORD = 'Deepasri@27';

// HTTPS Agent (disables certificate verification for dev)
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// Route: Get RFQ list for vendor
router.get('/rfq/:lifnr', async (req, res) => {
  try {
    const rawLifnr = req.params.lifnr || '';
    const vendorId = rawLifnr.trim().padStart(10, '0');

    const odataUrl = `${SAP_URL}/ZMMVRFQSet?$filter=Lifnr eq '${vendorId}'`;

    const response = await axios.get(odataUrl, {
      httpsAgent,
      auth: {
        username: SAP_USERNAME, 
        password: SAP_PASSWORD
      },
      headers: {
        Accept: 'application/json'
      }
    });

    const entries = response.data?.d?.results || [];

    const rfqData = entries.map(entry => ({
      poNumber: entry.Ebeln,
      vendorId: entry.Lifnr,
      docDate: formatSAPDate(entry.Zbedat),
      itemNumber: entry.Ebelp,
      material: entry.Matnr,
      unit: entry.Meins,
      description: entry.Txz01,
      deliveryDate: formatSAPDate(entry.Zeildt)
    }));

    res.json({ status: 'success', rfq: rfqData });
  } catch (error) {
    console.error('Error fetching RFQ:', error.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch RFQ data' });
  }
});

// Helper to format YYYYMMDD to standard date
function formatSAPDate(sapDate) {
  if (!sapDate) return '';
  const yyyy = sapDate.slice(0, 4);
  const mm = sapDate.slice(4, 6);
  const dd = sapDate.slice(6, 8);
  return `${yyyy}-${mm}-${dd}`;
}

module.exports = router;

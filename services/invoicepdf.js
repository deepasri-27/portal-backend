const express = require('express');
const axios = require('axios');
const https = require('https');
 
const router = express.Router();
 
const SAP_USERNAME = 'K901554';
const SAP_PASSWORD = 'Deepasri@27';
const SAP_BASE_URL = 'https://AZKTLDS5CP.kcloud.com:44300/sap/opu/odata/SAP/ZMM_VENDORPORTAL_SRV';
const agent = new https.Agent({ rejectUnauthorized: false });
 
// GET /api/invoice-pdf/:belnr
router.get('/invoice-pdf/:belnr', async (req, res) => {
  const belnr = req.params.belnr;
  if (!belnr) {
    return res.status(400).json({ error: 'Invoice number (Belnr) is required' });
  } 
 
  const odataURL = `${SAP_BASE_URL}/ZMMVInvoicepdfSet('${belnr}')?$format=json`;
 
  try {
    const response = await axios.get(odataURL, {
      httpsAgent: agent,
      auth: {
        username: SAP_USERNAME,
        password: SAP_PASSWORD
      },
      headers: {
        'Accept': 'application/json'
      }
    });
 
    const result = response.data?.d;
    if (!result || !result.PdfString) {
      return res.status(404).json({ error: 'PDF not found for this invoice' });
    }
    
    res.status(200).json({
      status: 'success',
      invoiceNumber: result.Belnr,
      pdfBase64: result.PdfString
    });
 
  } catch (error) {
    console.error('Error fetching invoice PDF:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch invoice PDF',
      details: error.message
    });
  }
});
 
module.exports = router;
 
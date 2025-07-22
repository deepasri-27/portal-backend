const express = require('express');
const axios = require('axios');
const https = require('https');
const router = express.Router();

// SAP OData credentials and config
const SAP_URL = 'https://AZKTLDS5CP.kcloud.com:44300/sap/opu/odata/SAP/ZMM_VENDORPORTAL_SRV';
const SAP_USERNAME = 'K901554';
const SAP_PASSWORD = 'Deepasri@27';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false // Use only for dev/test systems with self-signed certs
});
    
// Route: /aging/:lifnr
router.get('/aging/:lifnr', async (req, res) => {
  try {
    const rawLifnr = req.params.lifnr || '';
    const vendorId = rawLifnr.trim().padStart(10, '0');

    const odataUrl = `${SAP_URL}/ZMMVAgingSet?$filter=VendorId eq '${vendorId}'`;

    const response = await axios.get(odataUrl, {
      httpsAgent,
      auth: {
        username: SAP_USERNAME,
        password: SAP_PASSWORD
      },
      headers: {
        'Accept': 'application/json'
      }
    });

    const entries = response.data?.d?.results || [];

    const agingData = entries.map(entry => ({
      paymentDoc: entry.PaymentDoc,
      docYear: entry.DocYear,
      paymentDate: formatSAPDate(entry.PaymentDate),
      enrtyDate: formatSAPDate(entry.EnrtyDate),
      vendorId: entry.VendorId,
      amountPaid: entry.AmountPaid,
      currency: entry.Currency,
      clearingDoc: entry.ClearingDoc,
      refDocNo: entry.RefDocNo,
      dueDate: formatSAPDate(entry.DueDate),
      aging: entry.Aging
    }));
     console.log(agingData);
    res.json({ status: 'success', aging: agingData });
  } catch (error) {
    console.error('Error fetching aging data:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch aging data',
      details: error.message
    });
  }
});

function formatSAPDate(sapDate) {
  if (!sapDate) return '';

  // Extract the number from /Date(1747699200000)/
  const timestampMatch = sapDate.match(/\/Date\((\d+)\)\//);
  if (!timestampMatch) return '';

  const timestamp = parseInt(timestampMatch[1], 10);
  const date = new Date(timestamp);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const dd = String(date.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
}


module.exports = router;

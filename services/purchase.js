const express = require('express');
const axios = require('axios');
const https = require('https');
const router = express.Router();

// SAP OData credentials and config
const SAP_URL = 'https://AZKTLDS5CP.kcloud.com:44300/sap/opu/odata/SAP/ZMM_VENDORPORTAL_SRV';
const SAP_USERNAME = 'K901554';
const SAP_PASSWORD = 'Deepasri@27';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false // Use only in dev; secure this in production!
});

// Route to get purchase data for a vendor
router.get('/purchase/:lifnr', async (req, res) => {
  try {
    const rawLifnr = req.params.lifnr || '';
    const vendorId = rawLifnr.trim().padStart(10, '0'); // SAP expects padded VendorId

    const odataUrl = `${SAP_URL}/ZMMVPurchaseSet?$filter=VendorId eq '${vendorId}'`;

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

    // Format the response
    const purchaseData = entries.map(entry => ({
        vendorId: entry.VendorId,
        deliveryDate: formatSAPDate(entry.DeliveryDate),
        docDate: formatSAPDate(entry.DocDate),
        material: entry.Material,
        unit: entry.Unit,
        poNumber: entry.PoNumber,
        itemNumber: entry.ItemNumber,
    
    }));
    
    res.json({ status: 'success', purchase: purchaseData });
  } catch (err) {
    console.error('Error fetching purchase data:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch purchase data',
      details: err.message
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

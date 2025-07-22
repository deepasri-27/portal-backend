const express = require('express');
const axios = require('axios');
const https = require('https');

const router = express.Router();

// SAP OData Config
const SAP_USERNAME = 'K901554';
const SAP_PASSWORD = 'Deepasri@27';
const SAP_BASE_URL = 'https://AZKTLDS5CP.kcloud.com:44300/sap/opu/odata/SAP/ZMM_VENDORPORTAL_SRV';

// Allow self-signed cert
const agent = new https.Agent({ rejectUnauthorized: false });

// GET /api/invoices/:lifnr
router.get('/invoices/:lifnr', async (req, res) => {
  const lifnr = req.params.lifnr;

  if (!lifnr) {
    return res.status(400).json({ status: 'error', message: 'Vendor ID is required' });
  }

  // Make lifnr 10-digit with leading zeros
  const formattedLifnr = lifnr.padStart(10, '0');
  const url = `${SAP_BASE_URL}/ZMMVInvoiceSet?$filter=VendorId eq '${formattedLifnr}'&$format=json`;

  try {
    const response = await axios.get(url, {
      httpsAgent: agent,
      auth: {
        username: SAP_USERNAME,
        password: SAP_PASSWORD,
      },
      headers: {
        Accept: 'application/json',
      },
    });

    const results = response.data.d?.results || [];

    if (!results.length) {
      return res.status(404).json({ status: 'failure', message: 'No invoice data found for this vendor' });
    }

    const invoices = results.map(item => ({
      vendorId: item.VendorId,
      invoiceNo: item.InvoiceNo,
      invoiceDate: formatSAPDate(item.InvoiceDate),
      totalAmount: item.TotalAmount,
      currency: item.Currency,
      paymentTerms: item.PaymentTerms,
      poNo: item.PoNo,
      poItem: item.PoItem,
      materialNo: item.MaterialNo,
      description: item.Description,
      quantity: item.Quantity,
      unitPrice: item.UnitPrice,
      unit: item.Unit,
    }));
    
    res.status(200).json({ status: 'success', invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error.response?.data || error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve invoice data',
      details: error.response?.data?.error?.message?.value || error.message,
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

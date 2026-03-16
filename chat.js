const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'https://yuvraj-practice.myshopify.com'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

app.use(express.json());

const SHOPIFY_STORE_URL = 'https://yuvraj-practice.myshopify.com';
const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.post('/track-order', async (req, res) => {
  const { email, orderNumber } = req.body;

  const query = `
    query getOrders($query: String!) {
      orders(first: 1, query: $query) {
        edges {
          node {
            id
            name
            displayFinancialStatus
            displayFulfillmentStatus
            createdAt
          }
        }
      }
    }
  `;

  try {
    const searchQuery = \`email:${email} AND name:#${orderNumber}\`;

    const response = await axios.post(
      \`${SHOPIFY_STORE_URL}/admin/api/2026-01/graphql.json\`,
      {
        query,
        variables: {
          query: searchQuery
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': ACCESS_TOKEN
        }
      }
    );

    const orderData = response?.data?.data?.orders?.edges?.[0]?.node;

    if (!orderData) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.json({
      message: \`Your order ${orderData.name} is currently ${orderData.displayFinancialStatus} and ${orderData.displayFulfillmentStatus}.\`
    });
  } catch (error) {
    console.error('Shopify error:', error?.response?.data || error.message);
    return res.status(500).json({ message: 'Failed to fetch order details' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(\`Server is running on port ${port}\`);
});
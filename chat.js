const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Middleware to parse JSON body data
app.use(express.json());

// Replace with your Shopify store details and token
const SHOPIFY_STORE_URL = 'https://yuvraj-practice.myshopify.com';
const ACCESS_TOKEN = 'shpua_8f5f22f50ecfc701bf0a1fe69cafa794';

// API route to handle chatbot requests
app.post('/track-order', async (req, res) => {
  const { email, orderNumber } = req.body;

  // Define the GraphQL query for fetching order by email and order number
  const query = `
    query getOrder($email: String!, $orderNumber: String!) {
      orders(first: 1, query: "email:order.itgeeks@gmail.com order_number:1130") {
        edges {
          node {
            id
            orderNumber
            financialStatus
            fulfillmentStatus
            createdAt
            lineItems(first: 5) {
              edges {
                node {
                  title
                  quantity
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    // Make a request to the Shopify GraphQL Admin API
    const response = await axios.post(
      `${SHOPIFY_STORE_URL}/admin/api/2023-01/graphql.json`, 
      {
        query: query,
        variables: {
          email: email,
          orderNumber: orderNumber
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': ACCESS_TOKEN // Authorization with access token
        }
      }
    );

    // Check if the order is found
    const orderData = response.data.data.orders.edges[0]?.node;

    if (orderData) {
      res.json({
        message: `Your order #${orderData.orderNumber} is currently ${orderData.financialStatus}.`
      });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Failed to fetch order details' });
    
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
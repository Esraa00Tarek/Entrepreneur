import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, Typography, Box, Divider, Grid } from '@mui/material';

const TransactionReceipt = () => {
  const { transactionId } = useParams();

  // TODO: Fetch transaction details from backend using transactionId
  const transactionDetails = {
    id: transactionId,
    date: new Date().toLocaleString(),
    status: 'Completed',
    amount: 1000.00,
    currency: 'USD',
    service: 'Business Consultation',
    payer: {
      name: 'John Doe',
      email: 'john@example.com',
      business: 'Doe Enterprises'
    },
    receiver: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      business: 'Smith Consulting'
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: '800px', margin: '0 auto' }}>
      <Card elevation={3}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">Transaction Receipt</Typography>
            <Typography variant="h6">#{transactionDetails.id}</Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Payment Details</Typography>
              <Typography>Date: {transactionDetails.date}</Typography>
              <Typography>Status: {transactionDetails.status}</Typography>
              <Typography>Amount: {transactionDetails.currency} {transactionDetails.amount}</Typography>
              <Typography>Service: {transactionDetails.service}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Payer Information</Typography>
              <Typography>Name: {transactionDetails.payer.name}</Typography>
              <Typography>Email: {transactionDetails.payer.email}</Typography>
              <Typography>Business: {transactionDetails.payer.business}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Receiver Information</Typography>
              <Typography>Name: {transactionDetails.receiver.name}</Typography>
              <Typography>Email: {transactionDetails.receiver.email}</Typography>
              <Typography>Business: {transactionDetails.receiver.business}</Typography>
            </Grid>
          </Grid>

          <Box mt={4} textAlign="center">
            <Typography variant="caption" color="textSecondary">
              This is an electronic receipt for your transaction. Please keep it for your records.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TransactionReceipt;
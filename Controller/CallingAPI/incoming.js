const express = require('express');
 
const router = express.Router();

 
 
// POST endpoint for the webhook
router.post('/webhook/incoming', (req, res) => {
  
    const data = req.body;

    // Extracting the main details from the webhook
    const overallCallStatus = data.Overall_Call_Status;
    const callerID = data.Caller_ID;
    const customerName = data.Customer_Name;
    const clientCorrelationId = data.Client_Correlation_Id;
    const participants = data.participants;

    // Example: Log the received data
    console.log('Overall Call Status:', overallCallStatus);
    console.log('Caller ID:', callerID);
    console.log('Customer Name:', customerName);
    console.log('Client Correlation ID:', clientCorrelationId);
    console.log('Participants:', participants);

    // Process the webhook data here (save to database, trigger other processes, etc.)

    // Send a response back to acknowledge receipt of the webhook
    res.status(200).json({ message: 'Webhook received successfully' });


  // You can process the incoming data here

  // Send a success response
  res.status(200).json({ message: 'Webhook received successfully' });
});

module.exports = router;



 
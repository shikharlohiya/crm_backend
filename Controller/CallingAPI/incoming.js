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
  // res.status(200).json({ message: 'Webhook received successfully' });
});

module.exports = router;


////
// POST endpoint for the webhook
router.post('/webhook/pingback', (req, res) => {
  
  const data = req.body;

  // Extracting the main details from the webhook
   console.log(data , '------------------');
  const A_PARTY_NO = data.A_PARTY_NO;
  const CALL_START_TIME = data.CALL_START_TIME;
  const A_PARTY_DIAL_START_TIME = data.A_PARTY_DIAL_START_TIME;
  const A_PARTY_CONNECTED_TIME = data.A_PARTY_CONNECTED_TIME;
  


  // Example: Log the received data
  console.log('A_PARTY_NO:', A_PARTY_NO);
  console.log('CALL_START_TIME:', CALL_START_TIME);
  console.log('A_PARTY_DIAL_START_TIME:', A_PARTY_DIAL_START_TIME);
  console.log('A_PARTY_CONNECTED_TIME:', A_PARTY_CONNECTED_TIME);
 

  // Process the webhook data here (save to database, trigger other processes, etc.)

  // Send a response back to acknowledge receipt of the webhook
  res.status(200).json({ message: 'PingBack API Run Successfully' });


// You can process the incoming data here

// Send a success response
// res.status(200).json({ message: 'Webhook received successfully' });
});

module.exports = router;



 
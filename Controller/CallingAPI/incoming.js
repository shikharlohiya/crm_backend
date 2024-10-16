const express = require('express');
 
const router = express.Router();

const moment = require('moment');
const CallLog  = require('../../models/CallLog');
 
// // POST endpoint for the webhook
// router.post('/webhook/incoming', (req, res) => {
  
//     const data = req.body;

//     // Extracting the main details from the webhook
//     const overallCallStatus = data.Overall_Call_Status;
//     const callerID = data.Caller_ID;
//     const customerName = data.Customer_Name;
//     const clientCorrelationId = data.Client_Correlation_Id;
//     const participants = data.participants;


//     // Example: Log the received data
//     console.log('Overall Call Status:', overallCallStatus);
//     console.log('Caller ID:', callerID);
//     console.log('Customer Name:', customerName);
//     console.log('Client Correlation ID:', clientCorrelationId);
//     console.log('Participants:', participants);

//     // Process the webhook data here (save to database, trigger other processes, etc.)

//     // Send a response back to acknowledge receipt of the webhook
//     res.status(200).json({ message: 'Webhook received successfully' });


//   // You can process the incoming data here

//   // Send a success response
//   // res.status(200).json({ message: 'Webhook received successfully' });
// });




// router.post('/webhook/pingback', async (req, res) => {
//   const data = req.body;
//   console.log(data, '------------------');

//   try {
//     // Extracting all relevant details from the webhook
//     const {
//       SERVICE_TYPE,
//       EVENT_TYPE,
//       CALL_ID,
//       DNI,
//       A_PARTY_NO,
//       CALL_START_TIME,
//       A_PARTY_DIAL_START_TIME,
//       A_PARTY_DIAL_END_TIME,
//       A_PARTY_CONNECTED_TIME,
//       A_DIAL_STATUS,
//       A_PARTY_END_TIME,
//       A_PARTY_RELEASE_REASON,
//       B_PARTY_NO,
//       B_PARTY_DIAL_START_TIME,
//       B_PARTY_DIAL_END_TIME,
//       B_PARTY_CONNECTED_TIME,
//       B_PARTY_END_TIME,
//       B_PARTY_RELEASE_REASON,
//       B_DIAL_STATUS,
//       C_PARTY_NO,
//       C_PARTY_DIAL_START_TIME,
//       C_PARTY_DIAL_END_TIME,
//       C_PARTY_CONNECTED_TIME,
//       C_PARTY_END_TIME,
//       C_PARTY_RELEASE_REASON,
//       C_DIAL_STATUS,
//       REF_ID,
//       RecordVoice,
//       DISCONNECTED_BY,
//     } = data;

//     // Logging main details as in the original code
//     console.log('A_PARTY_NO:', A_PARTY_NO);
//     console.log('CALL_START_TIME:', CALL_START_TIME);
//     console.log('A_PARTY_DIAL_START_TIME:', A_PARTY_DIAL_START_TIME);
//     console.log('A_PARTY_CONNECTED_TIME:', A_PARTY_CONNECTED_TIME);

//     // Function to parse date-time strings
//     const parseDateTime = (dateTimeString) => {
//       return dateTimeString ? moment(dateTimeString, 'DDMMYYYYHHmmss').toDate() : null;
//     };

//     // Save the call log to the database
//     const callLog = await CallLog.create({
//       serviceType: SERVICE_TYPE,
//       eventType: EVENT_TYPE,
//       callId: CALL_ID,
//       dni: DNI,
//       aPartyNo: A_PARTY_NO,
//       callStartTime: parseDateTime(CALL_START_TIME),
//       aPartyDialStartTime: parseDateTime(A_PARTY_DIAL_START_TIME),
//       aPartyDialEndTime: parseDateTime(A_PARTY_DIAL_END_TIME),
//       aPartyConnectedTime: parseDateTime(A_PARTY_CONNECTED_TIME),
//       aDialStatus: A_DIAL_STATUS,
//       aPartyEndTime: parseDateTime(A_PARTY_END_TIME),
//       aPartyReleaseReason: A_PARTY_RELEASE_REASON,
//       bPartyNo: B_PARTY_NO,
//       bPartyDialStartTime: parseDateTime(B_PARTY_DIAL_START_TIME),
//       bPartyDialEndTime: parseDateTime(B_PARTY_DIAL_END_TIME),
//       bPartyConnectedTime: parseDateTime(B_PARTY_CONNECTED_TIME),
//       bPartyEndTime: parseDateTime(B_PARTY_END_TIME),
//       bPartyReleaseReason: B_PARTY_RELEASE_REASON,
//       bDialStatus: B_DIAL_STATUS,
//       cPartyNo: C_PARTY_NO,
//       cPartyDialStartTime: parseDateTime(C_PARTY_DIAL_START_TIME),
//       cPartyDialEndTime: parseDateTime(C_PARTY_DIAL_END_TIME),
//       cPartyConnectedTime: parseDateTime(C_PARTY_CONNECTED_TIME),
//       cPartyEndTime: parseDateTime(C_PARTY_END_TIME),
//       cPartyReleaseReason: C_PARTY_RELEASE_REASON,
//       cDialStatus: C_DIAL_STATUS,
//       refId: REF_ID,
//       recordVoice: RecordVoice,
//       disconnectedBy: DISCONNECTED_BY,
//     });

//     console.log('Call log saved:', callLog.id);

//     // Send a response back to acknowledge receipt of the webhook
//     res.status(200).json({ message: 'PingBack API Run Successfully', callLogId: callLog.id });
//   } catch (error) {
//     console.error('Error processing webhook:', error);
//     res.status(500).json({ message: 'Error processing webhook', error: error.message });
//   }
// });






router.post('/webhook/pingback', async (req, res) => {
  const data = req.body;
  console.log(data, '------------------');

  try {
    // Extracting all relevant details from the webhook
    const {
      SERVICE_TYPE,
      EVENT_TYPE,
      CALL_ID,
      DNI,
      A_PARTY_NO,
      CALL_START_TIME,
      A_PARTY_DIAL_START_TIME,
      A_PARTY_DIAL_END_TIME,
      A_PARTY_CONNECTED_TIME,
      A_DIAL_STATUS,
      A_PARTY_END_TIME,
      A_PARTY_RELEASE_REASON,
      B_PARTY_NO,
      B_PARTY_DIAL_START_TIME,
      B_PARTY_DIAL_END_TIME,
      B_PARTY_CONNECTED_TIME,
      B_PARTY_END_TIME,
      B_PARTY_RELEASE_REASON,
      B_DIAL_STATUS,
      C_PARTY_NO,
      C_PARTY_DIAL_START_TIME,
      C_PARTY_DIAL_END_TIME,
      C_PARTY_CONNECTED_TIME,
      C_PARTY_END_TIME,
      C_PARTY_RELEASE_REASON,
      C_DIAL_STATUS,
      REF_ID,
      RecordVoice,
      DISCONNECTED_BY,
    } = data;

    // Logging main details
    console.log('A_PARTY_NO:', A_PARTY_NO);
    console.log('CALL_START_TIME:', CALL_START_TIME);
    console.log('A_PARTY_DIAL_START_TIME:', A_PARTY_DIAL_START_TIME);
    console.log('A_PARTY_CONNECTED_TIME:', A_PARTY_CONNECTED_TIME);

    // Function to parse date-time strings
    const parseDateTime = (dateTimeString) => {
      return dateTimeString ? moment(dateTimeString, 'DDMMYYYYHHmmss').toDate() : null;
    };

    // Prepare the data object
    const callData = {
      serviceType: SERVICE_TYPE,
      eventType: EVENT_TYPE,
      callId: CALL_ID,
      dni: DNI,
      aPartyNo: A_PARTY_NO,
      callStartTime: parseDateTime(CALL_START_TIME),
      aPartyDialStartTime: parseDateTime(A_PARTY_DIAL_START_TIME),
      aPartyDialEndTime: parseDateTime(A_PARTY_DIAL_END_TIME),
      aPartyConnectedTime: parseDateTime(A_PARTY_CONNECTED_TIME),
      aDialStatus: A_DIAL_STATUS,
      aPartyEndTime: parseDateTime(A_PARTY_END_TIME),
      aPartyReleaseReason: A_PARTY_RELEASE_REASON,
      bPartyNo: B_PARTY_NO,
      bPartyDialStartTime: parseDateTime(B_PARTY_DIAL_START_TIME),
      bPartyDialEndTime: parseDateTime(B_PARTY_DIAL_END_TIME),
      bPartyConnectedTime: parseDateTime(B_PARTY_CONNECTED_TIME),
      bPartyEndTime: parseDateTime(B_PARTY_END_TIME),
      bPartyReleaseReason: B_PARTY_RELEASE_REASON,
      bDialStatus: B_DIAL_STATUS,
      cPartyNo: C_PARTY_NO,
      cPartyDialStartTime: parseDateTime(C_PARTY_DIAL_START_TIME),
      cPartyDialEndTime: parseDateTime(C_PARTY_DIAL_END_TIME),
      cPartyConnectedTime: parseDateTime(C_PARTY_CONNECTED_TIME),
      cPartyEndTime: parseDateTime(C_PARTY_END_TIME),
      cPartyReleaseReason: C_PARTY_RELEASE_REASON,
      cDialStatus: C_DIAL_STATUS,
      refId: REF_ID,
      recordVoice: RecordVoice,
      disconnectedBy: DISCONNECTED_BY,
    };

    // Remove any undefined values
    Object.keys(callData).forEach(key => callData[key] === undefined && delete callData[key]);

    // Check if a call log with this CALL_ID already exists
    let callLog = await CallLog.findOne({ where: { callId: CALL_ID } });

    if (callLog) {
      // Update existing call log
      await callLog.update(callData);
      console.log('Call log updated:', callLog.id);
    } else {
      // Create new call log
      callLog = await CallLog.create(callData);
      console.log('New call log created:', callLog.id);
    }

    // Send a response back to acknowledge receipt of the webhook
    res.status(200).json({ 
      message: 'PingBack API Run Successfully', 
      callLogId: callLog.id,
      eventType: EVENT_TYPE,
      updatedFields: Object.keys(callData)
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ message: 'Error processing webhook', error: error.message });
  }
});
 
module.exports = router;



 
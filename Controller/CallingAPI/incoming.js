const express = require('express');
 
const router = express.Router();

const moment = require('moment');
const CallLog  = require('../../models/CallLog');
const axios = require('axios');



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

    // Logging main details as in the original code
    console.log('A_PARTY_NO:', A_PARTY_NO);
    console.log('CALL_START_TIME:', CALL_START_TIME);
    console.log('A_PARTY_DIAL_START_TIME:', A_PARTY_DIAL_START_TIME);
    console.log('A_PARTY_CONNECTED_TIME:', A_PARTY_CONNECTED_TIME);

    // Function to parse date-time strings
    const parseDateTime = (dateTimeString) => {
      return dateTimeString ? moment(dateTimeString, 'DDMMYYYYHHmmss').toDate() : null;
    };

    // Save the call log to the database
    const callLog = await CallLog.create({
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
    });

    console.log('Call log saved:', callLog.id);

    // Send a response back to acknowledge receipt of the webhook
    res.status(200).json({ message: 'PingBack API Run Successfully', callLogId: callLog.id });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ message: 'Error processing webhook', error: error.message });
  }
});


///

router.get('/call-logs/:callId/b-party-connection', async (req, res) => {
  try {
    const { callId } = req.params;

    // Find the call log entry with the specified callId and eventType
    const callLog = await CallLog.findOne({
      where: {
        callId: callId,
        eventType: 'B party Connected/Notconnected'
      }
    });

    if (!callLog) {
      return res.status(201).json({ message: 'B party connecting' });
    }

    // Extract relevant information
    const response = {
      callId: callLog.callId,
      eventType: callLog.eventType,
      aPartyNo: callLog.aPartyNo,
      bPartyNo: callLog.bPartyNo,
      bPartyDialStartTime: callLog.bPartyDialStartTime,
      bPartyDialEndTime: callLog.bPartyDialEndTime,
      bPartyConnectedTime: callLog.bPartyConnectedTime,
      bDialStatus: callLog.bDialStatus,
      bPartyReleaseReason: callLog.bPartyReleaseReason
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching B party connection event:', error);
    res.status(500).json({ message: 'Error fetching B party connection event', error: error.message });
  }
});





router.get('/call-logs/:callId/call-end', async (req, res) => {
  try {
    const { callId } = req.params;

    // Find the call log entry with the specified callId and eventType
    const callLog = await CallLog.findOne({
      where: {
        callId: callId,
        eventType: 'Call End'
      }
    });

    if (!callLog) {
      return res.status(201).json({ message: 'Call is still ongoing or not found' });
    }

    // Extract relevant information
    const response = {
      callId: callLog.callId,
      eventType: callLog.eventType,
      aPartyNo: callLog.aPartyNo,
      bPartyNo: callLog.bPartyNo,
      callStartTime: callLog.callStartTime,
      aPartyEndTime: callLog.aPartyEndTime,
      bPartyEndTime: callLog.bPartyEndTime,
      aPartyReleaseReason: callLog.aPartyReleaseReason,
      bPartyReleaseReason: callLog.bPartyReleaseReason,
      recordVoice: callLog.recordVoice,
      disconnectedBy: callLog.disconnectedBy
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching Call End event:', error);
    res.status(500).json({ message: 'Error fetching Call End event', error: error.message });
  }
});


///incoming
router.post('/incoming-call', async (req, res) => {
  const { Callid, dni, cli } = req.body;
  console.log('Incoming call:', { Callid, dni, cli });

  // Here you would implement your logic to select an agent
  // For this example, we'll just use a dummy agent number
  const agentNumber = "7723037733";

  res.json({ agent: agentNumber });
});



//incoming-call-connect
router.post('/api/Data/json', (req, res) => {
  const data = req.body
  res.status(200).json({ message: 'API Run Successfully',data });
});

//auth-token
router.post('/get-auth-token', async (req, res) => {
  try {
    const vodafoneAuthUrl = 'https://cts.myvi.in:8443/Cpaas/api/clicktocall/AuthToken';
    const authBody = {
      username: process.env.VODAFONE_USERNAME || 'admin3210',
      password: process.env.VODAFONE_PASSWORD || 'admin3210'
    };

    const response = await axios.post(vodafoneAuthUrl, authBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Assuming the Vodafone API returns the token in the response
    const token = response.data; // Adjust this based on the actual response structure
    console.log(token, "----------------");
    

    res.json({ token });
  } catch (error) {
    console.error('Error obtaining auth token:', error);
    res.status(500).json({ message: 'Error obtaining auth token', error: error.message });
  }
});



//call initiate
router.post('/initiate-call', async (req, res) => {
  try {
    // Extract the bearer token from the request headers
    const bearerToken = req.headers.authorization;

    if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No bearer token provided' });
    }

    const token = bearerToken.split(' ')[1];

    // The URL of the Vodafone Click-to-Call API
    const vodafoneApiUrl = 'https://cts.myvi.in:8443/Cpaas/api/clicktocall/initiate-call';

    // Forward the request body to the Vodafone API
    const vodafoneResponse = await axios.post(vodafoneApiUrl, req.body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    // Send the Vodafone API response back to the client
    res.status(vodafoneResponse.status).json(vodafoneResponse.data);

  } catch (error) {
    console.error('Error initiating call:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      res.status(500).json({ message: 'No response received from Vodafone API' });
    } else {
      // Something happened in setting up the request that triggered an Error
      res.status(500).json({ message: 'Error setting up the request', error: error.message });
    }
  }
});

//holdORresume 
router.post('/hold-or-resume', async (req, res) => {
  try {
    // Extract the bearer token from the request headers
    const bearerToken = req.headers.authorization;

    if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No bearer token provided' });
    }

    const token = bearerToken.split(' ')[1];

    // The URL of the Vodafone Hold or Resume API
    const vodafoneApiUrl = 'https://cts.myvi.in:8443/Cpaas/api/clicktocall/HoldorResume';

    // Forward the request body to the Vodafone API
    const vodafoneResponse = await axios.post(vodafoneApiUrl, req.body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    // Send the Vodafone API response back to the client
    res.status(vodafoneResponse.status).json(vodafoneResponse.data);

  } catch (error) {
    console.error('Error in Hold or Resume operation:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      res.status(500).json({ message: 'No response received from Vodafone API' });
    } else {
      // Something happened in setting up the request that triggered an Error
      res.status(500).json({ message: 'Error setting up the request', error: error.message });
    }
  }
});


//call-End
router.post('/call-disconnection', async (req, res) => {
  try {
    // Extract the bearer token from the request headers
    const bearerToken = req.headers.authorization;

    if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No bearer token provided' });
    }

    const token = bearerToken.split(' ')[1];

    // The URL of the Vodafone Call Disconnection API
    const vodafoneApiUrl = 'https://cts.myvi.in:8443/Cpaas/api/clicktocall/CallDisconnection';

    // Forward the request body to the Vodafone API
    const vodafoneResponse = await axios.post(vodafoneApiUrl, req.body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    // Send the Vodafone API response back to the client
    res.status(vodafoneResponse.status).json(vodafoneResponse.data);

  } catch (error) {
    console.error('Error in Call Disconnection operation:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      res.status(500).json({ message: 'No response received from Vodafone API' });
    } else {
      // Something happened in setting up the request that triggered an Error
      res.status(500).json({ message: 'Error setting up the request', error: error.message });
    }
  }
});

























 
module.exports = router;



 
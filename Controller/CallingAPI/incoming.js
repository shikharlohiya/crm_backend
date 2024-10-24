const express = require('express');
 
const router = express.Router();

// const moment = require('moment');
const CallLog  = require('../../models/CallLog');
const axios = require('axios');
const moment = require('moment-timezone'); // Ensure moment-timezone is required
const IncomingCall = require('../../models/IncomingCall');
const { Op } = require('sequelize');
const PostCallData = require('../../models/PostCallData');


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


    // Function to parse date-time strings
    // const parseDateTime = (dateTimeString) => {
    //   return dateTimeString ? moment(dateTimeString, 'DDMMYYYYHHmmss').toDate() : null;
    // };
    const parseDateTime = (dateTimeString) => {
      return dateTimeString 
        ? moment.tz(dateTimeString, 'DDMMYYYYHHmmss', 'Asia/Kolkata').toDate() 
        : null;
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


router.post('/incoming-call', async (req, res) => {
  try {
    const {
      event,
      callid,
      ivr_number,
      caller_no,
      agent_number
    } = req.body;

    console.log('Incoming call data:', req.body);

    // Create a new call record
    const call = await IncomingCall.create({
      callId: callid,
      event: event,
      ivrNumber: ivr_number,
      callerNumber: caller_no,
      agentNumber: agent_number
      // Note: agentNumber and connectedAt are not set at this stage
    });

    return res.status(200).json({
      success: true,
      message: 'Incoming call data received and processed',
      callId: call.id
    });

  } catch (error) {
    console.error('Error processing incoming call data:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing incoming call data',
      error: error.message
    });
  }
});


router.post('/incoming-call/connect', async (req, res) => {
  try {
    const {
      event,
      callid,
      ivr_number,
      caller_no,
      agent_number
    } = req.body;

    console.log('Incoming call connect data:', req.body);

    // Find or create the call record
    const [call, created] = await IncomingCall.findOrCreate({
      where: { callId: callid },
      defaults: {
        event: event,
        ivrNumber: ivr_number,
        callerNumber: caller_no,
        agentNumber: agent_number,
        connectedAt: new Date()
      }
    });

    if (!created) {
      // If the record already existed, update it
      await call.update({
        event: event,
        ivrNumber: ivr_number,
        callerNumber: caller_no,
        agentNumber: agent_number,
        connectedAt: new Date()
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Call connect data received and processed',
      callId: call.id,
      isNewCall: created
    });

  } catch (error) {
    console.error('Error processing incoming call connect data:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing incoming call connect data',
      error: error.message
    });
  }
});



//incoming-call-connect
// router.post('/Data/json', (req, res) => {
//   const data = req.body
//   res.status(200).json({ message: 'API Run Successfully',data });
// });

router.post('/Data/json', async (req, res) => {
  try {
    const {
      callid,
      event,
      ivr_number,
      caller_no,
      call_start_time,
      call_end_time,
      dtmf,
      og_start_time,
      og_end_time,
      og_call_status,
      agent_number,
      total_call_duration,
      voice_recording
    } = req.body;

    console.log('Post-call data:', req.body);

    // Check if the call exists in IncomingCall
    let incomingCall = await IncomingCall.findOne({ where: { callId: callid } });

    if (!incomingCall) {
      console.log(`No matching incoming call found for callId: ${callid}`);
    }

    // Create a new PostCallData record
    const postCallData = await PostCallData.create({
      callId: callid,
      event: event,
      ivrNumber: ivr_number,
      callerNumber: caller_no,
      callStartTime: new Date(parseInt(call_start_time)),
      callEndTime: new Date(parseInt(call_end_time)),
      dtmf: dtmf,
      ogStartTime: new Date(parseInt(og_start_time)),
      ogEndTime: new Date(parseInt(og_end_time)),
      ogCallStatus: og_call_status,
      agentNumber: agent_number,
      totalCallDuration: parseInt(total_call_duration),
      voiceRecording: voice_recording
    });

    // If IncomingCall exists, update its status
    if (incomingCall) {
      await incomingCall.update({
        event: 'call_ended',
        endedAt: new Date(parseInt(call_end_time))
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Post-call data received and processed',
      postCallDataId: postCallData.id
    });

  } catch (error) {
    console.error('Error processing post-call data:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing post-call data',
      error: error.message
    });
  }
});




//auth-token
router.post('/get-auth-token', async (req, res) => {
  try {
    const vodafoneAuthUrl = 'https://cts.myvi.in:8443/Cpaas/api/clicktocall/AuthToken';
    const authBody = {
      username: process.env.VODAFONE_USERNAME || 'ABIS123',
      password: process.env.VODAFONE_PASSWORD || 'ABIS@123'
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

///
router.get('/call-statistics/:aPartyNo', async (req, res) => {
  try {
    const { aPartyNo } = req.params;

    // Fetch all call logs for the given A-party number
    const callLogs = await CallLog.findAll({
      where: { aPartyNo },
      order: [['callStartTime', 'DESC']]
    });

    let connectedCalls = 0;
    let notConnectedCalls = 0;
    let totalDuration = 0;

    const callDetails = callLogs.map(call => {
      const startTime = new Date(call.callStartTime);
      const endTime = new Date(call.aPartyEndTime);
      const duration = (endTime - startTime) / 1000; // duration in seconds

      if (call.aDialStatus === 'Connected') {
        connectedCalls++;
        totalDuration += duration;
      } else {
        notConnectedCalls++;
      }

      return {
        callId: call.callId,
        startTime: call.callStartTime,
        duration: duration,
        status: call.aDialStatus
      };
    });

    const totalCalls = connectedCalls + notConnectedCalls;
    const averageDuration = connectedCalls > 0 ? totalDuration / connectedCalls : 0;

    const response = {
     "AgentNo": aPartyNo,
      totalCalls,
      connectedCalls,
      notConnectedCalls,
      totalDuration,
      averageDuration,
      callDetails
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching call statistics:', error);
    res.status(500).json({ message: 'Error fetching call statistics', error: error.message });
  }
});


//
router.get('/latest-agent-call/:agentNumber', async (req, res) => {
  try {
    const { agentNumber } = req.params;

    console.log(agentNumber, '-----------------');
    

    const latestCall = await IncomingCall.findOne({
      where: {
        agentNumber: agentNumber,
        event: 'oncallconnect',
        connectedAt: { [Op.not]: null }
      },
      order: [['connectedAt', 'DESC']]
    });

    if (!latestCall) {
      return res.status(404).json({
        success: false,
        message: 'No connected calls found for this agent'
      });
    }

    res.status(200).json({
      success: true,
      data: latestCall
    });

  } catch (error) {
    console.error('Error fetching latest agent call detail:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching latest agent call detail',
      error: error.message
    });
  }
});



router.post('/merge-call', async (req, res) => {
  try {
    // Extract the bearer token from the request headers
    const bearerToken = req.headers.authorization;

    if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No bearer token provided' });
    }

    const token = bearerToken.split(' ')[1];

    // The URL of the Vodafone Call Conference API
    const vodafoneApiUrl = 'https://cts.myvi.in:8443/Cpaas/api/clicktocall/callConference';

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
    console.error('Error in Merge Call operation:', error);
    
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



 
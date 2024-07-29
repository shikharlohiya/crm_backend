// const express = require('express');
// const router = express.Router();
// const Meeting = require('../../models/lead_meeting');
// const Lead_Detail = require('../../models/lead_detail');

// exports.createMeeting = async (req, res) => {
//     try {
//       const {
//         LeadDetailId,
//         BirdsCapacity,
//         LandDimension,
//         ShedSize,
//         IsLandDirectionEastWest,
//         DirectionDeviationDegree,
//         ElectricityPower,
//         Water,
//         ApproachRoad,
//         ModelType,
//         EstimationRequirement,
//         Image,
//         ActionType
//       } = req.body;
  
//       // Check if the lead detail exists
//       const leadDetail = await Lead_Detail.findByPk(LeadDetailId);
//       if (!leadDetail) {
//         return res.status(404).json({ error: 'Lead detail not found' });
//       }
  
//       // Create a new meeting
//       const meeting = await Meeting.create({
//         LeadDetailId,
//         BirdsCapacity,
//         LandDimension,
//         ShedSize,
//         IsLandDirectionEastWest,
//         DirectionDeviationDegree,
//         ElectricityPower,
//         Water,
//         ApproachRoad,
//         ModelType,
//         EstimationRequirement,
//         Image,
//         ActionType
//       });
  
//       res.status(201).json(meeting);
//     } catch (error) {
//       console.error('Error creating meeting:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   };

 

const express = require('express');
const router = express.Router();
const Meeting = require('../../models/lead_meeting');
const Lead_Detail = require('../../models/lead_detail');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the folder where images will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique filename
  }
});

const upload = multer({ storage: storage });

exports.createMeeting = async (req, res) => {
  try {
    const {
      LeadDetailId,
      BirdsCapacity,
      LandDimension,
      ShedSize,
      IsLandDirectionEastWest,
      DirectionDeviationDegree,
      ElectricityPower,
      Water,
      ApproachRoad,
      EstimationRequirement,
      category,
      sub_category,
      follow_up_date,
      closure_month,
      ModelType,
      ActionType
    } = req.body;

    // Check if the lead detail exists
    const leadDetail = await Lead_Detail.findByPk(LeadDetailId);
    if (!leadDetail) {
      return res.status(404).json({ error: 'Lead detail not found' });
    }

    

    let imageFilenames = [];
    if (req.files && req.files.length > 0) {
      imageFilenames = req.files.map(file => file.filename);
    }

    // Create a new meeting
    const meeting = await Meeting.create({
      LeadDetailId,
      BirdsCapacity,
      LandDimension,
      ShedSize,
      IsLandDirectionEastWest,
      DirectionDeviationDegree,
      ElectricityPower,
      Water,
      ApproachRoad,
      category,
      sub_category,
      follow_up_date,
      closure_month,
      ModelType,
      EstimationRequirement,
      Image: imageFilenames,
      ActionType
    });
    res.status(201).json({ message: 'meeting update successfully', meeting });
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getMeetingsByLeadId = async (req, res) => {
  try {
    const { leadId } = req.params;

    const meetings = await Meeting.findAll({
      where: {
        LeadDetailId: leadId,
      },
    });

    res.status(200).json(meetings);
  } catch (error) {
    console.error('Error retrieving meetings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
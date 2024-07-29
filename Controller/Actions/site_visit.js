const express = require('express');
const router = express.Router();
const site_visit = require('../../models/site_visit');
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

// exports.createSiteMeeting = async (req, res) => {
//   console.log(req.body, "-------------------------90");
//   try {
//     const {
//       LeadDetailId,
//       BirdsCapacity,
//       LandDimension,
//       ShedSize,
//       IsLandDirectionEastWest,
//       DirectionDeviationDegree,
//       ElectricityPower,
//       Water,
//       ApproachRoad,
//       EstimationRequirement,
//       category,
//       sub_category,
//       follow_up_date,
//       closure_month,
//       ModelType,
//       ActionType
//     } = req.body;

//     // Check if the lead detail exists
//     const leadDetail = await Lead_Detail.findByPk(LeadDetailId);
//     if (!leadDetail) {
//       return res.status(404).json({ error: 'Lead detail not found' });
//     }

//     let imageFilenames = [];
//     if (req.files && req.files.length > 0) {
//       imageFilenames = req.files.map(file => file.filename);
//     }

//     // Create a new meeting
//     const siteVisit = await site_visit.create({
//       LeadDetailId,
//       BirdsCapacity,
//       LandDimension,
//       ShedSize,
//       IsLandDirectionEastWest,
//       DirectionDeviationDegree,
//       ElectricityPower,
//       Water,
//       ApproachRoad,
//       category,
//       sub_category,
//       follow_up_date,
//       closure_month,
//       ModelType,
//       EstimationRequirement,
//       Image: imageFilenames,
//       ActionType
//     });

//     res.status(201).json({ message: 'site visit done successfully', siteVisit });
//   } catch (error) {
//     console.error('Error creating meeting:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };



exports.createSiteMeeting = async (req, res) => {
    console.log(req.body, "-------------------------90");
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
      const siteVisit = await site_visit.create({
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
  
      res.status(201).json({ message: 'site visit done successfully', siteVisit });
    } catch (error) {
      console.error('Error creating meeting:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };






exports.getSiteVisitByLeadId = async (req, res) => {
  try {
    const { leadId } = req.params;

    const meetings = await site_visit.findAll({
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
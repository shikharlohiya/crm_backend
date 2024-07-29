const express = require('express');
const router = express.Router();
const Estimation = require('../../models/estimation');
const Lead_Detail = require('../../models/lead_detail');

exports.createEstimation = async (req, res) => {
  try {
    const {
      LeadDetailId,
      EstimationRequirement,
      CivilConstructedStarted,
      ShedLength,
      EquipementPlacementLength,
      ShedWidth,
      CShape,
      ModalType,
      SideWallColumnToColumnGap,
      NumberOfSheds,
      CurtainRequirment,
      DiselBrooderRequirment,
      PowerSupply,
      WaterSupply,
      Remarks,
      category,
      sub_category,
      follow_up_date,
      closure_month,
    } = req.body;

    // Check if the lead detail exists
    const leadDetail = await Lead_Detail.findByPk(LeadDetailId);
    if (!leadDetail) {
      return res.status(404).json({ error: 'Lead detail not found' });
    }

    // Create a new estimation
    const estimation = await Estimation.create({
      LeadDetailId,
      EstimationRequirement,
      CivilConstructedStarted,
      ShedLength,
      EquipementPlacementLength,
      ShedWidth,
      CShape,
      ModalType,
      SideWallColumnToColumnGap,
      NumberOfSheds,
      CurtainRequirment,
      DiselBrooderRequirment,
      PowerSupply,
      WaterSupply,
      Remarks,
      category,
      sub_category,
      follow_up_date,
      closure_month,
    });

    res.status(201).json({ message: 'Estimation Done successfully', estimation });
  } catch (error) {
    console.error('Error creating estimation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getEstimationByLeadId = async (req, res) => {
  try {
    const { leadId } = req.params;

    const estimations = await Estimation.findAll({
      where: {
        LeadDetailId: leadId,
      },
    });

    if (estimations.length === 0) {
      return res.status(200).json({ message: 'No estimations available for the given lead ID' });
    }

    res.status(200).json(estimations);
  } catch (error) {
    console.error('Error retrieving estimations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



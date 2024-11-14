// routes/customerLeadRoutes.js
const express = require('express');

// controllers/customerLeadController.js
const CustomerLeadForm = require('../../models/CustomerLeadForm');



exports.createCustomerLead = async (req, res) => {
    try {
        const {
            CustomerName,
            ContactNumber,
            WhatsAppNumber, // New field
            pincode,
            StateName,
            location,
            otherLocation, // New field
            CustomerMailId,
            EC_Shed_Plan,
            // Planning New EC Shed fields
            LandAvailable,
            Land_Size,
            Unit,
            Electricity,
            WaterAvailabilty,
            ApproachableRoad,
            // Investment fields
            Investment_Budget,
            Project, // New field
            NUmberOfShed,
            Source,
            Remark,

            // Open to EC Shed fields
            IntegrationCompany,
            ShedSize,
            CurrentShedDirection,
            ElectricityPhase,
            CurrentBirdCapacity
        } = req.body;

        // Basic required fields check
        const basicRequiredFields = {
            CustomerName,
            ContactNumber,
            StateName,
            location,
            EC_Shed_Plan,
            Investment_Budget,
            Source
        };

        for (const [field, value] of Object.entries(basicRequiredFields)) {
            if (!value && value !== false) {
                return res.status(400).json({
                    success: false,
                    error: `${field} is required`
                });
            }
        }

        // Contact number validation
        if (!/^\d{10}$/.test(ContactNumber)) {
            return res.status(400).json({
                success: false,
                error: "Contact number must be 10 digits"
            });
        }

        // Email validation if provided
        if (CustomerMailId && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(CustomerMailId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid email format"
            });
        }

        // EC Shed Plan validation
        const validEC_Shed_Plans = ["Planning New EC Shed", "Open to EC Shed"];
        if (!validEC_Shed_Plans.includes(EC_Shed_Plan)) {
            return res.status(400).json({
                success: false,
                error: "Invalid EC_Shed_Plan value"
            });
        }

        // Conditional validation based on EC_Shed_Plan
        if (EC_Shed_Plan === "Planning New EC Shed") {
            // First, validate LandAvailable as it's always required
            if (typeof LandAvailable !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    error: "LandAvailable must be true or false"
                });
            }

            // If LandAvailable is true, validate other required fields
            if (LandAvailable === true) {
                // Check required fields when land is available
                const landAvailableFields = {
                    Land_Size,
                    Unit,
                    Electricity,
                    WaterAvailabilty,
                    ApproachableRoad
                };

                for (const [field, value] of Object.entries(landAvailableFields)) {
                    if (!value && value !== false) {
                        return res.status(400).json({
                            success: false,
                            error: `${field} is required when Land is Available`
                        });
                    }
                }

                // Unit validation
                if (!["Acres", "Beegha", "Sq.ft."].includes(Unit)) {
                    return res.status(400).json({
                        success: false,
                        error: "Invalid Unit value"
                    });
                }

                // Electricity validation
                if (!["Single Phase", "Three Phase"].includes(Electricity)) {
                    return res.status(400).json({
                        success: false,
                        error: "Invalid Electricity value"
                    });
                }

                // Boolean validations for WaterAvailabilty and ApproachableRoad
                if (typeof WaterAvailabilty !== 'boolean' || typeof ApproachableRoad !== 'boolean') {
                    return res.status(400).json({
                        success: false,
                        error: "WaterAvailabilty and ApproachableRoad must be boolean values"
                    });
                }
            }

        } else if (EC_Shed_Plan === "Open to EC Shed") {
            // Validation for Open to EC Shed remains the same
            const openToShedFields = {
                IntegrationCompany,
                ShedSize,
                CurrentShedDirection,
                ElectricityPhase,
                CurrentBirdCapacity
            };

            for (const [field, value] of Object.entries(openToShedFields)) {
                if (!value && value !== 0) {
                    return res.status(400).json({
                        success: false,
                        error: `${field} is required for Open to EC Shed`
                    });
                }
            }

            // Integration Company validation
            if (!["IB Group", "Others"].includes(IntegrationCompany)) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid Integration Company value"
                });
            }

            // Current Shed Direction validation
            if (!["East West", "North South"].includes(CurrentShedDirection)) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid Current Shed Direction value"
                });
            }

            // Electricity Phase validation
            if (!["Single Phase", "Three Phase"].includes(ElectricityPhase)) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid Electricity Phase value"
                });
            }

            // Current Bird Capacity validation
            if (!Number.isInteger(Number(CurrentBirdCapacity)) || Number(CurrentBirdCapacity) < 0) {
                return res.status(400).json({
                    success: false,
                    error: "Current Bird Capacity must be a non-negative integer"
                });
            }
        }

        // Investment Budget validation
        const validInvestmentBudgets = [
            "Upto 50 lacs",
            "Between 50 lacs to 1 Cr",
            "Between 1Cr to 1.50 Cr",
            "Between 1.50Cr to 2Cr",
            "Above 2 Cr"
        ];
        if (!validInvestmentBudgets.includes(Investment_Budget)) {
            return res.status(400).json({
                success: false,
                error: "Invalid Investment_Budget value"
            });
        }

        // Number of shed validation
        if (!Number.isInteger(Number(NUmberOfShed)) || Number(NUmberOfShed) < 1) {
            return res.status(400).json({
                success: false,
                error: "Number of Shed must be a positive integer"
            });
        }

        // Create customer lead with conditional fields
        const customerLead = await CustomerLeadForm.create({
            CustomerName,
            ContactNumber,
            pincode,
            StateName,
            location,
            otherLocation, // New field
            CustomerMailId,
            EC_Shed_Plan,
            LandAvailable: EC_Shed_Plan === "Planning New EC Shed" ? LandAvailable : null,
            // Only set these fields if LandAvailable is true
            Land_Size: (EC_Shed_Plan === "Planning New EC Shed" && LandAvailable) ? Land_Size : null,
            Unit: (EC_Shed_Plan === "Planning New EC Shed" && LandAvailable) ? Unit : null,
            Electricity: (EC_Shed_Plan === "Planning New EC Shed" && LandAvailable) ? Electricity : null,
            WaterAvailabilty: (EC_Shed_Plan === "Planning New EC Shed" && LandAvailable) ? WaterAvailabilty : null,
            ApproachableRoad: (EC_Shed_Plan === "Planning New EC Shed" && LandAvailable) ? ApproachableRoad : null,
            // Open to EC Shed fields
            IntegrationCompany: EC_Shed_Plan === "Open to EC Shed" ? IntegrationCompany : null,
            ShedSize: EC_Shed_Plan === "Open to EC Shed" ? ShedSize : null,
            CurrentShedDirection: EC_Shed_Plan === "Open to EC Shed" ? CurrentShedDirection : null,
            ElectricityPhase: EC_Shed_Plan === "Open to EC Shed" ? ElectricityPhase : null,
            CurrentBirdCapacity: EC_Shed_Plan === "Open to EC Shed" ? CurrentBirdCapacity : null,
            Investment_Budget,
            Project, // New field
            NUmberOfShed: Number(NUmberOfShed),
            Source,
            Remark,
            WhatsAppNumber // New field
        });

        return res.status(201).json({
            success: true,
            message: "Customer lead created successfully",
            data: customerLead
        });

    } catch (error) {
        console.error('Error in createCustomerLead:', error);
        
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                error: error.errors.map(e => e.message)
            });
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                success: false,
                error: 'Record already exists'
            });
        }

        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};
const express = require('express');
const router = express.Router();
const models = require('../models/models.js');
const sequelize = require('../models/index.js');
const auth = require('../middleware/check-auth.js');
const Region = require('../models/region.js');
const Parivartan_BDM = require('../models/Parivartan_BDM.js')
const Parivartan_Region = require('../models/Parivartan_Region.js')
const Parivartan_State = require('../models/Parivartan_State.js');


router.get('/places/:pincode',auth, async (req, res) => {
  try {
    const pincode = req.params.pincode;
    const query = `
      SELECT 
        place.PlaceId,
        place.PlaceName,
        place.CityId,
        place.PINCode,
        place.Deleted,
        city.CityId AS "city.CityId",
        city.CityName AS "city.CityName",
        state.StateCode AS "state.StateCode",
        state.StateName AS "state.StateName"
      FROM place_table AS place
      LEFT OUTER JOIN city_table AS city ON place.CityId = city.CityId
      LEFT OUTER JOIN state_table AS state ON city.StateCode = state.StateCode
      WHERE place.PINCode = :pincode;
    `;

    const places = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
      replacements: { pincode: pincode },
    });

    if (places.length > 0) {
      const response = {
        cityId: places[0]["city.CityId"],
        cityName: places[0]["city.CityName"],
        stateCode: places[0]["state.StateCode"],
        stateName: places[0]["state.StateName"],
        places: places.map(place => ({
          placeId: place.PlaceId,
          placeName: place.PlaceName,
        })),
      };

      res.json(response);
    } else {
      res.status(404).json({ error: 'No places found for the provided pincode' });
    }
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/regions', async (req, res) => {
  try {
    const { stateName } = req.query;
    
    if (!stateName) {
      return res.status(400).json({ error: 'State name is required' });
    }

    const regions = await Region.findAll({
      where: {
        stateName: {
          [Op.like]: `%${stateName}%`
        }
      }
    });

    if (regions.length === 0) {
      return res.status(404).json({ message: 'No regions found for the given state name' });
    }

    res.json(regions);
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

 
// API to get regions by state
router.get('/regions/:stateName', async (req, res) => {
  try {
    const { stateName } = req.params;
    const state = await Parivartan_State.findOne({
      where: {
        StateName: stateName,
        Deleted: 'N'
      },
      include: [{
        model: Parivartan_Region,
        where: { Deleted: 'N' },
        attributes: ['RegionId', 'RegionName']
      }]
    });

    if (!state) {
      return res.status(404).json({ message: 'State not found' });
    }

    if (state.parivartan_regions.length === 0) {
      return res.status(404).json({ message: 'No regions found for this state' });
    }

    res.json(state.parivartan_regions);
  } catch (error) {
    console.error('Error in /regions/:stateName:', error);
    res.status(500).json({ error: error.message });
  }
});

// API to get employee by region
 
router.get('/employee/:regionName', async (req, res) => {
  try {
    const { regionName } = req.params;
    const region = await Parivartan_Region.findOne({
      where: {
        RegionName: regionName,
        Deleted: 'N'
      },
      include: [{
        model: Parivartan_BDM,
        where: { Deleted: 'N' },
        attributes: ['EmployeeId', 'EmployeeName']
      }]
    });

    if (!region) {
      return res.status(404).json({ message: 'Region not found' });
    }

    if (region.parivartan_bdms.length === 0) {
      return res.json({ message: 'No employee assigned to this region' });
    }

    const bdm = region.parivartan_bdms[0];
    res.json({
      EmployeeId: bdm.EmployeeId,
      EmployeeName: bdm.EmployeeName
    });
  } catch (error) {
    console.error('Error in /employee/:regionName:', error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
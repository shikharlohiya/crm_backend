// const { uploadFile } = require('../../Library/awsS3');
// const Lead_Document = require('../../models/Lead_converted');

//  exports.createLeadDocument = async function(req, res) {
//   try {
//     const documentUrls = {};

//     // Upload each document to S3 and store the URLs
//     const documentFields = [
//       'customer_creation_form',
//       'pan_card',
//       'aadhar_card',
//       'land_certificate',
//       'gst_certificate',
//       'bank_account_details',
//       'bank_cheques',
//       'legal_agreement_copy',
//       'affidavit_property',
//       'consent_letter_dispatch',
//       'consent_letter_third_party_payment',
//       'estimation',
//       'final_quotation',
//       'annexure',
//       'udyam_registration_certificate',
//       'gram_panchayat_noc',
//     ];

//     for (const fieldName of documentFields) {
//       if (req.files && req.files[fieldName]) {
//         const files = req.files[fieldName];
//         const urls = [];

//         for (const file of files) {
//           const documentResponse = await uploadFile(file, 'lead_documents');
//           const documentUrl = `https://ib-paultry-image.s3.ap-south-2.amazonaws.com/${documentResponse.Key}`;
//           urls.push(documentUrl);
//         }

//         documentUrls[fieldName] = urls;
//       }
//     }

//     // Create a new Lead_Document document
//     const leadDocument = new Lead_Document({
//       LeadDetailId: req.body.LeadDetailId,
//       ...documentUrls,
//     });

//     // Save the Lead_Document document to the database
//     const savedLeadDocument = await leadDocument.save();

//     res.status(201).json({
//       message: 'Lead documents created successfully',
//       leadDocument: savedLeadDocument,
//     });
//   } catch (error) {
//     console.error('Error creating lead documents:', error);
//     res.status(500).json({ error: 'An error occurred while creating the lead documents.' });
//   }
// }

const { uploadFile } = require('../../Library/awsS3');
const Lead_Document = require('../../models/Lead_converted');
const archiver = require('archiver');
const axios = require('axios');


exports.createLeadDocument = async function(req, res) {
  try {

    const { LeadDetailId } = req.body;
    console.log(LeadDetailId , '-----------');
    

    // Check if a document with this LeadDetailId already exists
    // const existingDocument = await Lead_Document.findOne({ LeadDetailId });
    // console.log(existingDocument , '-------');
    
    // if (existingDocument) {
    //   return res.status(400).json({ error: 'This lead has already been converted.' });
    // }

    
    if (!LeadDetailId) {
      return res.status(400).json({ error: 'LeadDetailId is required.' });
    }

    // Check if a document with this LeadDetailId already exists
    const existingDocument = await Lead_Document.findOne({ 
      where: { LeadDetailId: LeadDetailId }
    });
    console.log('Existing document:', existingDocument);

    if (existingDocument) {
      console.log('Existing document found with LeadDetailId:', existingDocument.LeadDetailId);
      return res.status(400).json({ error: 'This lead has already been converted.' });
    }


    const documentUrls = {};

    // Upload each document to S3 and store the URLs
    const documentFields = [
      'payment_slip',
      'customer_creation_form',
      'pan_card',
      'aadhar_card',
      'land_certificate',
      'gst_certificate',
      'bank_account_details',
      'bank_cheques',
      'legal_agreement_copy',
      'affidavit_property',
      'consent_letter_dispatch',
      'consent_letter_third_party_payment',
      'estimation',
      'final_quotation',
      'annexure',
      'udyam_registration_certificate',
      'gram_panchayat_noc',
    ];

    for (const fieldName of documentFields) {
      if (req.files && req.files[fieldName]) {
        const files = req.files[fieldName];
        const urls = [];

        for (const file of files) {
          const documentResponse = await uploadFile(file, 'lead_documents');
          const documentUrl = `https://ib-paultry-image.s3.ap-south-2.amazonaws.com/${documentResponse.Key}`;
          urls.push(documentUrl);
        }

        documentUrls[fieldName] = urls;
      }
    }

    // Create a new Lead_Document document
    const leadDocument = new Lead_Document({
      LeadDetailId: req.body.LeadDetailId,
      payment_amount: req.body.payment_amount,
      remark: req.body.remark,
      ...documentUrls,
    });

    // Save the Lead_Document document to the database
    const savedLeadDocument = await leadDocument.save();

    res.status(201).json({
      message: 'Lead documents created successfully',
      leadDocument: savedLeadDocument,
    });
  } catch (error) {
    console.error('Error creating lead documents:', error);
    res.status(500).json({ error: 'An error occurred while creating the lead documents.' });
  }
};







// exports.getLeadDocumentData = async function(req, res) {
//   try {
//     const { LeadDetailId, zip } = req.query;

//     if (!LeadDetailId) {
//       return res.status(400).json({ error: 'LeadDetailId is required' });
//     }

//     const leadDocument = await Lead_Document.findOne({ LeadDetailId });

//     if (!leadDocument) {
//       return res.status(404).json({ error: 'Lead document not found' });
//     }

//     if (zip === 'true') {
//       // Create a zip file
//       const archive = archiver('zip', {
//         zlib: { level: 9 } // Sets the compression level
//       });

//       // Set the content type and attachment header
//       res.attachment('lead_documents.zip');
//       archive.pipe(res);

//       // Add files to the zip
//       for (const [fieldName, urls] of Object.entries(leadDocument.toObject())) {
//         if (Array.isArray(urls)) {
//           for (let i = 0; i < urls.length; i++) {
//             const url = urls[i];
//             if (typeof url === 'string' && url.startsWith('http')) {
//               const response = await axios.get(url, { responseType: 'arraybuffer' });
//               archive.append(response.data, { name: `${fieldName}_${i + 1}.jpg` });
//             }
//           }
//         }
//       }

//       // Finalize the archive and send the response
//       archive.finalize();
//     } else {
//       // Just return the lead document data
//       res.json(leadDocument);
//     }
//   } catch (error) {
//     console.error('Error retrieving lead document data:', error);
//     res.status(500).json({ error: 'An error occurred while retrieving the lead document data.' });
//   }
// };


exports.getLeadDocumentData = async function(req, res) {
  try {
    const { LeadDetailId, zip } = req.query;

    if (!LeadDetailId) {
      return res.status(400).json({ error: 'LeadDetailId is required' });
    }

    const leadDocument = await Lead_Document.findOne({ where: { LeadDetailId } });

    if (!leadDocument) {
      return res.status(404).json({ error: 'Lead document not found' });
    }

    if (zip === 'true') {
      // Create a zip file
      const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level
      });

      // Set the content type and attachment header
      res.attachment('lead_documents.zip');
      archive.pipe(res);

      // Add files to the zip
      for (const [fieldName, urls] of Object.entries(leadDocument.dataValues)) {
        if (Array.isArray(urls)) {
          for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            if (typeof url === 'string' && url.startsWith('http')) {
              const response = await axios.get(url, { responseType: 'arraybuffer' });
              archive.append(response.data, { name: `${fieldName}_${i + 1}.jpg` });
            }
          }
        }
      }

      // Finalize the archive and send the response
      archive.finalize();
    } else {
      // Just return the lead document data
      res.json(leadDocument);
    }
  } catch (error) {
    console.error('Error retrieving lead document data:', error);
    res.status(500).json({ error: 'An error occurred while retrieving the lead document data.' });
  }
};












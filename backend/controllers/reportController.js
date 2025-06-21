const Report = require('../models/reportModel');
const { getDisasterById } = require('../models/disasterModel');

class ReportController {
  async createReport(req, res) {
    try {
      console.log('Create report request body:', req.body);
      const {
        disaster_id,
        content,
        image_url,
        verification_status,
        verification_details
      } = req.body;
      const user_id = req.user?.id || 'anonymous'; // Fallback for unauthenticated users

      if (!disaster_id || !content) {
        console.log('Validation failed: Missing disaster_id or content');
        return res.status(400).json({ error: 'Disaster ID and content are required' });
      }

      const reportData = {
        disaster_id,
        user_id,
        content,
        image_url,
        verification_status: verification_status || 'pending',
        verification_details: verification_details || {}
      };

      console.log('Attempting to create report with data:', reportData);
      const newReport = await Report.create(reportData);
      console.log('Report created successfully:', newReport);

      // Notify clients about the new report
      if (req.io) {
        req.io.to(`disaster_${disaster_id}`).emit('report_added', newReport);
      }

      res.status(201).json({ message: 'Report created successfully', report: newReport });
    } catch (error) {
      console.error('Error creating report:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }

  async getReportsForDisaster(req, res) {
    try {
      const { disaster_id } = req.params;
      const reports = await Report.findByDisaster(disaster_id);
      res.json({ reports });
    } catch (error) {
      console.error(`Error fetching reports for disaster ${req.params.disaster_id}:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new ReportController(); 
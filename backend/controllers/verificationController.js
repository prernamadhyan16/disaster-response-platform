const geminiService = require('../services/geminiService');
const supabase = require('../config/supabase');

class VerificationController {
  async verifyImage(req, res) {
    try {
      const { id } = req.params;
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required' });
      }

      const { data: disaster, error: disasterError } = await supabase
        .from('disasters')
        .select('id, title')
        .eq('id', id)
        .single();

      if (disasterError || !disaster) {
        return res.status(404).json({ error: 'Disaster not found' });
      }

      const verificationResult = await geminiService.verifyImage(imageUrl);

      const { data: report, error: reportError } = await supabase
        .from('reports')
        .insert({
          disaster_id: id,
          user_id: req.user?.id || 'anonymous',
          image_url: imageUrl,
          verification_status: verificationResult.authentic ? 'verified' : 'suspicious',
          verification_result: verificationResult
        })
        .select()
        .single();

      if (reportError) {
        console.error('Error storing verification result:', reportError);
      }

      res.json({
        disasterId: id,
        imageUrl,
        verification: verificationResult,
        reportId: report?.id,
        message: 'Image verification completed'
      });

    } catch (error) {
      console.error('Error verifying image:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getVerificationHistory(req, res) {
    try {
      const { id } = req.params;

      const { data: reports, error } = await supabase
        .from('reports')
        .select('*')
        .eq('disaster_id', id)
        .not('verification_result', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({ disasterId: id, verifications: reports, count: reports.length });
    } catch (error) {
      console.error('Error fetching verification history:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new VerificationController();

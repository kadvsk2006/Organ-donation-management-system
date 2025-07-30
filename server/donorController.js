const User = require('./User');
const Donation = require('./Donation');
const { sendError, sendSuccess } = require('./helpers');

// Get donor statistics
const getStats = async (donorId, res) => {
    try {
        if (!donorId) {
            return sendError(res, 400, 'Donor ID is required');
        }

        const donations = await Donation.find({ donorId, isActive: true });

        const stats = {
            total: donations.length,
            available: donations.filter(d => d.status === 'available').length,
            matched: donations.filter(d => d.status === 'matched').length,
            used: donations.filter(d => d.status === 'used').length
        };

        sendSuccess(res, 'Stats retrieved successfully', stats);

    } catch (error) {
        console.error('Get donor stats error:', error);
        sendError(res, 500, 'Internal server error');
    }
};

// Get donor donations
const getDonations = async (donorId, res) => {
    try {
        if (!donorId) {
            return sendError(res, 400, 'Donor ID is required');
        }

        const donations = await Donation.find({ 
            donorId, 
            isActive: true 
        }).sort({ createdAt: -1 });

        sendSuccess(res, 'Donations retrieved successfully', donations);

    } catch (error) {
        console.error('Get donations error:', error);
        sendError(res, 500, 'Internal server error');
    }
};

// Create new donation
const createDonation = async (body, res) => {
    try {
        const { donorId, organType, bloodGroup, city, medicalHistory } = body;

        // Validate input
        if (!donorId || !organType || !bloodGroup || !city) {
            return sendError(res, 400, 'Donor ID, organ type, blood group, and city are required');
        }

        // Verify donor exists
        const donor = await User.findById(donorId);
        if (!donor || donor.role !== 'donor') {
            return sendError(res, 404, 'Donor not found');
        }

        // Create donation
        const donation = new Donation({
            donorId,
            organType: organType.toLowerCase(),
            bloodGroup,
            city: city.trim(),
            medicalHistory: medicalHistory ? medicalHistory.trim() : undefined
        });

        await donation.save();

        console.log('Donation created successfully:', donation._id);

        sendSuccess(res, 'Donation registered successfully', donation, 201);

    } catch (error) {
        console.error('Create donation error:', error);
        
        if (error.name === 'ValidationError') {
            return sendError(res, 400, error.message);
        }
        
        sendError(res, 500, 'Internal server error');
    }
};

module.exports = {
    getStats,
    getDonations,
    createDonation
};

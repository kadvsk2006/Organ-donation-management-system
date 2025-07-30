const User = require('./User');
const Request = require('./Request');
const Donation = require('./Donation');
const { sendError, sendSuccess, isBloodGroupCompatible } = require('./helpers');

// Get recipient statistics
const getStats = async (recipientId, res) => {
    try {
        if (!recipientId) {
            return sendError(res, 400, 'Recipient ID is required');
        }

        const requests = await Request.find({ recipientId, isActive: true });

        const stats = {
            total: requests.length,
            pending: requests.filter(r => r.status === 'pending').length,
            approved: requests.filter(r => r.status === 'approved').length,
            matched: requests.filter(r => r.status === 'matched').length
        };

        sendSuccess(res, 'Stats retrieved successfully', stats);

    } catch (error) {
        console.error('Get recipient stats error:', error);
        sendError(res, 500, 'Internal server error');
    }
};

// Get recipient requests
const getRequests = async (recipientId, res) => {
    try {
        if (!recipientId) {
            return sendError(res, 400, 'Recipient ID is required');
        }

        const requests = await Request.find({ 
            recipientId, 
            isActive: true 
        }).sort({ createdAt: -1 });

        sendSuccess(res, 'Requests retrieved successfully', requests);

    } catch (error) {
        console.error('Get requests error:', error);
        sendError(res, 500, 'Internal server error');
    }
};

// Get potential matches for recipient
const getMatches = async (recipientId, res) => {
    try {
        if (!recipientId) {
            return sendError(res, 400, 'Recipient ID is required');
        }

        // Get approved requests for this recipient
        const approvedRequests = await Request.find({
            recipientId,
            status: 'approved',
            isActive: true
        });

        let allMatches = [];

        for (const request of approvedRequests) {
            // Find available donations for this organ type
            const availableDonations = await Donation.find({
                organType: request.organType,
                status: 'available',
                isActive: true
            }).populate('donorId', 'name');

            // Filter by blood group compatibility
            const compatibleDonations = availableDonations.filter(donation => 
                isBloodGroupCompatible(donation.bloodGroup, request.bloodGroup)
            );

            // Create match objects
            const matches = compatibleDonations.map(donation => ({
                _id: donation._id,
                organType: donation.organType,
                bloodGroup: donation.bloodGroup,
                city: donation.city,
                compatibility: calculateCompatibility(donation, request),
                donorName: donation.donorId.name
            }));

            allMatches = allMatches.concat(matches);
        }

        // Sort by compatibility score
        allMatches.sort((a, b) => b.compatibility - a.compatibility);

        sendSuccess(res, 'Matches retrieved successfully', allMatches);

    } catch (error) {
        console.error('Get matches error:', error);
        sendError(res, 500, 'Internal server error');
    }
};

// Create new request
const createRequest = async (body, res) => {
    try {
        const { recipientId, organType, bloodGroup, urgency, reason, hospital } = body;

        // Validate input
        if (!recipientId || !organType || !bloodGroup || !urgency || !reason) {
            return sendError(res, 400, 'Recipient ID, organ type, blood group, urgency, and reason are required');
        }

        // Verify recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient || recipient.role !== 'recipient') {
            return sendError(res, 404, 'Recipient not found');
        }

        // Create request
        const request = new Request({
            recipientId,
            organType: organType.toLowerCase(),
            bloodGroup,
            urgency: urgency.toLowerCase(),
            reason: reason.trim(),
            hospital: hospital ? hospital.trim() : undefined
        });

        await request.save();

        console.log('Request created successfully:', request._id);

        sendSuccess(res, 'Request submitted successfully', request, 201);

    } catch (error) {
        console.error('Create request error:', error);
        
        if (error.name === 'ValidationError') {
            return sendError(res, 400, error.message);
        }
        
        sendError(res, 500, 'Internal server error');
    }
};

// Helper function to calculate compatibility score
const calculateCompatibility = (donation, request) => {
    let score = 70; // Base score

    // Blood group exact match bonus
    if (donation.bloodGroup === request.bloodGroup) {
        score += 20;
    }

    // Urgency bonus
    if (request.urgency === 'critical') {
        score += 10;
    } else if (request.urgency === 'urgent') {
        score += 5;
    }

    return Math.min(score, 100); // Cap at 100%
};

module.exports = {
    getStats,
    getRequests,
    getMatches,
    createRequest
};

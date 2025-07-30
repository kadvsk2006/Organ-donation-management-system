const User = require('./User');
const Request = require('./Request');
const Donation = require('./Donation');
const { sendError, sendSuccess, isBloodGroupCompatible } = require('./helpers');

// Get all potential matches for admin review
const getAllMatches = async (res) => {
    try {
        // Get all approved requests
        const approvedRequests = await Request.find({
            status: 'approved',
            isActive: true
        }).populate('recipientId', 'name email phone age');

        let allMatches = [];

        for (const request of approvedRequests) {
            // Find available donations for this organ type
            const availableDonations = await Donation.find({
                organType: request.organType,
                status: 'available',
                isActive: true
            }).populate('donorId', 'name email phone');

            // Filter by blood group compatibility
            const compatibleDonations = availableDonations.filter(donation => 
                isBloodGroupCompatible(donation.bloodGroup, request.bloodGroup)
            );

            // Create match objects for admin
            const matches = compatibleDonations.map(donation => ({
                _id: `${request._id}-${donation._id}`,
                requestId: request._id,
                donationId: donation._id,
                recipient: {
                    _id: request.recipientId._id,
                    name: request.recipientId.name,
                    email: request.recipientId.email,
                    phone: request.recipientId.phone,
                    age: request.recipientId.age,
                    bloodGroup: request.bloodGroup,
                    urgency: request.urgency,
                    reason: request.reason,
                    hospital: request.hospital
                },
                donor: {
                    _id: donation.donorId._id,
                    name: donation.donorId.name,
                    email: donation.donorId.email,
                    phone: donation.donorId.phone,
                    bloodGroup: donation.bloodGroup,
                    city: donation.city,
                    medicalHistory: donation.medicalHistory
                },
                organType: donation.organType,
                compatibility: calculateCompatibility(donation, request),
                createdAt: request.createdAt
            }));

            allMatches = allMatches.concat(matches);
        }

        // Sort by compatibility score and urgency
        allMatches.sort((a, b) => {
            if (a.recipient.urgency === 'critical' && b.recipient.urgency !== 'critical') return -1;
            if (b.recipient.urgency === 'critical' && a.recipient.urgency !== 'critical') return 1;
            return b.compatibility - a.compatibility;
        });

        sendSuccess(res, 'Matches retrieved successfully', allMatches);

    } catch (error) {
        console.error('Get all matches error:', error);
        sendError(res, 500, 'Internal server error');
    }
};

// Confirm a match (connect donor and recipient)
const confirmMatch = async (body, res) => {
    try {
        const { requestId, donationId, adminId } = body;

        if (!requestId || !donationId || !adminId) {
            return sendError(res, 400, 'Request ID, donation ID, and admin ID are required');
        }

        // Verify admin exists
        const admin = await User.findById(adminId);
        if (!admin || admin.role !== 'admin') {
            return sendError(res, 403, 'Unauthorized access');
        }

        // Find request and donation
        const request = await Request.findById(requestId);
        const donation = await Donation.findById(donationId);

        if (!request || !donation) {
            return sendError(res, 404, 'Request or donation not found');
        }

        if (request.status !== 'approved') {
            return sendError(res, 400, 'Request must be approved first');
        }

        if (donation.status !== 'available') {
            return sendError(res, 400, 'Donation is no longer available');
        }

        // Update request status to matched
        request.status = 'matched';
        request.matchedWith = donationId;
        request.statusHistory.push({
            status: 'matched',
            updatedAt: new Date(),
            updatedBy: adminId,
            notes: 'Matched by admin'
        });

        // Update donation status to matched
        donation.status = 'matched';
        donation.matchedWith = requestId;
        donation.statusHistory.push({
            status: 'matched',
            updatedAt: new Date(),
            updatedBy: adminId,
            notes: 'Matched by admin'
        });

        await request.save();
        await donation.save();

        console.log('Match confirmed:', requestId, '<->', donationId);

        sendSuccess(res, 'Match confirmed successfully', {
            requestId,
            donationId,
            matchedAt: new Date()
        });

    } catch (error) {
        console.error('Confirm match error:', error);
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

    return Math.min(score, 100);
};

module.exports = {
    getAllMatches,
    confirmMatch
};

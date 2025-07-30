const User = require('./User');
const Donation = require('./Donation');
const Request = require('./Request');
const { sendError, sendSuccess } = require('./helpers');

// Get admin overview
const getOverview = async (res) => {
    try {
        // Get counts
        const totalDonors = await User.countDocuments({ role: 'donor', isActive: true });
        const totalRecipients = await User.countDocuments({ role: 'recipient', isActive: true });
        const totalMatches = await Donation.countDocuments({ status: 'matched', isActive: true });
        const pendingActions = await Request.countDocuments({ status: 'pending', isActive: true });

        // Get organ breakdown
        const organBreakdown = await Request.aggregate([
            { $match: { isActive: true } },
            { 
                $group: { 
                    _id: '$organType', 
                    count: { $sum: 1 } 
                } 
            },
            { 
                $project: { 
                    organType: {
                        $concat: [
                            { $toUpper: { $substr: ['$_id', 0, 1] } },
                            { $substr: ['$_id', 1, -1] }
                        ]
                    },
                    count: 1,
                    _id: 0
                } 
            }
        ]);

        // Get recent activity
        const recentDonations = await Donation.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('donorId', 'name');

        const recentRequests = await Request.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('recipientId', 'name');

        const recentActivity = [
            ...recentDonations.map(d => ({
                type: 'donation',
                message: `New ${d.organType} donation registered by ${d.donorId.name}`,
                timestamp: d.createdAt
            })),
            ...recentRequests.map(r => ({
                type: 'request',
                message: `New ${r.organType} request submitted by ${r.recipientId.name}`,
                timestamp: r.createdAt
            }))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

        const overview = {
            totalDonors,
            totalRecipients,
            totalMatches,
            pendingActions,
            organBreakdown,
            recentActivity
        };

        sendSuccess(res, 'Overview retrieved successfully', overview);

    } catch (error) {
        console.error('Get overview error:', error);
        sendError(res, 500, 'Internal server error');
    }
};

// Get pending requests
const getPendingRequests = async (res) => {
    try {
        const pendingRequests = await Request.find({
            status: 'pending',
            isActive: true
        }).populate('recipientId', 'name email phone age').sort({ createdAt: -1 });

        const formattedRequests = pendingRequests.map(request => ({
            _id: request._id,
            patientName: request.recipientId.name,
            email: request.recipientId.email,
            phone: request.recipientId.phone,
            age: request.recipientId.age,
            organType: request.organType,
            bloodGroup: request.bloodGroup,
            urgency: request.urgency,
            status: request.status,
            createdAt: request.createdAt,
            reason: request.reason,
            hospital: request.hospital
        }));

        sendSuccess(res, 'Pending requests retrieved successfully', formattedRequests);

    } catch (error) {
        console.error('Get pending requests error:', error);
        sendError(res, 500, 'Internal server error');
    }
};

// Get request details
const getRequestDetails = async (requestId, res) => {
    try {
        const request = await Request.findById(requestId)
            .populate('recipientId', 'name email phone age');

        if (!request) {
            return sendError(res, 404, 'Request not found');
        }

        const requestDetails = {
            _id: request._id,
            patientName: request.recipientId.name,
            email: request.recipientId.email,
            phone: request.recipientId.phone,
            age: request.recipientId.age,
            organType: request.organType,
            bloodGroup: request.bloodGroup,
            urgency: request.urgency,
            hospital: request.hospital,
            reason: request.reason,
            createdAt: request.createdAt,
            statusHistory: request.statusHistory
        };

        sendSuccess(res, 'Request details retrieved successfully', requestDetails);

    } catch (error) {
        console.error('Get request details error:', error);
        sendError(res, 500, 'Internal server error');
    }
};

// Approve request
const approveRequest = async (requestId, body, res) => {
    try {
        const { adminId } = body;

        if (!adminId) {
            return sendError(res, 400, 'Admin ID is required');
        }

        // Verify admin exists
        const admin = await User.findById(adminId);
        if (!admin || admin.role !== 'admin') {
            return sendError(res, 403, 'Unauthorized access');
        }

        // Find and update request
        const request = await Request.findById(requestId);
        if (!request) {
            return sendError(res, 404, 'Request not found');
        }

        if (request.status !== 'pending') {
            return sendError(res, 400, 'Request is not pending');
        }

        // Update request
        request.status = 'approved';
        request.approvedBy = adminId;
        request.approvedAt = new Date();
        request.statusHistory.push({
            status: 'approved',
            updatedAt: new Date(),
            updatedBy: adminId,
            notes: 'Request approved by admin'
        });

        await request.save();

        console.log('Request approved:', requestId);

        sendSuccess(res, 'Request approved successfully', request);

    } catch (error) {
        console.error('Approve request error:', error);
        sendError(res, 500, 'Internal server error');
    }
};

// Reject request
const rejectRequest = async (requestId, body, res) => {
    try {
        const { adminId, reason } = body;

        if (!adminId) {
            return sendError(res, 400, 'Admin ID is required');
        }

        // Verify admin exists
        const admin = await User.findById(adminId);
        if (!admin || admin.role !== 'admin') {
            return sendError(res, 403, 'Unauthorized access');
        }

        // Find and update request
        const request = await Request.findById(requestId);
        if (!request) {
            return sendError(res, 404, 'Request not found');
        }

        if (request.status !== 'pending') {
            return sendError(res, 400, 'Request is not pending');
        }

        // Update request
        request.status = 'rejected';
        request.statusHistory.push({
            status: 'rejected',
            updatedAt: new Date(),
            updatedBy: adminId,
            notes: reason || 'Request rejected by admin'
        });

        await request.save();

        console.log('Request rejected:', requestId);

        sendSuccess(res, 'Request rejected successfully', request);

    } catch (error) {
        console.error('Reject request error:', error);
        sendError(res, 500, 'Internal server error');
    }
};

module.exports = {
    getOverview,
    getPendingRequests,
    getRequestDetails,
    approveRequest,
    rejectRequest
};

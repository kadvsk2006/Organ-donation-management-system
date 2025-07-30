const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Recipient ID is required']
    },
    organType: {
        type: String,
        required: [true, 'Organ type is required'],
        enum: ['kidney', 'liver', 'heart', 'lungs', 'pancreas', 'cornea', 'bone', 'skin'],
        lowercase: true
    },
    bloodGroup: {
        type: String,
        required: [true, 'Blood group is required'],
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    urgency: {
        type: String,
        required: [true, 'Urgency level is required'],
        enum: ['critical', 'urgent', 'moderate', 'low'],
        lowercase: true
    },
    reason: {
        type: String,
        required: [true, 'Medical reason is required'],
        trim: true,
        maxlength: [2000, 'Medical reason cannot exceed 2000 characters']
    },
    hospital: {
        type: String,
        trim: true,
        maxlength: [200, 'Hospital name cannot exceed 200 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'matched'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    },
    matchedWith: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donation',
        default: null
    },
    statusHistory: [{
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'matched'],
            required: true
        },
        updatedAt: {
            type: Date,
            default: Date.now
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        notes: {
            type: String,
            trim: true
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Add initial status to history before saving
requestSchema.pre('save', function(next) {
    if (this.isNew) {
        this.statusHistory.push({
            status: 'pending',
            updatedAt: new Date(),
            updatedBy: this.recipientId,
            notes: 'Initial request submission'
        });
    }
    next();
});

// Index for better query performance
requestSchema.index({ recipientId: 1, status: 1 });
requestSchema.index({ organType: 1, bloodGroup: 1, urgency: 1 });

module.exports = mongoose.model('Request', requestSchema);

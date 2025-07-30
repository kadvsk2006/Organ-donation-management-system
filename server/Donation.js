const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    donorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Donor ID is required']
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
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
        maxlength: [100, 'City name cannot exceed 100 characters']
    },
    medicalHistory: {
        type: String,
        trim: true,
        maxlength: [1000, 'Medical history cannot exceed 1000 characters']
    },
    status: {
        type: String,
        enum: ['available', 'matched', 'used'],
        default: 'available'
    },
    matchedWith: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Request',
        default: null
    },
    statusHistory: [{
        status: {
            type: String,
            enum: ['available', 'matched', 'used'],
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
donationSchema.pre('save', function(next) {
    if (this.isNew) {
        this.statusHistory.push({
            status: 'available',
            updatedAt: new Date(),
            updatedBy: this.donorId,
            notes: 'Initial donation registration'
        });
    }
    next();
});

// Index for better query performance
donationSchema.index({ donorId: 1, status: 1 });
donationSchema.index({ organType: 1, bloodGroup: 1, city: 1 });

module.exports = mongoose.model('Donation', donationSchema);

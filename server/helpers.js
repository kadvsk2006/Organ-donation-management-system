const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT token
const generateToken = (userId, role) => {
    return jwt.sign(
        { 
            userId: userId,
            role: role 
        },
        process.env.JWT_SECRET,
        { 
            expiresIn: '7d'
        }
    );
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Send JSON response
const sendResponse = (res, statusCode, success, message, data = null) => {
    res.writeHead(statusCode, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(JSON.stringify({
        success,
        message,
        data
    }));
};

// Send error response
const sendError = (res, statusCode, message) => {
    sendResponse(res, statusCode, false, message);
};

// Send success response
const sendSuccess = (res, message, data = null, statusCode = 200) => {
    sendResponse(res, statusCode, true, message, data);
};

// Blood group compatibility check
const isBloodGroupCompatible = (donorBloodGroup, recipientBloodGroup) => {
    const compatibility = {
        'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
        'O+': ['O+', 'A+', 'B+', 'AB+'],
        'A-': ['A-', 'A+', 'AB-', 'AB+'],
        'A+': ['A+', 'AB+'],
        'B-': ['B-', 'B+', 'AB-', 'AB+'],
        'B+': ['B+', 'AB+'],
        'AB-': ['AB-', 'AB+'],
        'AB+': ['AB+']
    };
    
    return compatibility[donorBloodGroup] && 
           compatibility[donorBloodGroup].includes(recipientBloodGroup);
};

module.exports = {
    generateToken,
    verifyToken,
    sendResponse,
    sendError,
    sendSuccess,
    isBloodGroupCompatible
};

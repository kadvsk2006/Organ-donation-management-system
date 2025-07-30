const User = require('./User');
const { generateToken, sendError, sendSuccess } = require('./helpers');

// Login user
const login = async (body, res) => {
    try {
        console.log('Login attempt:', body.email, body.userType);
        
        const { email, password, userType } = body;

        // Validate input
        if (!email || !password || !userType) {
            return sendError(res, 400, 'Email, password, and user type are required');
        }

        // Find user by email and role
        const user = await User.findOne({ 
            email: email.toLowerCase(),
            role: userType,
            isActive: true 
        });

        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
            return sendError(res, 401, 'Invalid credentials');
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return sendError(res, 401, 'Invalid credentials');
        }

        // Generate token
        const token = generateToken(user._id, user.role);

        // Prepare user data
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            registeredAt: user.createdAt
        };

        console.log('Login successful for:', userData.email);

        // Send response with user object directly in data
        sendSuccess(res, 'Login successful', {
            token,
            user: userData
        });

    } catch (error) {
        console.error('Login error:', error);
        sendError(res, 500, 'Internal server error');
    }
};

// Admin login with security code
const adminLogin = async (body, res) => {
    try {
        console.log('Admin login attempt:', body.email);
        
        const { email, password, securityCode } = body;

        // Validate input
        if (!email || !password || !securityCode) {
            return sendError(res, 400, 'Email, password, and security code are required');
        }

        // Check admin credentials
        if (email !== process.env.ADMIN_EMAIL || 
            password !== process.env.ADMIN_PASSWORD || 
            securityCode !== process.env.ADMIN_SECURITY_CODE) {
            return sendError(res, 401, 'Invalid admin credentials');
        }

        // Find or create admin user
        let adminUser = await User.findOne({ 
            email: email.toLowerCase(),
            role: 'admin',
            isActive: true 
        });

        if (!adminUser) {
            // Create admin user if doesn't exist
            adminUser = new User({
                name: 'System Admin',
                email: email.toLowerCase(),
                phone: '+1-555-ADMIN',
                password: password,
                role: 'admin',
                age: 30
            });
            await adminUser.save();
            console.log('Admin user created');
        }

        // Generate token
        const token = generateToken(adminUser._id, adminUser.role);

        // Prepare user data
        const userData = {
            _id: adminUser._id,
            name: adminUser.name,
            email: adminUser.email,
            phone: adminUser.phone,
            role: adminUser.role,
            registeredAt: adminUser.createdAt
        };

        console.log('Admin login successful');

        // Send response
        sendSuccess(res, 'Admin login successful', {
            token,
            user: userData
        });

    } catch (error) {
        console.error('Admin login error:', error);
        sendError(res, 500, 'Internal server error');
    }
};

// Register user
const register = async (body, res) => {
    try {
        console.log('Registration attempt:', body.email, body.userType);
        
        const { name, email, phone, password, userType, age } = body;

        // Validate input
        if (!name || !email || !phone || !password || !userType) {
            return sendError(res, 400, 'All fields are required');
        }

        if (password.length < 6) {
            return sendError(res, 400, 'Password must be at least 6 characters long');
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            email: email.toLowerCase() 
        });

        if (existingUser) {
            return sendError(res, 400, 'User already exists with this email');
        }

        // Create new user
        const userData = {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone.trim(),
            password,
            role: userType
        };

        // Add age if provided
        if (age && (userType === 'donor' || userType === 'recipient')) {
            userData.age = parseInt(age);
        }

        const user = new User(userData);
        await user.save();

        console.log('User registered successfully:', user.email);

        sendSuccess(res, 'Registration successful', {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        }, 201);

    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.name === 'ValidationError') {
            return sendError(res, 400, error.message);
        }
        
        if (error.code === 11000) {
            return sendError(res, 400, 'Email already exists');
        }
        
        sendError(res, 500, 'Internal server error');
    }
};

module.exports = {
    login,
    adminLogin,
    register
};

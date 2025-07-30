// Load environment variables
require('dotenv').config();

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Import database connection
const connectDB = require('./database');

// Import controllers
const authController = require('./authController');
const donorController = require('./donorController');
const recipientController = require('./recipientController');
const adminController = require('./adminController');
const matchController = require('./matchController');

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 3000;

// MIME types for static files
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.json': 'application/json'
};

// Helper function to serve static files
function serveStaticFile(res, filePath) {
    const extname = path.extname(filePath);
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.log('File not found:', filePath);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}

// Helper function to parse JSON from request
function getRequestBody(req, callback) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const parsedBody = body ? JSON.parse(body) : {};
            callback(null, parsedBody);
        } catch (error) {
            callback(error, null);
        }
    });
}

// Create HTTP server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    console.log(`${method} ${pathname}`);

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API Routes
    if (pathname.startsWith('/api/')) {
        res.setHeader('Content-Type', 'application/json');

        // Authentication routes
        if (pathname === '/api/auth/login' && method === 'POST') {
            getRequestBody(req, (err, body) => {
                if (err) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ success: false, message: 'Invalid JSON' }));
                    return;
                }
                authController.login(body, res);
            });
        } 
        else if (pathname === '/api/auth/admin-login' && method === 'POST') {
            getRequestBody(req, (err, body) => {
                if (err) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ success: false, message: 'Invalid JSON' }));
                    return;
                }
                authController.adminLogin(body, res);
            });
        }
        else if (pathname === '/api/auth/register' && method === 'POST') {
            getRequestBody(req, (err, body) => {
                if (err) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ success: false, message: 'Invalid JSON' }));
                    return;
                }
                authController.register(body, res);
            });
        }
        // Donor routes
        else if (pathname.startsWith('/api/donor/')) {
            if (pathname.includes('/stats') && method === 'GET') {
                const donorId = parsedUrl.query.donorId;
                donorController.getStats(donorId, res);
            } 
            else if (pathname.includes('/donations') && method === 'GET') {
                const donorId = parsedUrl.query.donorId;
                donorController.getDonations(donorId, res);
            } 
            else if (pathname === '/api/donor/donation' && method === 'POST') {
                getRequestBody(req, (err, body) => {
                    if (err) {
                        res.writeHead(400);
                        res.end(JSON.stringify({ success: false, message: 'Invalid JSON' }));
                        return;
                    }
                    donorController.createDonation(body, res);
                });
            }
            else {
                res.writeHead(404);
                res.end(JSON.stringify({ success: false, message: 'Donor API route not found' }));
            }
        }
        // Recipient routes
        else if (pathname.startsWith('/api/recipient/')) {
            if (pathname.includes('/stats') && method === 'GET') {
                const recipientId = parsedUrl.query.recipientId;
                recipientController.getStats(recipientId, res);
            } 
            else if (pathname.includes('/requests') && method === 'GET') {
                const recipientId = parsedUrl.query.recipientId;
                recipientController.getRequests(recipientId, res);
            } 
            else if (pathname.includes('/matches') && method === 'GET') {
                const recipientId = parsedUrl.query.recipientId;
                recipientController.getMatches(recipientId, res);
            } 
            else if (pathname === '/api/recipient/request' && method === 'POST') {
                getRequestBody(req, (err, body) => {
                    if (err) {
                        res.writeHead(400);
                        res.end(JSON.stringify({ success: false, message: 'Invalid JSON' }));
                        return;
                    }
                    recipientController.createRequest(body, res);
                });
            }
            else {
                res.writeHead(404);
                res.end(JSON.stringify({ success: false, message: 'Recipient API route not found' }));
            }
        }
        // Admin routes
        else if (pathname.startsWith('/api/admin/')) {
            if (pathname === '/api/admin/overview' && method === 'GET') {
                adminController.getOverview(res);
            } 
            else if (pathname === '/api/admin/requests/pending' && method === 'GET') {
                adminController.getPendingRequests(res);
            }
            else if (pathname.match(/^\/api\/admin\/requests\/[^\/]+$/) && method === 'GET') {
                const requestId = pathname.split('/')[4];
                adminController.getRequestDetails(requestId, res);
            }
            else if (pathname.includes('/approve') && method === 'POST') {
                const requestId = pathname.split('/')[4];
                getRequestBody(req, (err, body) => {
                    if (err) {
                        res.writeHead(400);
                        res.end(JSON.stringify({ success: false, message: 'Invalid JSON' }));
                        return;
                    }
                    adminController.approveRequest(requestId, body, res);
                });
            } 
            else if (pathname.includes('/reject') && method === 'POST') {
                const requestId = pathname.split('/')[4];
                getRequestBody(req, (err, body) => {
                    if (err) {
                        res.writeHead(400);
                        res.end(JSON.stringify({ success: false, message: 'Invalid JSON' }));
                        return;
                    }
                    adminController.rejectRequest(requestId, body, res);
                });
            }
            // MATCH ROUTES - Moved to proper location within admin routes
            else if (pathname === '/api/admin/matches' && method === 'GET') {
                matchController.getAllMatches(res);
            } 
            else if (pathname === '/api/admin/matches/confirm' && method === 'POST') {
                getRequestBody(req, (err, body) => {
                    if (err) {
                        res.writeHead(400);
                        res.end(JSON.stringify({ success: false, message: 'Invalid JSON' }));
                        return;
                    }
                    matchController.confirmMatch(body, res);
                });
            }
            else {
                console.log('Unknown admin route:', pathname);
                res.writeHead(404);
                res.end(JSON.stringify({ 
                    success: false, 
                    message: 'Admin API route not found',
                    attempted_route: pathname 
                }));
            }
        }
        // 404 for unknown API routes
        else {
            console.log('Unknown API route:', pathname);
            res.writeHead(404);
            res.end(JSON.stringify({ 
                success: false, 
                message: 'API route not found',
                attempted_route: pathname,
                method: method
            }));
        }
    }
    // Serve static files from public directory
    else {
        let filePath;
        
        if (pathname === '/') {
            filePath = './public/index.html';
        } else {
            filePath = `./public${pathname}`;
        }
        
        // Security check - prevent directory traversal
        const resolvedPath = path.resolve(filePath);
        const publicPath = path.resolve('./public');
        
        if (!resolvedPath.startsWith(publicPath)) {
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }
        
        serveStaticFile(res, filePath);
    }
});

// Start server
server.listen(PORT, () => {
    console.log(`🚀 OrganLife server running on http://localhost:${PORT}`);
    console.log(`📁 Serving static files from: ./public/`);
    console.log(`🔗 API endpoints available at: http://localhost:${PORT}/api/`);
    console.log(`👤 Admin credentials: ${process.env.ADMIN_EMAIL} / ${process.env.ADMIN_PASSWORD} / ${process.env.ADMIN_SECURITY_CODE}`);
});

// Handle server errors
server.on('error', (err) => {
    console.error('❌ Server error:', err);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

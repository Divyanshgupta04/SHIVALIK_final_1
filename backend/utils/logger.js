const fs = require('fs');
const path = require('path');

// Hardcoded log path to effectively debug
const LOG_FILE = 'C:/Users/hp/Desktop/shivalik_final/backend/payment_debug_FINAL.log';

function log(message, data = {}) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message} ${JSON.stringify(data, null, 2)}\n\n`;
    try {
        fs.appendFileSync(LOG_FILE, logMessage);
    } catch (e) {
        // failed to log
    }
}

module.exports = { log };

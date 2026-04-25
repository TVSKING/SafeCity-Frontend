const fs = require('fs');
const path = require('path');

const directory = './src';

function processFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            processFiles(filePath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Replace hardcoded URLs with environment variables
            // Case 1: axios.post('http://localhost:5000/api/...') -> axios.post(`${API_URL}/api/...`)
            content = content.replace(/'http:\/\/localhost:5000\//g, '`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/');
            
            // Case 2: io('http://localhost:5000') -> io(import.meta.env.VITE_API_URL || 'http://localhost:5000')
            content = content.replace(/'http:\/\/localhost:5000'/g, 'import.meta.env.VITE_API_URL || "http://localhost:5000"');
            
            fs.writeFileSync(filePath, content);
        }
    });
}

processFiles(directory);
console.log('Successfully updated all API URLs for production readiness!');

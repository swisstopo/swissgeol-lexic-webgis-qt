const fs = require('fs');
const path = require('path');

function getConfigDB(vocabulary) {
    try {
        const configPath = path.join(process.cwd(), 'vocabulariesConfig.json');
        const configFile = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configFile);

        return config[vocabulary];
    } catch (error) {
        console.log('Error reading configuration:', error);
        return null;
    }
}

module.exports = { getConfigDB };
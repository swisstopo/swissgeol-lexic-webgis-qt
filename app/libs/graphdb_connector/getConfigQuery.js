const fs = require('fs');
const path = require('path');

function getQueryConfig(vocabulary, prefix) {
    const configPath = path.join(process.cwd(), 'queryConfig.json');
    const configFile = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configFile);

    const prefixPlaceholder = /\$\{prefix\}/g;

    const queryBreadcrumbs = config[vocabulary].queryBreadcrumbs.replace(prefixPlaceholder, prefix);
    const queryVocabolo = config[vocabulary].queryVocabolo.replace(prefixPlaceholder, prefix);
    const allConcept = config[vocabulary].allConcept.replace(prefixPlaceholder, prefix);
    
    return {
        queryBreadcrumbs,
        queryVocabolo,
        allConcept
    };
}

module.exports = { getQueryConfig };
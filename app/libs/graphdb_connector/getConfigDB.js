function getConfigDB(vocabulary, vocabulariesConfig) {
    try {
        const vocabConfig = vocabulariesConfig[vocabulary];
        if (vocabConfig) {
            return vocabConfig;
        }
        return null;
    } catch (error) {
        console.log('Error retrieving configuration:', error);
        return null;
    }
}

module.exports = { getConfigDB };

import vocabulariesConfig from '../../vocabulariesConfig.json';
import { GraphDBClient, QueryExecutor, getConfigDB, getQueryConfig } from './graphdb_connector';

interface NamedNode {
    id: string;
}
interface Literal {
    value: string;
    language?: string;
}
interface QueryResult {
    term: NamedNode;
    prefLabel: Literal;
}
interface QueryResultNarrowers {
    narrowerConcept: NamedNode;
}
/**
 * Creates the connection to the db with the parameters passed 
 * by configuration and executes the queries 
 * to get all the terms in the vocabularies in the configuration.
 * @returns
 */
export async function fetchVocabulariesData() {
    const vocabulariesArray = Object.values(vocabulariesConfig);
    const results: { [key: string]: { label: string; value: string }[] } = {};

    for (const vocab of vocabulariesArray) {
        const { url, username, password } = getConfigDB(vocab.id);
        const repositoryUrl = `${url}/repositories/${vocab.repositoryId}`;
        const client = new GraphDBClient(url, username, password);

        const { allConcept } = getQueryConfig(vocab.id);
        const queryExecutor = new QueryExecutor(client, vocab.repositoryId, url, username, password, repositoryUrl);

        let sparqlQuery = '';

        if (vocab.id === 'Chronostratigraphy' || vocab.id === 'TectonicUnits') {
            sparqlQuery = allConcept;
        } else {
            console.warn(`No SPARQL query defined for vocabulary ${vocab.id}`);
            continue;
        }

        try {
            console.log(`5 Executing SPARQL query for vocabulary ${vocab.id}`);
            const queryResults: QueryResult[] = await queryExecutor.executeSparqlQuery(sparqlQuery);
            /* console.log('Query results:', queryResults); */
            results[vocab.id] = queryResults.map(result => ({
                label: result.prefLabel.value,
                value: result.term.id
            }));
            /* console.log(`Successfully fetched data for vocabulary ${vocab.id}:`, results[vocab.id]); */
        } catch (error) {
            console.log(`Error fetching data for vocabulary ${vocab.id}:`, error);
            throw new Error(`Error fetching data for vocabulary ${vocab.id}: ${error.message}`);
        }
    }

    return results;
}

export async function fetchVocabolaryTermByQuery(query: string, vocabId: string) {
    const vocabulariesArray = Object.values(vocabulariesConfig);
    const results: string[] = [];

    for (const vocab of vocabulariesArray) {
        if (vocabId === vocab.id) {
            const { url, username, password } = getConfigDB(vocab.id);
            const repositoryUrl = `${url}/repositories/${vocab.repositoryId}`;
            const client = new GraphDBClient(url, username, password);

            const queryExecutor = new QueryExecutor(client, vocab.repositoryId, url, username, password, repositoryUrl);

            let sparqlQuery = query;

            try {
                console.log(`7 Executing SPARQL query for vocabulary ${vocab.id}`);
                const queryResults: QueryResultNarrowers[] = await queryExecutor.executeSparqlQuery(sparqlQuery);
                console.log('Query results:', queryResults);
                for (const result of queryResults) {
                    results.push(result.narrowerConcept.id);
                }
                /* console.log(`Successfully fetched data for vocabulary ${vocab.id}:`, results[vocab.id]); */
            } catch (error) {
                console.log(`Error fetching data for vocabulary ${vocab.id}:`, error);
                throw new Error(`Error fetching data for vocabulary ${vocab.id}: ${error.message}`);
            }
        }
    }

    return results;
}

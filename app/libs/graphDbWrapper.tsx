import vocabulariesConfig from '../../vocabulariesConfig.json';
import { GraphDBClient, QueryExecutor, getConfigDB, getQueryConfig } from './graphdb_connector';

interface NamedNode {
    id: string;
}
interface Literal {
    value: string;
    language?: string;
}
interface VocabularyQueryResult  {
    term: NamedNode;
    prefLabel: Literal;
}
interface ConceptQueryResult   {
    concept: NamedNode;
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

        let sparqlQuery = allConcept;

        try {
            console.log(`5 Executing SPARQL query for vocabulary ${vocab.id}`);
            const queryResults: VocabularyQueryResult [] = await queryExecutor.executeSparqlQuery(sparqlQuery);
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
/**
 * Function to fetch vocabulary terms by executing a SPARQL query against a specified vocabulary
 * 
 * This function iterates through a list of configured vocabularies to find the one matching the provided `vocabId`. 
 * It then retrieves the necessary configuration (URL, username, password) and constructs a GraphDB client. 
 * A SPARQL query is executed against the vocabulary's repository, and the results are processed to extract narrower concept IDs. 
 * The function handles any errors by logging them and throwing an exception if the fetch fails.
 * 
 * @param query - The SPARQL query string to execute
 * @param vocabId - The ID of the vocabulary to search within
 * @returns A promise that resolves to an array of narrower concept IDs retrieved from the vocabulary
 * @throws An error if the SPARQL query execution fails
 */
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
                const queryResults: ConceptQueryResult [] = await queryExecutor.executeSparqlQuery(sparqlQuery);
                console.log(`Query results ${vocab.id}:`, queryResults);
                for (const result of queryResults) {
                    results.push(result.concept.id);
                }
                console.log(`Successfully fetched data for ${vocab.id}:`, results);
            } catch (error) {
                console.log(`Error fetching data for vocabulary ${vocab.id}:`, error);
                throw new Error(`Error fetching data for vocabulary ${vocab.id}: ${error.message}`);
            }
        }
    }

    return results;
}
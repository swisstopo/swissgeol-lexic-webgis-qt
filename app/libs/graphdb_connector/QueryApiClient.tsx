import RepositoryClientConfig from 'graphdb/lib/repository/repository-client-config';
import RDFMimeType from 'graphdb/lib/http/rdf-mime-type';
import SparqlXmlResultParser from 'graphdb/lib/parser/sparql-xml-result-parser';
import GetQueryPayload from 'graphdb/lib/query/get-query-payload';
import QueryType from 'graphdb/lib/query/query-type';
import config from 'next/config';
import GraphDBClient from './GraphDBClient';
/**
 * Class for executing SPARQL queries using a GraphDB client
 * 
 * The `QueryExecutor` class is responsible for setting up and executing SPARQL queries against a specific repository in GraphDB. 
 * It uses the `GraphDBClient` and a repository configuration to connect to the repository. The class handles authentication, 
 * sets appropriate headers, and configures the repository for SPARQL XML result parsing. The `executeSparqlQuery` method 
 * performs the query and returns the results, handling streaming data and errors during the query execution.
 * 
 * @param graphDBClient - An instance of `GraphDBClient` used to interact with the GraphDB server
 * @param repositoryId - The ID of the repository where the SPARQL query will be executed
 * @param Url - The base URL of the GraphDB server
 * @param username - The username for basic authentication
 * @param password - The password for basic authentication
 * @param RepositoryUrl - The specific repository URL endpoint within GraphDB
 */
class QueryExecutor {
    private graphDBClient: GraphDBClient;
    private repositoryId: string;
    private repositoryConfig: RepositoryClientConfig;

    constructor(graphDBClient: GraphDBClient, repositoryId: string, Url: string, username: string, password: string, RepositoryUrl: string) {
        this.graphDBClient = graphDBClient;
        this.repositoryId = repositoryId;
        this.repositoryConfig = new RepositoryClientConfig(Url)
            .setEndpoints([RepositoryUrl])
            .setReadTimeout(50000)
            .setWriteTimeout(50000)
            .setHeaders({
                'Accept': RDFMimeType.SPARQL_RESULTS_XML,
            })
            .useBasicAuthentication(username, password)
            .setKeepAlive(true);
    }

    public async executeSparqlQuery(sparqlQuery: string): Promise<any> {
        try {
            const repository = await this.graphDBClient.getClient().getRepository(this.repositoryId, this.repositoryConfig);
            repository.registerParser(new SparqlXmlResultParser(config));

            const payload = new GetQueryPayload()
                .setQuery(sparqlQuery)
                .setQueryType(QueryType.SELECT)
                .setResponseType(RDFMimeType.SPARQL_RESULTS_XML)
                .setLimit(1000)
                .setTimeout(50000);

            const queryStream = await repository.query(payload);
            const results: any[] = [];

            return new Promise((resolve, reject) => {
                queryStream.on('data', (bindings: any) => {
                    results.push(bindings);
                });

                queryStream.on('end', () => {
                    resolve(results);
                });

                queryStream.on('error', (error: any) => {
                    reject(error);
                });
            });
        } catch (error) {
            console.log('Errore durante l\'esecuzione della query:', error);
            throw error;
        }
    }
}


export default QueryExecutor;
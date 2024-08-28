import RepositoryClientConfig from 'graphdb/lib/repository/repository-client-config';
import RDFMimeType from 'graphdb/lib/http/rdf-mime-type';
import SparqlXmlResultParser from 'graphdb/lib/parser/sparql-xml-result-parser';
import GetQueryPayload from 'graphdb/lib/query/get-query-payload';
import QueryType from 'graphdb/lib/query/query-type';
import config from 'next/config';
import GraphDBClient from './GraphDBClient';

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
                .setLimit(1000);

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
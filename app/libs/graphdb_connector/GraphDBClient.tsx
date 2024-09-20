const { GraphDBServerClient, ServerClientConfig } = require('graphdb').server;
const { RDFMimeType } = require('graphdb').http;
/**
 * Class for managing connections to a GraphDB server and retrieving repository information
 * 
 * The `GraphDBClient` class sets up a connection to a GraphDB server using the provided server URL, username, and password. 
 * It configures the server client with timeout settings, headers for accepting SPARQL results in XML format, and basic 
 * authentication. The class includes methods for retrieving repository IDs and accessing the server client instance.
 * 
 */

class GraphDBClient {
    private serverClient: typeof GraphDBServerClient;

    constructor(serverUrl: string, username: string, password: string) {
        const serverConfig = new ServerClientConfig(serverUrl)
            .setTimeout(50000)
            .setHeaders({
                'Accept': RDFMimeType.SPARQL_RESULTS_XML
            })
            .useBasicAuthentication(username, password)
            .setKeepAlive(true);


        this.serverClient = new GraphDBServerClient(serverConfig);

        console.log(`Attempting to connect to GraphDB at ${serverUrl} with user: ${username}`);
    }

    public async getRepositoryIds(): Promise<string[]> {
        try {
            return await this.serverClient.getRepositoryIDs();
        } catch (error) {
            console.log('Error fetching repository IDs:', error);
            throw error;
        }
    }

    public getClient(): typeof GraphDBServerClient {
        return this.serverClient;
    }
}

export default GraphDBClient;
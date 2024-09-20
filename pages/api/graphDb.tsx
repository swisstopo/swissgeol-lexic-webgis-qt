import { NextApiRequest, NextApiResponse } from 'next';
import { fetchVocabolaryTermByQuery, fetchVocabulariesData } from '../../app/libs/graphDbWrapper';
/**
 * API route handler for managing vocabulary-related requests
 * 
 * This handler processes API requests for fetching vocabulary terms or vocabulary data from GraphDB.
 * It supports two types of HTTP methods:
 * - **POST**: Retrieves vocabulary terms based on a query and vocabulary ID from the request body and query parameters.
 * - **GET**: Retrieves all available vocabulary data.
 * 
 * The handler performs the following steps:
 * 1. Extracts `vocabulary` and `query` from the request's query and body respectively.
 * 2. Ensures these values are properly formatted, handling cases where they might be arrays.
 * 3. Depending on the request method and the presence of query parameters:
 *    - **POST**: Calls `fetchVocabolaryTermByQuery` to fetch vocabulary terms and responds with the data. 
 *              Returns a 500 status code with an error message if the fetch fails.
 *    - **GET**: Calls `fetchVocabulariesData` to fetch all available vocabulary data and responds with the data.
 *              Returns a 500 status code with an error message if the fetch fails.
 * 4. If the method is not allowed (other than POST or GET), responds with a 405 status code and a message indicating the allowed methods.
 * 
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let { vocabulary } = req.query;
    let query = req.body;
    
    if (Array.isArray(vocabulary)) {
        vocabulary = vocabulary[0];
    }
    if (Array.isArray(query)) {
        query = query[0];
    }

    if (query && vocabulary) {
        if (req.method === 'POST') {
            try {
                const data = await fetchVocabolaryTermByQuery(query, vocabulary);
                res.status(200).json(data);
            } catch (error) {
                console.error('Failed to fetch data from GraphDB:', error);
                res.status(500).json({ error: 'Failed to fetch data from GraphDB' });
            }
        } else {
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } else {
        if (req.method === 'GET') {
            try {
                const data = await fetchVocabulariesData();
                res.status(200).json(data);
            } catch (error) {
                console.error('Failed to fetch data from GraphDB:', error);
                res.status(500).json({ error: 'Failed to fetch data from GraphDB' });
            }
        } else {
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    }
}

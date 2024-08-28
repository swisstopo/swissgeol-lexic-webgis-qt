import { NextApiRequest, NextApiResponse } from 'next';
import { fetchVocabolaryTermByQuery, fetchVocabulariesData } from '../../app/libs/graphDbWrapper';


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

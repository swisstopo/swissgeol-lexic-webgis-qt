import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Defines the structure of the configuration data intended for the client-side application.
 */
export interface ClientConfig {
  geoserverBaseUrl: string;
  vocabularyPrefixUrl: string;
}

/**
 * API route handler that provides the necessary configuration to the client application.
 *
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ClientConfig>
) {
  const clientConfig: ClientConfig = {
    geoserverBaseUrl: process.env.GEOSERVER_BASE_URL || '',
    vocabularyPrefixUrl: process.env.VOCABULARY_PREFIX_URL || '',
  };

  res.status(200).json(clientConfig);
}

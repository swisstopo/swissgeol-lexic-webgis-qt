// app/config.ts

export interface AppConfig {
  vocabularyPrefixUrl: string;
  geoserverBaseUrl: string;
  graphDbBaseUrl:   string;
  graphDbUsername:  string;
  graphDbPassword:  string;
  chronoRepoId:     string;
  tectonicRepoId:   string;
  lithoRepoId:      string;
  lithologyRepoId:  string;
}

export interface VocabularyConfig {
  id: string;
  repositoryId: string;
  url: string;
  username: string;
  password: string;
}

export interface VocabulariesConfig {
  [key: string]: VocabularyConfig;
}

let _cached: AppConfig | null       = null;
let _inFlight: Promise<AppConfig> | null = null;

function buildConfigFromEnv(): AppConfig {
  return {
    vocabularyPrefixUrl: process.env.VOCABULARY_PREFIX_URL || '',
    geoserverBaseUrl: process.env.GEOSERVER_BASE_URL || '',
    graphDbBaseUrl: process.env.GRAPHDB_BASE_URL || '',
    graphDbUsername: process.env.GRAPHDB_USERNAME || '',
    graphDbPassword: process.env.GRAPHDB_PASSWORD || '',
    chronoRepoId: process.env.CHRONOSTRATIGRAPHY_REPO_ID || '',
    tectonicRepoId: process.env.TECTONICUNITS_REPO_ID || '',
    lithoRepoId: process.env.LITHOSTRATIGRAPHY_REPO_ID || '',
    lithologyRepoId: process.env.LITHOLOGY_REPO_ID || '',
  };
}

/**
 * Chiama una sola volta /api/config e lo mette in cache.
 */
export function getConfig(): Promise<AppConfig> {
  if (_cached) return Promise.resolve(_cached);

  // If on the server, build the config directly from environment variables
  if (typeof window === 'undefined') {
    _cached = buildConfigFromEnv();
    return Promise.resolve(_cached);
  }

  // On the client, fetch from the API route
  if (!_inFlight) {
    _inFlight = fetch('/api/configApi')
      .then(res => {
        if (!res.ok) throw new Error(`Config fetch failed ${res.status}`);
        return res.json() as Promise<AppConfig>;
      })
      .then(cfg => {
        _cached = cfg;
        return cfg;
      });
  }
  return _inFlight;
}

/** Restituisce l’intera mappa vocabulariesConfig */
export async function getVocabulariesConfig() {
  const {
    graphDbBaseUrl,
    graphDbUsername,
    graphDbPassword,
    chronoRepoId,
    tectonicRepoId,
    lithoRepoId,
    lithologyRepoId
  } = await getConfig();

  return {
    Chronostratigraphy: {
      id:           'Chronostratigraphy',
      repositoryId: chronoRepoId,
      url:          graphDbBaseUrl,
      username:     graphDbUsername,
      password:     graphDbPassword,
    },
    TectonicUnits: {
      id:           'TectonicUnits',
      repositoryId: tectonicRepoId,
      url:          graphDbBaseUrl,
      username:     graphDbUsername,
      password:     graphDbPassword,
    },
    Lithostratigraphy: {
      id:           'Lithostratigraphy',
      repositoryId: lithoRepoId,
      url:          graphDbBaseUrl,
      username:     graphDbUsername,
      password:     graphDbPassword,
    },
    Lithology: {
      id:           'Lithology',
      repositoryId: lithologyRepoId,
      url:          graphDbBaseUrl,
      username:     graphDbUsername,
      password:     graphDbPassword,
    },
  };
}

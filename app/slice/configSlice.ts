import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getConfig } from '../config';
import { ClientConfig } from '../../pages/api/configApi';

interface VocabulariesConfig {
  [key: string]: {
    id: string;
    repositoryId: string;
    url: string;
    username: string;
    password: string;
  };
}

interface ConfigState {
  geoserverBaseUrl: string;
  vocabulariesConfig: VocabulariesConfig;
  loading: boolean;
  error: string | null;
}

const initialState: ConfigState = {
  geoserverBaseUrl: '',
  vocabulariesConfig: {},
  loading: false,
  error: null,
};

/**
 * Asynchronous thunk to fetch the client-side application configuration.
 * It utilizes the isomorphic `getConfig` function, which fetches from the API
 * when executed on the client.
 */
export const fetchConfig = createAsyncThunk('config/fetchConfig', async () => {
  const config = await getConfig();
  return config as ClientConfig;
});

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConfig.fulfilled, (state, action: PayloadAction<ClientConfig>) => {
        state.loading = false;
        state.geoserverBaseUrl = action.payload.geoserverBaseUrl;
      })
      .addCase(fetchConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch configuration';
      });
  },
});

export default configSlice.reducer;

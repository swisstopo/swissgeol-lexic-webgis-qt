import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import vocabulariesConfig from '../../vocabulariesConfig.json';
/**
 * Interface representing the structure of a vocabulary
 * 
 */
export interface Vocabulary {
    id: string,
    url: string,
    repositoryId: string,
    username: string,
    password: string
}
/**
 * Interface representing the state for vocabularies management
 * 
 * @property vocabularies - An array of vocabularies configured from `vocabulariesConfig`
 * @property cache - An object caching vocabulary items by their keys
 */
export interface VocabulariesState {
    vocabularies: Vocabulary[];
    cache: { [key: string]: VocabularyItem[] };
}

const vocabulariesArray: Vocabulary[] = Object.values(vocabulariesConfig);

/**
 * Interface representing a vocabulary item
 * 
 */
export interface VocabularyItem {
    label: string;
    value: string;
}
/**
 * Initial state for the vocabularies slice
 * 
 * @property vocabularies - Initialized with the vocabularies from `vocabulariesArray`
 * @property cache
 */
const initialState: VocabulariesState = {
    vocabularies: vocabulariesArray,
    cache: {},
}
const vocabulariesSlice = createSlice({
    name: 'vocabulariesSlice',
    initialState,
    reducers: {
        /**
         * Reducer to set the vocabulary cache in the state
         * 
         * @param state - The current state of the slice
         * @param action - The action object containing the new cache data
         * @param action.payload - The new cache data to be set
         */
        setCache: (state, action: PayloadAction<{ [key: string]: VocabularyItem[] }>) => {
            state.cache = action.payload;
        },
    },
});

export const { setCache } = vocabulariesSlice.actions;
export default vocabulariesSlice.reducer;

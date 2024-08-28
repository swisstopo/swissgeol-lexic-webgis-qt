import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import vocabulariesConfig from '../../vocabulariesConfig.json';

export interface Vocabulary {
    id: string,
    url: string,
    repositoryId: string,
    username: string,
    password: string
}

export interface VocabulariesState {
    vocabularies: Vocabulary[];
    cache: { [key: string]: VocabularyItem[] };
}

const vocabulariesArray: Vocabulary[] = Object.values(vocabulariesConfig);

export interface VocabularyItem {
    label: string;
    value: string;
}

const initialState: VocabulariesState = {
    vocabularies: vocabulariesArray,
    cache: {},
}

const vocabulariesSlice = createSlice({
    name: 'vocabulariesSlice',
    initialState,
    reducers: {
        setCache: (state, action: PayloadAction<{ [key: string]: VocabularyItem[] }>) => {
            state.cache = action.payload;
        },
    },
});

export const { setCache } = vocabulariesSlice.actions;
export default vocabulariesSlice.reducer;

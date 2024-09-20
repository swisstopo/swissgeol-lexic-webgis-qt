import { configureStore } from '@reduxjs/toolkit'
import layerMenuSlice from '../slice/layerMenuSlice'
import vocabulariesSlice from '../slice/vocabularySlice'

export const store = configureStore({
  reducer: {
    /**
     * Manages layer status and related interfaces.
     * 
     * Action:
     * - Layer check
     * - Adding and Removing Filters
     * - Changing opacity of layers
     * - Managing the check on the filter icon
     * - Initial State of Layer
     */
    layerMenuSlice: layerMenuSlice,
        vocabulariesSlice: vocabulariesSlice,
  },
})


// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
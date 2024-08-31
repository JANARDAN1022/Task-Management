import { configureStore } from '@reduxjs/toolkit'
import UserReducer from './redux/reducers/UserReducer'
import ProjectReducer from './redux/reducers/ProjectReducer'
import CompanyReducer from './redux/reducers/CompanyReducer'

export const store = configureStore({
  reducer: {
    user:UserReducer,
    project:ProjectReducer,
    company:CompanyReducer
  },
  devTools:true
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
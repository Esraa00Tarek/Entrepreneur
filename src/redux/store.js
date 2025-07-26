import { configureStore } from '@reduxjs/toolkit';
import feedbackReducer from './slices/feedbackSlice';
import businessesReducer from './slices/businessesSlice';
import milestonesReducer from './slices/milestonesSlice';
import investorReducer from './slices/investorSlice';

const store = configureStore({
  reducer: {
    feedback: feedbackReducer,
    businesses: businessesReducer,
    milestones: milestonesReducer,
    investor: investorReducer,
  },
});

export default store; 
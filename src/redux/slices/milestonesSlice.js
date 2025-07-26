import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

export const fetchMilestones = createAsyncThunk(
  'milestones/fetchMilestones',
  async (businessId, thunkAPI) => {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${BASE_URL}/api/milestones/business/${businessId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // دعم كل من data و milestones
    return res.data.data ?? res.data.milestones ?? [];
  }
);

const milestonesSlice = createSlice({
  name: 'milestones',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMilestones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMilestones.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMilestones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default milestonesSlice.reducer; 
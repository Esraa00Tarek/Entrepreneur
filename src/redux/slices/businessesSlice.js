import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// const BASE_URL = 'https://backendelevante-production.up.railway.app';
const BASE_URL = 'http://localhost:5000';
export const fetchBusinesses = createAsyncThunk(
  'businesses/fetchBusinesses',
  async (_, thunkAPI) => {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${BASE_URL}/api/businesses/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // دعم كل من data و businesses
    return res.data.businesses ?? res.data.data ?? [];
  }
);

const businessesSlice = createSlice({
  name: 'businesses',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBusinesses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBusinesses.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBusinesses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default businessesSlice.reducer; 
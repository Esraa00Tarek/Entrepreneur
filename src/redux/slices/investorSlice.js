import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Initial state
const initialState = {
  requests: [],
  status: 'idle',
  error: null,
  loading: false,
  filters: {
    category: '',
    keyword: '',
    page: 1,
    limit: 10
  }
};

// Async thunks for API calls
export const fetchInvestorRequests = createAsyncThunk(
  'investor/fetchRequests',
  async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.keyword) params.append('keyword', filters.keyword);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await axios.get(`/api/requests?${params.toString()}`);
    return response.data;
  }
);

export const createInvestmentRequest = createAsyncThunk(
  'investor/createRequest',
  async (requestData) => {
    const response = await axios.post('/api/requests', {
      ...requestData,
      offerType: 'Investment'
    });
    return response.data;
  }
);

export const updateRequestStatus = createAsyncThunk(
  'investor/updateRequestStatus',
  async ({ requestId, status }) => {
    const response = await axios.patch(`/api/requests/${requestId}`, { isOpen: status === 'open' });
    return response.data;
  }
);

// Create slice
const investorSlice = createSlice({
  name: 'investor',
  initialState,
  reducers: {
    // Reducers for manual state changes
    resetInvestorState: (state) => {
      state.requests = [];
      state.status = 'idle';
      state.error = null;
      state.loading = false;
      state.filters = {
        category: '',
        keyword: '',
        page: 1,
        limit: 10
      };
    },
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch requests
      .addCase(fetchInvestorRequests.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(fetchInvestorRequests.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.requests = action.payload.requests;
        state.filters.page = action.payload.page;
        state.filters.totalPages = action.payload.totalPages;
        state.loading = false;
      })
      .addCase(fetchInvestorRequests.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
        state.loading = false;
      })
      // Create request
      .addCase(createInvestmentRequest.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(createInvestmentRequest.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.requests.unshift(action.payload);
        state.loading = false;
      })
      .addCase(createInvestmentRequest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
        state.loading = false;
      })
      // Update request status
      .addCase(updateRequestStatus.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.requests = state.requests.map(request => 
          request._id === action.payload._id ? action.payload : request
        );
        state.loading = false;
      })
      .addCase(updateRequestStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
        state.loading = false;
      });
  },
});

export const { resetInvestorState, setFilters } = investorSlice.actions;
export default investorSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  feedback: [],
  reviews: [],
  loading: false,
  error: null,
  feedbackPagination: { page: 1, limit: 20, total: 0 },
  feedbackStatusFilter: 'all',
};

// Fetch all feedback (reports) with status filter and pagination
export const fetchFeedback = createAsyncThunk('feedback/fetchFeedback', async ({ status, page = 1, limit = 20 } = {}, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    const params = {};
    if (status) params.status = status;
    params.page = page;
    params.limit = limit;
    const res = await axios.get('https://backendelevante-production.up.railway.app/api/reports', {
      headers: { Authorization: `Bearer ${token}` },
      params
    });
    return Array.isArray(res.data) ? res.data : (res.data.reports || []);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch feedback');
  }
});

// Fetch all platform reviews
export const fetchReviews = createAsyncThunk('feedback/fetchReviews', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get('https://backendelevante-production.up.railway.app/api/reviews/platform', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data.reviews)) return res.data.reviews;
    return [];
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch reviews');
  }
});

// Update report status (PATCH /api/reports/:id)
export const updateReportStatus = createAsyncThunk('feedback/updateReportStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.patch(`https://backendelevante-production.up.railway.app/api/reports/${id}`, { status }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update report status');
  }
});

// Delete platform review (soft delete)
export const deletePlatformReview = createAsyncThunk('feedback/deletePlatformReview', async (id, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`https://backendelevante-production.up.railway.app/api/reviews/platform/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { id };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete review');
  }
});

// Restore platform review
export const restorePlatformReview = createAsyncThunk('feedback/restorePlatformReview', async (id, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    await axios.patch(`https://backendelevante-production.up.railway.app/api/reviews/platform/${id}/restore`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { id };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to restore review');
  }
});

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Feedback
      .addCase(fetchFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.feedback = action.payload;
        // Optionally update pagination/total if backend returns it
      })
      .addCase(fetchFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Reviews
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Report Status
      .addCase(updateReportStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReportStatus.fulfilled, (state, action) => {
        state.loading = false;
        // Update the report in state.feedback
        const updated = action.payload;
        state.feedback = state.feedback.map(r => r._id === updated._id ? updated : r);
      })
      .addCase(updateReportStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Platform Review
      .addCase(deletePlatformReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePlatformReview.fulfilled, (state, action) => {
        state.loading = false;
        // Mark review as deleted
        state.reviews = state.reviews.map(r => r._id === action.payload.id ? { ...r, isDeleted: true } : r);
      })
      .addCase(deletePlatformReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Restore Platform Review
      .addCase(restorePlatformReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restorePlatformReview.fulfilled, (state, action) => {
        state.loading = false;
        // Mark review as not deleted
        state.reviews = state.reviews.map(r => r._id === action.payload.id ? { ...r, isDeleted: false } : r);
      })
      .addCase(restorePlatformReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default feedbackSlice.reducer; 
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../api/axiosConfig";

// ✅ Fetch customer count by branch
export const fetchCustomerCount = createAsyncThunk(
  "customers/fetchCustomerCount",
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/customer/salon/customer-count?branchId=${branchId}`);
      return response.data.count || 0; // ✅ Ensure count is always defined
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Something went wrong");
    }
  }
);

const customerSlice = createSlice({
  name: "customers",
  initialState: {
    count: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerCount.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomerCount.fulfilled, (state, action) => {
        state.loading = false;
        state.count = action.payload; // ✅ Ensure count is always set
      })
      .addCase(fetchCustomerCount.rejected, (state, action) => {
        state.loading = false;
        state.count = 0; // ✅ Reset count on failure
        state.error = action.payload;
      });
  },
});

export default customerSlice.reducer;

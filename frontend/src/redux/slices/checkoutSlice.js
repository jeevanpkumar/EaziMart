import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const createCheckout = createAsyncThunk(
    "checkout/createCheckout",
    async (checkoutdata, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/checkout`,
                checkoutdata,

                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue({
                message: error.response?.data?.message || error.message || "Unexpected error",
            });
        }
    }
);
export const getCheckout = createAsyncThunk(
    "checkout/getCheckout",
    async (checkoutId, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}`,
                {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("userToken")}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error in the getCheckoutThunk", error);
            rejectWithValue(error.response.data);
        }
    })

const checkoutSlice = createSlice({
    name: "checkout",
    initialState: {
        checkout: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createCheckout.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createCheckout.fulfilled, (state, action) => {
                state.loading = false;
                state.checkout = action.payload;
            })
            .addCase(createCheckout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message || "Something Went wrong";
            })
            .addCase(getCheckout.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCheckout.fulfilled, (state, action) => {
                state.loading = false;
                state.checkout = action.payload;
            })
            .addCase(getCheckout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to get checkout";
            })
    },

});
export default checkoutSlice.reducer;
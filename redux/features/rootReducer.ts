import authReducer from "@/redux/features/authSlice";
import cartReducer from "@/redux/features/cartSlice";
import { combineReducers } from "@reduxjs/toolkit";
import { baseApi } from "../api/baseApi";

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: authReducer,
  cart: cartReducer,
});

export default rootReducer;

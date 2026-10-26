import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

export type AuthUser = { id?: string; name?: string; email?: string; role?: string; [key: string]: unknown };
interface AuthState { token: string | null; user: AuthUser | null; refreshToken: string | null }
const initialState: AuthState = { token: null, user: null, refreshToken: null };
const cookieOptions = () => ({ sameSite: "lax" as const, secure: typeof window !== "undefined" && window.location.protocol === "https:" });

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<{ accessToken: string; refreshToken: string; user: AuthUser | null }>) => {
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      Cookies.set("token", action.payload.accessToken, cookieOptions());
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.refreshToken = null;
      Cookies.remove("token");
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
    },
  },
});

export const { setSession, logout } = authSlice.actions;
export default authSlice.reducer;

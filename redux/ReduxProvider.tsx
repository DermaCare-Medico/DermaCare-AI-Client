"use client";

import { ReactNode, useEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./store";
import { baseApi } from "./api/baseApi";
import { logout, setSession, type AuthState } from "./features/authSlice";

interface PageProps {
  children: ReactNode;
}

function AuthStorageSync() {
  useEffect(() => {
    const syncAuth = (event: StorageEvent) => {
      if (event.key !== "persist:root") return;
      if (!event.newValue) {
        const current = store.getState().auth;
        if (current.token || current.refreshToken) {
          store.dispatch(logout());
          store.dispatch(baseApi.util.resetApiState());
        }
        return;
      }
      try {
        const persistedRoot = JSON.parse(event.newValue) as { auth?: string };
        if (!persistedRoot.auth) return;
        const incoming = JSON.parse(persistedRoot.auth) as AuthState;
        const current = store.getState().auth;

        if (!incoming.token || !incoming.refreshToken) {
          if (current.token || current.refreshToken) {
            store.dispatch(logout());
            store.dispatch(baseApi.util.resetApiState());
          }
          return;
        }

        if (incoming.token !== current.token || incoming.refreshToken !== current.refreshToken) {
          store.dispatch(setSession({
            accessToken: incoming.token,
            refreshToken: incoming.refreshToken,
            user: incoming.user,
          }));
          store.dispatch(baseApi.util.resetApiState());
        }
      } catch {
        // Ignore unrelated or partially-written storage values.
      }
    };

    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  return null;
}

export default function ReduxProvider({ children }: PageProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthStorageSync />
        {children}
      </PersistGate>
    </Provider>
  );
}

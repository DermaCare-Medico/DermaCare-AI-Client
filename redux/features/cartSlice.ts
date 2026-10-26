import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  medicineId: string;
  name: string;
  genericName?: string;
  price: number;
  currency?: string;
  quantity: number;
  requiresPrescription?: boolean;
  dosageForm?: string;
  strength?: string;
}

interface CartState {
  items: CartItem[];
  prescriptionId?: string;
  deliveryAddress: string;
}

const initialState: CartState = {
  items: [],
  deliveryAddress: "",
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, "quantity"> & { quantity?: number }>) => {
      const existing = state.items.find((i) => i.medicineId === action.payload.medicineId);
      const qty = action.payload.quantity ?? 1;
      if (existing) {
        existing.quantity += qty;
      } else {
        state.items.push({ ...action.payload, quantity: qty });
      }
    },
    updateQuantity: (state, action: PayloadAction<{ medicineId: string; quantity: number }>) => {
      const item = state.items.find((i) => i.medicineId === action.payload.medicineId);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter((i) => i.medicineId !== action.payload.medicineId);
        } else {
          item.quantity = action.payload.quantity;
        }
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.medicineId !== action.payload);
    },
    setPrescriptionId: (state, action: PayloadAction<string | undefined>) => {
      state.prescriptionId = action.payload;
    },
    setDeliveryAddress: (state, action: PayloadAction<string>) => {
      state.deliveryAddress = action.payload;
    },
    clearCart: (state) => {
      state.items = [];
      state.prescriptionId = undefined;
    },
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  setPrescriptionId,
  setDeliveryAddress,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;

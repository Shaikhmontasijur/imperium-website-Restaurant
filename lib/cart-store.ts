import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import businessConfig from "@/config/business-config.json";

export interface SelectedOptionChoice {
  groupId: string;
  groupName: string;
  choiceId: string;
  choiceName: string;
  price: number;
}

export interface CartItem {
  cartItemId: string;
  dishId: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  selectedOptions: SelectedOptionChoice[];
  note?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (
    dish: {
      id: string;
      name_en: string;
      price: number;
      image: string;
    },
    selectedOptions?: SelectedOptionChoice[],
    quantity?: number,
    note?: string
  ) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  setItemQuantity: (cartItemId: string, quantity: number) => void;
  removeItem: (cartItemId: string) => void;
  updateNote: (cartItemId: string, note: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getDeliveryFee: (orderType?: "delivery" | "pickup") => number;
  getTotal: (orderType?: "delivery" | "pickup") => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (dish, selectedOptions = [], quantity = 1, note = "") => {
        const optionsTotal = selectedOptions.reduce(
          (sum, opt) => sum + (opt.price || 0),
          0
        );
        const unitPrice = dish.price + optionsTotal;

        // Generate deterministic key for same dish + exact same options
        const sortedOptionIds = [...selectedOptions]
          .map((o) => `${o.groupId}:${o.choiceId}`)
          .sort()
          .join("|");
        const cartItemId = `${dish.id}_${sortedOptionIds}`;

        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.cartItemId === cartItemId
          );

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            const existing = updatedItems[existingIndex];
            updatedItems[existingIndex] = {
              ...existing,
              quantity: existing.quantity + quantity,
              note: note || existing.note,
            };
            return { items: updatedItems, isOpen: true };
          }

          const newItem: CartItem = {
            cartItemId,
            dishId: dish.id,
            name: dish.name_en,
            image: dish.image,
            unitPrice,
            quantity,
            selectedOptions,
            note,
          };

          return { items: [...state.items, newItem], isOpen: true };
        });
      },

      updateQuantity: (cartItemId, delta) => {
        set((state) => {
          const updatedItems = state.items
            .map((item) => {
              if (item.cartItemId === cartItemId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
              }
              return item;
            })
            .filter((item): item is CartItem => item !== null);

          return { items: updatedItems };
        });
      },

      setItemQuantity: (cartItemId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.cartItemId !== cartItemId),
            };
          }
          return {
            items: state.items.map((item) =>
              item.cartItemId === cartItemId ? { ...item, quantity } : item
            ),
          };
        });
      },

      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.cartItemId !== cartItemId),
        }));
      },

      updateNote: (cartItemId, note) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.cartItemId === cartItemId ? { ...item, note } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.unitPrice * item.quantity,
          0
        );
      },

      getDeliveryFee: (orderType = "delivery") => {
        if (orderType === "pickup") return 0;
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        if (subtotal >= businessConfig.ordering.freeDeliveryThreshold) return 0;
        return businessConfig.ordering.deliveryFee;
      },

      getTotal: (orderType = "delivery") => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        const fee = get().getDeliveryFee(orderType);
        return subtotal + fee;
      },
    }),
    {
      name: "imperium_cart_v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);

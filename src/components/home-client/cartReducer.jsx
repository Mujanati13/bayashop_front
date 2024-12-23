import React, { createContext, useReducer, useContext, useEffect } from "react";
import { Alert, message } from "antd";
// Initial state for the cart
const initialState = {
  items: [],
  total: 0,
  originalTotal: 0,
  discount: null,
  discountPercentage: 0,
  discountAmount: 0,
};

// Action types
const ADD_TO_CART = "ADD_TO_CART";
const REMOVE_FROM_CART = "REMOVE_FROM_CART";
const UPDATE_QUANTITY = "UPDATE_QUANTITY";
const CLEAR_CART = "CLEAR_CART";
const LOAD_CART_FROM_STORAGE = "LOAD_CART_FROM_STORAGE";
const APPLY_DISCOUNT = "APPLY_DISCOUNT";
const REMOVE_DISCOUNT = "REMOVE_DISCOUNT";

// Helper function to calculate total
const calculateTotal = (items) => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

const show = () => {
  if (!messageShown) {
    message.success("Ajouter au panier"); // Replace with your notification logic
    messageShown = true; // Set the flag to true
  }
};

// Cart reducer function
const cartReducer = (state, action) => {
  switch (action.type) {
    case ADD_TO_CART: {
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );

      let updatedItems;
      if (existingItemIndex > -1) {
        updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity:
            updatedItems[existingItemIndex].quantity + action.payload.quantity,
        };
      } else {
        updatedItems = [...state.items, action.payload];
        // message.success("Ajouter au panier"); // Replace with your notification logic
        // show();
      }

      const newTotal = state.discount
        ? calculateTotal(updatedItems) * (1 - state.discountPercentage / 100)
        : calculateTotal(updatedItems);

      const cartData = {
        items: updatedItems,
        total: newTotal,
        originalTotal: calculateTotal(updatedItems),
        discount: state.discount,
        discountPercentage: state.discountPercentage,
        discountAmount: state.discountAmount,
      };

      // Save to local storage
      localStorage.setItem("cart", JSON.stringify(cartData));
      return cartData;
    }

    case REMOVE_FROM_CART: {
      const filteredItems = state.items.filter(
        (item) => item.id !== action.payload
      );

      const newOriginalTotal = calculateTotal(filteredItems);
      const newTotal = state.discount
        ? newOriginalTotal * (1 - state.discountPercentage / 100)
        : newOriginalTotal;

      const cartData = {
        items: filteredItems,
        total: newTotal,
        originalTotal: newOriginalTotal,
        discount: state.discount,
        discountPercentage: state.discountPercentage,
        discountAmount: state.discountAmount,
      };

      // Save to local storage
      localStorage.setItem("cart", JSON.stringify(cartData));

      return cartData;
    }

    case UPDATE_QUANTITY: {
      const updatedItems = state.items.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );

      const newOriginalTotal = calculateTotal(updatedItems);
      const newTotal = state.discount
        ? newOriginalTotal * (1 - state.discountPercentage / 100)
        : newOriginalTotal;

      const cartData = {
        items: updatedItems,
        total: newTotal,
        originalTotal: newOriginalTotal,
        discount: state.discount,
        discountPercentage: state.discountPercentage,
        discountAmount: state.discountAmount,
      };

      // Save to local storage
      localStorage.setItem("cart", JSON.stringify(cartData));

      return cartData;
    }

    case APPLY_DISCOUNT: {
      const { percentage, amount, originalTotal } = action.payload;
      const newTotal = originalTotal * (1 - percentage / 100);

      const cartData = {
        ...state,
        total: newTotal,
        originalTotal: originalTotal,
        discount: true,
        discountPercentage: percentage,
        discountAmount: amount,
      };

      // Save to local storage
      localStorage.setItem("cart", JSON.stringify(cartData));

      return cartData;
    }

    case REMOVE_DISCOUNT: {
      const newTotal = calculateTotal(state.items);

      const cartData = {
        ...state,
        total: newTotal,
        originalTotal: newTotal,
        discount: null,
        discountPercentage: 0,
        discountAmount: 0,
      };

      // Save to local storage
      localStorage.setItem("cart", JSON.stringify(cartData));

      return cartData;
    }

    case CLEAR_CART: {
      // Remove from local storage
      localStorage.removeItem("cart");

      return initialState;
    }

    case LOAD_CART_FROM_STORAGE: {
      return action.payload || initialState;
    }

    default:
      return state;
  }
};

// Create context
const CartContext = createContext();

// Provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from local storage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({
          type: LOAD_CART_FROM_STORAGE,
          payload: parsedCart,
        });
      } catch (error) {
        console.error("Error parsing cart from local storage:", error);
      }
    }
  }, []);

  // Action creators
  const addToCart = (item) => {
    dispatch({
      type: ADD_TO_CART,
      payload: {
        ...item,
        quantity: item.quantity || 1,
      },
    });
  };

  const removeFromCart = (itemId) => {
    dispatch({ type: REMOVE_FROM_CART, payload: itemId });
  };

  const updateQuantity = (itemId, quantity) => {
    dispatch({
      type: UPDATE_QUANTITY,
      payload: { id: itemId, quantity },
    });
  };

  const clearCart = () => {
    dispatch({ type: CLEAR_CART });
  };

  const applyDiscount = (discountDetails) => {
    dispatch({
      type: APPLY_DISCOUNT,
      payload: discountDetails,
    });
  };

  const removeDiscount = () => {
    dispatch({ type: REMOVE_DISCOUNT });
  };

  return (
    <CartContext.Provider
      value={{
        cart: state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyDiscount,
        removeDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

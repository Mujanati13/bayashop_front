import React, { createContext, useReducer, useContext, useEffect } from "react";
import { Alert, message } from "antd";
import { Endpoint } from "../../helper/enpoint";

// Initial state with stock tracking
const initialState = {
  items: [],
  total: 0,
  originalTotal: 0,
  discount: null,
  discountPercentage: 0,
  discountAmount: 0,
  stockStatus: {} // Track stock status for each item
};

// Additional action type for stock updates
const ADD_TO_CART = "ADD_TO_CART";
const REMOVE_FROM_CART = "REMOVE_FROM_CART";
const UPDATE_QUANTITY = "UPDATE_QUANTITY";
const CLEAR_CART = "CLEAR_CART";
const LOAD_CART_FROM_STORAGE = "LOAD_CART_FROM_STORAGE";
const APPLY_DISCOUNT = "APPLY_DISCOUNT";
const REMOVE_DISCOUNT = "REMOVE_DISCOUNT";
const UPDATE_STOCK_STATUS = "UPDATE_STOCK_STATUS";

const calculateTotal = (items) => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case ADD_TO_CART: {
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );

      const stockStatus = state.stockStatus[action.payload.id];
      const availableStock = stockStatus?.available || 0;
      
      let updatedItems;
      if (existingItemIndex > -1) {
        const newQuantity = state.items[existingItemIndex].quantity + action.payload.quantity;
        
        // Check if new quantity exceeds available stock
        if (newQuantity > availableStock) {
          message.warning(`Stock insuffisant. Stock disponible: ${availableStock}`);
          return state;
        }
        
        updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: newQuantity,
        };
      } else {
        // Check if initial quantity exceeds available stock
        if (action.payload.quantity > availableStock) {
          message.warning(`Stock insuffisant. Stock disponible: ${availableStock}`);
          return state;
        }
        
        updatedItems = [...state.items, action.payload];
      }

      const newTotal = state.discount
        ? calculateTotal(updatedItems) * (1 - state.discountPercentage / 100)
        : calculateTotal(updatedItems);

      const cartData = {
        ...state,
        items: updatedItems,
        total: newTotal,
        originalTotal: calculateTotal(updatedItems)
      };

      localStorage.setItem("cart", JSON.stringify(cartData));
      return cartData;
    }

    case REMOVE_FROM_CART: {
      const filteredItems = state.items.filter(
        (item) => item.id !== action.payload
      );

      // When removing an item, update available stock
      const newStockStatus = { ...state.stockStatus };
      delete newStockStatus[action.payload]; // Remove stock status for removed item

      const newOriginalTotal = calculateTotal(filteredItems);
      const newTotal = state.discount
        ? newOriginalTotal * (1 - state.discountPercentage / 100)
        : newOriginalTotal;

      const cartData = {
        ...state,
        items: filteredItems,
        total: newTotal,
        originalTotal: newOriginalTotal,
        stockStatus: newStockStatus
      };

      localStorage.setItem("cart", JSON.stringify(cartData));
      return cartData;
    }

    case UPDATE_QUANTITY: {
      const { id, quantity } = action.payload;
      const stockStatus = state.stockStatus[id];
      
      // Check if new quantity exceeds available stock
      if (quantity > (stockStatus?.available || 0)) {
        message.warning(`Stock insuffisant. Stock disponible: ${stockStatus?.available || 0}`);
        return state;
      }

      const updatedItems = state.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );

      const newOriginalTotal = calculateTotal(updatedItems);
      const newTotal = state.discount
        ? newOriginalTotal * (1 - state.discountPercentage / 100)
        : newOriginalTotal;

      const cartData = {
        ...state,
        items: updatedItems,
        total: newTotal,
        originalTotal: newOriginalTotal
      };

      localStorage.setItem("cart", JSON.stringify(cartData));
      return cartData;
    }

    case UPDATE_STOCK_STATUS: {
      return {
        ...state,
        stockStatus: {
          ...state.stockStatus,
          [action.payload.id]: action.payload.status
        }
      };
    }

    // ... other existing cases remain the same ...

    default:
      return state;
  }
};

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Check stock status for an item
  const checkStock = async (itemId, quantity) => {
    try {
      const response = await fetch(`${Endpoint()}/articles/check-quantity/${itemId}/${quantity}`);
      const data = await response.json();
      
      dispatch({
        type: UPDATE_STOCK_STATUS,
        payload: { id: itemId, status: data }
      });
      
      return data;
    } catch (error) {
      console.error("Error checking stock:", error);
      message.error("Erreur lors de la vérification du stock");
      return null;
    }
  };

  const addToCart = async (item) => {
    // Check stock before adding
    const stockStatus = await checkStock(item.id, item.quantity || 1);
    if (stockStatus?.isAvailable) {
      dispatch({
        type: ADD_TO_CART,
        payload: {
          ...item,
          quantity: item.quantity || 1,
        },
      });
    } else {
      message.warning(stockStatus?.message || "Stock insuffisant");
    }
  };

  const removeFromCart = (itemId) => {
    dispatch({ type: REMOVE_FROM_CART, payload: itemId });
  };

  const updateQuantity = async (itemId, quantity) => {
    // Check stock before updating quantity
    const stockStatus = await checkStock(itemId, quantity);
    if (stockStatus?.isAvailable) {
      dispatch({
        type: UPDATE_QUANTITY,
        payload: { id: itemId, quantity },
      });
    } else {
      message.warning(stockStatus?.message || "Stock insuffisant");
    }
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


  // Load cart and check stock on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({
          type: LOAD_CART_FROM_STORAGE,
          payload: parsedCart,
        });
        
        // Check stock for all items in cart
        parsedCart.items.forEach(item => {
          checkStock(item.id, item.quantity);
        });
      } catch (error) {
        console.error("Error parsing cart from local storage:", error);
      }
    }
  }, []);

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
        checkStock
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
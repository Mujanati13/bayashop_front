import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Popover, InputNumber, message } from "antd";
import { ShoppingCartOutlined, HeartOutlined, CheckOutlined, LoadingOutlined } from "@ant-design/icons";
import { Endpoint } from "../../helper/enpoint";
import { useCart } from "./cartReducer";

// Messages en français
const FRENCH_MESSAGES = {
  checkingStock: "Vérification du stock...",
  stockError: "Erreur lors de la vérification du stock",
  addToCart: "Ajouter",
  productAdded: "Produit ajouté au panier avec succès !",
  outOfStock: "Rupture de stock",
  lowStock: "Stock limité",
  inStock: "En stock",
  availability: "Disponibilité",
  availableStock: "Stock disponible",
  quantityError: "La quantité demandée n'est pas disponible",
  networkError: "Erreur de connexion au serveur",
  addToWishlist: "Ajouter aux favoris",
  maxQuantityReached: "Quantité maximum atteinte",
  invalidQuantity: "Quantité invalide",
  quantityAdjusted: (available) => `La quantité a été ajustée à ${available} (maximum disponible en stock)`,
  quantityTooHigh: (available) => `La quantité demandée dépasse le stock disponible (${available} disponibles)`
};

const initialStockStatus = {
  available: 0,
  isAvailable: false,
  message: FRENCH_MESSAGES.checkingStock
};

const PopoverContent = React.memo(({ 
  name, 
  description, 
  image, 
  stockStatus, 
  quantity, 
  onQuantityChange, 
  renderButton, 
  endpointUrl,
  ratings,
  totalReviews 
}) => (
  <div className="p-4 w-full max-w-xs sm:max-w-sm md:w-80">
    <h4 className="text-base sm:text-lg font-bold mb-2 text-gray-800">{name}</h4>
    <p className="text-gray-600 mb-3 text-xs sm:text-sm">{description}</p>
    <img
      src={`${Endpoint()}${image}`}
      alt={name}
      className="w-full h-40 sm:h-48 md:h-56 object-cover transition-transform duration-300"
    />

    <div className="flex items-center space-x-2 mb-3">
      <div className="flex-1">
        <InputNumber
          min={1}
          max={stockStatus.available || 1}
          value={quantity}
          onChange={onQuantityChange}
          className="w-20 mr-2"
          disabled={!stockStatus.isAvailable}
        />
        {renderButton("flex-1")}
      </div>
      <button 
        className="bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-300"
        title={FRENCH_MESSAGES.addToWishlist}
      >
        <HeartOutlined />
      </button>
    </div>

    <div className="border-t pt-3 mt-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs sm:text-sm text-gray-600">{FRENCH_MESSAGES.availability}:</span>
        <span className={`font-semibold text-xs sm:text-sm ${
          stockStatus.available === 0 ? 'text-red-600' :
          !stockStatus.isAvailable ? 'text-yellow-600' :
          'text-green-600'
        }`}>
          {stockStatus.message}
        </span>
      </div>
      {stockStatus.isAvailable && (
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm text-gray-600">{FRENCH_MESSAGES.availableStock}:</span>
          <span className="text-gray-800 text-xs sm:text-sm">{stockStatus.available}</span>
        </div>
      )}
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs sm:text-sm text-gray-600">Livraison:</span>
        <span className="text-gray-800 text-xs sm:text-sm">Gratuite</span>
      </div>
    </div>
  </div>
));

const Article = React.memo(({
  image,
  name,
  Oldprice,
  newPrice,
  status,
  description = "Découvrez notre article, conçu avec soin et élégance.",
  id,
  ratings = 4,
  totalReviews = 128,
  
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [buttonText, setButtonText] = useState(FRENCH_MESSAGES.addToCart);
  const [isSuccess, setIsSuccess] = useState(false);
  const [stockStatus, setStockStatus] = useState(initialStockStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [previousQuantity, setPreviousQuantity] = useState(1);
  const { addToCart } = useCart();
  

  const calculateDiscount = useCallback(() => {
    if (Oldprice) {
      const discount = ((Oldprice - newPrice) / Oldprice) * 100;
      return Math.round(discount);
    }
    return 0;
  }, [Oldprice, newPrice]);

  const checkQuantity = useCallback(async (requestedQty = 1) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${Endpoint()}/articles/check-quantity/${id}/${requestedQty}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || FRENCH_MESSAGES.stockError);
      }
      
      setStockStatus({
        ...data,
        message: data.available === 0 ? FRENCH_MESSAGES.outOfStock :
                !data.isAvailable ? FRENCH_MESSAGES.lowStock :
                FRENCH_MESSAGES.inStock
      });
      
      if (!data.isAvailable) {
        message.warning(FRENCH_MESSAGES.quantityError);
      }
      
      return data.isAvailable;
    } catch (err) {
      message.error(FRENCH_MESSAGES.networkError);
      setStockStatus({
        available: 0,
        isAvailable: false,
        message: FRENCH_MESSAGES.stockError
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [Endpoint(), id]);

  useEffect(() => {
    checkQuantity(1);
  }, [checkQuantity]);

  const handleQuantityChange = useCallback((value) => {
    if (!value || value < 1) {
      message.error(FRENCH_MESSAGES.invalidQuantity);
      setQuantity(previousQuantity);
      return;
    }

    if (value > stockStatus.available) {
      message.warning(FRENCH_MESSAGES.quantityTooHigh(stockStatus.available));
      setQuantity(stockStatus.available);
      
      setTimeout(() => {
        message.info(FRENCH_MESSAGES.quantityAdjusted(stockStatus.available));
      }, 100);
      return;
    }

    setPreviousQuantity(value);
    setQuantity(value);
    checkQuantity(value);
  }, [checkQuantity, stockStatus.available, previousQuantity]);

  const handleAddToCart = useCallback(async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const isAvailable = await checkQuantity(quantity);
    
    if (isAvailable) {
      setIsSuccess(true);
      setButtonText(FRENCH_MESSAGES.productAdded);
      
      addToCart({
        id,
        name,
        price: newPrice,
        image: `${Endpoint()}${image}`,
        quantity: quantity,
      });

      message.success(FRENCH_MESSAGES.productAdded);

      setTimeout(() => {
        setIsSuccess(false);
        setButtonText(FRENCH_MESSAGES.addToCart);
      }, 2000);
    }
  }, [checkQuantity, quantity, addToCart, id, name, newPrice, image, Endpoint()]);

  const getStockStatusClass = useCallback(() => {
    if (isLoading) return "bg-gray-500";
    if (stockStatus.available === 0) return "bg-red-500";
    if (!stockStatus.isAvailable) return "bg-yellow-500";
    return "bg-green-500";
  }, [isLoading, stockStatus.available, stockStatus.isAvailable]);

  const renderButton = useCallback((additionalClasses = "") => (
    <button
      onClick={handleAddToCart}
      disabled={isLoading || !stockStatus.isAvailable}
      className={`flex items-center justify-center text-white py-1.5 sm:py-2 rounded-md transition-all duration-300 ease-in-out text-xs sm:text-sm ${additionalClasses} ${
        isSuccess ? 'bg-green-500' : 
        isLoading ? 'bg-gray-400' :
        !stockStatus.isAvailable ? 'bg-gray-400 cursor-not-allowed' :
        'bg-blue-500 hover:bg-blue-600'
      }`}
    >
      {isLoading ? (
        <>
          <LoadingOutlined className="mr-2" />
          {FRENCH_MESSAGES.checkingStock}
        </>
      ) : isSuccess ? (
        <>
          <CheckOutlined className="mr-2" />
          {buttonText}
        </>
      ) : stockStatus.available === 0 ? (
        FRENCH_MESSAGES.outOfStock
      ) : (
        <>
          <ShoppingCartOutlined className="mr-2" />
          {buttonText}
        </>
      )}
    </button>
  ), [handleAddToCart, isLoading, stockStatus.isAvailable, isSuccess, stockStatus.available, buttonText]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const discountPercentage = calculateDiscount();

  return (
    <div>
      <div
        className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto
        ${isHovered ? "scale-105 shadow-xl" : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Popover
          content={
            <PopoverContent
              name={name}
              description={description}
              image={image}
              stockStatus={stockStatus}
              quantity={quantity}
              onQuantityChange={handleQuantityChange}
              renderButton={renderButton}
              endpointUrl={Endpoint()}
              ratings={ratings}
              totalReviews={totalReviews}
            />
          }
          title={null}
          trigger="click"
          placement="right"
          overlayClassName="custom-product-popover"
        >
          <div className="relative">
            <img
              src={`${Endpoint()}${image}`}
              alt={name}
              className="w-full h-40 sm:h-48 md:h-56 object-cover transition-transform duration-300"
            />
            {(status || discountPercentage > 0) && (
              <div className={`absolute top-2 sm:top-3 right-2 sm:right-3 ${getStockStatusClass()} text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium shadow-md`}>
                {status || `-${discountPercentage}%`}
              </div>
            )}
          </div>
        </Popover>

        <div className="p-3 sm:p-4">
          <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-gray-800 truncate">
            {name}
          </h3>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {Oldprice && (
                <span className="text-gray-400 line-through text-xs sm:text-sm">
                  {Oldprice}€
                </span>
              )}
              <span className="text-green-600 font-bold text-base sm:text-xl">
                {newPrice}€
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <InputNumber
              min={1}
              max={stockStatus.available || 1}
              value={quantity}
              onChange={handleQuantityChange}
              className="w-20"
              disabled={!stockStatus.isAvailable}
            />
            {renderButton("flex-1")}
          </div>
        </div>
      </div>
    </div>
  );
});

export default Article;
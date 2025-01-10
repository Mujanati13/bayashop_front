import React, { useState, useEffect } from "react";
import { Popover, InputNumber, message } from "antd";
import {
  ShoppingCartOutlined,
  HeartOutlined,
  CheckOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Endpoint } from "../../helper/enpoint";
import { useCart } from "./cartReducer";

// Messages en français
const FRENCH_MESSAGES = {
  addToCart: "Ajouter",
  productAdded: "Produit ajouté au panier avec succès !",
};

const PopoverContent = React.memo(
  ({
    name,
    description,
    image,
    stockStatus,
    quantity,
    onQuantityChange,
    renderButton,
    endpointUrl,
  }) => (
    <div className="p-4 w-full max-w-xs sm:max-w-sm md:w-80">
      <h4 className="text-base sm:text-lg font-bold mb-2 text-gray-800">
        {name}
      </h4>
      <p className="text-gray-600 mb-3 text-xs sm:text-sm">{description}</p>
      <img
        src={`${endpointUrl}${image}`}
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
          />
          {renderButton("flex-1")}
        </div>
        <button
          className="bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-300"
          title="Favoris"
        >
          <HeartOutlined />
        </button>
      </div>

      <div className="border-t pt-3 mt-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs sm:text-sm text-gray-600">
            Disponibilité:
          </span>
          <span
            className={`text-green-600 font-semibold text-xs sm:text-sm ${
              stockStatus.available === 0
                // ? "text-red-600"
                // : !stockStatus.isAvailable
                // ? "text-
                // -600"
                
            }`}
          >
            {stockStatus.message}
          </span>
        </div>
        {stockStatus.isAvailable && (
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-gray-600">Stock:</span>
            <span className="text-gray-800 text-xs sm:text-sm">
              {stockStatus.available}
            </span>
          </div>
        )}
      </div>
    </div>
  )
);

const Nouveaute = React.memo(
  ({
    image,
    name,
    Oldprice,
    newPrice,
    description = "Découvrez notre dernière nouveauté, conçue avec soin et élégance.",
    id,
  }) => {
    const [localState, setLocalState] = useState({
      isHovered: false,
      buttonText: FRENCH_MESSAGES.addToCart,
      isSuccess: false,
      stockStatus: {
        available: 0,
        isAvailable: false,
        message: "Vérification...",
      },
      isLoading: false,
      quantity: 1,
      previousQuantity: 1,
    });

    const { addToCart } = useCart();
    const endpointUrl = Endpoint();

    // Effect for initial quantity check
    useEffect(() => {
      const checkQuantity = async (requestedQty = 1) => {
        setLocalState((prev) => ({ ...prev, isLoading: true }));
        try {
          const response = await fetch(
            `${endpointUrl}/articles/check-quantity/${id}/${requestedQty}`
          );
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Erreur stock");
          }

          setLocalState((prev) => ({
            ...prev,
            stockStatus: {
              ...data,
              // message: data.available === 0 ? "Rupture" :
              //         !data.isAvailable ? "Stock bas" :
              //         "Disponible"
            },
            isLoading: false,
          }));

          if (!data.isAvailable) {
            message.warning("Quantité non disponible");
          }

          return data.isAvailable;
        } catch (err) {
          message.error("Erreur serveur");
          setLocalState((prev) => ({
            ...prev,
            stockStatus: {
              available: 0,
              isAvailable: false,
              message: "Erreur",
            },
            isLoading: false,
          }));
          return false;
        }
      };

      checkQuantity(1);
    }, []);

    // Effect for quantity changes
    useEffect(() => {
      const checkQuantity = async (requestedQty) => {
        setLocalState((prev) => ({ ...prev, isLoading: true }));
        try {
          const response = await fetch(
            `${endpointUrl}/articles/check-quantity/${id}/${requestedQty}`
          );
          const data = await response.json();

          setLocalState((prev) => ({
            ...prev,
            stockStatus: {
              ...data,
              // message: data.available === 0 ? "Rupture" :
              //         !data.isAvailable ? "Stock bas" :
              //         "Disponible"
            },
            isLoading: false,
          }));

          return data.isAvailable;
        } catch (err) {
          message.error("Erreur serveur");
          setLocalState((prev) => ({
            ...prev,
            stockStatus: {
              available: 0,
              isAvailable: false,
              message: "Erreur",
            },
            isLoading: false,
          }));
          return false;
        }
      };

      if (localState.quantity !== localState.previousQuantity) {
        checkQuantity(localState.quantity);
      }
    }, []);

    const handleQuantityChange = (value) => {
      if (!value || value < 1) {
        message.error("Quantité invalide");
        setLocalState((prev) => ({ ...prev, quantity: prev.previousQuantity }));
        return;
      }

      if (value > localState.stockStatus.available) {
        message.warning(
          `Stock insuffisant (${localState.stockStatus.available} disponibles)`
        );
        setLocalState((prev) => ({
          ...prev,
          quantity: prev.stockStatus.available,
        }));

        setTimeout(() => {
          message.info(
            `Quantité ajustée à ${localState.stockStatus.available}`
          );
        }, 100);
        return;
      }

      setLocalState((prev) => ({
        ...prev,
        previousQuantity: value,
        quantity: value,
      }));
    };

    const handleAddToCart = async (event) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      setLocalState((prev) => ({ ...prev, isLoading: true }));

      try {
        const response = await fetch(
          `${endpointUrl}/articles/check-quantity/${id}/${localState.quantity}`
        );
        const data = await response.json();

        if (data.isAvailable) {
          setLocalState((prev) => ({
            ...prev,
            isSuccess: true,
            buttonText: FRENCH_MESSAGES.productAdded,
            isLoading: false,
          }));

          addToCart({
            id,
            name,
            price: newPrice,
            image: `${endpointUrl}${image}`,
            quantity: localState.quantity,
          });


          setTimeout(() => {
            setLocalState((prev) => ({
              ...prev,
              isSuccess: false,
              buttonText: FRENCH_MESSAGES.addToCart,
            }));
          }, 2000);
        } else {
          message.warning("Quantité non disponible");
          setLocalState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (err) {
        message.error("Erreur serveur");
        setLocalState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    const renderButton = (additionalClasses = "") => (
      <button
        onClick={handleAddToCart}
        className={` bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white py-1.5 sm:py-2 rounded-md transition-all duration-300 ease-in-out text-xs sm:text-sm ${additionalClasses} ${localState.isSuccess}`}
      >
        <>
          {/* <CheckOutlined className="mr-2" /> */}
          {localState.buttonText}
        </>
      </button>
    );

    const stockStatusIndicator = (
      <div
        className={`bg-green-500 absolute top-2 sm:top-3 right-2 sm:right-3 ${localState.isLoading} text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium shadow-md`}
      >
        Disponible
      </div>
    );

    return (
      <div>
        <div
          className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto
        ${localState.isHovered ? "scale-105 shadow-xl" : ""}`}
          onMouseEnter={() =>
            setLocalState((prev) => ({ ...prev, isHovered: true }))
          }
          onMouseLeave={() =>
            setLocalState((prev) => ({ ...prev, isHovered: false }))
          }
        >
          <Popover
            content={
              <PopoverContent
                name={name}
                description={description}
                image={image}
                stockStatus={localState.stockStatus}
                quantity={localState.quantity}
                onQuantityChange={handleQuantityChange}
                renderButton={renderButton}
                endpointUrl={endpointUrl}
              />
            }
            title={null}
            trigger="click"
            placement="right"
            overlayClassName="custom-product-popover"
          >
            <div className="relative">
              <img
                src={`${endpointUrl}${image}`}
                alt={name}
                className="w-full h-40 sm:h-48 md:h-56 object-cover transition-transform duration-300"
              />
              {stockStatusIndicator}
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
                max={localState.stockStatus.available || 1}
                value={localState.quantity}
                onChange={handleQuantityChange}
                className="w-20"
              />
              {renderButton("flex-1")}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default Nouveaute;

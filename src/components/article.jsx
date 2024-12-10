import { Popover, Rate } from "antd";
import React, { useState } from "react";
import { ShoppingCartOutlined, HeartOutlined } from "@ant-design/icons";

const Article = ({
  image,
  name,
  Oldprice,
  newPrice,
  status,
  description,
  ratings = 4,
  totalReviews = 128,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate discount percentage if old price is provided 
  const calculateDiscount = () => {
    if (Oldprice) {
      const discount = ((Oldprice - newPrice) / Oldprice) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  const PopoverContent = () => (
    <div className="p-4 w-full max-w-xs sm:max-w-sm md:max-w-md">
      <h4 className="text-base sm:text-lg font-bold mb-2 text-gray-800">{name}</h4>
      <p className="text-gray-600 mb-3 text-xs sm:text-sm">{description}</p>

      <div className="flex items-center mb-3">
        <img
          src={"http://84.247.166.36:3002" + image}
          alt={name}
          className="w-full h-40 sm:h-48 md:h-56 object-cover transition-transform duration-300"
        />
      </div>

      <div className="flex space-x-2 mb-3">
        <button className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 flex items-center justify-center text-xs sm:text-sm">
          <ShoppingCartOutlined className="mr-1 sm:mr-2 text-sm" /> Ajouter au panier
        </button>
      </div>

      <div className="border-t pt-3 mt-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs sm:text-sm text-gray-600">Disponibilité :</span>
          <span className="text-green-600 font-semibold text-xs sm:text-sm">En stock</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm text-gray-600">Livraison :</span>
          <span className="text-gray-800 text-xs sm:text-sm">Gratuite</span>
        </div>
      </div>
    </div>
  );

  const discountPercentage = calculateDiscount();

  return (
    <Popover
      content={<PopoverContent />}
      title={null}
      trigger="click"
      placement="right"
      overlayClassName="custom-product-popover"
    >
      <div
        className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto
        ${isHovered ? "scale-105 shadow-xl" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative">
          <img
            src={"http://84.247.166.36:3002" + image}
            alt={name}
            className="w-full h-40 sm:h-48 md:h-56 object-cover transition-transform duration-300"
          />
          {(status || discountPercentage > 0) && (
            <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-green-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium shadow-md">
              {status || `-${discountPercentage}%`}
            </div>
          )}
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-gray-800 truncate">
            {name}
          </h3>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {Oldprice && (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <span className="text-gray-400 line-through text-xs sm:text-sm">
                    {Oldprice}€
                  </span>
                </div>
              )}
              <span className="text-green-600 font-bold text-base sm:text-xl">
                {newPrice}€
              </span>
            </div>
          </div>
          <button className="w-full bg-blue-500 text-white py-1.5 sm:py-2 rounded-md hover:bg-blue-600 transition-colors duration-300 ease-in-out text-xs sm:text-sm">
            Ajouter au panier
          </button>
        </div>
      </div>
    </Popover>
  );
};

export default Article;
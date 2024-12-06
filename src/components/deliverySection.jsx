import React from 'react';
import CardPaymentIcon from '../../src/assets/Card Payment.svg';
import TruckIcon from '../../src/assets/Truck.svg';
import HalalSignIcon from '../../src/assets/Halal Sign.svg';
import MapIcon from '../../src/assets/Map.svg';

const DeliverySection = () => {
  return (
    <div>
      <div className="mt-5 p-5 text-lg font-semibold text-center">
        <div>Livraison</div>
      </div>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-between items-center p-5">
          <div className="flex flex-col items-center text-center">
            <div className="mb-2 w-16 h-16 flex items-center justify-center">
              <img 
                src={CardPaymentIcon} 
                alt="Paiement sécurisé" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <span className="text-sm md:text-base">Paiement sécurisé</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-2 w-16 h-16 flex items-center justify-center">
              <img 
                src={TruckIcon} 
                alt="Livraison en 24/48 h" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <span className="text-sm md:text-base">Livraison en 24/48 h</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-2 w-16 h-16 flex items-center justify-center">
              <img 
                src={HalalSignIcon} 
                alt="Produits HALAL" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <span className="text-sm md:text-base">Produits HALAL</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-2 w-16 h-16 flex items-center justify-center">
              <img 
                src={MapIcon} 
                alt="Partout en france" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <span className="text-sm md:text-base">Partout en france</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliverySection;
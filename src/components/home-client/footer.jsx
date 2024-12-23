import { Divider } from "antd";
import { Facebook, Twitter, Youtube } from "lucide-react";
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-white p-5">
      <Divider />
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start space-y-6 md:space-y-0">
          {/* Company Info */}
          <div className="w-full md:w-1/3 text-center md:text-left">
            <h2 className="text-blue-500 font-bold text-2xl">
              BAYA <span className="text-black">SHOP</span>
            </h2>
            <p className="text-gray-600 mt-3">
              Savourez l'art où chaque plat est un chef-d'oeuvre culinaire
            </p>
            <div className="text-gray-600 mt-4">
              <p>&copy; 2025 BAYA SHOP. All rights reserved.</p>
            </div>
          </div>

          {/* Main Menu */}
          <div className="w-full md:w-1/4 flex flex-col items-center md:items-start space-y-2">
            <h3 className="text-blue-600 font-medium">Menu Principal</h3>
            <a href="#" className="text-gray-600 hover:text-blue-500">
              Accueil
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-500">
              Offres
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-500">
              Menus
            </a>
          </div>

          {/* Contact Info */}
          <div className="w-full md:w-1/4 flex flex-col items-center md:items-start space-y-2">
            <h3 className="text-blue-600 font-medium">Contactez-nous</h3>
            <a
              href="mailto:example@email.com"
              className="text-gray-600 hover:text-blue-500"
            >
              example@email.com
            </a>
            <a
              href="tel:+64958248966"
              className="text-gray-600 hover:text-blue-500"
            >
              +64 958 248 966
            </a>
            
            {/* Social Icons */}
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-600 hover:text-blue-500">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-500">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-500">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-500">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Social Icons at Bottom */}
        <div className="flex items-center justify-center space-x-10 mt-8">
          <Facebook color="blue" className="w-6 h-6 md:w-8 md:h-8" />
          <Twitter className="w-6 h-6 md:w-8 md:h-8" />
          <Youtube color="red" className="w-6 h-6 md:w-8 md:h-8" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
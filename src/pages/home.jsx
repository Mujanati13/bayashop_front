import React, { useState, useEffect } from "react";
import {
  ShoppingCartOutlined,
  UserOutlined,
  SearchOutlined,
  TruckOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Input, Popover, Modal } from "antd";
import axios from "axios";
import Article from "../components/article";
import ImageCarousel from "../components/image";
import Nouveaute from "../components/nouveaute";
import Footer from "../components/footer";
import DeliverySection from "../components/deliverySection";

const DEFAULT_PRODUCT_IMAGE = "/default-product.jpg";
const API_BASE_URL = "http://84.247.166.36:3002"; // Replace with your actual API base URL

const PageAccueilBayaShop = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search-related states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.pageYOffset > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, articlesResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/categories`),
          axios.get(`${API_BASE_URL}/articles`),
        ]);

        setCategories(categoriesResponse.data);
        setArticles(articlesResponse.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Search functionality
  const handleSearch = (value) => {
    setSearchQuery(value);

    // Filter articles based on search query
    const results = articles.filter((article) =>
      article.Nom.toLowerCase().includes(value.toLowerCase())
    );

    // Generate suggestions with title and image
    const suggestions = results.slice(0, 5).map((article) => ({
      id: article.ID_ART,
      name: article.Nom,
      image: article.Photo || DEFAULT_PRODUCT_IMAGE,
      price: article.Prix,
    }));

    setSearchSuggestions(suggestions);
    setSearchResults(results);
  };

  // Open search modal with full results
  const openSearchModal = () => {
    setIsSearchModalVisible(true);
  };

  // Close search modal
  const closeSearchModal = () => {
    setIsSearchModalVisible(false);
  };

  // Render search suggestions dropdown
  const SearchSuggestions = () => (
    <div className="bg-white rounded-lg max-h-80 overflow-y-auto w-96">
      {searchSuggestions.length > 0 ? (
        searchSuggestions.map((item) => (
          <div
            key={item.id}
            className="flex items-center p-2 hover:bg-gray-100 cursor-pointer w-full"
            onClick={openSearchModal}
          >
            <img
              src={"http://84.247.166.36:3002" + item.image}
              alt={item.name}
              className="w-12 h-12 object-cover mr-4 rounded"
            />
            <div>
              <div className="font-semibold">{item.name}</div>
              <div className="text-gray-500">{item.price}€</div>
            </div>
          </div>
        ))
      ) : (
        <div className="p-2 text-gray-500">Aucun résultat</div>
      )}
    </div>
  );

  // Render search modal with results
  const SearchResultsModal = () => (
    <Modal
      title={`Résultats de recherche pour "${searchQuery}"`}
      visible={isSearchModalVisible}
      onCancel={closeSearchModal}
      footer={null}
      width={800}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {searchResults.map((article) => (
          <Article
            key={article.ID_ART}
            name={article.Nom}
            Oldprice={article.AncienPrix || article.Prix}
            newPrice={article.Prix}
            image={article.Photo || DEFAULT_PRODUCT_IMAGE}
          />
        ))}
      </div>
      {searchResults.length === 0 && (
        <div className="text-center text-gray-500">Aucun résultat trouvé</div>
      )}
    </Modal>
  );

  // Toggle side menu (existing code)
  const toggleSideMenu = () => {
    setIsSideMenuOpen(!isSideMenuOpen);
  };

  // Mobile side menu component (existing code)
  const SideMenu = () => (
    <div
      className={`fixed top-0 left-0 w-64 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out 
        ${isSideMenuOpen ? "translate-x-0" : "-translate-x-full"} 
        z-50 pt-16 overflow-y-auto`}
    >
      <div className="absolute top-4 right-4" onClick={toggleSideMenu}>
        <CloseOutlined className="text-2xl cursor-pointer" />
      </div>

      <Input.Search
        placeholder="Rechercher"
        allowClear
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onSearch={openSearchModal}
        className="mx-4 mb-4 w-56"
        prefix={<SearchOutlined />}
      />

      {/* Rest of the side menu remains the same */}
      <ul className="space-y-4 px-4">{/* ... existing menu items ... */}</ul>
    </div>
  );

  // Existing sections (CategoriesSection, PromotionsSection, NewProductsSection)
  const CategoriesSection = () => (
    <div className="mt-5 p-5 text-lg font-semibold text-center">
      <div>Catégories</div>
      <div className="flex justify-between items-center mt-5 flex-wrap">
        {categories.map((category) => (
          <div key={category.ID_CAT} className="mb-4">
            <div
              className="bg-gray-200 rounded-full w-40 h-40 bg-cover bg-center"
              style={{
                backgroundImage: `url(http://84.247.166.36:3002${category.img})`,
              }}
            ></div>
            <div className="mt-2 text-sm">{category.Nom}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const PromotionsSection = () => {
    const promotedArticles = articles.filter(
      (article) => article.Promotion > 0
    );

    return (
      <div className="mt-5 p-5 text-lg font-semibold text-center">
        <div>Promotions</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          {promotedArticles.map((article) => (
            <Popover
              key={article.ID_ART}
              content={<div>Hello world</div>}
              title="Title"
              trigger="click"
            >
              <Article
                name={article.Nom}
                Oldprice={article.AncienPrix || article.Prix}
                newPrice={article.Prix}
                image={article.Photo || DEFAULT_PRODUCT_IMAGE}
              />
            </Popover>
          ))}
        </div>
      </div>
    );
  };

  const NewProductsSection = () => {
    const newProducts = articles.filter(
      (article) => article.Quantite > 0 && !article.Promotion
    );

    return (
      <div className="mt-5 p-5 text-lg font-semibold text-center">
        <div>Nouveautés</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          {newProducts.map((product) => (
            <Nouveaute
              key={product.ID_ART}
              name={product.Nom}
              oldPrice={product.Prix}
              newPrice={product.Prix}
              status={product.Quantite <= 10}
              image={product.Photo || DEFAULT_PRODUCT_IMAGE}
            />
          ))}
        </div>
      </div>
    );
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur de chargement</div>;

  return (
    <div className="flex flex-col">
      {/* Mobile Overlay when Side Menu is Open */}
      {isSideMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSideMenu}
        />
      )}

      {/* Side Menu Component */}
      <SideMenu />

      {/* Search Results Modal */}
      <SearchResultsModal />

      {/* En-tête */}
      {!isScrolled && (
        <div className="bg-green-500 py-2 text-white text-center">
          <p className="font-medium">Livraison gratuite à partir de 99€</p>
        </div>
      )}

      <header
        className={`bg-gray-800 py-4 text-white p-5 ${
          isScrolled ? "fixed top-0 w-full z-10" : ""
        }`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold">
              <span className="text-blue-300">Baya</span> Shop
            </h1>
          </div>

          {/* Mobile Navigation Icons */}
          <div className="flex items-center space-x-4 md:hidden">
            <Popover
              content={<SearchSuggestions />}
              trigger="click"
              placement="bottomRight"
            >
              <SearchOutlined
                className="text-xl cursor-pointer"
                onClick={() => {}}
              />
            </Popover>
            <MenuOutlined
              className="text-xl cursor-pointer"
              onClick={toggleSideMenu}
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Popover
              content={<SearchSuggestions />}
              trigger="click"
              placement="bottomRight"
            >
              <Input.Search
                placeholder="Rechercher"
                allowClear
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onSearch={openSearchModal}
                style={{ width: 500 }}
                prefix={<SearchOutlined />}
              />
            </Popover>
            <div className="flex items-center space-x-4">
              <ShoppingCartOutlined className="text-xl" />
              <UserOutlined className="text-xl" />
              <TruckOutlined className="text-xl" />
            </div>
          </div>
        </div>
      </header>

      {/* Rest of the existing code remains the same */}
      {/* Desktop Navigation */}
      <nav className="bg-white border-b border-gray-200 py-4 mt-0 hidden md:block">
        <ul className="flex justify-center space-x-30 sm:space-x-20">
          <li>
            <a href="#" className="text-blue-500 hover:text-blue-700">
              Promotions
            </a>
          </li>
          {/* ... other navigation items ... */}
        </ul>
      </nav>

      {/* Rest of the content */}
      <div className="flex flex-col-reverse md:flex-row items-center justify-between p-4 mt-0 container mx-auto px-4">
        <div className="w-full md:w-[35%] mt-4 md:mt-0 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Les plats préparés sont prêts !
          </h2>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105">
            Voir la collection
          </button>
        </div>
        <div className="w-full md:w-[65%] mb-4 md:mb-0">
          <ImageCarousel />
        </div>
      </div>

      <div className="container mx-auto">
        <CategoriesSection />
        <PromotionsSection />
        <NewProductsSection />
      </div>

      {/* Livraison section */}
      <DeliverySection />

      {/* Pied de page */}
      <Footer />
    </div>
  );
};

export default PageAccueilBayaShop;

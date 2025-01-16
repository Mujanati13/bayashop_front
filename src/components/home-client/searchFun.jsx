import React, { useState, useEffect } from "react";
import {
  Input,
  Spin,
  message,
  Button,
  Drawer,
  Tag,
  Badge,
  Popover,
} from "antd";
import {
  SearchOutlined,
  ShoppingCartOutlined,
  FilterOutlined,
  UserOutlined,
  TruckOutlined,
  MenuOutlined,
  CloseOutlined,
  BackwardOutlined,
} from "@ant-design/icons";
import { Endpoint } from "../../helper/enpoint";
import { CartProvider, useCart } from "./cartReducer";
import CartModal from "./CartModal";
import { Link } from "react-router-dom";

const SearchPage = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState("default");
  const [hoveredProducts, setHoveredProducts] = useState({});
  const [successStates, setSuccessStates] = useState({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isCartModalVisible, setIsCartModalVisible] = useState(false);
  const [counter, setCounter] = useState(0);
  const { addToCart, cart } = useCart();

  // Categories (example - replace with your actual categories)
  const categories = [
    "Électronique",
    "Vêtements",
    "Accessoires",
    "Maison",
    "Sport",
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.pageYOffset > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const itemCount = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );
    setCounter(itemCount);
  }, [cart.items]);

  // Fetch products based on search and filters
  const fetchProducts = async (queryString = "") => {
    setIsLoading(true);
    try {
      const response = await fetch(`${Endpoint()}/articles`);

      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();

      // Apply sorting
      let sortedData = [...data];
      if (sortBy === "price-asc") {
        sortedData.sort((a, b) => a.Prix - b.Prix);
      } else if (sortBy === "price-desc") {
        sortedData.sort((a, b) => b.Prix - a.Prix);
      }

      setProducts(sortedData);
    } catch (error) {
      console.error("Search error:", error);
      message.error("Une erreur est survenue lors de la recherche");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input
  const handleSearch = (value) => {
    setSearchQuery(value);
    fetchProducts(value);
  };

  // Toggle side menu
  const toggleSideMenu = () => {
    setIsSideMenuOpen(!isSideMenuOpen);
  };

  // Handle category selection
  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Handle add to cart
  const handleAddToCart = async (product, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    setSuccessStates((prev) => ({ ...prev, [product.ID_ART]: true }));

    addToCart({
      id: product.ID_ART,
      name: product.Nom,
      price: product.Prix,
      image: `${Endpoint()}${product.Photo}`,
      quantity: 1,
    });

    // message.success('Produit ajouté au panier');

    setTimeout(() => {
      setSuccessStates((prev) => ({ ...prev, [product.ID_ART]: false }));
    }, 2000);
  };

  // Calculate discount
  const calculateDiscount = (oldPrice, newPrice) => {
    if (oldPrice && oldPrice > newPrice) {
      return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
    }
    return 0;
  };

  // Mobile side menu component
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
        className="mx-4 mb-4 w-56"
        prefix={<SearchOutlined />}
      />
      <ul className="space-y-4 px-4">
        {categories.map((category) => (
          <li key={category} className="cursor-pointer hover:text-blue-500">
            {category}
          </li>
        ))}
      </ul>
    </div>
  );

  // Effect to fetch products when filters change
  useEffect(() => {
    fetchProducts(searchQuery);
  }, [selectedCategories, priceRange, sortBy]);

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Cart Modal */}
        <CartModal
          visible={isCartModalVisible}
          onClose={() => setIsCartModalVisible(false)}
        />

        {/* Mobile Overlay when Side Menu is Open */}
        {isSideMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleSideMenu}
          />
        )}

        {/* Side Menu Component */}
        <SideMenu />

        {/* Header */}
        {!isScrolled && (
          <div className="bg-green-500 py-2 text-white text-center">
            <p className="font-medium">Livraison gratuite à partir de 99€</p>
          </div>
        )}

        <header
          className={`bg-gray-200 py-4 text-white p-5 ${
            isScrolled ? "fixed top-0 w-full z-10" : ""
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold flex items-center space-x-2">
                <span className="text-blue-300">
                  <img
                    src="../../src/assets/logo-removebg-preview.png"
                    width={150}
                    height={100}
                    alt=""
                    className="object-contain"
                  />
                </span>
              </h1>
            </div>

            {/* Mobile Navigation Icons */}
            <div className="flex items-center space-x-4 md:hidden">
              <SearchOutlined className="text-xl cursor-pointer" />
              <MenuOutlined
                className="text-xl cursor-pointer"
                onClick={toggleSideMenu}
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {/* <Input.Search
                placeholder="Rechercher un produit..."
                allowClear
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 500 }}
                prefix={<SearchOutlined />}
              /> */}
              <div className="flex items-center space-x-4">
                <Badge count={counter} size="small">
                  <ShoppingCartOutlined
                    className="text-xl cursor-pointer text-black"
                    onClick={() => setIsCartModalVisible(true)}
                  />
                </Badge>
                <UserOutlined className="text-xl text-black" />
                <TruckOutlined className="text-xl text-black" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 mt-0">
          {/* Search and filter controls */}
          <Link to={"/home"}>
            <div className="flex items-center space-x-2">
              <BackwardOutlined />
              <div className="text-blue-600">Retour à la page d'accueil</div>
            </div>
          </Link>
          <div className="mt-5 flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-grow md:hidden">
              <Input.Search
                placeholder="Rechercher un produit..."
                allowClear
                enterButton
                size="large"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </div>

            {/* <Button
              size="large"
              icon={<FilterOutlined />}
              onClick={() => setFiltersVisible(true)}
            >
              Filtres
            </Button> */}

            <select
              className="border rounded-md px-4 py-2"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Trier par</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>
          </div>

          {/* Selected filters display */}
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCategories.map((category) => (
                <Tag
                  key={category}
                  closable
                  onClose={() => toggleCategory(category)}
                  className="px-3 py-1"
                >
                  {category}
                </Tag>
              ))}
            </div>
          )}

          {/* Products grid */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="large" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const discount = calculateDiscount(
                  product.AncienPrix,
                  product.Prix
                );
                const isHovered = hoveredProducts[product.ID_ART];
                const isSuccess = successStates[product.ID_ART];

                return (
                  <div
                    key={product.ID_ART}
                    className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300
                      ${isHovered ? "scale-105 shadow-xl" : ""}`}
                    onMouseEnter={() =>
                      setHoveredProducts((prev) => ({
                        ...prev,
                        [product.ID_ART]: true,
                      }))
                    }
                    onMouseLeave={() =>
                      setHoveredProducts((prev) => ({
                        ...prev,
                        [product.ID_ART]: false,
                      }))
                    }
                  >
                    <div className="relative">
                      <img
                        src={`${Endpoint()}${product.Photo}`}
                        alt={product.Nom}
                        className="w-full h-48 object-cover"
                      />
                      {discount > 0 && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm">
                          -{discount}%
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
                        {product.Nom}
                      </h3>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          {product.AncienPrix && (
                            <span className="text-gray-400 line-through text-sm">
                              {product.AncienPrix}€
                            </span>
                          )}
                          <span className="text-xl font-bold text-gray-900">
                            {product.Prix}€
                          </span>
                        </div>
                        {product.status && (
                          <span className="text-green-600 text-sm">
                            {product.status}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className={`w-full px-4 py-2 rounded-md text-white transition-colors duration-300 flex items-center justify-center
                          ${
                            isSuccess
                              ? "bg-green-500"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                      >
                        <ShoppingCartOutlined className="mr-2" />
                        {isSuccess ? "Ajouté !" : "Ajouter au panier"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {products.length === 0 && !isLoading && (
            <div className="text-center text-gray-500 py-12">
              Aucun produit trouvé
            </div>
          )}

          {/* Filters drawer */}
          <Drawer
            title="Filtres"
            placement="right"
            onClose={() => setFiltersVisible(false)}
            open={filtersVisible}
          >
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Catégories</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        id={category}
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="mr-2"
                      />
                      <label htmlFor={category}>{category}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Prix</h4>
                <div className="flex items-center space-x-4">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([+e.target.value, priceRange[1]])
                    }
                    className="w-24"
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], +e.target.value])
                    }
                    className="w-24"
                  />
                </div>
              </div>

              <Button
                type="primary"
                onClick={() => {
                  fetchProducts(searchQuery);
                  setFiltersVisible(false);
                }}
                block
              >
                Appliquer les filtres
              </Button>
            </div>
          </Drawer>
        </div>
      </div>
    </CartProvider>
  );
};

// Wrap the SearchPage component with CartProvider
const SearchPageWithCart = () => {
  return (
    <CartProvider>
      <SearchPage />
    </CartProvider>
  );
};

export default SearchPageWithCart;

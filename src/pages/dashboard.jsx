import React, { useState } from "react";
import { Layout, Menu, Typography, Button, Breadcrumb } from "antd";
import {
  BookOutlined,
  TagsOutlined,
  PercentageOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

import Products from "../components/dashborad-ad/products"; // Importer le composant Products que nous avons créé
import Categories from "../components/dashborad-ad/categories"; // Supposons que vous avez ce composant
import PromoCodes from "../components/dashborad-ad/code-promo"; // Supposons que vous avez ce composant
import Orders from "../components/dashborad-ad/command"; // Supposons que vous avez ce composant

const { Header, Sider, Content } = Layout;

const Dashboard = () => {
  const [selectedMenuItem, setSelectedMenuItem] = useState("dashboard");

  // Rendu de la vue d'ensemble du tableau de bord
  const renderDashboardOverview = () => (
    <div className="p-4">
      <Typography.Title level={3}>
        Bienvenue dans l'Administration de BAYA Shop
      </Typography.Title>
      <Typography.Paragraph>
        Sélectionnez une section dans le menu pour gérer votre boutique.
      </Typography.Paragraph>

      {/* Vous pouvez ajouter ici des statistiques du tableau de bord, graphiques, etc. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <Typography.Title level={4}>Produits</Typography.Title>
          <Typography.Text>Gérez votre catalogue de produits</Typography.Text>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <Typography.Title level={4}>Catégories</Typography.Title>
          <Typography.Text>Organisez vos produits</Typography.Text>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <Typography.Title level={4}>Codes Promo</Typography.Title>
          <Typography.Text>Gérez vos promotions</Typography.Text>
        </div>
      </div>
    </div>
  );

  // Rendu du contenu approprié en fonction de l'élément de menu sélectionné
  const renderContent = () => {
    switch (selectedMenuItem) {
      case "dashboard":
        return renderDashboardOverview();
      case "products":
        return <Products />;
      case "categories":
        return <Categories />;
      case "promocodes":
        return <PromoCodes />;
      case "orders":
        return <Orders />;
      default:
        return renderDashboardOverview();
    }
  };

  // Obtenez le titre du fil d'Ariane en fonction de l'élément de menu sélectionné
  const getBreadcrumbTitle = () => {
    switch (selectedMenuItem) {
      case "dashboard":
        return "Tableau de bord";
      case "products":
        return "Gestion des Produits";
      case "categories":
        return "Gestion des Catégories";
      case "promocodes":
        return "Codes Promo";
      case "orders":
        return "Commandes";
      default:
        return "Tableau de bord";
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Barre latérale */}
      <Sider theme="light" width={250}>
        <div className="p-4">
          <Typography.Title level={4}>
            BAYA <span className="text-blue-500">Shop</span>{" "}
            <span className="text-sm">Admin</span>
          </Typography.Title>
        </div>

        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedMenuItem]}
          onSelect={({ key }) => setSelectedMenuItem(key)}
        >
          <Menu.Item key="dashboard" icon={<BookOutlined />}>
            Tableau de bord
          </Menu.Item>
          <Menu.Item key="products" icon={<BookOutlined />}>
            Gestion des Produits
          </Menu.Item>
          <Menu.Item key="categories" icon={<TagsOutlined />}>
            Gestion des Catégories
          </Menu.Item>
          <Menu.Item key="promocodes" icon={<PercentageOutlined />}>
            Codes Promo
          </Menu.Item>
          <Menu.Item key="orders" icon={<></>}>
            Commandes
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        {/* En-tête */}
        <Header className="bg-white flex justify-end items-center px-4">
          <Button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            type="text"
            icon={<LogoutOutlined />}
          >
            Déconnexion
          </Button>
        </Header>

        {/* Contenu principal */}
        <Content style={{ margin: "16px" }}>
          <Breadcrumb style={{ marginBottom: "16px" }}>
            <Breadcrumb.Item>{getBreadcrumbTitle()}</Breadcrumb.Item>
          </Breadcrumb>

          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;

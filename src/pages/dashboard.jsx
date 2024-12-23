import React, { useState } from "react";
import { Layout, Menu, Typography, Button, Breadcrumb } from "antd";
import {
  BookOutlined,
  TagsOutlined,
  PercentageOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

import Products from "../components/dashborad-ad/products"; // Import the Products component we created
import Categories from "../components/dashborad-ad/categories"; // Assuming you have this component
import PromoCodes from "../components/dashborad-ad/code-promo"; // Assuming you have this component
import Orders from "../components/dashborad-ad/command";

const { Header, Sider, Content } = Layout;

const Dashboard = () => {
  const [selectedMenuItem, setSelectedMenuItem] = useState("dashboard");

  // Render Dashboard Overview
  const renderDashboardOverview = () => (
    <div className="p-4">
      <Typography.Title level={3}>Welcome to BAYA Shop Admin</Typography.Title>
      <Typography.Paragraph>
        Select a section from the menu to manage your store.
      </Typography.Paragraph>

      {/* You can add dashboard statistics, charts, etc. here */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <Typography.Title level={4}>Products</Typography.Title>
          <Typography.Text>Manage your product catalog</Typography.Text>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <Typography.Title level={4}>Categories</Typography.Title>
          <Typography.Text>Organize your products</Typography.Text>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <Typography.Title level={4}>Promo Codes</Typography.Title>
          <Typography.Text>Manage your promotions</Typography.Text>
        </div>
      </div>
    </div>
  );

  // Render the appropriate content based on selected menu item
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

  // Get the breadcrumb title based on selected menu item
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
        return "Cammandes";
      default:
        return "Tableau de bord";
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
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
          <Menu.Item key="orders" icon={<PercentageOutlined />}>
            Commandes
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        {/* Header */}
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

        {/* Main Content */}
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

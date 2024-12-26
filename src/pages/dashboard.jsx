import React, { useState } from "react";
import { 
  Layout, 
  Menu, 
  Typography, 
  Button, 
  Breadcrumb, 
  Card, 
  Row, 
  Col,
  Space 
} from "antd";
import {
  BookOutlined,
  TagsOutlined,
  PercentageOutlined,
  LogoutOutlined,
  DashboardOutlined,
  ShoppingCartOutlined
} from "@ant-design/icons";

import Products from "../components/dashborad-ad/products";
import Categories from "../components/dashborad-ad/categories";
import PromoCodes from "../components/dashborad-ad/code-promo";
import Orders from "../components/dashborad-ad/command";
import DashboardPlus from "../components/dashborad-ad/dashboard";

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const Dashboard = () => {
  const [selectedMenuItem, setSelectedMenuItem] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Tableau de bord"
    },
    {
      key: "products",
      icon: <BookOutlined />,
      label: "Gestion des Produits"
    },
    {
      key: "categories",
      icon: <TagsOutlined />,
      label: "Gestion des Catégories"
    },
    {
      key: "promocodes",
      icon: <PercentageOutlined />,
      label: "Codes Promo"
    },
    {
      key: "orders",
      icon: <ShoppingCartOutlined />,
      label: "Commandes"
    }
  ];

  const renderDashboardOverview = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <DashboardPlus />
    </Space>
  );

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

  const getBreadcrumbTitle = () => {
    const item = menuItems.find(item => item.key === selectedMenuItem);
    return item ? item.label : "Tableau de bord";
  };

  return (
    <Layout style={{ height: '100vh' }}>
      {/* Fixed Header */}
      <Header 
        style={{
          position: 'fixed',
          width: '100%',
          zIndex: 2,
          padding: '0 16px',
          background: '#fff',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            BAYA{" "}
            <Text type="primary" strong>Shop</Text>{" "}
            <Text type="secondary" style={{ fontSize: "0.875rem" }}>Admin</Text>
          </Title>
        </div>
        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
        >
          Déconnexion
        </Button>
      </Header>

      <Layout style={{ marginTop: 64 }}> {/* Height of header */}
        {/* Fixed Sider */}
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={(value) => setCollapsed(value)}
          theme="light"
          width={250}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 64, // Height of header
            bottom: 0,
          }}
        >
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[selectedMenuItem]}
            onSelect={({ key }) => setSelectedMenuItem(key)}
            items={menuItems}
            style={{ borderRight: 0 }}
          />
        </Sider>

        {/* Scrollable Content */}
        <Layout style={{ 
          marginLeft: collapsed ? 80 : 250,
          transition: 'all 0.2s',
          background: '#f5f5f5'
        }}>
          <Content style={{ margin: '24px 16px', overflow: 'initial' }}>
            <Breadcrumb style={{ marginBottom: 16 }}>
              <Breadcrumb.Item>
                <DashboardOutlined />
              </Breadcrumb.Item>
              <Breadcrumb.Item>{getBreadcrumbTitle()}</Breadcrumb.Item>
            </Breadcrumb>

            <Card style={{ minHeight: 'calc(100vh - 160px)' }}>
              {renderContent()}
            </Card>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
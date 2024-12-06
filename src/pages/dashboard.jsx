import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Layout,
  Menu,
  Breadcrumb,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Card,
  Typography,
  message,
  Upload,
  Switch,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LogoutOutlined,
  BookOutlined,
  TagsOutlined,
  UploadOutlined,
} from "@ant-design/icons";

// API Base URL (replace with your actual backend URL)
const API_BASE_URL = "http://localhost:3000";

const ProductManagement = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState("dashboard");
  const [fileList, setFileList] = useState([]);

  // Modal states
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [isProductDetailsModalVisible, setIsProductDetailsModalVisible] =
    useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);

  const showProductDetails = (record) => {
    setSelectedProductDetails(record);
    setIsProductDetailsModalVisible(true);
  };

  // Render Product Details Modal
  const renderProductDetailsModal = () => (
    <Modal
      title="Détails du Produit"
      visible={isProductDetailsModalVisible}
      onCancel={() => {
        setIsProductDetailsModalVisible(false);
        setSelectedProductDetails(null);
      }}
      footer={[
        <Button
          key="close"
          onClick={() => setIsProductDetailsModalVisible(false)}
        >
          Fermer
        </Button>,
      ]}
    >
      {selectedProductDetails && (
        <div>
          {selectedProductDetails.photo && (
            <div className="text-center mb-4">
              <AntImage
                width={200}
                src={selectedProductDetails.photo}
                alt={selectedProductDetails.Nom}
              />
            </div>
          )}
          <Typography.Paragraph>
            <strong>Nom:</strong> {selectedProductDetails.Nom}
          </Typography.Paragraph>
          <Typography.Paragraph>
            <strong>Description:</strong>{" "}
            {selectedProductDetails.Description || "Pas de description"}
          </Typography.Paragraph>
          <Typography.Paragraph>
            <strong>Prix:</strong> {selectedProductDetails.Prix} €
            {selectedProductDetails.Promotion && (
              <span> (Promotion: {selectedProductDetails.AncienPrix} €)</span>
            )}
          </Typography.Paragraph>
          <Typography.Paragraph>
            <strong>Catégorie:</strong>{" "}
            {categories.find(
              (cat) => cat.ID_CAT === selectedProductDetails.ID_CAT
            )?.Nom || "Non catégorisé"}
          </Typography.Paragraph>
          <Typography.Paragraph>
            <strong>Quantité en Stock:</strong>{" "}
            {selectedProductDetails.Quantite}
          </Typography.Paragraph>
          <Typography.Paragraph>
            <strong>En Promotion:</strong>{" "}
            {selectedProductDetails.Promotion ? "Oui" : "Non"}
          </Typography.Paragraph>
          <Typography.Paragraph>
            <strong>Visible sur le site:</strong>{" "}
            {selectedProductDetails.Visible ? "Oui" : "Non"}
          </Typography.Paragraph>
        </div>
      )}
    </Modal>
  );

  // Modified renderProductsTable to include EyeOutlined icon
  const renderProductsTablex = () => (
    <Card
      title="Gestion des Produits"
      extra={
        <Button
          type="primary"
          onClick={() => {
            setCurrentProduct(null);
            setIsProductModalVisible(true);
            productForm.resetFields();
          }}
        >
          <PlusOutlined /> Nouveau Produit
        </Button>
      }
    >
      <Table
        pagination={{
          defaultPageSize: 5,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "30"],
        }}
        size="small"
        loading={loading}
        columns={[
          {
            title: "Image",
            dataIndex: "photo",
            key: "photo",
            render: (photo) =>
              photo ? (
                <AntImage width={50} src={photo} preview={false} />
              ) : null,
          },
          { title: "Nom", dataIndex: "Nom", key: "Nom" },
          {
            title: "Catégorie",
            dataIndex: "ID_CAT",
            key: "ID_CAT",
            render: (categoryId) => {
              const category = categories.find(
                (cat) => cat.ID_CAT === categoryId
              );
              return category ? category.Nom : "Non catégorisé";
            },
          },
          {
            title: "Prix",
            dataIndex: "Prix",
            key: "Prix",
            render: (price, record) => {
              return record.Promotion
                ? `${price} € (Promo: ${record.AncienPrix} €)`
                : `${price} €`;
            },
          },
          {
            title: "Stock",
            dataIndex: "Quantite",
            key: "Quantite",
          },
          {
            title: "Promotion",
            dataIndex: "Promotion",
            key: "Promotion",
            render: (promotion) => (promotion ? "Oui" : "Non"),
          },
          {
            title: "Visible",
            dataIndex: "Visible",
            key: "Visible",
            render: (visible) => (visible ? "Oui" : "Non"),
          },
          {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
              <div>
                <Button
                  type="default"
                  icon={<EyeOutlined />}
                  onClick={() => showProductDetails(record)}
                  className="mr-2"
                  title="Voir les détails"
                />
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setCurrentProduct(record);
                    // Populate the form with existing image
                    if (record.photo) {
                      setFileList([
                        {
                          uid: "-1",
                          name: "image.png",
                          status: "done",
                          url: record.photo,
                        },
                      ]);
                    }
                    productForm.setFieldsValue(record);
                    setIsProductModalVisible(true);
                  }}
                  className="mr-2"
                />
                <Button
                  type="danger"
                  icon={<DeleteOutlined />}
                  onClick={() => deleteProduct(record.ID_ART)}
                />
              </div>
            ),
          },
        ]}
        dataSource={products}
        rowKey="ID_ART"
      />
      {renderProductDetailsModal()}
    </Card>
  );

  // Form
  const [productForm] = Form.useForm();
  const [categoryForm] = Form.useForm();

  // Fetch Products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/articles`);
      setProducts(response.data);
    } catch (error) {
      message.error("Erreur lors de la récupération des produits");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      message.error("Erreur lors de la récupération des catégories");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Product CRUD Operations
  const createProduct = async (values) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/articles`, values);
      message.success("Produit créé avec succès");
      fetchProducts();
      setIsProductModalVisible(false);
    } catch (error) {
      message.error("Erreur lors de la création du produit");
      console.error(error);
    }
  };

  const updateProduct = async (values) => {
    try {
      await axios.put(`${API_BASE_URL}/articles/${values.ID_ART}`, values);
      message.success("Produit mis à jour avec succès");
      fetchProducts();
      setIsProductModalVisible(false);
    } catch (error) {
      message.error("Erreur lors de la mise à jour du produit");
      console.error(error);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/articles/${id}`);
      message.success("Produit supprimé avec succès");
      fetchProducts();
    } catch (error) {
      message.error("Erreur lors de la suppression du produit");
      console.error(error);
    }
  };

  // Category CRUD Operations
  const createCategory = async (values) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/categories`, values);
      message.success("Catégorie créée avec succès");
      fetchCategories();
      setIsCategoryModalVisible(false);
    } catch (error) {
      message.error("Erreur lors de la création de la catégorie");
      console.error(error);
    }
  };

  const updateCategory = async (values) => {
    try {
      await axios.put(`${API_BASE_URL}/categories/${values.ID_CAT}`, values);
      message.success("Catégorie mise à jour avec succès");
      fetchCategories();
      setIsCategoryModalVisible(false);
    } catch (error) {
      message.error("Erreur lors de la mise à jour de la catégorie");
      console.error(error);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/categories/${id}`);
      message.success("Catégorie supprimée avec succès");
      fetchCategories();
    } catch (error) {
      message.error("Erreur lors de la suppression de la catégorie");
      console.error(error);
    }
  };

  const handleImageUpload = async (options) => {
    const { file } = options;
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/articles/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      message.success("Image uploaded successfully");
      return response.data;
    } catch (error) {
      message.error("Image upload failed");
      console.error(error);
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  // Lifecycle
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Render Product Modal
  const renderProductModal = () => (
    <Modal
      title={currentProduct ? "Modifier un Produit" : "Ajouter un Produit"}
      visible={isProductModalVisible}
      onCancel={() => {
        setIsProductModalVisible(false);
        setCurrentProduct(null);
        setFileList([]); // Clear the file list

        // Manually reset the form values (in case resetFields doesn't work)
        productForm.setFieldsValue({
          ImageUrl: undefined,
          Quantite: undefined,
          Promotion: false,
          AncienPrix: undefined,
          Visible: false,
          Nom: "",
          Description: "",
          Prix: undefined,
          ID_CAT: undefined,
        });
      }}
      onOk={() => {
        productForm
          .validateFields()
          .then(async (values) => {
            // Handle image upload if a file exists
            let imageUrl = null;
            if (fileList.length > 0) {
              const uploadResponse = await handleImageUpload({
                file: fileList[0],
              });
              imageUrl = uploadResponse.imageUrl;
            }

            const productData = {
              ...values,
              Photo: imageUrl || currentProduct?.Photo,
              ID_ART: currentProduct?.ID_ART,
            };

            // If the product exists, update it; otherwise, create a new product
            currentProduct
              ? updateProduct(productData)
              : createProduct(productData);

            // Reset the file list after the operation
            setFileList([]);
          })
          .catch((error) => {
            console.error("Validation Failed:", error);
          });
      }}
    >
      <Form
        form={productForm}
        layout="vertical"
        initialValues={currentProduct || {}}
      >
        <Form.Item name="ImageUrl" label="Product Image">
          <Upload
            listType="picture-card"
            fileList={fileList}
            onRemove={(file) => {
              const index = fileList.indexOf(file);
              const newFileList = fileList.slice();
              newFileList.splice(index, 1);
              setFileList(newFileList);
            }}
            beforeUpload={(file) => {
              setFileList([...fileList, file]);
              return false;
            }}
            accept="image/*"
          >
            {fileList.length >= 1 ? null : uploadButton}
          </Upload>
        </Form.Item>

        <Form.Item name="Quantite" label="Quantité en Stock">
          <Input type="number" min={0} />
        </Form.Item>

        <Form.Item name="Promotion" valuePropName="checked" label="Promotion">
          <Switch />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.Promotion !== currentValues.Promotion
          }
        >
          {({ getFieldValue }) =>
            getFieldValue("Promotion") ? (
              <Form.Item
                name="AncienPrix"
                label="Prix Avant Promotion"
                rules={[
                  { required: true, message: "Prix avant promotion requis" },
                ]}
              >
                <Input type="number" step="0.01" />
              </Form.Item>
            ) : null
          }
        </Form.Item>

        <Form.Item
          name="Visible"
          valuePropName="checked"
          label="Visible sur le site"
        >
          <Switch />
        </Form.Item>
        <Form.Item
          name="Nom"
          label="Nom du Produit"
          rules={[{ required: true, message: "Nom requis" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="Description" label="Description">
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          name="Prix"
          label="Prix"
          rules={[{ required: true, message: "Prix requis" }]}
        >
          <Input type="number" step="0.01" />
        </Form.Item>
        <Form.Item
          name="ID_CAT"
          label="Catégorie"
          rules={[{ required: true, message: "Catégorie requise" }]}
        >
          <Select>
            {categories.map((cat) => (
              <Select.Option key={cat.ID_CAT} value={cat.ID_CAT}>
                {cat.Nom}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );

  // Render Category Modal
  const renderCategoryModal = () => (
    <Modal
      title={
        currentCategory ? "Modifier une Catégorie" : "Ajouter une Catégorie"
      }
      visible={isCategoryModalVisible}
      onCancel={() => {
        setIsCategoryModalVisible(false);
        setCurrentCategory(null);
        categoryForm.resetFields();
      }}
      onOk={() => {
        categoryForm.resetFields();
        categoryForm
          .validateFields()
          .then((values) => {
            currentCategory
              ? updateCategory({ ...currentCategory, ...values })
              : createCategory(values);
          })
          .catch((error) => {
            console.error("Validation Failed:", error);
          });
      }}
    >
      <Form
        form={categoryForm}
        layout="vertical"
        initialValues={currentCategory || {}}
      >
        <Form.Item
          name="Nom"
          label="Nom de la Catégorie"
          rules={[{ required: true, message: "Nom requis" }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );

  // Render Dashboard Content
  const renderDashboardContent = () => (
    <Card>
      <Typography.Title level={2}>Tableau de Bord</Typography.Title>
      <Typography.Paragraph>
        Total Produits: {products.length}
        <br />
        Total Catégories: {categories.length}
      </Typography.Paragraph>
    </Card>
  );

  // Render Products Table
  const renderProductsTable = () => (
    <Card
      title="Gestion des Produits"
      extra={
        <Button
          type="primary"
          onClick={() => {
            setCurrentProduct(null);
            setIsProductModalVisible(true);
            productForm.resetFields();
          }}
        >
          <PlusOutlined /> Nouveau Produit
        </Button>
      }
    >
      <Table
        pagination={{
          defaultPageSize: 5,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "30"],
        }}
        size="small"
        loading={loading}
        columns={[
          { title: "Nom", dataIndex: "Nom", key: "Nom" },
          {
            title: "Catégorie",
            dataIndex: "ID_CAT",
            key: "ID_CAT",
            render: (categoryId) => {
              const category = categories.find(
                (cat) => cat.ID_CAT === categoryId
              );
              return category ? category.Nom : "Non catégorisé";
            },
          },
          {
            title: "Prix",
            dataIndex: "Prix",
            key: "Prix",
            render: (price, record) => {
              return record.Promotion
                ? `${price} € (Promo: ${record.AncienPrix} €)`
                : `${price} €`;
            },
          },
          {
            title: "Stock",
            dataIndex: "Quantite",
            key: "Quantite",
          },
          {
            title: "Promotion",
            dataIndex: "Promotion",
            key: "Promotion",
            render: (promotion) => (promotion ? "Oui" : "Non"),
          },
          {
            title: "Visible",
            dataIndex: "Visible",
            key: "Visible",
            render: (visible) => (visible ? "Oui" : "Non"),
          },
          {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
              <div>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setCurrentProduct(record);
                    productForm.setFieldsValue(record);
                    setIsProductModalVisible(true);
                  }}
                  className="mr-2"
                />
                <Button
                  type="danger"
                  icon={<DeleteOutlined />}
                  onClick={() => deleteProduct(record.ID_ART)}
                />
              </div>
            ),
          },
        ]}
        dataSource={products}
        rowKey="ID"
      />
    </Card>
  );

  // Render Categories Table
  const renderCategoriesTable = () => (
    <Card
      title="Gestion des Catégories"
      extra={
        <Button
          type="primary"
          onClick={() => {
            setCurrentCategory(null);
            setIsCategoryModalVisible(true);
          }}
        >
          <PlusOutlined /> Nouvelle Catégorie
        </Button>
      }
    >
      <Table
        size="small"
        pagination={{
          defaultPageSize: 4,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "30"],
        }}
        loading={loading}
        columns={[
          { title: "Nom", dataIndex: "Nom", key: "Nom" },
          {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
              <div>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setCurrentCategory(record);
                    categoryForm.setFieldsValue(record);
                    setIsCategoryModalVisible(true);
                  }}
                  className="mr-2"
                />
                <Button
                  type="danger"
                  icon={<DeleteOutlined />}
                  onClick={() => deleteCategory(record.ID_CAT)}
                />
              </div>
            ),
          },
        ]}
        dataSource={categories}
        rowKey="ID_CAT"
      />
    </Card>
  );

  // Main Render
  return (
    <Layout>
      {/* Sidebar with menu */}
      <Layout.Sider theme="light">
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
        </Menu>
      </Layout.Sider>

      {/* Main Content */}
      <Layout>
        <Layout.Header className="bg-white flex justify-end items-center px-4">
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
        </Layout.Header>

        <Layout.Content style={{ margin: "10px 16px 0" }}>
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>
              {selectedMenuItem === "dashboard" && "Tableau de bord"}
              {selectedMenuItem === "products" && "Gestion des Produits"}
              {selectedMenuItem === "categories" && "Gestion des Catégories"}
            </Breadcrumb.Item>
          </Breadcrumb>

          <div style={{ padding: 0, minHeight: 360 }}>
            {selectedMenuItem === "dashboard" && renderDashboardContent()}
            {selectedMenuItem === "products" && renderProductsTable()}
            {selectedMenuItem === "categories" && renderCategoriesTable()}
          </div>
        </Layout.Content>
      </Layout>

      {/* Modals */}
      {renderProductModal()}
      {renderCategoryModal()}
    </Layout>
  );
};

export default ProductManagement;

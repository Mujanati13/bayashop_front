import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Card,
  message,
  Upload,
  Switch,
  Image as AntImage,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { Endpoint } from "../../helper/enpoint";

const API_BASE_URL = Endpoint();

const Products = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);

  // Form instance
  const [form] = Form.useForm();

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
      const response = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      message.error("Erreur lors de la récupération des catégories");
      console.error(error);
    }
  };

  // Product CRUD Operations
  const createProduct = async (values) => {
    try {
      await axios.post(`${API_BASE_URL}/articles`, values);
      message.success("Produit créé avec succès");
      fetchProducts();
      setIsModalVisible(false);
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
      setIsModalVisible(false);
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

  const showProductDetails = (record) => {
    setSelectedProductDetails(record);
    setIsDetailsModalVisible(true);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Render Product Details Modal
  const renderDetailsModal = () => (
    <Modal
      title={
        <div className="flex items-center space-x-3 py-2">
          <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Détails du Produit
          </span>
        </div>
      }
      visible={isDetailsModalVisible}
      onCancel={() => {
        setIsDetailsModalVisible(false);
        setSelectedProductDetails(null);
      }}
      width={800}
      footer={null}
      className="modern-modal"
    >
      {selectedProductDetails && (
        <div className="space-y-6">
          {/* Image Section */}
          <div className="relative group">
            <div className="overflow-hidden rounded-xl">
              <AntImage
                width="100%"
                height={300}
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                src={Endpoint()+selectedProductDetails.Photo}
                alt={selectedProductDetails.Nom}
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                {selectedProductDetails.Nom}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Prix actuel</span>
                  <span className="text-2xl font-bold text-green-600">
                    {selectedProductDetails.Prix}€
                  </span>
                </div>
                {selectedProductDetails.Promotion && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Ancien prix</span>
                    <span className="text-lg text-gray-400 line-through">
                      {selectedProductDetails.AncienPrix}€
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Catégorie</span>
                  <span className="px-4 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    {categories.find(
                      (cat) => cat.ID_CAT === selectedProductDetails.ID_CAT
                    )?.Nom || "Non catégorisé"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Stock</span>
                  <div
                    className={`flex items-center space-x-2 px-4 py-1 rounded-full text-sm font-medium
                    ${
                      selectedProductDetails.Quantite > 10
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    <span>{selectedProductDetails.Quantite} unités</span>
                    {selectedProductDetails.Quantite > 10 ? (
                      <CheckCircleOutlined className="text-green-600" />
                    ) : (
                      <ExclamationCircleOutlined className="text-red-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-4">
            <div
              className={`flex items-center px-6 py-3 rounded-xl ${
                selectedProductDetails.Promotion
                  ? "bg-orange-50 text-orange-700 border border-orange-200"
                  : "bg-gray-50 text-gray-600 border border-gray-200"
              }`}
            >
              <TagOutlined className="w-5 h-5 mr-2" />
              <span>
                Promotion{" "}
                {selectedProductDetails.Promotion ? "Active" : "Inactive"}
              </span>
            </div>
            <div
              className={`flex items-center px-6 py-3 rounded-xl ${
                selectedProductDetails.Visible
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-gray-50 text-gray-600 border border-gray-200"
              }`}
            >
              <EyeOutlined className="w-5 h-5 mr-2" />{" "}
              <span>
                Visibilité{" "}
                {selectedProductDetails.Visible ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h4 className="text-lg font-medium mb-3 text-gray-800">
              Description
            </h4>
            <p className="text-gray-600 leading-relaxed">
              {selectedProductDetails.Description ||
                "Aucune description disponible"}
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-end">
            <Button
              onClick={() => setIsDetailsModalVisible(false)}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Fermer
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );

  // Render Product Modal
  const renderProductModal = () => (
    <Modal
      title={currentProduct ? "Modifier un Produit" : "Ajouter un Produit"}
      visible={isModalVisible}
      onCancel={() => {
        setIsModalVisible(false);
        setCurrentProduct(null);
        setFileList([]);
        form.setFieldValue(
          null,
        );
      }}
      onOk={() => {
        form
          .validateFields()
          .then(async (values) => {
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

            currentProduct
              ? updateProduct(productData)
              : createProduct(productData);
            setFileList([]);
          })
          .catch((error) => {
            console.error("Validation Failed:", error);
          });
      }}
    >
      <Form form={form} layout="vertical" initialValues={currentProduct || {}}>
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
            {fileList.length >= 1 ? null : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
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
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const currentPrice = getFieldValue("Prix");
                      if (value && value === currentPrice) {
                        return Promise.reject(
                          new Error(
                            "Le prix promotionnel doit être différent du prix actuel"
                          )
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
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

  return (
    <Card
      title="Gestion des Produits"
      extra={
        <Button
          type="primary"
          onClick={() => {
            setCurrentProduct(null);
            setIsModalVisible(true);
            form.setFieldValue(null);
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
                    form.setFieldsValue(record);
                    setIsModalVisible(true);
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
      {renderProductModal()}
      {renderDetailsModal()}
    </Card>
  );
};

export default Products;

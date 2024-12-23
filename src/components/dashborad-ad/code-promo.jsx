import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Switch,
  DatePicker,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import moment from "moment";
import { Endpoint } from "../../helper/enpoint";

const Promo = () => {
  // State management
  const [promoCodes, setPromoCodes] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPromoCodeModalVisible, setIsPromoCodeModalVisible] = useState(false);
  const [currentPromoCode, setCurrentPromoCode] = useState(null);
  const [promoCodeForm] = Form.useForm();

  const API_BASE_URL = Endpoint();

  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/promo/promo-codes`);
      setPromoCodes(response.data);
    } catch (error) {
      message.error("Erreur lors de la récupération des codes promo");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/articles`);
      setProducts(response.data);
    } catch (error) {
      message.error("Erreur lors de la récupération des produits");
      console.error(error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      message.error("Erreur lors de la récupération des catégories");
      console.error(error);
    }
  };

  const handleModalCancel = () => {
    // promoCodeForm.resetFields();
    setIsPromoCodeModalVisible(false);
    setCurrentPromoCode(null);
  };

  const createPromoCode = async (values) => {
    try {
      values.DateDebut = values.DateDebut.toISOString().split("T")[0];
      values.DateFin = values.DateFin.toISOString().split("T")[0];
      await axios.post(`${API_BASE_URL}/promo/promo-codes`, {
        ...values,
        productScope : "all",
        categoryScope : "all",
        ProductIds: values.productScope === "all" ? values.productIds || [] : [],
        CategoryIds: values.categoryScope === "all" ? values.categoryIds || [] : [],
      });
      message.success("Code promo créé avec succès");
      fetchPromoCodes();
      handleModalCancel();
    } catch (error) {
      message.error("Erreur lors de la création du code promo");
      console.error(error);
    }
  };

  const updatePromoCode = async (values) => {
    try {
      values.DateDebut = values.DateDebut.toISOString().split("T")[0];
      values.DateFin = values.DateFin.toISOString().split("T")[0];
      await axios.put(`${API_BASE_URL}/promo/promo-codes/${values.ID_PROMO}`, {
        ...values,
        ProductIds: values.productScope === "specific" ? values.productIds || [] : [],
        CategoryIds: values.categoryScope === "specific" ? values.categoryIds || [] : [],
      });
      message.success("Code promo mis à jour avec succès");
      fetchPromoCodes();
      handleModalCancel();
    } catch (error) {
      message.error("Erreur lors de la mise à jour du code promo");
      console.error(error);
    }
  };

  const deletePromoCode = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/promo/promo-codes/${id}`);
      message.success("Code promo supprimé avec succès");
      fetchPromoCodes();
    } catch (error) {
      message.error("Erreur lors de la suppression du code promo");
      console.error(error);
    }
  };

  const renderPromoCodeModal = () => (
    <Modal
      title={currentPromoCode ? "Modifier un Code Promo" : "Ajouter un Code Promo"}
      open={isPromoCodeModalVisible}
      onCancel={handleModalCancel}
      onOk={() => {
        promoCodeForm
          .validateFields()
          .then((values) => {
            currentPromoCode
              ? updatePromoCode({ ...values, ID_PROMO: currentPromoCode.ID_PROMO })
              : createPromoCode(values);
          })
          .catch((error) => {
            console.error("Validation Failed:", error);
          });
      }}
    >
      <Form
        form={promoCodeForm}
        layout="vertical"
        initialValues={{
          productScope: "none",
          categoryScope: "none",
          Active: true,
          ...currentPromoCode,
        }}
      >
        <Form.Item
          name="Code"
          label="Code Promo"
          rules={[{ required: true, message: "Code promo requis" }]}
        >
          <Input placeholder="Ex: SUMMER2024" />
        </Form.Item>

        <Form.Item
          name="Reduction"
          label="Pourcentage de Réduction"
          rules={[{ required: true, message: "Pourcentage de réduction requis" }]}
        >
          <Input type="number" min={1} max={100} addonAfter="%" />
        </Form.Item>

        <Form.Item
          name="DateDebut"
          label="Date de Début"
          rules={[{ required: true, message: "Date de début requise" }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="DateFin"
          label="Date de Fin"
          dependencies={["DateDebut"]}
          rules={[
            { required: true, message: "Date de fin requise" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const startDate = getFieldValue("DateDebut");
                if (!value || !startDate || value.isAfter(startDate)) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("La date de fin doit être après la date de début")
                );
              },
            }),
          ]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        {/* <Form.Item
          name="productScope"
          label="Application du Code Promo aux Produits"
        >
          <Select>
            <Select.Option value="none">Aucun produit</Select.Option>
            <Select.Option value="all">Tous les Produits</Select.Option>
            <Select.Option value="specific">Produits Spécifiques</Select.Option>
          </Select>
        </Form.Item> */}

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.productScope !== currentValues.productScope
          }
        >
          {({ getFieldValue }) =>
            getFieldValue("productScope") === "specific" ? (
              <Form.Item
                name="productIds"
                label="Sélectionner les Produits"
                rules={[
                  {
                    required: true,
                    message: "Sélectionnez au moins un produit",
                  },
                ]}
              >
                <Select mode="multiple" style={{ width: "100%" }}>
                  {products.map((product) => (
                    <Select.Option key={product.ID_ART} value={product.ID_ART}>
                      {product.Nom}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            ) : null
          }
        </Form.Item>

        {/* <Form.Item
          name="categoryScope"
          label="Application du Code Promo aux Catégories"
        >
          <Select>
            <Select.Option value="none">Aucune catégorie</Select.Option>
            <Select.Option value="all">Toutes les Catégories</Select.Option>
            <Select.Option value="specific">Catégories Spécifiques</Select.Option>
          </Select>
        </Form.Item> */}

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.categoryScope !== currentValues.categoryScope
          }
        >
          {({ getFieldValue }) =>
            getFieldValue("categoryScope") === "specific" ? (
              <Form.Item
                name="categoryIds"
                label="Sélectionner les Catégories"
                rules={[
                  {
                    required: true,
                    message: "Sélectionnez au moins une catégorie",
                  },
                ]}
              >
                <Select mode="multiple" style={{ width: "100%" }}>
                  {categories.map((category) => (
                    <Select.Option key={category.ID_CAT} value={category.ID_CAT}>
                      {category.Nom}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            ) : null
          }
        </Form.Item>

        <Form.Item name="Active" valuePropName="checked" label="Actif">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );

  useEffect(() => {
    fetchPromoCodes();
    fetchProducts();
    fetchCategories();
  }, []);

  return (
    <Card
      title="Gestion des Codes Promo"
      extra={
        <Button
          type="primary"
          onClick={() => {
            setCurrentPromoCode(null);
            // promoCodeForm.resetFields();
            setIsPromoCodeModalVisible(true);
          }}
        >
          <PlusOutlined /> Nouveau Code Promo
        </Button>
      }
    >
      <Table
        size="small"
        pagination={{
          defaultPageSize: 5,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "30"],
        }}
        loading={loading}
        columns={[
          { title: "Code", dataIndex: "Code", key: "Code" },
          {
            title: "Réduction",
            dataIndex: "Reduction",
            key: "Reduction",
            render: (reduction) => `${reduction}%`,
          },
          {
            title: "Date de Début",
            dataIndex: "DateDebut",
            key: "DateDebut",
            render: (date) => new Date(date).toLocaleDateString(),
          },
          {
            title: "Date de Fin",
            dataIndex: "DateFin",
            key: "DateFin",
            render: (date) => new Date(date).toLocaleDateString(),
          },
          {
            title: "Statut",
            dataIndex: "Active",
            key: "Active",
            render: (active) => (active ? "Actif" : "Inactif"),
          },
          {
            title: "Portée",
            key: "Scope",
            render: (_, record) => {
              const scopeText = [];
              if (record.ProductIds?.length) {
                scopeText.push(`${record.ProductIds.length} Produit(s)`);
              } else if (record.productScope === "none") {
                scopeText.push("Aucun produit");
              } else {
                scopeText.push("Tous Produits");
              }
              if (record.CategoryIds?.length) {
                scopeText.push(`${record.CategoryIds.length} Catégorie(s)`);
              } else if (record.categoryScope === "none") {
                scopeText.push("Aucune catégorie");
              } else {
                scopeText.push("Toutes Catégories");
              }
              return scopeText.join(" | ");
            },
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
                    setCurrentPromoCode(record);
                    promoCodeForm.setFieldsValue({
                      ...record,
                      DateDebut: moment(record.DateDebut),
                      DateFin: moment(record.DateFin),
                      productScope: record.ProductIds?.length ? "specific" : 
                                 (record.productScope === "none" ? "none" : "all"),
                      categoryScope: record.CategoryIds?.length ? "specific" : 
                                  (record.categoryScope === "none" ? "none" : "all"),
                    });
                    setIsPromoCodeModalVisible(true);
                  }}
                  className="mr-2"
                />
                <Button
                  type="danger"
                  icon={<DeleteOutlined />}
                  onClick={() => deletePromoCode(record.ID_PROMO)}
                />
              </div>
            ),
          },
        ]}
        dataSource={promoCodes}
        rowKey="ID_PROMO"
      />
      {renderPromoCodeModal()}
    </Card>
  );
};

export default Promo;
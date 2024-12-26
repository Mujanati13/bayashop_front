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
  Card,
  Typography,
  message,
  Upload,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LogoutOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { Endpoint } from "../../helper/enpoint";

const API_BASE_URL = Endpoint();

const Category = () => {
  // State management
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [categoryFileList, setCategoryFileList] = useState([]);
  const [categoryForm] = Form.useForm();

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

  // Category CRUD Operations
  const createCategory = async (values) => {
    try {
      await axios.post(`${API_BASE_URL}/categories`, values);
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

  const handleCategoryImageUpload = async (options) => {
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
      message.success("Image téléchargée avec succès");
      return response.data;
    } catch (error) {
      message.error("Échec du téléchargement de l'image");
      console.error(error);
      throw error;
    }
  };

  // Lifecycle
  useEffect(() => {
    fetchCategories();
  }, []);

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
        categoryForm.setFieldsValue({
          Nom: null,
          ImageUrl: null,
        });
        setCategoryFileList([]);
      }}
      onOk={() => {
        categoryForm
          .validateFields()
          .then(async (values) => {
            let imageUrl = null;
            if (categoryFileList.length > 0) {
              const uploadResponse = await handleCategoryImageUpload({
                file: categoryFileList[0],
              });
              imageUrl = uploadResponse.imageUrl;
            }

            const categoryData = {
              ...values,
              Photo: imageUrl || currentCategory?.Photo,
              ID_CAT: currentCategory?.ID_CAT,
            };

            currentCategory
              ? updateCategory(categoryData)
              : createCategory(categoryData);

            setCategoryFileList([]);
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
        <Form.Item name="ImageUrl" label="Image de la Catégorie">
          <Upload
            listType="picture-card"
            fileList={categoryFileList}
            onRemove={(file) => {
              const index = categoryFileList.indexOf(file);
              const newFileList = categoryFileList.slice();
              newFileList.splice(index, 1);
              setCategoryFileList(newFileList);
            }}
            beforeUpload={(file) => {
              setCategoryFileList([...categoryFileList, file]);
              return false;
            }}
            accept="image/*"
          >
            {categoryFileList.length >= 1 ? null : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </Form.Item>

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

  // Main Render
  return (
    <Layout>
      <Layout>
        <Layout.Content style={{ margin: "0px 0px 0" }}>
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
        </Layout.Content>
      </Layout>

      {renderCategoryModal()}
    </Layout>
  );
};

export default Category;

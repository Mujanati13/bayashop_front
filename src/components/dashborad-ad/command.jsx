import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  Table,
  Button,
  Modal,
  Tag,
  Descriptions,
  Image,
  Steps,
  Timeline,
  Divider,
  Select,
  message,
} from "antd";
import {
  EyeOutlined,
  ShoppingOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CarOutlined,
  DollarOutlined,
  CalendarOutlined,
  ShoppingCartOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import { Endpoint } from "../../helper/enpoint";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const statusOptions = [
    { value: "pending", label: "En attente" },
    { value: "processing", label: "En préparation" },
    { value: "shipped", label: "En livraison" },
    { value: "delivered", label: "Livrée" },
    { value: "cancelled", label: "Annulée" },
  ];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(Endpoint() + "/command");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId, status) => {
    try {
      setUpdatingStatus(true);
      await axios.put(`${Endpoint()}/command/${orderId}/status`, {
        status: status,
      });

      // Update local state
      setOrders(
        orders.map((order) =>
          order.ID_CMD === orderId ? { ...order, statut_CMD: status } : order
        )
      );

      // Update selected order if in modal
      if (selectedOrder && selectedOrder.ID_CMD === orderId) {
        setSelectedOrder({ ...selectedOrder, statut_CMD: status });
      }

      message.success("Statut de la commande mis à jour avec succès");
      setIsStatusModalVisible(false);
    } catch (error) {
      console.error("Error updating order status:", error);
      message.error("Erreur lors de la mise à jour du statut");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: "gold",
      completed: "green",
      cancelled: "red",
      processing: "blue",
      delivered: "green",
      shipped: "geekblue",
    };
    return statusColors[status] || "default";
  };

  const getOrderStatus = (status) => {
    const statusMap = {
      pending: 0,
      processing: 1,
      shipped: 2,
      delivered: 3,
      cancelled: -1,
    };
    return statusMap[status] || 0;
  };

  const parseOrderDetails = (detailString) => {
    try {
      return JSON.parse(detailString);
    } catch (e) {
      return null;
    }
  };

  const renderStatusModal = () => {
    if (!selectedOrder) return null;

    return (
      <Modal
        title="Modifier le statut de la commande"
        visible={isStatusModalVisible}
        onCancel={() => setIsStatusModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsStatusModalVisible(false)}>
            Annuler
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={updatingStatus}
            onClick={() => updateOrderStatus(selectedOrder.ID_CMD, newStatus)}
            disabled={!newStatus || newStatus === selectedOrder.statut_CMD}
          >
            Mettre à jour
          </Button>,
        ]}
      >
        <div className="space-y-4">
          <p>
            Statut actuel:
            <Tag
              color={getStatusColor(selectedOrder.statut_CMD)}
              className="ml-2"
            >
              {selectedOrder.statut_CMD.toUpperCase()}
            </Tag>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau statut
            </label>
            <Select
              className="w-full"
              value={newStatus}
              onChange={(value) => setNewStatus(value)}
              options={statusOptions}
            />
          </div>
        </div>
      </Modal>
    );
  };

  // Rest of your existing render functions...
  const renderOrderTimeline = (order) => {
    const events = [
      {
        time: format(new Date(order.Date_cmd), "HH:mm"),
        date: format(new Date(order.Date_cmd), "dd/MM/yyyy"),
        title: "Commande créée",
        description: `Commande #${order.ID_CMD} placée avec succès`,
        icon: <ShoppingCartOutlined className="text-white" />,
      },
    ];

    return (
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <Timeline
          items={events.map((event) => ({
            dot: (
              <div className="bg-blue-500 p-2 rounded-full">{event.icon}</div>
            ),
            children: (
              <div className="ml-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{event.title}</span>
                  <Tag color="blue">{event.time}</Tag>
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  {event.description}
                </p>
                <p className="text-xs text-gray-400">{event.date}</p>
              </div>
            ),
          }))}
        />
      </div>
    );
  };

  const renderOrderProgress = (status) => {
    const currentStep = getOrderStatus(status);
    const items = [
      {
        title: "Commande reçue",
        description: "La commande a été placée",
        icon: <ShoppingCartOutlined />,
      },
      {
        title: "En préparation",
        description: "Commande en cours de traitement",
        icon: <ClockCircleOutlined />,
      },
      {
        title: "En livraison",
        description: "Commande en route",
        icon: <CarOutlined />,
      },
      {
        title: "Livrée",
        description: "Commande livrée avec succès",
        icon: <CheckCircleOutlined />,
      },
    ];

    return (
      <Steps
        current={currentStep}
        items={items.map((item) => ({
          title: item.title,
          description: item.description,
          icon: item.icon,
        }))}
        status={status === "cancelled" ? "error" : "process"}
      />
    );
  };

  const renderDetailsModal = () => {
    if (!selectedOrder) return null;

    const orderDetails = parseOrderDetails(selectedOrder.detail_cmd);
    const deliveryDetails = parseOrderDetails(selectedOrder.adresse_livraison);

    return (
      <Modal
        title={
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg mt-5">
            <div>
              <h3 className="text-xl font-bold">
                Commande #{selectedOrder.ID_CMD}
              </h3>
              <p className="text-sm opacity-80">
                <CalendarOutlined className="mr-2" />
                {format(
                  new Date(selectedOrder.Date_cmd),
                  "dd MMMM yyyy à HH:mm"
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Tag
                color={getStatusColor(selectedOrder.statut_CMD)}
                className="px-4 py-1 text-sm font-medium"
              >
                {selectedOrder.statut_CMD.toUpperCase()}
              </Tag>
              <Button
                type="primary"
                ghost
                icon={<EditOutlined />}
                onClick={() => {
                  setNewStatus(selectedOrder.statut_CMD);
                  setIsStatusModalVisible(true);
                }}
                title="Modifier le statut"
              />
            </div>
          </div>
        }
        visible={isDetailsModalVisible}
        onCancel={() => setIsDetailsModalVisible(false)}
        width={1000}
        footer={null}
        className="modern-modal"
      >
        <div className="p-6 space-y-8">
          <Card className="shadow-sm border-0">
            {renderOrderProgress(selectedOrder.statut_CMD)}
          </Card>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <ShoppingOutlined />
                    <span>Articles Commandés</span>
                  </div>
                }
                className="shadow-sm"
              >
                <div className="space-y-4">
                  {orderDetails?.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Image
                          width={64}
                          height={64}
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                          fallback="/api/placeholder/64/64"
                          preview={false}
                        />
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-500">
                            Quantité: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {(parseFloat(item.price) * item.quantity).toFixed(2)}€
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.price}€ / unité
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <DollarOutlined />
                    <span>Récapitulatif</span>
                  </div>
                }
                className="shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sous-total</span>
                    <span>{orderDetails?.originalTotal?.toFixed(2)}€</span>
                  </div>
                  {orderDetails?.discount && (
                    <div className="flex justify-between text-green-600">
                      <span>Remise ({orderDetails.discountPercentage}%)</span>
                      <span>-{orderDetails.discountAmount?.toFixed(2)}€</span>
                    </div>
                  )}
                  <Divider className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-lg">{selectedOrder.montant}€</span>
                  </div>
                </div>
              </Card>

              <Card
                title={
                  <div className="flex items-center gap-2">
                    <UserOutlined />
                    <span>Client #{selectedOrder.id_clt}</span>
                  </div>
                }
                className="shadow-sm"
              >
                <div className="space-y-2">
                  {deliveryDetails &&
                  Object.keys(deliveryDetails).length > 0 ? (
                    <>
                      <p className="text-sm text-gray-600">
                        Adresse de livraison:
                      </p>
                      <p className="text-sm">
                        {JSON.stringify(deliveryDetails)}
                      </p>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-600">
                      <ExclamationCircleOutlined />
                      <span className="text-sm">
                        Aucune adresse de livraison
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          <Card
            title={
              <div className="flex items-center gap-2">
                <ClockCircleOutlined />
                <span>Historique de la commande</span>
              </div>
            }
            className="shadow-sm"
          >
            {renderOrderTimeline(selectedOrder)}
          </Card>
        </div>
      </Modal>
    );
  };

  return (
    <Card title="Gestion des Commandes">
      <Table
        size="small"
        loading={loading}
        dataSource={orders}
        rowKey="ID_CMD"
        pagination={{
          defaultPageSize: 5,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "30"],
        }}
        columns={[
          {
            title: "ID",
            dataIndex: "ID_CMD",
            key: "ID_CMD",
          },
          {
            title: "Date",
            dataIndex: "Date_cmd",
            key: "Date_cmd",
            render: (date) => format(new Date(date), "dd/MM/yyyy HH:mm"),
          },
          {
            title: "Client",
            dataIndex: "id_clt",
            key: "id_clt",
            render: (id) => `Client #${id}`,
          },
          {
            title: "Montant",
            dataIndex: "montant",
            key: "montant",
            render: (montant) => `${montant}€`,
          },
          {
            title: "Statut",
            dataIndex: "statut_CMD",
            key: "statut_CMD",
            render: (status) => (
              <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
            ),
          },
          {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
              <div className="flex gap-2">
                <Button
                  type="default"
                  icon={<EyeOutlined />}
                  onClick={() => {
                    setSelectedOrder(record);
                    setIsDetailsModalVisible(true);
                  }}
                  title="Voir les détails"
                />
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setSelectedOrder(record);
                    setNewStatus(record.statut_CMD);
                    setIsStatusModalVisible(true);
                  }}
                  title="Modifier le statut"
                />
              </div>
            ),
          },
        ]}
      />
      {renderDetailsModal()}
      {renderStatusModal()}
    </Card>
  );
};

export default Orders;

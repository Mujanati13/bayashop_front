import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Input,
  message,
  Form,
  Steps,
  Space,
  Divider,
  Radio,
  Card,
  Skeleton,
  Result,
  Alert,
  Typography,
  Empty,
  Spin,
} from "antd";
import {
  ShoppingCartOutlined,
  DeleteOutlined,
  UserOutlined,
  HomeOutlined,
  PhoneOutlined,
  MailOutlined,
  CreditCardOutlined,
  CarOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useCart } from "./cartReducer";
import axios from "axios";
import { Endpoint } from "../../helper/enpoint";
import { toast } from "react-toastify";

const { Title, Text } = Typography;

const CartModal = ({ visible, onClose }) => {
  const { cart, removeFromCart, updateQuantity, clearCart, applyDiscount } =
    useCart();

  const [promoCode, setPromoCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryMethods, setDeliveryMethods] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isLoadingDelivery, setIsLoadingDelivery] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isStockChecking, setIsStockChecking] = useState(false);
  const [stockStatus, setStockStatus] = useState({});

  useEffect(() => {
    if (visible) {
      checkAllItemsStock();
    }
  }, [visible, cart.items]);

  const checkAllItemsStock = async () => {
    setIsStockChecking(true);
    try {
      const stockChecks = await Promise.all(
        cart.items.map(async (item) => {
          const response = await fetch(
            `${Endpoint()}/articles/check-quantity/${item.id}/${item.quantity}`
          );
          const data = await response.json();
          return {
            id: item.id,
            ...data,
          };
        })
      );

      const newStockStatus = {};
      stockChecks.forEach((check) => {
        newStockStatus[check.id] = check;
      });
      setStockStatus(newStockStatus);

      // If any item is not available, show warning
      const unavailableItems = stockChecks.filter((item) => !item.isAvailable);
      if (unavailableItems.length > 0) {
        message.warning(
          "Certains articles de votre panier ne sont plus disponibles en quantité suffisante"
        );
      }
    } catch (error) {
      console.error("Error checking stock:", error);
      message.error("Erreur lors de la vérification du stock");
    } finally {
      setIsStockChecking(false);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    setIsStockChecking(true);
    try {
      const response = await fetch(
        `${Endpoint()}/articles/check-quantity/${itemId}/${newQuantity}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erreur lors de la vérification du stock"
        );
      }

      setStockStatus((prev) => ({
        ...prev,
        [itemId]: data,
      }));

      if (data.isAvailable) {
        updateQuantity(itemId, newQuantity);
      } else {
        message.warning(
          data.message || "La quantité demandée n'est pas disponible en stock"
        );
      }
    } catch (error) {
      message.error("Erreur lors de la vérification du stock");
    } finally {
      setIsStockChecking(false);
    }
  };

  const handlePromoCodeValidation = async () => {
    const trimmedPromoCode = promoCode.trim();
    if (!trimmedPromoCode) {
      message.warning("Veuillez saisir un code promo");
      return;
    }

    setIsValidating(true);

    try {
      const productIds = cart.items.map((item) => item.id);
      const response = await axios.post(
        Endpoint() + "/promo/validate-promo-code",
        {
          promoCode: trimmedPromoCode,
          productIds: productIds,
        }
      );

      if (response.data.valid) {
        message.success("Code promo appliqué avec succès !");
        const discountPercentage = response.data.reduction;
        const originalTotal = cart.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
        const discountAmount = originalTotal * (discountPercentage / 100);

        applyDiscount({
          percentage: discountPercentage,
          amount: discountAmount,
          originalTotal: originalTotal,
        });

        setPromoCode("");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Code promo invalide";
      message.error(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  const renderCartItems = () => {
    if (isStockChecking) {
      return (
        <div className="text-center p-4">
          <Spin tip="Vérification du stock..." />
        </div>
      );
    }

    return cart.items.map((item) => {
      const itemStockStatus = stockStatus[item.id];
      const isAvailable = itemStockStatus?.isAvailable;
      const maxAvailable = itemStockStatus?.available || 0;

      return (
        <Card
          key={item.id}
          className="mb-4 shadow-sm"
          bodyStyle={{ padding: "12px" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                  onError={(e) => {
                    e.target.src = "/placeholder-image.png";
                  }}
                />
                {!isAvailable && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 rounded-bl text-xs">
                    Stock insuffisant
                  </div>
                )}
              </div>
              <div>
                <Title level={5} className="mb-1">
                  {item.name}
                </Title>
                <div className="space-y-1">
                  <Text type="secondary">Prix unitaire: {item.price}€</Text>
                  <br />
                  <Text strong>
                    Total: {(item.price * item.quantity).toFixed(2)}€
                  </Text>
                  {!isAvailable && (
                    <div className="text-red-500 text-sm mt-1">
                      {itemStockStatus?.message || "Stock insuffisant"}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <div className="flex items-center space-x-2">
                <Button
                  size="small"
                  onClick={() =>
                    handleQuantityChange(item.id, item.quantity - 1)
                  }
                  disabled={item.quantity <= 1}
                >
                  -
                </Button>
                <Input
                  size="small"
                  value={item.quantity}
                  className="w-16 text-center"
                  readOnly
                />
                <Button
                  size="small"
                  onClick={() =>
                    handleQuantityChange(item.id, item.quantity + 1)
                  }
                  disabled={item.quantity >= maxAvailable}
                >
                  +
                </Button>
              </div>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: "Confirmer la suppression",
                    icon: <ExclamationCircleOutlined />,
                    content:
                      "Voulez-vous vraiment retirer cet article du panier ?",
                    okText: "Oui",
                    cancelText: "Non",
                    onOk: () => removeFromCart(item.id),
                  });
                }}
              >
                Supprimer
              </Button>
            </div>
          </div>
        </Card>
      );
    });
  };

  // Rest of the component remains the same...
  // Include all other existing functions and JSX
  const handleCheckout = async (values) => {
    console.log("====================================");
    console.log("ss");
    console.log("====================================");
    // if (!selectedDelivery) {
    //   message.error('Please select a delivery method');
    //   return;
    // }
    // if (!paymentMethod) {
    //   message.error('Please select a payment method');
    //   return;
    // }

    setIsProcessing(true);
    try {
      // Get cart details from local storage
      const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");

      // Format cart items for detail_cmd
      const detailCmd = cartItems;

      // Prepare order data according to API structure
      const orderData = {
        id_clt: localStorage.getItem("userId") || null, // Assuming you store user ID
        detail_cmd: JSON.stringify(detailCmd),
        details_de_command: JSON.stringify({
          items: cartItems,
          delivery: {
            methodId: selectedDelivery,
            method: deliveryMethods.find((d) => d.id === selectedDelivery),
          },
        }),
        statut_CMD: "pending",
        montant: calculateTotal(),
        mode_payement: paymentMethod,
        adresse_livraison: JSON.stringify({
          fullName: values.fullName,
          address: values.address,
          city: values.city,
          postalCode: values.postalCode,
          phone: values.phone,
          email: values.email,
          additionalInfo: values.additionalInfo,
        }),
        code_promo: promoCode || null,
      };

      // Send order to API
      const response = await axios.post(Endpoint() + "/command", orderData);

      if (response.data.success) {
        if (false) {
          // Redirect to payment gateway if needed
          // window.location.href = response.data.paymentUrl;
        } else {
          Modal.success({
            title: "Order placed successfully!",
            content: "You will receive a confirmation email shortly.",
            onOk: () => {
              // Clear cart from local storage
              localStorage.removeItem("cart");
              clearCart();
              const resetCart = () => {
                // Clear cart context
                clearCart();

                // Clear localStorage
                localStorage.removeItem("cart");

                // Reset form and other states
                form.resetFields();
                setPromoCode("");
                setSelectedDelivery(null);
                setPaymentMethod(null);
                setCurrentStep(0);

                // Close modal
                onClose();
              };
              setCurrentStep(0);
              onClose();
            },
          });
        }
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred while placing your order. Please try again.";
      Modal.error({
        title: "Error",
        content: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const calculateTotal = () => {
    let total = cart.total;
    if (selectedDelivery) {
      const deliveryMethod = deliveryMethods.find(
        (d) => d.id === selectedDelivery
      );
      if (deliveryMethod) {
        total += deliveryMethod.price;
      }
    }
    return total;
  };
  const renderDeliveryMethods = () => {
    if (error) {
      return (
        <Result
          status="error"
          title="Erreur de chargement"
          subTitle={error}
          extra={
            <Button
              type="primary"
              onClick={() => setRetryCount((prev) => prev + 1)}
              loading={isLoadingDelivery}
            >
              Réessayer
            </Button>
          }
        />
      );
    }

    if (isLoadingDelivery) {
      return (
        <Space direction="vertical" className="w-full">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="w-full">
              <Skeleton active avatar paragraph={{ rows: 2 }} />
            </Card>
          ))}
        </Space>
      );
    }

    return (
      <Radio.Group
        onChange={(e) => setSelectedDelivery(e.target.value)}
        value={selectedDelivery}
        className="w-full"
      >
        <Space direction="vertical" className="w-full">
          {deliveryMethods.map((method) => (
            <Card
              key={method.id}
              className="w-full hover:shadow-md transition-shadow duration-300"
              hoverable
            >
              <Radio value={method.id}>
                <Space>
                  <CarOutlined className="text-2xl" />
                  <div>
                    <Title level={5} className="mb-1">
                      {method.name}
                    </Title>
                    <Text type="secondary">{method.description}</Text>
                    <div className="mt-2">
                      <Text strong className="text-primary">
                        {method.price.toFixed(2)}€
                      </Text>
                      <Text type="secondary" className="ml-4">
                        Délai estimé: {method.estimatedDays} jours
                      </Text>
                    </div>
                  </div>
                </Space>
              </Radio>
            </Card>
          ))}
        </Space>
      </Radio.Group>
    );
  };

  const renderPaymentMethods = () => (
    <Radio.Group
      onChange={(e) => setPaymentMethod(e.target.value)}
      value={paymentMethod}
      className="w-full"
    >
      <Space direction="vertical" className="w-full">
        <Card
          className="w-full hover:shadow-md transition-shadow duration-300"
          hoverable
        >
          <Radio value="card">
            <Space>
              <CreditCardOutlined className="text-2xl" />
              <div>
                <Title level={5} className="mb-1">
                  Carte bancaire
                </Title>
                <Text type="secondary">Paiement sécurisé par carte</Text>
                <div className="mt-2">
                  <img
                    src="/card-logos.png"
                    alt="Accepted cards"
                    className="h-6"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>
              </div>
            </Space>
          </Radio>
        </Card>
        <Card
          className="w-full hover:shadow-md transition-shadow duration-300"
          hoverable
        >
          <Radio value="paypal">
            <Space>
              <img
                src="/paypal-icon.png"
                alt="PayPal"
                className="w-8 h-8"
                onError={(e) => {
                  e.target.src = "https://img.icons8.com/color/48/paypal.png";
                }}
              />
              <div>
                <Title level={5} className="mb-1">
                  PayPal
                </Title>
                <Text type="secondary">Paiement sécurisé via PayPal</Text>
              </div>
            </Space>
          </Radio>
        </Card>
      </Space>
    </Radio.Group>
  );

  const renderOrderSummary = () => (
    <Card className="mt-4 bg-gray-50">
      <Title level={4}>Récapitulatif de la commande</Title>
      <div className="space-y-3">
        <div className="flex justify-between">
          <Text>Sous-total:</Text>
          <Text>{cart.total.toFixed(2)}€</Text>
        </div>

        {cart.discount && (
          <div className="flex justify-between text-green-600">
            <Text>Réduction ({cart.discountPercentage}%):</Text>
            <Text>-{cart.discountAmount.toFixed(2)}€</Text>
          </div>
        )}

        {selectedDelivery && (
          <div className="flex justify-between">
            <Text>Frais de livraison:</Text>
            <Text>
              {deliveryMethods
                .find((d) => d.id === selectedDelivery)
                ?.price.toFixed(2)}
              €
            </Text>
          </div>
        )}

        <Divider className="my-2" />

        <div className="flex justify-between">
          <Title level={4} className="!mb-0">
            Total à payer:
          </Title>
          <Title level={4} className="!mb-0">
            {calculateTotal().toFixed(2)}€
          </Title>
        </div>

        {paymentMethod && (
          <Alert
            message="Protection des achats"
            description="Vos transactions sont sécurisées par notre système de paiement crypté."
            type="info"
            showIcon
            className="mt-4"
          />
        )}
      </div>
    </Card>
  );
  const steps = [
    {
      title: "Panier",
      content: (
        <>
          {cart.items.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<Text type="secondary">Votre panier est vide</Text>}
            >
              <Button type="primary" onClick={onClose}>
                Continuer mes achats
              </Button>
            </Empty>
          ) : (
            <div className="space-y-4">
              {renderCartItems()}

              <Card className="bg-gray-50">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Entrez votre code promo"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-grow"
                    disabled={isValidating || cart.discount}
                    prefix={<ShoppingCartOutlined />}
                    onPressEnter={handlePromoCodeValidation}
                  />
                  <Button
                    type="primary"
                    onClick={handlePromoCodeValidation}
                    loading={isValidating}
                    disabled={cart.discount}
                  >
                    Appliquer
                  </Button>
                </div>

                {cart.discount && (
                  <Alert
                    message="Code promo appliqué"
                    description={`Une réduction de ${cart.discountPercentage}% a été appliquée à votre commande.`}
                    type="success"
                    showIcon
                    closable
                    className="mt-4"
                    onClose={() => {
                      applyDiscount(null);
                      setPromoCode("");
                    }}
                  />
                )}
              </Card>

              <Card className="bg-gray-50">
                <div className="space-y-2">
                  {cart.discount && (
                    <>
                      <div className="flex justify-between text-gray-600">
                        <Text>Total avant réduction:</Text>
                        <Text>{cart.originalTotal.toFixed(2)}€</Text>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <Text>Réduction ({cart.discountPercentage}%):</Text>
                        <Text>-{cart.discountAmount.toFixed(2)}€</Text>
                      </div>
                      <Divider className="my-2" />
                    </>
                  )}
                  <div className="flex justify-between">
                    <Title level={4} className="!mb-0">
                      Total:
                    </Title>
                    <Title level={4} className="!mb-0">
                      {cart.total.toFixed(2)}€
                    </Title>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </>
      ),
    },
    {
      title: "Informations",
      content: (
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCheckout}
            initialValues={{
              country: "FR", // Default to France
            }}
          >
            <Form.Item
              name="fullName"
              label="Nom complet"
              rules={[
                {
                  required: true,
                  message: "Veuillez saisir votre nom complet",
                },
                {
                  min: 2,
                  message: "Le nom doit contenir au moins 2 caractères",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Nom complet"
                maxLength={100}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Veuillez saisir votre email" },
                { type: "email", message: "Email invalide" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Email"
                maxLength={100}
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Téléphone"
              rules={[
                { required: true, message: "Veuillez saisir votre téléphone" },
                {
                  pattern: /^(\+33|0)[1-9](\d{2}){4}$/,
                  message: "Numéro de téléphone invalide",
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="Téléphone"
                maxLength={15}
              />
            </Form.Item>

            <Form.Item
              name="address"
              label="Adresse"
              rules={[
                { required: true, message: "Veuillez saisir votre adresse" },
                {
                  min: 5,
                  message: "L'adresse doit contenir au moins 5 caractères",
                },
              ]}
            >
              <Input.TextArea
                placeholder="Adresse complète"
                autoSize={{ minRows: 2, maxRows: 4 }}
                maxLength={200}
                showCount
              />
            </Form.Item>

            <Space className="w-full">
              <Form.Item
                name="postalCode"
                label="Code postal"
                rules={[
                  {
                    required: true,
                    message: "Veuillez saisir votre code postal",
                  },
                  { pattern: /^\d{5}$/, message: "Code postal invalide" },
                ]}
              >
                <Input placeholder="Code postal" maxLength={5} />
              </Form.Item>

              <Form.Item
                name="city"
                label="Ville"
                rules={[
                  { required: true, message: "Veuillez saisir votre ville" },
                  {
                    min: 2,
                    message: "La ville doit contenir au moins 2 caractères",
                  },
                ]}
              >
                <Input placeholder="Ville" maxLength={100} />
              </Form.Item>
            </Space>

            <Form.Item
              name="additionalInfo"
              label="Instructions de livraison (optionnel)"
            >
              <Input.TextArea
                placeholder="Instructions particulières pour la livraison..."
                autoSize={{ minRows: 2, maxRows: 4 }}
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      title: "Livraison",
      content: (
        <div className="space-y-4">
          <Alert
            message="Information"
            description="Les délais de livraison sont donnés à titre indicatif et peuvent varier selon la disponibilité et votre localisation."
            type="info"
            showIcon
          />

          {renderDeliveryMethods()}

          {selectedDelivery && (
            <Card className="mt-4 bg-gray-50">
              <Title level={5}>Délai de livraison estimé</Title>
              <Text>
                {
                  deliveryMethods.find((d) => d.id === selectedDelivery)
                    ?.estimatedDays
                }{" "}
                jours ouvrés
              </Text>
            </Card>
          )}
        </div>
      ),
    },
    {
      title: "Paiement",
      content: (
        <div className="space-y-4">
          <Alert
            message="Paiement sécurisé"
            description="Toutes vos informations de paiement sont cryptées et sécurisées."
            type="info"
            showIcon
          />

          {renderPaymentMethods()}
          {renderOrderSummary()}
        </div>
      ),
    },
  ];

  const modalFooter = [
    currentStep > 0 && (
      <Button 
        key="back" 
        onClick={() => setCurrentStep(currentStep - 1)}
        icon={<CarOutlined className="rotate-180" />}
      >
        Retour
      </Button>
    ),
    currentStep == 0 && (
      <Button 
        key="clear" 
        danger
        onClick={() => {
          Modal.confirm({
            title: 'Vider le panier',
            icon: <ExclamationCircleOutlined />,
            content: 'Êtes-vous sûr de vouloir vider votre panier ?',
            okText: 'Oui',
            cancelText: 'Non',
            onOk: clearCart
          });
        }}
      >
        Vider le panier
      </Button>
    ),
    currentStep < steps.length - 1 ? (
      <Button
        key="next"
        type="primary"
        onClick={() => {
          if (currentStep === 1) {
            form.validateFields().then(() => {
              setCurrentStep(currentStep + 1);
            });
          } else {
            setCurrentStep(currentStep + 1);
          }
        }}
        disabled={cart.items.length === 0}
      >
        Continuer
      </Button>
    ) : (
      <Button
        key="submit"
        type="primary"
        onClick={() => form.submit()}
        loading={isProcessing}
        icon={<CreditCardOutlined />}
      >
        Payer {calculateTotal().toFixed(2)}€
      </Button>
    )
  ].filter(Boolean);

  return (
    <Modal
    
      title={
        <div className="flex items-center">
          <ShoppingCartOutlined className="mr-2 text-xl" />
          <Title level={4} className="!mb-0">
            {steps[currentStep].title}
          </Title>
        </div>
      }
      open={visible}
      onCancel={() => {
        if (isProcessing) {
          Modal.confirm({
            title: "Abandonner la commande",
            icon: <ExclamationCircleOutlined />,
            content: "Êtes-vous sûr de vouloir abandonner votre commande ?",
            okText: "Oui",
            cancelText: "Non",
            onOk: onClose,
          });
        } else {
          onClose();
        }
      }}
      footer={modalFooter}
      width={"100%"}
      height={"100%"}
      destroyOnClose
      maskClosable={false}
      className="cart-modal"
    >
      <Steps
        current={currentStep}
        items={steps.map((step) => ({ title: step.title }))}
        className="mb-8"
      />
      <div>{steps[currentStep].content}</div>
    </Modal>
  );
};

export default CartModal;

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  AlertTriangle,
  TrendingUp,
  Package,
  ShoppingCart,
  DollarSign,
  Archive,
  ChevronDown,
  Truck,
} from "lucide-react";
import { Endpoint } from "../../helper/enpoint";

// Static delivery data
const staticDeliveryData = [
  { mois: "Janvier", livraisons: 245, onTime: 220, delayed: 25 },
  { mois: "Février", livraisons: 285, onTime: 260, delayed: 25 },
  { mois: "Mars", livraisons: 310, onTime: 290, delayed: 20 },
  { mois: "Avril", livraisons: 265, onTime: 245, delayed: 20 },
  { mois: "Mai", livraisons: 290, onTime: 270, delayed: 20 },
  { mois: "Juin", livraisons: 320, onTime: 300, delayed: 20 },
];

const DashboardPlus = () => {
  const [revenueStats, setRevenueStats] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesTrends, setSalesTrends] = useState([]);
  const [deliveryStats, setDeliveryStats] = useState(staticDeliveryData);
  const [loading, setLoading] = useState(true);

  // New states for sales analytics
  const [monthlySales, setMonthlySales] = useState(null);
  const [productPerformance, setProductPerformance] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          revenueRes,
          productsRes,
          categoriesRes,
          stockRes,
          ordersRes,
          trendsRes,
          // New API calls
          monthlySalesRes,
          productPerfRes,
        ] = await Promise.all([
          fetch(Endpoint() + "/dashboard/revenue-stats"),
          fetch(Endpoint() + "/dashboard/top-products"),
          fetch(Endpoint() + "/dashboard/category-stats"),
          fetch(Endpoint() + "/dashboard/low-stock"),
          fetch(Endpoint() + "/dashboard/recent-orders"),
          fetch(Endpoint() + "/dashboard/sales-trends"),
          // New endpoints
          fetch(Endpoint() + `/dashboard/sales-by-month`),
          fetch(Endpoint() + `/dashboard/sales-by-month`),
        ]);

        const [
          revenueData,
          productsData,
          categoriesData,
          stockData,
          ordersData,
          trendsData,
          monthlySalesData,
          productPerfData,
        ] = await Promise.all([
          revenueRes.json(),
          productsRes.json(),
          categoriesRes.json(),
          stockRes.json(),
          ordersRes.json(),
          trendsRes.json(),
          monthlySalesRes.json(),
          productPerfRes.json(),
        ]);

        setRevenueStats(revenueData);
        setTopProducts(productsData);
        setCategoryStats(categoriesData);
        setLowStock(stockData);
        setRecentOrders(ordersData);
        setSalesTrends(trendsData);
        setMonthlySales(monthlySalesData);
        setProductPerformance(productPerfData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, [selectedYear, selectedMonth]);

  // Calculate delivery statistics
  const totalDeliveries = deliveryStats.reduce(
    (sum, stat) => sum + stat.livraisons,
    0
  );
  const onTimeDeliveries = deliveryStats.reduce(
    (sum, stat) => sum + stat.onTime,
    0
  );
  const deliveryRate = ((onTimeDeliveries / totalDeliveries) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
        <div className="mt-4 flex gap-4">
          <select
            className="px-4 py-2 border rounded-lg bg-white"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {[2022, 2023, 2024].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <select
            className="px-4 py-2 border rounded-lg bg-white"
            value={selectedMonth || ""}
            onChange={(e) => setSelectedMonth(e.target.value || null)}
          >
            <option value="">All Months</option>
            {monthlySales?.monthly_sales.map((month, index) => (
              <option key={index} value={index + 1}>
                {month.month_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Revenue Total"
          value={`${monthlySales?.summary.total_annual_revenue.toLocaleString()}€`}
          icon={<DollarSign className="w-6 h-6" />}
          trend="+12,5%"
        />
        <StatCard
          title="Commandes Totales"
          value={monthlySales?.summary.total_annual_orders.toString()}
          icon={<ShoppingCart className="w-6 h-6" />}
          trend="+5,2%"
        />
        <StatCard
          title="Taux de Livraison"
          value={`${deliveryRate}%`}
          icon={<Truck className="w-6 h-6" />}
          trend="À l'heure"
        />
        <StatCard
          title="Catégories"
          value={categoryStats.length.toString()}
          icon={<Archive className="w-6 h-6" />}
          trend="Actif"
        />
        <StatCard
          title="Stock Faible"
          value={lowStock.length.toString()}
          icon={<AlertTriangle className="w-6 h-6" />}
          trend="Attention"
          warning
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* Sales Trends Chart */}
        {/* <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Tendances des Ventes</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total_sales"
                  stroke="#8884d8"
                  name="Ventes"
                />
                <Line
                  type="monotone"
                  dataKey="order_count"
                  stroke="#82ca9d"
                  name="Commandes"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div> */}

        {/* Category Distribution Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            Distribution par Catégorie
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="product_count" fill="#8884d8" name="Produits" />
                <Bar dataKey="total_stock" fill="#82ca9d" name="Stock" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Performance Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            Performance des Produits
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productPerformance?.monthly_sales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_orders" fill="#8884d8" name="Commandes" />
                <Bar
                  dataKey="total_revenue"
                  fill="#82ca9d"
                  name="Revenu Total"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Commandes Récentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Commande
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.ID_CMD}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    #{order.ID_CMD}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(order.Date_cmd).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.montant.toLocaleString()}€
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={order.statut_CMD} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Alertes de Stock Faible</h2>
        </div>
        <div className="p-4">
          {lowStock.map((item) => (
            <div
              key={item.ID_ART}
              className="flex items-center justify-between py-2"
            >
              <div>
                <p className="font-medium">{item.Nom}</p>
                <p className="text-sm text-gray-500">ID: {item.ID_ART}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-red-600">
                  {item.Quantite} unités restantes
                </p>
                <p className="text-sm text-gray-500">{item.Prix}€</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// StatCard Component
const StatCard = ({ title, value, icon, trend, warning = false }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="flex items-center justify-between mb-4">
      <div
        className={`p-2 rounded-lg ${warning ? "bg-red-100" : "bg-blue-100"}`}
      >
        {icon}
      </div>
      <span
        className={`text-sm ${
          warning ? "text-red-600" : "text-green-600"
        } flex items-center`}
      >
        {trend}
        <ChevronDown className="w-4 h-4 ml-1" />
      </span>
    </div>
    <h3 className="text-gray-600 text-sm">{title}</h3>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
  </div>
);

// StatusBadge Component
const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "terminée":
        return "bg-green-100 text-green-800";
      case "pending":
      case "en attente":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
      case "annulée":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const translateStatus = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "Terminée";
      case "pending":
        return "En attente";
      case "cancelled":
        return "Annulée";
      default:
        return status;
    }
  };

  return (
    <span
      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(status)}`}
    >
      {translateStatus(status)}
    </span>
  );
};

export default DashboardPlus;

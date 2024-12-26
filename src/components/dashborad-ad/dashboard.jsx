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
} from "lucide-react";
import { Endpoint } from "../../helper/enpoint";

const DashboardPlus = () => {
  const [revenueStats, setRevenueStats] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesTrends, setSalesTrends] = useState([]);
  const [loading, setLoading] = useState(true);

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
        ] = await Promise.all([
          fetch(Endpoint() + "/dashboard/revenue-stats"),
          fetch(Endpoint() + "/dashboard/top-products"),
          fetch(Endpoint() + "/dashboard/category-stats"),
          fetch(Endpoint() + "/dashboard/low-stock"),
          fetch(Endpoint() + "/dashboard/recent-orders"),
          fetch(Endpoint() + "/dashboard/sales-trends"),
        ]);

        const [
          revenueData,
          productsData,
          categoriesData,
          stockData,
          ordersData,
          trendsData,
        ] = await Promise.all([
          revenueRes.json(),
          productsRes.json(),
          categoriesRes.json(),
          stockRes.json(),
          ordersRes.json(),
          trendsRes.json(),
        ]);

        setRevenueStats(revenueData);
        setTopProducts(productsData);
        setCategoryStats(categoriesData);
        setLowStock(stockData);
        setRecentOrders(ordersData);
        setSalesTrends(trendsData);
        setLoading(false);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des données du tableau de bord:",
          error
        );
      }
    };

    fetchDashboardData();
  }, []);

  // Calculer le revenu total
  const totalRevenue = revenueStats.reduce(
    (sum, stat) => sum + stat.total_revenue,
    0
  );
  const totalOrders = revenueStats.reduce(
    (sum, stat) => sum + stat.order_count,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Revenu Total"
          value={`${totalRevenue.toLocaleString()}€`}
          icon={<DollarSign className="w-6 h-6" />}
          trend="+12,5%"
        />
        <StatCard
          title="Commandes Totales"
          value={totalOrders.toString()}
          icon={<ShoppingCart className="w-6 h-6" />}
          trend="+5,2%"
        />
        <StatCard
          title="Catégories"
          value={categoryStats.length.toString()}
          icon={<Archive className="w-6 h-6" />}
          trend="Actif"
        />
        <StatCard
          title="Articles en Stock Faible"
          value={lowStock.length.toString()}
          icon={<AlertTriangle className="w-6 h-6" />}
          trend="Attention"
          warning
        />
      </div>

      {/* Section des graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* Graphique des tendances de vente */}
        <div className="bg-white p-4 rounded-lg shadow">
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
        </div>

        {/* Graphique de distribution des catégories */}
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
      </div>

      {/* Tableau des commandes récentes */}
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

      {/* Alertes de stock faible */}
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

// Composants auxiliaires
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

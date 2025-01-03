import { useState, useEffect, useCallback } from "react";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
  ComposedChart,
  BarChart,
  LineChart,
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

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const OrdersVisualization = ({ commandSales }) => {
  // Transform data for chart
  const chartData = Object.entries(commandSales.data).map(([date, data]) => ({
    date: formatDate(date),
    totalOrders: data.totalOrders,
    totalAmount: data.totalAmount,
    pending: data.status.pending,
    completed: data.status.completed,
    cancelled: data.status.cancelled,
  }));

  return (
    <ChartCard
      title="Évolution des Commandes"
      chart={
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="completed"
              stroke="#82ca9d"
              name="Complétées"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="pending"
              stroke="#8884d8"
              name="En attente"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="cancelled"
              stroke="#ff8042"
              name="Annulées"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="totalAmount"
              stroke="#ffc658"
              name="Montant Total"
            />
          </LineChart>
        </ResponsiveContainer>
      }
    />
  );
};

// Components remain the same, but we'll modify their data handling
const StatCard = ({ title, value, icon, trend, warning = false }) => (
  <div className="bg-white p-6 rounded-lg shadow transition-all hover:shadow-lg">
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
    <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const statusStyles = {
    completed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    cancelled: "bg-red-100 text-red-800",
    default: "bg-gray-100 text-gray-800",
  };

  const statusTranslations = {
    completed: "Terminée",
    pending: "En attente",
    cancelled: "Annulée",
  };

  const normalizedStatus = status.toLowerCase();
  const styleClass = statusStyles[normalizedStatus] || statusStyles.default;
  const translatedStatus = statusTranslations[normalizedStatus] || status;

  return (
    <span
      className={`px-2 py-1 text-xs rounded-full font-medium ${styleClass}`}
    >
      {translatedStatus}
    </span>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="custom-tooltip"
        style={{
          backgroundColor: "#fff",
          padding: "10px",
          border: "1px solid #ccc",
        }}
      >
        <p className="label">{`Produit: ${label}`}</p>
        <p>{`Revenu: ${payload[0].value}€`}</p>
        <p>{`Commandes: ${payload[1].value}`}</p>
        <p>{`Date: ${new Date(
          payload[0].payload.timestamp
        ).toLocaleDateString()}`}</p>
      </div>
    );
  }
  return null;
};

const Charts = ({ categoryStats, productSales, startDate, endDate }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <ChartCard
      title="Distribution par Catégorie"
      chart={
        <BarChart data={categoryStats}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category_name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="product_count" fill="#8884d8" name="Produits" />
          {/* <Bar dataKey="total_stock" fill="#82ca9d" name="Stock" /> */}
        </BarChart>
      }
    />
    <ChartCard
      title={`Ventes par Produit`}
      chart={
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={productSales}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <Bar dataKey="total_revenue" fill="#8884d8" name="Revenu" />
            <Bar dataKey="total_orders" fill="#82ca9d" name="Commandes" />

            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="product_name"
              angle={-10}
              textAnchor="end"
              height={60}
              fontSize={13}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </BarChart>
        </ResponsiveContainer>
      }
    />
  </div>
);

const ChartCard = ({ title, chart }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h2 className="text-lg font-semibold mb-6">{title}</h2>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        {chart}
      </ResponsiveContainer>
    </div>
  </div>
);

const RecentOrders = ({ orders }) => (
  <div className="bg-white rounded-lg shadow">
    <div className="p-6 border-b border-gray-200">
      <h2 className="text-lg font-semibold">Commandes Récentes</h2>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {["ID Commande", "Date", "Montant", "Statut"].map((header) => (
              <th
                key={header}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.ID_CMD} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">#{order.ID_CMD}</td>
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
);

const LowStockAlert = ({ items }) => (
  <div className="bg-white rounded-lg shadow">
    <div className="p-6 border-b border-gray-200">
      <h2 className="text-lg font-semibold">Alertes de Stock Faible</h2>
    </div>
    <div className="p-6 space-y-4">
      {items.map((item) => (
        <div
          key={item.ID_ART}
          className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-4"
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
);

const DateRangePicker = ({ startDate, endDate, onDateChange }) => (
  <div className="flex gap-4 items-end">
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Date Début
      </label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => onDateChange("startDate", e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Date Fin
      </label>
      <input
        type="date"
        value={endDate}
        onChange={(e) => onDateChange("endDate", e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
    <button
      onClick={() => onDateChange("apply")}
      className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    >
      Appliquer
    </button>
  </div>
);

const DashboardPlus = () => {
  const [dashboardData, setDashboardData] = useState({
    revenueStats: { current: 0, previous: 0 },
    topProducts: [],
    categoryStats: [],
    lowStock: [],
    recentOrders: [],
    salesTrends: [],
    productSales: [],
    monthlySales: null,
    loading: true,
  });

  const [dateRange, setDateRange] = useState({
    startDate: new Date().getFullYear() + "-01-01",
    endDate: new Date().toISOString().split("T")[0],
  });

  const fetchDashboardData = useCallback(async (startDate, endDate) => {
    try {
      setDashboardData((prev) => ({ ...prev, loading: true }));

      const endpoints = {
        revenueStats: `revenue-stats?startDate=${startDate}&endDate=${endDate}`,
        topProducts: `top-products?startDate=${startDate}&endDate=${endDate}`,
        categoryStats: `category-stats?startDate=${startDate}&endDate=${endDate}`,
        lowStock: "low-stock",
        recentOrders: `recent-orders?startDate=${startDate}&endDate=${endDate}`,
        salesTrends: `sales-trends?startDate=${startDate}&endDate=${endDate}`,
        monthlySales: `sales-by-month?startDate=${startDate}&endDate=${endDate}`,
        productSales: `sales-by-product?startDate=${startDate}&endDate=${endDate}`,
        commandSales: `commands/visualization?startDate=${startDate}&endDate=${endDate}`,
      };

      const fetchResults = await Promise.all(
        Object.entries(endpoints).map(async ([key, endpoint]) => {
          try {
            const response = await fetch(`${Endpoint()}/dashboard/${endpoint}`);
            if (!response.ok)
              throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            return [key, key === "productSales" ? data.products : data];
          } catch (error) {
            console.error(`Error fetching ${key}:`, error);
            return [key, []];
          }
        })
      );

      const newData = Object.fromEntries(fetchResults);
      setDashboardData((prev) => ({
        ...newData,
        loading: false,
      }));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setDashboardData((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(dateRange.startDate, dateRange.endDate);
  }, [fetchDashboardData, dateRange.startDate, dateRange.endDate]);

  const handleDateChange = (type, value) => {
    if (type === "apply") {
      if (dateRange.startDate > dateRange.endDate) {
        alert("La date de début doit être antérieure à la date de fin");
        return;
      }
      fetchDashboardData(dateRange.startDate, dateRange.endDate);
    } else {
      setDateRange((prev) => ({ ...prev, [type]: value }));
    }
  };

  if (dashboardData.loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-600">Chargement des données...</p>
      </div>
    );
  }

  const {
    monthlySales,
    categoryStats,
    lowStock,
    recentOrders,
    productSales,
    revenueStats,
  } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onDateChange={handleDateChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Revenue Total"
            value={`${
              monthlySales?.summary?.total_annual_revenue?.toLocaleString() || 0
            }€`}
            icon={<DollarSign className="w-6 h-6" />}
            // trend={calculateTrend(revenueStats.current, revenueStats.previous)}
          />
          <StatCard
            title="Commandes Totales"
            value={
              monthlySales?.summary?.total_annual_orders?.toString() || "0"
            }
            icon={<ShoppingCart className="w-6 h-6" />}
            // trend={calculateTrend(
            //   monthlySales?.summary?.total_annual_orders || 0,
            //   monthlySales?.summary?.previous_total_orders || 0
            // )}
          />
          <StatCard
            title="Livriosns"
            value={monthlySales?.summary?.total_items_sold?.toString() || "0%"}
            icon={<Package className="w-6 h-6" />}
            // trend={calculateTrend(
            //   monthlySales?.summary?.total_items_sold || 0,
            //   monthlySales?.summary?.previous_items_sold || 0
            // )}
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

        <Charts
          categoryStats={categoryStats}
          productSales={productSales}
          dateRange={dateRange}
        />

        <RecentOrders orders={recentOrders} dateRange={dateRange} />
        <OrdersVisualization commandSales={dashboardData.commandSales} />
        <LowStockAlert items={lowStock} />
      </div>
    </div>
  );
};

export default DashboardPlus;

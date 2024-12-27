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
  TrendingUp,
  Package,
  ShoppingCart,
  DollarSign,
  ChevronDown,
} from "lucide-react";
import { Endpoint } from "../../helper/enpoint";

const SalesAnalyticsDashboard = () => {
  const [salesData, setSalesData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [salesResponse, productResponse] = await Promise.all([
          fetch(Endpoint()`/dashboard/sales-by-month?year=${selectedYear}`),
          fetch(Endpoint()`/dashboard/product-performance/${selectedMonth || ''}?year=${selectedYear}`)
        ]);

        const [salesResult, productResult] = await Promise.all([
          salesResponse.json(),
          productResponse.json()
        ]);

        setSalesData(salesResult);
        setProductData(productResult);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, selectedMonth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Sales Analytics</h1>
        <div className="mt-4 flex gap-4">
          <select
            className="px-4 py-2 border rounded-lg bg-white"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {[2022, 2023, 2024].map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            className="px-4 py-2 border rounded-lg bg-white"
            value={selectedMonth || ''}
            onChange={(e) => setSelectedMonth(e.target.value || null)}
          >
            <option value="">All Months</option>
            {salesData?.monthly_sales.map((month, index) => (
              <option key={index} value={index + 1}>{month.month_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Revenue"
          value={`$${salesData?.summary.total_annual_revenue.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6" />}
          trend={`+${((salesData?.summary.total_annual_revenue / 100000) * 5).toFixed(1)}%`}
        />
        <StatCard
          title="Total Orders"
          value={salesData?.summary.total_annual_orders.toLocaleString()}
          icon={<ShoppingCart className="w-6 h-6" />}
          trend={`+${((salesData?.summary.total_annual_orders / 1000) * 2).toFixed(1)}%`}
        />
        <StatCard
          title="Items Sold"
          value={salesData?.summary.total_items_sold.toLocaleString()}
          icon={<Package className="w-6 h-6" />}
          trend={`+${((salesData?.summary.total_items_sold / 10000) * 3).toFixed(1)}%`}
        />
        <StatCard
          title="Avg Order Value"
          value={`$${productData?.summary.average_order_value}`}
          icon={<TrendingUp className="w-6 h-6" />}
          trend={`+${(Number(productData?.summary.average_order_value) / 100).toFixed(1)}%`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* Sales Trends Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Sales Trends</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData?.monthly_sales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month_name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="total_revenue"
                  stroke="#8884d8"
                  name="Revenue"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="total_orders"
                  stroke="#82ca9d"
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Performance Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Top Products Performance</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData?.products.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity_sold" fill="#8884d8" name="Quantity Sold" />
                <Bar dataKey="number_of_orders" fill="#82ca9d" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Top Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity Sold
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Number of Orders
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productData?.products.map((product) => (
                <tr key={product.product_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.product_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {product.quantity_sold.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {product.number_of_orders.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, trend }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 rounded-lg bg-blue-100">
        {icon}
      </div>
      <span className="text-sm text-green-600 flex items-center">
        {trend}
        <ChevronDown className="w-4 h-4 ml-1" />
      </span>
    </div>
    <h3 className="text-gray-600 text-sm">{title}</h3>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
  </div>
);

export default SalesAnalyticsDashboard;
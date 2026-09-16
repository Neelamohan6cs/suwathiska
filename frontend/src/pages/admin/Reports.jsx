import { useEffect, useState } from "react";
import {
  getSalesReport,
  getTopProducts,
  getCustomerGrowth,
  getDeliveryPerformance,
} from "../../api/adminApi";
import { formatCurrency } from "../../utils/format";
import StatCard from "../../components/admin/StatCard";
import { HiOutlineBanknotes, HiOutlineShoppingCart, HiOutlineCalculator } from "react-icons/hi2";
import PageLoader from "../../components/common/PageLoader";

const PERIODS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

function MiniBarChart({ data, valueKey, labelKey }) {
  if (!data.length) return <p className="text-sm text-ink/50">No data for this period.</p>;
  const max = Math.max(...data.map((d) => d[valueKey]), 1);

  return (
    <div className="flex items-end gap-2 overflow-x-auto pb-2">
      {data.map((d, i) => (
        <div key={i} className="flex w-10 shrink-0 flex-col items-center gap-1.5">
          <div
            className="w-full rounded-t-md bg-dairy-500"
            style={{ height: `${Math.max((d[valueKey] / max) * 120, 4)}px` }}
            title={`${d[labelKey]}: ${d[valueKey]}`}
          />
          <span className="w-full truncate text-center text-[10px] text-ink/40">{d[labelKey]}</span>
        </div>
      ))}
    </div>
  );
}

export default function Reports() {
  const [period, setPeriod] = useState("monthly");
  const [sales, setSales] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [growth, setGrowth] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSalesReport(period),
      getTopProducts(8),
      getCustomerGrowth(),
      getDeliveryPerformance(),
    ])
      .then(([salesRes, topRes, growthRes, perfRes]) => {
        setSales(salesRes.data);
        setTopProducts(topRes.data.topProducts);
        setGrowth(growthRes.data.growth);
        setPerformance(perfRes.data.performance);
      })
      .finally(() => setLoading(false));
  }, [period]);

  if (loading || !sales) return <PageLoader label="Loading reports" />;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl text-dairy-900">Reports</h2>
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`pill ${period === p.value ? "bg-dairy-600 text-white" : "bg-dairy-50 text-dairy-700"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Orders" value={sales.totalOrders} icon={HiOutlineShoppingCart} />
        <StatCard label="Total Revenue" value={formatCurrency(sales.totalRevenue)} icon={HiOutlineBanknotes} tone="text-leaf-600 bg-leaf-500/10" />
        <StatCard label="Average Order Value" value={formatCurrency(sales.averageOrderValue)} icon={HiOutlineCalculator} />
      </div>

      <div className="card p-5">
        <h3 className="mb-4 font-display text-sm text-dairy-900">Sales Trend ({period})</h3>
        <MiniBarChart
          data={sales.dailyBreakdown.map((d) => ({ label: d._id.slice(5), revenue: d.revenue }))}
          valueKey="revenue"
          labelKey="label"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 font-display text-sm text-dairy-900">Top Selling Products</h3>
          {topProducts.length === 0 ? (
            <p className="text-sm text-ink/50">No sales yet.</p>
          ) : (
            <div className="space-y-2.5">
              {topProducts.map((p) => (
                <div key={p._id} className="flex items-center justify-between text-sm">
                  <span className="line-clamp-1 text-ink/70">{p.name}</span>
                  <span className="shrink-0 font-medium text-ink">{p.totalQuantitySold} sold · {formatCurrency(p.totalRevenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-4 font-display text-sm text-dairy-900">Customer Growth</h3>
          <MiniBarChart
            data={growth.map((g) => ({ label: g._id.slice(2), value: g.newCustomers }))}
            valueKey="value"
            labelKey="label"
          />
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-4 font-display text-sm text-dairy-900">Delivery Performance</h3>
        {performance.length === 0 ? (
          <p className="text-sm text-ink/50">No completed deliveries yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-dairy-100 text-xs uppercase tracking-wide text-ink/45">
              <tr>
                <th className="py-2 font-medium">Delivery Partner</th>
                <th className="py-2 font-medium">Delivered</th>
                <th className="py-2 font-medium">Avg. Delivery Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dairy-100">
              {performance.map((p) => (
                <tr key={p.deliveryPersonId}>
                  <td className="py-2.5 text-ink/70">{p.name}</td>
                  <td className="py-2.5 text-ink/70">{p.totalDelivered}</td>
                  <td className="py-2.5 text-ink/70">{p.averageDeliveryTimeHours.toFixed(1)} hrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

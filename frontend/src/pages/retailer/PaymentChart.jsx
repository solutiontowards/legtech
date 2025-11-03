import React, { useEffect, useState } from 'react';
import { getTransactions } from '../../api/wallet';
import toast from 'react-hot-toast';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Loader2 } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PaymentChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data } = await getTransactions();
        if (data.ok) {
          processChartData(data.transactions || []);
        }
      } catch (err) {
        toast.error('Failed to load transaction data for chart.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const processChartData = (transactions) => {
    const credits = transactions
      .filter((t) => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);

    const debits = transactions
      .filter((t) => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);

    setChartData({
      labels: ['Transactions'],
      datasets: [
        {
          label: 'Total Credit',
          data: [credits],
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
        {
          label: 'Total Debit',
          data: [debits],
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 text-gray-600">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading Chart Data...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
        Payment Overview
      </h2>
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
        {chartData ? (
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: { legend: { position: 'top' }, title: { display: true, text: 'Total Credits vs. Debits' } },
            }}
          />
        ) : (
          <p className="text-center text-gray-500">No transaction data available to display chart.</p>
        )}
      </div>
    </div>
  );
};

export default PaymentChart;
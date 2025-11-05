import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getWalletBalance } from '../../api/wallet';
import { Wallet as WalletIcon, IndianRupee, Loader2, AlertCircle, Building, Mail, Phone } from 'lucide-react';
import Swal from 'sweetalert2';


const Wallet = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const { data } = await getWalletBalance();
      if (data.ok) {
        setBalance(data.balance);
        if (data.balance < 99) {
          MySwal.fire({
            title: '<p class="text-xl">Low Wallet Balance</p>',
            html: '<p class="text-sm text-gray-600">Your balance is low. Please add funds to avoid service interruptions.</p>',
            icon: 'warning',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
            background: '#fff',
            customClass: {
              popup: 'p-4 rounded-xl shadow-lg',
            },
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch wallet balance:", error);
      MySwal.fire({ title: 'Error', text: 'Could not fetch wallet balance.', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBalance();
    }
  }, []);

  const handlePayment = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return MySwal.fire({
        title: 'Invalid Amount',
        text: 'Please enter a valid amount to add.',
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
    }

    // Show an informational alert instead of processing a real payment
    MySwal.fire({
      title: 'Feature In Development',
      html: '<p class="text-gray-600">The payment gateway is currently being integrated. Please check back soon!</p>',
      icon: 'info',
      confirmButtonText: 'Got it!',
      confirmButtonColor: '#3b82f6',
    });
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div data-aos="fade-in" className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Wallet</h1>
          <p className="text-gray-500 mt-1">Manage your funds and top up your balance.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side: Balance and User Info */}
          <div data-aos="fade-right" className="lg:col-span-1 space-y-8">
            <div className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white p-8 rounded-2xl shadow-2xl flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium opacity-70">Available Balance</span>
                  <WalletIcon className="w-8 h-8 opacity-50" />
                </div>
                {loading ? (
                  <div className="mt-4"><Loader2 className="w-10 h-10 animate-spin" /></div>
                ) : (
                  <p className="text-5xl font-bold mt-2 tracking-tight">₹{balance !== null ? balance.toFixed(2) : '0.00'}</p>
                )}
              </div>
              {balance < 99 && !loading && (
                <div className="flex items-center gap-2 mt-4 bg-yellow-400/10 text-yellow-300 text-xs font-semibold px-3 py-1 rounded-full">
                  <AlertCircle className="w-4 h-4" />
                  <span>Low balance warning</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Add Money */}
          <div data-aos="fade-left" data-aos-delay="100" className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Add Money to Wallet</h2>
            <p className="text-gray-500 mb-6">Choose an amount to add to your balance.</p>
            
            <div className="flex flex-wrap gap-3 mb-6">
              {[100, 200, 500, 1000].map(val => (
                <button key={val} onClick={() => setAmount(val.toString())} className="flex-1 text-center px-4 py-3 bg-gray-100 text-gray-800 font-bold rounded-lg hover:bg-gray-200 focus:bg-blue-100 focus:text-blue-700 focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                  ₹{val}
                </button>
              ))}
            </div>

            <div className="relative mb-6">
              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Or enter a custom amount" className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
            </div>

            <button onClick={handlePayment} className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-102 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Proceed to Add Money
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
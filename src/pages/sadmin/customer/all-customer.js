import React, { useEffect, useState } from "react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import SAAdminLayout from "../../../layouts/Salonadmin";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "../../../api/axiosConfig";


const CustomerTable = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem("token"); // 🛑 Ensure salon admin token is stored
        if (!token) {
          toast.error("Unauthorized! Please log in again.");
          return;
        }

        const response = await axios.get("/customer/salon/customers", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCustomers(response.data.customers);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error("Failed to fetch customers!");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <SAAdminLayout>
      <div className="overflow-x-auto">
        <h1 className="text-2xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 drop-shadow-lg shadow-blue-500/50 transform transition duration-300 hover:scale-105">
          Total Customers: <strong>{customers.length}</strong>
        </h1>

        {loading ? (
          <p className="text-center text-gray-500">Loading customers...</p>
        ) : customers.length === 0 ? (
          <p className="text-center text-red-500">No customers found!</p>
        ) : (
          <table className="min-w-full table-auto bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left">Customer Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Phone</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {customers.map((customer) => (
                <tr key={customer._id} className="hover:bg-gray-100 border-b transition-all">
                  <td className="px-6 py-4">{customer.name}</td>
                  <td className="px-6 py-4">{customer.email}</td>
                  <td className="px-6 py-4">{customer.phone}</td>
                  <td className="px-6 py-4 flex space-x-4">
                    <FaEye className="text-blue-500 cursor-pointer" title="View" />
                    <FaEdit className="text-yellow-500 cursor-pointer" title="Edit" />
                    <FaTrash className="text-red-500 cursor-pointer" title="Delete" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <ToastContainer />
    </SAAdminLayout>
  );
};

export default CustomerTable;

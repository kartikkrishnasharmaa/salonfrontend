import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import SAAdminLayout from "../../../layouts/Salonadmin";
import { ToastContainer, toast } from "react-toastify";      
import "react-toastify/dist/ReactToastify.css";
import axios from "../../../api/axiosConfig";
import { FaPlus } from "react-icons/fa";

const SalonBookingPage = () => {
  const selectedBranch = useSelector((state) => state.branch.selectedBranch);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [service, setService] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    if (selectedBranch) {
      axios.get(`/customer/salon/customers?branchId=${selectedBranch}`)
        .then((res) => setCustomers(res.data.customers))
        .catch((error) => console.error("Error fetching customers:", error));
      
      axios.get(`/employee/salon/employees?branchId=${selectedBranch}`)
        .then((res) => setEmployees(res.data.employees))
        .catch((error) => console.error("Error fetching employees:", error));

      axios.get(`/booking/salon/bookings?branchId=${selectedBranch}`)
        .then((res) => setBookings(res.data.bookings))
        .catch((error) => console.error("Error fetching bookings:", error));
    }
  }, [selectedBranch]);

  const handleBookingSubmit = () => {
    if (!selectedCustomer || !selectedEmployee || !service || !date || !startTime || !endTime) {
      toast.error("All fields are required!");
      return;
    }

    axios.post("/booking/create", {
      customer: selectedCustomer,
      employee: selectedEmployee,
      service,
      price,
      discount,
      date,
      startTime,
      endTime,
    }).then(() => {
      toast.success("Booking successful!");
      setBookings([...bookings, { selectedCustomer, selectedEmployee, service, price, discount, date, startTime, endTime }]);
    }).catch((error) => toast.error("Booking failed!"));
  };

  return (
    <SAAdminLayout>
      <div className="p-6 bg-gray-100">
        <h2 className="text-2xl font-bold mb-4">Create New Order</h2>
        <div className="grid grid-cols-2 gap-4">
          <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} className="w-full p-2 border rounded">
            <option value="">Select Customer</option>
            {customers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} className="w-full p-2 border rounded">
            <option value="">Select Employee</option>
            {employees.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
          </select>
          <input type="text" placeholder="Service" value={service} onChange={(e) => setService(e.target.value)} className="w-full p-2 border rounded" />
          <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-2 border rounded" />
          <input type="number" placeholder="Discount" value={discount} onChange={(e) => setDiscount(e.target.value)} className="w-full p-2 border rounded" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2 border rounded" />
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full p-2 border rounded" />
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div className="flex gap-4 mt-4">
          <button className="px-6 py-2 bg-green-500 text-white rounded" onClick={handleBookingSubmit}>OK</button>
          <button className="px-6 py-2 bg-red-500 text-white rounded" onClick={() => toast.info("Cancelled")}>Cancel</button>
        </div>
      </div>
      <div className="p-6 bg-white mt-6">
        <h2 className="text-2xl font-bold mb-4">Appointments</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Customer</th>
              <th className="p-2">Employee</th>
              <th className="p-2">Service</th>
              <th className="p-2">Price</th>
              <th className="p-2">Discount</th>
              <th className="p-2">Date</th>
              <th className="p-2">Start Time</th>
              <th className="p-2">End Time</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => (
              <tr key={index} className="border">
                <td className="p-2">{booking.customer}</td>
                <td className="p-2">{booking.employee}</td>
                <td className="p-2">{booking.service}</td>
                <td className="p-2">{booking.price}</td>
                <td className="p-2">{booking.discount}</td>
                <td className="p-2">{booking.date}</td>
                <td className="p-2">{booking.startTime}</td>
                <td className="p-2">{booking.endTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ToastContainer />
    </SAAdminLayout>
  );
};

export default SalonBookingPage;

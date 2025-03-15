import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import SAAdminLayout from "../../../layouts/Salonadmin";
import "react-big-calendar/lib/css/react-big-calendar.css";
import axios from "../../../api/axiosConfig";
import Modal from "react-modal";
import { FaPlus } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const localizer = momentLocalizer(moment);
Modal.setAppElement("#root");

const EmployeeCalendar = () => {
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [events, setEvents] = useState([]);
  const [view, setView] = useState("week");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    moment().format("YYYY-MM-DD")
  );
  const [selectedTime, setSelectedTime] = useState(moment().format("HH:mm"));
  const [selectedendTime, setSelectedendTime] = useState(
    moment().format("HH:mm")
  );
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [service, setService] = useState("");
  const selectedBranch = useSelector((state) => state.branch.selectedBranch);
  const token = localStorage.getItem("token");

  // 🔹 Fetch Employees
  useEffect(() => {
    if (!selectedBranch || !token) return;
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(
          `/employee/all/employees?branchId=${selectedBranch}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Employees:", res.data);
        setEmployees(res.data?.employees || []);
      } catch (error) {
        console.error("Error fetching employees", error);
        setEmployees([]);
      }
    };
    fetchEmployees();
  }, [selectedBranch, token]);

  // 🔹 Fetch Customers
  useEffect(() => {
    if (!selectedBranch || !token) return;
    const fetchCustomers = async () => {
      try {
        const res = await axios.get(
          `/customer/salon/customers?branchId=${selectedBranch}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Customers:", res.data);
        setCustomers(res.data?.customers || []);
      } catch (error) {
        console.error("Error fetching customers", error);
        setCustomers([]);
      }
    };
    fetchCustomers();
  }, [selectedBranch, token]);

  // 🔹 Fetch Appointments
  useEffect(() => {
    if (!selectedBranch || !token) return;
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(
          `/booking/get-appointments?branchId=${selectedBranch}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const formattedAppointments = res.data.appointments
          .map((appointment) => ({
            id: appointment._id,
            title: `${appointment.service} - ${appointment.status}`,
            start: moment(
              `${appointment.date}T${appointment.startTime}`
            ).toDate(),
            end: moment(`${appointment.date}T${appointment.endTime}`).toDate(),
          }))
          .sort((a, b) => a.start - b.start);

        console.log("Appointments:", formattedAppointments);
        setEvents(formattedAppointments);
      } catch (error) {
        console.error("Error fetching appointments", error);
        setEvents([]);
      }
    };
    fetchAppointments();
  }, [selectedBranch, token]);

  // 🔹 Debugging Data in Console
  useEffect(() => {
    console.log("Updated Employees:", employees);
    console.log("Updated Customers:", customers);
  }, [employees, customers]);

  const handleViewChange = (newView) => setView(newView);

  const handleSelectSlot = (slotInfo) => {
    setSelectedDate(moment(slotInfo.start).format("YYYY-MM-DD"));
    setSelectedTime(moment(slotInfo.start).format("HH:mm"));
    setModalIsOpen(true);
  };

  const handleBookingSubmit = async () => {
    try {
      if (!token || !selectedBranch) return;

      const payload = {
        customerId: selectedCustomer,
        employeeId: selectedEmployee,
        service,
        date: selectedDate,
        startTime: selectedTime,
        endTime: selectedendTime,
        branchId: selectedBranch,
      };

      console.log("Booking Payload:", payload);

      await axios.post("/booking/create-booking", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Appointment booked successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      setModalIsOpen(false);
    } catch (error) {
      console.error(
        "Error creating appointment:",
        error.response?.data || error
      );
    }
  };

  return (
    <SAAdminLayout>
      <div
        style={{ position: "relative", padding: "20px", textAlign: "center" }}
      >
        <Link
          to="/sadmin/new-booking"
          className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center z-50"
        >
          <FaPlus size={24} />
        </Link>

        <div
          style={{
            height: "80vh",
            width: "100%",
            background: "white",
            borderRadius: "10px",
            padding: "10px",
          }}
        >
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%", width: "100%" }}
            view={view}
            views={["month", "week", "day"]}
            toolbar={true}
            onView={handleViewChange}
            selectable
            onSelectSlot={handleSelectSlot}
          />
        </div>
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        style={{
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.6)", zIndex: 1000 },
          content: {
            width: "450px",
            height: "470px",
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "20px",
            borderRadius: "10px",
            backgroundColor: "white",
            zIndex: 1100,
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
            overflowY: "auto",
          },
        }}
      >
        <h2 style={{ textAlign: "center" }}>Create Booking</h2>

        {/* 🔹 Date Input */}
        <label>Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        />

        {/* 🔹 Start Time Input */}
        <label>Start Time:</label>
        <input
          type="time"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        />

        {/* 🔹 End Time Input */}
        <label>End Time:</label>
        <input
          type="time"
          value={selectedendTime}
          onChange={(e) => setSelectedendTime(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        />

        {/* 🔹 Employee Dropdown */}
        <label>Employee:</label>
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        >
          <option value="">Select Employee</option>
          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.name}
            </option>
          ))}
        </select>

        {/* 🔹 Customer Dropdown */}
        <label>Customer:</label>
        <select
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        >
          <option value="">Select Customer</option>
          {customers.map((cust) => (
            <option key={cust._id} value={cust._id}>
              {cust.name}
            </option>
          ))}
        </select>

        {/* 🔹 Service Input */}
        <label>Service:</label>
        <input
          type="text"
          value={service}
          onChange={(e) => setService(e.target.value)}
          placeholder="Enter service name"
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        />

        {/* 🔹 Debugging Logs */}
        {console.log("Modal Opened - Selected Values:", {
          selectedDate,
          selectedTime,
          selectedendTime,
          selectedEmployee,
          selectedCustomer,
          service,
        })}

        {/* 🔹 Submit Button */}
        <button
          onClick={handleBookingSubmit}
          style={{
            width: "100%",
            padding: "12px",
            background: "#ff7e5f",
            color: "white",
            border: "none",
            borderRadius: "5px",
            marginTop: "15px",
          }}
        >
          Book Appointment
        </button>
      </Modal>

      <ToastContainer />
    </SAAdminLayout>
  );
};

export default EmployeeCalendar;

// import React, { useEffect, useState } from "react";
// import { Calendar, momentLocalizer } from "react-big-calendar";
// import moment from "moment";
// import { Link } from "react-router-dom";
// import { useSelector } from "react-redux";
// import SAAdminLayout from "../../../layouts/Salonadmin";
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import axios from "../../../api/axiosConfig";
// import Modal from "react-modal";
// import { FaPlus } from "react-icons/fa";
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const localizer = momentLocalizer(moment);
// Modal.setAppElement("#root");

// const EmployeeCalendar = () => {
//   const [employees, setEmployees] = useState([]);
//   const [customers, setCustomers] = useState([]);
//   const [events, setEvents] = useState([]);
//   const [view, setView] = useState("week");
//   const [modalIsOpen, setModalIsOpen] = useState(false);
//   const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
//   const [selectedTime, setSelectedTime] = useState(moment().format("HH:mm"));
//   const [selectedendTime, setSelectedendTime] = useState(moment().format("HH:mm"));
//   const [selectedEmployee, setSelectedEmployee] = useState("");
//   const [selectedCustomer, setSelectedCustomer] = useState("");
//   const [service, setService] = useState("");
//   const selectedBranch = useSelector((state) => state.branch.selectedBranch);

//   useEffect(() => {
//     const fetchData = async () => {
//       const token = localStorage.getItem("token");
//       if (!token || !selectedBranch) return; // Ensuring valid token and branch selection

//       try {
//         // ✅ Fetch employees
//         const employeeRes = await axios.get(`/employee/all/employees?branchId=${selectedBranch}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         console.log("API Response:", employeeRes.data); // ✅ API से आने वाला डेटा चेक करें

//         setEmployees(employeeRes.data?.employees || []);

//         // ✅ Fetch customers correctly
//         const customerRes = await axios.get(`/customer/salon/customers?branchId=${selectedBranch}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setCustomers(customerRes.data?.customers || []);

//         // ✅ Fetch appointments
//         const appointmentRes = await axios.get(`/booking/get-appointments?branchId=${selectedBranch}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         // ✅ Convert to Calendar Format
//       // ✅ Sorting Events before setting state
// const formattedAppointments = appointmentRes.data.appointments.map((appointment) => {
//   const startDateTime = moment(`${appointment.date}T${appointment.startTime}`, "YYYY-MM-DDTHH:mm").toDate();
//   const endDateTime = moment(`${appointment.date}T${appointment.endTime}`, "YYYY-MM-DDTHH:mm").toDate();

//   return {
//     id: appointment._id,
//     title: `${appointment.service} - ${appointment.status}`,
//     start: startDateTime,
//     end: endDateTime,
//   };
// }).sort((a, b) => a.start - b.start); // ✅ Sorting appointments by start time

// setEvents(formattedAppointments);

//       } catch (error) {
//         console.error("Error fetching data", error);
//         setEmployees([]);
//         setCustomers([]);
//         setEvents([]);
//       }
//     };
//     if (selectedBranch) { // ✅ Check if branch is selected before calling fetchData
//       fetchData();
//     }
//   }, [selectedBranch]); // Trigger effect when branch changes

//   useEffect(() => {
//     console.log("Employees:", employees);
//     console.log("Customers:", customers);
//   }, [employees, customers]);

//   const handleViewChange = (newView) => setView(newView);

//   const dayStyleGetter = (date) => {
//     const formattedDate = moment(date).format("YYYY-MM-DD");
//     const isEventDay = events.some(event => moment(event.start).format("YYYY-MM-DD") === formattedDate);

//     if (isEventDay) {
//       return {
//         style: {
//           backgroundColor: "#ffeeba", // 🔶 Highlight event dates
//           borderRadius: "5px",
//         },
//       };
//     }
//     return {};
//   };

//   const handleSelectSlot = (slotInfo) => {
//     setSelectedDate(moment(slotInfo.start).format("YYYY-MM-DD"));
//     setSelectedTime(moment(slotInfo.start).format("HH:mm"));
//     setModalIsOpen(true);
//   };

//   const handleBookingSubmit = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token || !selectedBranch) {
//         console.error("Token or Branch ID is missing", { token, selectedBranch });
//         return;
//       }

//       const payload = {
//         customerId: selectedCustomer,
//         employeeId: selectedEmployee,
//         service,
//         date: selectedDate,
//         startTime: selectedTime,
//         endTime: selectedendTime,
//         branchId: selectedBranch, // ✅ Ensure it's included
//       };

//       console.log("Sending Booking Payload:", payload);

//       await axios.post("/booking/create-booking", payload, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//    // ✅ Show success message
//    toast.success("Appointment booked successfully!", {
//     position: "top-right",
//     autoClose: 3000,
//   });
//       setModalIsOpen(false);
//     } catch (error) {
//       console.error("Error creating appointment:", error.response?.data || error);
//     }
//   };

//   return (
//     <SAAdminLayout>
//       <div style={{ position: "relative", padding: "20px", textAlign: "center" }}>
//       <Link
//       to="/sadmin/new-booking" // Change this to your target route
//       className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center z-50"

//     >
//       <FaPlus size={24} />
//     </Link>
//         <div style={{ height: "80vh", width: "100%", background: "white", borderRadius: "10px", padding: "10px" }}>
//         <Calendar
//   localizer={localizer}
//   events={events}
//   startAccessor="start"
//   endAccessor="end"
//   style={{ height: "100%", width: "100%" }}
//   view={view}
//   views={["month", "week", "day"]}
//   toolbar={true}
//   onView={handleViewChange}
//   selectable
//   onSelectSlot={handleSelectSlot}
//   eventPropGetter={(event) => ({
//     style: {
//       top: `${moment(event.start).hour() * 60 + moment(event.start).minute()}px`,
//       backgroundColor: "#4caf50",
//       color: "white",
//     },
//   })}
// />

//         </div>
//       </div>

//       {/* Booking Modal */}
//       <Modal
//         isOpen={modalIsOpen}
//         onRequestClose={() => setModalIsOpen(false)}
//         style={{
//           overlay: { backgroundColor: "rgba(0, 0, 0, 0.6)", zIndex: 1000 },
//           content: {
//             width: "450px",
//             height: "470px",
//             maxHeight: "80vh",
//             position: "fixed",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             padding: "20px",
//             borderRadius: "10px",
//             backgroundColor: "white",
//             zIndex: 1100,
//             boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
//             overflowY: "auto",
//           },
//         }}
//       >
//         {/* Small "X" Close Button */}
//         <button
//           onClick={() => setModalIsOpen(false)}
//           style={{
//             position: "absolute",
//             top: "10px",
//             right: "10px",
//             background: "none",
//             border: "none",
//             fontSize: "18px",
//             cursor: "pointer",
//             color: "#555",
//           }}
//         >
//           ✖
//         </button>

//         <h2 style={{ marginBottom: "15px", textAlign: "center" }}>Create Booking</h2>

//         {/* Form Inputs with Flexbox */}
//         <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
//           {[
//             { label: "Date", type: "date", value: selectedDate, onChange: setSelectedDate },
//             { label: "Start Time", type: "time", value: selectedTime, onChange: setSelectedTime },
//             { label: "End Time", type: "time", value: selectedendTime, onChange: setSelectedendTime },
//             { label: "Service", type: "text", value: service, onChange: setService, placeholder: "Enter Service" },
//           ].map(({ label, type, value, onChange, placeholder }, index) => (
//             <div key={index} style={rowStyle}>
//               <label style={labelStyle}>{label}:</label>
//               <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
//             </div>
//           ))}

//           {[{ label: "Employee", value: selectedEmployee, onChange: setSelectedEmployee, data: employees },
//             { label: "Customer", value: selectedCustomer, onChange: setSelectedCustomer, data: customers }]
//             .map(({ label, value, onChange, data }, index) => (
//               <div key={index} style={rowStyle}>
//                 <label style={labelStyle}>{label}:</label>
//                 <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
//                   <option value="">Select {label}</option>
//                   {data.map((item) => (
//                     <option key={item._id} value={item._id}>{item.name}</option>
//                   ))}
//                 </select>
//               </div>
//             ))}
//         </div>

//         {/* Booking Submit Button */}
//         <button onClick={handleBookingSubmit} style={buttonStyle}>
//           Book Appointment
//         </button>
//       </Modal>
//             <ToastContainer />

//     </SAAdminLayout>
//   );
// };

// // Styles
// const rowStyle = { display: "flex", alignItems: "center", gap: "10px" };
// const labelStyle = { width: "100px", fontWeight: "bold" };
// const inputStyle = { flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #ccc" };
// const buttonStyle = { width: "100%", padding: "12px", background: "#ff7e5f", color: "white", border: "none", borderRadius: "5px", marginTop: "15px" };

// export default EmployeeCalendar;

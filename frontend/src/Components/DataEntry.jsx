import { useState, useEffect } from "react";
// import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import Papa from "papaparse";
import Header from "./Header";
import "./DataEntry.css";

function DataEntry({ setIsLoggedIn }) {
  const [customers, setCustomers] = useState([]);
  const [activeTab, setActiveTab] = useState("customers");
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [showTruckForm, setShowTruckForm] = useState(false);
  const [selectedTrucks, setSelectedTrucks] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [trucks, setTrucks] = useState([]); // Added for truck listing
  const [selectedTruckIds, setSelectedTruckIds] = useState([]);
  const [warehouse, setWarehouse] = useState(() => {
    // Load from localStorage if available
    return (
      JSON.parse(localStorage.getItem("warehouse")) || {
        name: "Jain Dairy Products ",
        address: "Anupam Complex 1, Swastik Char Rasta, Commerce College Rd, Navrangpura",
        lat: 23.037227961320447,
        lng: 72.56019446449395,
        capacity: 5000,
      }
    );
  });
  const navigate = useNavigate();

  const allSelected =
    customers.length > 0 && selectedCustomers.length === customers.length;

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("customers")) || [];
    setCustomers(stored);
  }, []);

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = results.data;

        const newCustomers = parsedData.map((row, index) => ({
          id: row["Customer ID"],
          name: row["Business Name"],
          address: row["Google Maps Link"],
          coordinates: {
            lat: parseFloat(row["Latitude"]),
            lng: parseFloat(row["Longitude"]),
          },
        }));

        const existing = JSON.parse(localStorage.getItem("customers")) || [];
        const updated = [...existing, ...newCustomers];

        // Save locally
        localStorage.setItem("customers", JSON.stringify(updated));
        setCustomers(updated);
        setShowCustomerForm(false);
      },
    });
  };

  const handleAddCustomer = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newCustomer = {
      id: formData.get("id"),
      name: formData.get("name"),
      address: formData.get("gmap") || "",
      coordinates: {
        lat: parseFloat(formData.get("lat")),
        lng: parseFloat(formData.get("lng")),
      },
    };

    let updatedCustomers;
    if (editMode) {
      updatedCustomers = customers.map((cust) =>
        cust.id === editingCustomerId ? newCustomer : cust
      );
    } else {
      updatedCustomers = [...customers, newCustomer];
    }

    localStorage.setItem("customers", JSON.stringify(updatedCustomers));
    setCustomers(updatedCustomers);
    setShowCustomerForm(false);
    e.target.reset();
    setEditMode(false);
    setEditingCustomerId(null);
  };

  const updateList = async () => {
    const customersToSend = JSON.parse(localStorage.getItem("customers")) || [];
    // const warehouseToSend = JSON.parse(localStorage.getItem("warehouse")) || {};
    const warehouseToSend = {
      name: warehouse.name,
      address: warehouse.address,
      capacity: warehouse.capacity,
      coordinates: {
        lat: parseFloat(warehouse.lat),
        lng: parseFloat(warehouse.lng),
      },
    };
    const payload = {
      warehouse: warehouseToSend,
      customers: customersToSend,
    };
    try {
      const response = await fetch("http://127.0.0.1:8000/upload_data/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("Backend response:", result);
      alert("Customer and warehouse data sent to backend successfully!");
      navigate("/routesPlanning");
    } catch (error) {
      console.error("Error sending data to backend:", error);
      alert("Failed to send customer and warehouse data.");
    }
  };

  const handleDeleteCustomer = (id = null) => {
    let idsToDelete = [];
    if (id !== null) {
      // Single delete
      idsToDelete = [id];
    } else {
      // Bulk delete
      idsToDelete = [...selectedCustomers];
    }

    const remaining = customers.filter(
      (customer) => !idsToDelete.includes(customer.id)
    );

    localStorage.setItem("customers", JSON.stringify(remaining));
    setCustomers(remaining);
    setSelectedCustomers((prevSelected) =>
      prevSelected.filter((cid) => !idsToDelete.includes(cid))
    );
  };

  const editCustomer = (id) => {
    setEditingCustomerId(id);

    document.getElementById("id").value = customer.id;
    document.getElementById("name").value = customer.name;
    document.getElementById("lat").value = customer.coordinates.lat;
    document.getElementById("lng").value = customer.coordinates.lng;
    document.getElementById("gmap").value = customer.address;

    setEditMode(true);
    setShowCustomerForm(true);
  };
  const handleTruckAdd = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const Truck = {
      id: formData.get("Truck_id"),
      name: formData.get("Truck_name"),
      address: formData.get("Truck_Owner") || "",
    };
  };

  const handleWarehouseChange = (e) => {
    const { name, value } = e.target;
    setWarehouse((prev) => ({ ...prev, [name]: value }));
  };

  const handleWarehouseSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("warehouse", JSON.stringify(warehouse));
    alert("Warehouse data saved!");
  };

  return (
    <div>
      <Header setIsLoggedIn={setIsLoggedIn} />
      <div className="data-entry-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "customers" ? "active" : ""}`}
            onClick={() => setActiveTab("customers")}
          >
            Customer Data
          </button>
          <button
            className={`tab ${activeTab === "trucks" ? "active" : ""}`}
            onClick={() => setActiveTab("trucks")}
          >
            Truck Data
          </button>
        </div>
        <div className="WareHouse">
          <img
            src="/warehouse.png"
            alt="Warehouse"
            className="warehouse-icon"
          />
          <form
            className="warehouse-form"
            onSubmit={handleWarehouseSubmit}
            style={{ marginTop: "1rem" }}
          >
            <div className="form-group">
              <label>Warehouse Name:</label>
              <input
                type="text"
                name="name"
                value={warehouse.name}
                onChange={handleWarehouseChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Address:</label>
              <input
                type="text"
                name="address"
                value={warehouse.address}
                onChange={handleWarehouseChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Latitude:</label>
              <input
                type="number"
                name="lat"
                value={warehouse.lat}
                onChange={handleWarehouseChange}
                step="any"
                required
              />
            </div>
            <div className="form-group">
              <label>Longitude:</label>
              <input
                type="number"
                name="lng"
                value={warehouse.lng}
                onChange={handleWarehouseChange}
                step="any"
                required
              />
            </div>
            <div className="form-group">
              <label>Capacity:</label>
              <input
                type="number"
                name="capacity"
                value={warehouse.capacity}
                onChange={handleWarehouseChange}
                required
              />
            </div>
            {/* <button type="submit">Save</button> */}
          </form>
        </div>

        <div className="tab-content">
          {activeTab === "customers" ? (
            <div className="customer-data">
              <div className="data-actions">
                <div className="button-group">
                  <button
                    className="add-btn"
                    onClick={() => setShowCustomerForm(true)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      x="0px"
                      y="0px"
                      width="25"
                      height="25"
                      viewBox="0 0 30 30"
                    >
                      <path d="M15,3C8.373,3,3,8.373,3,15c0,6.627,5.373,12,12,12s12-5.373,12-12C27,8.373,21.627,3,15,3z M21,16h-5v5 c0,0.553-0.448,1-1,1s-1-0.447-1-1v-5H9c-0.552,0-1-0.447-1-1s0.448-1,1-1h5V9c0-0.553,0.448-1,1-1s1,0.447,1,1v5h5 c0.552,0,1,0.447,1,1S21.552,16,21,16z"></path>
                    </svg>
                    <label>Add Customer</label>
                  </button>
                  <button className="add-btn" onClick={() => updateList(true)}>
                    Optimise
                  </button>
                  <button
                    className="add-btn"
                    onClick={() => handleDeleteCustomer()}
                  >
                    Delete Selected
                  </button>
                </div>

                {customers.length > 0 ? (
                  <table className="customer-table">
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCustomers(
                                  customers.map((customer) => customer.id)
                                );
                              } else {
                                setSelectedCustomers([]);
                              }
                            }}
                          />
                        </th>
                        <th>ID</th>
                        <th>Business Name</th>
                        <th>Latitude</th>
                        <th>Longitude</th>
                        <th>Google Maps</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedCustomers.includes(customer.id)}
                              onChange={(e) => {
                                const newSelected = e.target.checked
                                  ? [...selectedCustomers, customer.id]
                                  : selectedCustomers.filter(
                                      (id) => id !== customer.id
                                    );
                                setSelectedCustomers(newSelected);
                              }}
                            />
                          </td>
                          <td>{customer.id}</td>
                          <td>{customer.name}</td>
                          <td>{customer.coordinates.lat}</td>
                          <td>{customer.coordinates.lng}</td>
                          <td>
                            <Link
                              className="map-link"
                              to={customer.address}
                              target="_blank"
                            >
                              View On Map
                            </Link>
                          </td>
                          <td>
                            <svg
                              className="delete-btn"
                              onClick={() => handleDeleteCustomer(customer.id)}
                              xmlns="http://www.w3.org/2000/svg"
                              x="0px"
                              y="0px"
                              width="25"
                              height="25"
                              viewBox="0 0 30 30"
                              fill="#e43838"
                            >
                              <path d="M 14.984375 2.4863281 A 1.0001 1.0001 0 0 0 14 3.5 L 14 4 L 8.5 4 A 1.0001 1.0001 0 0 0 7.4863281 5 L 6 5 A 1.0001 1.0001 0 1 0 6 7 L 24 7 A 1.0001 1.0001 0 1 0 24 5 L 22.513672 5 A 1.0001 1.0001 0 0 0 21.5 4 L 16 4 L 16 3.5 A 1.0001 1.0001 0 0 0 14.984375 2.4863281 z M 6 9 L 7.7929688 24.234375 C 7.9109687 25.241375 8.7633438 26 9.7773438 26 L 20.222656 26 C 21.236656 26 22.088031 25.241375 22.207031 24.234375 L 24 9 L 6 9 z"></path>
                            </svg>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="delete-btn"
                              onClick={() => editCustomer(customer.id)}
                              x="0px"
                              y="0px"
                              width="25"
                              height="25"
                              viewBox="0 0 24 24"
                              fill="#008000"
                            >
                              <path d="M 18.414062 2 C 18.158188 2 17.902031 2.0974687 17.707031 2.2929688 L 16 4 L 20 8 L 21.707031 6.2929688 C 22.098031 5.9019687 22.098031 5.2689063 21.707031 4.8789062 L 19.121094 2.2929688 C 18.925594 2.0974687 18.669937 2 18.414062 2 z M 14.5 5.5 L 3 17 L 3 21 L 7 21 L 18.5 9.5 L 14.5 5.5 z"></path>
                            </svg>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No customers added yet.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="truck-data">
              <div className="data-actions">
                <button
                  className="add-btn"
                  onClick={() => setShowTruckForm(true)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    width="25"
                    height="25"
                    viewBox="0 0 30 30"
                  >
                    <path d="M15,3C8.373,3,3,8.373,3,15c0,6.627,5.373,12,12,12s12-5.373,12-12C27,8.373,21.627,3,15,3z M21,16h-5v5 c0,0.553-0.448,1-1,1s-1-0.447-1-1v-5H9c-0.552,0-1-0.447-1-1s0.448-1,1-1h5V9c0-0.553,0.448-1,1-1s1,0.447,1,1v5h5 c0.552,0,1,0.447,1,1S21.552,16,21,16z"></path>
                  </svg>
                  <label>Add Truck</label>
                </button>

                {trucks.length > 0 ? (
                  <table className="customer-table">
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            checked={
                              trucks.length > 0 &&
                              selectedTruckIds.length === trucks.length
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTruckIds(
                                  trucks.map((truck) => truck.id)
                                );
                              } else {
                                setSelectedTruckIds([]);
                              }
                            }}
                          />
                        </th>
                        <th>ID</th>
                        <th>Capacity</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trucks.map((truck) => (
                        <tr key={truck.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedTruckIds.includes(truck.id)}
                              onChange={(e) => {
                                const newSelected = e.target.checked
                                  ? [...selectedTruckIds, truck.id]
                                  : selectedTruckIds.filter(
                                      (id) => id !== truck.id
                                    );
                                setSelectedTruckIds(newSelected);
                              }}
                            />
                          </td>
                          <td>{truck.id}</td>
                          <td>{truck.capacity}</td>
                          <td>{truck.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No trucks uploaded yet.</p>
                )}
              </div>
            </div>
          )}

          {showTruckForm && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>Add New Truck</h2>
                  <button
                    className="close-btn"
                    onClick={() => setShowTruckForm(false)}
                  >
                    X
                  </button>
                </div>
                <form onSubmit={handleTruckAdd} className="customer-form">
                  <div className="form-group">
                    <label>Truck ID:</label>
                    <input type="text" id="Truck_id" name="Truck_id" required />
                  </div>
                  <div className="form-group">
                    <label>Truck Name:</label>
                    <input
                      type="text"
                      id="Truck_name"
                      name="Truck_name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Truck Owner Name</label>
                    <input type="text" id="Truck_Owner" name="Truck_Owner" />
                  </div>
                  <div className="csv-upload">
                    <label htmlFor="csvFile" className="csv-upload-label">
                      <img
                        src="/csv-icon.png"
                        alt="CSV"
                        className="action-icon"
                      />
                      Upload Truck CSV
                    </label>
                    <input
                      type="file"
                      id="csvFile"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      className="csv-input"
                    />
                    <small>
                      CSV Format: Truck Id, Name, Number, Owner name
                    </small>
                  </div>
                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => setShowCustomerForm(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit">Add Truck</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {showCustomerForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Add New Customer</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowCustomerForm(false)}
                >
                  X
                </button>
              </div>
              <form onSubmit={handleAddCustomer} className="customer-form">
                <div className="form-group">
                  <label>
                    Customer ID: <span style={{ color: "red" }}>*</span>
                  </label>
                  <input type="text" id="id" name="id" required />
                </div>
                <div className="form-group">
                  <label>
                    Business Name: <span style={{ color: "red" }}>*</span>{" "}
                  </label>
                  <input type="text" id="name" name="name" required />
                </div>
                <div className="form-group">
                  <label>
                    Latitude: <span style={{ color: "red" }}>*</span>{" "}
                  </label>
                  <input
                    type="number"
                    id="lat"
                    name="lat"
                    step="any"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    Longitude: <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="number"
                    id="lng"
                    name="lng"
                    step="any"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Google Maps Link:</label>
                  <input type="url" id="gmap" name="gmap" />
                </div>
                <div className="csv-upload">
                  <label htmlFor="csvFile" className="csv-upload-label">
                    <img
                      src="/csv-icon.png"
                      alt="CSV"
                      className="action-icon"
                    />
                    Upload Customer CSV
                  </label>
                  <input
                    type="file"
                    id="csvFile"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="csv-input"
                  />
                  <small>CSV Format: Id, Name, Latitude, Longitude, Link</small>
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setShowCustomerForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit">Add Customer</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataEntry;

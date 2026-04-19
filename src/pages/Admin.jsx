import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePageSeo } from "../hooks/usePageSeo";
import { useAuth } from "../hooks/useAuth";

export default function Admin() {
  usePageSeo({
    title: "Admin Dashboard | Sathi Homecare",
    description: "Manage partners, bookings, services and requests from the Sathi Homecare admin dashboard."
  });

  const {
    admin,
    loginAdmin,
    logout,
    partners,
    bookings,
    services,
    attendance,
    addPartner,
    assignAdminBooking,
    updateAdminBookingStatus,
    fetchAdminPartners,
    fetchAdminBookings,
    fetchAdminServices,
    fetchAdminAttendance,
    createAdminService,
    updateAdminService,
    deleteAdminService,
    updateAdminPartner,
    deleteAdminPartner
  } = useAuth();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    id: "",
    password: "",
    name: "",
    email: "",
    phone: "",
    role: "",
    address: "",
    joiningDate: "2025-01-01",
    status: "ACTIVE"
  });
  const [serviceForm, setServiceForm] = useState({
    name: "",
    category: "NURSING",
    description: "",
    price: ""
  });
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editingPartnerId, setEditingPartnerId] = useState(null);
  const [bookingStatusFilter, setBookingStatusFilter] = useState("ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");
  const [bookingSearch, setBookingSearch] = useState("");

  useEffect(() => {
    if (!admin) return;

    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchAdminPartners(), fetchAdminBookings(), fetchAdminServices(), fetchAdminAttendance()]);
        if (!active) return;
        setError("");
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Unable to load admin dashboard data.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, [admin, fetchAdminAttendance, fetchAdminBookings, fetchAdminPartners, fetchAdminServices]);

  const stats = useMemo(
    () => ({
      totalPartners: partners.length,
      totalBookings: bookings.length,
      assigned: bookings.filter((item) => item.status === "Assigned").length,
      completed: bookings.filter((item) => item.status === "Completed").length
    }),
    [partners, bookings]
  );

  const filteredBookings = useMemo(() => {
    const searchTerm = bookingSearch.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesBookingStatus =
        bookingStatusFilter === "ALL" ||
        String(booking.rawStatus || booking.status).toUpperCase() === bookingStatusFilter;

      const matchesPaymentStatus =
        paymentStatusFilter === "ALL" ||
        String(booking.paymentStatus || "").toUpperCase() === paymentStatusFilter;

      const matchesSearch =
        !searchTerm ||
        [
          booking.service,
          booking.customer,
          booking.address,
          booking.partnerName,
          booking.partnerEmployeeId,
          String(booking.id)
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(searchTerm));

      return matchesBookingStatus && matchesPaymentStatus && matchesSearch;
    });
  }, [bookingSearch, bookingStatusFilter, bookings, paymentStatusFilter]);

  const handleAdminLogin = async (event) => {
    event.preventDefault();
    try {
      setIsLoggingIn(true);
      await loginAdmin(credentials);
      setError("");
    } catch (err) {
      setError(err?.message || "Invalid admin credentials.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAddPartner = async (event) => {
    event.preventDefault();
    const requiredPartnerFields = editingPartnerId
      ? ["id", "name", "email", "phone", "role", "address", "joiningDate", "status"]
      : ["id", "password", "name", "email", "phone", "role", "address", "joiningDate", "status"];

    if (requiredPartnerFields.some((field) => !String(partnerForm[field]).trim())) {
      alert("Please fill all partner details.");
      return;
    }
    try {
      if (editingPartnerId) {
        await updateAdminPartner(editingPartnerId, partnerForm);
      } else {
        await addPartner(partnerForm);
      }
      setPartnerForm({
        id: "",
        password: "",
        name: "",
        email: "",
        phone: "",
        role: "",
        address: "",
        joiningDate: "2025-01-01",
        status: "ACTIVE"
      });
      setEditingPartnerId(null);
      setError("");
    } catch (err) {
      setError(err?.message || "Unable to add partner right now.");
    }
  };

  const handlePartnerEdit = (partner) => {
    setEditingPartnerId(partner.userId);
    setPartnerForm({
      id: partner.id,
      password: "",
      name: partner.name,
      email: partner.email || "",
      phone: partner.phone,
      role: partner.role,
      address: partner.address,
      joiningDate: partner.joiningDate || "2025-01-01",
      status: partner.status?.toUpperCase().replaceAll(" ", "_") || "ACTIVE"
    });
  };

  const handlePartnerDelete = async (partnerId) => {
    try {
      await deleteAdminPartner(partnerId);
      if (editingPartnerId === partnerId) {
        setEditingPartnerId(null);
        setPartnerForm({
          id: "",
          password: "",
          name: "",
          email: "",
          phone: "",
          role: "",
          address: "",
          joiningDate: "2025-01-01",
          status: "ACTIVE"
        });
      }
      setError("");
    } catch (err) {
      setError(err?.message || "Unable to delete partner right now.");
    }
  };

  const handleServiceSubmit = async (event) => {
    event.preventDefault();
    if (Object.values(serviceForm).some((value) => !String(value).trim())) {
      setError("Please fill all service details.");
      return;
    }

    try {
      if (editingServiceId) {
        await updateAdminService(editingServiceId, serviceForm);
      } else {
        await createAdminService(serviceForm);
      }

      setServiceForm({
        name: "",
        category: "NURSING",
        description: "",
        price: ""
      });
      setEditingServiceId(null);
      setError("");
    } catch (err) {
      setError(err?.message || "Unable to save service right now.");
    }
  };

  const handleServiceEdit = (service) => {
    setEditingServiceId(service.id);
    setServiceForm({
      name: service.name,
      category: service.category,
      description: service.description,
      price: String(service.price)
    });
  };

  const handleServiceDelete = async (serviceId) => {
    try {
      await deleteAdminService(serviceId);
      if (editingServiceId === serviceId) {
        setEditingServiceId(null);
        setServiceForm({
          name: "",
          category: "NURSING",
          description: "",
          price: ""
        });
      }
      setError("");
    } catch (err) {
      setError(err?.message || "Unable to delete service right now.");
    }
  };

  if (!admin) {
    return (
      <div style={pageStyle}>
        <div style={loginCard}>
          <Link to="/" style={backLink}>Back to Home</Link>
          <p style={eyebrow}>Admin Access</p>
          <h1 style={title}>Admin Panel Login</h1>
          <p style={subtitle}>Use admin credentials to manage partners and bookings.</p>
          <form onSubmit={handleAdminLogin} style={{ display: "grid", gap: "16px", marginTop: "22px" }}>
            <label style={labelStyle}>
              Email or Phone
              <input value={credentials.username} onChange={(event) => setCredentials((prev) => ({ ...prev, username: event.target.value }))} style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Password
              <input type="password" value={credentials.password} onChange={(event) => setCredentials((prev) => ({ ...prev, password: event.target.value }))} style={inputStyle} />
            </label>
            {error ? <p style={{ margin: 0, color: "#ef4444" }}>{error}</p> : null}
            <button type="submit" style={primaryButton} disabled={isLoggingIn}>{isLoggingIn ? "Checking access..." : "Login to Admin Panel"}</button>
          </form>
          <div style={hintBox}>
            <strong>Admin login</strong>
            <span>Use your company administrator credentials to manage employees, services, and live bookings.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle} className="page-padding">
      <div style={shellStyle}>
        <div style={topBar}>
          <div>
            <p style={eyebrow}>Admin Dashboard</p>
            <h1 style={title}>Control Center</h1>
            <p style={subtitle}>Manage partners, monitor service bookings, and assign work.</p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link to="/" style={secondaryLink}>Home</Link>
            <button type="button" onClick={logout} style={dangerButton}>Logout</button>
          </div>
        </div>

        <div style={statsGrid}>
          <StatCard label="Partners" value={stats.totalPartners} />
          <StatCard label="Total Bookings" value={stats.totalBookings} />
          <StatCard label="Assigned" value={stats.assigned} />
          <StatCard label="Completed" value={stats.completed} />
        </div>

        <section style={{ ...panelStyle, marginTop: "22px" }}>
          <h2 style={panelTitle}>Attendance Overview</h2>
          <p style={{ margin: "10px 0 0", color: "#5b6878", lineHeight: 1.7 }}>
            Employee attendance stores one row per day per employee with check-in and check-out timestamps to keep storage usage minimal.
          </p>
          <div style={{ display: "grid", gap: "14px", marginTop: "18px" }}>
            {attendance.length ? attendance.slice(0, 8).map((item) => (
              <div key={item.attendanceId} style={miniCard}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, color: "#102542" }}>{item.partnerName}</h3>
                  <p style={{ margin: "6px 0 0", color: "#5b6878" }}>{item.employeeId} | {formatAttendanceDate(item.attendanceDate)}</p>
                </div>
                <div style={{ display: "grid", gap: "6px", justifyItems: "end", color: "#475569" }}>
                  <span>In: {item.checkInAt ? formatDateTime(item.checkInAt) : "--"}</span>
                  <span>Out: {item.checkOutAt ? formatDateTime(item.checkOutAt) : "Pending"}</span>
                </div>
              </div>
            )) : (
              <EmptyStateCard
                title="No attendance marked yet"
                message="Partner attendance entries will appear here after employees check in from their dashboard."
              />
            )}
          </div>
        </section>

        <div style={dashboardGrid} className="admin-dashboard-grid">
          <section style={panelStyle}>
            <h2 style={panelTitle}>{editingPartnerId ? "Edit Partner" : "Add New Partner"}</h2>
            <form onSubmit={handleAddPartner} style={{ display: "grid", gap: "14px", marginTop: "18px" }}>
              {[
                ["Employee ID", "id"],
                ["Password", "password"],
                ["Full Name", "name"],
                ["Email", "email"],
                ["Phone", "phone"],
                ["Role", "role"],
                ["Address", "address"],
                ["Joining Date", "joiningDate"]
              ].map(([label, field]) => (
                <label key={field} style={labelStyle}>
                  {label}
                  <input
                    type={field === "joiningDate" ? "date" : field === "password" ? "password" : "text"}
                    value={partnerForm[field]}
                    onChange={(event) => setPartnerForm((prev) => ({ ...prev, [field]: event.target.value }))}
                    style={inputStyle}
                  />
                </label>
              ))}
              <label style={labelStyle}>
                Status
                <select
                  value={partnerForm.status}
                  onChange={(event) => setPartnerForm((prev) => ({ ...prev, status: event.target.value }))}
                  style={inputStyle}
                >
                  {["ACTIVE", "INACTIVE", "ONLINE", "OFFLINE"].map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </label>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button type="submit" style={primaryButton}>{editingPartnerId ? "Update Partner" : "Add Partner"}</button>
                {editingPartnerId ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPartnerId(null);
                      setPartnerForm({
                        id: "",
                        password: "",
                        name: "",
                        email: "",
                        phone: "",
                        role: "",
                        address: "",
                        joiningDate: "2025-01-01",
                        status: "ACTIVE"
                      });
                    }}
                    style={secondaryGhostButton}
                  >
                    Cancel Edit
                  </button>
                ) : null}
              </div>
            </form>
          </section>

          <section style={panelStyle}>
            <h2 style={panelTitle}>Partner Team</h2>
            <div style={{ display: "grid", gap: "14px", marginTop: "18px" }}>
              {partners.length ? (
                partners.map((partnerItem) => (
                  <div key={partnerItem.userId || partnerItem.id} style={miniCard}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, color: "#102542" }}>{partnerItem.name}</h3>
                      <p style={{ margin: "6px 0 0", color: "#5b6878" }}>{partnerItem.role} | {partnerItem.id}</p>
                      <p style={{ margin: "6px 0 0", color: "#5b6878" }}>{partnerItem.phone}</p>
                    </div>
                    <div style={{ display: "grid", gap: "10px", justifyItems: "end" }}>
                      <span style={{ color: partnerItem.status === "Online" || partnerItem.status === "Active" ? "#0f8f86" : "#ef4444", fontWeight: 700 }}>
                        {partnerItem.status}
                      </span>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <button type="button" onClick={() => handlePartnerEdit(partnerItem)} style={secondaryGhostButton}>Edit</button>
                        <button type="button" onClick={() => handlePartnerDelete(partnerItem.userId)} style={dangerButton}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyStateCard
                  title="No employees added yet"
                  message="Create your first employee account from the form to enable staff access and booking assignment."
                />
              )}
            </div>
          </section>
        </div>

        <div style={dashboardGrid} className="admin-dashboard-grid">
          <section style={panelStyle}>
            <h2 style={panelTitle}>{editingServiceId ? "Edit Service" : "Add New Service"}</h2>
            <form onSubmit={handleServiceSubmit} style={{ display: "grid", gap: "14px", marginTop: "18px" }}>
              <label style={labelStyle}>
                Service Name
                <input
                  value={serviceForm.name}
                  onChange={(event) => setServiceForm((prev) => ({ ...prev, name: event.target.value }))}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                Category
                <select
                  value={serviceForm.category}
                  onChange={(event) => setServiceForm((prev) => ({ ...prev, category: event.target.value }))}
                  style={inputStyle}
                >
                  {["NURSING", "THERAPY", "COUNSELLING"].map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label style={labelStyle}>
                Description
                <textarea
                  value={serviceForm.description}
                  onChange={(event) => setServiceForm((prev) => ({ ...prev, description: event.target.value }))}
                  style={textareaStyle}
                />
              </label>
              <label style={labelStyle}>
                Price
                <input
                  type="number"
                  min="1"
                  value={serviceForm.price}
                  onChange={(event) => setServiceForm((prev) => ({ ...prev, price: event.target.value }))}
                  style={inputStyle}
                />
              </label>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button type="submit" style={primaryButton}>
                  {editingServiceId ? "Update Service" : "Add Service"}
                </button>
                {editingServiceId ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingServiceId(null);
                      setServiceForm({
                        name: "",
                        category: "NURSING",
                        description: "",
                        price: ""
                      });
                    }}
                    style={secondaryGhostButton}
                  >
                    Cancel Edit
                  </button>
                ) : null}
              </div>
            </form>
          </section>

          <section style={panelStyle}>
            <h2 style={panelTitle}>Service Catalogue</h2>
            <div style={{ display: "grid", gap: "14px", marginTop: "18px" }}>
              {services.length ? (
                services.map((service) => (
                  <div key={service.id} style={miniCard}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, color: "#102542" }}>{service.name}</h3>
                      <p style={{ margin: "6px 0 0", color: "#5b6878" }}>{formatCategoryLabel(service.category)} | Rs. {service.price}</p>
                      <p style={{ margin: "6px 0 0", color: "#5b6878", lineHeight: 1.6 }}>{service.description}</p>
                    </div>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button type="button" onClick={() => handleServiceEdit(service)} style={secondaryGhostButton}>Edit</button>
                      <button type="button" onClick={() => handleServiceDelete(service.id)} style={dangerButton}>Delete</button>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyStateCard
                  title="No services available yet"
                  message="Add your first live service to start taking customer bookings from the website."
                />
              )}
            </div>
          </section>
        </div>

        <section style={{ ...panelStyle, marginTop: "22px" }}>
          <h2 style={panelTitle}>Booking Management</h2>
          {loading ? <p style={{ margin: "18px 0 0", color: "#5b6878" }}>Loading latest dashboard data...</p> : null}
          <div style={filterBar}>
            <label style={compactLabel}>
              Booking Status
              <select value={bookingStatusFilter} onChange={(event) => setBookingStatusFilter(event.target.value)} style={inputStyle}>
                <option value="ALL">All bookings</option>
                {["PENDING_PAYMENT", "PENDING_ASSIGNMENT", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "REJECTED"].map((status) => (
                  <option key={status} value={status}>{formatCategoryLabel(status)}</option>
                ))}
              </select>
            </label>
            <label style={compactLabel}>
              Payment Status
              <select value={paymentStatusFilter} onChange={(event) => setPaymentStatusFilter(event.target.value)} style={inputStyle}>
                <option value="ALL">All payments</option>
                {["PENDING", "SUCCESS", "FAILED", "REFUNDED"].map((status) => (
                  <option key={status} value={status}>{formatCategoryLabel(status)}</option>
                ))}
              </select>
            </label>
            <label style={compactLabel}>
              Search Booking
              <input
                value={bookingSearch}
                onChange={(event) => setBookingSearch(event.target.value)}
                placeholder="Customer, service, partner, booking ID"
                style={inputStyle}
              />
            </label>
          </div>
          <div style={{ display: "grid", gap: "14px", marginTop: "18px" }}>
            {filteredBookings.length ? (
              filteredBookings.map((booking) => (
                <div key={booking.id} style={bookingCard}>
                  <div>
                    <h3 style={{ margin: 0, color: "#102542" }}>{booking.service}</h3>
                    <p style={{ margin: "8px 0 0", color: "#5b6878" }}>{booking.customer} | {booking.address}</p>
                    <p style={{ margin: "6px 0 0", color: "#5b6878" }}>{booking.date}</p>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
                      <span style={getStatusBadgeStyle(booking.status, "booking")}>{booking.status}</span>
                      <span style={getStatusBadgeStyle(booking.paymentStatus, "payment")}>
                        Payment: {formatCategoryLabel(booking.paymentStatus)}
                      </span>
                      {booking.totalAmount ? (
                        <span style={amountBadge}>Rs. {booking.totalAmount}</span>
                      ) : null}
                    </div>
                    {booking.partnerName ? (
                      <p style={{ margin: "8px 0 0", color: "#5b6878" }}>
                        Assigned to: {booking.partnerName}{booking.partnerEmployeeId ? ` (${booking.partnerEmployeeId})` : ""}
                      </p>
                    ) : null}
                    {!partners.length ? (
                      <p style={{ margin: "8px 0 0", color: "#b45309", fontWeight: 700 }}>
                        Add an employee account before assigning this booking.
                      </p>
                    ) : null}
                  </div>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                    <select
                      value={booking.partnerId || ""}
                      onChange={(event) => assignAdminBooking(booking.id, event.target.value)}
                      style={selectStyle}
                      disabled={!partners.length}
                    >
                      <option value="" disabled>{partners.length ? "Select partner" : "No employees available"}</option>
                      {partners.map((partnerItem) => (
                        <option key={partnerItem.userId || partnerItem.id} value={partnerItem.userId}>
                          {partnerItem.name} ({partnerItem.id})
                        </option>
                      ))}
                    </select>
                    <select
                      value={booking.status}
                      onChange={(event) => updateAdminBookingStatus(booking.id, event.target.value)}
                      style={selectStyle}
                    >
                      {["Pending Payment", "Pending Assignment", "Assigned", "Accepted", "In Progress", "Completed", "Cancelled", "Rejected"].map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))
            ) : bookings.length ? (
              <EmptyStateCard
                title="No bookings match the current filters"
                message="Try changing status filters or search terms to view more bookings."
              />
            ) : (
              <EmptyStateCard
                title="No customer bookings yet"
                message="Bookings will appear here after customers register, choose services, and complete payment."
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function formatDateTime(value) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit"
  });
}

function formatAttendanceDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function StatCard({ label, value }) {
  return (
    <div style={{ background: "#ffffff", borderRadius: "22px", padding: "22px", boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)" }}>
      <div style={{ color: "#667085", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "13px", fontWeight: 700 }}>{label}</div>
      <div style={{ marginTop: "12px", color: "#102542", fontSize: "34px", fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function EmptyStateCard({ title, message }) {
  return (
    <div style={emptyStateCard}>
      <h3 style={{ margin: 0, color: "#102542", fontSize: "22px" }}>{title}</h3>
      <p style={{ margin: "10px 0 0", color: "#5b6878", lineHeight: 1.6 }}>{message}</p>
    </div>
  );
}

function formatCategoryLabel(category) {
  return String(category || "")
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getStatusBadgeStyle(value, kind = "booking") {
  const normalized = String(value || "").toUpperCase();

  if (kind === "payment") {
    if (normalized === "SUCCESS") {
      return {
        ...badgeBase,
        background: "#dcfce7",
        color: "#166534"
      };
    }

    if (normalized === "FAILED" || normalized === "REFUNDED") {
      return {
        ...badgeBase,
        background: "#fee2e2",
        color: "#b91c1c"
      };
    }

    return {
      ...badgeBase,
      background: "#fef3c7",
      color: "#92400e"
    };
  }

  if (normalized === "COMPLETED") {
    return {
      ...badgeBase,
      background: "#dcfce7",
      color: "#166534"
    };
  }

  if (normalized === "CANCELLED" || normalized === "REJECTED") {
    return {
      ...badgeBase,
      background: "#fee2e2",
      color: "#b91c1c"
    };
  }

  if (normalized === "ASSIGNED" || normalized === "ACCEPTED" || normalized === "IN_PROGRESS") {
    return {
      ...badgeBase,
      background: "#dbeafe",
      color: "#1d4ed8"
    };
  }

  return {
    ...badgeBase,
    background: "#ecfffb",
    color: "#0f766e"
  };
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f6f8fb",
  padding: "32px 24px",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
};

const shellStyle = {
  maxWidth: "1260px",
  margin: "0 auto"
};

const topBar = {
  display: "flex",
  justifyContent: "space-between",
  gap: "18px",
  flexWrap: "wrap",
  alignItems: "flex-start",
  marginBottom: "22px"
};

const loginCard = {
  width: "100%",
  maxWidth: "520px",
  margin: "60px auto",
  background: "#ffffff",
  borderRadius: "30px",
  padding: "30px",
  boxShadow: "0 24px 60px rgba(4, 20, 38, 0.14)"
};

const eyebrow = {
  margin: 0,
  color: "#1cb5ac",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontSize: "13px",
  fontWeight: 700
};

const title = {
  margin: "12px 0 0",
  fontSize: "clamp(2rem, 4vw, 3rem)",
  color: "#102542"
};

const subtitle = {
  margin: "12px 0 0",
  color: "#5b6878",
  lineHeight: 1.7
};

const backLink = {
  display: "inline-flex",
  textDecoration: "none",
  color: "#102542",
  fontWeight: 700
};

const labelStyle = {
  display: "grid",
  gap: "8px",
  color: "#334155",
  fontWeight: 600
};

const inputStyle = {
  minHeight: "48px",
  borderRadius: "14px",
  border: "1px solid #d7e3ef",
  padding: "0 14px",
  fontSize: "15px"
};

const textareaStyle = {
  minHeight: "120px",
  borderRadius: "14px",
  border: "1px solid #d7e3ef",
  padding: "14px",
  fontSize: "15px",
  resize: "vertical"
};

const primaryButton = {
  border: "none",
  borderRadius: "14px",
  background: "#1cb5ac",
  color: "#ffffff",
  padding: "14px 18px",
  fontWeight: 700,
  cursor: "pointer"
};

const secondaryLink = {
  display: "inline-flex",
  textDecoration: "none",
  background: "#102542",
  color: "#ffffff",
  padding: "12px 16px",
  borderRadius: "12px",
  fontWeight: 700
};

const dangerButton = {
  border: "none",
  borderRadius: "12px",
  background: "#ef4444",
  color: "#ffffff",
  padding: "12px 16px",
  fontWeight: 700,
  cursor: "pointer"
};

const secondaryGhostButton = {
  border: "1px solid #cbd5e1",
  borderRadius: "12px",
  background: "#ffffff",
  color: "#102542",
  padding: "12px 16px",
  fontWeight: 700,
  cursor: "pointer"
};

const hintBox = {
  marginTop: "24px",
  padding: "16px",
  borderRadius: "18px",
  background: "#f8fbff",
  color: "#475569",
  display: "grid",
  gap: "8px"
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "16px"
};

const dashboardGrid = {
  display: "grid",
  gridTemplateColumns: "minmax(280px, 0.9fr) minmax(320px, 1.1fr)",
  gap: "22px",
  marginTop: "22px"
};

const filterBar = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "14px",
  marginTop: "18px"
};

const panelStyle = {
  background: "#ffffff",
  borderRadius: "26px",
  padding: "24px",
  boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)"
};

const panelTitle = {
  margin: 0,
  fontSize: "28px",
  color: "#102542"
};

const compactLabel = {
  display: "grid",
  gap: "8px",
  color: "#334155",
  fontWeight: 700
};

const miniCard = {
  background: "#f8fbff",
  borderRadius: "18px",
  padding: "16px",
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "flex-start"
};

const emptyStateCard = {
  background: "#f8fbff",
  borderRadius: "18px",
  padding: "22px",
  border: "1px dashed #cbd5e1"
};

const badgeBase = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: "999px",
  padding: "7px 12px",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.02em"
};

const amountBadge = {
  ...badgeBase,
  background: "#f1f5f9",
  color: "#334155"
};

const bookingCard = {
  background: "#f8fbff",
  borderRadius: "20px",
  padding: "18px",
  display: "flex",
  justifyContent: "space-between",
  gap: "14px",
  flexWrap: "wrap",
  alignItems: "center"
};

const selectStyle = {
  minHeight: "44px",
  borderRadius: "12px",
  border: "1px solid #d7e3ef",
  padding: "0 12px",
  background: "#ffffff"
};

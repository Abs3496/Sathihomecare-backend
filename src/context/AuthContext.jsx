import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { API_BASE_URL, apiFetch, authFetch } from "../api";
import {
  createStoredSession,
  isTokenExpired,
  readStoredSession
} from "../utils/authSession";

const AuthContext = createContext();

const STORAGE_KEY = "sathi-auth-session";
const PARTNERS_KEY = "sathi-partners";

const initialPartners = [];

const defaultSession = {
  token: null,
  partner: null,
  admin: null
};

function hasStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizeService(response) {
  return {
    id: response.id,
    name: response.name,
    category: response.category,
    description: response.description,
    price: Number(response.price || 0)
  };
}

function normalizePartner(response) {
  return {
    userId: response.userId,
    profileId: response.profileId,
    id: response.employeeId,
    employeeId: response.employeeId,
    name: response.fullName,
    email: response.email,
    phone: response.phone,
    role: response.professionalRole,
    address: response.address,
    joiningDate: response.joiningDate,
    status: formatStatusLabel(response.status)
  };
}

function formatStatusLabel(status) {
  if (!status) return "";
  return String(status)
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatBookingDate(dateString) {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit"
    });
  } catch {
    return dateString;
  }
}

function normalizeBooking(response, customerEmail = "") {
  return {
    id: response.id,
    bookingCode: response.bookingCode || (response.id ? `SHC-${response.id}` : ""),
    customer: response.customerName || "",
    customerEmail: response.customerEmail || customerEmail,
    customerMobile: response.customerMobile || "",
    service: response.serviceName || "",
    address: response.fullAddress || "",
    date: response.preferredDate || formatBookingDate(response.bookingDateTime),
    preferredDate: response.preferredDate || "",
    preferredTimeSlot: response.preferredTimeSlot || "",
    status: formatStatusLabel(response.bookingStatus),
    rawStatus: response.bookingStatus || "",
    totalAmount: Number(response.totalAmount || 0),
    serviceId: response.serviceId,
    patientName: response.patientName || "",
    patientPhone: response.patientPhone || "",
    patientAge: response.patientAge?.toString?.() || "",
    patientGender: response.patientGender || "",
    patientIssues: response.patientIssues || "",
    additionalNotes: response.additionalNotes || "",
    partnerId: response.partnerId,
    partnerName: response.partnerName || "",
    partnerEmployeeId: response.partnerEmployeeId || ""
  };
}

function sanitizeStoredPartners(raw) {
  if (!raw) return initialPartners;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return initialPartners;

    return parsed.filter((partner) => !partner?.password);
  } catch {
    return initialPartners;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    if (!hasStorage()) return defaultSession;
    const raw = localStorage.getItem(STORAGE_KEY);
    return readStoredSession(raw, defaultSession);
  });
  const [isSessionReady, setIsSessionReady] = useState(false);
  const initialTokenRef = useRef(session.token);

  const [partners, setPartners] = useState(() => {
    if (!hasStorage()) return initialPartners;
    const raw = localStorage.getItem(PARTNERS_KEY);
    return sanitizeStoredPartners(raw);
  });

  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const logout = useCallback(() => {
    setSession(defaultSession);
    setBookings([]);
    setAttendance([]);
    if (hasStorage()) localStorage.removeItem(STORAGE_KEY);
  }, []);

  const normalizeSessionFromAuthResponse = useCallback((response) => {
    if (!response?.token) {
      throw new Error("Session refresh failed.");
    }

    if (response.role === "PARTNER") {
      return {
        token: response.token,
        partner: {
          id: response.employeeId,
          employeeId: response.employeeId,
          name: response.fullName,
          email: response.email,
          phone: response.phone,
          role: response.role
        },
        admin: null
      };
    }

    return {
      token: response.token,
      partner: null,
      admin: {
        id: response.userId,
        name: response.fullName,
        email: response.email,
        phone: response.phone
      }
    };
  }, []);

  const refreshAuthSession = useCallback(async (token) => {
    if (!token) return null;

    try {
      const response = await authFetch(token, "/auth/refresh", {
        method: "POST"
      });
      const nextSession = normalizeSessionFromAuthResponse(response);
      setSession(nextSession);
      return nextSession;
    } catch (error) {
      if (error?.status === 401 || error?.status === 403) {
        logout();
        return null;
      }
      throw error;
    }
  }, [logout, normalizeSessionFromAuthResponse]);

  useEffect(() => {
    if (session?.token) {
      if (hasStorage()) localStorage.setItem(STORAGE_KEY, JSON.stringify(createStoredSession(session)));
    } else {
      if (hasStorage()) localStorage.removeItem(STORAGE_KEY);
    }
  }, [session]);

  useEffect(() => {
    if (hasStorage()) localStorage.setItem(PARTNERS_KEY, JSON.stringify(partners));
  }, [partners]);

  useEffect(() => {
    const initialToken = initialTokenRef.current;

    if (!initialToken) {
      setIsSessionReady(true);
      return undefined;
    }

    if (isTokenExpired(initialToken)) {
      logout();
      setIsSessionReady(true);
      return undefined;
    }

    let active = true;

    const validateStoredSession = async () => {
      setIsSessionReady(false);

      try {
        await refreshAuthSession(initialToken);
      } catch {
        if (!active) return;
        logout();
      } finally {
        if (active) {
          setIsSessionReady(true);
        }
      }
    };

    validateStoredSession();

    return () => {
      active = false;
    };
  }, [logout, refreshAuthSession]);

  useEffect(() => {
    if (!session?.token) return undefined;

    const expiry = createStoredSession(session).expiresAt;
    if (!expiry) return undefined;

    const timeoutId = window.setTimeout(() => {
      logout();
    }, Math.max(0, expiry - Date.now()));

    return () => window.clearTimeout(timeoutId);
  }, [logout, session]);

  useEffect(() => {
    if (!session?.token) return undefined;

    const intervalId = window.setInterval(() => {
      refreshAuthSession(session.token).catch((error) => {
        console.warn("Unable to refresh auth session", error);
      });
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, [refreshAuthSession, session?.token]);

  const loginPartner = async ({ employeeId, password }) => {
    const identifier = String(employeeId || "").trim();
    const response = await apiFetch("/auth/login/partner", {
      method: "POST",
      body: JSON.stringify({ employeeId: identifier, password })
    });

    const nextSession = normalizeSessionFromAuthResponse(response);
    setSession(nextSession);
    setBookings([]);
    setAttendance([]);
    return nextSession.partner;
  };

  const loginAdmin = async ({ username, password }) => {
    const identifier = String(username || "").trim();
    const response = await apiFetch("/auth/login/admin", {
      method: "POST",
      body: JSON.stringify({ emailOrPhone: identifier, password })
    });

    const nextSession = normalizeSessionFromAuthResponse(response);
    setSession(nextSession);
    setBookings([]);
    setAttendance([]);
    return nextSession.admin;
  };

  const fetchAdminPartners = useCallback(async (token = session.token) => {
    if (!token) return [];

    const response = await authFetch(token, "/admin/partners");
    const normalized = response.map(normalizePartner);
    setPartners(normalized);
    return normalized;
  }, [session.token]);

  const fetchAdminBookings = useCallback(async (token = session.token) => {
    if (!token) return [];

    const response = await authFetch(token, "/admin/bookings");
    const normalized = response.map((item) => normalizeBooking(item, item.customerEmail || ""));
    setBookings(normalized);
    return normalized;
  }, [session.token]);

  const fetchAdminServices = useCallback(async () => {
    const response = await apiFetch("/services");
    const normalized = response.map(normalizeService);
    setServices(normalized);
    return normalized;
  }, []);

  const createAdminPartner = async (partnerForm) => {
    if (!session.token) {
      throw new Error("Please login as admin before adding a partner.");
    }

    const payload = {
      employeeId: partnerForm.id,
      fullName: partnerForm.name,
      email: partnerForm.email,
      phone: partnerForm.phone,
      password: partnerForm.password,
      professionalRole: partnerForm.role,
      address: partnerForm.address,
      joiningDate: partnerForm.joiningDate
    };

    const response = await authFetch(session.token, "/admin/partners", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const normalized = normalizePartner(response);
    setPartners((prev) => [normalized, ...prev]);
    return normalized;
  };

  const updateAdminPartner = async (partnerId, partnerForm) => {
    if (!session.token) {
      throw new Error("Please login as admin before updating a partner.");
    }

    const existingPartner = partners.find((item) => (item.userId || item.id) === partnerId);
    const payload = {
      employeeId: partnerForm.id,
      fullName: partnerForm.name,
      email: partnerForm.email,
      phone: partnerForm.phone,
      professionalRole: partnerForm.role,
      address: partnerForm.address,
      joiningDate: partnerForm.joiningDate,
      status: (partnerForm.status || existingPartner?.status || "ACTIVE").toUpperCase().replaceAll(" ", "_")
    };

    const response = await authFetch(session.token, `/admin/partners/${partnerId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });

    const normalized = normalizePartner(response);
    setPartners((prev) => prev.map((item) => ((item.userId || item.id) === partnerId ? normalized : item)));
    return normalized;
  };

  const deleteAdminPartner = async (partnerId) => {
    if (!session.token) {
      throw new Error("Please login as admin before deleting a partner.");
    }

    await authFetch(session.token, `/admin/partners/${partnerId}`, {
      method: "DELETE"
    });

    setPartners((prev) => prev.filter((item) => (item.userId || item.id) !== partnerId));
  };

  const createAdminService = async (serviceForm) => {
    if (!session.token) {
      throw new Error("Please login as admin before creating a service.");
    }

    const response = await authFetch(session.token, "/admin/services", {
      method: "POST",
      body: JSON.stringify({
        name: serviceForm.name,
        category: serviceForm.category,
        description: serviceForm.description,
        price: Number(serviceForm.price),
        active: true
      })
    });

    const normalized = normalizeService(response);
    setServices((prev) => [normalized, ...prev]);
    return normalized;
  };

  const updateAdminService = async (serviceId, serviceForm) => {
    if (!session.token) {
      throw new Error("Please login as admin before updating a service.");
    }

    const response = await authFetch(session.token, `/admin/services/${serviceId}`, {
      method: "PUT",
      body: JSON.stringify({
        name: serviceForm.name,
        category: serviceForm.category,
        description: serviceForm.description,
        price: Number(serviceForm.price),
        active: true
      })
    });

    const normalized = normalizeService(response);
    setServices((prev) => prev.map((service) => (service.id === serviceId ? normalized : service)));
    return normalized;
  };

  const deleteAdminService = async (serviceId) => {
    if (!session.token) {
      throw new Error("Please login as admin before deleting a service.");
    }

    await authFetch(session.token, `/admin/services/${serviceId}`, {
      method: "DELETE"
    });

    setServices((prev) => prev.filter((service) => service.id !== serviceId));
  };

  const assignAdminBooking = async (bookingId, partnerUserId) => {
    if (!session.token) {
      throw new Error("Please login as admin before assigning a booking.");
    }

    const response = await authFetch(
      session.token,
      `/admin/bookings/${bookingId}/assign/${partnerUserId}`,
      { method: "PATCH" }
    );

    const normalized = normalizeBooking(response);
    setBookings((prev) => prev.map((booking) => (booking.id === bookingId ? normalized : booking)));
    return normalized;
  };

  const updateAdminBookingStatus = async (bookingId, status) => {
    if (!session.token) {
      throw new Error("Please login as admin before updating booking status.");
    }

    const apiStatus = String(status).toUpperCase().replaceAll(" ", "_");
    const response = await authFetch(
      session.token,
      `/admin/bookings/${bookingId}/status/${apiStatus}`,
      { method: "PATCH" }
    );

    const normalized = normalizeBooking(response);
    setBookings((prev) => prev.map((booking) => (booking.id === bookingId ? normalized : booking)));
    return normalized;
  };

  const downloadAdminReceipt = async (bookingId) => {
    if (!session.token) {
      throw new Error("Please login as admin before downloading receipts.");
    }

    const response = await fetch(`${API_BASE_URL}/admin/bookings/${bookingId}/receipt`, {
      headers: {
        Authorization: `Bearer ${session.token}`
      }
    });
    if (!response.ok) {
      throw new Error("Unable to download receipt.");
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `booking-${bookingId}-receipt.pdf`;
    link.click();
    URL.revokeObjectURL(objectUrl);
  };

  const createPublicBooking = async (booking) => {
    const response = await apiFetch("/bookings", {
      method: "POST",
      body: JSON.stringify({
        serviceId: booking.serviceId,
        patientName: booking.patientName,
        patientAge: Number(booking.patientAge),
        gender: booking.gender,
        mobileNumber: booking.mobileNumber,
        email: booking.email,
        address: booking.address,
        serviceType: booking.serviceType,
        preferredDate: booking.preferredDate,
        preferredTimeSlot: booking.preferredTimeSlot,
        additionalNotes: booking.additionalNotes || ""
      })
    });

    return normalizeBooking(response, booking.email);
  };

  const trackPublicBooking = async ({ bookingId, mobileNumber }) => {
    const params = new URLSearchParams({ bookingId, mobileNumber });
    const response = await apiFetch(`/bookings/track?${params.toString()}`);
    return normalizeBooking(response);
  };

  const getReceiptUrl = ({ bookingId, mobileNumber }) => {
    const params = new URLSearchParams({ bookingId, mobileNumber });
    return `${API_BASE_URL}/bookings/receipt?${params.toString()}`;
  };

  const fetchAdminAttendance = useCallback(async (token = session.token) => {
    if (!token) return [];

    const response = await authFetch(token, "/admin/attendance");
    setAttendance(response);
    return response;
  }, [session.token]);

  const fetchCurrentPartnerProfile = useCallback(async (token = session.token) => {
    if (!token) return null;

    const response = await authFetch(token, "/partner/me");
    const normalized = normalizePartner(response);
    setSession((prev) => ({
      ...prev,
      partner: {
        ...(prev.partner || {}),
        ...normalized
      }
    }));
    return normalized;
  }, [session.token]);

  const fetchPartnerBookings = useCallback(async (token = session.token) => {
    if (!token) return [];

    const response = await authFetch(token, "/partner/bookings");
    const normalized = response.map((item) => normalizeBooking(item, item.customerEmail || ""));
    setBookings(normalized);
    return normalized;
  }, [session.token]);

  const updatePartnerBookingStatus = async (bookingId, action) => {
    if (!session.token) {
      throw new Error("Please login as partner before updating booking status.");
    }

    const response = await authFetch(session.token, `/partner/bookings/${bookingId}/${action}`, {
      method: "PATCH"
    });

    const normalized = normalizeBooking(response);
    setBookings((prev) => prev.map((booking) => (booking.id === bookingId ? normalized : booking)));
    return normalized;
  };

  const fetchPartnerAttendance = useCallback(async (token = session.token) => {
    if (!token) return [];

    const response = await authFetch(token, "/partner/attendance");
    setAttendance(response);
    return response;
  }, [session.token]);

  const markPartnerAttendance = async (action) => {
    if (!session.token) {
      throw new Error("Please login as partner before updating attendance.");
    }

    const endpoint = action === "out" ? "/partner/attendance/check-out" : "/partner/attendance/check-in";
    const response = await authFetch(session.token, endpoint, {
      method: "POST"
    });
    await fetchPartnerAttendance(session.token);
    return response;
  };

  const updateBookingStatus = (id, status) => {
    setBookings((prev) => prev.map((booking) => (booking.id === id ? { ...booking, status } : booking)));
  };

  const assignBooking = (id, partnerId) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id ? { ...booking, assignedTo: partnerId, status: "Assigned" } : booking
      )
    );
  };

  const togglePartnerStatus = () => {
    if (!session.partner) return;
    const nextStatus = session.partner.status === "Online" ? "Offline" : "Online";

    setPartners((prev) =>
      prev.map((item) => (item.id === session.partner.id ? { ...item, status: nextStatus } : item))
    );

    setSession((prev) => ({
      ...prev,
      partner: {
        ...prev.partner,
        status: nextStatus
      }
    }));
  };

  const addPartner = (partner) => {
    return createAdminPartner(partner);
  };

  const value = {
    partner: session.partner,
    admin: session.admin,
    token: session.token,
    isSessionReady,
    partners,
    bookings,
    services,
    attendance,
    loginPartner,
    loginAdmin,
    logout,
    createPublicBooking,
    trackPublicBooking,
    getReceiptUrl,
    refreshAuthSession,
    fetchAdminPartners,
    fetchAdminBookings,
    fetchAdminServices,
    updateAdminPartner,
    deleteAdminPartner,
    createAdminService,
    updateAdminService,
    deleteAdminService,
    assignAdminBooking,
    updateAdminBookingStatus,
    downloadAdminReceipt,
    fetchAdminAttendance,
    fetchCurrentPartnerProfile,
    fetchPartnerBookings,
    updatePartnerBookingStatus,
    fetchPartnerAttendance,
    markPartnerAttendance,
    updateBookingStatus,
    assignBooking,
    togglePartnerStatus,
    addPartner
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };

import { createContext, useReducer, useState, useEffect, useContext, useMemo, useCallback } from "react";

import { customerReducer, initialState } from "../reducers/customerReducer";
import { API_BASE } from "../App";
import { AuthContext } from "../contexts/AuthContextValue";

// eslint-disable-next-line react-refresh/only-export-components
export const CustomerContext = createContext();

export function CustomerProvider({ children }) {
  const { token } = useContext(AuthContext);

  return (
    <CustomerStateProvider key={token ?? "logged-out"}>
      {children}
    </CustomerStateProvider>
  );
}

function CustomerStateProvider({ children }) {
  const { isAuthenticated, authenticatedFetch } = useContext(AuthContext);
  const [state, dispatch] = useReducer(customerReducer, initialState);
  const { customers, loading, error, submitting, showForm } = state;

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return customers.filter(
      (customer) =>
        (statusFilter === "all" || customer.status === statusFilter) &&
        [customer.firstName, customer.lastName, customer.email].some((value) =>
          (value ?? "").toLowerCase().includes(normalizedSearch),
        ),
    );
  }, [customers, searchTerm, statusFilter]);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    const controller = new AbortController();

    const loadCustomers = async () => {
      dispatch({ type: "FETCH_START" });

      try {
        const response = await authenticatedFetch(`${API_BASE}/customers`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load customers: ${response.status}`);
        }

        const data = await response.json();

        if (!controller.signal.aborted) {
          dispatch({ type: "FETCH_SUCCESS", payload: data });
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          dispatch({ type: "FETCH_ERROR", payload: err.message });
        }
      }
    };

    void loadCustomers();

    return () => controller.abort();
  }, [isAuthenticated, authenticatedFetch]);

  const addCustomer = useCallback(async (customerData) => {
    dispatch({ type: "ADD_START" });
    try {
      const response = await authenticatedFetch(`${API_BASE}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const createdCustomer = await response.json();
      dispatch({ type: "ADD_CUSTOMER", payload: createdCustomer });
      return createdCustomer;
    } catch (err) {
      dispatch({ type: "ADD_ERROR" });
      throw err;
    }
  }, [authenticatedFetch]);

  const updateCustomer = useCallback(async (customerId, updates) => {

    const response = await authenticatedFetch(
      `${API_BASE}/customers/${customerId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      },
    );
    if (!response.ok) {
      throw new Error(`Failed to update customer: ${response.status}`);
    }

    const updated = await response.json();
    dispatch({ type: "UPDATE_CUSTOMER", payload: updated });

  }, [authenticatedFetch]);

  const deleteCustomer = useCallback(async (customerId) => {
    if (!window.confirm("Are you sure you want to delete this customer?"))
      return;
    try {
      const response = await authenticatedFetch(
        `${API_BASE}/customers/${customerId}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      dispatch({ type: "DELETE_CUSTOMER", payload: customerId });
    } catch (err) {
      alert(`Failed to delete customer: ${err.message}`);
    }
  }, [authenticatedFetch]);

  const contextValue = useMemo(
  () => ({
    customers,
    filteredCustomers,
    loading,
    error,
    submitting,
    showForm,
    searchTerm,
    statusFilter,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    setSearchTerm,
    setStatusFilter,
  }),
  [
    customers,
    filteredCustomers,
    loading,
    error,
    submitting,
    showForm,
    searchTerm,
    statusFilter,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    setSearchTerm,
    setStatusFilter,
  ],
);

  return (
    <CustomerContext.Provider value={contextValue}>
      {children}
    </CustomerContext.Provider>
  );
}

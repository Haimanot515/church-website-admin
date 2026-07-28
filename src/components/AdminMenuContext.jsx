import React, { createContext, useContext, useState } from "react";

const AdminMenuContext = createContext(null);

export const AdminMenuProvider = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <AdminMenuContext.Provider value={{ mobileOpen, setMobileOpen }}>
      {children}
    </AdminMenuContext.Provider>
  );
};

export const useAdminMenu = () => {
  const ctx = useContext(AdminMenuContext);
  if (!ctx) throw new Error("useAdminMenu must be used inside AdminMenuProvider");
  return ctx;
};
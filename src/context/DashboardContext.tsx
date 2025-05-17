import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { Market, Product, Blocker, User } from "../types";

interface DashboardContextProps {
  user: User;
  products: Product[];
  blockers: Blocker[];
  getProductById: (id: string) => Product | undefined;
  getMarketById: (id: string) => Market | undefined;
  getAllMarkets: () => Market[];
}

const DashboardContext = createContext<DashboardContextProps | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [blockers, setBlockers] = useState<Blocker[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*');
      setProducts(data);
    };

    const fetchBlockers = async () => {
      const { data } = await supabase.from('blockers').select('*');
      setBlockers(data);
    };

    fetchUser();
    fetchProducts();
    fetchBlockers();
  }, []);

  const getProductById = (id: string) => products.find(product => product.id === id);
  const getMarketById = (id: string) => markets.find(market => market.id === id);
  const getAllMarkets = () => markets;

  return (
    <DashboardContext.Provider value={{ user, products, blockers, getProductById, getMarketById, getAllMarkets }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

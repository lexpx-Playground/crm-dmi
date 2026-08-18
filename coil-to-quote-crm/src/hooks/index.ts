// React hooks for Coil-to-Quote CRM
import { useState, useEffect, useCallback } from 'react';
import { supabase, getCurrentUser, onAuthStateChange } from '../lib/supabase';
import type { User, Settings, Client, Supplier, PurchaseOrder, Coil, ProductType, ProductPrice, AccessoryType } from '../types';

// Auth hook
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    const authListener = onAuthStateChange((session) => {
      if (session?.user) {
        getCurrentUser().then(setUser);
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.then(l => l.subscription.unsubscribe());
    };
  }, []);

  return { user, loading };
}

// Settings hook
export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();
      
      if (error) throw error;
      setSettings(data as Settings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = async (updates: Partial<Settings>) => {
    if (!settings) return;
    
    try {
      const { error } = await supabase
        .from('settings')
        .update(updates)
        .eq('id', settings.id);
      
      if (error) throw error;
      setSettings({ ...settings, ...updates });
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  return { settings, loading, updateSettings };
}

// Clients hook
export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const loadClients = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setClients(data as Client[]);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const createClient = async (client: Omit<Client, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert(client)
        .select()
        .single();
      
      if (error) throw error;
      setClients(prev => [...prev, data as Client]);
      return data;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  };

  const searchByPhone = async (phone: string): Promise<Client[]> => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .ilike('phone', `%${phone}%`);
      
      if (error) throw error;
      return data as Client[];
    } catch (error) {
      console.error('Error searching clients:', error);
      return [];
    }
  };

  return { clients, loading, createClient, searchByPhone, refresh: loadClients };
}

// Products hook
export function useProducts() {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [prices, setPrices] = useState<ProductPrice[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [typesResult, pricesResult] = await Promise.all([
        supabase.from('product_types').select('*'),
        supabase.from('product_prices').select('*'),
      ]);
      
      if (typesResult.error) throw typesResult.error;
      if (pricesResult.error) throw pricesResult.error;
      
      setProductTypes(typesResult.data as ProductType[]);
      setPrices(pricesResult.data as ProductPrice[]);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updatePrice = async (priceId: string, newPrice: number) => {
    try {
      const { error } = await supabase
        .from('product_prices')
        .update({ price_per_m2: newPrice })
        .eq('id', priceId);
      
      if (error) throw error;
      setPrices(prev => prev.map(p => p.id === priceId ? { ...p, price_per_m2: newPrice } : p));
    } catch (error) {
      console.error('Error updating price:', error);
      throw error;
    }
  };

  return { productTypes, prices, loading, updatePrice };
}

// Accessories hook
export function useAccessories() {
  const [accessories, setAccessories] = useState<AccessoryType[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAccessories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('accessory_types')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setAccessories(data as AccessoryType[]);
    } catch (error) {
      console.error('Error loading accessories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccessories();
  }, [loadAccessories]);

  return { accessories, loading };
}

// Suppliers hook
export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSuppliers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setSuppliers(data as Supplier[]);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const createSupplier = async (supplier: Omit<Supplier, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert(supplier)
        .select()
        .single();
      
      if (error) throw error;
      setSuppliers(prev => [...prev, data as Supplier]);
      return data;
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  };

  return { suppliers, loading, createSupplier };
}

// Purchase Orders hook
export function usePurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*, supplier:suppliers(name)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data as any);
    } catch (error) {
      console.error('Error loading purchase orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const createPO = async (po: Omit<PurchaseOrder, 'id' | 'created_at' | 'price_set_at'>) => {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .insert(po)
        .select()
        .single();
      
      if (error) throw error;
      setOrders(prev => [data as PurchaseOrder, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating PO:', error);
      throw error;
    }
  };

  const setPOPrice = async (poId: string, price: number, priceUnit: 'per_ton' | 'per_m2') => {
    try {
      const { error } = await supabase
        .from('purchase_orders')
        .update({ 
          price, 
          price_unit: priceUnit,
          price_set_at: new Date().toISOString(),
        })
        .eq('id', poId);
      
      if (error) throw error;
      setOrders(prev => prev.map(o => o.id === poId ? { ...o, price, price_unit: priceUnit, price_set_at: new Date().toISOString() } : o));
    } catch (error) {
      console.error('Error setting PO price:', error);
      throw error;
    }
  };

  return { orders, loading, createPO, setPOPrice, refresh: loadOrders };
}

// Coils hook
export function useCoils() {
  const [coils, setCoils] = useState<Coil[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCoils = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('coils')
        .select('*')
        .order('arrival_date', { ascending: false });
      
      if (error) throw error;
      setCoils(data as Coil[]);
    } catch (error) {
      console.error('Error loading coils:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoils();
  }, [loadCoils]);

  const updateCoilStatus = async (coilId: string, status: Coil['status'], updates?: Partial<Coil>) => {
    try {
      const updateData: any = { status, ...updates };
      if (status === 'arrived' && !updates?.arrival_date) {
        updateData.arrival_date = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('coils')
        .update(updateData)
        .eq('id', coilId);
      
      if (error) throw error;
      setCoils(prev => prev.map(c => c.id === coilId ? { ...c, ...updateData } : c));
    } catch (error) {
      console.error('Error updating coil:', error);
      throw error;
    }
  };

  return { coils, loading, updateCoilStatus, refresh: loadCoils };
}

// Role guard hook
export function useRoleGuard(requiredRoles: string[]) {
  const { user, loading } = useAuth();
  
  const hasAccess = user && requiredRoles.includes(user.role);
  
  return { hasAccess, loading, user };
}

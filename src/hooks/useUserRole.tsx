import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UserRole {
  isAdmin: boolean;
  isPrimaryAdmin: boolean;
  loading: boolean;
}

export const useUserRole = (): UserRole => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPrimaryAdmin, setIsPrimaryAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsPrimaryAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role, is_primary_admin")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (error) {
          console.error("Error fetching user role:", error);
          setIsAdmin(false);
          setIsPrimaryAdmin(false);
        } else if (data) {
          setIsAdmin(true);
          setIsPrimaryAdmin(data.is_primary_admin || false);
        } else {
          setIsAdmin(false);
          setIsPrimaryAdmin(false);
        }
      } catch (err) {
        console.error("Error:", err);
        setIsAdmin(false);
        setIsPrimaryAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  return { isAdmin, isPrimaryAdmin, loading };
};

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Shield, 
  Users, 
  Crown, 
  ArrowRight, 
  UserPlus, 
  UserMinus,
  Loader2,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserWithRole {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: "admin" | "user";
  is_primary_admin: boolean;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isPrimaryAdmin, loading: roleLoading } = useUserRole();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "promote" | "demote";
    user: UserWithRole | null;
  }>({ open: false, action: "promote", user: null });

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch profiles with their roles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        return {
          id: profile.id,
          user_id: profile.user_id,
          email: profile.email,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          role: (userRole?.role as "admin" | "user") || "user",
          is_primary_admin: userRole?.is_primary_admin || false,
          created_at: profile.created_at,
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "خطأ",
        description: "فشل في جلب قائمة المستخدمين",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToAdmin = async (targetUser: UserWithRole) => {
    if (!isPrimaryAdmin) {
      toast({
        title: "غير مصرح",
        description: "فقط الأدمن الأساسي يمكنه ترقية المستخدمين",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(targetUser.user_id);
    try {
      // Check if user already has a role entry
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", targetUser.user_id)
        .maybeSingle();

      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from("user_roles")
          .update({ role: "admin" })
          .eq("user_id", targetUser.user_id);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: targetUser.user_id, role: "admin" });

        if (error) throw error;
      }

      toast({
        title: "تم بنجاح",
        description: `تم ترقية ${targetUser.full_name || targetUser.email} إلى أدمن`,
      });
      
      fetchUsers();
    } catch (error) {
      console.error("Error promoting user:", error);
      toast({
        title: "خطأ",
        description: "فشل في ترقية المستخدم",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, action: "promote", user: null });
    }
  };

  const handleDemoteFromAdmin = async (targetUser: UserWithRole) => {
    if (!isPrimaryAdmin) {
      toast({
        title: "غير مصرح",
        description: "فقط الأدمن الأساسي يمكنه تخفيض صلاحيات المستخدمين",
        variant: "destructive",
      });
      return;
    }

    if (targetUser.is_primary_admin) {
      toast({
        title: "غير مسموح",
        description: "لا يمكن تخفيض صلاحيات الأدمن الأساسي",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(targetUser.user_id);
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: "user" })
        .eq("user_id", targetUser.user_id);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: `تم تخفيض صلاحيات ${targetUser.full_name || targetUser.email}`,
      });
      
      fetchUsers();
    } catch (error) {
      console.error("Error demoting user:", error);
      toast({
        title: "خطأ",
        description: "فشل في تخفيض صلاحيات المستخدم",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, action: "demote", user: null });
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-gold animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card rounded-none border-x-0 border-t-0">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-muted-foreground"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Shield className="w-6 h-6 text-gold" />
            <div>
              <h1 className="font-bold text-lg gold-text">لوحة التحكم</h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPrimaryAdmin && (
              <Badge className="bg-gold text-primary-foreground">
                <Crown className="w-3 h-3 ml-1" />
                أدمن أساسي
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-xs text-muted-foreground">إجمالي المستخدمين</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {users.filter((u) => u.role === "admin").length}
                  </p>
                  <p className="text-xs text-muted-foreground">الأدمن</p>
                </div>
              </div>
            </div>
          </div>

          {/* Users Management Section */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-gold" />
                إدارة المستخدمين
              </h2>

              <div className="relative w-full md:w-64">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="بحث..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-gold animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">المستخدم</TableHead>
                      <TableHead className="text-right">البريد</TableHead>
                      <TableHead className="text-right">الصلاحية</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border-2 border-gold/30">
                              <AvatarImage src={u.avatar_url || undefined} />
                              <AvatarFallback className="bg-gold/20 text-gold">
                                {u.full_name?.charAt(0) || u.email?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{u.full_name || "بدون اسم"}</p>
                              {u.is_primary_admin && (
                                <Badge variant="outline" className="text-gold border-gold text-xs">
                                  <Crown className="w-3 h-3 ml-1" />
                                  أساسي
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {u.email || "غير متوفر"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={u.role === "admin" ? "default" : "secondary"}
                            className={u.role === "admin" ? "bg-gold text-primary-foreground" : ""}
                          >
                            {u.role === "admin" ? "أدمن" : "مستخدم"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {isPrimaryAdmin && u.user_id !== user?.id && !u.is_primary_admin && (
                            <div className="flex items-center gap-2">
                              {u.role === "admin" ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setConfirmDialog({
                                      open: true,
                                      action: "demote",
                                      user: u,
                                    })
                                  }
                                  disabled={actionLoading === u.user_id}
                                  className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                                >
                                  {actionLoading === u.user_id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <UserMinus className="w-4 h-4 ml-1" />
                                      تخفيض
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setConfirmDialog({
                                      open: true,
                                      action: "promote",
                                      user: u,
                                    })
                                  }
                                  disabled={actionLoading === u.user_id}
                                  className="text-gold border-gold hover:bg-gold hover:text-primary-foreground"
                                >
                                  {actionLoading === u.user_id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <UserPlus className="w-4 h-4 ml-1" />
                                      ترقية
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          )}
                          {u.user_id === user?.id && (
                            <span className="text-xs text-muted-foreground">أنت</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    لا يوجد مستخدمين
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog({ ...confirmDialog, open })
        }
      >
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.action === "promote"
                ? "تأكيد الترقية"
                : "تأكيد التخفيض"}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.action === "promote"
                ? `هل أنت متأكد من ترقية ${confirmDialog.user?.full_name || confirmDialog.user?.email} إلى أدمن؟`
                : `هل أنت متأكد من تخفيض صلاحيات ${confirmDialog.user?.full_name || confirmDialog.user?.email}؟`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({ open: false, action: "promote", user: null })
              }
            >
              إلغاء
            </Button>
            <Button
              className={
                confirmDialog.action === "promote"
                  ? "bg-gold hover:bg-gold/90"
                  : "bg-destructive hover:bg-destructive/90"
              }
              onClick={() =>
                confirmDialog.user &&
                (confirmDialog.action === "promote"
                  ? handlePromoteToAdmin(confirmDialog.user)
                  : handleDemoteFromAdmin(confirmDialog.user))
              }
            >
              {confirmDialog.action === "promote" ? "ترقية" : "تخفيض"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;

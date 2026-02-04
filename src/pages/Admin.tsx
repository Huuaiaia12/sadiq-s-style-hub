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
  Search,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Check,
  X,
  Gift,
  Star,
  CalendarDays
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface UserWithRole {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: "admin" | "user";
  is_primary_admin: boolean;
  points: number;
  created_at: string;
}

interface TimeSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
}

interface Booking {
  id: string;
  user_id: string;
  time_slot_id: string;
  service_type: string;
  status: string;
  notes: string | null;
  points_awarded: number;
  created_at: string;
  time_slot?: TimeSlot;
  profile?: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isPrimaryAdmin, loading: roleLoading } = useUserRole();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "promote" | "demote";
    user: UserWithRole | null;
  }>({ open: false, action: "promote", user: null });
  
  const [addSlotDialog, setAddSlotDialog] = useState(false);
  const [newSlotDate, setNewSlotDate] = useState<Date>();
  const [newSlotTime, setNewSlotTime] = useState("");
  
  const [pointsDialog, setPointsDialog] = useState<{
    open: boolean;
    user: UserWithRole | null;
    points: number;
  }>({ open: false, user: null, points: 10 });

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
    }
  }, [isAdmin]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchTimeSlots(), fetchBookings()]);
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

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
          points: profile.points || 0,
          created_at: profile.created_at,
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const { data, error } = await supabase
        .from("time_slots")
        .select("*")
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;
      setTimeSlots(data || []);
    } catch (error) {
      console.error("Error fetching time slots:", error);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (bookingsError) throw bookingsError;

      // Fetch related data
      const slotIds = [...new Set(bookingsData?.map(b => b.time_slot_id) || [])];
      const userIds = [...new Set(bookingsData?.map(b => b.user_id) || [])];

      const [slotsRes, profilesRes] = await Promise.all([
        supabase.from("time_slots").select("*").in("id", slotIds),
        supabase.from("profiles").select("*").in("user_id", userIds)
      ]);

      const enrichedBookings = (bookingsData || []).map(booking => ({
        ...booking,
        time_slot: slotsRes.data?.find(s => s.id === booking.time_slot_id),
        profile: profilesRes.data?.find(p => p.user_id === booking.user_id)
      }));

      setBookings(enrichedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  // Time slot actions
  const handleAddTimeSlot = async () => {
    if (!newSlotDate || !newSlotTime) return;
    
    setActionLoading("add-slot");
    try {
      const [hours, minutes] = newSlotTime.split(':');
      const endHour = (parseInt(hours) + 1).toString().padStart(2, '0');
      
      const { error } = await supabase
        .from("time_slots")
        .insert({
          date: format(newSlotDate, 'yyyy-MM-dd'),
          start_time: `${newSlotTime}:00`,
          end_time: `${endHour}:${minutes}:00`,
          created_by: user?.id,
        });

      if (error) throw error;

      toast({ title: "تم", description: "تم إضافة الموعد بنجاح" });
      setAddSlotDialog(false);
      setNewSlotDate(undefined);
      setNewSlotTime("");
      fetchTimeSlots();
    } catch (error) {
      console.error("Error adding time slot:", error);
      toast({ title: "خطأ", description: "فشل في إضافة الموعد", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteTimeSlot = async (slotId: string) => {
    setActionLoading(slotId);
    try {
      const { error } = await supabase
        .from("time_slots")
        .delete()
        .eq("id", slotId);

      if (error) throw error;

      toast({ title: "تم", description: "تم حذف الموعد" });
      fetchTimeSlots();
    } catch (error) {
      console.error("Error deleting time slot:", error);
      toast({ title: "خطأ", description: "فشل في حذف الموعد", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  // Booking actions
  const handleUpdateBookingStatus = async (bookingId: string, status: string, userId?: string) => {
    setActionLoading(bookingId);
    try {
      const updateData: { status: string; points_awarded?: number } = { status };
      
      // If completing, award points
      if (status === "completed" && userId) {
        updateData.points_awarded = 10;
        
        // Award points to user
        const { error: pointsError } = await supabase.rpc('award_points', {
          p_user_id: userId,
          p_points: 10
        });
        
        if (pointsError) throw pointsError;
      }

      const { error } = await supabase
        .from("bookings")
        .update(updateData)
        .eq("id", bookingId);

      if (error) throw error;

      toast({ 
        title: "تم", 
        description: status === "completed" 
          ? "تم إكمال الحجز ومنح 10 نقاط" 
          : status === "approved" 
            ? "تم الموافقة على الحجز" 
            : "تم رفض الحجز" 
      });
      
      fetchBookings();
      fetchUsers();
    } catch (error) {
      console.error("Error updating booking:", error);
      toast({ title: "خطأ", description: "فشل في تحديث الحجز", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  // User role actions
  const handlePromoteToAdmin = async (targetUser: UserWithRole) => {
    if (!isPrimaryAdmin) return;
    
    setActionLoading(targetUser.user_id);
    try {
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", targetUser.user_id)
        .maybeSingle();

      if (existingRole) {
        await supabase.from("user_roles").update({ role: "admin" }).eq("user_id", targetUser.user_id);
      } else {
        await supabase.from("user_roles").insert({ user_id: targetUser.user_id, role: "admin" });
      }

      toast({ title: "تم", description: `تم ترقية ${targetUser.full_name || targetUser.email} إلى أدمن` });
      fetchUsers();
    } catch (error) {
      console.error("Error promoting user:", error);
      toast({ title: "خطأ", description: "فشل في ترقية المستخدم", variant: "destructive" });
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, action: "promote", user: null });
    }
  };

  const handleDemoteFromAdmin = async (targetUser: UserWithRole) => {
    if (!isPrimaryAdmin || targetUser.is_primary_admin) return;
    
    setActionLoading(targetUser.user_id);
    try {
      await supabase.from("user_roles").update({ role: "user" }).eq("user_id", targetUser.user_id);
      toast({ title: "تم", description: `تم تخفيض صلاحيات ${targetUser.full_name || targetUser.email}` });
      fetchUsers();
    } catch (error) {
      console.error("Error demoting user:", error);
      toast({ title: "خطأ", description: "فشل في تخفيض صلاحيات المستخدم", variant: "destructive" });
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, action: "demote", user: null });
    }
  };

  // Manual points
  const handleAwardPoints = async () => {
    if (!pointsDialog.user) return;
    
    setActionLoading("points");
    try {
      const { error } = await supabase.rpc('award_points', {
        p_user_id: pointsDialog.user.user_id,
        p_points: pointsDialog.points
      });

      if (error) throw error;

      toast({ 
        title: "تم", 
        description: `تم إضافة ${pointsDialog.points} نقطة لـ ${pointsDialog.user.full_name || pointsDialog.user.email}` 
      });
      
      setPointsDialog({ open: false, user: null, points: 10 });
      fetchUsers();
    } catch (error) {
      console.error("Error awarding points:", error);
      toast({ title: "خطأ", description: "فشل في إضافة النقاط", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'م' : 'ص';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes.substring(0,2)} ${ampm}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500">بانتظار</Badge>;
      case "approved":
        return <Badge variant="outline" className="text-blue-500 border-blue-500">مؤكد</Badge>;
      case "completed":
        return <Badge className="bg-green-500">مكتمل</Badge>;
      case "rejected":
        return <Badge variant="destructive">مرفوض</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-gold animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card rounded-none border-x-0 border-t-0">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Shield className="w-6 h-6 text-gold" />
            <div>
              <h1 className="font-bold text-lg gold-text">لوحة التحكم</h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>

          {isPrimaryAdmin && (
            <Badge className="bg-gold text-primary-foreground">
              <Crown className="w-3 h-3 ml-1" />
              أدمن أساسي
            </Badge>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-xs text-muted-foreground">المستخدمين</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{bookings.filter(b => b.status === "pending").length}</p>
                  <p className="text-xs text-muted-foreground">حجوزات معلقة</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{timeSlots.filter(s => s.is_available).length}</p>
                  <p className="text-xs text-muted-foreground">مواعيد متاحة</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{bookings.filter(b => b.status === "completed").length}</p>
                  <p className="text-xs text-muted-foreground">حجوزات مكتملة</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="bookings" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bookings">الحجوزات</TabsTrigger>
              <TabsTrigger value="slots">المواعيد</TabsTrigger>
              <TabsTrigger value="users">المستخدمين</TabsTrigger>
            </TabsList>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-gold" />
                إدارة الحجوزات
              </h2>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-gold animate-spin" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  لا توجد حجوزات
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">العميل</TableHead>
                        <TableHead className="text-right">الموعد</TableHead>
                        <TableHead className="text-right">الخدمة</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={booking.profile?.avatar_url || undefined} />
                                <AvatarFallback className="bg-gold/20 text-gold text-xs">
                                  {booking.profile?.full_name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{booking.profile?.full_name || booking.profile?.email || "غير معروف"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{booking.time_slot?.date}</div>
                              <div className="text-muted-foreground">
                                {booking.time_slot && formatTime(booking.time_slot.start_time)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{booking.service_type}</TableCell>
                          <TableCell>{getStatusBadge(booking.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {booking.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-500 border-green-500 hover:bg-green-500 hover:text-white"
                                    onClick={() => handleUpdateBookingStatus(booking.id, "approved")}
                                    disabled={actionLoading === booking.id}
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                                    onClick={() => handleUpdateBookingStatus(booking.id, "rejected")}
                                    disabled={actionLoading === booking.id}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              {booking.status === "approved" && (
                                <Button
                                  size="sm"
                                  className="bg-gold hover:bg-gold/90"
                                  onClick={() => handleUpdateBookingStatus(booking.id, "completed", booking.user_id)}
                                  disabled={actionLoading === booking.id}
                                >
                                  <Gift className="w-4 h-4 ml-1" />
                                  إكمال + نقاط
                                </Button>
                              )}
                              {booking.status === "completed" && (
                                <span className="text-xs text-green-500">+{booking.points_awarded} نقطة</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Time Slots Tab */}
            <TabsContent value="slots" className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gold" />
                  إدارة المواعيد
                </h2>
                <Button onClick={() => setAddSlotDialog(true)} className="bg-gold hover:bg-gold/90">
                  <Plus className="w-4 h-4 ml-1" />
                  إضافة موعد
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-gold animate-spin" />
                </div>
              ) : timeSlots.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  لا توجد مواعيد
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">التاريخ</TableHead>
                        <TableHead className="text-right">الوقت</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeSlots.map((slot) => (
                        <TableRow key={slot.id}>
                          <TableCell>
                            {format(new Date(slot.date), "EEEE d MMMM yyyy", { locale: ar })}
                          </TableCell>
                          <TableCell>{formatTime(slot.start_time)}</TableCell>
                          <TableCell>
                            <Badge variant={slot.is_available ? "default" : "secondary"} 
                                   className={slot.is_available ? "bg-green-500" : ""}>
                              {slot.is_available ? "متاح" : "محجوز"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => handleDeleteTimeSlot(slot.id)}
                              disabled={actionLoading === slot.id}
                            >
                              {actionLoading === slot.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="glass-card rounded-xl p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
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
                        <TableHead className="text-right">النقاط</TableHead>
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
                          <TableCell className="text-muted-foreground text-sm">
                            {u.email || "غير متوفر"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-gold" />
                              <span className="font-bold">{u.points}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-gold h-6 w-6 p-0"
                                onClick={() => setPointsDialog({ open: true, user: u, points: 10 })}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
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
                                    onClick={() => setConfirmDialog({ open: true, action: "demote", user: u })}
                                    disabled={actionLoading === u.user_id}
                                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                                  >
                                    <UserMinus className="w-4 h-4 ml-1" />
                                    تخفيض
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setConfirmDialog({ open: true, action: "promote", user: u })}
                                    disabled={actionLoading === u.user_id}
                                    className="text-gold border-gold hover:bg-gold hover:text-primary-foreground"
                                  >
                                    <UserPlus className="w-4 h-4 ml-1" />
                                    ترقية
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
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      {/* Add Time Slot Dialog */}
      <Dialog open={addSlotDialog} onOpenChange={setAddSlotDialog}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة موعد جديد</DialogTitle>
            <DialogDescription>اختر التاريخ والوقت للموعد الجديد</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">التاريخ</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-right", !newSlotDate && "text-muted-foreground")}
                  >
                    <Calendar className="ml-2 h-4 w-4" />
                    {newSlotDate ? format(newSlotDate, "PPP", { locale: ar }) : "اختر التاريخ"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={newSlotDate}
                    onSelect={setNewSlotDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">الوقت</label>
              <Input
                type="time"
                value={newSlotTime}
                onChange={(e) => setNewSlotTime(e.target.value)}
                className="text-left"
                dir="ltr"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSlotDialog(false)}>إلغاء</Button>
            <Button 
              onClick={handleAddTimeSlot} 
              disabled={!newSlotDate || !newSlotTime || actionLoading === "add-slot"}
              className="bg-gold hover:bg-gold/90"
            >
              {actionLoading === "add-slot" ? <Loader2 className="w-4 h-4 animate-spin" /> : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.action === "promote" ? "تأكيد الترقية" : "تأكيد التخفيض"}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.action === "promote"
                ? `هل أنت متأكد من ترقية ${confirmDialog.user?.full_name || confirmDialog.user?.email} إلى أدمن؟`
                : `هل أنت متأكد من تخفيض صلاحيات ${confirmDialog.user?.full_name || confirmDialog.user?.email}؟`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ open: false, action: "promote", user: null })}>
              إلغاء
            </Button>
            <Button
              className={confirmDialog.action === "promote" ? "bg-gold hover:bg-gold/90" : "bg-destructive hover:bg-destructive/90"}
              onClick={() => confirmDialog.user && (confirmDialog.action === "promote" ? handlePromoteToAdmin(confirmDialog.user) : handleDemoteFromAdmin(confirmDialog.user))}
            >
              {confirmDialog.action === "promote" ? "ترقية" : "تخفيض"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Points Dialog */}
      <Dialog open={pointsDialog.open} onOpenChange={(open) => setPointsDialog({ ...pointsDialog, open })}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة نقاط</DialogTitle>
            <DialogDescription>
              إضافة نقاط لـ {pointsDialog.user?.full_name || pointsDialog.user?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label className="text-sm font-medium">عدد النقاط</label>
            <Input
              type="number"
              value={pointsDialog.points}
              onChange={(e) => setPointsDialog({ ...pointsDialog, points: parseInt(e.target.value) || 0 })}
              min={1}
              className="mt-2"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPointsDialog({ open: false, user: null, points: 10 })}>
              إلغاء
            </Button>
            <Button 
              onClick={handleAwardPoints} 
              disabled={pointsDialog.points < 1 || actionLoading === "points"}
              className="bg-gold hover:bg-gold/90"
            >
              {actionLoading === "points" ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <Gift className="w-4 h-4 ml-1" />
                  إضافة
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;

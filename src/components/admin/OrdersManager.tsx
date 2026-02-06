import { useState, useEffect } from "react";
import { ShoppingBag, Loader2, Check, X, Eye, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
    image_url: string | null;
  };
}

interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  notes: string | null;
  created_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
  items?: OrderItem[];
}

export const OrdersManager = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch user profiles
      const userIds = [...new Set(ordersData?.map((o) => o.user_id) || [])];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds);

      // Fetch order items with products
      const orderIds = ordersData?.map((o) => o.id) || [];
      const { data: itemsData } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);

      const productIds = [...new Set(itemsData?.map((i) => i.product_id) || [])];
      const { data: productsData } = await supabase
        .from("products")
        .select("id, name, image_url")
        .in("id", productIds);

      const enrichedOrders: Order[] = (ordersData || []).map((order) => ({
        ...order,
        profile: profilesData?.find((p) => p.user_id === order.user_id),
        items: itemsData
          ?.filter((i) => i.order_id === order.id)
          .map((item) => ({
            ...item,
            product: productsData?.find((p) => p.id === item.product_id),
          })),
      }));

      setOrders(enrichedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    setActionLoading(orderId);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "تم",
        description:
          status === "approved"
            ? "تم قبول الطلب"
            : status === "rejected"
            ? "تم رفض الطلب"
            : status === "completed"
            ? "تم إكمال الطلب"
            : "تم تحديث حالة الطلب",
      });

      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      toast({ title: "خطأ", description: "فشل في تحديث الطلب", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-500 border-yellow-500">
            بانتظار
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="text-blue-500 border-blue-500">
            مقبول
          </Badge>
        );
      case "completed":
        return <Badge className="bg-green-500">مكتمل</Badge>;
      case "rejected":
        return <Badge variant="destructive">مرفوض</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-gold" />
          طلبات المنتجات
          {pendingCount > 0 && (
            <Badge className="bg-yellow-500 text-primary-foreground">{pendingCount}</Badge>
          )}
        </h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">لا توجد طلبات</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">العميل</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">المنتجات</TableHead>
                <TableHead className="text-right">المجموع</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={order.profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-gold/20 text-gold text-xs">
                          {order.profile?.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {order.profile?.full_name || order.profile?.email || "غير معروف"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(order.created_at), "d MMM yyyy", { locale: ar })}
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(order.created_at), "HH:mm")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{order.items?.length || 0} منتج</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold gold-text">{order.total_amount.toFixed(2)} د.ع</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewOrderDetails(order)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      {order.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-500 border-green-500 hover:bg-green-500 hover:text-white"
                            onClick={() => handleUpdateStatus(order.id, "approved")}
                            disabled={actionLoading === order.id}
                          >
                            {actionLoading === order.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => handleUpdateStatus(order.id, "rejected")}
                            disabled={actionLoading === order.id}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}

                      {order.status === "approved" && (
                        <Button
                          size="sm"
                          className="bg-gold hover:bg-gold/90"
                          onClick={() => handleUpdateStatus(order.id, "completed")}
                          disabled={actionLoading === order.id}
                        >
                          {actionLoading === order.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-4 h-4 ml-1" />
                              إكمال
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-gold" />
              تفاصيل الطلب
            </DialogTitle>
            <DialogDescription>
              {selectedOrder &&
                format(new Date(selectedOrder.created_at), "EEEE d MMMM yyyy - HH:mm", {
                  locale: ar,
                })}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedOrder.profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gold/20 text-gold">
                    {selectedOrder.profile?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {selectedOrder.profile?.full_name || "غير معروف"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.profile?.email}
                  </p>
                </div>
                <div className="mr-auto">{getStatusBadge(selectedOrder.status)}</div>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                <h4 className="font-medium">المنتجات</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 border border-border rounded-lg"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {item.product?.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.product?.name || "منتج محذوف"}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × {item.price.toFixed(2)} د.ع
                        </p>
                      </div>
                      <p className="font-bold gold-text">
                        {(item.quantity * item.price).toFixed(2)} د.ع
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="space-y-2">
                  <h4 className="font-medium">ملاحظات</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Total */}
              <div className="flex items-center justify-between p-4 bg-gold/10 rounded-lg">
                <span className="font-bold">المجموع الكلي</span>
                <span className="text-xl font-bold gold-text">
                  {selectedOrder.total_amount.toFixed(2)} د.ع
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

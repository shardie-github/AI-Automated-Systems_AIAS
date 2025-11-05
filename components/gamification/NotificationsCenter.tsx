"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { hapticTap } from "./Haptics";

interface Notification {
  id: number;
  type: string;
  title: string;
  body?: string;
  link?: string;
  read_at?: string;
  created_at: string;
}

export default function NotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
    const channel = supabase
      .channel("notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => {
        loadNotifications();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadNotifications() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read_at).length);
    }
  }

  async function markAsRead(id: number) {
    hapticTap();
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
    loadNotifications();
  }

  async function markAllAsRead() {
    hapticTap();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);
    loadNotifications();
  }

  const unread = notifications.filter(n => !n.read_at);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative h-10 w-10 rounded-xl bg-muted flex items-center justify-center"
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-fg text-xs flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-80 max-h-96 overflow-y-auto rounded-2xl border bg-card shadow-lg p-4 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold">Notifications</div>
              {unread.length > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-muted-foreground hover:text-foreground">
                  Mark all read
                </button>
              )}
            </div>
            
            {notifications.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">No notifications</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => { markAsRead(notif.id); if (notif.link) window.location.href = notif.link; }}
                  className={`rounded-xl border p-3 cursor-pointer hover:bg-muted/50 ${
                    !notif.read_at ? "bg-primary/5 border-primary/20" : ""
                  }`}
                >
                  <div className="text-sm font-semibold">{notif.title}</div>
                  {notif.body && <div className="text-xs text-muted-foreground mt-1">{notif.body}</div>}
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

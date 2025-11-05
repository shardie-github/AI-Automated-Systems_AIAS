"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { hapticTap } from "./Haptics";

export async function requestPushPermission() {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    return false;
  }
  
  if (Notification.permission === "granted") {
    return true;
  }
  
  const permission = await Notification.requestPermission();
  return permission === "granted";
}

export async function subscribeToPush() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const permission = await requestPushPermission();
  if (!permission) return false;
  
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""),
    });
    
    const { endpoint, keys } = subscription.toJSON();
    
    await supabase.from("push_subscriptions").upsert({
      user_id: user.id,
      endpoint: endpoint!,
      p256dh: keys!.p256dh,
      auth: keys!.auth,
    });
    
    return true;
  } catch (error) {
    console.error("Push subscription failed:", error);
    return false;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationButton() {
  const [subscribed, setSubscribed] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported("Notification" in window && "serviceWorker" in navigator);
    checkSubscription();
  }, []);

  async function checkSubscription() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .limit(1);
    
    setSubscribed(!!data && data.length > 0);
  }

  async function handleSubscribe() {
    hapticTap();
    const success = await subscribeToPush();
    if (success) {
      setSubscribed(true);
    }
  }

  if (!supported) {
    return null;
  }

  return (
    <button
      onClick={handleSubscribe}
      className={`h-10 px-4 rounded-xl text-sm font-medium ${
        subscribed ? "bg-secondary" : "bg-primary text-primary-fg"
      }`}
    >
      {subscribed ? "🔔 Notifications On" : "🔕 Enable Notifications"}
    </button>
  );
}

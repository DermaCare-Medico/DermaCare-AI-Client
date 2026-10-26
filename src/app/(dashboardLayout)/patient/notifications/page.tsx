"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BellRing, CalendarClock, ChevronRight, FileText, Loader2, Package, ScanLine, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageState, PatientPageHeader, StatusPill, patientUiStyles as s } from "@/src/app/(dashboardLayout)/patient/_components/PatientUi";
import {
  useGetUnreadNotificationCountQuery,
  useListNotificationsQuery,
  useMarkAllNotificationsAsReadMutation,
  useMarkSingleNotificationAsReadMutation,
  type NotificationItem,
} from "@/redux/api/notificationApi";

const iconByType: Record<string, LucideIcon> = {
  Appointment: CalendarClock,
  Prescription: FileText,
  Order: Package,
  Screening: ScanLine,
  General: BellRing,
};

function formatTimestamp(isoString?: string) {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return date.toLocaleString();
}

export default function PatientNotificationsPage() {
  const [tab, setTab] = useState<"All" | "Unread">("All");

  const { data: rawList, isLoading, isError, refetch } = useListNotificationsQuery(
    tab === "Unread" ? { isRead: false } : undefined
  );
  const { data: rawUnread } = useGetUnreadNotificationCountQuery();

  const [markAll, { isLoading: isMarkingAll }] = useMarkAllNotificationsAsReadMutation();
  const [markSingle, { isLoading: isMarkingSingle }] = useMarkSingleNotificationAsReadMutation();

  const notifications = useMemo(() => {
    if (!rawList) return [];
    const body = (rawList as { data?: unknown }).data ?? rawList;
    let list: NotificationItem[] = [];
    if (Array.isArray(body)) {
      list = body as NotificationItem[];
    } else if (body && typeof body === "object" && "notifications" in body && Array.isArray((body as { notifications: unknown }).notifications)) {
      list = (body as { notifications: NotificationItem[] }).notifications;
    }

    return list.map((n, idx) => ({
      id: String(n.id || (n as { _id?: string })._id || `notif-${idx}`),
      type: n.type || "General",
      title: n.title || "Notification",
      message: n.message || "",
      timestamp: formatTimestamp(n.createdAt),
      href: n.link || n.href || "/patient/dashboard",
      unread: !n.isRead,
    }));
  }, [rawList]);

  const apiUnreadCount = (rawUnread as { data?: { unreadCount?: number } })?.data?.unreadCount;
  const unreadCount = typeof apiUnreadCount === "number"
    ? apiUnreadCount
    : notifications.filter((item) => item.unread).length;

  const handleMarkAll = async () => {
    try {
      await markAll().unwrap();
      toast.success("All notifications marked as read.");
      refetch();
    } catch {
      toast.error("Could not mark notifications as read.");
    }
  };

  const handleMarkOne = async (id: string) => {
    try {
      await markSingle(id).unwrap();
      toast.success("Marked as read.");
      refetch();
    } catch {
      toast.error("Could not mark notification as read.");
    }
  };

  return (
    <div className={s.page}>
      <PatientPageHeader
        eyebrow="Updates"
        title="Notifications"
        description="Stay informed about appointments, screening records, prescriptions, and pharmacy orders."
        action={
          <Button
            disabled={isMarkingAll || unreadCount === 0}
            onClick={handleMarkAll}
            title="Mark all notifications as read"
          >
            {isMarkingAll && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Mark all as read
          </Button>
        }
      />

      <section className={s.toolbar} role="tablist" aria-label="Notification filter">
        <Button
          role="tab"
          aria-selected={tab === "All"}
          variant={tab === "All" ? "default" : "ghost"}
          className={tab === "All" ? s.primaryButton : undefined}
          onClick={() => setTab("All")}
        >
          All ({notifications.length})
        </Button>
        <Button
          role="tab"
          aria-selected={tab === "Unread"}
          variant={tab === "Unread" ? "default" : "ghost"}
          className={tab === "Unread" ? s.primaryButton : undefined}
          onClick={() => setTab("Unread")}
        >
          Unread ({unreadCount})
        </Button>
      </section>

      {isLoading ? (
        <PageState state="loading" title="Loading notifications..." message="Retrieving your latest notifications." />
      ) : isError ? (
        <PageState
          state="error"
          title="Could not load notifications"
          message="Unable to connect to the notification service. Please try again."
          onRetry={() => refetch()}
          
        />
      ) : notifications.length === 0 ? (
        <PageState
          state="empty"
          title="You are all caught up"
          message={tab === "Unread" ? "There are no unread notifications." : "You do not have any notifications yet."}
        />
      ) : (
        <section className={s.list} aria-label={`${tab} notifications`}>
          {notifications.map((notification) => {
            const Icon = iconByType[notification.type] || BellRing;
            return (
              <article
                className={`${s.notificationCard} ${notification.unread ? s.notificationUnread : ""}`}
                key={notification.id}
              >
                <div className={s.notificationIcon}>
                  <Icon size={20} aria-hidden={true} />
                </div>
                <div>
                  <div className={s.rowBetween}>
                    <div>
                      <StatusPill tone={notification.unread ? "info" : "neutral"}>
                        {notification.type}
                      </StatusPill>
                      <h2 style={{ marginTop: 10 }}>{notification.title}</h2>
                    </div>
                    {notification.unread ? <span className={s.unreadDot} aria-label="Unread" /> : null}
                  </div>
                  <p className={s.muted}>{notification.message}</p>
                  <p className={s.muted}>{notification.timestamp}</p>
                  <div className={s.actions}>
                    <Button asChild variant="outline" size="sm">
                      <Link href={notification.href}>
                        Open related page <ChevronRight size={14} />
                      </Link>
                    </Button>
                    {notification.unread ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isMarkingSingle}
                        onClick={() => handleMarkOne(notification.id)}
                      >
                        Mark as read
                      </Button>
                    ) : null}
                  </div>
                </div>
                <BellRing size={17} color="#809093" aria-hidden="true" />
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

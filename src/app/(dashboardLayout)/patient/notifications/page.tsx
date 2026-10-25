"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BellRing, CalendarClock, ChevronRight, FileText, Package, ScanLine, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageState, PatientPageHeader, PreviewNotice, StatusPill, patientUiStyles as s } from "@/src/app/(dashboardLayout)/patient/_components/PatientUi";
import { notificationPreviews, type NotificationType } from "@/src/app/(dashboardLayout)/patient/_components/patient-preview-data";

const iconByType: Record<NotificationType, LucideIcon> = { Appointment: CalendarClock, Prescription: FileText, Order: Package, Screening: ScanLine };

export default function PatientNotificationsPage() {
  const [tab, setTab] = useState<"All" | "Unread">("All");
  const notifications = useMemo(() => tab === "Unread" ? notificationPreviews.filter((item) => item.unread) : notificationPreviews, [tab]);
  const unreadCount = notificationPreviews.filter((item) => item.unread).length;

  return <div className={s.page}>
    <PatientPageHeader eyebrow="Updates" title="Notifications" description="Stay informed about appointments, screening records, prescriptions, and pharmacy orders." action={<Button disabled title="Notification API integration required">Mark all as read</Button>} />
    <PreviewNotice />
    <section className={s.toolbar} role="tablist" aria-label="Notification filter"><Button role="tab" aria-selected={tab === "All"} variant={tab === "All" ? "default" : "ghost"} className={tab === "All" ? s.primaryButton : undefined} onClick={() => setTab("All")}>All ({notificationPreviews.length})</Button><Button role="tab" aria-selected={tab === "Unread"} variant={tab === "Unread" ? "default" : "ghost"} className={tab === "Unread" ? s.primaryButton : undefined} onClick={() => setTab("Unread")}>Unread ({unreadCount})</Button></section>
    {notifications.length === 0 ? <PageState state="empty" title="You are all caught up" message="There are no unread preview notifications." /> : <section className={s.list} aria-label={`${tab} notifications`}>{notifications.map((notification) => { const Icon = iconByType[notification.type]; return <article className={`${s.notificationCard} ${notification.unread ? s.notificationUnread : ""}`} key={notification.id}>
      <div className={s.notificationIcon}><Icon size={20} aria-hidden={true} /></div>
      <div><div className={s.rowBetween}><div><StatusPill tone={notification.unread ? "info" : "neutral"}>{notification.type}</StatusPill><h2 style={{ marginTop: 10 }}>{notification.title}</h2></div>{notification.unread ? <span className={s.unreadDot} aria-label="Unread" /> : null}</div><p className={s.muted}>{notification.message}</p><p className={s.muted}>{notification.timestamp}</p><div className={s.actions}><Button asChild variant="outline" size="sm"><Link href={notification.href}>Open related page <ChevronRight size={14} /></Link></Button>{notification.unread ? <Button size="sm" variant="ghost" disabled title="Notification API integration required">Mark as read</Button> : null}</div></div>
      <BellRing size={17} color="#809093" aria-hidden="true" />
    </article>; })}</section>}
  </div>;
}

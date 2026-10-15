import Link from "next/link";
import { ArrowRight, BellRing, CalendarClock, CircleAlert, ShieldCheck, Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  educationalResources,
  mockScreenings,
  summaryCards,
  upcomingAppointment,
} from "@/src/app/(dashboardLayout)/patient/mockData";
import styles from "./page.module.css";

const statusClassName: Record<string, string> = {
  Completed: styles.statusCompleted,
  "Needs Review": styles.statusNeedsReview,
  Incomplete: styles.statusIncomplete,
  Confirmed: styles.statusConfirmed,
  Pending: styles.statusPending,
};

export default function PatientDashboardPage() {
  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <p className={styles.eyebrow}>Patient dashboard</p>
          <h1>Good morning, Alex</h1>
        </div>
        <div className={styles.topActions}>
          <button type="button" className={styles.notificationButton} aria-label="View notifications">
            <BellRing size={16} />
            <span>3</span>
          </button>
          <Link href="/patient/screening/new" passHref>
            <Button size="lg" className={styles.primaryButton}>
              Start New Screening
            </Button>
          </Link>
        </div>
      </div>

      <section className={styles.welcomeCard}>
        <div>
          <p className={styles.welcomeLabel}>Your skin health snapshot</p>
          <h2>Keep an eye on changes and book care when it matters most.</h2>
        </div>
        <div className={styles.welcomeActions}>
          <Link href="/patient/screening/new" passHref>
            <Button size="lg" className={styles.primaryButton}>
              Start New Screening <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/patient/dashboard" passHref>
            <Button variant="outline" size="lg" className={styles.secondaryButton}>
              Find a Doctor
            </Button>
          </Link>
        </div>
      </section>

      <section className={styles.summaryGrid} aria-label="Patient summary">
        {summaryCards.map((card) => (
          <article key={card.label} className={styles.summaryCard}>
            <p>{card.label}</p>
            <strong>{card.value}</strong>
            <span>{card.detail}</span>
          </article>
        ))}
      </section>

      <section className={styles.mainGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Recent screenings</p>
              <h3>Screening history</h3>
            </div>
            <Link href="/patient/dashboard" className={styles.inlineLink}>
              View all
            </Link>
          </div>

          <div className={styles.recordList}>
            {mockScreenings.map((screening) => (
              <div key={screening.id} className={styles.recordCard}>
                <div className={styles.thumbnail} aria-hidden="true">
                  {screening.thumbnailLabel.slice(0, 2).toUpperCase()}
                </div>
                <div className={styles.recordDetails}>
                  <div className={styles.recordMetaRow}>
                    <span>{screening.date}</span>
                    <span className={`${styles.statusBadge} ${statusClassName[screening.status]}`}>
                      {screening.status}
                    </span>
                  </div>
                  <h4>{screening.title}</h4>
                  <p>{screening.excerpt}</p>
                  <button type="button" className={styles.textButton}>
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <aside className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Upcoming visit</p>
              <h3>Appointment</h3>
            </div>
            <span className={`${styles.statusBadge} ${statusClassName[upcomingAppointment.status]}`}>
              {upcomingAppointment.status}
            </span>
          </div>

          <div className={styles.appointmentCard}>
            <div className={styles.doctorAvatar} aria-hidden="true">
              <Stethoscope size={18} />
            </div>
            <div>
              <h4>{upcomingAppointment.doctor}</h4>
              <p>{upcomingAppointment.specialty}</p>
            </div>
          </div>

          <ul className={styles.appointmentMeta}>
            <li>
              <CalendarClock size={16} />
              <span>
                {upcomingAppointment.date} · {upcomingAppointment.time}
              </span>
            </li>
            <li>
              <ShieldCheck size={16} />
              <span>{upcomingAppointment.location}</span>
            </li>
          </ul>

          <Link href="/patient/dashboard" passHref>
            <Button variant="outline" className={styles.appointmentButton}>
              View Appointment
            </Button>
          </Link>
        </aside>
      </section>

      <section className={styles.resourcesSection}>
        <div className={styles.resourcesHeader}>
          <div>
            <p className={styles.sectionEyebrow}>Helpful resources</p>
            <h3>Skin health tips</h3>
          </div>
        </div>

        <div className={styles.resourceGrid}>
          {educationalResources.map((resource) => (
            <article key={resource.title} className={styles.resourceCard}>
              <div className={styles.resourceIcon} aria-hidden="true">
                <CircleAlert size={18} />
              </div>
              <h4>{resource.title}</h4>
              <p>{resource.description}</p>
            </article>
          ))}
        </div>

        <p className={styles.disclaimer}>
          Educational content is informational only and is not a substitute for professional medical advice or a diagnosis.
        </p>
      </section>
    </div>
  );
}

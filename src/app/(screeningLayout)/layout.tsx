import Navbar from "@/components/Common/Navbar/Navbar";
import styles from "./screening-layout.module.css";

export default function ScreeningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4.5rem)] bg-[#F5F8FA] py-8 sm:py-10">
        <div className={styles.inner}>{children}</div>
      </main>
    </>
  );
}

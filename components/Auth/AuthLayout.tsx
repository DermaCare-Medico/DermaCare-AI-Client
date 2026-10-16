import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Leaf, LockKeyhole, ShieldCheck } from "lucide-react";
import doctor from "../../public/images/doctor1.jpg";

function Brand() {
  return (
    <Link
      href="/"
      aria-label="DermaCare AI home"
      className="inline-flex w-fit items-center gap-3"
    >
      <span className="grid size-12 place-items-center rounded-2xl bg-white text-[#0F888D] shadow-sm">
        <Leaf size={27} strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span className="text-[25px] font-bold tracking-[-0.06em] text-white">
        DermaCare <span className="text-[#0F888D]">AI</span>
      </span>
    </Link>
  );
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F2F6F9] px-0 py-0 text-[#172033] sm:px-5 sm:py-6">
      <div className="mx-auto grid min-h-screen w-full max-w-[1160px] overflow-hidden bg-white shadow-[0_24px_80px_rgba(22,58,95,0.12)] sm:min-h-[min(740px,calc(100vh-3rem))] sm:rounded-3xl md:grid-cols-[0.92fr_1.08fr]">
        <aside className="relative hidden flex-col bg-[#163A5F] md:flex">
          <div className="relative min-h-[330px] flex-1 overflow-hidden">
            <Image
              src={doctor}
              alt="A dermatologist carefully examining a patient's skin"
              fill
              priority
              sizes="(max-width: 768px) 0px, 45vw"
              className="object-cover object-[center_38%]"
            />
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-[#0F2942]/35" />
          </div>
          <div className="flex min-h-[310px] flex-col justify-center bg-[#163A5F] px-10 py-9 text-white lg:px-12">
            <Brand />
            <div className="mt-8 border-l-2 border-[#14B8A6] pl-5">
              <p className="text-2xl font-semibold leading-tight tracking-tight lg:text-[27px]">
                Understand your skin.
                <br />
                Know what to do next.
              </p>
              <p className="mt-3 max-w-sm text-sm leading-6 text-white/75">
                AI-assisted screening, verified dermatologists, and care that
                puts you first.
              </p>
            </div>
            <div className="mt-7 flex items-center gap-2 text-xs text-white/75">
              <ShieldCheck
                size={15}
                className="text-[#51D2C5]"
                aria-hidden="true"
              />
              Private, secure, and always centred around you.
            </div>
          </div>
        </aside>

        <section className="flex min-h-screen flex-col justify-center px-6 py-12 sm:px-12 md:min-h-0 md:px-14 lg:px-20">
          <div className="mx-auto w-full max-w-[390px]">
            <div className="mb-10 md:hidden">
              <Brand />
            </div>
            {children}
            <p className="mt-10 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
              <LockKeyhole
                size={14}
                className="text-[#0F888D]"
                aria-hidden="true"
              />
              Your health information stays private and secure.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

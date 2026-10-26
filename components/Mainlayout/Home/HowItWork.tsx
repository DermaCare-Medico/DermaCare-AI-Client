"use client";

import React from "react";
import { motion } from "framer-motion";

export default function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "SCREEN YOUR SKIN",
      description: "Upload an image for AI-assisted skin insights.",
      // Warm cream card with dark text
      cardStyle:
        "bg-[#FBF9F4] text-[#1E293B] border-[#ECE7DC] hover:border-[#DFD7C7]",
      titleColor: "text-[#0F172A]",
      descColor: "text-[#64748B]",
      desktopMarginTop: "lg:mt-0",
    },
    {
      num: "02",
      title: "CONSULT A DOCTOR",
      description: "Book an appointment with a qualified dermatologist.",
      // Muted teal card with white text
      cardStyle:
        "bg-[#0E8388] text-white border-transparent shadow-sm hover:bg-[#0B7277]",
      titleColor: "text-white",
      descColor: "text-teal-50/90",
      desktopMarginTop: "lg:mt-24",
    },
    {
      num: "03",
      title: "GET A PRESCRIPTION",
      description: "Receive personalized guidance and prescriptions.",
      // Soft sage / light mint card with dark text
      cardStyle:
        "bg-[#F2F7F4] text-[#1E293B] border-[#DFECE4] hover:border-[#CFE1D6]",
      titleColor: "text-[#0F172A]",
      descColor: "text-[#556960]",
      desktopMarginTop: "lg:mt-48",
    },
    {
      num: "04",
      title: "ORDER MEDICINES",
      description: "Shop prescribed products and track your order.",
      // Dark navy card with white text
      cardStyle:
        "bg-[#091522] text-white border-transparent shadow-sm hover:bg-[#050D17]",
      titleColor: "text-white",
      descColor: "text-slate-300",
      desktopMarginTop: "lg:mt-72",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="w-full bg-transparent py-20 md:py-28 font-sans overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Editorial Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-16 md:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-medium text-[#111827] tracking-tight">
            How it works
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#6B7280] font-normal leading-relaxed">
            Get started in minutes — upload your concern, consult verified specialists, and receive complete care.
          </p>
        </motion.div>

        {/* ---------------------------------------------------- */}
        {/* DESKTOP & TABLET VIEW: Staggered 4-Column Timeline */}
        {/* ---------------------------------------------------- */}
        <div className="hidden md:grid md:grid-cols-4 relative min-h-[460px] lg:min-h-[500px]">
          {steps.map((step, index) => (
            <div
              key={step.num}
              className="relative flex flex-col items-start pr-4 lg:pr-6"
            >
              {/* Step number at top */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-sm font-mono tracking-widest text-[#94A3B8] font-semibold pl-1 mb-3"
              >
                {step.num}
              </motion.div>

              {/* Vertical Guide Line running down the column */}
              <motion.div
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
                style={{ originY: 0 }}
                className="absolute left-[9px] top-7 bottom-0 w-[1px] bg-[#E2E8F0] pointer-events-none"
                aria-hidden="true"
              />

              {/* Staggered Content Card dropping down from the top into its staggered position */}
              <motion.div
                initial={{ opacity: 0, y: -60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.85,
                  delay: 0.15 + index * 0.15,
                  ease: [0.16, 1, 0.3, 1], // fluid spring-like cubic bezier
                }}
                className={`relative z-10 w-full rounded-2xl border p-6 lg:p-7 transition-all duration-300 hover:-translate-y-1 ${step.cardStyle} ${step.desktopMarginTop}`}
              >
                <h3
                  className={`text-sm sm:text-[15px] font-bold uppercase tracking-wider mb-2.5 font-mono ${step.titleColor}`}
                >
                  {step.title}
                </h3>
                <p
                  className={`text-sm sm:text-[15px] leading-relaxed font-normal ${step.descColor}`}
                >
                  {step.description}
                </p>
              </motion.div>
            </div>
          ))}
        </div>

        {/* ---------------------------------------------------- */}
        {/* MOBILE VIEW: Vertical Timeline with Connecting Lines */}
        {/* ---------------------------------------------------- */}
        <div className="md:hidden relative flex flex-col space-y-8 pl-8">
          {/* Continuous vertical spine */}
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ originY: 0 }}
            className="absolute left-[13px] top-2 bottom-4 w-[1px] bg-[#E2E8F0]"
            aria-hidden="true"
          />

          {steps.map((step, index) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.7,
                delay: index * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative flex flex-col gap-2"
            >
              {/* Node indicator on vertical spine */}
              <div
                className="absolute -left-[27px] top-4 size-5 rounded-full bg-white border border-[#CBD5E1] flex items-center justify-center text-[10px] font-mono font-semibold text-[#64748B] z-10"
              >
                {step.num}
              </div>

              {/* Mobile Content Card */}
              <div
                className={`w-full rounded-2xl border p-5 sm:p-6 shadow-sm transition-all ${step.cardStyle}`}
              >
                <h3
                  className={`text-sm sm:text-[15px] font-bold uppercase tracking-wider mb-2 font-mono ${step.titleColor}`}
                >
                  {step.title}
                </h3>
                <p
                  className={`text-sm sm:text-[15px] leading-relaxed font-normal ${step.descColor}`}
                >
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

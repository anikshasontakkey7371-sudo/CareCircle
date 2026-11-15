import Link from "next/link";
import {
  HeartHandshake,
  UserCheck,
  ShieldCheck,
  KeyRound,
  BellRing,
  CalendarCheck2,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-5 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-terracotta-100 text-terracotta-800 text-xs sm:text-sm font-bold border border-terracotta-200 shadow-sm">
          <Sparkles className="w-4 h-4 text-terracotta-600" aria-hidden="true" />
          <span>Designed Specifically for Elderly Independence &amp; Family Peace of Mind</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-charcoal-900 tracking-tight leading-tight">
          Caring for aging loved ones, <span className="text-terracotta-600 underline decoration-terracotta-300">together</span>.
        </h1>

        <p className="text-lg sm:text-xl text-charcoal-800 leading-relaxed font-medium">
          CareCircle connects seniors with authorized family members and caregivers for effortless medication scheduling, 1-tap adherence tracking, and automated missed-dose alerts.
        </p>
      </section>

      {/* Role Selection Cards */}
      <section aria-label="Choose your role" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Senior Card */}
        <div className="rounded-3xl p-8 bg-white border-2 border-sage-300 shadow-warm hover:shadow-warm-lg transition-all flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-sage-100 border border-sage-200 text-sage-800 flex items-center justify-center shadow-sm">
              <UserCheck className="w-9 h-9" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sage-700 block">
                For Seniors
              </span>
              <h2 className="text-2xl font-black text-charcoal-900 tracking-tight mt-1">
                Elderly Routine View
              </h2>
            </div>
            <p className="text-sm font-medium text-charcoal-800 leading-relaxed">
              Extra-large buttons, voice instructions, and simple 1-tap &ldquo;I Took My Pills&rdquo; confirmation. Zero confusing menus.
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-parchment-200">
            <Link
              href="/elderly"
              className="w-full min-h-[56px] px-6 py-3 rounded-2xl bg-sage-700 hover:bg-sage-800 text-white font-black text-base flex items-center justify-center gap-2 shadow-md btn-tactile focus:ring-4 focus:ring-sage-300"
            >
              <span>Open Elderly View</span>
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Caregiver Card */}
        <div className="rounded-3xl p-8 bg-white border-2 border-terracotta-300 shadow-warm hover:shadow-warm-lg transition-all flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-terracotta-100 border border-terracotta-200 text-terracotta-600 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-9 h-9" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-terracotta-700 block">
                For Family &amp; Nurses
              </span>
              <h2 className="text-2xl font-black text-charcoal-900 tracking-tight mt-1">
                Caregiver Command Center
              </h2>
            </div>
            <p className="text-sm font-medium text-charcoal-800 leading-relaxed">
              Track 7-day adherence, configure prescriptions, manage medical appointments, and receive automated email alerts.
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-parchment-200">
            <Link
              href="/caregiver"
              className="w-full min-h-[56px] px-6 py-3 rounded-2xl bg-terracotta-600 hover:bg-terracotta-700 text-white font-black text-base flex items-center justify-center gap-2 shadow-md btn-tactile focus:ring-4 focus:ring-terracotta-300"
            >
              <span>Caregiver Dashboard</span>
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* 6-Digit Passcode Card */}
        <div className="rounded-3xl p-8 bg-white border-2 border-ochre-300 shadow-warm hover:shadow-warm-lg transition-all flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-ochre-100 border border-ochre-200 text-ochre-700 flex items-center justify-center shadow-sm">
              <KeyRound className="w-9 h-9" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-ochre-800 block">
                Quick Access
              </span>
              <h2 className="text-2xl font-black text-charcoal-900 tracking-tight mt-1">
                6-Digit Passcode Login
              </h2>
            </div>
            <p className="text-sm font-medium text-charcoal-800 leading-relaxed">
              Easy numeric keypad sign-in for elderly users on tablets and bedside screens. No passwords or OAuth complexity required.
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-parchment-200">
            <Link
              href="/passcode"
              className="w-full min-h-[56px] px-6 py-3 rounded-2xl bg-ochre-500 hover:bg-ochre-600 text-white font-black text-base flex items-center justify-center gap-2 shadow-md btn-tactile focus:ring-4 focus:ring-ochre-300"
            >
              <span>Enter Passcode</span>
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Architecture Highlights */}
      <section
        aria-label="Core platform pillars"
        className="rounded-3xl p-8 sm:p-10 bg-parchment-100 border border-parchment-300 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-white border border-parchment-300 flex items-center justify-center text-terracotta-600 shadow-sm">
            <Lock className="w-5 h-5" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-black text-charcoal-900">Consent &amp; Privacy</h3>
          <p className="text-xs sm:text-sm text-charcoal-800 leading-relaxed">
            Role-based scoped permissions ensure only authorized family members view health routines.
          </p>
        </div>

        <div className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-white border border-parchment-300 flex items-center justify-center text-sage-700 shadow-sm">
            <BellRing className="w-5 h-5" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-black text-charcoal-900">Missed Dose Alerts</h3>
          <p className="text-xs sm:text-sm text-charcoal-800 leading-relaxed">
            Idempotent background email reminders trigger instantly if a scheduled dose is missed.
          </p>
        </div>

        <div className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-white border border-parchment-300 flex items-center justify-center text-ochre-600 shadow-sm">
            <CalendarCheck2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-black text-charcoal-900">Medical Visits</h3>
          <p className="text-xs sm:text-sm text-charcoal-800 leading-relaxed">
            Coordinate appointments with escort tags and transport assistance for clinical appointments.
          </p>
        </div>

        <div className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-white border border-parchment-300 flex items-center justify-center text-terracotta-600 shadow-sm">
            <HeartHandshake className="w-5 h-5" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-black text-charcoal-900">Senior Ergonomics</h3>
          <p className="text-xs sm:text-sm text-charcoal-800 leading-relaxed">
            WCAG AAA contrast, font scaling, audio chimes, and tactile feedback built for aging eyes.
          </p>
        </div>
      </section>
    </div>
  );
}

import React, { useState } from 'react';
import { HOSPITAL_METRICS, HOSPITAL_AWARDS } from '../data/hospitalData';
import { HOSPITAL_IMAGES } from '../assets/images';
import {
  ShieldCheck,
  Heart,
  Award,
  Users,
  Building,
  Target,
  Sparkles,
  ArrowRight,
  Stethoscope,
  ChevronDown
} from 'lucide-react';

interface AboutViewProps {
  onBookAppointment: () => void;
  onExploreDepartments: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  onBookAppointment,
  onExploreDepartments
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How do I book or reschedule an appointment at We Care Hospitals?',
      answer: 'You can book directly through our online booking system by selecting your preferred department, specialist doctor, date, and consultation time. Rescheduling can be completed at any time with one click in the "My Appointments" portal without phone queues.'
    },
    {
      question: 'Do I require a general physician referral to consult a specialist?',
      answer: 'No referral is required for the vast majority of our outpatient specialist clinics. You may book directly with any clinician across Cardiology, Neurology, Orthopedics, Pediatrics, Oncology, Obstetrics, and Gastroenterology.'
    },
    {
      question: 'What health insurance and payment arrangements are accepted?',
      answer: 'We Care Hospitals is in-network with all major commercial health insurers, Medicare, and Medicaid. For self-pay and international patients, transparent itemized pricing packages and digital payments are provided upfront with zero surprise billing.'
    },
    {
      question: 'What international quality accreditations does the hospital maintain?',
      answer: 'Our hospital holds the Joint Commission International (JCI) Gold Seal of Approval, reflecting compliance with the highest global safety protocols. We also hold Magnet Recognition for Nursing and zero-infection benchmarks across our 22 robotic surgical suites.'
    },
    {
      question: 'What are the visiting hours and intensive care unit policies?',
      answer: 'General inpatient visiting hours are daily from 10:00 AM to 8:00 PM. Our adult and neonatal intensive care units (ICU & NICU) offer 24-hour access to designated immediate family members with private waiting lounges and counselor support.'
    },
    {
      question: 'How do telehealth video consultations work?',
      answer: 'When booking your appointment, choose "Telehealth Video Consult". You will receive an encrypted high-definition video consultation link via email and calendar pass. No app download is necessary; simply join securely from your browser on any phone or laptop.'
    },
    {
      question: 'Is emergency trauma and critical care available 24/7?',
      answer: 'Yes. Our Level 1 Trauma Center, red-zone resuscitation bay, dedicated trauma CT scanner, and acute cardiac catheterization labs are fully operational 24 hours a day, 365 days a year with immediate triage upon arrival.'
    }
  ];
  const leadership = [
    {
      name: 'Dr. Katherine Bradley, MD, FACS',
      role: 'Chief Executive & Medical Officer',
      bio: 'Former Professor of Surgery with 28 years in academic healthcare leadership, steering hospital quality and robotic surgical expansion.'
    },
    {
      name: 'Dr. Aris Thorne, MD, FACC',
      role: 'Chairman of Clinical Governance',
      bio: 'Board-certified cardiologist leading multi-disciplinary clinical committees, evidence-based protocols, and morbidity reviews.'
    },
    {
      name: 'Sister Patricia O’Connor, RN, MSN',
      role: 'Chief Nursing Officer',
      bio: 'Champion of patient-centered nursing culture, achieving five consecutive Magnet recognitions for nurse excellence.'
    }
  ];

  const pillars = [
    {
      icon: Heart,
      title: 'Compassionate Care',
      description: 'Medical science is only as potent as the empathy with which it is delivered. Every patient is treated like family.'
    },
    {
      icon: Target,
      title: 'Clinical Precision',
      description: 'Adopting robotic assistance, stereotactic imaging, and evidence-based protocols to maximize positive clinical outcomes.'
    },
    {
      icon: Building,
      title: 'World-Class Facility',
      description: '450 inpatient beds, 22 modular surgical suites with laminar airflow, and an on-site level 1 trauma resuscitation bay.'
    },
    {
      icon: ShieldCheck,
      title: 'Safety & Transparency',
      description: 'JCI Gold standard compliance with transparent billing, patient charter protections, and rigorous infection control.'
    }
  ];

  return (
    <div className="space-y-16 lg:space-y-20 pb-20">
      {/* 1. Header Banner */}
      <section className="bg-white border-b border-slate-200 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-xs font-bold text-teal-800 tracking-wider uppercase">ABOUT WE CARE HOSPITALS</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mt-2 tracking-tight [text-wrap:balance]">
              Setting the Benchmark for Clinical Mastery &amp; Patient Dignity
            </h1>
            <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed">
              Founded with the conviction that tertiary healthcare should combine cutting-edge medical technology with warm human touch, We Care Hospitals has evolved into one of the region’s premier healthcare destinations.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Story & Facility Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Our Journey &amp; Clinical Heritage
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              For over two decades, We Care Hospitals has stood at the vanguard of medical innovation. What began as a dedicated cardiology and emergency center has grown into a comprehensive 450-bed quaternary medical facility encompassing 8 specialized clinical institutes.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Our clinicians and surgical teams handle over 200,000 outpatient consultations, 15,000 surgical procedures, and 48,000 emergency admissions every year. We are proud to maintain one of the lowest surgical infection rates in the country.
            </p>

            <div className="pt-2 grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-2xl font-bold text-slate-900 tabular-nums">28+ Years</p>
                <p className="text-xs text-slate-500 mt-1">Of Healthcare Leadership</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-2xl font-bold text-slate-900 tabular-nums">200K+</p>
                <p className="text-xs text-slate-500 mt-1">Patients Cared For Yearly</p>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
            <img
              src={HOSPITAL_IMAGES.surgicalSuite}
              alt="High Tech Robotic Surgery Suite at We Care Hospitals"
              referrerPolicy="no-referrer"
              className="w-full h-80 sm:h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
              <span className="text-xs font-semibold text-teal-300">SURGICAL INNOVATION</span>
              <p className="text-base font-bold">Sub-Millimeter Robotic Surgical Systems</p>
              <p className="text-xs text-slate-200 mt-0.5">Minimizing incision size and accelerating patient recovery times.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The 4 Pillars */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-teal-800 tracking-wider uppercase">OUR GUIDING PRINCIPLES</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              The Four Pillars of We Care
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every decision from surgical procurement to bedside nursing is governed by these core tenets.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 border border-teal-100">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{pillar.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Clinical Leadership Team */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <span className="text-xs font-bold text-teal-800 tracking-wider uppercase">EXECUTIVE LEADERSHIP</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Governed by Physicians &amp; Patient Advocates
          </h2>
          <p className="text-sm text-slate-600 mt-1.5">
            Our hospital executive committee is composed of practicing physicians who understand frontline healthcare realities.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {leadership.map((leader, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm mb-4">
                  <Stethoscope className="w-6 h-6 text-teal-700" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{leader.name}</h3>
                <p className="text-xs font-medium text-teal-700 mt-0.5">{leader.role}</p>
                <p className="text-xs text-slate-600 mt-3 leading-relaxed">{leader.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Accreditations & Quality Commitments */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-bold text-teal-400 tracking-wider uppercase">QUALITY GOVERNANCE</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold">
                Rigorous International Standards You Can Trust
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                We Care Hospitals undergoes voluntary unannounced audits by Joint Commission International (JCI) and national healthcare safety councils. Our clinical indicators, hand-hygiene adherence, and nurse-to-patient ratios consistently exceed national benchmarks.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={onBookAppointment}
                  className="px-6 py-3 text-sm font-semibold text-slate-900 bg-teal-400 hover:bg-teal-300 rounded-xl transition-colors shadow-sm"
                >
                  Schedule Your Consultation
                </button>
                <button
                  onClick={onExploreDepartments}
                  className="px-5 py-3 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Explore All Departments
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-3">
              <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Hospital Campus Facts</p>
              <ul className="text-xs text-slate-300 space-y-2">
                <li>• 450 Fully-Equipped Inpatient Beds</li>
                <li>• 85 Intensive Care (ICU/CCU/NICU) Beds</li>
                <li>• 24/7 Sliding-Gantry CT Trauma Suite</li>
                <li>• Level III High-Risk Neonatal Intensive Care</li>
                <li>• 2 Biplane Angiography Cath Labs</li>
                <li>• Pharmacy &amp; Diagnostic Pathology 24/7</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Frequently Asked Questions (FAQ) Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-teal-800 tracking-wider uppercase">PATIENT HELP &amp; GUIDANCE</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Answers to common questions about appointments, hospital admissions, clinical specialties, and visitor policies.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-teal-50 text-teal-700' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick contact prompt */}
        <div className="mt-8 p-4 bg-slate-100 rounded-2xl text-center text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-200">
          <span>Have an unanswered question or special clinical request?</span>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:+18009322731"
              className="font-bold text-teal-800 hover:underline"
            >
              Call Desk: 1-800-932-2731
            </a>
            <span className="text-slate-300">·</span>
            <button
              onClick={onBookAppointment}
              className="font-bold text-teal-800 hover:underline"
            >
              Book Consultation →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

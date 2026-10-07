import React from 'react';
import { ClipboardList, CheckSquare, BarChart2, Calendar } from 'lucide-react';

const WelcomeContent = () => {
  const steps = [
    {
      icon: ClipboardList,
      title: 'Check Faculty Status & Slots',
      desc: 'Go to the Faculty tab. View instructors real-time status (Available / Not Available) and remaining daily slots.',
    },
    {
      icon: CheckSquare,
      title: 'Select & Request Appointment',
      desc: "Click 'Book' on an Instructor's card. Select an open slot, enter your agenda, and submit.",
    },
    {
      icon: BarChart2,
      title: 'Track Your Request Status',
      desc: "Navigate to your Dashboard. Requests shows as 'Pending' until the instructor confirms them.",
    },
    {
      icon: Calendar,
      title: 'View Calendar and Attend',
      desc: 'Once approved, details appears in your Calendar. Show on time!',
    },
  ];

  const policies = [
    {
      title: 'Booking Window:',
      body: 'Slots must be requested at least 24 hours in advance to allow instructors time to review.',
    },
    {
      title: 'Punctuality & Attendance:',
      body: 'Arrive on time (virtually or in person). Arriving 10+ minutes late may result in an automatic cancellation.',
    },
    {
      title: 'Cancellation & Rescheduling:',
      body: 'If you cannot make it, cancel or request a reschedule at least 2 hours prior to free up the slot for other students.',
    },
  ];

  return (
    <>
      <style>{`
        .welcome-page {
          max-width: 900px;
          margin: 0 auto;
          padding: 0.5rem 0;
        }
        .welcome-page-title {
          font-size: 1.5rem; font-weight: 800;
          color: var(--text-primary); margin: 0 0 0.25rem 0;
        }
        .welcome-page-sub {
          font-size: 0.85rem; color: var(--text-muted); margin: 0 0 1.6rem 0;
        }
        .welcome-cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.2rem;
          align-items: start;
        }
        @media (max-width: 700px) {
          .welcome-cols { grid-template-columns: 1fr; }
        }

        /* ── Guide card ── */
        .welcome-guide-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 16px;
          padding: 1.5rem 1.4rem;
          box-shadow: var(--card-shadow);
        }
        .welcome-guide-title {
          font-size: 0.95rem; font-weight: 800;
          color: var(--text-primary); margin: 0 0 1.4rem 0;
        }

        /* Steps */
        .welcome-steps { display: flex; flex-direction: column; gap: 0; }
        .welcome-step {
          display: flex; gap: 1rem; position: relative;
        }
        /* Vertical connector line */
        .welcome-step:not(:last-child)::after {
          content: '';
          position: absolute;
          left: 19px; top: 42px;
          width: 2px; bottom: 0;
          background: #c7d2e8;
        }
        .sd-root.dark .welcome-step:not(:last-child)::after { background: rgba(255,255,255,0.1); }

        .welcome-step-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: #e8edf8; color: #2e4a87;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-bottom: 1.2rem; z-index: 1;
        }
        .sd-root.dark .welcome-step-icon { background: rgba(91,128,196,0.2); color: #7ba4e0; }

        .welcome-step-body { padding-bottom: 1.4rem; flex: 1; }
        .welcome-step-title {
          font-size: 0.88rem; font-weight: 700;
          color: #2e4a87; margin: 0 0 0.25rem 0;
        }
        .sd-root.dark .welcome-step-title { color: #7ba4e0; }
        .welcome-step-desc {
          font-size: 0.8rem; color: var(--text-muted);
          line-height: 1.5; margin: 0;
        }

        /* ── Policies card ── */
        .welcome-policy-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 16px;
          padding: 1.5rem 1.4rem;
          box-shadow: var(--card-shadow);
        }
        .welcome-policy-title {
          font-size: 0.95rem; font-weight: 800;
          color: var(--text-primary); margin: 0 0 1.2rem 0;
        }
        .welcome-policy-item { margin-bottom: 1rem; }
        .welcome-policy-item:last-child { margin-bottom: 0; }
        .welcome-policy-item-title {
          font-size: 0.82rem; font-weight: 700;
          color: #2e4a87; margin: 0 0 0.25rem 0;
        }
        .sd-root.dark .welcome-policy-item-title { color: #7ba4e0; }
        .welcome-policy-item-body {
          font-size: 0.8rem; color: var(--text-muted);
          line-height: 1.55; margin: 0;
        }
      `}</style>

      <div className="welcome-page">
        <h1 className="welcome-page-title">Welcome to Faculty Appointment &amp; Consultation System (FACS)</h1>
        <p className="welcome-page-sub">Get started quickly with the guide below.</p>

        <div className="welcome-cols">
          {/* Guide card */}
          <div className="welcome-guide-card">
            <p className="welcome-guide-title">How to use FACS? (Quick Guide)</p>
            <div className="welcome-steps">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div className="welcome-step" key={i}>
                    <div className="welcome-step-icon">
                      <Icon size={20} />
                    </div>
                    <div className="welcome-step-body">
                      <p className="welcome-step-title">{step.title}</p>
                      <p className="welcome-step-desc">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Policies card */}
          <div className="welcome-policy-card">
            <p className="welcome-policy-title">Consultation Policies &amp; Code of Conduct</p>
            {policies.map((p, i) => (
              <div className="welcome-policy-item" key={i}>
                <p className="welcome-policy-item-title">{p.title}</p>
                <p className="welcome-policy-item-body">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default WelcomeContent;

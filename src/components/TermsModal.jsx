import React, { useState, useRef, useEffect } from 'react';
import { ChevronsDown } from 'lucide-react';

const termsModalStyles = `
.terms-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; padding: 1rem;
  font-family: 'Outfit', sans-serif;
}

.terms-card {
  background: #fff;
  border-radius: 14px;
  padding: 1.8rem 1.8rem 1.4rem;
  max-width: 560px; width: 100%;
  box-shadow: 0 20px 50px rgba(0,0,0,0.25);
  display: flex; flex-direction: column;
  height: 88vh; max-height: 640px;
}

.terms-card-header { flex-shrink: 0; margin-bottom: 0.25rem; }
.terms-card-header h2 {
  font-size: 1.25rem; font-weight: 800;
  color: #1a2d5a; margin: 0 0 0.2rem;
}
.terms-card-header p {
  font-size: 0.78rem; color: #6b7280; margin: 0 0 1rem;
}

.terms-body-wrap {
  flex: 1; min-height: 0;
  position: relative; margin-bottom: 1.1rem;
  overflow: hidden;
}
.terms-body {
  position: absolute; inset: 0;
  overflow-y: auto;
  font-size: 0.84rem; color: #374151; line-height: 1.7;
  padding-right: 0.5rem;
  scrollbar-width: thin;
}
.terms-body h3 {
  font-size: 0.86rem; font-weight: 700;
  color: #111827; margin: 1.1rem 0 0.3rem;
}
.terms-body h3:first-child { margin-top: 0; }
.terms-body p  { margin: 0 0 0.5rem; }
.terms-body ul { margin: 0 0 0.5rem; padding-left: 1.3rem; }
.terms-body li { margin-bottom: 0.25rem; }
.terms-body mark {
  background: #e8edf8; color: #1a2d5a;
  border-radius: 3px; padding: 0 3px;
  font-weight: 600; font-style: normal;
}

.terms-scroll-hint {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 70px; pointer-events: none;
  background: linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.98) 55%);
  display: flex; align-items: flex-end; justify-content: center;
  padding-bottom: 6px;
  transition: opacity 0.3s;
}
.terms-scroll-hint.hidden { opacity: 0; }
.terms-scroll-hint-label {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 0.72rem; font-weight: 700; color: #1a2d5a;
  letter-spacing: 0.03em;
  background: #fff; padding: 3px 10px; border-radius: 999px;
  border: 1px solid #e5e8f0;
  box-shadow: 0 2px 8px rgba(26,45,90,0.1);
  animation: scrollBounce 1.4s ease-in-out infinite;
}
@keyframes scrollBounce {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(3px); }
}

.terms-footer {
  display: flex; justify-content: flex-end; gap: 0.65rem;
  flex-shrink: 0;
}
.terms-close-btn {
  padding: 0.55rem 1.3rem; border-radius: 9px;
  border: 1.5px solid #d1d5db; background: transparent;
  color: #374151; font-size: 0.88rem; font-weight: 600;
  cursor: pointer; font-family: inherit;
  transition: border-color 0.15s, color 0.15s, opacity 0.15s;
}
.terms-close-btn:hover:not(:disabled) { border-color: #1a2d5a; color: #1a2d5a; }
.terms-close-btn:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const TermsModal = ({ onAccepted, readOnly = false }) => {
  const [scrolled, setScrolled] = useState(readOnly); // read-only: no gate
  const bodyRef = useRef(null);

  const handleScroll = () => {
    const el = bodyRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
      setScrolled(true);
    }
  };

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    if (el.scrollHeight <= el.clientHeight + 20) setScrolled(true);
  }, []);

  const canClose = readOnly || scrolled;

  return (
    <div className="terms-overlay">
      <style>{termsModalStyles}</style>
      <div className="terms-card">

        <div className="terms-card-header">
          <h2>Terms &amp; Conditions</h2>
          <p>Last updated: October, 2026</p>
        </div>

        <div className="terms-body-wrap">
          <div className="terms-body" ref={bodyRef} onScroll={handleScroll}>
            <h3>1. Who can use FACS</h3>
            <p>FACS is for <mark>institutional use only</mark>. You sign in with your <mark>official institutional email</mark> and password. Accounts are provided by the school. <strong style={{color:'#dc2626'}}>Do not share your login with anyone.</strong></p>

            <h3>2. Booking rules</h3>
            <ul>
              <li>A request is <mark>not confirmed</mark> until the faculty member <strong>approves</strong> it.</li>
              <li>A <mark>pending request</mark> holds a seat in that time slot until it is approved or declined.</li>
              <li>Students can only book open slots within the <mark>booking window</mark> set in the system.</li>
              <li>Please <strong>cancel</strong> a request or appointment you can no longer attend, so the slot can be used by others.</li>
              <li>A faculty member may decline or cancel an appointment if they become unavailable. The student will see the reason when one is given.</li>
              <li>Faculty status (<strong>Available</strong>, <strong>Busy</strong>, and so on) only affects the <mark>current day</mark>. Future dates follow the weekly hours and blocked dates.</li>
            </ul>

            <h3>3. Faculty responsibilities</h3>
            <ul>
              <li>Keep your <mark>weekly hours</mark> and <mark>blocked dates</mark> up to date.</li>
              <li>Review requests and <strong>respond on time</strong>.</li>
              <li>Change your status when you are not available.</li>
            </ul>

            <h3>4. Acceptable use</h3>
            <p>Do not:</p>
            <ul>
              <li>use another person's account</li>
              <li>send <strong style={{color:'#dc2626'}}>false or abusive messages</strong> in the notes field</li>
              <li>book slots with no plan to attend</li>
              <li>try to change data or access pages you are not allowed to use</li>
            </ul>
            <p>The school may <mark>limit or suspend access</mark> for misuse.</p>

            <h3>5. Privacy</h3>
            <p><strong>What we collect.</strong> Your name, school email, role (student or faculty), and your appointment details (date, time, topic, notes, status).</p>
            <p><strong>What others can see.</strong></p>
            <ul>
              <li>Students can see a faculty member's name, department, availability status, and open slots.</li>
              <li>Faculty can see the name and request details of the students who book them.</li>
              <li><mark>Your email and contact details are not shown to other users.</mark></li>
            </ul>
            <p><strong>How we use it.</strong> Only to schedule and manage consultations at Gordon College.</p>
            <p><strong>How we protect it.</strong> You must sign in before using the system. Students cannot view or change faculty schedules.</p>
            <p><strong>Your rights.</strong> You may ask the school to see, correct, or delete your information, in line with the <mark>Data Privacy Act of 2012 (Republic Act No. 10173)</mark>.</p>

            <h3>6. Notifications</h3>
            <p>FACS shows notifications <mark>inside the system only</mark>. It does not send email or push notifications.</p>

            <h3>7. Limits</h3>
            <p>FACS is a scheduling tool. A booking does <strong>not guarantee</strong> that a faculty member will be available if something unexpected comes up. The school is not responsible for missed meetings caused by late changes or a lack of internet access.</p>

            <h3>8. Changes and contact</h3>
            <p>We may update these terms from time to time. Continued use means you accept the changes. For questions, contact <mark>info.ccs@gordoncollege.edu.ph</mark>.</p>
          </div>

          {!readOnly && (
            <div className={`terms-scroll-hint${scrolled ? ' hidden' : ''}`}>
              <span className="terms-scroll-hint-label">
                <ChevronsDown size={13} /> Scroll to read all
              </span>
            </div>
          )}
        </div>

        <div className="terms-footer">
          <button
            className="terms-close-btn"
            disabled={!canClose}
            onClick={onAccepted}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;

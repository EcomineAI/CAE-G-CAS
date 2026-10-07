const tcStyles = `
.tc-wrap {
  display: flex; flex-direction: column;
  max-width: 700px; width: 100%;
  animation: tcIn 0.25s ease;
}
@keyframes tcIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

.tc-page-title { font-size: 1.3rem; font-weight: 800; color: var(--text-primary); margin: 0 0 0.1rem; }
.tc-page-sub   { font-size: 0.8rem; color: var(--text-muted); margin: 0 0 1.2rem; }

.tc-card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--card-border, #e5e8f0);
  border-radius: 12px;
  padding: 1.1rem 1.4rem;
  margin-bottom: 0.85rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  font-size: 0.88rem; color: var(--text-secondary); line-height: 1.75;
}

.tc-card-title {
  font-size: 0.95rem; font-weight: 800;
  color: var(--text-primary); margin: 0 0 0.65rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color, #e5e8f0);
}

.tc-card p  { margin: 0 0 0.5rem; }
.tc-card p:last-child { margin-bottom: 0; }
.tc-card ul { margin: 0 0 0.5rem; padding-left: 1.3rem; }
.tc-card li { margin-bottom: 0.25rem; }

.tc-card mark {
  background: #e8edf8; color: #1a2d5a;
  border-radius: 3px; padding: 0 3px;
  font-weight: 600;
}
`;

const FacultyTermsContent = () => (
  <>
    <style>{tcStyles}</style>
    <div className="tc-wrap">
      <p className="tc-page-title">Terms &amp; Conditions</p>
      <p className="tc-page-sub">Last updated: October, 2026</p>

      <div className="tc-card">
        <p className="tc-card-title">1. Who can use FACS</p>
        <p>FACS is for <mark>institutional use only</mark>. You sign in with your <mark>official institutional email</mark> and password. Accounts are provided by the school. <strong style={{color:'#dc2626'}}>Do not share your login with anyone.</strong></p>
      </div>

      <div className="tc-card">
        <p className="tc-card-title">2. Booking rules</p>
        <ul>
          <li>A request is <mark>not confirmed</mark> until the faculty member <strong>approves</strong> it.</li>
          <li>A <mark>pending request</mark> holds a seat in that time slot until it is approved or declined.</li>
          <li>Students can only book open slots within the <mark>booking window</mark> set in the system.</li>
          <li>Please <strong>cancel</strong> a request or appointment you can no longer attend, so the slot can be used by others.</li>
          <li>A faculty member may decline or cancel an appointment if they become unavailable. The student will see the reason when one is given.</li>
          <li>Faculty status (<strong>Available</strong>, <strong>Busy</strong>, and so on) only affects the <mark>current day</mark>. Future dates follow the weekly hours and blocked dates.</li>
        </ul>
      </div>

      <div className="tc-card">
        <p className="tc-card-title">3. Faculty responsibilities</p>
        <ul>
          <li>Keep your <mark>weekly hours</mark> and <mark>blocked dates</mark> up to date.</li>
          <li>Review requests and <strong>respond on time</strong>.</li>
          <li>Change your status when you are not available.</li>
        </ul>
      </div>

      <div className="tc-card">
        <p className="tc-card-title">4. Acceptable use</p>
        <p>Do not:</p>
        <ul>
          <li>use another person's account</li>
          <li>send <strong style={{color:'#dc2626'}}>false or abusive messages</strong> in the notes field</li>
          <li>book slots with no plan to attend</li>
          <li>try to change data or access pages you are not allowed to use</li>
        </ul>
        <p>The school may <mark>limit or suspend access</mark> for misuse.</p>
      </div>

      <div className="tc-card">
        <p className="tc-card-title">5. Privacy</p>
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
      </div>

      <div className="tc-card">
        <p className="tc-card-title">6. Notifications</p>
        <p>FACS shows notifications <mark>inside the system only</mark>. It does not send email or push notifications.</p>
      </div>

      <div className="tc-card">
        <p className="tc-card-title">7. Limits</p>
        <p>FACS is a scheduling tool. A booking does <strong>not guarantee</strong> that a faculty member will be available if something unexpected comes up. The school is not responsible for missed meetings caused by late changes or a lack of internet access.</p>
      </div>

      <div className="tc-card">
        <p className="tc-card-title">8. Changes and contact</p>
        <p>We may update these terms from time to time. Continued use means you accept the changes. For questions, contact <mark>info.ccs@gordoncollege.edu.ph</mark>.</p>
      </div>
    </div>
  </>
);

export default FacultyTermsContent;

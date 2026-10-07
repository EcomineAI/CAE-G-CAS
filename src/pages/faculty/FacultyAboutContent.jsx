const aboutStyles = `
.ab-wrap {
  display: flex; flex-direction: column; gap: 1.2rem;
  max-width: 900px;
  width: 100%;
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

.ab-page-title { font-size: 1.55rem; font-weight: 800; color: var(--text-primary); margin: 0 0 0.1rem; }
.ab-page-sub   { font-size: 0.85rem; color: var(--text-muted); margin: 0 0 0.5rem; }

.ab-card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--card-border, #e5e8f0);
  border-radius: 14px;
  padding: 1.3rem 1.5rem;
  box-shadow: var(--card-shadow, 0 1px 6px rgba(0,0,0,0.05));
  font-size: 0.9rem; color: var(--text-secondary); line-height: 1.65;
}

.ab-card p { margin: 0 0 0.8rem; }
.ab-card p:last-child { margin-bottom: 0; }

.ab-bold { font-weight: 700; color: var(--text-primary); }

.ab-section-title {
  font-size: 1.05rem; font-weight: 800;
  color: var(--text-primary); margin: 0 0 0.75rem;
}

.ab-two-col {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;
  margin-top: 0.5rem;
}
.ab-col-title {
  font-size: 0.88rem; font-weight: 700;
  color: var(--text-primary); margin: 0 0 0.5rem;
}
.ab-ul {
  margin: 0; padding-left: 1.2rem;
  font-size: 0.85rem; color: var(--text-secondary); line-height: 1.7;
}

.ab-how-list {
  margin: 0; padding-left: 1.2rem;
  font-size: 0.88rem; color: var(--text-secondary); line-height: 1.8;
}

.ab-project-card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--card-border, #e5e8f0);
  border-radius: 14px;
  padding: 1.3rem 1.5rem;
  box-shadow: var(--card-shadow, 0 1px 6px rgba(0,0,0,0.05));
  font-size: 0.88rem; color: var(--text-secondary); line-height: 1.7;
}
.ab-project-title {
  font-size: 0.9rem; font-weight: 800;
  color: var(--text-primary); margin: 0 0 0.6rem;
}
.ab-project-card p { margin: 0 0 0.5rem; }
.ab-project-card p:last-child { margin-bottom: 0; }

.ab-contact-title {
  font-size: 0.9rem; font-weight: 800;
  color: var(--text-primary); margin: 0.9rem 0 0.4rem;
}

@media (max-width: 600px) {
  .ab-two-col { grid-template-columns: 1fr; gap: 1rem; }
}
`;

const FacultyAboutContent = () => (
  <div className="ab-wrap">
    <style>{aboutStyles}</style>

    <p className="ab-page-title">About FACS</p>
    <p className="ab-page-sub">Faculty Appointment and Consultation System</p>

    {/* What is FACS */}
    <div className="ab-card">
      <p>
        <span className="ab-bold">FACS</span> is a web system for scheduling consultations between students and faculty in the College of Computer Studies at Gordon College.
      </p>
      <p>
        <span className="ab-bold">Why we built it</span><br />
        Consultation hours are often announced but not followed. Students go to the faculty office and find the instructor is out, in a meeting, or busy. FACS lets students see when a faculty member is available and request a time, so nobody wastes a trip.
      </p>
    </div>

    {/* What you can do */}
    <div className="ab-card">
      <p className="ab-section-title" style={{ margin: '0 0 0.6rem' }}>What you can do</p>
      <div className="ab-two-col">
        <div>
          <p className="ab-col-title">Students</p>
          <ul className="ab-ul">
            <li>See faculty availability and open time slots</li>
            <li>Request a consultation with a topic and an optional note</li>
            <li>Check whether a request is pending, approved, or declined</li>
          </ul>
        </div>
        <div>
          <p className="ab-col-title">Faculty</p>
          <ul className="ab-ul">
            <li>Set weekly consultation hours</li>
            <li>Set a live status (Available, Busy, In a meeting, Out of office)</li>
            <li>Approve or decline student requests</li>
            <li>Block dates when you are away</li>
          </ul>
        </div>
      </div>
    </div>

    {/* How booking works */}
    <div className="ab-card">
      <p className="ab-section-title" style={{ margin: '0 0 0.6rem' }}>How booking works</p>
      <ol className="ab-how-list">
        <li>The faculty member sets their consultation hours.</li>
        <li>A student picks a date and time slot and sends a request.</li>
        <li>The faculty member approves or declines it.</li>
        <li>The student sees the result in the system.</li>
      </ol>
    </div>

    {/* About the project */}
    <div className="ab-project-card">
      <p className="ab-project-title">About the project</p>
      <p>
        FACS was built as a final course project at the Gordon College College of Computer Studies, Olongapo City.
      </p>
      <ul className="ab-ul" style={{ marginBottom: '0.6rem' }}>
        <li><span className="ab-bold">Team:</span> Ctrl Alt Elite (CAE)</li>
        <li><span className="ab-bold">Members:</span> June Vic M. Abello, Erica Mae D. Camintoy, Ma. Erica Monton</li>
        <li><span className="ab-bold">Version:</span> 0.10.0 &nbsp;|&nbsp; Year: 2026</li>
      </ul>
      <p className="ab-contact-title">Contact</p>
      <p>
        For questions or problems, contact the College of Computer Studies at{' '}
        <span className="ab-bold">info.ccs@gordoncollege.edu.ph</span> or <span className="ab-bold">(047) 222-4080 loc. 319</span>.
      </p>
    </div>
  </div>
);

export default FacultyAboutContent;

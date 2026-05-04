import React from 'react';
import logo from '../logo.png';

const aboutStyles = `
.about-page {
  animation: fadeIn 0.5s ease;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.about-header-box {
  background: var(--bg-secondary);
  border: 1.5px solid var(--accent-orange);
  border-radius: 24px;
  padding: 2.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.about-logo-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 0.5rem;
}

.about-logo-img {
  width: 70px;
  height: auto;
}

.about-brand-title {
  font-size: 3.5rem;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -1px;
}

.about-brand-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  font-weight: 500;
  margin: 0;
  font-family: monospace;
}

.about-card {
  background: var(--bg-secondary);
  border: 1px solid var(--card-border);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: var(--shadow);
}

.about-card h3 {
  font-size: 1.3rem;
  color: var(--text-primary);
  margin: 0 0 1.2rem 0;
  font-weight: 600;
}

.about-card p {
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.team-member {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--bg-primary);
  padding: 1.2rem;
  border-radius: 20px;
  border: 1px solid var(--border-color);
}

.member-avatar {
  width: 55px;
  height: 55px;
  background: #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-info h4 {
  font-size: 1.05rem;
  color: var(--text-primary);
  margin: 0;
  font-weight: 700;
}

.member-info p {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0.1rem 0 0 0;
  font-weight: 500;
}

.former-badge {
  font-size: 0.75rem;
  color: var(--accent-orange);
  font-style: italic;
}

@media (max-width: 600px) {
  .about-header-box {
    padding: 1.5rem 1rem;
    border-radius: 16px;
  }

  .about-logo-img {
    width: 45px;
  }

  .about-brand-title {
    font-size: 2.2rem;
  }

  .about-brand-subtitle {
    font-size: 0.8rem;
  }

  .about-card {
    padding: 1.2rem;
    border-radius: 16px;
  }

  .about-card h3 {
    font-size: 1.1rem;
    margin-bottom: 0.8rem;
  }

  .about-card p {
    font-size: 0.85rem;
  }

  .team-grid {
    gap: 0.8rem;
  }

  .team-member {
    padding: 1rem;
    gap: 1.2rem;
    border-radius: 16px;
    flex-direction: row;
    background: var(--bg-secondary);
    border: 1px solid var(--card-border);
  }

  .member-avatar {
    width: 48px;
    height: 48px;
  }

  .member-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    text-align: left;
  }

  .member-info h4 {
    font-size: 1.1rem;
    font-weight: 800;
  }

  .member-info p {
    font-size: 0.85rem;
    margin-top: 0.1rem;
    font-weight: 500;
  }
}
`;

const AboutContent = () => {
  const team = [
    { name: 'June Vic M. Abello', role: 'BSCS 2A', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=June' },
    { name: 'Erica Mae D. Camintoy', role: 'BSCS 2A', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Camintoy' },
    { name: 'Erica Monton', role: 'Former Member', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Monton' },
  ];

  return (
    <div className="about-page">
      <style>{aboutStyles}</style>

      <div className="about-header-box">
        <div className="about-logo-row">
          <img src={logo} alt="G-CAS Logo" className="about-logo-img" />
          <h1 className="about-brand-title">G-CAS</h1>
        </div>
        <p className="about-brand-subtitle">Gordon College Appointment System</p>
      </div>

      <div className="about-card">
        <h3>About the System</h3>
        <p>
          GCAS is a system that records and displays the real-time availability of CCS faculty members for student consultations. 
          The system allows faculty members to set and update their consultation schedules, indicate real-time availability status 
          (Available or Unavailable), and manage appointment requests submitted by students. Students can view instructor availability, 
          see available consultation slots, and monitor their scheduled consultations through the system.
        </p>
      </div>

      <div className="about-card">
        <h3>Project Team</h3>
        <div className="team-grid">
          {team.map((member, idx) => (
            <div className="team-member" key={idx}>
              <div className="member-avatar">
                <img src={member.avatar} alt={member.name} />
              </div>
              <div className="member-info">
                <h4>{member.name}</h4>
                <p>{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutContent;

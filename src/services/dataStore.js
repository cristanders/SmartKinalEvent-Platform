/**
 * DataStore Service
 * Provides thread-safe in-memory state management pre-populated with rich,
 * realistic hackathon data for out-of-the-box demo execution.
 */

class DataStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.participants = [
      {
        id: "usr-101",
        name: "Elena Rostova",
        email: "elena.rostova@tech.edu",
        role: "Team Lead",
        skills: ["Node.js", "Express", "TailwindCSS", "System Architecture"],
        interests: ["AI Analytics", "Smart Cities", "Sustainability"],
        bio: "Full-stack engineer passionate about cloud-native systems and green tech.",
        checkedIn: true,
        checkInTime: "2026-08-29T08:15:00Z",
        qrCode: "SKEP-usr-101-8A7F",
        teamId: "team-01",
        createdAt: "2026-08-29T08:00:00Z"
      },
      {
        id: "usr-102",
        name: "Marcus Vance",
        email: "marcus.v@devcraft.io",
        role: "AI/ML Developer",
        skills: ["Python", "TensorFlow", "PyTorch", "Node.js", "Data Science"],
        interests: ["AI Analytics", "Predictive Models", "Smart Cities"],
        bio: "Machine learning researcher focused on scalable real-time inference.",
        checkedIn: true,
        checkInTime: "2026-08-29T08:22:00Z",
        qrCode: "SKEP-usr-102-3B9C",
        teamId: "team-01",
        createdAt: "2026-08-29T08:05:00Z"
      },
      {
        id: "usr-103",
        name: "Sophia Chen",
        email: "sophia.chen@designhub.org",
        role: "UI/UX Designer",
        skills: ["Figma", "TailwindCSS", "Accessibility", "Design Systems"],
        interests: ["Smart Cities", "Healthcare", "UX Research"],
        bio: "Accessibility-first designer creating intuitive human-computer interfaces.",
        checkedIn: false,
        checkInTime: null,
        qrCode: "SKEP-usr-103-9D2E",
        teamId: null,
        createdAt: "2026-08-29T08:10:00Z"
      },
      {
        id: "usr-104",
        name: "David Kinal",
        email: "david.k@kinal.gt",
        role: "Backend Architect",
        skills: ["Node.js", "Docker", "Google Cloud", "PostgreSQL", "Go"],
        interests: ["Cloud Infrastructure", "DevOps", "AI Analytics"],
        bio: "Backend cloud enthusiast specialized in microservices and Kubernetes.",
        checkedIn: true,
        checkInTime: "2026-08-29T08:45:00Z",
        qrCode: "SKEP-usr-104-5F1A",
        teamId: "team-02",
        createdAt: "2026-08-29T08:12:00Z"
      },
      {
        id: "usr-105",
        name: "Amara Okafor",
        email: "amara.o@innovate.africa",
        role: "Frontend Specialist",
        skills: ["JavaScript", "TailwindCSS", "WebSockets", "React"],
        interests: ["FinTech", "Sustainability", "Healthcare"],
        bio: "Building hyper-performant real-time frontend experiences.",
        checkedIn: true,
        checkInTime: "2026-08-29T09:05:00Z",
        qrCode: "SKEP-usr-105-7E4C",
        teamId: null,
        createdAt: "2026-08-29T08:15:00Z"
      }
    ];

    this.teams = [
      {
        id: "team-01",
        name: "EcoPulse Tech",
        leaderId: "usr-101",
        members: ["usr-101", "usr-102"],
        projectInterest: "Smart Cities & Environmental AI",
        createdAt: "2026-08-29T08:30:00Z"
      },
      {
        id: "team-02",
        name: "CloudGuard AI",
        leaderId: "usr-104",
        members: ["usr-104"],
        projectInterest: "Cloud Infrastructure Security",
        createdAt: "2026-08-29T08:50:00Z"
      }
    ];

    this.invitations = [];

    this.announcements = [
      {
        id: "ann-01",
        title: "Welcome to SmartKinal Hackathon 2026!",
        message: "Keynote presentation begins in Main Hall A at 10:00 AM. Ensure your QR badge is checked in.",
        category: "Urgent",
        author: "Organizer Team",
        timestamp: "2026-08-29T08:00:00Z"
      },
      {
        id: "ann-02",
        title: "Mentorship Office Hours Open",
        message: "Cloud and AI mentors are available in Room 302 until 2:00 PM for team guidance.",
        category: "Workshop",
        author: "Technical Mentor Lead",
        timestamp: "2026-08-29T08:30:00Z"
      },
      {
        id: "ann-03",
        title: "Judging Rubrics Released",
        message: "Review the evaluation criteria under the Judging tab. Submissions close at 6:00 PM sharp.",
        category: "Info",
        author: "Head Judge",
        timestamp: "2026-08-29T09:00:00Z"
      }
    ];

    this.projects = [
      {
        id: "proj-01",
        teamId: "team-01",
        title: "EcoPulse: AI Air Quality Predictor",
        track: "Smart Cities & Sustainability",
        description: "Real-time municipal air pollution telemetry visualizer with ML forecasting and instant alerts.",
        repoUrl: "https://github.com/smartkinal/ecopulse-ai",
        demoUrl: "https://ecopulse-demo.run.app",
        submittedAt: "2026-08-29T09:30:00Z"
      },
      {
        id: "proj-02",
        teamId: "team-02",
        title: "CloudGuard: Automated Zero-Trust Auditor",
        track: "Cloud Security & Infrastructure",
        description: "Continuous IAM and bucket security policy vulnerability scanner built for Google Cloud Platform.",
        repoUrl: "https://github.com/smartkinal/cloudguard-sec",
        demoUrl: "https://cloudguard-demo.run.app",
        submittedAt: "2026-08-29T09:40:00Z"
      }
    ];

    this.judgingScores = [
      {
        id: "score-01",
        projectId: "proj-01",
        judgeId: "judge-01",
        judgeName: "Dr. Aris Thorne",
        rubric: {
          innovation: 9,      // 25%
          techComplexity: 9,  // 25%
          uiUx: 10,           // 20%
          impact: 9,          // 15%
          presentation: 8     // 15%
        },
        feedback: "Outstanding real-time architecture with clean UI accessibility and clear social impact.",
        timestamp: "2026-08-29T10:00:00Z"
      },
      {
        id: "score-02",
        projectId: "proj-02",
        judgeId: "judge-02",
        judgeName: "Prof. Maria Santos",
        rubric: {
          innovation: 8,
          techComplexity: 10,
          uiUx: 7,
          impact: 9,
          presentation: 9
        },
        feedback: "Technically rigorous cloud security automation tool with solid demonstration.",
        timestamp: "2026-08-29T10:15:00Z"
      }
    ];

    this.activityLog = [
      {
        id: "act-01",
        type: "REGISTRATION",
        message: "Elena Rostova registered as Team Lead",
        timestamp: "2026-08-29T08:00:00Z"
      },
      {
        id: "act-02",
        type: "CHECKIN",
        message: "Elena Rostova checked in via QR Scanner",
        timestamp: "2026-08-29T08:15:00Z"
      },
      {
        id: "act-03",
        type: "TEAM_FORMATION",
        message: "Team EcoPulse Tech formed with 2 members",
        timestamp: "2026-08-29T08:30:00Z"
      },
      {
        id: "act-04",
        type: "JUDGING",
        message: "Dr. Aris Thorne submitted evaluation for EcoPulse: AI Air Quality Predictor",
        timestamp: "2026-08-29T10:00:00Z"
      }
    ];
  }

  // Helper Methods for Participants
  getParticipants() {
    return this.participants;
  }

  getParticipantById(id) {
    return this.participants.find(p => p.id === id || p.qrCode === id);
  }

  addParticipant(data) {
    const newId = `usr-${Date.now().toString(36)}`;
    const qrCode = `SKEP-${newId}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const participant = {
      id: newId,
      name: data.name,
      email: data.email,
      role: data.role || "Participant",
      skills: Array.isArray(data.skills) ? data.skills : (data.skills ? data.skills.split(',').map(s => s.trim()) : []),
      interests: Array.isArray(data.interests) ? data.interests : (data.interests ? data.interests.split(',').map(i => i.trim()) : []),
      bio: data.bio || "",
      checkedIn: false,
      checkInTime: null,
      qrCode,
      teamId: null,
      createdAt: new Date().toISOString()
    };
    this.participants.push(participant);
    this.addActivity("REGISTRATION", `${participant.name} registered as ${participant.role}`);
    return participant;
  }

  checkInParticipant(identifier) {
    const p = this.participants.find(item => item.id === identifier || item.qrCode === identifier || item.email.toLowerCase() === identifier.toLowerCase());
    if (!p) return { success: false, error: "Participant badge or email not found" };
    
    if (p.checkedIn) {
      return { success: true, alreadyCheckedIn: true, participant: p };
    }

    p.checkedIn = true;
    p.checkInTime = new Date().toISOString();
    this.addActivity("CHECKIN", `${p.name} checked in via QR Scanner Simulator`);
    return { success: true, alreadyCheckedIn: false, participant: p };
  }

  // Helper Methods for Announcements
  getAnnouncements() {
    return this.announcements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  addAnnouncement(data) {
    const announcement = {
      id: `ann-${Date.now().toString(36)}`,
      title: data.title,
      message: data.message,
      category: data.category || "Info",
      author: data.author || "Event Organizer",
      timestamp: new Date().toISOString()
    };
    this.announcements.push(announcement);
    this.addActivity("BROADCAST", `New Broadcast: "${announcement.title}" (${announcement.category})`);
    return announcement;
  }

  // Helper Methods for Projects & Judging
  getProjects() {
    return this.projects.map(proj => {
      const team = this.teams.find(t => t.id === proj.teamId);
      return {
        ...proj,
        teamName: team ? team.name : "Independent"
      };
    });
  }

  addProject(data) {
    const project = {
      id: `proj-${Date.now().toString(36)}`,
      teamId: data.teamId || "team-01",
      title: data.title,
      track: data.track || "General Innovation",
      description: data.description,
      repoUrl: data.repoUrl || "",
      demoUrl: data.demoUrl || "",
      submittedAt: new Date().toISOString()
    };
    this.projects.push(project);
    this.addActivity("PROJECT_SUBMIT", `New Project Submitted: "${project.title}"`);
    return project;
  }

  getJudgingScores() {
    return this.judgingScores;
  }

  addJudgingScore(data) {
    const scoreEntry = {
      id: `score-${Date.now().toString(36)}`,
      projectId: data.projectId,
      judgeId: data.judgeId || "judge-default",
      judgeName: data.judgeName || "Event Judge",
      rubric: {
        innovation: Number(data.rubric.innovation) || 5,
        techComplexity: Number(data.rubric.techComplexity) || 5,
        uiUx: Number(data.rubric.uiUx) || 5,
        impact: Number(data.rubric.impact) || 5,
        presentation: Number(data.rubric.presentation) || 5
      },
      feedback: data.feedback || "",
      timestamp: new Date().toISOString()
    };

    // Update existing score or append
    const existingIndex = this.judgingScores.findIndex(
      s => s.projectId === data.projectId && s.judgeId === scoreEntry.judgeId
    );
    if (existingIndex >= 0) {
      this.judgingScores[existingIndex] = scoreEntry;
    } else {
      this.judgingScores.push(scoreEntry);
    }

    const proj = this.projects.find(p => p.id === data.projectId);
    this.addActivity("JUDGING", `Score submitted for "${proj ? proj.title : data.projectId}" by ${scoreEntry.judgeName}`);
    return scoreEntry;
  }

  // Activity Log
  addActivity(type, message) {
    const entry = {
      id: `act-${Date.now().toString(36)}`,
      type,
      message,
      timestamp: new Date().toISOString()
    };
    this.activityLog.unshift(entry);
    if (this.activityLog.length > 50) this.activityLog.pop();
    return entry;
  }

  getActivityLog() {
    return this.activityLog;
  }
}

// Export singleton instance
const dataStore = new DataStore();
module.exports = dataStore;

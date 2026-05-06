/**
 * Patient Queue Manager - AfyaCare Tanzania
 * 
 * Hospital patient workflow management for clinicians and CHWs
 * Features: Queue tracking, clinical notes, lab orders, medication dispensing
 */

import { useState, useEffect } from 'react';
import { patientQueueApi } from '@/app/services/patientQueueApi';
import type { PatientQueueItem, ClinicalNote, LabOrder, MedicationDispense } from '@/app/services/patientQueueApi';
import { toast } from 'sonner';

const COLORS = {
  primary: "#0F3D56",
  teal: "#1B998B",
  tealLight: "#E8F5F3",
  tealMid: "#0D7A6E",
  red: "#C84B31",
  redLight: "#FDF0ED",
  amber: "#E8A020",
  amberLight: "#FDF6E8",
  green: "#2E7D32",
  greenLight: "#EDF7EE",
  blue: "#1565C0",
  blueLight: "#E8F0FB",
  neutral50: "#F7F9FC",
  neutral100: "#EEF1F6",
  neutral200: "#D8DDE8",
  neutral400: "#8A93A8",
  neutral600: "#4A5568",
  neutral800: "#1E2433",
  white: "#FFFFFF",
};

interface RiskBadgeProps {
  risk: 'low' | 'medium' | 'high';
}

function RiskBadge({ risk }: RiskBadgeProps) {
  const configs = {
    high: { label: "High risk", bg: COLORS.redLight, text: COLORS.red, dot: COLORS.red },
    medium: { label: "Moderate", bg: COLORS.amberLight, text: "#9A6200", dot: COLORS.amber },
    low: { label: "Low risk", bg: COLORS.greenLight, text: COLORS.green, dot: COLORS.green },
  };
  const cfg = configs[risk];

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 8px", borderRadius: 20,
      background: cfg.bg, color: cfg.text,
      fontSize: 11, fontWeight: 500, letterSpacing: 0.2
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
      {cfg.label}
    </span>
  );
}

interface StatusBadgeProps {
  status: string;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const configs: Record<string, { bg: string; text: string }> = {
    "Waiting": { bg: "#EEF1F6", text: COLORS.neutral600 },
    "In Consultation": { bg: COLORS.blueLight, text: COLORS.blue },
    "Completed": { bg: COLORS.greenLight, text: COLORS.green },
  };
  const c = configs[status] || configs["Waiting"];

  return (
    <span style={{
      padding: "3px 8px", borderRadius: 20,
      background: c.bg, color: c.text,
      fontSize: 11, fontWeight: 500
    }}>{status}</span>
  );
}

interface VitalsProps {
  patient: PatientQueueItem;
}

function Vitals({ patient }: VitalsProps) {
  const vitals = [
    { label: "BP", value: patient.blood_pressure || "—", alert: patient.blood_pressure && parseInt(patient.blood_pressure) > 140 },
    { label: "HR", value: patient.heart_rate ? `${patient.heart_rate} bpm` : "—", alert: patient.heart_rate && patient.heart_rate > 100 },
    { label: "Temp", value: patient.temperature ? `${patient.temperature}°C` : "—", alert: patient.temperature && patient.temperature > 38 },
    { label: "SpO₂", value: patient.oxygen_saturation ? `${patient.oxygen_saturation}%` : "—", alert: patient.oxygen_saturation && patient.oxygen_saturation < 95 },
  ];

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
      {vitals.map(v => (
        <span key={v.label} style={{
          padding: "2px 8px", borderRadius: 6,
          background: v.alert ? COLORS.redLight : COLORS.neutral100,
          color: v.alert ? COLORS.red : COLORS.neutral600,
          fontSize: 11, fontFamily: "monospace"
        }}>
          <span style={{ color: COLORS.neutral400, marginRight: 3 }}>{v.label}</span>
          {v.value}
        </span>
      ))}
      {patient.is_pregnant && (
        <span style={{
          padding: "2px 8px", borderRadius: 6,
          background: "#F3E8FF", color: "#6B21A8",
          fontSize: 11, fontWeight: 500
        }}>
          Pregnant · {patient.weeks_gestation}w
        </span>
      )}
    </div>
  );
}

interface QueuePanelProps {
  patients: PatientQueueItem[];
  selectedId?: string;
  onSelect: (patient: PatientQueueItem) => void;
  filter: string;
  onFilterChange: (filter: string) => void;
}

function QueuePanel({ patients, selectedId, onSelect, filter, onFilterChange }: QueuePanelProps) {
  const filters = ["All", "High risk", "OPD", "Emergency", "Maternity", "Paediatrics"];
  
  const filtered = patients.filter(p => {
    if (filter === "All") return true;
    if (filter === "High risk") return p.risk_level === "high";
    return p.department === filter;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${COLORS.neutral200}` }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {filters.map(f => (
            <button key={f} onClick={() => onFilterChange(f)} style={{
              padding: "4px 10px", borderRadius: 16,
              background: filter === f ? COLORS.primary : COLORS.neutral100,
              color: filter === f ? "#fff" : COLORS.neutral600,
              border: "none", fontSize: 11, fontWeight: 500, cursor: "pointer"
            }}>{f}</button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filtered.map((p, i) => (
          <div key={p.id} onClick={() => onSelect(p)} style={{
            padding: "12px 16px",
            background: selectedId === p.id ? COLORS.tealLight : i % 2 === 0 ? COLORS.white : COLORS.neutral50,
            borderLeft: selectedId === p.id ? `3px solid ${COLORS.teal}` : "3px solid transparent",
            borderBottom: `1px solid ${COLORS.neutral100}`,
            cursor: "pointer", transition: "background 0.1s"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
              <div>
                <span style={{ fontWeight: 500, fontSize: 13, color: COLORS.neutral800 }}>{p.patient_name}</span>
                <span style={{ color: COLORS.neutral400, fontSize: 11, marginLeft: 6 }}>
                  {p.age}{p.sex} · {p.patient_id}
                </span>
              </div>
              <RiskBadge risk={p.risk_level} />
            </div>
            <p style={{ margin: 0, fontSize: 12, color: COLORS.neutral600, marginBottom: 4 }}>{p.complaint}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: COLORS.neutral400 }}>
                {p.department} · Arrived {new Date(p.arrival_time).toLocaleTimeString('en-TZ', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <StatusBadge status={p.status} />
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: COLORS.neutral400 }}>
            No patients in queue
          </div>
        )}
      </div>
    </div>
  );
}

interface PatientDetailProps {
  patient: PatientQueueItem | null;
}

function PatientDetail({ patient }: PatientDetailProps) {
  const [tab, setTab] = useState("overview");
  const [clinicalNote, setClinicalNote] = useState<ClinicalNote | null>(null);
  const [labs, setLabs] = useState<LabOrder[]>([]);
  const [medications, setMedications] = useState<MedicationDispense[]>([]);

  useEffect(() => {
    if (patient) {
      loadPatientData();
    }
  }, [patient?.id]);

  async function loadPatientData() {
    if (!patient) return;
    
    try {
      const [note, labOrders, meds] = await Promise.all([
        patientQueueApi.getClinicalNote(patient.id),
        patientQueueApi.getLabOrders(patient.id),
        patientQueueApi.getMedications(patient.id),
      ]);
      
      setClinicalNote(note);
      setLabs(labOrders);
      setMedications(meds);
    } catch (error) {
    }
  }

  if (!patient) {
    return (
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        color: COLORS.neutral400, gap: 12
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={COLORS.neutral200} strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <p style={{ fontSize: 13, margin: 0 }}>Select a patient to view details</p>
      </div>
    );
  }

  const tabs = ["Overview", "Vitals", "Documentation", "Labs", "Medications", "Audit"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: COLORS.white }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: `1px solid ${COLORS.neutral200}`,
        background: patient.risk_level === "high" ? COLORS.redLight : COLORS.white
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: COLORS.tealLight, display: "flex",
              alignItems: "center", justifyContent: "center",
              fontWeight: 600, fontSize: 16, color: COLORS.tealMid
            }}>
              {patient.patient_name.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: COLORS.neutral800 }}>
                  {patient.patient_name}
                </h3>
                <RiskBadge risk={patient.risk_level} />
              </div>
              <p style={{ margin: 0, fontSize: 12, color: COLORS.neutral400, marginTop: 2 }}>
                {patient.age}y · {patient.sex === "F" ? "Female" : "Male"} · {patient.patient_id} · {patient.department}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {patient.risk_level === "high" && (
              <button style={{
                padding: "7px 14px", borderRadius: 8,
                background: COLORS.red, color: "#fff",
                border: "none", fontSize: 12, fontWeight: 500, cursor: "pointer"
              }}>Escalate</button>
            )}
            <button 
              onClick={async () => {
                try {
                  await patientQueueApi.updatePatient(patient.id, { status: 'In Consultation' });
                  toast.success('Consultation started');
                } catch (error) {
                  toast.error('Failed to start consultation');
                }
              }}
              style={{
                padding: "7px 14px", borderRadius: 8,
                background: COLORS.teal, color: "#fff",
                border: "none", fontSize: 12, fontWeight: 500, cursor: "pointer"
              }}
            >
              Begin consultation
            </button>
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <Vitals patient={patient} />
        </div>

        <div style={{
          marginTop: 10, padding: "8px 12px",
          background: COLORS.neutral50, borderRadius: 8,
          borderLeft: `3px solid ${COLORS.neutral200}`
        }}>
          <span style={{ fontSize: 11, color: COLORS.neutral400, display: "block", marginBottom: 2 }}>
            Chief complaint
          </span>
          <p style={{ margin: 0, fontSize: 13, color: COLORS.neutral800 }}>{patient.complaint}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${COLORS.neutral200}`, paddingLeft: 20 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t.toLowerCase())} style={{
            padding: "10px 14px",
            background: "none", border: "none",
            borderBottom: tab === t.toLowerCase() ? `2px solid ${COLORS.teal}` : "2px solid transparent",
            color: tab === t.toLowerCase() ? COLORS.teal : COLORS.neutral400,
            fontSize: 12, fontWeight: 500, cursor: "pointer"
          }}>{t}</button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {patient.risk_level === "high" && (
              <div style={{
                padding: 12, borderRadius: 8,
                background: COLORS.redLight,
                border: `1px solid ${COLORS.red}30`,
                display: "flex", gap: 10, alignItems: "flex-start"
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.red} strokeWidth="2" style={{ marginTop: 1, flexShrink: 0 }}>
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <div>
                  <p style={{ margin: 0, fontWeight: 500, fontSize: 13, color: COLORS.red }}>
                    Immediate clinical attention required
                  </p>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: COLORS.red }}>
                    {patient.is_pregnant
                      ? `Elevated BP at ${patient.weeks_gestation} weeks gestation — possible pre-eclampsia. Escalate to obstetrician.`
                      : "Elevated vitals detected. Review and escalate if needed."}
                  </p>
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "Department", value: patient.department },
                { label: "Arrival time", value: new Date(patient.arrival_time).toLocaleTimeString('en-TZ') },
                { label: "Status", value: patient.status },
                { label: "Condition", value: patient.is_pregnant ? `Pregnant · ${patient.weeks_gestation} weeks` : "Not pregnant" },
              ].map(item => (
                <div key={item.label} style={{
                  padding: 12, borderRadius: 8,
                  background: COLORS.neutral50,
                  border: `1px solid ${COLORS.neutral200}`
                }}>
                  <p style={{ margin: 0, fontSize: 11, color: COLORS.neutral400 }}>{item.label}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 13, fontWeight: 500, color: COLORS.neutral800 }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "vitals" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "Blood pressure", value: patient.blood_pressure || "—", unit: "mmHg", alert: patient.blood_pressure && parseInt(patient.blood_pressure) > 140 },
              { label: "Heart rate", value: patient.heart_rate?.toString() || "—", unit: "bpm", alert: patient.heart_rate && patient.heart_rate > 100 },
              { label: "Temperature", value: patient.temperature?.toString() || "—", unit: "°C", alert: patient.temperature && patient.temperature > 38 },
              { label: "Oxygen saturation", value: patient.oxygen_saturation?.toString() || "—", unit: "%", alert: patient.oxygen_saturation && patient.oxygen_saturation < 95 },
            ].map(v => (
              <div key={v.label} style={{
                padding: 16, borderRadius: 10,
                background: v.alert ? COLORS.redLight : COLORS.neutral50,
                border: `1px solid ${v.alert ? COLORS.red + "40" : COLORS.neutral200}`
              }}>
                <p style={{ margin: 0, fontSize: 11, color: v.alert ? COLORS.red : COLORS.neutral400 }}>{v.label}</p>
                <p style={{ margin: "6px 0 0", fontSize: 24, fontWeight: 600, color: v.alert ? COLORS.red : COLORS.neutral800, fontFamily: "monospace" }}>
                  {v.value}<span style={{ fontSize: 13, fontWeight: 400, marginLeft: 4 }}>{v.unit}</span>
                </p>
                {v.alert && <p style={{ margin: "4px 0 0", fontSize: 11, color: COLORS.red }}>Outside normal range</p>}
              </div>
            ))}
          </div>
        )}

        {tab === "labs" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>Lab orders</p>
              <button style={{
                padding: "6px 12px", borderRadius: 8,
                border: `1px solid ${COLORS.teal}`, color: COLORS.teal,
                background: "none", fontSize: 12, fontWeight: 500, cursor: "pointer"
              }}>+ New order</button>
            </div>
            {labs.length > 0 ? (
              labs.map((lab) => (
                <div key={lab.id} style={{
                  padding: 12, borderRadius: 8,
                  border: `1px solid ${COLORS.neutral200}`,
                  marginBottom: 8
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{lab.test_type}</p>
                    <span style={{
                      padding: "2px 8px", borderRadius: 10,
                      background: lab.priority === "Urgent" ? COLORS.redLight : COLORS.neutral100,
                      color: lab.priority === "Urgent" ? COLORS.red : COLORS.neutral600,
                      fontSize: 11
                    }}>{lab.priority}</span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: COLORS.neutral400 }}>
                    Ordered {new Date(lab.ordered_at).toLocaleTimeString('en-TZ')} · {lab.status}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 13, color: COLORS.neutral400 }}>No lab orders for this patient.</p>
            )}
          </div>
        )}

        {tab === "medications" && (
          <div>
            {medications.length > 0 ? (
              medications.map((med) => (
                <div key={med.id} style={{
                  padding: 12, borderRadius: 8,
                  border: `1px solid ${COLORS.neutral200}`,
                  marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{med.drug_name}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 12, color: COLORS.neutral400 }}>{med.dosage}</p>
                  </div>
                  <button style={{
                    padding: "6px 14px", borderRadius: 8,
                    background: med.status === "Ready" ? COLORS.green : COLORS.amber,
                    color: "#fff", border: "none", fontSize: 12, fontWeight: 500, cursor: "pointer"
                  }}>{med.status === "Ready" ? "Dispense" : "Verify"}</button>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 13, color: COLORS.neutral400 }}>No pending medications.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PatientQueueManager() {
  const [patients, setPatients] = useState<PatientQueueItem[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientQueueItem | null>(null);
  const [queueFilter, setQueueFilter] = useState("All");
  const [stats, setStats] = useState({ total: 0, waiting: 0, inConsultation: 0, highRisk: 0, avgWaitMinutes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueue();
    loadStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadQueue();
      loadStats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  async function loadQueue() {
    try {
      const data = await patientQueueApi.getQueue();
      setPatients(data);
    } catch (error) {
      toast.error('Failed to load patient queue');
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const data = await patientQueueApi.getQueueStats();
      setStats(data);
    } catch (error) {
    }
  }

  const STATS = [
    { label: "Patients today", value: stats.total, delta: `${stats.waiting} waiting`, color: COLORS.primary },
    { label: "Waiting now", value: stats.waiting, delta: `Avg wait ${stats.avgWaitMinutes} min`, color: COLORS.amber },
    { label: "In consultation", value: stats.inConsultation, delta: "Active now", color: COLORS.teal },
    { label: "Emergency alerts", value: stats.highRisk, delta: "Immediate attention", color: COLORS.red },
  ];

  if (loading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: COLORS.neutral50
      }}>
        <div style={{ textAlign: "center", color: COLORS.neutral400 }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>⏳</div>
          <p>Loading patient queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100vh", background: COLORS.neutral50,
      fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
      fontSize: 13, color: COLORS.neutral800
    }}>
      {/* Top Bar */}
      <header style={{
        height: 52, background: COLORS.primary,
        display: "flex", alignItems: "center", padding: "0 20px",
        gap: 16, flexShrink: 0, zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: COLORS.teal, display: "flex",
            alignItems: "center", justifyContent: "center"
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div>
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>AfyaCare</span>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, marginLeft: 2 }}>TZA</span>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ADE80" }} />
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>Online</span>
          </div>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>
            {new Date().toLocaleTimeString("en-TZ", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left: Stats + Queue */}
        <div style={{ width: 360, flexShrink: 0, display: "flex", flexDirection: "column", borderRight: `1px solid ${COLORS.neutral200}`, background: COLORS.white }}>
          {/* Stats */}
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${COLORS.neutral200}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {STATS.map(s => (
                <div key={s.label} style={{
                  padding: "10px 12px", borderRadius: 8,
                  background: COLORS.neutral50, border: `1px solid ${COLORS.neutral200}`
                }}>
                  <p style={{ margin: 0, fontSize: 10, color: COLORS.neutral400 }}>{s.label}</p>
                  <p style={{ margin: "3px 0", fontSize: 20, fontWeight: 600, color: s.color }}>{s.value}</p>
                  <p style={{ margin: 0, fontSize: 10, color: COLORS.neutral400 }}>{s.delta}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Queue header */}
          <div style={{ padding: "12px 16px 8px", borderBottom: `1px solid ${COLORS.neutral100}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: COLORS.neutral800 }}>
                Patient queue
              </h2>
              <span style={{ fontSize: 11, color: COLORS.neutral400 }}>{patients.length} patients</span>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            <QueuePanel
              patients={patients}
              selectedId={selectedPatient?.id}
              onSelect={setSelectedPatient}
              filter={queueFilter}
              onFilterChange={setQueueFilter}
            />
          </div>
        </div>

        {/* Right: Patient detail */}
        <div style={{ flex: 1, overflowY: "auto", background: COLORS.white }}>
          <PatientDetail patient={selectedPatient} />
        </div>
      </div>
    </div>
  );
}

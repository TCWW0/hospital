// Mock schedules for doctors: provide next 14 days slots
export interface TimeSlot { time: string; type: 'normal' | 'expert' | 'special'; available: number }
export interface DaySchedule { date: string; slots: TimeSlot[] }

function formatDate(d: Date) { return d.toISOString().slice(0,10); }

// simple generator
export async function fetchSchedules(doctorId: string, startDate?: string, days = 14): Promise<{ doctorId: string; schedules: DaySchedule[] }> {
  const start = startDate ? new Date(startDate) : new Date();
  const schedules: DaySchedule[] = [];
  for (let i = 0; i < days; i++) {
    const dt = new Date(start);
    dt.setDate(start.getDate() + i);
    const date = formatDate(dt);
    // create 3 slots per day
    const slots: TimeSlot[] = [
      { time: '09:00-10:00', type: 'normal', available: Math.floor(Math.random() * 5) },
      { time: '13:30-14:30', type: 'expert', available: Math.floor(Math.random() * 3) },
      { time: '16:00-17:00', type: 'special', available: Math.floor(Math.random() * 2) },
    ];
    schedules.push({ date, slots });
  }
  return new Promise(resolve => setTimeout(() => resolve({ doctorId, schedules }), 120));
}

// reserve a slot (mock): decrement available count in returning object (no persistence)
export async function reserveSlot(doctorId: string, date: string, time: string): Promise<{ success: boolean; message?: string }> {
  // reference params to avoid unused-parameter diagnostics and include them in failure message
  const slotInfo = `${doctorId}@${date} ${time}`;
  const ok = Math.random() > 0.1;
  return new Promise(resolve => setTimeout(() => resolve(ok ? { success: true } : { success: false, message: `号源 ${slotInfo} 已被抢` }), 150));
}

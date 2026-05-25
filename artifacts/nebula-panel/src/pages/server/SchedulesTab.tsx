import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSchedules, createSchedule, deleteSchedule } from "@/lib/serverApi";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus, Trash2, Play, Pause, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function SchedulesTab({ serverId }: { serverId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const key = ["schedules", serverId];

  const { data: schedules = [], isLoading } = useQuery({ queryKey: key, queryFn: () => getSchedules(serverId) });
  const createMut = useMutation({ mutationFn: (d: any) => createSchedule(serverId, d), onSuccess: () => { qc.invalidateQueries({ queryKey: key }); setShowing(false); setForm(defaultForm); toast({ title: "Schedule created" }); } });
  const deleteMut = useMutation({ mutationFn: (id: number) => deleteSchedule(serverId, id), onSuccess: () => { qc.invalidateQueries({ queryKey: key }); toast({ title: "Schedule deleted" }); } });

  const defaultForm = { name: "", cron_minute: "0", cron_hour: "4", cron_dom: "*", cron_month: "*", cron_dow: "*" };
  const [form, setForm] = useState(defaultForm);
  const [showing, setShowing] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const cronStr = (s: typeof schedules[0]) => `${s.cron.minute} ${s.cron.hour} ${s.cron.dom} ${s.cron.month} ${s.cron.dow}`;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Schedules</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Automated cron-based tasks for this server</p>
        </div>
        <button onClick={() => setShowing(!showing)} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all">
          <Plus size={13} /> New Schedule
        </button>
      </div>

      {showing && (
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(form); }} className="bg-card border border-blue-500/20 rounded-xl p-5 space-y-4">
          <p className="text-sm font-semibold text-foreground">New Schedule</p>
          <div>
            <label className="text-xs text-muted-foreground">Schedule Name</label>
            <input value={form.name} onChange={set("name")} placeholder="Daily Restart" required className="mt-1 w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-blue-500/40" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Cron Expression</label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { key: "cron_minute", label: "Minute" },
                { key: "cron_hour", label: "Hour" },
                { key: "cron_dom", label: "Day (Month)" },
                { key: "cron_month", label: "Month" },
                { key: "cron_dow", label: "Day (Week)" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-[10px] text-muted-foreground">{f.label}</label>
                  <input value={(form as any)[f.key]} onChange={set(f.key)} className="w-full bg-background border border-white/10 rounded-lg px-2 py-1.5 text-sm text-foreground font-mono text-center focus:outline-none focus:border-blue-500/40 mt-0.5" />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">Preview: <span className="font-mono text-blue-400">{form.cron_minute} {form.cron_hour} {form.cron_dom} {form.cron_month} {form.cron_dow}</span></p>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={createMut.isPending} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg disabled:opacity-50">
              {createMut.isPending ? "Creating..." : "Create"}
            </button>
            <button type="button" onClick={() => setShowing(false)} className="px-4 py-2 border border-white/10 text-muted-foreground text-sm rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {isLoading && <div className="flex items-center justify-center py-10"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}

      {!isLoading && schedules.length === 0 && (
        <div className="text-center py-12 bg-card border border-white/5 rounded-xl">
          <Calendar size={28} className="mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">No schedules created</p>
        </div>
      )}

      <div className="space-y-3">
        {schedules.map((s) => (
          <div key={s.id} className="bg-card border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-foreground">{s.name}</p>
                  <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full border", s.active ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-muted-foreground bg-white/5 border-white/10")}>
                    {s.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-xs font-mono text-blue-400/80 mt-1">{cronStr(s)}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  {s.lastRunAt && <span className="flex items-center gap-1"><Clock size={10} /> Last: {new Date(s.lastRunAt).toLocaleString()}</span>}
                  <span className="flex items-center gap-1"><Clock size={10} /> Next: {new Date(s.nextRunAt).toLocaleString()}</span>
                </div>
              </div>
              <button onClick={() => deleteMut.mutate(s.id)} className="p-1.5 text-muted-foreground hover:text-red-400 border border-white/8 hover:border-red-500/30 rounded-lg transition-all">
                <Trash2 size={13} />
              </button>
            </div>

            {s.tasks.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
                {s.tasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-2 text-xs text-muted-foreground bg-background/50 rounded-lg px-3 py-1.5">
                    <Play size={10} className="text-blue-400" />
                    <span className="font-mono text-blue-400/80">{t.action}</span>
                    {t.payload && <span className="text-muted-foreground/60">→ {t.payload}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

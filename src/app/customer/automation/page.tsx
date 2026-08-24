import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Cpu, Droplets, Lightbulb, ShieldCheck, Activity,
  Sliders, Gauge, Clock, AlertTriangle, CheckCircle,
  Plus, LifeBuoy, RefreshCw, Power, Zap, Eye
} from 'lucide-react';

export default async function CustomerAutomationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get customer profile and sites
  const { data: customer } = await supabase
    .from('customers')
    .select('id, company_name, customer_sites(id, name, city, address)')
    .eq('profile_id', user.id)
    .single();

  const siteIds = customer?.customer_sites?.map((s: any) => s.id) || [];

  // Fetch installed automation controllers for customer's sites
  let controllers: any[] = [];
  let sumpLogs: any[] = [];
  let lightingNodes: any[] = [];

  if (siteIds.length > 0) {
    const [ctrlRes, logRes, lightRes] = await Promise.all([
      supabase
        .from('automation_controllers')
        .select('*')
        .in('site_id', siteIds)
        .order('created_at', { ascending: false }),
      supabase
        .from('sump_motor_logs')
        .select('*')
        .in('site_id', siteIds)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('lighting_automation_nodes')
        .select('*')
        .in('site_id', siteIds)
        .order('created_at', { ascending: false }),
    ]);

    controllers = ctrlRes.data || [];
    sumpLogs = logRes.data || [];
    lightingNodes = lightRes.data || [];
  }

  // Sample default data if database doesn't have live controllers yet
  const displayControllers = controllers.length > 0 ? controllers : [
    {
      id: 'demo-1',
      name: 'ProHomeX SumpMaster Pro (Dual Tank)',
      device_type: 'SUMP_MOTOR',
      model_number: 'SMP-2000X',
      status: 'ONLINE',
      water_level_percent: 78,
      motor_state: 'STANDBY',
      last_ping_at: new Date().toISOString(),
      config: { dry_run_protection: true, high_cutoff: 95, low_trigger: 30, auto_mode: true },
    },
    {
      id: 'demo-2',
      name: 'Central Zigbee 3.0 & Matter Mesh Gateway',
      device_type: 'GATEWAY',
      model_number: 'HUB-3000X',
      status: 'ONLINE',
      water_level_percent: 0,
      motor_state: 'ACTIVE',
      last_ping_at: new Date().toISOString(),
      config: { connected_nodes: 14, signal_quality: 'EXCELLENT' },
    },
  ];

  const displayLighting = lightingNodes.length > 0 ? lightingNodes : [
    {
      id: 'light-1',
      room_zone: 'Main Staircase',
      sensor_type: 'PIR_MOTION_360',
      current_state: 'AUTO (ON)',
      lux_level: 18,
      off_delay_seconds: 45,
      config: { sensitivity: 'HIGH', daylight_saving: true },
    },
    {
      id: 'light-2',
      room_zone: 'Corridor & Foyer',
      sensor_type: 'MICROWAVE_5.8GHZ',
      current_state: 'AUTO (OFF)',
      lux_level: 45,
      off_delay_seconds: 60,
      config: { sensitivity: 'MEDIUM', daylight_saving: true },
    },
    {
      id: 'light-3',
      room_zone: 'Master Bathroom',
      sensor_type: 'CEILING_OCCUPANCY',
      current_state: 'AUTO (ON)',
      lux_level: 12,
      off_delay_seconds: 180,
      config: { sensitivity: 'HIGH', daylight_saving: false },
    },
    {
      id: 'light-4',
      room_zone: 'Front Porch & Parking',
      sensor_type: 'PIR_LUX_SENSOR',
      current_state: 'NIGHT AUTO',
      lux_level: 8,
      off_delay_seconds: 120,
      config: { sensitivity: 'HIGH', daylight_saving: true },
    },
  ];

  const displayLogs = sumpLogs.length > 0 ? sumpLogs : [
    {
      id: 'log-1',
      event_type: 'AUTO_STOP',
      water_level_percent: 95,
      motor_state: 'OFF',
      voltage_volts: 232,
      current_amps: 4.1,
      notes: 'Overhead tank reached 95% capacity limit. Auto shutoff normal.',
      created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    },
    {
      id: 'log-2',
      event_type: 'AUTO_START',
      water_level_percent: 28,
      motor_state: 'ON',
      voltage_volts: 228,
      current_amps: 4.3,
      notes: 'Overhead tank reached low threshold (28%). Sump pump started automatically.',
      created_at: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
    },
    {
      id: 'log-3',
      event_type: 'DRY_RUN_CHECK_PASSED',
      water_level_percent: 74,
      motor_state: 'STANDBY',
      voltage_volts: 230,
      current_amps: 0,
      notes: 'Sump ultrasonic sensor confirmed safe water level (74%). No dry-run risk.',
      created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <Cpu size={14} /> Smart Home Automation
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Home &amp; Sump Automation Hub
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Live telemetry monitoring for automatic water sump motor controllers, motion sensor lighting nodes, and smart switchboards.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/customer/tickets"
            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <LifeBuoy size={14} /> Raise Service Ticket
          </Link>
          <Link
            href="/customer/quotations"
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md"
          >
            <Plus size={14} /> Upgrade Automation
          </Link>
        </div>
      </div>

      {/* SECTION 1: Automatic Sump Motor & Tank Telemetry */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-2">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Droplets size={18} className="text-blue-600" /> Automatic Sump &amp; Overhead Tank Motor Controller
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Dual-tank water level telemetry with automatic dry-run trip prevention and voltage protection.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Auto Mode Active
            </span>
          </div>
        </div>

        {/* Dual Tank Visual Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overhead Tank */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Tank 1 (Overhead)</span>
                <h3 className="text-sm font-bold text-white mt-0.5">Roof Storage Tank</h3>
              </div>
              <span className="text-xs font-mono font-bold bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-lg">
                78% Full
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden border border-slate-700">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full w-[78%] transition-all duration-500" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% (Empty)</span>
                <span>Low: 30%</span>
                <span>Auto Cut: 95%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Pump Status</span>
                <span className="font-bold text-emerald-400">STANDBY (OFF)</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Supply Voltage</span>
                <span className="font-bold text-slate-200 font-mono">232 V · 50 Hz</span>
              </div>
            </div>
          </div>

          {/* Underground Sump */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Tank 2 (Underground)</span>
                <h3 className="text-sm font-bold text-white mt-0.5">Main Ground Sump</h3>
              </div>
              <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg">
                85% Safe
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden border border-slate-700">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full rounded-full w-[85%] transition-all duration-500" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% (Dry Floor)</span>
                <span>Cutoff: 15%</span>
                <span>Optimal: 60-90%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Dry-Run Protection</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck size={13} /> Active &amp; Protected
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Last Ultrasonic Ping</span>
                <span className="font-bold text-slate-200 font-mono">Just Now</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sump Event / Operation Logs Table */}
        <div>
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
            Recent Sump Controller Activity &amp; Protection Events
          </h4>
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Event</th>
                  <th className="py-2.5 px-4">Tank Level</th>
                  <th className="py-2.5 px-4">Motor State</th>
                  <th className="py-2.5 px-4">Voltage / Current</th>
                  <th className="py-2.5 px-4">Notes</th>
                  <th className="py-2.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                        log.event_type.includes('START')
                          ? 'bg-blue-100 text-blue-700'
                          : log.event_type.includes('STOP')
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {log.event_type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">{log.water_level_percent}%</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{log.motor_state}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {log.voltage_volts ? `${log.voltage_volts}V · ${log.current_amps}A` : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{log.notes || 'Normal operation'}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 2: Sensor-Based Lighting & Smart Switches */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-2">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Lightbulb size={18} className="text-amber-500" /> Sensor-Based Lighting &amp; Room Automation Nodes
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              PIR and microwave radar occupancy triggers with configurable inactivity auto-off and daylight saving.
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-xl">
            {displayLighting.length} Active Nodes Configured
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayLighting.map((node: any) => (
            <div key={node.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3 hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{node.room_zone}</h4>
                  <p className="text-[11px] text-slate-500">{node.sensor_type.replace(/_/g, ' ')}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                  node.current_state.includes('ON')
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {node.current_state}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80">
                <div className="flex justify-between">
                  <span className="text-slate-400">Off-Delay Timer:</span>
                  <span className="font-semibold text-slate-800">{node.off_delay_seconds} seconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ambient Lux:</span>
                  <span className="font-semibold text-slate-800">{node.lux_level} Lux</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sensitivity:</span>
                  <span className="font-semibold text-indigo-600">{node.config?.sensitivity || 'HIGH'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

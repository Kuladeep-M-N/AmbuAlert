export function MetaverseUI({ ambulances, incidents, followTarget, isDayMode, onToggleMode }) {
  const safeAmbulances = ambulances || [];
  const safeIncidents = incidents || [];

  // UI adapts to the current scene mode
  const hudBg   = isDayMode ? 'bg-white/85'       : 'bg-slate-900/80';
  const hudBdr  = isDayMode ? 'border-slate-300/60' : 'border-slate-700/50';
  const panelBg = isDayMode ? 'bg-white/90'        : 'bg-slate-900/80';
  const textH   = isDayMode ? 'text-slate-800'     : 'text-white';
  const textSub = isDayMode ? 'text-blue-600'      : 'text-cyan-400';
  const textMuted = isDayMode ? 'text-slate-500'   : 'text-slate-500';
  const cardBg  = isDayMode ? 'bg-slate-100 border-slate-200' : 'bg-slate-800/50 border-slate-700';
  const btnBg   = isDayMode
    ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
    : 'bg-slate-800 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700';
  const bottomGrad = isDayMode
    ? 'bg-gradient-to-t from-sky-100/90 to-transparent'
    : 'bg-gradient-to-t from-slate-950 to-transparent';
  const bottomCard = isDayMode
    ? 'bg-white/90 border-slate-300/60'
    : 'bg-slate-900/90 border-slate-700/50';

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between">

      {/* ── Top Banner ── */}
      <div className={`w-full ${hudBg} backdrop-blur-md p-4 flex justify-between items-center border-b ${hudBdr} pointer-events-auto shadow-lg transition-colors duration-500`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full animate-pulse ${isDayMode ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' : 'bg-cyan-500 shadow-[0_0_10px_#0ea5e9]'}`} />
          <div>
            <h2 className={`text-xl font-black ${textH} tracking-widest uppercase transition-colors duration-500`}>
              Metaverse Operations
            </h2>
            <p className={`text-[10px] ${textSub} font-bold uppercase tracking-widest transition-colors duration-500`}>
              3D Real-Time Virtualization Node
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button className={`px-4 py-2 border rounded-lg text-xs font-bold transition-colors duration-200 ${btnBg}`}>
            🎥 Active View
          </button>

          {/* ── Day / Night Toggle ── */}
          <button
            onClick={onToggleMode}
            className={`px-4 py-2 border rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
              isDayMode
                ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {isDayMode ? '🌞 Day Mode' : '🌙 Night Mode'}
            {/* Toggle pill */}
            <span className={`inline-flex w-9 h-5 rounded-full relative transition-colors duration-300 ${isDayMode ? 'bg-amber-400' : 'bg-slate-600'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full shadow transition-all duration-300 ${isDayMode ? 'translate-x-4 bg-white' : 'translate-x-0.5 bg-slate-300'}`} />
            </span>
          </button>
        </div>
      </div>

      {/* ── Right Telemetry ── */}
      <div className="absolute top-24 right-6 w-80 flex flex-col gap-4 pointer-events-auto">

        {/* Active Incidents */}
        <div className={`rounded-xl border ${panelBg} ${hudBdr} backdrop-blur-md p-5 shadow-2xl transition-colors duration-500`}>
          <h3 className={`text-sm font-black ${textSub} uppercase tracking-widest mb-4 flex justify-between items-center`}>
            Active Incidents <span>({safeIncidents.length})</span>
          </h3>
          {safeIncidents.length === 0 && (
            <p className={`text-xs ${textMuted} italic`}>No active emergencies</p>
          )}
          {safeIncidents.map(inc => (
            <div key={inc.id} className={`rounded-lg p-3 text-sm mb-2 border ${cardBg} transition-colors duration-300`}>
              <div className={`font-bold ${textH} tracking-widest uppercase`}>PAT-{inc.id}</div>
              <div className="text-[10px] font-bold text-orange-500 tracking-widest uppercase mt-0.5">{inc.severity}</div>
            </div>
          ))}
        </div>

        {/* Fleet Deployment */}
        <div className={`rounded-xl border ${panelBg} ${hudBdr} backdrop-blur-md p-5 shadow-2xl transition-colors duration-500`}>
          <h3 className={`text-sm font-black ${isDayMode ? 'text-blue-600' : 'text-sky-400'} uppercase tracking-widest mb-4 flex justify-between items-center`}>
            Fleet Deployment <span>({safeAmbulances.length})</span>
          </h3>
          <div className="max-h-[300px] overflow-y-auto pr-1">
            {safeAmbulances.map(amb => {
              const isDisp = amb.status === 'DISPATCHED' || amb.status === 'EN_ROUTE'
                || amb.phase === 'DISPATCHED' || amb.phase === 'PICKUP' || amb.phase === 'IN_TRANSIT';
              return (
                <div
                  key={amb.id}
                  className={`p-3 rounded-lg border mb-2 text-sm transition-colors ${
                    isDisp
                      ? isDayMode
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-sky-500/50 bg-sky-900/20'
                      : cardBg
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className={`font-bold ${textH}`}>{amb.id}</div>
                      <div className={`text-[10px] ${textMuted} font-bold uppercase tracking-widest`}>{amb.team}</div>
                    </div>
                    {isDisp && (
                      <span className={`text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-widest rounded border ${
                        isDayMode
                          ? 'bg-blue-100 text-blue-700 border-blue-400'
                          : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
                      }`}>
                        Active
                      </span>
                    )}
                  </div>
                  {isDisp && amb.eta > 0 && (
                    <div className={`mt-2 text-xs font-mono ${isDayMode ? 'text-blue-600' : 'text-cyan-300'}`}>
                      ETA: {amb.eta} sec
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className={`w-full ${bottomGrad} p-4 flex justify-between items-end pointer-events-auto transition-colors duration-500`}>
        <div className={`${bottomCard} border rounded-lg p-3 backdrop-blur-sm transition-colors duration-500`}>
          <span className={`text-[10px] ${textMuted} uppercase tracking-widest font-bold`}>Orbital Camera</span>
          <div className={`text-xs ${textH} font-medium mt-1`}>🖱️ Click + Drag to rotate · Scroll to zoom</div>
        </div>
      </div>

    </div>
  );
}

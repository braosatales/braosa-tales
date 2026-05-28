"use client"

import { useState, useEffect, useRef } from "react"

interface UserProfile {
  tier: string
  credits: number
  daily_credits: number
  credits_reset_date: string
  daily_reset_date: string
}

const TIERS: Record<string, {
  label: string
  price: string
  monthlyCredits: number
  dailyCredits: number
  rollover: number
  maxLangs: number | string
  maxSaves: number | string
  maxPresets: number | string
  historyLimit: number | string
  dedup: boolean
  forgeVariants: boolean
  priorityGen: boolean
}> = {
  wanderer:  { label:"Wanderer",   price:"Free",    monthlyCredits:100,  dailyCredits:5,  rollover:0,    maxLangs:3,         maxSaves:5,         maxPresets:1,  historyLimit:12,        dedup:false, forgeVariants:false, priorityGen:false },
  keeper:    { label:"Keeper",     price:"$4.99",   monthlyCredits:500,  dailyCredits:10, rollover:100,  maxLangs:3,         maxSaves:20,        maxPresets:5,  historyLimit:100,       dedup:false, forgeVariants:true,  priorityGen:false },
  shaper:    { label:"Shaper",     price:"$11.99",  monthlyCredits:1000, dailyCredits:15, rollover:300,  maxLangs:"∞",       maxSaves:"∞",       maxPresets:10, historyLimit:"∞",       dedup:true,  forgeVariants:true,  priorityGen:false },
  weaver:    { label:"Weaver",     price:"$19.99",  monthlyCredits:2500, dailyCredits:25, rollover:500,  maxLangs:"∞",       maxSaves:"∞",       maxPresets:20, historyLimit:"∞",       dedup:true,  forgeVariants:true,  priorityGen:true  },
  visionary: { label:"Visionary",  price:"$34.99",  monthlyCredits:5000, dailyCredits:50, rollover:1000, maxLangs:"∞",       maxSaves:"∞",       maxPresets:20, historyLimit:"∞",       dedup:true,  forgeVariants:true,  priorityGen:true  },
  author:    { label:"The Author", price:"$999",    monthlyCredits:999999, dailyCredits:999999, rollover:999999, maxLangs:"∞", maxSaves:"∞",    maxPresets:20, historyLimit:"∞",       dedup:true,  forgeVariants:true,  priorityGen:true  },
}

const TIER_ORDER = ["wanderer","keeper","shaper","weaver","visionary","author"]

const FEATURES: { label: string; minTier: string; getValue: (t: typeof TIERS[string]) => string }[] = [
  { label: "Monthly credits",        minTier: "wanderer",  getValue: t => t.monthlyCredits === 999999 ? "∞" : `${t.monthlyCredits}` },
  { label: "Daily credits",          minTier: "wanderer",  getValue: t => t.dailyCredits === 999999 ? "∞" : `${t.dailyCredits}` },
  { label: "Rollover pool",          minTier: "keeper",    getValue: t => t.rollover === 999999 ? "∞" : t.rollover === 0 ? "None" : `${t.rollover}` },
  { label: "Languages",              minTier: "wanderer",  getValue: t => `${t.maxLangs}` },
  { label: "Unlimited languages",    minTier: "shaper",    getValue: t => typeof t.maxLangs === "string" ? "Yes" : `Up to ${t.maxLangs}` },
  { label: "Saved names",            minTier: "wanderer",  getValue: t => `${t.maxSaves}` },
  { label: "Presets",                minTier: "wanderer",  getValue: t => `${t.maxPresets}` },
  { label: "Generation history",     minTier: "wanderer",  getValue: t => `${t.historyLimit}` },
  { label: "Duplicate protection",   minTier: "shaper",    getValue: () => "Yes" },
  { label: "Forge variants",         minTier: "keeper",    getValue: () => "Yes" },
  { label: "Priority generation",    minTier: "weaver",    getValue: () => "Yes" },
]

const C = {
  bg2:"#0E0C09", purple:"#6B1CA8", purpleL:"#C090F0",
  purpleDim:"rgba(107,28,168,0.18)", purpleB:"rgba(107,28,168,0.32)",
  gold:"#D4AE58", goldDim:"rgba(212,174,88,0.14)", goldB:"rgba(212,174,88,0.32)",
  t1:"#F2E8D5", t2:"#C8B99A", t3:"#8A7A65", t4:"rgba(237,224,200,0.08)",
  danger:"#D4756A", success:"#6DB88A", border:"rgba(107,28,168,0.25)",
}
const GS = { fontFamily:"Georgia,serif" } as React.CSSProperties
const SS = { fontFamily:"system-ui,sans-serif" } as React.CSSProperties

export default function CreditsBadge() {
  const [profile, setProfile]         = useState<UserProfile | null>(null)
  const [showCredits, setShowCredits] = useState(false)
  const [showTier, setShowTier]       = useState(false)
  const creditsRef = useRef<HTMLDivElement>(null)
  const tierRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/user/profile").then(r => r.json()).then(setProfile).catch(() => {})
  }, [])

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (creditsRef.current && !creditsRef.current.contains(e.target as Node)) setShowCredits(false)
      if (tierRef.current    && !tierRef.current.contains(e.target as Node))    setShowTier(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  if (!profile) return null

  const tier      = TIERS[profile.tier] || TIERS["wanderer"]
  const tierIndex = TIER_ORDER.indexOf(profile.tier)

  const dailyUsed     = tier.dailyCredits === 999999   ? profile.daily_credits  : Math.max(0, tier.dailyCredits   - profile.daily_credits)
  const monthlyUsed   = tier.monthlyCredits === 999999 ? profile.credits         : Math.max(0, tier.monthlyCredits - profile.credits)
  const rolloverPool  = tier.rollover === 999999       ? "∞"                     : tier.rollover === 0 ? 0 : Math.min(tier.rollover, Math.max(0, profile.credits - tier.monthlyCredits))

  const isInfinite = tier.monthlyCredits === 999999

  const Bar = ({ used, total, color }: { used: number; total: number; color: string }) => {
    if (total === 999999) return <div style={{height:3,borderRadius:2,background:`linear-gradient(90deg,${color},${color}88)`,marginTop:4}}/>
    const pct = Math.max(0, Math.min(100, ((total - used) / total) * 100))
    return (
      <div style={{height:3,background:"rgba(237,224,200,0.08)",borderRadius:2,marginTop:4,overflow:"hidden"}}>
        <div style={{width:`${pct}%`,height:"100%",background:color,borderRadius:2,transition:"width 0.4s"}}/>
      </div>
    )
  }

  return (
    <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",justifyContent:"center"}}>

      {/* Credits pill */}
      <div ref={creditsRef} style={{position:"relative"}}>
        <div
          onClick={() => { setShowCredits(!showCredits); setShowTier(false) }}
          style={{
            display:"flex", alignItems:"center", gap:6,
            background:C.goldDim, border:`1px solid ${C.goldB}`,
            borderRadius:20, padding:"5px 12px", cursor:"pointer",
            transition:"all 0.15s", minWidth:110,
          }}
          onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background="rgba(212,174,88,0.22)"}
          onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=C.goldDim}
        >
          <span style={{color:C.t3,fontSize:9,letterSpacing:1,fontWeight:600,...SS}}>CREDITS</span>
          <span style={{color:C.gold,fontSize:13,...GS,fontWeight:"bold"}}>
            {isInfinite ? "∞" : profile.credits.toLocaleString()}
          </span>
        </div>

        {showCredits && (
          <div style={{
            position:"absolute", top:"calc(100% + 10px)", right:0,
            background:"#1C1810", border:`1px solid ${C.goldB}`,
            borderRadius:12, padding:"16px 18px", zIndex:1000,
            minWidth:220, boxShadow:"0 20px 60px rgba(0,0,0,0.8)",
          }}>
            <div style={{color:C.gold,fontSize:11,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",...SS,marginBottom:12}}>Credit Breakdown</div>

            {/* Daily */}
            <div style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                <span style={{color:C.t3,fontSize:10,...SS}}>Daily</span>
                <span style={{color:C.t1,fontSize:12,...GS}}>
                  {isInfinite ? "∞" : `${tier.dailyCredits - dailyUsed}`}
                  <span style={{color:C.t3,fontSize:10}}> / {isInfinite ? "∞" : tier.dailyCredits}</span>
                </span>
              </div>
              <Bar used={dailyUsed} total={tier.dailyCredits} color={C.gold}/>
            </div>

            {/* Monthly */}
            <div style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                <span style={{color:C.t3,fontSize:10,...SS}}>Monthly</span>
                <span style={{color:C.t1,fontSize:12,...GS}}>
                  {isInfinite ? "∞" : `${tier.monthlyCredits - monthlyUsed}`}
                  <span style={{color:C.t3,fontSize:10}}> / {isInfinite ? "∞" : tier.monthlyCredits}</span>
                </span>
              </div>
              <Bar used={monthlyUsed} total={tier.monthlyCredits} color={C.purpleL}/>
            </div>

            {/* Rollover */}
            <div style={{paddingTop:10,borderTop:`1px solid ${C.t4}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                <span style={{color:C.t3,fontSize:10,...SS}}>Rollover pool</span>
                <span style={{color:tier.rollover===0?C.t3:C.success,fontSize:12,...GS}}>
                  {isInfinite ? "∞" : rolloverPool === 0 ? "—" : `${rolloverPool} / ${tier.rollover}`}
                </span>
              </div>
              {tier.rollover === 0 && (
                <div style={{color:C.t3,fontSize:9,marginTop:4,...SS}}>
                  Keeper+ unlocks rollover credits
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tier pill */}
      <div ref={tierRef} style={{position:"relative"}}>
        <div
          onClick={() => { setShowTier(!showTier); setShowCredits(false) }}
          style={{
            display:"flex", alignItems:"center", gap:6,
            background:C.purpleDim, border:`1px solid ${C.purpleB}`,
            borderRadius:20, padding:"5px 12px", cursor:"pointer",
            transition:"all 0.15s", minWidth:110,
          }}
          onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background="rgba(107,28,168,0.28)"}
          onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=C.purpleDim}
        >
          <span style={{color:C.purpleL,fontSize:11,...GS,fontStyle:"italic"}}>{tier.label}</span>
          <span style={{color:C.t3,fontSize:9,...SS}}>▾</span>
        </div>

        {showTier && (
          <div style={{
            position:"absolute", top:"calc(100% + 10px)", right:0,
            background:"#1C1810", border:`1px solid ${C.purpleB}`,
            borderRadius:12, padding:"16px 18px", zIndex:1000,
            minWidth:260, boxShadow:"0 20px 60px rgba(0,0,0,0.8)",
          }}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
              <span style={{color:C.purpleL,fontSize:13,...GS,fontStyle:"italic",fontWeight:600}}>{tier.label}</span>
              <span style={{color:C.t3,fontSize:11,...SS}}>{tier.price}</span>
            </div>
            <div style={{height:1,background:C.t4,marginBottom:12}}/>

            {FEATURES.map(f => {
              const featureTierIndex = TIER_ORDER.indexOf(f.minTier)
              const locked = featureTierIndex > tierIndex
              const minTierLabel = TIERS[f.minTier]?.label || f.minTier
              return (
                <div key={f.label} style={{
                  display:"flex", justifyContent:"space-between", alignItems:"center",
                  padding:"5px 0",
                  opacity: locked ? 0.45 : 1,
                }}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    {locked && (
                      <span style={{
                        fontSize:8, color:C.gold, letterSpacing:0.5,
                        background:"rgba(212,174,88,0.1)", border:`1px solid rgba(212,174,88,0.25)`,
                        borderRadius:3, padding:"1px 5px", ...SS, whiteSpace:"nowrap",
                      }}>{minTierLabel}+</span>
                    )}
                    {!locked && <span style={{color:C.success,fontSize:10}}>✓</span>}
                    <span style={{color:locked?C.t3:C.t2,fontSize:11,...SS}}>{f.label}</span>
                  </div>
                  <span style={{color:locked?C.t3:C.t1,fontSize:11,...GS,fontStyle:"italic"}}>
                    {locked ? "—" : f.getValue(tier)}
                  </span>
                </div>
              )
            })}

            <div style={{marginTop:12,paddingTop:10,borderTop:`1px solid ${C.t4}`}}>
              <button style={{
                width:"100%", padding:"8px",
                background:`linear-gradient(135deg,rgba(107,28,168,0.3),rgba(107,28,168,0.45))`,
                border:`1px solid ${C.purpleB}`, borderRadius:6,
                color:C.purpleL, cursor:"pointer",
                fontSize:10, letterSpacing:2, textTransform:"uppercase", ...GS,
              }}>
                Upgrade plan →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useRef, useEffect, useMemo } from "react"

const C = {
  bg:"#12100D", bg2:"#0E0C09", card:"#1C1810", card2:"#201C15",
  purple:"#6B1CA8", purpleL:"#C090F0",
  purpleDim:"rgba(107,28,168,0.18)", purpleB:"rgba(107,28,168,0.32)",
  gold:"#D4AE58", goldDim:"rgba(212,174,88,0.14)", goldB:"rgba(212,174,88,0.32)",
  t1:"#F2E8D5", t2:"#C8B99A", t3:"#8A7A65", t4:"rgba(237,224,200,0.08)",
  border:"rgba(107,28,168,0.25)",
  danger:"#D4756A", dangerDim:"rgba(212,117,106,0.15)", dangerB:"rgba(212,117,106,0.4)",
  success:"#6DB88A",
}

const TIERS: Record<string, { label:string; price:string; credits:number; daily:number; maxLangs:number; maxSaves:number; maxPresets:number; historyLimit:number; dedup:boolean }> = {
  wanderer:  { label:"Wanderer",   price:"Free",   credits:100,  daily:5,  maxLangs:3,        maxSaves:5,        maxPresets:1,  historyLimit:12,       dedup:false },
  keeper:    { label:"Keeper",     price:"$4.99",  credits:500,  daily:10, maxLangs:3,        maxSaves:20,       maxPresets:5,  historyLimit:100,      dedup:false },
  shaper:    { label:"Shaper",     price:"$11.99", credits:1000, daily:15, maxLangs:Infinity, maxSaves:Infinity, maxPresets:10, historyLimit:Infinity, dedup:true  },
  weaver:    { label:"Weaver",     price:"$19.99", credits:2500, daily:25, maxLangs:Infinity, maxSaves:Infinity, maxPresets:20, historyLimit:Infinity, dedup:true  },
  visionary: { label:"Visionary",  price:"$34.99", credits:5000, daily:50, maxLangs:Infinity, maxSaves:Infinity, maxPresets:20, historyLimit:Infinity, dedup:true  },
  author:    { label:"The Author", price:"$999",   credits:500,  daily:50, maxLangs:Infinity, maxSaves:Infinity, maxPresets:20, historyLimit:Infinity, dedup:true  },
}

const LOGO = "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"

function getComplexity(langCount: number, themeCount: number) {
  let score = 0
  if (langCount >= 5) score = 2
  else if (langCount >= 3) score = 1
  if (score === 1 && themeCount >= 8) score = 2
  return { score, label: ["Simple","Standard","Complex"][score], costPerName: [1,2,3][score] }
}

function hexToRgb(hex: string) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : "150,150,150"
}

const LANGS: Record<string, {id:string; label:string; note?:string}[]> = {
  ancient:[
    {id:"hebrew",label:"Hebrew",note:"Biblical"},{id:"aramaic",label:"Aramaic",note:"Near East"},
    {id:"sumerian",label:"Sumerian",note:"Mesopotamia"},{id:"akkadian",label:"Akkadian",note:"Mesopotamia"},
    {id:"sanskrit",label:"Sanskrit",note:"Vedic India"},{id:"latin",label:"Latin",note:"Classical Rome"},
    {id:"ancient-greek",label:"Ancient Greek",note:"Classical"},{id:"old-norse",label:"Old Norse",note:"Viking Age"},
    {id:"old-english",label:"Old English",note:"Anglo-Saxon"},{id:"coptic",label:"Coptic",note:"Late Egyptian"},
    {id:"phoenician",label:"Phoenician",note:"Levant"},{id:"hittite",label:"Hittite",note:"Anatolia"},
    {id:"avestan",label:"Avestan",note:"Old Iranian"},{id:"old-persian",label:"Old Persian",note:"Achaemenid"},
    {id:"khmer",label:"Khmer",note:"Ancient Cambodia"},{id:"pali",label:"Pali",note:"Buddhist Canon"},
    {id:"old-chinese",label:"Old Chinese",note:"Shang/Zhou"},{id:"etruscan",label:"Etruscan",note:"Pre-Roman Italy"},
    {id:"gothic",label:"Gothic",note:"Early Germanic"},{id:"old-irish",label:"Old Irish",note:"Early Medieval"},
    {id:"egyptian",label:"Egyptian Hieroglyphic",note:"Ancient Egypt"},{id:"geez",label:"Ge'ez",note:"Ethiopic Classical"},
    {id:"syriac",label:"Syriac",note:"Eastern Aramaic"},{id:"mayan",label:"Classical Mayan",note:"Mesoamerica"},
    {id:"nahuatl",label:"Classical Nahuatl",note:"Aztec"},{id:"quechua",label:"Classical Quechua",note:"Inca"},
    {id:"tamil",label:"Classical Tamil",note:"Sangam Period"},{id:"sogdian",label:"Sogdian",note:"Silk Road"},
    {id:"hurrian",label:"Hurrian",note:"Bronze Age Syria"},{id:"pie",label:"Proto-Indo-European",note:"Reconstructed"},
    {id:"mongolian-c",label:"Classical Mongolian",note:"Imperial Era"},{id:"javanese",label:"Old Javanese (Kawi)",note:"Southeast Asia"},
  ],
  modern:[
    {id:"arabic",label:"Arabic"},{id:"mandarin",label:"Mandarin Chinese"},{id:"japanese",label:"Japanese"},
    {id:"korean",label:"Korean"},{id:"hindi",label:"Hindi"},{id:"urdu",label:"Urdu"},
    {id:"farsi",label:"Persian (Farsi)"},{id:"turkish",label:"Turkish"},{id:"swahili",label:"Swahili"},
    {id:"yoruba",label:"Yoruba"},{id:"amharic",label:"Amharic"},{id:"welsh",label:"Welsh"},
    {id:"irish",label:"Irish Gaelic"},{id:"scottish",label:"Scottish Gaelic"},{id:"basque",label:"Basque"},
    {id:"hungarian",label:"Hungarian"},{id:"finnish",label:"Finnish"},{id:"georgian",label:"Georgian"},
    {id:"armenian",label:"Armenian"},{id:"mongolian",label:"Mongolian"},{id:"tibetan",label:"Tibetan"},
    {id:"thai",label:"Thai"},{id:"vietnamese",label:"Vietnamese"},{id:"indonesian",label:"Indonesian"},
    {id:"tagalog",label:"Tagalog"},{id:"icelandic",label:"Icelandic"},{id:"catalan",label:"Catalan"},
    {id:"bengali",label:"Bengali"},{id:"telugu",label:"Telugu"},{id:"gujarati",label:"Gujarati"},
    {id:"spanish",label:"Spanish"},{id:"french",label:"French"},{id:"portuguese",label:"Portuguese"},
    {id:"italian",label:"Italian"},{id:"german",label:"German"},{id:"russian",label:"Russian"},
    {id:"polish",label:"Polish"},{id:"dutch",label:"Dutch"},{id:"swedish",label:"Swedish"},
    {id:"norwegian",label:"Norwegian"},{id:"danish",label:"Danish"},{id:"modern-greek",label:"Modern Greek"},
  ],
  high_fantasy:[
    {id:"quenya",label:"Quenya",note:"Tolkien High Elvish"},{id:"sindarin",label:"Sindarin",note:"Tolkien Grey Elvish"},
    {id:"khuzdul",label:"Khuzdul",note:"Tolkien Dwarvish"},{id:"draconic",label:"Draconic",note:"D&D Dragon"},
    {id:"celestial",label:"Celestial",note:"D&D Divine"},{id:"sylvan",label:"Sylvan",note:"D&D Fey"},
    {id:"primordial",label:"Primordial",note:"D&D Elemental"},{id:"high-valyrian",label:"High Valyrian",note:"Game of Thrones"},
    {id:"dothraki",label:"Dothraki",note:"Game of Thrones"},{id:"dovahzul",label:"Dovahzul",note:"Skyrim Dragon"},
    {id:"aldmeris",label:"Aldmeris",note:"Elder Scrolls"},{id:"elvish-g",label:"Generic Elvish",note:"Classic Fantasy"},
    {id:"dwarven-g",label:"Generic Dwarven",note:"Classic Fantasy"},{id:"orcish-g",label:"Generic Orcish",note:"Classic Fantasy"},
    {id:"fey-cant",label:"Fey Cant",note:"Faerie dialect"},{id:"giant-speech",label:"Giant Speech",note:"Ancient giant tongue"},
  ],
  dark_occult:[
    {id:"black-speech",label:"Black Speech",note:"Tolkien Mordor"},{id:"infernal",label:"Infernal",note:"D&D Devilish"},
    {id:"deep-speech",label:"Deep Speech",note:"D&D Aberrant"},{id:"daedric",label:"Daedric",note:"Elder Scrolls"},
    {id:"abyssal",label:"Abyssal",note:"D&D Demonic"},{id:"void-tongue",label:"Void Tongue",note:"Eldritch constructed"},
    {id:"shadow-cant",label:"Shadow Cant",note:"Thieves guilds"},{id:"necromantic",label:"Necromantic",note:"Death ritual"},
    {id:"blood-script",label:"Blood Script",note:"Sanguine magic"},{id:"elder-sign",label:"Elder Sign Speech",note:"Lovecraftian"},
  ],
  scifi:[
    {id:"klingon",label:"Klingon",note:"Star Trek"},{id:"navi",label:"Na'vi",note:"Avatar"},
    {id:"huttese",label:"Huttese",note:"Star Wars"},{id:"mando",label:"Mando'a",note:"Mandalorian"},
    {id:"machine-binary",label:"Machine/Binary",note:"AI & synthetic"},{id:"galactic-basic",label:"Galactic Basic",note:"Star Wars"},
    {id:"covenant",label:"Covenant Speech",note:"Halo"},{id:"xenomorphic",label:"Xenomorphic Dialect",note:"Click-language"},
    {id:"techno-alien",label:"Techno-Alien",note:"Generic sci-fi"},{id:"interstellar-pidgin",label:"Interstellar Pidgin",note:"Trade language"},
    {id:"android-log",label:"Android Loglang",note:"Synthetic"},{id:"void-signal",label:"Void Signal",note:"Deep space"},
  ],
  steampunk:[
    {id:"victorian-blend",label:"Victorian English Blend",note:"1800s industrial"},{id:"industrial-latin",label:"Industrial Latin",note:"Technical"},
    {id:"clockwork-german",label:"Clockwork German",note:"Mechanical"},{id:"aetheric-french",label:"Aetheric French",note:"Steam-era"},
    {id:"brass-pidgin",label:"Brass & Copper Pidgin",note:"Engineer trade"},{id:"neo-edwardian",label:"Neo-Edwardian",note:"Late Victorian"},
    {id:"arcano-technical",label:"Arcano-Technical",note:"Magic + engineering"},{id:"cogwork",label:"Cogwork Compound",note:"Gear-spring lexicon"},
    {id:"airship-cant",label:"Airship Cant",note:"Sky-sailor"},{id:"alchemical-latin",label:"Alchemical Latin",note:"Proto-chemistry"},
  ],
  mythpunk:[
    {id:"urban-elvish",label:"Urban Elvish",note:"Ancient meets street"},{id:"street-latin",label:"Street Latin",note:"Roman + modern"},
    {id:"neon-runic",label:"Neon-Runic",note:"Norse + cyberpunk"},{id:"techno-celtic",label:"Techno-Celtic",note:"Druidic + digital"},
    {id:"cyber-arabic",label:"Cyber-Arabic",note:"Arabian Nights + future"},{id:"shadow-market",label:"Shadow-Market Cant",note:"Underground trade"},
    {id:"concrete-fey",label:"Concrete Fey",note:"Urban fairy"},{id:"diesel-mythic",label:"Diesel-Mythic",note:"WWII mythology blend"},
    {id:"weird-west",label:"Weird West",note:"Frontier + supernatural"},{id:"ocean-punk",label:"Ocean Punk",note:"Nautical mythic"},
  ],
  solarpunk:[
    {id:"esperanto",label:"Esperanto",note:"International Auxiliary"},{id:"lojban",label:"Lojban",note:"Logical Constructed"},
    {id:"eco-constructed",label:"Eco-Constructed",note:"Nature-rooted"},{id:"biopunk-creole",label:"Biopunk Creole",note:"Bio-engineering"},
    {id:"garden-tongue",label:"Garden Tongue",note:"Plant-symbiosis"},{id:"solarpunk-composite",label:"Solarpunk Composite",note:"Utopian blend"},
    {id:"reef-speech",label:"Reef Speech",note:"Ocean-ecology"},{id:"canopy-lang",label:"Canopy Language",note:"Forest civilisation"},
    {id:"wind-script",label:"Wind Script",note:"Nomadic sky people"},{id:"seed-cant",label:"Seed Cant",note:"Agricultural commune"},
  ],
}

const ALL_LANGS = Object.entries(LANGS).flatMap(([cat,list]) => list.map(l => ({...l, category:cat})))

const CAT_META: Record<string,{icon:string; label:string; color:string; text:string}> = {
  ancient:      {icon:"𓂀",label:"Ancient",       color:"107,28,168", text:"#B880EE"},
  modern:       {icon:"◈", label:"Modern",        color:"60,150,185", text:"#5AC0D8"},
  high_fantasy: {icon:"⚔", label:"High Fantasy",  color:"180,140,50", text:"#D4B850"},
  dark_occult:  {icon:"☽", label:"Dark & Occult", color:"120,30,150", text:"#D060E0"},
  scifi:        {icon:"✦", label:"Sci-Fi & Space", color:"30,150,200", text:"#30D8F8"},
  steampunk:    {icon:"⚙", label:"Steampunk",     color:"160,110,50", text:"#D49840"},
  mythpunk:     {icon:"◆", label:"Mythpunk",      color:"190,50,90",  text:"#F06080"},
  solarpunk:    {icon:"✿", label:"Solarpunk",     color:"60,170,100", text:"#50E090"},
}
const catBg   = (cat: string, a = 1) => `rgba(${CAT_META[cat]?.color||"150,150,150"},${a})`
const catText = (cat: string) => CAT_META[cat]?.text || "#aaa"

const VIBES = ["Ancient Historic Fantasy","Dark & Mythic","Sacred & Divine","Corrupted & Fallen","Primordial & Elemental","Epic & Heroic","Melancholic & Bittersweet","Arcane & Esoteric","Savage & Primal","Celestial & Transcendent","Industrial & Mechanical","Cosmic & Unknowable","Hopeful & Utopian","Street-Level & Gritty"]
const STYLES = ["Mixed","Harsh & Guttural","Flowing & Melodic","Short & Punchy","Long & Ceremonial","Whispered & Soft","Click & Percussive","Sibilant & Hissing"]
const ARCHETYPES = ["None","Nordic / Germanic","Arabian / Persian","East Asian","African Tribal","Mediterranean / Roman","Celtic / Druidic","Slavic","South Asian","Mesoamerican","Polynesian","East African","Norse Seafarer","Central Asian Nomad","Greco-Byzantine"]
const TARGETS = ["World / Planet","Continent","Kingdom / Nation","City / Settlement","Mountain / Range","River / Body of Water","Forest / Wilderness","Realm / Dimension","Afterlife / Purgatory","Heaven / Divine Realm","Hell / Dark Realm","Space Station / Ship","Character (Male)","Character (Female)","Character (Neutral)","Organization / Faction","Ancient Order","Deity / God","Creature / Species","Item / Object","Artifact / Relic","Era / Age","Concept / Ideology","Magic System","Technology / Device","Clan / House","Planet / Moon","Star System"]
const THEMES = ["Redemption","Corruption & Fall","Restoration","Sacrifice","Ancient Power","Rebirth","Judgment","Lost Glory","Forbidden Knowledge","The Threshold","Covenant","Exile & Return","Light & Shadow","The Wound","Sovereignty","First Contact","Machine Uprising","Ecological Collapse","The Undying","Chosen Path"]
const CHAR_TARGETS = ["Character (Male)","Character (Female)","Character (Neutral)"]
const ITEM_TARGETS = ["Artifact / Relic","Item / Object"]

const ITEM_TYPES: Record<string, string[]> = {
  "Weapons":["Sword (Longsword)","Sword (Shortsword)","Sword (Greatsword)","Sword (Rapier)","Sword (Scimitar)","Sword (Bastard Sword)","Axe (Handaxe)","Axe (Battleaxe)","Axe (Greataxe)","Hammer (Warhammer)","Hammer (Maul)","Mace","Flail","Morning Star","Polearm (Spear)","Polearm (Pike)","Polearm (Halberd)","Polearm (Glaive)","Polearm (Lance)","Polearm (Trident)","Bow (Shortbow)","Bow (Longbow)","Crossbow","Dagger","Knife","Sickle","Scythe","Staff (Quarterstaff)","Club","Greatclub","Whip","Net","Sling","Blowgun","Firearm (Pistol)","Firearm (Musket)","Firearm (Rifle)","Exotic Weapon"],
  "Armor & Shields":["Light Armor (Leather)","Light Armor (Studded Leather)","Light Armor (Padded)","Medium Armor (Chain Shirt)","Medium Armor (Scale Mail)","Medium Armor (Breastplate)","Medium Armor (Half Plate)","Heavy Armor (Ring Mail)","Heavy Armor (Chain Mail)","Heavy Armor (Splint)","Heavy Armor (Full Plate)","Shield (Buckler)","Shield (Round)","Shield (Tower)"],
  "Accessories":["Ring","Amulet","Necklace","Pendant","Talisman","Cloak","Cape","Mantle","Robe","Belt","Girdle","Sash","Boots","Greaves","Sandals","Gloves","Gauntlets","Bracers","Bracelet","Armband","Helm","Crown","Circlet","Diadem","Tiara","Hood","Hat","Earring","Brooch","Pin","Medallion"],
  "Magic Focuses":["Wand","Rod","Sceptre","Orb","Crystal Ball","Staff (Arcane)","Tome / Spellbook","Grimoire","Runestone","Sigil Tablet","Focus Crystal","Totem","Fetish","Idol","Holy Symbol","Unholy Symbol","Druidic Focus","Musical Instrument (Magic)"],
  "Consumables":["Potion","Elixir","Tincture","Philtre","Draught","Scroll","Tablet (Inscribed)","Rune Card","Bomb / Grenade","Flask (Alchemical)","Dust / Powder","Food / Ration (Magical)","Seed (Magical)"],
  "Wondrous Items":["Bag / Sack (Magical)","Box / Chest (Magical)","Container (Magical)","Gem / Stone","Pearl","Crystal","Rune Stone","Lantern / Torch (Magical)","Candle (Magical)","Mirror","Lens / Monocle","Spyglass","Rope / Chain (Magical)","Net (Magical)","Figurine / Statuette","Doll / Puppet","Carpet / Tapestry (Magical)","Painting (Magical)","Instrument (Wondrous)","Clockwork Device","Coin (Magical)","Dice (Magical)","Key (Magical)","Mask","Veil","Tattoo (Magical)","Map (Magical)","Compass (Magical)"],
  "Vehicles & Mounts":["Ship (Magical)","Flying Vehicle","Mechanical Steed","Carpet (Flying)","Broom (Flying)","Construct Mount"],
  "Siege & War":["Siege Weapon (Ballista)","Siege Weapon (Catapult)","Cannon (Magical)","Battle Standard / Banner","War Drum","War Horn"],
}

const RARITIES = [
  {id:"mundane",  label:"Mundane",  color:"#8A7A65",glow:"rgba(138,122,101,0.3)",desc:"No magic. Simple, descriptive names — what it is, what it's made of."},
  {id:"common",   label:"Common",   color:"#C8B99A",glow:"rgba(200,185,154,0.3)",desc:"Slight enchantment. Humble names, perhaps a small epithet."},
  {id:"uncommon", label:"Uncommon", color:"#6DB88A",glow:"rgba(109,184,138,0.3)",desc:"Named with character. A hint of story or craft quality."},
  {id:"rare",     label:"Rare",     color:"#5AC0D8",glow:"rgba(90,192,216,0.3)", desc:"Evocative, story-rich. Suggests a unique history or power."},
  {id:"very-rare",label:"Very Rare",color:"#C090F0",glow:"rgba(192,144,240,0.3)",desc:"Dramatic and mythic. The name carries weight. Feels ancient and earned."},
  {id:"legendary",label:"Legendary",color:"#D4AE58",glow:"rgba(212,174,88,0.4)", desc:"The name itself is a proclamation. Known across the world."},
  {id:"artifact", label:"Artifact", color:"#D4756A",glow:"rgba(212,117,106,0.4)",desc:"Primordial and singular. The item IS the name — it predates language."},
  {id:"unique",   label:"Unique",   color:"#F06080",glow:"rgba(240,96,128,0.3)", desc:"One of a kind. Personal and specific. Carries its creator's mark."},
]

const RARITY_NAMING_GUIDE: Record<string,string> = {
  "mundane":   "Simple and purely descriptive — material, shape, or function. No epithets. Examples: 'Iron Dagger', 'Oak Quarterstaff'.",
  "common":    "Humble and grounded, one small evocative touch. Examples: 'Glowing Stone', 'Warm Cloak'.",
  "uncommon":  "Has character, hints at story or craft quality. Examples: 'Thornstrike', 'Ashwhisper', 'The Hollow Ring'.",
  "rare":      "Evocative and story-rich, unique history or power. Examples: 'Soulwhisper', 'The Pale Covenant', 'Dawnbringer'.",
  "very-rare": "Dramatic and mythic — ancient, earned through legend. Examples: 'Voidreaver', 'Wraithmantle'.",
  "legendary": "A proclamation — fearsome, awe-inspiring. Examples: 'Godsbane', 'The Last Word', 'Worldender'.",
  "artifact":  "Primordial and singular, predates civilizations. Examples: 'Ul\\'Sharath', 'The Devouring'.",
  "unique":    "Personal and specific, carries its creator's mark. Examples: 'Valdris\\'s Promise', 'Gift of the Last King'.",
}

const SS = {fontFamily:"system-ui,sans-serif"} as React.CSSProperties
const GS = {fontFamily:"Georgia,serif"} as React.CSSProperties

interface Lang { id: string; label: string; note?: string; category: string }
interface NameResult { id?: string; name: string; pronunciation: string; language: string; root_words: string; meaning: string; resonance: string; forged?: boolean }
interface HistoryBatchType { id: number; ts: number; open: boolean; target: string; langs: string; results: NameResult[] }
interface PresetType { id: string; name: string; settings: { archetype: string; languages: Lang[]; vibe: string; style: string; themes: string[]; count: number } }

function ComplexityDots({ langCount, themeCount, proposals }: { langCount: number; themeCount: number; proposals: number }) {
  const cx = getComplexity(langCount, themeCount)
  const totalCost = cx.costPerName * proposals
  const [hover, setHover] = useState(false)
  return (
    <div style={{position:"relative",display:"inline-flex",alignItems:"center",gap:4}} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
      {[0,1,2].map(i=>(
        <div key={i} style={{width:8,height:8,borderRadius:"50%",background:i<cx.score+1?"#D4AE58":"rgba(237,224,200,0.12)",border:i<cx.score+1?"none":"1px solid rgba(237,224,200,0.2)",transition:"background 0.2s"}}/>
      ))}
      <span style={{color:C.t3,fontSize:9,marginLeft:2,...SS}}>{cx.label}</span>
      {hover&&(
        <div style={{position:"absolute",bottom:"calc(100% + 8px)",left:"50%",transform:"translateX(-50%)",background:"#1C1810",border:`1px solid ${C.goldB}`,borderRadius:8,padding:"10px 14px",zIndex:200,minWidth:160,pointerEvents:"none",boxShadow:"0 8px 32px rgba(0,0,0,0.6)"}}>
          <div style={{color:C.gold,fontSize:11,fontWeight:600,...SS,marginBottom:6}}>Complexity Breakdown</div>
          <div style={{height:1,background:C.t4,marginBottom:8}}/>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:C.t2,fontSize:10,...SS}}>Languages ({langCount})</span><span style={{color:C.gold,fontSize:10,...SS}}>{cx.score===0?"Simple":cx.score===1&&langCount>=3?"Standard":"—"}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:C.t2,fontSize:10,...SS}}>Themes ({themeCount})</span><span style={{color:C.gold,fontSize:10,...SS}}>{themeCount>=8&&cx.score>=1?"→ Complex":"+0"}</span></div>
          <div style={{height:1,background:C.t4,margin:"8px 0"}}/>
          <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:C.t2,fontSize:10,...SS}}>Per name</span><span style={{color:C.gold,fontSize:10,fontWeight:600,...SS}}>{cx.costPerName} credit{cx.costPerName!==1?"s":""}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}><span style={{color:C.t2,fontSize:10,...SS}}>{proposals} proposals</span><span style={{color:C.gold,fontSize:10,fontWeight:600,...SS}}>{totalCost} credits total</span></div>
        </div>
      )}
    </div>
  )
}

function Label({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{color:C.t3,fontSize:9,letterSpacing:2,textTransform:"uppercase",marginBottom:7,fontWeight:600,...SS,...style}}>{children}</div>
}

function Chip({ children, active, onClick, disabled }: { children: React.ReactNode; active: boolean; onClick: () => void; disabled?: boolean }) {
  return <button onClick={onClick} disabled={disabled} style={{background:active?C.goldDim:C.t4,border:`1px solid ${active?C.goldB:"rgba(237,224,200,0.09)"}`,borderRadius:5,padding:"4px 10px",marginRight:5,marginBottom:5,color:active?C.gold:disabled?"rgba(237,224,200,0.15)":C.t3,cursor:disabled?"not-allowed":"pointer",fontSize:10,...GS,transition:"all 0.15s",opacity:disabled?0.5:1}}>{children}</button>
}

function Toast({ message }: { message: string }) {
  if (!message) return null
  return <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:"#2A2318",border:`1px solid ${C.goldB}`,borderRadius:8,padding:"9px 20px",color:C.gold,fontSize:12,...GS,zIndex:1000,boxShadow:"0 8px 32px rgba(0,0,0,0.6)",pointerEvents:"none",whiteSpace:"nowrap"}}>{message}</div>
}

function CreditPill({ remaining, total, cost }: { remaining: number; total: number; cost: number }) {
  const low   = total !== Infinity && remaining < total * 0.15
  const broke = total !== Infinity && remaining < cost
  const pct   = total === Infinity ? 100 : Math.max(0,(remaining/total)*100)
  const col   = broke||low ? C.danger : C.gold
  return (
    <div style={{display:"flex",flexDirection:"column",gap:3,alignItems:"flex-end"}}>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <span style={{color:C.t3,fontSize:9,letterSpacing:1,fontWeight:600,...SS}}>CREDITS</span>
        <span style={{color:col,fontSize:13,...GS,fontWeight:"bold"}}>{total===Infinity?"∞":remaining}</span>
        {total!==Infinity&&<span style={{color:C.t3,fontSize:9,fontWeight:500,...SS}}>/ {total}</span>}
      </div>
      {total!==Infinity&&(
        <div style={{width:80,height:3,background:C.t4,borderRadius:2,overflow:"hidden"}}>
          <div style={{width:`${pct}%`,height:"100%",background:col,borderRadius:2,transition:"width 0.4s"}}/>
        </div>
      )}
    </div>
  )
}

function SearchableSelect({ value, onChange, options, placeholder="Search…", accent }: { value: string; onChange: (v: string) => void; options: (string | {group: string; items: string[]})[] ; placeholder?: string; accent?: string }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const ac  = accent || C.purpleL
  const acb = accent ? `${accent}55` : C.purpleB
  const acDim = accent ? `${accent}18` : C.purpleDim
  const isGrouped = options.length > 0 && typeof options[0] === "object" && "group" in (options[0] as object)
  useEffect(()=>{ const h=(e: MouseEvent)=>{ if(ref.current&&!ref.current.contains(e.target as Node)){setOpen(false);setSearch("")}}; document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h) },[])
  useEffect(()=>{ if(open&&inputRef.current)inputRef.current.focus() },[open])
  const filtered = useMemo(()=>{ const q=search.toLowerCase().trim(); if(!q)return options; if(!isGrouped)return(options as string[]).filter(o=>o.toLowerCase().includes(q)); return(options as {group:string;items:string[]}[]).map(g=>({group:g.group,items:g.items.filter(it=>it.toLowerCase().includes(q))})).filter(g=>g.items.length>0) },[search,options,isGrouped])
  const flat = isGrouped?(filtered as {group:string;items:string[]}[]).flatMap(g=>g.items):filtered as string[]
  const select = (item: string)=>{ onChange(item); setSearch("") }
  return (
    <div ref={ref} style={{position:"relative"}}>
      <div onClick={()=>setOpen(!open)} style={{background:C.t4,border:`1px solid ${open?acb:"rgba(237,224,200,0.12)"}`,borderRadius:8,padding:"9px 12px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",minHeight:40,transition:"border-color 0.2s"}}>
        <span style={{color:value?C.t1:C.t3,fontSize:13,...GS,fontWeight:value?500:400}}>{value||placeholder}</span>
        <span style={{color:C.t3,fontSize:9,transform:open?"rotate(180deg)":"none",transition:"transform 0.2s",marginLeft:8,flexShrink:0}}>▼</span>
      </div>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 5px)",left:0,right:0,zIndex:300,background:"#1C1810",border:`1px solid ${acb}`,borderRadius:10,boxShadow:"0 20px 60px rgba(0,0,0,0.8)",overflow:"hidden"}}>
          <div style={{padding:"10px 10px 8px",borderBottom:`1px solid ${C.t4}`}}>
            <input ref={inputRef} placeholder={placeholder} value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter"&&flat.length>0){select(flat[0]);setOpen(false)} if(e.key==="Escape"){setOpen(false);setSearch("")} }} style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,padding:"8px 12px",color:C.t1,fontSize:12,...GS,outline:"none"}}/>
            {search&&<div style={{color:C.t3,fontSize:9,letterSpacing:2,textTransform:"uppercase",...SS,marginTop:6}}>{flat.length} result{flat.length!==1?"s":""}{flat.length>0&&<span style={{marginLeft:8,fontStyle:"italic"}}>↵ to pick first</span>}</div>}
          </div>
          <div style={{maxHeight:240,overflowY:"auto",padding:"4px 0"}}>
            {flat.length===0&&<div style={{color:C.t3,fontSize:12,textAlign:"center",padding:"20px 0",...GS,fontStyle:"italic"}}>No results</div>}
            {!isGrouped&&(filtered as string[]).map(opt=>{ const active=opt===value; return(<div key={opt} onClick={()=>{select(opt);setOpen(false)}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 14px",cursor:"pointer",background:active?acDim:"transparent",transition:"background 0.1s"}} onMouseEnter={e=>{if(!active)(e.currentTarget as HTMLDivElement).style.background="rgba(255,255,255,0.04)"}} onMouseLeave={e=>{if(!active)(e.currentTarget as HTMLDivElement).style.background="transparent"}}><span style={{color:active?ac:C.t1,fontSize:12,fontWeight:active?600:400,...SS}}>{opt}</span>{active&&<span style={{color:ac,fontSize:13}}>✓</span>}</div>) })}
            {isGrouped&&(filtered as {group:string;items:string[]}[]).map(g=>(<div key={g.group}><div style={{padding:"6px 14px 3px",color:C.t3,fontSize:9,letterSpacing:2,textTransform:"uppercase",...SS,borderTop:`1px solid ${C.t4}`,marginTop:2}}>{g.group}</div>{g.items.map(opt=>{ const active=opt===value; return(<div key={opt} onClick={()=>{select(opt);setOpen(false)}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 14px 6px 20px",cursor:"pointer",background:active?acDim:"transparent",transition:"background 0.1s"}} onMouseEnter={e=>{if(!active)(e.currentTarget as HTMLDivElement).style.background="rgba(255,255,255,0.04)"}} onMouseLeave={e=>{if(!active)(e.currentTarget as HTMLDivElement).style.background="transparent"}}><span style={{color:active?ac:C.t1,fontSize:12,fontWeight:active?600:400,...SS}}>{opt}</span>{active&&<span style={{color:ac,fontSize:13}}>✓</span>}</div>) })}</div>))}
          </div>
        </div>
      )}
    </div>
  )
}

function LanguagePicker({ selected, onChange, maxLangs }: { selected: Lang[]; onChange: (v: Lang[]) => void; maxLangs: number }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState("ancient")
  const ref = useRef<HTMLDivElement>(null)
  const atLimit = maxLangs !== Infinity && selected.length >= maxLangs
  useEffect(()=>{ const h=(e: MouseEvent)=>{ if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false)}; document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h) },[])
  const filtered = useMemo(()=>{ if(!search.trim())return null; const q=search.toLowerCase(); return ALL_LANGS.filter(l=>l.label.toLowerCase().includes(q)||(l.note||"").toLowerCase().includes(q)) },[search])
  const list = filtered || LANGS[tab].map(l=>({...l,category:tab}))
  const toggle = (lang: Lang) => { if(selected.find(s=>s.id===lang.id))onChange(selected.filter(s=>s.id!==lang.id)); else if(!atLimit)onChange([...selected,lang]) }
  return (
    <div ref={ref} style={{position:"relative"}}>
      {maxLangs!==Infinity&&<div style={{display:"flex",justifyContent:"flex-end",marginBottom:4}}><span style={{fontSize:9,letterSpacing:1,...SS,color:atLimit?C.danger:C.t3,background:atLimit?C.dangerDim:"transparent",border:`1px solid ${atLimit?C.dangerB:"transparent"}`,borderRadius:4,padding:atLimit?"2px 7px":"0"}}>{selected.length}/{maxLangs}{atLimit&&" — limit reached"}</span></div>}
      <div onClick={()=>setOpen(!open)} style={{background:C.t4,border:`1px solid ${open?C.purpleB:"rgba(237,224,200,0.12)"}`,borderRadius:8,padding:"9px 12px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",minHeight:44,transition:"border-color 0.2s"}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,flex:1}}>
          {selected.length===0?<span style={{color:C.t3,fontSize:13,...GS}}>Select languages…</span>:selected.map(l=>(
            <span key={l.id} style={{background:catBg(l.category,0.18),border:`1px solid ${catBg(l.category,0.4)}`,borderRadius:4,padding:"2px 8px",fontSize:11,color:catText(l.category),display:"flex",alignItems:"center",gap:4,...SS}}>
              {l.label}<span onClick={e=>{e.stopPropagation();toggle(l)}} style={{opacity:0.55,cursor:"pointer",fontSize:13,lineHeight:1}}>×</span>
            </span>
          ))}
        </div>
        <span style={{color:C.t3,fontSize:9,flexShrink:0,transform:open?"rotate(180deg)":"none",transition:"transform 0.2s",marginLeft:6}}>▼</span>
      </div>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 5px)",left:0,right:0,zIndex:300,background:"#1C1810",border:`1px solid ${C.purpleB}`,borderRadius:10,boxShadow:"0 20px 60px rgba(0,0,0,0.8)",overflow:"hidden"}}>
          <div style={{padding:"10px 10px 0"}}><input autoFocus placeholder="Search all languages…" value={search} onChange={e=>setSearch(e.target.value)} style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,padding:"8px 12px",color:C.t1,fontSize:12,...GS,outline:"none"}}/></div>
          {atLimit&&<div style={{margin:"8px 10px 0",padding:"6px 10px",background:C.dangerDim,border:`1px solid ${C.dangerB}`,borderRadius:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{color:C.danger,fontSize:10,...SS}}>Language limit reached.</span><span style={{color:C.gold,fontSize:10,cursor:"pointer",...SS}}>Upgrade →</span></div>}
          <div style={{display:"flex",maxHeight:260}}>
            {!search&&(
              <div style={{width:120,flexShrink:0,borderRight:`1px solid ${C.t4}`,overflowY:"auto",padding:"8px 0"}}>
                {Object.entries(CAT_META).map(([key,meta])=>{ const cnt=selected.filter(s=>s.category===key).length; const active=tab===key; return(
                  <div key={key} onClick={()=>setTab(key)} style={{display:"flex",alignItems:"center",gap:7,padding:"7px 10px",cursor:"pointer",background:active?catBg(key,0.15):"transparent",borderRight:active?`2px solid ${catText(key)}`:"2px solid transparent",transition:"all 0.12s"}}>
                    <span style={{fontSize:13}}>{meta.icon}</span>
                    <span style={{fontSize:10,color:active?catText(key):C.t3,fontWeight:active?600:400,...SS,flex:1}}>{meta.label}</span>
                    {cnt>0&&<span style={{fontSize:9,background:catBg(key,0.3),borderRadius:9,padding:"1px 5px",color:catText(key),...SS}}>{cnt}</span>}
                  </div>
                )})}
              </div>
            )}
            <div style={{flex:1,overflowY:"auto",padding:"6px"}}>
              {search&&<div style={{padding:"4px 8px 6px",color:C.t3,fontSize:9,letterSpacing:2,textTransform:"uppercase",...SS}}>{filtered?.length||0} results</div>}
              {list.length===0?<div style={{color:C.t3,fontSize:12,textAlign:"center",padding:"20px 0",...GS}}>No results</div>:list.map(lang=>{ const isSel=!!selected.find(s=>s.id===lang.id); const blocked=atLimit&&!isSel; return(
                <div key={lang.id} onClick={()=>!blocked&&toggle(lang as Lang)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 9px",borderRadius:6,cursor:blocked?"not-allowed":"pointer",background:isSel?catBg(lang.category,0.12):"transparent",opacity:blocked?0.35:1,transition:"background 0.1s"}} onMouseEnter={e=>{if(!isSel&&!blocked)(e.currentTarget as HTMLDivElement).style.background="rgba(255,255,255,0.04)"}} onMouseLeave={e=>{if(!isSel)(e.currentTarget as HTMLDivElement).style.background="transparent"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    {search&&<span style={{fontSize:9,textTransform:"uppercase",letterSpacing:0.5,background:catBg(lang.category,0.15),border:`1px solid ${catBg(lang.category,0.3)}`,borderRadius:3,padding:"1px 5px",color:catText(lang.category),...SS}}>{lang.category.replace("_"," ")}</span>}
                    <span style={{color:isSel?catText(lang.category):C.t1,fontSize:12,fontWeight:isSel?600:400,...SS}}>{lang.label}</span>
                    {lang.note&&<span style={{color:C.t3,fontSize:10,...SS}}>{lang.note}</span>}
                  </div>
                  {isSel&&<span style={{color:catText(lang.category),fontSize:12}}>✓</span>}
                </div>
              )})}
            </div>
          </div>
          {selected.length>0&&<div style={{borderTop:`1px solid ${C.t4}`,padding:"7px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{color:C.t2,fontSize:10,...SS}}>{selected.length} selected</span><button onClick={()=>onChange([])} style={{background:"transparent",border:"none",color:C.gold,cursor:"pointer",fontSize:10,...GS,opacity:0.65}}>Clear all</button></div>}
        </div>
      )}
    </div>
  )
}

function MultiDropdown({ selected, onChange, options, placeholder="Select…" }: { selected: string[]; onChange: (v: string[]) => void; options: string[]; placeholder?: string }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  useEffect(()=>{ const h=(e: MouseEvent)=>{ if(ref.current&&!ref.current.contains(e.target as Node))setOpen(false)}; document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h) },[])
  const filtered = useMemo(()=>{ if(!search.trim())return options; const q=search.toLowerCase(); return options.filter(o=>o.toLowerCase().includes(q)) },[search,options])
  const toggle = (opt: string) => onChange(selected.includes(opt)?selected.filter(x=>x!==opt):[...selected,opt])
  return (
    <div ref={ref} style={{position:"relative"}}>
      <div onClick={()=>setOpen(!open)} style={{background:C.t4,border:`1px solid ${open?C.purpleB:"rgba(237,224,200,0.12)"}`,borderRadius:8,padding:"9px 12px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",minHeight:44,transition:"border-color 0.2s"}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,flex:1}}>
          {selected.length===0?<span style={{color:C.t3,fontSize:13,...GS}}>{placeholder}</span>:selected.map(s=>(
            <span key={s} style={{background:C.goldDim,border:`1px solid ${C.goldB}`,borderRadius:4,padding:"2px 8px",fontSize:11,color:C.gold,display:"flex",alignItems:"center",gap:4,...SS}}>{s}<span onClick={e=>{e.stopPropagation();toggle(s)}} style={{opacity:0.55,cursor:"pointer",fontSize:13,lineHeight:1}}>×</span></span>
          ))}
        </div>
        <span style={{color:C.t3,fontSize:9,flexShrink:0,transform:open?"rotate(180deg)":"none",transition:"transform 0.2s",marginLeft:6}}>▼</span>
      </div>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 5px)",left:0,right:0,zIndex:300,background:"#1C1810",border:`1px solid ${C.purpleB}`,borderRadius:10,boxShadow:"0 20px 60px rgba(0,0,0,0.8)",overflow:"hidden"}}>
          <div style={{padding:"10px 10px 0"}}><input autoFocus placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,padding:"8px 12px",color:C.t1,fontSize:12,...GS,outline:"none"}}/></div>
          <div style={{maxHeight:220,overflowY:"auto",padding:"6px"}}>
            {filtered.length===0?<div style={{color:C.t3,fontSize:12,textAlign:"center",padding:"16px 0",...GS}}>No results</div>:filtered.map(opt=>{ const isSel=selected.includes(opt); return(
              <div key={opt} onClick={()=>toggle(opt)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 10px",borderRadius:6,cursor:"pointer",background:isSel?C.goldDim:"transparent",transition:"background 0.1s"}} onMouseEnter={e=>{if(!isSel)(e.currentTarget as HTMLDivElement).style.background="rgba(255,255,255,0.04)"}} onMouseLeave={e=>{if(!isSel)(e.currentTarget as HTMLDivElement).style.background="transparent"}}>
                <span style={{color:isSel?C.gold:C.t1,fontSize:12,fontWeight:isSel?600:400,...SS}}>{opt}</span>
                {isSel&&<span style={{color:C.gold,fontSize:13}}>✓</span>}
              </div>
            )})}
          </div>
          {selected.length>0&&<div style={{borderTop:`1px solid ${C.t4}`,padding:"7px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{color:C.t2,fontSize:10,...SS}}>{selected.length} selected</span><button onClick={()=>onChange([])} style={{background:"transparent",border:"none",color:C.gold,cursor:"pointer",fontSize:10,...GS,opacity:0.65}}>Clear all</button></div>}
        </div>
      )}
    </div>
  )
}

function PresetDropdown({ presets, activeId, onLoad, onSave, onDelete, maxPresets }: { presets: PresetType[]; activeId: string|null; onLoad: (p: PresetType) => void; onSave: (name: string) => void; onDelete: (id: string) => void; maxPresets: number }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newName, setNewName] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  const canAdd = presets.length < maxPresets
  const active = presets.find(p=>p.id===activeId)
  useEffect(()=>{ const h=(e: MouseEvent)=>{ if(ref.current&&!ref.current.contains(e.target as Node)){setOpen(false);setSaving(false)}}; document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h) },[])
  const doSave = () => { if(!newName.trim())return; onSave(newName.trim()); setNewName(""); setSaving(false); setOpen(false) }
  return (
    <div ref={ref} style={{position:"relative"}}>
      <div onClick={()=>setOpen(!open)} style={{background:C.t4,border:`1px solid ${open?C.purpleB:"rgba(237,224,200,0.12)"}`,borderRadius:8,padding:"9px 12px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",minHeight:40,transition:"border-color 0.2s"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
          {active?<span style={{background:C.purpleDim,border:`1px solid ${C.purpleB}`,borderRadius:4,padding:"2px 10px",fontSize:12,color:C.purpleL,...GS,fontStyle:"italic"}}>{active.name}</span>:<span style={{color:C.t3,fontSize:13,...GS}}>Select a preset…</span>}
        </div>
        <span style={{color:C.t3,fontSize:9,flexShrink:0,transform:open?"rotate(180deg)":"none",transition:"transform 0.2s",marginLeft:6}}>▼</span>
      </div>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 5px)",left:0,right:0,zIndex:300,background:"#1C1810",border:`1px solid ${C.purpleB}`,borderRadius:10,boxShadow:"0 20px 60px rgba(0,0,0,0.8)",overflow:"hidden"}}>
          {presets.length===0?<div style={{padding:"16px",color:C.t3,fontSize:12,textAlign:"center",...GS,fontStyle:"italic"}}>No presets saved yet</div>:(
            <div style={{maxHeight:200,overflowY:"auto",padding:"6px"}}>
              {presets.map(p=>(
                <div key={p.id} style={{display:"flex",alignItems:"center",padding:"8px 10px",borderRadius:6,background:p.id===activeId?C.purpleDim:"transparent",transition:"background 0.1s"}} onMouseEnter={e=>{if(p.id!==activeId)(e.currentTarget as HTMLDivElement).style.background="rgba(255,255,255,0.04)"}} onMouseLeave={e=>{if(p.id!==activeId)(e.currentTarget as HTMLDivElement).style.background="transparent"}}>
                  <div onClick={()=>{onLoad(p);setOpen(false)}} style={{flex:1,cursor:"pointer"}}>
                    <span style={{color:p.id===activeId?C.purpleL:C.t1,fontSize:13,...GS,fontStyle:"italic",fontWeight:p.id===activeId?600:400}}>{p.name}</span>
                    <span style={{color:C.t3,fontSize:10,marginLeft:8,...SS}}>{p.settings.languages.slice(0,2).map(l=>l.label).join(", ")}{p.settings.languages.length>2?` +${p.settings.languages.length-2}`:""} · {p.settings.vibe.split(" ")[0]}</span>
                  </div>
                  <button onClick={e=>{e.stopPropagation();onDelete(p.id)}} style={{background:"transparent",border:"none",cursor:"pointer",color:C.t3,fontSize:16,padding:"0 6px",lineHeight:1,transition:"color 0.15s",flexShrink:0}} onMouseEnter={e=>(e.target as HTMLButtonElement).style.color=C.danger} onMouseLeave={e=>(e.target as HTMLButtonElement).style.color=C.t3}>×</button>
                </div>
              ))}
            </div>
          )}
          <div style={{borderTop:`1px solid ${C.t4}`,padding:"10px"}}>
            {!canAdd?<div style={{color:C.t3,fontSize:10,textAlign:"center",...SS}}>Preset limit reached ({maxPresets}). <span style={{color:C.gold,cursor:"pointer"}}>Upgrade →</span></div>:saving?(
              <div style={{display:"flex",gap:6}}>
                <input autoFocus placeholder="Preset name…" value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doSave()} style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:6,padding:"7px 10px",color:C.t1,fontSize:12,...GS,outline:"none"}}/>
                <button onClick={doSave} disabled={!newName.trim()} style={{background:C.purpleDim,border:`1px solid ${C.purpleB}`,borderRadius:6,padding:"7px 12px",color:C.purpleL,cursor:newName.trim()?"pointer":"not-allowed",fontSize:11,...GS}}>Save</button>
                <button onClick={()=>{setSaving(false);setNewName("")}} style={{background:"transparent",border:`1px solid rgba(237,224,200,0.1)`,borderRadius:6,padding:"7px 10px",color:C.t3,cursor:"pointer",fontSize:11,...SS}}>✕</button>
              </div>
            ):(
              <button onClick={()=>setSaving(true)} style={{width:"100%",background:"transparent",border:"1px dashed rgba(107,28,168,0.35)",borderRadius:6,padding:"8px",color:C.t3,cursor:"pointer",fontSize:10,letterSpacing:1.5,textTransform:"uppercase",...GS,transition:"all 0.15s"}} onMouseEnter={e=>{(e.target as HTMLButtonElement).style.borderColor=C.purpleB;(e.target as HTMLButtonElement).style.color=C.purpleL}} onMouseLeave={e=>{(e.target as HTMLButtonElement).style.borderColor="rgba(107,28,168,0.35)";(e.target as HTMLButtonElement).style.color=C.t3}}>+ Save current settings as preset</button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const speak = (text: string) => {
  if(!("speechSynthesis" in window))return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.rate=0.75; u.pitch=0.9
  window.speechSynthesis.speak(u)
}

function ResultCard({ r, saved, canSave, onSave, onCopy, onForgeOne, isHistory }: { r: NameResult; saved: boolean; canSave: boolean; onSave: (r: NameResult) => void; onCopy: (name: string) => void; onForgeOne: (r: NameResult) => void; isHistory?: boolean }) {
  const [copying, setCopying] = useState(false)
  const doCopy = () => { navigator.clipboard.writeText(r.name).then(()=>{ setCopying(true); setTimeout(()=>setCopying(false),1500); onCopy&&onCopy(r.name) }) }
  return (
    <div style={{background:C.card2,border:`1px solid ${r.forged?"rgba(212,174,88,0.28)":C.border}`,borderRadius:10,padding:"14px 16px",marginBottom:9,transition:"border-color 0.2s,background 0.2s",position:"relative"}} onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.borderColor=r.forged?C.goldB:C.purpleB;(e.currentTarget as HTMLDivElement).style.background="rgba(107,28,168,0.05)"}} onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.borderColor=r.forged?"rgba(212,174,88,0.28)":C.border;(e.currentTarget as HTMLDivElement).style.background=C.card2}}>
      {r.forged&&<div style={{position:"absolute",top:10,right:48,fontSize:9,color:C.gold,letterSpacing:1,textTransform:"uppercase",...SS,opacity:0.7}}>↻ forged</div>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{flex:1}}>
          <div style={{color:C.t1,fontSize:20,fontStyle:"italic",...GS,letterSpacing:0.5,fontWeight:600}}>{r.name}</div>
          <div style={{color:C.gold,fontSize:11,marginTop:3,letterSpacing:1.5,fontWeight:500,...SS}}>{r.pronunciation}</div>
        </div>
        <div style={{display:"flex",gap:4,flexShrink:0,marginLeft:10,alignItems:"center"}}>
          <button onClick={()=>speak(r.pronunciation||r.name)} style={{background:"transparent",border:"none",cursor:"pointer",fontSize:14,color:C.t3,padding:"3px 5px",transition:"color 0.15s"}} onMouseEnter={e=>(e.target as HTMLButtonElement).style.color=C.t1} onMouseLeave={e=>(e.target as HTMLButtonElement).style.color=C.t3}>🔊</button>
          <button onClick={doCopy} style={{background:copying?C.goldDim:"transparent",border:`1px solid ${copying?C.goldB:"transparent"}`,borderRadius:5,cursor:"pointer",fontSize:12,color:copying?C.gold:C.t3,padding:"3px 7px",transition:"all 0.15s",...SS}}>{copying?"✓":"⎘"}</button>
          {!isHistory&&<button onClick={()=>(saved||canSave)&&onSave(r)} style={{background:"transparent",border:"none",cursor:saved||canSave?"pointer":"not-allowed",fontSize:18,color:saved?C.gold:"rgba(237,224,200,0.18)",padding:"2px 4px",transition:"color 0.2s",opacity:!saved&&!canSave?0.35:1}}>{saved?"★":"☆"}</button>}
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:7,margin:"9px 0 8px"}}>
        <span style={{background:C.purpleDim,border:`1px solid ${C.purpleB}`,borderRadius:4,padding:"3px 9px",fontSize:11,color:C.purpleL,letterSpacing:0.4,fontWeight:600,...SS}}>{r.language}</span>
        <span style={{color:C.t2,fontSize:11,fontStyle:"italic",...GS}}>{r.root_words} — &ldquo;{r.meaning}&rdquo;</span>
      </div>
      <div style={{color:C.t2,fontSize:12,lineHeight:1.75,fontStyle:"italic",...GS,borderTop:`1px solid ${C.t4}`,paddingTop:9}}>{r.resonance}</div>
      {!isHistory&&(
        <div style={{marginTop:10,display:"flex",justifyContent:"flex-end"}}>
          <button onClick={()=>onForgeOne(r)} style={{background:"transparent",border:`1px solid rgba(237,224,200,0.1)`,borderRadius:5,padding:"4px 10px",color:C.t3,cursor:"pointer",fontSize:9,letterSpacing:1,textTransform:"uppercase",...GS,transition:"all 0.15s"}} onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor=C.goldB;(e.currentTarget as HTMLButtonElement).style.color=C.gold}} onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor="rgba(237,224,200,0.1)";(e.currentTarget as HTMLButtonElement).style.color=C.t3}}>↻ forge similar (1cr)</button>
        </div>
      )}
    </div>
  )
}

function HistoryBatch({ batch, onToggle }: { batch: HistoryBatchType; onToggle: () => void }) {
  const age = () => { const s=Math.floor((Date.now()-batch.ts)/1000); if(s<60)return`${s}s ago`; if(s<3600)return`${Math.floor(s/60)}m ago`; return`${Math.floor(s/3600)}h ago` }
  return (
    <div style={{border:`1px solid rgba(237,224,200,0.07)`,borderRadius:9,marginBottom:8,overflow:"hidden"}}>
      <div onClick={onToggle} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",cursor:"pointer",background:"rgba(237,224,200,0.02)",transition:"background 0.15s"}} onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background="rgba(237,224,200,0.04)"} onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background="rgba(237,224,200,0.02)"}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{color:C.t3,fontSize:10,...SS}}>{age()}</span>
          <span style={{color:C.t2,fontSize:11,...GS,fontStyle:"italic"}}>{batch.target}</span>
          <span style={{color:C.t3,fontSize:10,...SS}}>{batch.langs}</span>
          <span style={{color:C.t3,fontSize:10,background:C.t4,borderRadius:4,padding:"1px 6px",...SS}}>{batch.results.length} names</span>
        </div>
        <span style={{color:C.t3,fontSize:9,transform:batch.open?"rotate(180deg)":"none",transition:"transform 0.2s"}}>▼</span>
      </div>
      {batch.open&&<div style={{padding:"8px 12px 4px",borderTop:`1px solid ${C.t4}`}}>{batch.results.map((r,i)=><ResultCard key={i} r={r} isHistory saved={false} canSave={false} onCopy={()=>{}} onSave={()=>{}} onForgeOne={()=>{}}/>)}</div>}
    </div>
  )
}

export default function TheSignet() {
  const [profileLoading, setProfileLoading] = useState(true)
  const [tierKey,        setTierKey]        = useState("wanderer")
  const [credits,        setCredits]        = useState(0)
  const [languages,      setLanguages]      = useState<Lang[]>([
    {id:"hebrew",  label:"Hebrew",   note:"Biblical",    category:"ancient"},
    {id:"sumerian",label:"Sumerian", note:"Mesopotamia", category:"ancient"},
  ])
  const [vibe,           setVibe]           = useState("Ancient Historic Fantasy")
  const [style,          setStyle]          = useState("Mixed")
  const [archetype,      setArchetype]      = useState("None")
  const [itemType,       setItemType]       = useState("Sword (Longsword)")
  const [rarity,         setRarity]         = useState("uncommon")
  const [sentient,       setSentient]       = useState(false)
  const [target,         setTarget]         = useState("World / Planet")
  const [themes,         setThemes]         = useState(["Redemption","Restoration"])
  const [count,          setCount]          = useState(3)
  const [results,        setResults]        = useState<NameResult[]>([])
  const [history,        setHistory]        = useState<HistoryBatchType[]>([])
  const [loading,        setLoading]        = useState(false)
  const [forgingId,      setForgingId]      = useState<string|null>(null)
  const [error,          setError]          = useState<string|null>(null)
  const [saved,          setSaved]          = useState<NameResult[]>([])
  const [toast,          setToast]          = useState("")
  const [mobile,         setMobile]         = useState(false)
  const [filtersOpen,    setFiltersOpen]    = useState(true)
  const [generatedNames, setGeneratedNames] = useState<string[]>([])
  const [presets,        setPresets]        = useState<PresetType[]>([])
  const [activePreset,   setActivePreset]   = useState<string|null>(null)

  const tier = TIERS[tierKey] || TIERS["wanderer"]

  useEffect(()=>{ const c=()=>setMobile(window.innerWidth<768); c(); window.addEventListener("resize",c); return()=>window.removeEventListener("resize",c) },[])

  useEffect(()=>{
    const init = async () => {
      try {
        const [profileRes, savedRes, presetsRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch("/api/user/saved-names"),
          fetch("/api/user/presets"),
        ])
        const [profile, savedData, presetsData] = await Promise.all([
          profileRes.json(), savedRes.json(), presetsRes.json(),
        ])
        if (profile.tier) setTierKey(profile.tier)
        if (profile.credits !== undefined) setCredits(profile.credits)
        if (Array.isArray(savedData)) setSaved(savedData)
        if (Array.isArray(presetsData)) setPresets(presetsData.map((p: {id:string;name:string;settings:PresetType["settings"]})=>({id:p.id,name:p.name,settings:p.settings})))
      } catch(e) { console.error("Failed to load profile",e) }
      finally { setProfileLoading(false) }
    }
    init()
  },[])

  const showToast   = (msg: string) => { setToast(msg); setTimeout(()=>setToast(""),1800) }
  const canSave     = tier.maxSaves === Infinity || saved.length < tier.maxSaves
  const isCharTarget = CHAR_TARGETS.includes(target)
  const isItemTarget = ITEM_TARGETS.includes(target)
  const cx          = getComplexity(languages.length, themes.length)
  const totalCost   = cx.costPerName * count
  const canAfford   = credits === Infinity || credits >= totalCost

  const savePreset = async (name: string) => {
    const settings = { archetype, languages, vibe, style, themes, count }
    const res  = await fetch("/api/user/presets",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,settings})})
    const data = await res.json()
    setPresets(prev=>[...prev,{id:data.id,name:data.name,settings:data.settings}])
    setActivePreset(data.id); showToast(`Preset "${name}" saved`)
  }
  const loadPreset = (p: PresetType) => {
    const s=p.settings; setArchetype(s.archetype); setLanguages(s.languages); setVibe(s.vibe)
    setStyle(s.style); setThemes(s.themes); setCount(s.count)
    setActivePreset(p.id); showToast(`Loaded "${p.name}"`)
  }
  const deletePreset = async (id: string) => {
    setPresets(p=>p.filter(x=>x.id!==id)); if(activePreset===id)setActivePreset(null)
    showToast("Preset deleted"); await fetch(`/api/user/presets?id=${id}`,{method:"DELETE"})
  }
  const toggleSave = async (r: NameResult) => {
    const existing = saved.find(s=>s.name===r.name)
    if (existing) {
      setSaved(p=>p.filter(s=>s.name!==r.name)); showToast(`"${r.name}" removed`)
      if (existing.id) await fetch(`/api/user/saved-names?id=${existing.id}`,{method:"DELETE"})
    } else if (canSave) {
      const res  = await fetch("/api/user/saved-names",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)})
      const data = await res.json()
      setSaved(p=>[...p,{...r,id:data.id}]); showToast(`"${r.name}" saved ★`)
    } else { showToast("Save limit reached — upgrade for more") }
  }
  const exportSaved = () => {
    if(!saved.length)return
    navigator.clipboard.writeText(saved.map(s=>`${s.name} (${s.pronunciation}) — ${s.language} · ${s.root_words}: "${s.meaning}"\n${s.resonance}`).join("\n\n"))
    showToast(`${saved.length} names copied to clipboard`)
  }
  const archiveResults = (res: NameResult[]) => {
    if(!res?.length)return
    const batch: HistoryBatchType = {id:Date.now(),ts:Date.now(),open:false,target,langs:languages.slice(0,3).map(l=>l.label).join(", ")+(languages.length>3?` +${languages.length-3}`:""),results:res}
    setHistory(h=>{ const u=[batch,...h]; return tier.historyLimit!==Infinity?u.slice(0,tier.historyLimit):u })
  }
  const toggleHistory = (id: number) => setHistory(h=>h.map(b=>b.id===id?{...b,open:!b.open}:b))

  const buildPrompt = (n: number, ref: NameResult|null) => {
    const langNames = languages.map(l=>l.label).join(", ")
    const refNote   = ref?`\nStyle reference: evoke a similar feel to "${ref.name}" (${ref.language}) but produce a distinct new name.`:""
    const dedupNote = tier.dedup&&generatedNames.length>0?`\n\nCritical: do NOT generate any of these previously seen names: ${generatedNames.slice(-150).join(", ")}`:""
    const itemNote  = isItemTarget?`\nItem type: ${itemType}\nRarity: ${RARITIES.find(r=>r.id===rarity)?.label||rarity}\nNaming guidance: ${RARITY_NAMING_GUIDE[rarity]||""}${sentient?"\nThis item is SENTIENT — name it like a character name, something the item calls itself.":""}`:""
    return `You are a master linguist and worldbuilder specializing in fantasy nomenclature.\n\nGenerate exactly ${n} name proposal${n>1?"s":""} for: "${target}"\nLanguages to draw from: ${langNames}\nAesthetic vibe: ${vibe}\nPhonological style: ${style}${isCharTarget&&archetype!=="None"?`\nCultural archetype: ${archetype}`:""}${itemNote}\nThematic undertones: ${themes.join(", ")||"None"}${refNote}${dedupNote}\n\nRules:\n- Each name must feel grounded, polished, non-generic\n- Mix single-language and blended names across the set\n- Every name must have a distinctly different rhythm and length\n- For item names: the rarity should be FELT in the name\n\nReturn ONLY a valid JSON array, no extra text:\n[{"name":"","pronunciation":"phonetic e.g. sha-LEM","language":"","root_words":"","meaning":"","resonance":""}]`
  }

  const generate = async () => {
    if(!languages.length){setError("Select at least one language.");return}
    if(!canAfford){setError(`Need ${totalCost} credits. You have ${credits}.`);return}
    if(results.length)archiveResults(results)
    setLoading(true); setError(null); setResults([])
    try {
      const res  = await fetch("/api/generate/signet",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({max_tokens:1400,messages:[{role:"user",content:buildPrompt(count,null)}],creditsToUse:totalCost,target,languages,vibe,themes,style})})
      const data = await res.json()
      if(data.creditsRemaining!==undefined)setCredits(data.creditsRemaining)
      const text = (data.content||[]).map((b:{text?:string})=>b.text||"").join("")
      const parsed: NameResult[] = JSON.parse(text.replace(/```json|```/g,"").trim())
      setResults(parsed); setGeneratedNames(prev=>[...prev,...parsed.map(r=>r.name)])
    } catch { setError("Something went wrong — try again.") }
    finally { setLoading(false) }
  }

  const forgeOne = async (ref: NameResult) => {
    if(credits!==Infinity&&credits<1){showToast("Not enough credits");return}
    setForgingId(ref.name)
    try {
      const res  = await fetch("/api/generate/signet",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({max_tokens:400,messages:[{role:"user",content:buildPrompt(1,ref)}],creditsToUse:1,target,languages,vibe,themes,style})})
      const data = await res.json()
      if(data.creditsRemaining!==undefined)setCredits(data.creditsRemaining)
      const text = (data.content||[]).map((b:{text?:string})=>b.text||"").join("")
      const [newName]: NameResult[] = JSON.parse(text.replace(/```json|```/g,"").trim())
      setResults(p=>[{...newName,forged:true},...p]); setGeneratedNames(prev=>[...prev,newName.name])
      showToast(`Forged "${newName.name}"`)
    } catch { showToast("Forge failed — try again") }
    finally { setForgingId(null) }
  }

  const TierNudge = () => {
    const nudges: Record<string,{label:string;sub:string;desc:string}> = {
      wanderer:{label:"Wanderer",sub:"Free",desc:"100 credits/mo · max 3 languages · 5 saved names · no duplicate protection · last 12 generations"},
      keeper:  {label:"Keeper",  sub:"$4.99/mo",desc:"500 credits/mo · full tools unlocked · 20 saved names · last 100 generations"},
    }
    const n=nudges[tierKey]; if(!n)return null
    return (
      <div style={{background:C.purpleDim,border:`1px solid ${C.purpleB}`,borderRadius:8,padding:"12px 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:3}}>
          <div style={{color:C.purpleL,fontSize:10,letterSpacing:1,textTransform:"uppercase",...SS}}>{n.label}</div>
          <div style={{color:C.t3,fontSize:9,...SS}}>{n.sub}</div>
        </div>
        <div style={{color:C.t2,fontSize:10,lineHeight:1.65,marginBottom:10,...SS}}>{n.desc}</div>
        <button style={{width:"100%",padding:"8px",background:"linear-gradient(135deg,rgba(107,28,168,0.3),rgba(107,28,168,0.45))",border:`1px solid ${C.purpleB}`,borderRadius:6,color:C.purpleL,cursor:"pointer",fontSize:10,letterSpacing:2,textTransform:"uppercase",...GS}}>Upgrade →</button>
      </div>
    )
  }

  const Controls = () => (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
        <div style={{flex:"0 0 42%"}}><Label>Naming</Label><SearchableSelect value={target} onChange={setTarget} options={TARGETS} placeholder="Search what to name…" accent={C.purpleL}/></div>
        <div style={{flex:1}}><Label>Preset <span style={{fontWeight:400,opacity:0.65,fontSize:9,marginLeft:4}}>{presets.length}/{tier.maxPresets}</span></Label><PresetDropdown presets={presets} activeId={activePreset} onLoad={loadPreset} onSave={savePreset} onDelete={deletePreset} maxPresets={tier.maxPresets}/></div>
      </div>
      <div style={{height:1,background:C.t4}}/>
      {isCharTarget&&<div><Label>Cultural Archetype</Label><SearchableSelect value={archetype} onChange={setArchetype} options={ARCHETYPES} placeholder="Search archetype…" accent={C.purpleL}/></div>}
      {isItemTarget&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><Label>Item Type</Label><SearchableSelect value={itemType} onChange={setItemType} options={Object.entries(ITEM_TYPES).map(([group,items])=>({group,items}))} placeholder="Search item type…" accent={C.gold}/></div>
          <div>
            <Label>Rarity</Label>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {RARITIES.map(r=>{ const active=rarity===r.id; return(
                <div key={r.id} onClick={()=>setRarity(r.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 11px",borderRadius:7,cursor:"pointer",background:active?`rgba(${hexToRgb(r.color)},0.1)`:C.t4,border:`1px solid ${active?r.color+"55":"rgba(237,224,200,0.08)"}`,transition:"all 0.15s"}}>
                  <div style={{width:10,height:10,borderRadius:"50%",flexShrink:0,background:active?r.color:"transparent",border:`2px solid ${r.color}`,boxShadow:active?`0 0 6px ${r.glow}`:"none",transition:"all 0.15s"}}/>
                  <div style={{flex:1}}><div style={{color:active?r.color:C.t2,fontSize:11,fontWeight:active?600:400,...SS}}>{r.label}</div>{active&&<div style={{color:C.t3,fontSize:9,marginTop:2,lineHeight:1.5,...SS}}>{r.desc}</div>}</div>
                </div>
              )})}
            </div>
          </div>
          <div onClick={()=>setSentient(!sentient)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",borderRadius:7,cursor:"pointer",background:sentient?C.purpleDim:C.t4,border:`1px solid ${sentient?C.purpleB:"rgba(237,224,200,0.08)"}`,transition:"all 0.15s"}}>
            <div><div style={{color:sentient?C.purpleL:C.t2,fontSize:11,fontWeight:sentient?600:400,...SS}}>Sentient Item</div><div style={{color:C.t3,fontSize:9,marginTop:1,...SS}}>Has its own consciousness and will</div></div>
            <div style={{width:28,height:16,borderRadius:8,background:sentient?C.purple:"rgba(237,224,200,0.1)",border:`1px solid ${sentient?C.purpleB:"rgba(237,224,200,0.15)"}`,position:"relative",transition:"all 0.2s",flexShrink:0}}>
              <div style={{position:"absolute",top:2,left:sentient?12:2,width:10,height:10,borderRadius:"50%",background:sentient?C.purpleL:C.t3,transition:"all 0.2s"}}/>
            </div>
          </div>
        </div>
      )}
      <div><Label>Languages <span style={{fontWeight:400,opacity:0.6,letterSpacing:0.5,marginLeft:6,fontSize:9}}>𓂀 Ancient &nbsp;◈ Modern &nbsp;⚔ Hi-Fantasy &nbsp;☽ Dark &nbsp;✦ Sci-Fi &nbsp;⚙ Steam &nbsp;◆ Mythpunk &nbsp;✿ Solarpunk</span></Label><LanguagePicker selected={languages} onChange={setLanguages} maxLangs={tier.maxLangs}/></div>
      <div><Label>Aesthetic Vibe</Label><SearchableSelect value={vibe} onChange={setVibe} options={VIBES} placeholder="Search vibe…" accent={C.purpleL}/></div>
      <div><Label>Naming Style <span style={{fontWeight:400,opacity:0.6,letterSpacing:0.5,marginLeft:6,fontSize:9}}>phonological feel</span></Label><div style={{display:"flex",flexWrap:"wrap"}}>{STYLES.map(s=><Chip key={s} active={style===s} onClick={()=>setStyle(s)}>{s}</Chip>)}</div></div>
      <div><Label>Thematic Undertones</Label><MultiDropdown selected={themes} onChange={setThemes} options={THEMES} placeholder="Choose themes…"/></div>
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:7}}>
          <Label style={{marginBottom:0}}>Proposals: <span style={{color:C.gold,marginLeft:3}}>{count}</span></Label>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <ComplexityDots langCount={languages.length} themeCount={themes.length} proposals={count}/>
            <span style={{background:canAfford?C.goldDim:C.dangerDim,border:`1px solid ${canAfford?C.goldB:C.dangerB}`,borderRadius:4,padding:"2px 8px",color:canAfford?C.gold:C.danger,fontSize:10,...GS,transition:"all 0.2s"}}>{totalCost} credit{totalCost!==1?"s":""}</span>
          </div>
        </div>
        <input type="range" min={1} max={6} step={1} value={count} onChange={e=>setCount(Number(e.target.value))} style={{width:"100%",accentColor:C.purple,marginTop:2}}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>{[1,2,3,4,5,6].map(n=><span key={n} style={{color:n===count?C.gold:C.t3,fontSize:n===count?10:9,fontWeight:n===count?"bold":"normal",...SS,transition:"color 0.15s"}}>{n}</span>)}</div>
      </div>
      <button onClick={generate} disabled={loading||!canAfford} style={{width:"100%",padding:"13px",background:!canAfford?C.dangerDim:loading?C.purpleDim:`linear-gradient(135deg,${C.purpleDim},rgba(107,28,168,0.3))`,border:`1px solid ${!canAfford?C.dangerB:loading?"rgba(107,28,168,0.2)":C.purpleB}`,borderRadius:9,color:!canAfford?C.danger:loading?"rgba(192,144,240,0.35)":C.purpleL,cursor:loading||!canAfford?"not-allowed":"pointer",fontSize:12,letterSpacing:3,textTransform:"uppercase",...GS,transition:"all 0.2s"}}>
        {loading?"Consulting the tongues…":!canAfford?"Not enough credits":"⚗  Forge Names"}
      </button>
      {error&&<div style={{color:C.danger,fontSize:11,textAlign:"center",...SS}}>{error}</div>}
      <div style={{background:C.goldDim,border:`1px solid ${C.goldB}`,borderRadius:9,padding:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <Label style={{marginBottom:0}}>★ Saved Names</Label>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {tier.maxSaves!==Infinity&&<span style={{fontSize:9,color:!canSave?C.danger:C.t3,...SS,background:!canSave?C.dangerDim:"transparent",border:`1px solid ${!canSave?C.dangerB:"transparent"}`,borderRadius:4,padding:!canSave?"2px 6px":"0"}}>{saved.length}/{tier.maxSaves}</span>}
            {saved.length>0&&<button onClick={exportSaved} style={{background:"transparent",border:`1px solid ${C.goldB}`,borderRadius:5,padding:"3px 9px",color:C.gold,cursor:"pointer",fontSize:9,letterSpacing:1,...SS}}>⎘ Export</button>}
          </div>
        </div>
        {!canSave&&<div style={{fontSize:9,color:C.danger,marginBottom:8,...SS}}>Limit reached. <span style={{color:C.gold,cursor:"pointer",textDecoration:"underline"}}>Upgrade →</span></div>}
        {saved.length===0?<div style={{color:C.t3,fontSize:11,...GS,fontStyle:"italic",opacity:0.6}}>No saved names yet</div>:(
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {saved.map((s,i)=>(
              <div key={i} style={{background:"rgba(212,174,88,0.1)",border:`1px solid ${C.goldB}`,borderRadius:5,padding:"3px 9px",display:"flex",alignItems:"center",gap:5}}>
                <span style={{color:C.t1,fontSize:12,fontStyle:"italic",...GS}}>{s.name}</span>
                <button onClick={()=>toggleSave(s)} style={{background:"transparent",border:"none",cursor:"pointer",color:C.t3,fontSize:13,padding:0,lineHeight:1}}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <TierNudge/>
    </div>
  )

  const ResultsPanel = () => (
    <div>
      {loading&&<div style={{textAlign:"center",padding:"70px 0",color:C.t3,fontSize:12,letterSpacing:2,...SS}}><div style={{fontSize:36,marginBottom:14,display:"inline-block",animation:"spin 3s linear infinite"}}>⚗</div><div>Consulting the ancient tongues…</div></div>}
      {!loading&&results.length===0&&!history.length&&<div style={{textAlign:"center",padding:"80px 24px",color:"rgba(200,185,154,0.15)",fontSize:13,...GS,fontStyle:"italic",border:"1px dashed rgba(237,224,200,0.06)",borderRadius:12}}><div style={{fontSize:32,marginBottom:10}}>𓂀</div>Configure your filters and forge names</div>}
      {!loading&&results.length>0&&(
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <div style={{color:C.t3,fontSize:9,letterSpacing:2,textTransform:"uppercase",...SS}}>{results.length} proposal{results.length!==1?"s":""} — {target}{forgingId&&<span style={{color:C.gold,marginLeft:8}}>↻ forging…</span>}</div>
              {tier.dedup&&generatedNames.length>0&&<span style={{background:"rgba(109,184,138,0.1)",border:"1px solid rgba(109,184,138,0.28)",borderRadius:4,padding:"2px 8px",fontSize:9,color:C.success,letterSpacing:0.5,...SS}}>⊘ {generatedNames.length} excluded</span>}
            </div>
            <button onClick={generate} disabled={!canAfford||loading} style={{background:"transparent",border:`1px solid rgba(237,224,200,0.1)`,borderRadius:5,padding:"4px 12px",color:canAfford?C.t3:"rgba(237,224,200,0.1)",cursor:canAfford?"pointer":"not-allowed",fontSize:9,letterSpacing:1,textTransform:"uppercase",...GS}}>↺ Regenerate ({totalCost}cr)</button>
          </div>
          {results.map((r,i)=><ResultCard key={`${r.name}-${i}`} r={r} saved={!!saved.find(s=>s.name===r.name)} canSave={canSave} onSave={toggleSave} onCopy={name=>showToast(`"${name}" copied`)} onForgeOne={forgeOne}/>)}
        </>
      )}
      {history.length>0&&(
        <div style={{marginTop:24}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><div style={{flex:1,height:1,background:C.t4}}/><span style={{color:C.t3,fontSize:9,letterSpacing:2,textTransform:"uppercase",...SS}}>Previous Generations</span><div style={{flex:1,height:1,background:C.t4}}/></div>
          {history.map(b=><HistoryBatch key={b.id} batch={b} onToggle={()=>toggleHistory(b.id)}/>)}
        </div>
      )}
    </div>
  )

  if(profileLoading) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",...GS}}>
      <div style={{textAlign:"center",color:C.t3}}>
        <div style={{fontSize:36,marginBottom:14,display:"inline-block",animation:"spin 3s linear infinite"}}>⚗</div>
        <div style={{fontSize:11,letterSpacing:2,...SS}}>Loading your atelier…</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{minHeight:"100vh",background:C.bg,...GS,color:C.t2}}>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",backgroundImage:`radial-gradient(ellipse at 10% 50%,rgba(107,28,168,0.07) 0%,transparent 55%),radial-gradient(ellipse at 90% 20%,rgba(107,28,168,0.04) 0%,transparent 50%)`}}/>
      <div style={{background:C.bg2,borderBottom:`1px solid ${C.border}`,padding:`12px ${mobile?"16px":"28px"}`,display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:10}}>
        <img src={`data:image/png;base64,${LOGO}`} alt="" style={{width:36,height:36,objectFit:"contain",flexShrink:0}}/>
        <div>
          <div style={{color:C.t1,fontSize:mobile?13:15,letterSpacing:0.5,fontWeight:600}}>Braosa&apos;s Atelier</div>
          <div style={{color:C.t3,fontSize:8,letterSpacing:2.5,textTransform:"uppercase",fontWeight:600,...SS}}>The Signet</div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:16}}>
          <CreditPill remaining={credits} total={tier.credits} cost={totalCost}/>
          {!mobile&&<div style={{background:C.purpleDim,border:`1px solid ${C.purpleB}`,borderRadius:6,padding:"5px 14px",color:C.purpleL,fontSize:11,cursor:"pointer",...SS}}>{tier.label} ▸</div>}
        </div>
      </div>
      {!mobile&&(
        <div style={{display:"flex",minHeight:"calc(100vh - 61px)"}}>
          <div style={{width:310,flexShrink:0,background:C.bg2,borderRight:`1px solid ${C.border}`,padding:"24px 20px",overflowY:"auto"}}><Controls/></div>
          <div style={{flex:1,padding:"28px 30px",overflowY:"auto"}}><ResultsPanel/></div>
        </div>
      )}
      {mobile&&(
        <div style={{padding:16}}>
          <button onClick={()=>setFiltersOpen(!filtersOpen)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:C.purpleDim,border:`1px solid ${C.purpleB}`,borderRadius:8,padding:"10px 16px",color:C.purpleL,cursor:"pointer",fontSize:11,letterSpacing:2,textTransform:"uppercase",...GS,marginBottom:12}}>
            <span>⚗ Filters &amp; Settings</span>
            <span style={{transform:filtersOpen?"rotate(180deg)":"none",transition:"transform 0.2s",fontSize:9}}>▼</span>
          </button>
          {filtersOpen&&<div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:10,padding:16,marginBottom:16}}><Controls/></div>}
          <ResultsPanel/>
        </div>
      )}
      <Toast message={toast}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:${C.purpleB};border-radius:2px;} input[type=range]{cursor:pointer;}`}</style>
    </div>
  )
}

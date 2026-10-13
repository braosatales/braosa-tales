-- ============================================================================
-- The 8 Adventurers — Lore seed: Phandelver campaign
-- ============================================================================
-- Target: the8_lore_entries (+ the8_lore_entry_factions / _locations)
-- Requires: the8adventurers_v2.sql, _v3_gmnotes.sql, _v4.sql already applied.
--
-- RULES APPLIED (as requested):
--   * every row is created with is_secret = true  -> GM-only until you flip it
--   * description = player-safe text (what they may read once made public)
--   * gm_notes    = secrets, twists, stat/tactic hints -> stripped from the
--                   API response for non-admins
--   * portrait_url left NULL -> fill in yourself from the image uploader
--
-- IDEMPOTENT: re-running this file will not duplicate rows. It inserts only
-- titles that do not already exist, and junction links use ON CONFLICT DO
-- NOTHING. Safe to run again after you add more entries by hand.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 0. Safety net — v3 already added gm_notes to quests, and the quests API
--    already strips it for non-admins. This is a no-op on an up-to-date DB.
-- ---------------------------------------------------------------------------
ALTER TABLE the8_quests ADD COLUMN IF NOT EXISTS gm_notes text;

-- ---------------------------------------------------------------------------
-- 1. HISTORY
-- ---------------------------------------------------------------------------
WITH seed(category, title, description, gm_notes) AS (VALUES
  ($c$history$c$, $t$The Phandelver's Pact$t$,
   $d$Five centuries ago, gnomes, dwarves and human spellcasters signed a pact to share the wealth of a great cavern beneath the Sword Mountains. Together they raised a forge of magic there and built the settlement of Phandalin above it. The pact is remembered now only as a name in old records and a rumour among prospectors.$d$,
   $g$This is the frame the whole campaign hangs on. Gundren Rockseeker believes he has found the cavern again; he is right. Anyone who digs into the Pact should eventually learn that the forge was not merely a mine but a place where magic items were made.$g$),

  ($c$history$c$, $t$The Forge of Spells$t$,
   $d$The heart of the old pact was a forge said to be fed by earth magic, where enchanted weapons and wondrous items could be made far faster than by ordinary craft. Whether it survived the fall of the mine is unknown.$d$,
   $g$It survived, dormant, in Wave Echo Cave. This is what Nezznar actually wants — not gold. If the party restores it, it becomes a long-term campaign engine: they can commission items, and every faction in the region will want a share.$g$),

  ($c$history$c$, $t$The Fall of the Mine$t$,
   $d$An army of orcs, driven by something stronger than themselves, fell on the region and shattered the alliance. The battle that ended it was fought underground, and the magic loosed there collapsed the cavern and hid its entrance. Phandalin was burned and left empty for generations.$d$,
   $g$The spellcasters' final working is why the deep sections are still haunted — the wraith, the flameskull and the walking dead down there are casualties of that battle who never got out.$g$),

  ($c$history$c$, $t$The Rebuilding of Phandalin$t$,
   $d$A generation ago settlers from Neverwinter came back to the ruins, drawn by farmland and by the old stories of the mine. They rebuilt on the foundations they found. The town has no garrison, no militia and no walls — only a townmaster.$d$,
   $g$The absence of any real authority is the whole reason the Redbrands took the town so easily. Restoring some form of law is the natural reward arc for a party that clears them out.$g$),

  ($c$history$c$, $t$The Destruction of Thundertree$t$,
   $d$Thirty years ago a mountain to the north erupted, and a wave of ash buried the logging village of Thundertree. The survivors never returned. Travellers say the ruins are still not empty.$d$,
   $g$The eruption also woke something in the soil — the blights and the ash-choked dead. More recently a young green dragon moved into the ruined tower, and a cell of dragon cultists followed it there hoping to serve it.$g$),

  ($c$history$c$, $t$The Silence of Conyberry$t$,
   $d$Conyberry was a small settlement on the eastern road until a raid emptied it. Nothing has been rebuilt. The site is avoided, and not only because of the ruins.$d$,
   $g$The banshee Agatha's grove lies east of the ruins. She predates the raid and is the reason nobody resettled.$g$),

  ($c$history$c$, $t$The Coming of the Redbrands$t$,
   $d$Within the last year a band of armed men in red cloaks arrived in Phandalin, took over the old manor on the hill, and began collecting what they call protection. Two people who objected publicly are dead. Nobody says the name loudly in the street.$d$,
   $g$They are not a local phenomenon. Their leader answers to the Black Spider, who put them in place to keep outsiders away from the mine while he searched for it.$g$)
)
INSERT INTO the8_lore_entries (category, title, description, gm_notes, is_secret)
SELECT s.category, s.title, s.description, s.gm_notes, true
FROM seed s
WHERE NOT EXISTS (SELECT 1 FROM the8_lore_entries e WHERE e.title = s.title);


-- ---------------------------------------------------------------------------
-- 2. LOCATIONS
-- ---------------------------------------------------------------------------
WITH seed(category, title, description, gm_notes) AS (VALUES
  ($c$locations$c$, $t$Phandalin$t$,
   $d$A frontier town of perhaps fifty buildings on the foundations of a much older settlement. Farmers, prospectors and a handful of shopkeepers. No walls, no watch, and a townmaster who prefers not to be asked difficult questions.$d$,
   $g$Home base. The town's mood tracks the Redbrand situation directly — after the hideout is cleared, prices soften, people talk freely, and Halia Thornton starts angling to be the one in charge.$g$),

  ($c$locations$c$, $t$Stonehill Inn$t$,
   $d$A large roadhouse in the middle of Phandalin, newer than the buildings around it. The common room is the closest thing the town has to a meeting hall.$d$,
   $g$The default rumour hub. Toblen is friendly and talks; his wife Trilena is the one who actually knows what happened to the Dendrar family.$g$),

  ($c$locations$c$, $t$Barthen's Provisions$t$,
   $d$The town's largest trading post — rope, picks, lamp oil, rations, everything a prospector needs, and nothing a soldier does.$d$,
   $g$Delivery destination for the wagon at the start. Barthen pays the escort fee here and is a soft, honest source of information about the Rockseekers.$g$),

  ($c$locations$c$, $t$Lionshield Coster$t$,
   $d$The local outpost of a trading company based far to the south. Shields with a blue lion mark their goods. The shelves are thinner than they should be.$d$,
   $g$Their last two shipments were taken on the Triboar Trail by the Cragmaws. Returning the stolen crates buys real goodwill and a discount from Linene.$g$),

  ($c$locations$c$, $t$The Sleeping Giant$t$,
   $d$A grim, half-empty taphouse at the east end of town. Locals do not drink here any more.$d$,
   $g$Redbrand hangout. A good place to stage a confrontation the party chooses rather than one that ambushes them. Losing a brawl here gets them dumped outside town rather than killed.$g$),

  ($c$locations$c$, $t$The Miner's Exchange$t$,
   $d$Where prospectors register claims and sell what they pull out of the hills. In the absence of any guild or authority, it has quietly become the closest thing the town has to a government office.$d$,
   $g$Halia Thornton runs it. Every piece of information that passes through here also passes to the Zhentarim.$g$),

  ($c$locations$c$, $t$Shrine of Luck$t$,
   $d$A simple open-air shrine of stacked stone, tended by an elf priestess. The only place of worship in Phandalin.$d$,
   $g$Sister Garaele's post, and her cover. She will ask the party for help with Agatha — that is the Harper hook.$g$),

  ($c$locations$c$, $t$Townmaster's Hall$t$,
   $d$A small hall with a notice board outside. Bounties and proclamations are posted here, when anyone bothers to post them.$d$,
   $g$Harbin Wester's office. He will deny the Redbrands are a problem for as long as he possibly can, but he will post the orc bounty at Wyvern Tor because that danger is safely far away.$g$),

  ($c$locations$c$, $t$Alderleaf Farm$t$,
   $d$A tidy halfling farmstead on the southern edge of town, with a good vegetable plot and an open door.$d$,
   $g$Qelline's farm. Her son Carp found the secret tunnel into the Redbrand hideout and will lead the party there if they earn his trust.$g$),

  ($c$locations$c$, $t$Edermath Orchard$t$,
   $d$An apple orchard north-east of town, kept by a half-elf who is clearly older than he looks and clearly used to be something other than a farmer.$d$,
   $g$Daran Edermath's home. He is the Order of the Gauntlet contact and the one who points the party at Old Owl Well.$g$),

  ($c$locations$c$, $t$Tresendar Manor$t$,
   $d$The burned-out shell of a noble house on a rise at the eastern edge of Phandalin. The upper floors are ruins. The cellars are not.$d$,
   $g$The Redbrand hideout. Three ways in: the front stair, the tunnel Carp knows, and the ruined tower. Contains the nothic's crevasse, the slave pens with the Dendrar family, the barracks, and Glasstaff's quarters — where his correspondence from the Black Spider is.$g$),

  ($c$locations$c$, $t$The Triboar Trail$t$,
   $d$The road running east from the High Road toward Triboar, passing north of Phandalin. Lightly travelled and, lately, not safe.$d$,
   $g$Where the opening ambush happens and where the Cragmaws hit the Lionshield caravans. Goblin tracks lead south from the ambush site to the hideout.$g$),

  ($c$locations$c$, $t$Cragmaw Hideout$t$,
   $d$A cave mouth screened by briars beside a stream off the Triboar Trail, used as a forward camp by goblin raiders.$d$,
   $g$Klarg commands here with wolves and goblins. The dammed stream can be broken to flood the lower passage — works for the party or against them. Sildar Hallwinter is held in the back; Yeemik will offer to trade him for Klarg's death.$g$),

  ($c$locations$c$, $t$Cragmaw Castle$t$,
   $d$A ruined elven castle deep in Neverwinter Wood, seven towers of which most have fallen. The goblin tribe that took it named itself after it.$d$,
   $g$King Grol's seat, and where Gundren is held with the map. Grol's advisor is not what it appears. The castle is defensible — a frontal assault is punishing, so reward scouting, the back entrance and Cragmaw prisoners who will talk.$g$),

  ($c$locations$c$, $t$Thundertree$t$,
   $d$A dead village north of Neverwinter Wood, buried under old ash. Roofs have fallen in and the gardens have gone feral in ways that are not natural.$d$,
   $g$Blights in the overgrown plots, ash-choked undead in the houses, cultists in one cottage, and a young green dragon lairing in the ruined tower. The party is expected to talk to Reidoth rather than fight everything.$g$),

  ($c$locations$c$, $t$Old Owl Well$t$,
   $d$A crumbling watchtower on a hill east of Phandalin, left from an empire that fell long before this one. Lately there have been lights and tents there at night.$d$,
   $g$Hamun Kost, a Red Wizard, is excavating with undead labour. He is dangerous but negotiable — he wants to know who else is digging in this region, and will trade information about the Black Spider for it.$g$),

  ($c$locations$c$, $t$Wyvern Tor$t$,
   $d$A rocky height overlooking the Triboar Trail to the east. Travellers have been attacked in its shadow.$d$,
   $g$An orc raiding band camped in a cave, with a brute among them that outclasses the rest. Straightforward combat encounter; the townmaster pays a bounty for clearing it.$g$),

  ($c$locations$c$, $t$Conyberry$t$,
   $d$An abandoned settlement on the eastern road, burned and never rebuilt. Only foundations and chimney stacks are left.$d$,
   $g$Waypoint to Agatha's lair, which lies east of the ruins in the woods.$g$),

  ($c$locations$c$, $t$Agatha's Lair$t$,
   $d$A grove east of Conyberry where the trees grow close and nothing sings. Something old is said to hold court there.$d$,
   $g$The banshee will answer one question truthfully if offered a gift she values — jewellery, something beautiful, something that was hers. Garaele wants the party to ask about a lost spellbook. Attacking her is a bad idea at this level and should be signposted as such.$g$),

  ($c$locations$c$, $t$Wave Echo Cave$t$,
   $d$The lost mine of the Phandelver's Pact, sealed for five hundred years. Named for the sound of distant surf that carries through its deepest tunnels.$d$,
   $g$The finale. Undead miners from the old battle, a flameskull guarding the central passages, a wraith in the sealed chambers, Nundro alive in the Black Spider's camp, and the Forge of Spells still intact. Nezznar is here in force with bugbears and spiders.$g$),

  ($c$locations$c$, $t$Neverwinter Wood$t$,
   $d$Old forest north and east of the city, thick enough to swallow roads. Elven ruins stand in it, and other things have moved into them.$d$,
   $g$Contains Cragmaw Castle and borders Thundertree. Reidoth knows it better than anyone and is the party's map if they treat him decently.$g$),

  ($c$locations$c$, $t$Neverwinter$t$,
   $d$The great city of the north-west coast, rebuilding after decades of catastrophe. Where the party's contracts, supplies and rumours come from.$d$,
   $g$Off-screen by default. Useful as the source of the initial job and as somewhere to spend the treasure later.$g$)
)
INSERT INTO the8_lore_entries (category, title, description, gm_notes, is_secret)
SELECT s.category, s.title, s.description, s.gm_notes, true
FROM seed s
WHERE NOT EXISTS (SELECT 1 FROM the8_lore_entries e WHERE e.title = s.title);


-- ---------------------------------------------------------------------------
-- 3. FACTIONS
-- ---------------------------------------------------------------------------
WITH seed(category, title, description, gm_notes) AS (VALUES
  ($c$factions$c$, $t$The Cragmaw Tribe$t$,
   $d$A goblin tribe that has taken the name of the ruined castle it occupies. Organised beyond the usual for goblins, and lately bold enough to ambush armed caravans on the Triboar Trail.$d$,
   $g$They are working for hire, not for themselves. Their orders come through the Black Spider: take Gundren alive and bring him and his map to the castle.$g$),

  ($c$factions$c$, $t$The Redbrands$t$,
   $d$Ruffians in red cloaks who have made themselves the de facto power in Phandalin. They extort shopkeepers, bully travellers, and have killed at least once without consequence.$d$,
   $g$A front. Their leader is a wizard placed there by the Black Spider to keep outsiders away from the mine. Once the hideout falls, the survivors scatter and are not a campaign-level threat.$g$),

  ($c$factions$c$, $t$The Lords' Alliance$t$,
   $d$A coalition of the cities and towns of the north, holding the roads open and the frontier settlements alive through coordinated force and money.$d$,
   $g$Sildar is the local agent. Their interest in Phandalin is stability and trade; they will back a party that restores order and will absolutely want a say in who controls the mine.$g$),

  ($c$factions$c$, $t$The Harpers$t$,
   $d$A scattered, secretive network that works against tyranny in small ways and rarely announces itself. Members are more often librarians and priests than warriors.$d$,
   $g$Sister Garaele is the local Harper. The Agatha errand is a Harper operation — recovering lost knowledge before someone worse does.$g$),

  ($c$factions$c$, $t$The Zhentarim$t$,
   $d$A far-reaching mercantile network with a hard reputation. It provides goods, escorts and opportunities, and expects loyalty in return.$d$,
   $g$Halia Thornton is their agent. She wants Glasstaff delivered to her alive, and longer term she wants to run Phandalin. Useful as the morally awkward ally.$g$),

  ($c$factions$c$, $t$The Order of the Gauntlet$t$,
   $d$A society of the devout and the militant who hunt evil directly rather than waiting for it to arrive. Small in number, uncompromising in method.$d$,
   $g$Daran Edermath is a retired member. Good faction for a paladin or cleric at the table; their price for support is that the party act, not negotiate.$g$),

  ($c$factions$c$, $t$The Emerald Enclave$t$,
   $d$Those who keep the wild places in balance and hold back what spills out of them. They live apart and are rarely found in towns.$d$,
   $g$Reidoth is the local member. His concern is the dragon and the blights, not the mine — he will help with Thundertree and refuse to be drawn further.$g$),

  ($c$factions$c$, $t$The Cult of the Dragon$t$,
   $d$A cult that venerates dragons and works to see them exalted and served. Its cells are small, secretive and fanatical.$d$,
   $g$The Thundertree cell is a handful of low-grade fanatics trying to attach themselves to the green dragon in the tower. They can be talked around, bluffed, or wiped out — they are not a campaign thread unless you want them to be.$g$),

  ($c$factions$c$, $t$The Rockseeker Brothers$t$,
   $d$Three dwarf brothers of a family with long memories, who have spent years and most of their money chasing a claim everyone else considers a legend.$d$,
   $g$Gundren, Tharden and Nundro. One is dead before the party ever meets him, one is held at Cragmaw Castle, one is a prisoner in Wave Echo Cave. Rescuing them in that order is the campaign's spine.$g$)
)
INSERT INTO the8_lore_entries (category, title, description, gm_notes, is_secret)
SELECT s.category, s.title, s.description, s.gm_notes, true
FROM seed s
WHERE NOT EXISTS (SELECT 1 FROM the8_lore_entries e WHERE e.title = s.title);


-- ---------------------------------------------------------------------------
-- 4. FRIENDS (allies, neutrals, and one or two who only look like allies)
-- ---------------------------------------------------------------------------
WITH seed(category, title, description, gm_notes) AS (VALUES
  ($c$friends$c$, $t$Gundren Rockseeker$t$,
   $d$A dwarf prospector, talkative and relentlessly optimistic, who hired the party to escort a wagon of supplies to Phandalin while he rode ahead with a warrior escort. He did not arrive.$d$,
   $g$Taken alive on the Triboar Trail and moved to Cragmaw Castle. He has the map to Wave Echo Cave and King Grol is trying to get it out of him. He survives unless the party takes far too long — and he is the reward for finding the castle, so keep him alive and keep him grateful.$g$),

  ($c$friends$c$, $t$Sildar Hallwinter$t$,
   $d$A human warrior past his best years, courteous and steady, who rode with Gundren as protection. He is more than a hired sword and does not pretend otherwise for long.$d$,
   $g$Agent of the Lords' Alliance. Found imprisoned at Cragmaw Hideout. He wants to find Iarno Albrek, who was sent to Phandalin ahead of him and vanished — he has no idea Iarno is Glasstaff. He will pay for Iarno's recovery and will step into the townmaster role if the town is freed.$g$),

  ($c$friends$c$, $t$Tharden Rockseeker$t$,
   $d$The eldest of the three brothers. He went ahead to the mine site with Nundro when the claim was located.$d$,
   $g$Already dead when the party reaches Wave Echo Cave — killed by the Black Spider's people. His body is in the cave. This is the moment the stakes stop being theoretical.$g$),

  ($c$friends$c$, $t$Nundro Rockseeker$t$,
   $d$The youngest brother, quieter than Gundren and better with a pick than with people.$d$,
   $g$Held prisoner in Nezznar's camp inside Wave Echo Cave. Alive. Rescuing him is the difference between a win and a hollow one — and he is the one who can actually operate the mine afterwards.$g$),

  ($c$friends$c$, $t$Elmar Barthen$t$,
   $d$A lean, kind-faced man in his fifties who runs the town's trading post and pays his debts on the day they are due.$d$,
   $g$Pays the escort fee and hires out of sympathy as much as need. Knows the Rockseekers well and is genuinely worried about them. Harmless, useful, and a good barometer of how the town is feeling.$g$),

  ($c$friends$c$, $t$Toblen Stonehill$t$,
   $d$The innkeeper of the Stonehill, a transplanted miner who found he was better at hospitality than at digging. Friendly, anxious, and entirely without guile.$d$,
   $g$The rumour dispenser. He will not say the word Redbrand above a whisper. His son Pip plays with Carp Alderleaf.$g$),

  ($c$friends$c$, $t$Trilena Stonehill$t$,
   $d$Toblen's wife, who runs the inn's kitchen and misses nothing that happens in the common room.$d$,
   $g$She is the one who tells the party what the Redbrands did to the Dendrar family — she was a friend of Mirna's. Use her when the players need the emotional weight rather than the facts.$g$),

  ($c$friends$c$, $t$Linene Graywind$t$,
   $d$A sharp, practical woman who runs the Lionshield Coster and has no patience for stories, only for goods that arrive on time.$d$,
   $g$Two shipments stolen by the Cragmaws. Return the crates and she becomes an ally with a discount; she also warns the party off the Redbrands rather than helping against them, because her company's property is her first concern.$g$),

  ($c$friends$c$, $t$Daran Edermath$t$,
   $d$A half-elf orchard keeper with a soldier's bearing and a sword he has clearly not forgotten how to use. He does not volunteer his history.$d$,
   $g$Retired Order of the Gauntlet. He points the party at Old Owl Well and will vouch for them to the Order. Will not adventure with them — he has earned his orchard — but will give straight advice every time.$g$),

  ($c$friends$c$, $t$Sister Garaele$t$,
   $d$A young elf who tends the Shrine of Luck. Zealous, well-travelled for her age, and rather better informed about distant events than a village priestess ought to be.$d$,
   $g$Harper agent. She has already tried to approach Agatha once and was driven off injured. Her request — ask Agatha about the location of a lost spellbook — is the Harper entry point and pays with a potion and faction goodwill.$g$),

  ($c$friends$c$, $t$Qelline Alderleaf$t$,
   $d$A halfling farmer of formidable common sense who feeds anyone who turns up and gives advice whether or not it was asked for.$d$,
   $g$She knows Reidoth the druid and can point the party to Thundertree. She will also mention, without quite meaning to, that her son has been going places he should not.$g$),

  ($c$friends$c$, $t$Carp Alderleaf$t$,
   $d$Qelline's son, small, fast, and entirely convinced he is not going to be caught.$d$,
   $g$He found the tunnel entrance to the Redbrand hideout in the woods near the manor. He will show the party if they treat him as a person rather than a source. Do not let him follow them in.$g$),

  ($c$friends$c$, $t$Reidoth the Druid$t$,
   $d$A weathered old druid who travels the wood and the ruins alone and considers most human business a waste of daylight.$d$,
   $g$Knows exactly where Cragmaw Castle is and exactly what is in the Thundertree tower. He will trade that knowledge for help with the blights or the cultists, and he will refuse point blank to help kill the dragon — his concern is the wood, not the party's quest.$g$),

  ($c$friends$c$, $t$Mirna Dendrar$t$,
   $d$A woman of Phandalin held with her two children in the cellars beneath Tresendar Manor. Her husband spoke against the Redbrands in the street.$d$,
   $g$Her husband Thel was killed for it and she and the children Nars and Nilsa were taken to be sold. Rescuing them is the moral centre of the Redbrand arc. She repays the party with the location of a family heirloom hidden in Thundertree.$g$),

  ($c$friends$c$, $t$Droop$t$,
   $d$A small, nervous goblin, notably less committed to the cause than his fellows.$d$,
   $g$Found in the Redbrand hideout. Surrenders readily and will serve whoever is clearly winning. Gives up the layout of the hideout, the nothic, and Glasstaff. Excellent comic relief and an easy source of exposition when the party has missed something.$g$),

  ($c$friends$c$, $t$Halia Thornton$t$,
   $d$The woman who runs the Miner's Exchange — poised, well-dressed for a frontier town, and interested in the party from the moment they walk in.$d$,
   $g$Zhentarim agent. She will ask the party to bring her Glasstaff alive, or failing that his correspondence. Her long game is to take over Phandalin herself, which puts her in direct competition with Sildar. She is an ally the players should feel slightly uneasy about.$g$),

  ($c$friends$c$, $t$Harbin Wester$t$,
   $d$The townmaster of Phandalin: fat, fussy, and visibly relieved whenever a problem turns out to be someone else's.$d$,
   $g$A coward, not a traitor. He denies the Redbrands are a problem because admitting it would require him to act. He will post the orc bounty at Wyvern Tor happily, because that is danger at a safe distance. Replaced by Sildar if the town is freed.$g$)
)
INSERT INTO the8_lore_entries (category, title, description, gm_notes, is_secret)
SELECT s.category, s.title, s.description, s.gm_notes, true
FROM seed s
WHERE NOT EXISTS (SELECT 1 FROM the8_lore_entries e WHERE e.title = s.title);


-- ---------------------------------------------------------------------------
-- 5. FOES
-- ---------------------------------------------------------------------------
WITH seed(category, title, description, gm_notes) AS (VALUES
  ($c$foes$c$, $t$Nezznar the Black Spider$t$,
   $d$A name that appears in the correspondence of everyone who has moved against Phandalin this year, and nowhere else. Those who use it do so carefully.$d$,
   $g$A drow. He is the one who hired the Cragmaws, installed Glasstaff, and had Tharden killed. He wants the Forge of Spells, not the gold. Encountered in Wave Echo Cave with bugbear bodyguards and giant spiders. He would much rather talk the party into a partnership than fight them — let him try; it makes the betrayal land harder.$g$),

  ($c$foes$c$, $t$Iarno Albrek, called Glasstaff$t$,
   $d$The masked leader of the Redbrands, who is never seen without his staff and never seen without his mask. His men are frightened of him in a way that ordinary thugs are not frightened of ordinary captains.$d$,
   $g$Iarno Albrek, the wizard the Lords' Alliance sent to establish order in Phandalin — he took the Black Spider's offer instead. Sildar does not know. His quarters hold letters from Nezznar that name the mine. He is a coward in a fight: he will try to flee through the tunnel or buy his life with information. Both are better outcomes than killing him.$g$),

  ($c$foes$c$, $t$Klarg$t$,
   $d$The bugbear who commands the goblins at the cave off the Triboar Trail. Large, loud, and fond of the sound of his own authority.$d$,
   $g$Keeps wolves and a share of the stolen Lionshield goods. Yeemik wants his job and will offer the party a deal to get it. Klarg himself knows only that his orders came from the Black Spider through King Grol.$g$),

  ($c$foes$c$, $t$Yeemik$t$,
   $d$A goblin with ambitions above his station and enough sense to know he cannot achieve them alone.$d$,
   $g$Second at Cragmaw Hideout. Holds Sildar and will offer to trade him for Klarg's death. He will double-cross the party if he thinks he can get away with it, and he will flee the moment he cannot. If spared, he is a recurring nuisance and a decent information source.$g$),

  ($c$foes$c$, $t$King Grol$t$,
   $d$The bugbear who styles himself king of the Cragmaw tribe from the ruins of an elven castle. Larger and considerably more capable than the goblins who serve him.$d$,
   $g$Holds Gundren and the map at Cragmaw Castle, and is under pressure from the Black Spider to deliver both. His advisor is a doppelganger sent to watch him. He fights with a wolf at his side and will use Gundren as a hostage if he is losing.$g$),

  ($c$foes$c$, $t$Grol's Advisor$t$,
   $d$A figure at King Grol's side in the ruined castle, keeping close to the throne and rarely speaking where others can hear.$d$,
   $g$A doppelganger placed by the Black Spider to make sure Grol delivers. It will shapechange and try to slip away or impersonate a party member rather than die. If it escapes, it is the best recurring antagonist in the whole module — let it get away if the dice allow.$g$),

  ($c$foes$c$, $t$Venomfang$t$,
   $d$A young green dragon lairing in the ruined tower at Thundertree. Recently arrived, and not yet certain whether this territory is worth keeping.$d$,
   $g$Far above the party's weight class when they first reach Thundertree. It is meant to be avoided, negotiated with, or driven off through cleverness — not fought head-on. It can be bribed with treasure or persuaded that better territory exists elsewhere.$g$),

  ($c$foes$c$, $t$The Nothic of Tresendar$t$,
   $d$Something lives in the flooded crevasse beneath the manor. The Redbrands feed it and do not go near it otherwise.$d$,
   $g$A nothic — curious rather than mindless. It will bargain: treasure or secrets in exchange for not attacking, and it knows a great deal about what goes on in the hideout. Its rotting gaze is genuinely dangerous to a low-level party, so reward the players who talk to it.$g$),

  ($c$foes$c$, $t$Hamun Kost$t$,
   $d$A shaven-headed human in red robes, camped with silent labourers among the ruins at Old Owl Well. He does not welcome visitors, but he does not attack them either.$d$,
   $g$A Red Wizard of Thay, raising undead to excavate the site. Negotiable: he will trade what he knows about the Black Spider for information about who else is digging in the region. Fighting him is possible but expensive and gains nothing the conversation would not.$g$),

  ($c$foes$c$, $t$Mormesk the Wraith$t$,
   $d$Something that was once a man still walks the sealed depths of Wave Echo Cave, guarding a hoard it can no longer spend.$d$,
   $g$A wraith, one of the casualties of the battle that closed the mine, bound to the treasure it died holding. It can be negotiated with briefly before it turns. Level-drain territory — telegraph the danger.$g$),

  ($c$foes$c$, $t$The Flameskull$t$,
   $d$A burning skull drifts the central passages of the old mine, and the fires that light them were not lit by any living hand.$d$,
   $g$Set as a guardian during the fall of the mine and never stood down. It reassembles unless its remains are treated with holy water or a dispel — a nasty surprise for a party that leaves and comes back. It will not pursue beyond its assigned area.$g$)
)
INSERT INTO the8_lore_entries (category, title, description, gm_notes, is_secret)
SELECT s.category, s.title, s.description, s.gm_notes, true
FROM seed s
WHERE NOT EXISTS (SELECT 1 FROM the8_lore_entries e WHERE e.title = s.title);


-- ---------------------------------------------------------------------------
-- 6. MONSTERS (bestiary entries, with preferred_habitat)
-- ---------------------------------------------------------------------------
WITH seed(category, title, description, gm_notes, preferred_habitat) AS (VALUES
  ($c$monsters$c$, $t$Goblin$t$,
   $d$Small, quick and vicious in numbers, cowardly alone. The most common raider on the roads north of Phandalin.$d$,
   $g$The campaign's baseline threat. They fight dirty, use terrain, and break when their leader falls. Captured goblins talk readily and are the cleanest way to hand out directions.$g$,
   $h$Caves, ruins, dense woodland$h$),

  ($c$monsters$c$, $t$Bugbear$t$,
   $d$A hulking cousin of the goblin, strong enough to command them and cruel enough to keep the position.$d$,
   $g$Hits far harder than anything else at low level, especially with surprise. Klarg, Grol and Nezznar's bodyguards are all bugbears — the recurring physical threat of the campaign.$g$,
   $h$Caves, ruins, forest camps$h$),

  ($c$monsters$c$, $t$Hobgoblin$t$,
   $d$Disciplined, armoured and organised, hobgoblins fight in formation where their lesser kin swarm.$d$,
   $g$Found among the Cragmaws as elite guards. Use them when you want the players to feel the tribe is more than a rabble.$g$,
   $h$Fortified ruins, military camps$h$),

  ($c$monsters$c$, $t$Wolf and Dire Wolf$t$,
   $d$Goblin raiders keep wolves, and in the deeper wood there are wolves that no one keeps.$d$,
   $g$Pack tactics make these far deadlier than their numbers suggest. Chained wolves can be released or freed — a party that thinks of that deserves the advantage.$g$,
   $h$Forests, goblin camps$h$),

  ($c$monsters$c$, $t$Owlbear$t$,
   $d$A nightmare of feathers and fur with a beak that shears bone. Territorial and entirely without fear.$d$,
   $g$Lairs in a ruined tower at Cragmaw Castle, reachable from outside. A party that scouts can lure it into the goblins.$g$,
   $h$Forest ruins, caves$h$),

  ($c$monsters$c$, $t$Nothic$t$,
   $d$A twisted thing with one great eye, said to have been a mage who reached for knowledge that reached back.$d$,
   $g$Curious and talkative. Its gaze rots flesh and its insight tears secrets out of a character's past — use that to expose a player backstory at the table.$g$,
   $h$Cellars, crevasses, buried ruins$h$),

  ($c$monsters$c$, $t$Ochre Jelly$t$,
   $d$A creeping mass of acid that flows through cracks and under doors and does not stop.$d$,
   $g$Splits when struck with slashing weapons. Classic trap for a party that leads with the greatsword. Found in the mine.$g$,
   $h$Mines, sewers, damp ruins$h$),

  ($c$monsters$c$, $t$Stirge$t$,
   $d$A fat, winged bloodsucker the size of a cat. They come in clouds and they do not let go.$d$,
   $g$Attaches and drains. Individually trivial, genuinely dangerous to an unconscious or low-hit-point character.$g$,
   $h$Caves, ruins, dark rafters$h$),

  ($c$monsters$c$, $t$Giant Spider$t$,
   $d$Web-spinners the size of a large dog, found where the dark has been undisturbed for a long time.$d$,
   $g$Nezznar keeps them. Webbed terrain in the mine should be read as a warning sign, not decoration.$g$,
   $h$Mines, deep caves, abandoned structures$h$),

  ($c$monsters$c$, $t$Twig Blight$t$,
   $d$Bundles of animate thorn and branch that stand still until something warm comes close.$d$,
   $g$Infest the overgrown gardens of Thundertree. Vulnerable to fire, which in a ruin full of dry ash is a decision with consequences.$g$,
   $h$Corrupted woodland, overgrown ruins$h$),

  ($c$monsters$c$, $t$Ash Zombie$t$,
   $d$The dead of Thundertree, still moving under the ash that buried them. They exhale a choking grey cloud.$d$,
   $g$Slow, relentless, and they blind and choke anyone who fights them in close quarters. Best handled at range or avoided entirely.$g$,
   $h$Ash-buried ruins$h$),

  ($c$monsters$c$, $t$Skeletons and Zombies$t$,
   $d$The unburied dead of old battles, raised or simply never laid to rest.$d$,
   $g$Kost's labourers at Old Owl Well and the fallen miners in Wave Echo Cave. Their presence in the mine tells the story of the last battle without a word of narration.$g$,
   $h$Battlefields, tombs, mines$h$),

  ($c$monsters$c$, $t$Ghoul$t$,
   $d$Corpse-eaters, fast and frenzied, whose touch locks the limbs.$d$,
   $g$Paralysis at low level can end a character. In the mine, they are the ones who never got out.$g$,
   $h$Tombs, mines, graveyards$h$),

  ($c$monsters$c$, $t$Specter and Wraith$t$,
   $d$Malice that outlived its body. They pass through stone and their touch takes something that does not grow back.$d$,
   $g$Wave Echo Cave's deep chambers. Life drain is the scariest mechanic the party will meet in this campaign — signpost it before it lands.$g$,
   $h$Sealed ruins, deep mines$h$),

  ($c$monsters$c$, $t$Flameskull$t$,
   $d$A floating skull wreathed in green fire, left behind to guard a place long after those who set it there have died.$d$,
   $g$Reassembles unless properly destroyed. Casts as it retreats. Pure attrition against a party that thinks the fight is over.$g$,
   $h$Sealed vaults, guarded passages$h$),

  ($c$monsters$c$, $t$Doppelganger$t$,
   $d$A shapeshifter that wears other people. It does not need to fight if it can simply be believed.$d$,
   $g$Best used for paranoia, not damage. If one escapes, everyone at the table will suspect everyone else for the rest of the campaign — which is the point.$g$,
   $h$Anywhere with people to imitate$h$),

  ($c$monsters$c$, $t$Grick$t$,
   $d$A limbless coil of grey muscle ringed with barbed tentacles. It matches the stone it clings to until it moves.$d$,
   $g$Ambush predator in the mine tunnels. Drops from ceilings; resistant to ordinary weapons.$g$,
   $h$Tunnels, cavern ceilings$h$),

  ($c$monsters$c$, $t$Banshee$t$,
   $d$The remnant of a beautiful thing that ended badly, bound to the place it died and unable to bear the living.$d$,
   $g$Agatha. Her wail can kill outright at this level. She is a negotiation, not an encounter — make that unmistakable before the party rolls initiative.$g$,
   $h$Haunted groves, ruined estates$h$),

  ($c$monsters$c$, $t$Young Green Dragon$t$,
   $d$Cunning beyond its years, fond of riddles and manipulation, and capable of breathing a cloud of corrosive poison.$d$,
   $g$Venomfang. Prefers to toy with intruders and turn them to its purposes. A party that tries to fight it at this level will lose; a party that lies well may walk out with a favour.$g$,
   $h$Forests, ruined towers$h$),

  ($c$monsters$c$, $t$Orc$t$,
   $d$Raiders out of the mountains, strong and aggressive, who take what the season does not give them.$d$,
   $g$The Wyvern Tor band, led by something bigger than the rest. Clean, honest combat encounter — useful as a palate cleanser between intrigue arcs.$g$,
   $h$Mountains, hill caves$h$),

  ($c$monsters$c$, $t$Ogre$t$,
   $d$A brute twice the height of a man, kept as muscle by anything clever enough to feed it.$d$,
   $g$Runs with the orcs at Wyvern Tor. One good hit can drop a low-level character — make the players respect it.$g$,
   $h$Hill caves, raider camps$h$)
)
INSERT INTO the8_lore_entries (category, title, description, gm_notes, preferred_habitat, is_secret)
SELECT s.category, s.title, s.description, s.gm_notes, s.preferred_habitat, true
FROM seed s
WHERE NOT EXISTS (SELECT 1 FROM the8_lore_entries e WHERE e.title = s.title);


-- ---------------------------------------------------------------------------
-- 7. FACTION LINKS (friends/foes -> factions)
-- ---------------------------------------------------------------------------
WITH links(entry_title, faction_title) AS (VALUES
  ($a$Gundren Rockseeker$a$,        $b$The Rockseeker Brothers$b$),
  ($a$Tharden Rockseeker$a$,        $b$The Rockseeker Brothers$b$),
  ($a$Nundro Rockseeker$a$,         $b$The Rockseeker Brothers$b$),
  ($a$Sildar Hallwinter$a$,         $b$The Lords' Alliance$b$),
  ($a$Sister Garaele$a$,            $b$The Harpers$b$),
  ($a$Halia Thornton$a$,            $b$The Zhentarim$b$),
  ($a$Daran Edermath$a$,            $b$The Order of the Gauntlet$b$),
  ($a$Reidoth the Druid$a$,         $b$The Emerald Enclave$b$),
  ($a$Droop$a$,                     $b$The Cragmaw Tribe$b$),
  ($a$Klarg$a$,                     $b$The Cragmaw Tribe$b$),
  ($a$Yeemik$a$,                    $b$The Cragmaw Tribe$b$),
  ($a$King Grol$a$,                 $b$The Cragmaw Tribe$b$),
  ($a$Grol's Advisor$a$,            $b$The Cragmaw Tribe$b$),
  ($a$Iarno Albrek, called Glasstaff$a$, $b$The Redbrands$b$),
  ($a$Iarno Albrek, called Glasstaff$a$, $b$The Lords' Alliance$b$),
  ($a$The Nothic of Tresendar$a$,   $b$The Redbrands$b$)
)
INSERT INTO the8_lore_entry_factions (lore_entry_id, faction_entry_id)
SELECT e.id, f.id
FROM links l
JOIN the8_lore_entries e ON e.title = l.entry_title
JOIN the8_lore_entries f ON f.title = l.faction_title AND f.category = 'factions'
ON CONFLICT (lore_entry_id, faction_entry_id) DO NOTHING;


-- ---------------------------------------------------------------------------
-- 8. LOCATION LINKS (friends/foes -> where they are found)
-- ---------------------------------------------------------------------------
WITH links(entry_title, location_title) AS (VALUES
  ($a$Elmar Barthen$a$,             $b$Barthen's Provisions$b$),
  ($a$Toblen Stonehill$a$,          $b$Stonehill Inn$b$),
  ($a$Trilena Stonehill$a$,         $b$Stonehill Inn$b$),
  ($a$Linene Graywind$a$,           $b$Lionshield Coster$b$),
  ($a$Halia Thornton$a$,            $b$The Miner's Exchange$b$),
  ($a$Sister Garaele$a$,            $b$Shrine of Luck$b$),
  ($a$Harbin Wester$a$,             $b$Townmaster's Hall$b$),
  ($a$Qelline Alderleaf$a$,         $b$Alderleaf Farm$b$),
  ($a$Carp Alderleaf$a$,            $b$Alderleaf Farm$b$),
  ($a$Daran Edermath$a$,            $b$Edermath Orchard$b$),
  ($a$Reidoth the Druid$a$,         $b$Thundertree$b$),
  ($a$Mirna Dendrar$a$,             $b$Tresendar Manor$b$),
  ($a$Droop$a$,                     $b$Tresendar Manor$b$),
  ($a$The Nothic of Tresendar$a$,   $b$Tresendar Manor$b$),
  ($a$Iarno Albrek, called Glasstaff$a$, $b$Tresendar Manor$b$),
  ($a$Sildar Hallwinter$a$,         $b$Cragmaw Hideout$b$),
  ($a$Klarg$a$,                     $b$Cragmaw Hideout$b$),
  ($a$Yeemik$a$,                    $b$Cragmaw Hideout$b$),
  ($a$Gundren Rockseeker$a$,        $b$Cragmaw Castle$b$),
  ($a$King Grol$a$,                 $b$Cragmaw Castle$b$),
  ($a$Grol's Advisor$a$,            $b$Cragmaw Castle$b$),
  ($a$Venomfang$a$,                 $b$Thundertree$b$),
  ($a$Hamun Kost$a$,                $b$Old Owl Well$b$),
  ($a$Nezznar the Black Spider$a$,  $b$Wave Echo Cave$b$),
  ($a$Nundro Rockseeker$a$,         $b$Wave Echo Cave$b$),
  ($a$Tharden Rockseeker$a$,        $b$Wave Echo Cave$b$),
  ($a$Mormesk the Wraith$a$,        $b$Wave Echo Cave$b$),
  ($a$The Flameskull$a$,            $b$Wave Echo Cave$b$)
)
INSERT INTO the8_lore_entry_locations (lore_entry_id, location_entry_id)
SELECT e.id, l2.id
FROM links l
JOIN the8_lore_entries e  ON e.title = l.entry_title
JOIN the8_lore_entries l2 ON l2.title = l.location_title AND l2.category = 'locations'
ON CONFLICT (lore_entry_id, location_entry_id) DO NOTHING;


-- ---------------------------------------------------------------------------
-- 9. QUESTS (all is_secret = true; reveal one at a time as they come up)
-- ---------------------------------------------------------------------------
WITH seed(title, description, status, sort_order, reward_gold, reward_other, gm_hint) AS (VALUES
  ($t$Escort the Supply Wagon$t$,
   $d$Gundren Rockseeker hired the party to bring a wagon of mining supplies from Neverwinter to Barthen's Provisions in Phandalin. He rode ahead with Sildar Hallwinter and was to meet them there.$d$,
   $s$in_progress$s$, 10, 10,
   $o$10 gp each on delivery$o$,
   $g$The opening job. It ends in the goblin ambush on the Triboar Trail — the wagon itself is never actually in danger, the ambush is aimed at Gundren.$g$),

  ($t$Follow the Goblins' Trail$t$,
   $d$Five goblins ambushed the road and two dead horses were left behind — Gundren's and Sildar's. A well-used trail leads south into the scrub.$d$,
   $s$available$s$, 20, 0,
   $o$None — this is the thread, not the pay$o$,
   $g$Trail runs to Cragmaw Hideout, with two snares along the way. If the players ignore it and push on to Phandalin, Barthen and Sildar's absence will push them back to it.$g$),

  ($t$Rescue Sildar Hallwinter$t$,
   $d$Gundren's escort was taken alive by the goblins at the cave off the Triboar Trail.$d$,
   $s$available$s$, 30, 0,
   $o$Sildar's gratitude and his patronage$o$,
   $g$Held in the back of Cragmaw Hideout. Yeemik will offer to trade him for Klarg's death. Sildar unlocks the Iarno quest, the Lords' Alliance, and eventually the townmaster's chair.$g$),

  ($t$Deliver the Supplies to Barthen$t$,
   $d$The wagon still has to reach Barthen's Provisions in Phandalin, ambush or no ambush.$d$,
   $s$available$s$, 40, 10,
   $o$10 gp each, and Barthen's goodwill$o$,
   $g$Easy win that gets them into town and talking to people. Barthen is worried about the Rockseekers and will say so.$g$),

  ($t$Return the Lionshield Goods$t$,
   $d$Crates marked with a blue lion were stacked in the goblins' cave. Linene Graywind at the Lionshield Coster has been missing shipments for weeks.$d$,
   $s$available$s$, 50, 0,
   $o$Goodwill, a discount, and a warning about the Redbrands$o$,
   $g$Cheap way to make a solid ally. Linene will not help against the Redbrands — her company's property comes first — but she will arm the party cheaply.$g$),

  ($t$Find Iarno Albrek$t$,
   $d$The Lords' Alliance sent a wizard named Iarno Albrek to Phandalin months ago to establish order. He stopped writing. Sildar wants him found.$d$,
   $s$available$s$, 60, 50,
   $o$50 gp from Sildar$o$,
   $g$The payoff of this quest is the reveal: Iarno is Glasstaff. Do not let the party stumble on the letters before they have taken this job — the order matters.$g$),

  ($t$Clear the Redbrand Hideout$t$,
   $d$A band in red cloaks has taken over Phandalin from the cellars of Tresendar Manor. The townmaster will not act. Somebody has to.$d$,
   $s$available$s$, 70, 100,
   $o$100 gp from Sildar once the town is free$o$,
   $g$The first real dungeon. Three entrances, the nothic, the slave pens, Glasstaff's quarters with the Black Spider's letters. This is where the campaign stops being a delivery job.$g$),

  ($t$Rescue the Dendrar Family$t$,
   $d$Mirna Dendrar and her two children are being held in the cellars beneath the manor. Her husband was killed in the street for speaking out.$d$,
   $s$available$s$, 80, 0,
   $o$The location of a family heirloom hidden in Thundertree$o$,
   $g$The moral centre of the Redbrand arc. If the party sweeps the hideout without finding the pens, have a Redbrand beg for his life with the information.$g$),

  ($t$Deliver Glasstaff to Halia Thornton$t$,
   $d$The woman who runs the Miner's Exchange would like a word with whoever is leading the Redbrands — alive, if possible.$d$,
   $s$available$s$, 90, 100,
   $o$100 gp from Halia$o$,
   $g$The Zhentarim hook, and it competes directly with Sildar's claim on Iarno. Make the party choose who gets him — that choice should have consequences in town later.$g$),

  ($t$The Banshee's Bargain$t$,
   $d$Sister Garaele asks the party to visit an old spirit in a grove east of Conyberry, offer her a gift, and ask her a single question.$d$,
   $s$available$s$, 100, 0,
   $o$Potion of healing, a scroll, and Harper goodwill$o$,
   $g$The question concerns the resting place of a long-lost spellbook. Agatha answers one question truthfully if the gift pleases her. She will kill the party if they attack — say so through Garaele, who tried it and barely survived.$g$),

  ($t$The Diggers at Old Owl Well$t$,
   $d$Daran Edermath has heard of lights and strange labourers at the ruined tower east of town, and would like to know who is digging there and why.$d$,
   $s$available$s$, 110, 0,
   $o$Order of the Gauntlet goodwill$o$,
   $g$Hamun Kost. Negotiation, not combat — he trades what he knows about the Black Spider for what the party knows. A party that opens with violence loses the intel and probably a character.$g$),

  ($t$The Orcs of Wyvern Tor$t$,
   $d$Orc raiders have been striking travellers on the Triboar Trail from a rocky height to the east. The townmaster has posted a bounty.$d$,
   $s$available$s$, 120, 100,
   $o$100 gp bounty$o$,
   $g$Straight fight, with an ogre among them. Good breather encounter and a level-up opportunity before Cragmaw Castle.$g$),

  ($t$Reidoth and the Ruins of Thundertree$t$,
   $d$A druid who knows Neverwinter Wood better than any map is said to be living among the ruins of a dead village to the north.$d$,
   $s$available$s$, 130, 0,
   $o$The location of Cragmaw Castle$o$,
   $g$Reidoth trades directions for help with the blights or the cultists. He will not help against the dragon. The ruins also hold the Dendrar heirloom.$g$),

  ($t$Recover the Dendrar Heirloom$t$,
   $d$Mirna Dendrar's family hid an emerald necklace in their old home in Thundertree when they fled the ash. She has no use for it now and would rather it went to whoever freed her children.$d$,
   $s$available$s$, 140, 0,
   $o$An emerald necklace$o$,
   $g$Located in the ruined Dendrar house, in a hidden compartment. Gives the party a reason to walk into a village with a dragon in it — keep the tension up.$g$),

  ($t$Rescue Gundren Rockseeker$t$,
   $d$Gundren is alive and held at a ruined castle deep in Neverwinter Wood, along with the map to the mine his family has been chasing for years.$d$,
   $s$available$s$, 150, 0,
   $o$Gundren's friendship, the map, and a share in the mine$o$,
   $g$Cragmaw Castle. King Grol has him, the doppelganger is watching Grol, and the Black Spider is pressing for delivery. Frontal assault is brutal — reward scouting and captured goblins.$g$),

  ($t$Find Wave Echo Cave$t$,
   $d$The lost mine of the Phandelver's Pact, sealed for five hundred years, and the reason every road in this region has become dangerous.$d$,
   $s$available$s$, 160, 0,
   $o$The mine itself$o$,
   $g$Needs the map from Cragmaw Castle, or Nundro's directions, or Nezznar's own trail. Do not let them wander in before roughly level four.$g$),

  ($t$Rescue Nundro Rockseeker$t$,
   $d$The youngest Rockseeker brother is somewhere in the mine, in the hands of whoever got there first.$d$,
   $s$available$s$, 170, 0,
   $o$Nundro alive — and someone who can actually run the mine$o$,
   $g$Held in the Black Spider's camp. Easy to miss in the rush to the final fight; make sure a captured bugbear or a scrap of conversation points at him.$g$),

  ($t$Defeat the Black Spider$t$,
   $d$A name in every letter, behind the goblins, behind the Redbrands, behind the killings. He is in the mine, and he is not leaving without it.$d$,
   $s$available$s$, 180, 0,
   $o$His hoard, and the end of the Phandalin troubles$o$,
   $g$Nezznar, with bugbear bodyguards and giant spiders. He opens with an offer of partnership — let him make it. Betrayal after a false alliance plays far better than a straight ambush.$g$),

  ($t$Restore the Forge of Spells$t$,
   $d$At the heart of the mine stands the forge the old pact was built around, quiet for five centuries and not, apparently, broken.$d$,
   $s$available$s$, 190, 0,
   $o$Access to the Forge — commissioned magic items$o$,
   $g$The campaign's real prize and the hook into whatever comes next. Once it is running, the Alliance, the Zhentarim and the Harpers all want a stake in Phandalin — which is your sequel, already written.$g$)
)
INSERT INTO the8_quests (title, description, status, sort_order, reward_gold, reward_other, gm_notes, is_secret)
SELECT s.title, s.description, s.status, s.sort_order, s.reward_gold, s.reward_other, s.gm_hint, true
FROM seed s
WHERE NOT EXISTS (SELECT 1 FROM the8_quests q WHERE q.title = s.title);

COMMIT;

-- ============================================================================
-- Sanity check (run separately):
--   SELECT category, count(*) FROM the8_lore_entries GROUP BY category;
--   SELECT count(*) FROM the8_lore_entries WHERE is_secret = false;  -- expect 0
-- ============================================================================

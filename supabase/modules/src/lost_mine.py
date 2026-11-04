# Lost Mine of Phandelver — library module, written as reveal blocks.
# Base: Phandelver and Below: The Shattered Obelisk, chapters 1–4 (the updated Lost Mine).
# Deliberately left out: everything from PaB chapter 5 on — psionic goblins, the obelisk,
# Gwyn Oresong. Where PaB and the 2014 Lost Mine differ, PaB wins (Elmina Barthen, Daran is a
# drow, Reidoth is a woman, Greska runs the Sleeping Giant, bandits sacked the mine, etc.).
#
# Each entry: blocks in the order the party is likely to learn them. Block 1 is what they
# know on first meeting; later blocks are revealed as play reaches them. Blocks never say
# what player characters think, feel, say or do. GM notes hold what players should never read.

def E(cat, title, blocks, gm='', habitat=None, fac=(), loc=()):
    return dict(category=cat, title=title, blocks=list(blocks), gm=gm, habitat=habitat, fac=list(fac), loc=list(loc))

def Q(title, blocks, sort, gold=0, other='', gm=''):
    return dict(title=title, blocks=list(blocks), sort=sort, gold=gold, other=other, gm=gm)

ENTRIES = [
 # ── HISTORY ──────────────────────────────────────────────────────────────
 E('history', "The Phandelver Pact", [
   "More than five hundred years ago, clans of dwarves and gnomes made an agreement to share a rich mine in a wondrous cavern. They called it the Phandelver Pact.",
   "The cavern was Wave Echo Cave. Its wealth was more than ore: the place was full of magic, and human spellcasters joined the pact to bind that power into a great forge.",
   "Old Phandalin grew rich alongside the mine. Its people were firm allies of the dwarves and gnomes.",
 ], "The pact's history is common knowledge in outline (DC 10 History). The Rockseekers are dwarves of the same tradition reopening the mine; Gundren talks about it constantly."),
 E('history', "The Forge of Spells", [
   "Legend says the pact's wizards built a forge in the heart of Wave Echo Cave where magic weapons, armour and gnome gadgets could be made.",
   "The Spider wants it. He has been searching the mine for the forge, not for its gold.",
   "The forge survived, but its magic has faded. Its green flame no longer makes lasting enchantments: weapons or armour bathed in it for a minute become magic for a few hours only.",
 ], "Wave Echo Cave area W15, guarded by a spectator bound to serve 101 years. Brazier of green flame: nonmagical weapon or armour bathed 1 minute becomes +1 for 1d12 hours. Removing the brazier kills the flame forever. Items kept there: Lightbringer (+1 mace) and Tergon's +1 breastplate."),
 E('history', "The Fall of Wave Echo Cave", [
   "Five hundred years ago, bandits swept through the North. A powerful bandit force, backed by evil mercenary wizards, attacked Wave Echo Cave for its riches.",
   "Human wizards fought beside the dwarves and gnomes to defend the forge. The spell battle that followed brought much of the cavern down. Few survived, and the mine's location was lost.",
   "The same bandits sacked old Phandalin, which lay abandoned for centuries afterwards.",
   "The dead of that battle still lie in the mine, and not all of them rest.",
 ], "Undead in Wave Echo Cave are the battle's dead: dwarf and ogre zombies, ghouls, the flameskull, and Mormesk the wraith, the last wizard to die there. The battle's damage is visible in the Starry Cavern (W13). Note: in the 2014 Lost Mine this was an orc host; Phandelver and Below makes it bandits, and we follow PaB."),
 E('history', "The Resettling of Phandalin", [
   "Phandalin was abandoned for centuries. In the last three or four years, hardy folk from Neverwinter and Waterdeep have begun building a new town on top of the ruins.",
   "Farmers, woodcutters, fur traders and prospectors live there now, drawn by stories of gold and platinum in the foothills of the Sword Mountains.",
   "The town has no lord, no walls and no watch. It elects a townmaster each year, but nobody enforces anything, and ruffians have noticed.",
 ], "The town's lack of authority is the root of the Redbrand problem and of Halia Thornton's ambitions. Sildar wants the Lords' Alliance to fill that gap."),
 E('history', "The Coming of the Redbrands", [
   "For months, a gang in scarlet cloaks called the Redbrands has been bullying Phandalin: shaking down businesses, threatening miners and fur traders, and laughing at the townmaster.",
   "Their leader is someone the townsfolk know only as Glasstaff.",
   "A tenday ago, Thel Dendrar, a woodcarver, stood up to them when they bullied his wife. They murdered him in front of witnesses and took his body. His wife, daughter and son vanished the same day.",
   "The Redbrands leave only one business alone: the Miner's Exchange.",
 ], "Iarno Albrek founded the Redbrands about two months ago under the name Glasstaff, after he was sent to set up a constabulary. Their base is under Tresendar Manor."),
 E('history', "The Destruction of Thundertree", [
   "Thundertree was a prosperous village of woodcutters and trappers, where the Neverwinter River leaves Neverwinter Wood.",
   "Thirty years ago, Mount Hotenow to the north erupted and devastated it. In the wake of the eruption, a plague of strange zombies swept the area and killed or drove off the survivors.",
   "Most of the zombies have crumbled to dust, but the magic that lingers has twisted the plants there into something dangerous. Few people go there, and fewer stay.",
 ], "Ash zombies remain in some buildings; blights in the gardens. Mirna Dendrar's family fled from here when she was a girl."),
 E('history', "The Fall of Conyberry", [
   "Conyberry was a village on the Triboar Trail. It has been abandoned for years and lies in ruins.",
   "Something old haunts the woods a few miles outside it: a banshee named Agatha.",
 ], "Agatha's presence is one reason nobody resettled. The Triboar Trail still runs through the ruins, which makes them the landmark for finding her lair."),
 E('history', "Netheril", [
   "Thousands of years ago, an empire of mages called Netheril held lands that are now ruins. Old Owl Well is one of its watchtowers.",
   "Its wizards left magic behind in the places they built, and scholars and treasure-hunters still dig for it.",
 ], "Hamun Kost is digging at Old Owl Well for Netherese lore. His best find so far: a ring of protection made from a single piece of green glass stronger than steel. The tower's builder was a wizard named Dresina (Agatha knows)."),
 E('history', "Phalorm", [
   "An ancient realm called Phalorm once controlled much of the North. Its wizards built castles that still stand in pieces in the wilds.",
 ], "Cragmaw Castle was built by a wizard of old Phalorm: seven overlapping towers, the upper floors long since collapsed."),
 E('history', "Illefarn", [
   "Illefarn was an ancient elven nation that once spread across much of the Sword Coast.",
 ], "The Redbrand password for the skeletons in the Tresendar crypts (area R4) is \"Illefarn\"."),
 E('history', "The Tresendar Family", [
   "The Tresendars were the noble family whose manor, more castle than house, still stands in ruins at the east edge of Phandalin.",
   "Their elders are laid to rest in a crypt under the manor.",
 ], "The cellars and crypt are now the Redbrand hideout. Six skeletons guard the crypt and ignore anyone in a scarlet cloak or who speaks the password \"Illefarn\"."),

 # ── LOCATIONS ────────────────────────────────────────────────────────────
 E('locations', "Neverwinter", [
   "The great city of the north-west coast, where the journey to Phandalin begins.",
   "Many of Phandalin's new settlers came from here, and Neverwinter is where the town sends its prisoners for real justice.",
 ], "Gundren hires the party here. Sildar met Gundren here. Glasstaff is sent here for trial if captured."),
 E('locations', "The Triboar Trail", [
   "An old trail that runs from the town of Triboar in the east, about a hundred miles west through the ruins of Conyberry, then passes north of Phandalin on its way to the High Road along the coast.",
   "The country around it is foothills and sparse plains, between the Sword Mountains to the south and Neverwinter Wood to the north.",
   "Travellers have been attacked on it lately: goblins near the turn-off to Phandalin, and marauders on the eastern stretch near Wyvern Tor.",
   "Someone has put a price on the party's heads. Hobgoblins on the trail carry a crude sketch of one of them, with \"25 gold pieces for this one\" and a spider scrawled beneath.",
 ], "Random encounters (PaB ch. 3): stirges, ghouls at night, an ogre, Cragmaw bands (who know the way to the castle), hobgoblin squads hunting the party for the Spider's bounty, bugbear scouts from Wyvern Tor, wolves, an owlbear. Travel: about 24 miles a day.", fac=(), loc=()),
 E('locations', "The Goblin Ambush", [
   "Half a day from Phandalin, on the Triboar Trail, two dead horses lie across the road, shot full of black-feathered arrows.",
   "They are Gundren Rockseeker's and Sildar Hallwinter's horses. Gundren's saddlebags have been torn open and searched.",
   "Behind the thickets on the north side, a trail leads north-west: about a dozen goblins have come and gone, dragging two human-sized bodies.",
   "The trail is trapped: a snare, then a hidden pit.",
 ], "Four goblins wait in the woods, two each side, until someone approaches the horses. The last one flees down the trail. The trail runs five miles north-west to the Cragmaw Hideout. Snare and pit: DC 15 Perception to spot, DC 10 Dex save.", loc=("The Triboar Trail",)),
 E('locations', "Cragmaw Hideout", [
   "A cave at the foot of a good-sized hill, five miles off the Triboar Trail, with a cold stream running out of its mouth and thickets screening the bank.",
   "The goblins who ambushed the trail live here. The caves climb steeply inside the hill, loud with running water.",
   "Their leader is a bugbear named Klarg, who answers to a King Grol at Cragmaw Castle.",
   "Inside: a kennel of half-trained wolves, a rope bridge over the stream, a den where Sildar Hallwinter was held, and Klarg's cave full of stolen crates marked with a blue lion.",
 ], "H1 cave mouth; H2 guard post (2 goblins, goblin boss); H3 kennel (3 wolves; DC 15 Animal Handling, 10 with food; chimney up to H8); H4–H5 steep passage and bridge; H6 den (5 goblins, goblin bosses Yeemik and Errk, Sildar at 1 hp); H8 Klarg, 2 goblin honour guards, wolf Ripper, about 30 days of plunder, Lionshield crates. About fifteen goblins in all. Finishing the hideout: level 2.", fac=("The Cragmaw Tribe",)),
 E('locations', "Phandalin", [
   "A rough-and-tumble frontier town of farmers, woodcutters, fur traders and prospectors, built over the ruins of a much older settlement in the foothills of the Sword Mountains.",
   "It has no walls and no watch. A townmaster is elected each year, but nobody enforces anything.",
   "A gang in scarlet cloaks, the Redbrands, has the whole town frightened.",
   "Old stone from the ruins is everywhere: in walls, in the shrine, in the foundations of the new houses.",
 ], "Home base for the whole module. The town's mood tracks the Redbrands: after the hideout is cleared, people talk freely and Halia Thornton starts angling to be in charge. Arrival is in the evening; the Stonehill Inn is the natural first stop."),
 E('locations', "Stonehill Inn", [
   "A modest inn in the middle of town, newer than most buildings in Phandalin, with six rooms and a busy common room.",
   "The innkeeper, Toblen Stonehill, is friendly and talkative, and the common room is the best place in town to hear what's going on.",
   "Regulars: Elsa, the dwarf bartender; Freda, a gnome weaver; Lanar, a miner; Narth, a farmer; and Toblen's son Pip.",
 ], "Rumours (PaB ch. 2): Elsa, Daran Edermath is a former adventurer. Freda, the Redbrands leave the Miner's Exchange alone (they don't want trouble with Halia). Lanar, marauders on the east end of the Triboar Trail, the townmaster wants them gone. Narth, Sister Garaele left town for a few days and came back wounded. Pip, Carp Alderleaf found a secret tunnel in the woods and the Redbrands nearly caught him. Toblen, the murder of Thel Dendrar. Anyone: the Redbrands drink at the Sleeping Giant. Sildar takes one of the six rooms. (Elsa's sister Gwyn belongs to PaB chapter 5 on: left out.)", loc=("Phandalin",)),
 E('locations', "Barthen's Provisions", [
   "The biggest trading post in Phandalin: rope, rations, lanterns, tools and everyday goods, open sunup to sundown.",
   "It doesn't sell weapons or armour, or anything very expensive. For those, the clerks point people to the Lionshield Coster.",
   "The owner, Elmina Barthen, is the person the supply wagon from Neverwinter is meant for, and she pays 10 gold pieces a head for its safe delivery.",
 ], "Elmina's clerks are Ander and Thistle. She expects the other Rockseeker brothers back \"any day now\" to resupply.", loc=("Phandalin",)),
 E('locations', "Edermath Orchard", [
   "A tidy little cottage beside an apple orchard that went wild long ago. Its owner is slowly clearing the undergrowth and bringing the trees back.",
   "The owner is Daran Edermath, a retired adventurer.",
 ], "Daran gives the Old Owl Well quest and knows the Redbrand safe house is under Tresendar Manor. Farmers like Daran may let the party sleep in a hayloft.", loc=("Phandalin",)),
 E('locations', "Lionshield Coster", [
   "A trading post with a wooden sign shaped like a shield and painted with a blue lion, run by Linene Graywind.",
   "The Lionshields are a merchant company based in Yartar, more than a hundred miles east. They ship goods to small settlements across the region.",
   "Banditry has hit this post hard. Its latest caravan never arrived.",
   "In a back room, Linene keeps arms and armour for sale, but she won't sell to anyone she thinks is a danger to the town.",
 ], "The missing caravan's crates are in Klarg's cave at the Cragmaw Hideout. Returning them (or saying where they are): 50 gp reward and Linene's goodwill.", loc=("Phandalin",)),
 E('locations', "The Miner's Exchange", [
   "A trading post where local miners have their finds weighed, measured and paid out.",
   "With no other authority in town, it also keeps the records of claims to streams and diggings around Phandalin. It's the best place to meet people who know the hills.",
   "Its guild master is Halia Thornton. The Redbrands, who bully everyone else, leave the Exchange alone.",
 ], "Halia is a Zhentarim agent using the Exchange to become the town's real authority.", loc=("Phandalin",)),
 E('locations', "Alderleaf Farm", [
   "A farm on the edge of town run by Qelline Alderleaf, a halfling who seems to know everything that goes on in Phandalin.",
   "She lets travellers sleep in her hayloft if they don't fancy the inn.",
   "Her son, Carp, plays in the woods near Tresendar Manor.",
 ], "Carp's secret tunnel (to Redbrand hideout area R8) and Qelline's pointer to Reidoth both start here.", loc=("Phandalin",)),
 E('locations', "Shrine of Luck", [
   "Phandalin's only temple: a small shrine of stones taken from the old ruins, dedicated to Tymora, goddess of luck.",
   "It is tended by Sister Garaele, a young elf priestess.",
 ], "Garaele's Harper work and the Agatha errand start here.", loc=("Phandalin",)),
 E('locations', "The Sleeping Giant", [
   "A run-down, dirty and dangerous tap house at the end of Phandalin's main street.",
   "The Redbrands drink here, and most of the town avoids it.",
   "It is run by a surly orc named Greska.",
 ], "The natural place to pick a fight with the Redbrands: four ruffians, who flee when three are down.", loc=("Phandalin",)),
 E('locations', "Townmaster's Hall", [
   "A small hall with a jail of two cells and a notice board beside the door, where the townmaster posts official business.",
   "One notice offers a contract: marauders have attacked caravans on the Triboar Trail near Wyvern Tor, and the townmaster will pay 100 gold pieces to see them driven off.",
 ], "After he recovers, Sildar sets himself up here. Prisoners (Redbrands, later Glasstaff or Nezznar) are held here; unguarded, Nezznar is broken out by Halia.", loc=("Phandalin",)),
 E('locations', "Tresendar Manor", [
   "More a castle than a house: an ancient, long-abandoned manor on a low hill at the east edge of town, among woods and thickets.",
   "Plenty of tracks lead across the empty grounds to a stone stair beside the ruined kitchen.",
   "Under the manor, the Redbrands have turned the old cellars and the family crypt into their hideout: barracks, cells, an armoury and a wizard's workshop.",
   "A crevasse runs through the caves beneath, and a tunnel leads out to the woods south of the manor.",
   "Prisoners have been held in cells down there and ransomed.",
 ], "R1 cellar (cistern hides Glasstaff's escape satchel with a potion of invisibility); R2 barrack, 3 bandits; R3 pit trap; R4 crypt, 6 skeletons (password Illefarn or a scarlet cloak); R5 cells, 3 ruffians, the Dendrars; R6 armoury; R7 storeroom (40 beaver pelts); R8 crevasse cave, Ssarnak the nothic, Thel Dendrar's body, rigged bridge, south tunnel; R9 Nosk and three bugbears, Droop; R10 common room, knucklebones; R11 workshop, Zeond the quasit; R12 Glasstaff. Finishing the hideout: level 3.", fac=("The Redbrands",), loc=("Phandalin",)),
 E('locations', "Conyberry", [
   "An abandoned village on the Triboar Trail, in ruins for years. Only foundations and chimney stacks remain.",
   "From the ruins, an old trail leads north-west into Neverwinter Wood.",
 ], "Agatha's lair is a few miles along that trail. Old Owl Well is 18 miles south-east.", loc=("The Triboar Trail",)),
 E('locations', "Agatha's Lair", [
   "A small, ten-foot shelter in the woods a few miles from Conyberry, where the trees grow close and nothing sings.",
   "A banshee named Agatha lives here. She was beautiful once, and she hasn't forgotten.",
 ], "Rude or threatening visitors get her Horrifying Visage, then a fight. Polite visitors: DC 15 Persuasion (advantage for good roleplay; automatic success with Garaele's jeweled silver comb). She answers ONE question, truthfully; she's a capable diviner and can answer almost anything about the adventure.", loc=("Conyberry",)),
 E('locations', "Old Owl Well", [
   "A ruined watchtower and an adjoining building in the hills south of the Triboar Trail, eighteen miles south-east of Conyberry. Only crumbling walls and the broken stump of the tower remain.",
   "The well in its courtyard still gives clean, fresh water.",
   "It was built thousands of years ago by a vanished empire, Netheril.",
   "Lately prospectors have seen a camp there, and undead guards that chase them off.",
 ], "A Red Wizard, Hamun Kost, camps in a tent beside the tower; twelve zombies lurk inside the tower shell (DC 15 Perception smells them). Treasure in his tent includes the Netherese green-glass ring of protection.", loc=("The Triboar Trail",)),
 E('locations', "Thundertree", [
   "A dead village where the Neverwinter River leaves Neverwinter Wood, ruined thirty years ago by the eruption of Mount Hotenow and the zombie plague that followed.",
   "A hand-painted warning sign stands on the road in.",
   "The gardens have grown into twisted thickets, and some of them move. Ash-grey zombies still slump in the shadows of some houses.",
   "Inside, among the ruins: the Brown Horse, an old taproom once famous for its ale; a leaning statue of Palien, an old hero of Neverwinter; the smithy; the old garrison; an herbalist's shop; and a tower on the hill.",
   "A green dragon has taken the old tower.",
   "People in black, winged cloaks and horned masks are hiding in a cottage on the east side of the village.",
 ], "Areas: U1–U2 twig blights; U3 Brown Horse, 6 ash zombies; U4 Reidoth's watch post (she placed the sign); U5 blight thicket; U6 ruined store, 2 giant spiders, dead elf adventurer (+1 leather armour); U7 tower, Venomfang; U8 smithy, 4 ash zombies, brass dragon scales (75 gp); U9 Dendrar herb and alchemy shop, emerald necklace; U10 square, statue of Palien; U11 garrison, 5 ash zombies; U12 blights; U13 Favric's dragon cultists. About 50 miles north-west of Phandalin.", loc=("Neverwinter Wood",)),
 E('locations', "Wyvern Tor", [
   "A crag in the rugged hills north-east of the Sword Mountains, visible for twenty miles. Travellers on the Triboar Trail near Conyberry see it to the south.",
   "Wyverns nested there once, until adventurers dealt with them years ago.",
   "Marauders have been camping somewhere on its slopes for a couple of months, ambushing travellers on the trail.",
   "They are orcs and bugbears, with an ogre among them.",
 ], "Finding the hidden camp: DC 15 Perception or DC 10 Survival per hour. A lone bugbear sentry; in the cave, Brughor Axe-Biter (orc, 18 hp), four bugbears and the ogre Gog. Gog fights to the death; the rest flee if Brughor dies. Plunder from homesteads further north (180 sp, 15 ep, perfume). Clearing it pays Harbin's 100 gp and satisfies Hamun Kost.", loc=("The Triboar Trail",)),
 E('locations', "Neverwinter Wood", [
   "An old, deep forest north and east of Neverwinter, thick enough to swallow roads.",
   "Goblin bands raid out of it, and somewhere inside stands the ruin the goblins call Cragmaw Castle.",
 ], "Contains Cragmaw Castle (about twenty miles north-east of the Cragmaw Hideout) and borders Thundertree. Reidoth knows it better than anyone."),
 E('locations', "Cragmaw Castle", [
   "A ruined castle hidden in Neverwinter Wood, made to look abandoned. The goblins of the Cragmaw tribe use it as their stronghold.",
   "The goblins didn't build it: a wizard of old Phalorm did, with seven overlapping towers. The upper floors collapsed long ago, and the goblins have propped up the rest with crude timbers.",
   "King Grol, the bugbear who rules every Cragmaw band, holds court here.",
   "Inside: archer posts behind arrow slits, a trapped hall, a banquet hall run by a bad-tempered goblin cook, an old chapel to Oghma, Mystra, Lathander and Tymora, and a shrine to a goblin god called the Jagged Tooth.",
   "The goblins believe one tower is haunted, and keep it boarded up.",
 ], "C1–C2 entrance and tripwire cave-in (DC 20 to spot); C3 archer goblin bosses; C4 goblins; C5 storeroom (dwarven brandy, Sildar's gear); C6 hobgoblins (plan to oust the bugbears one day); C7 Yegg the cook and goblins; C8 dark hall, Lhupo's grick, gold elf statuette (augury once); C9 shrine, Lhupo and acolytes; C10 postern; C11 hidden canvas entrance; C12 hobgoblins loyal to Grol; C13 'haunted' tower is a grell's lair (old library; chest with scroll of revivify); C14 King Grol, Snarl the dire wolf, Vyerith, Gundren. Confronting Grol and learning the mine's location: level 4.", fac=("The Cragmaw Tribe",), loc=("Neverwinter Wood",)),
 E('locations', "Wave Echo Cave", [
   "The lost mine of the Phandelver Pact, fifteen miles east of Phandalin in the deep vales of the Sword Mountains. Its entrance is a narrow tunnel hidden in the foothills.",
   "It's named for the sound of pounding surf that rolls through its deepest caverns.",
   "The Rockseeker brothers found the entrance a month ago. Their camp is at the mouth of the cave.",
   "The mine is cold, damp and drafty, overrun with monsters and with the dead of the battle that closed it.",
   "Deeper in: an assayers' office with Dwarvish records, miners' barracks, a cavern of glowing green fungi, a great smelter with a waterwheel, a starry cavern scarred by spell fire, and a temple of Dumathoin, the dwarven god of mining.",
 ], "W1 Rockseeker camp, Tharden dead (cloak of protection); W2 mine tunnels, ochre jelly; W3 old entrance, stirges; W4 dwarf and ogre zombies; W5 assayers' office, pay chest; W6 ghouls; W7 safe storeroom; W8 fungi cavern (violet fungi); W9 great cavern, ghouls; W10 dark pool, giant constrictor snake, dead wizard with wand of magic missiles; W11 six bugbears behind a barricade; W12 smelter, dwarf zombies and the flameskull; W13 starry cavern; W14 Mormesk; W15 Forge of Spells and spectator; W16 booming cavern, giant octopus, underground lake; W17 old streambed (bypasses W12; the Spider hasn't found it); W18 collapsed cavern, Vhalak and bugbears digging (gauntlets of ogre power in the rift); W19 temple of Dumathoin, Nezznar (emerald eyes on the statue: prying one out can bring the room down); W20 Nundro. Defeating Nezznar: level 5.", fac=("The Rockseeker Brothers",)),
 E('locations', "The Sword Mountains", [
   "The mountains south and east of Phandalin. Prospectors pan their foothill streams for gold and platinum.",
 ], "Wave Echo Cave lies in their deep vales; Wyvern Tor in the hills to their north-east."),

 # ── FACTIONS ─────────────────────────────────────────────────────────────
 E('factions', "The Cragmaw Tribe", [
   "Goblin raiders who prey on travellers along the Triboar Trail and in Neverwinter Wood. They file their teeth to jagged points to look fiercer.",
   "Several bands answer to one king: King Grol, a bugbear, at Cragmaw Castle.",
   "They're a mix: a handful of bugbears lording it over many miserable goblins and a few hobgoblins, who would like to be in charge.",
   "Someone called the Spider is paying them.",
 ], "Klarg runs the hideout band, Yeemik wants Klarg's job, the hobgoblins at the castle want the bugbears gone. Captured Cragmaws can give directions to the castle. (PaB's 'strange goblins' are chapter 5+ material and left out.)"),
 E('factions', "The Redbrands", [
   "A gang of ruffians in scarlet cloaks who bully and extort Phandalin.",
   "They answer to a leader called Glasstaff and drink at the Sleeping Giant.",
   "Their hideout is under Tresendar Manor.",
   "They kidnap travellers and hold them for ransom.",
   "Four bugbears work with them, sent by someone called the Spider.",
 ], "Iarno Albrek (Glasstaff) founded them. What captured Redbrands know: Glasstaff runs things from under the manor, there are bugbears and a monster in the caves, and the boss takes orders from someone else."),
 E('factions', "The Lords' Alliance", [
   "A league of cities and towns along the Sword Coast and in the North, working together for mutual security and prosperity. Its agents handle threats before they reach their cities.",
   "Sildar Hallwinter is one of them. So was Iarno Albrek, who was sent to Phandalin to establish order and then went silent.",
 ], "Sildar wants Phandalin safe and prosperous and the mine back in production. Glasstaff met the Spider through his Alliance contacts; no other Alliance member knows he turned."),
 E('factions', "The Harpers", [
   "A scattered network of spies and adventurers who promote equality and quietly oppose the abuse of power. They gather information across the land and help the weak and the oppressed.",
   "Sister Garaele reports to them.",
 ], "The Agatha errand is a Harper operation: they're hunting Bowgentle's spellbook."),
 E('factions', "The Zhentarim", [
   "A powerful network that seeks secret control of the North through wealth and influence.",
   "Halia Thornton is one of their agents.",
 ], "Halia wants Glasstaff removed so she can take the Redbrands over. If Nezznar is jailed in Phandalin without a guard, she breaks him out and hands him to her Zhentarim superiors."),
 E('factions', "The Order of the Gauntlet", [
   "A devout and vigilant order that protects people from evildoers: always ready to smite evil, enforce justice and punish those who would harm others.",
   "Daran Edermath is a member, though he's retired.",
 ], ""),
 E('factions', "The Emerald Enclave", [
   "A widespread group of wilderness survivalists who preserve the natural order, root out unnatural threats, and help people survive the dangers of the wild.",
   "Reidoth the druid is a member.",
 ], "Because of the Enclave's principles, Reidoth won't rile the goblins without good cause."),
 E('factions', "The Cult of the Dragon", [
   "A cult that seeks alliances with the powerful dragons of the Sword Coast.",
   "A small band of them is hiding in Thundertree, wearing black cloaks cut like dragon wings and black leather masks with horns. They speak Draconic among themselves.",
   "They've come to make an offering to the green dragon in the tower.",
 ], "Favric leads them; the others don't share his ambition and flee if he's taken."),
 E('factions', "The Red Wizards of Thay", [
   "Necromancers from the land of Thay, far to the east, where wizards tattoo their skin. A Red Wizard's head tattoo marks his school of magic.",
   "One of them, Hamun Kost, is digging at Old Owl Well.",
 ], "DC 15 History identifies Thayan garb; DC 10 Arcana reads Hamun's tattoo as necromantic."),
 E('factions', "The Rockseeker Brothers", [
   "Three dwarf brothers, Gundren, Tharden and Nundro, prospectors with a dream of reopening the lost mine of the Phandelver Pact.",
   "They found the entrance to Wave Echo Cave a month ago.",
   "Tharden and Nundro were camped at the cave mouth and haven't come back to town for supplies.",
   "They were followed. The Spider's spies traced them to the mine.",
 ], "Tharden is dead at the camp; Nundro is a prisoner in the temple of Dumathoin's priests' quarters (W20). Afterwards, Gundren and Nundro run the mine and give the party a 10% share."),
 E('factions', "The Scraptops", [
   "A goblin clan known for scavenging and tinkering, not raiding.",
 ], "Droop's clan. The Cragmaws are pressuring him to join them."),

 # ── FRIENDS (allies, neutrals, and people who only look like allies) ─────
 E('friends', "Gundren Rockseeker", [
   "A dwarf prospector, talkative and relentlessly optimistic. He hired the party in Neverwinter to escort a wagon of supplies to Phandalin.",
   "He rode ahead with a warrior escort, Sildar Hallwinter, to see to business in town.",
   "He never arrived. His horse was found dead on the Triboar Trail, shot with goblin arrows.",
   "He and his brothers found the entrance to Wave Echo Cave, the lost mine of the Phandelver Pact, and he carried the only map.",
   "The goblins took him and his map to King Grol at Cragmaw Castle, on the orders of someone called the Spider.",
   "Rescued, he offers 25 gold pieces each and a tenth share of the mine's profits once it's running.",
 ], "Held unconscious (stable at 0 hp) in Grol's quarters at Cragmaw Castle. Vyerith means to question him, then kill him and destroy the map. Ask each player how their character knows Gundren (PaB ch. 1).", fac=("The Rockseeker Brothers",)),
 E('friends', "Sildar Hallwinter", [
   "A kindhearted human warrior of nearly fifty who rode with Gundren as his escort.",
   "He holds a place of honour in Waterdeep's famous griffon cavalry, and he's an agent of the Lords' Alliance.",
   "The goblins dragged him to their hideout, beat him, and kept him bound in their den.",
   "He came to Phandalin to find Iarno Albrek, a fellow Alliance member and wizard who vanished near Tresendar Manor about two months ago: a short, dark-bearded man in his thirties.",
   "He pays 500 gold pieces to whoever finds Cragmaw Castle and defeats or drives off its leader, and 200 for ending the Redbrands.",
 ], "Found at 1 hp in the Cragmaw Hideout den. Takes a room at the Stonehill Inn, then sets up at the Townmaster's Hall. He doesn't know Iarno is Glasstaff; once he does, he wants Iarno tried in Neverwinter. His gear (longsword with Neverwinter's emblem) is in Cragmaw Castle's storeroom.", fac=("The Lords' Alliance",)),
 E('friends', "Nundro Rockseeker", [
   "The youngest of the three Rockseeker brothers, last seen camped out at the brothers' secret find.",
   "He was taken prisoner in Wave Echo Cave.",
   "The Spider kept him alive and questioned him every day, sure he knew more about the mine than he admitted.",
 ], "Locked in W20 (Nezznar has the anvil-headed key). Vhalak the doppelganger may take his shape to force a surrender. Knows no more of the layout than the party.", fac=("The Rockseeker Brothers",)),
 E('friends', "Tharden Rockseeker", [
   "One of the three Rockseeker brothers, last seen camped out at the brothers' secret find.",
   "He is dead, killed at the brothers' camp at the mouth of Wave Echo Cave.",
 ], "The Spider killed him. He still wears a cloak of protection the Spider overlooked.", fac=("The Rockseeker Brothers",)),
 E('friends', "Elmina Barthen", [
   "A young woman with a kindly manner who owns Barthen's Provisions, the biggest trading post in Phandalin.",
   "She pays the 10 gold pieces a head for delivering Gundren's wagon. Gundren is a friend, and his talk of finding the lost mine excited her.",
   "She says the two other Rockseeker brothers are camped somewhere outside town and haven't been in to resupply for a tenday.",
 ], "Her clerks are Ander and Thistle. If the party skips the goblin trail, Elmina seeks them out and tells them Gundren never arrived.", loc=("Barthen's Provisions",)),
 E('friends', "Ander and Thistle", [
   "The two clerks at Barthen's Provisions, who load the wagons and mind the counter when Elmina is out.",
 ], "", loc=("Barthen's Provisions",)),
 E('friends', "Toblen Stonehill", [
   "The friendly young innkeeper of the Stonehill Inn, with a wife and children.",
   "He's from Triboar, to the east. He came to Phandalin to prospect and found he knew far more about running an inn.",
   "He hates the Redbrands but keeps his head down, afraid of what they'd do to his family.",
 ], "Tells the story of Thel Dendrar's murder.", loc=("Stonehill Inn",)),
 E('friends', "Trilena Stonehill", ["Toblen's wife, who runs the Stonehill Inn with him."], "", loc=("Stonehill Inn",)),
 E('friends', "Pip Stonehill", [
   "Toblen's young son, and Carp Alderleaf's best friend.",
   "He says Carp found a secret tunnel in the woods and the Redbrands nearly caught him.",
 ], "", loc=("Stonehill Inn",)),
 E('friends', "Elsa", [
   "The dwarf bartender at the Stonehill Inn.",
   "She says Daran Edermath, the orchard keeper, used to be an adventurer.",
 ], "In PaB she also brags about her sister Gwyn, a scholar in Neverwinter: that thread belongs to chapters 5+ and is left out.", loc=("Stonehill Inn",)),
 E('friends', "Freda", [
   "A gnome weaver who drinks at the Stonehill Inn.",
   "She says the Redbrands hassle every business in town except the Miner's Exchange, because they don't want trouble with Halia Thornton.",
 ], "", loc=("Stonehill Inn",)),
 E('friends', "Lanar", [
   "A miner who drinks at the Stonehill Inn.",
   "He says marauders have been attacking caravans on the eastern end of the Triboar Trail, and the townmaster wants someone to run them off.",
 ], "", loc=("Stonehill Inn",)),
 E('friends', "Narth", [
   "A farmer who drinks at the Stonehill Inn.",
   "He says Sister Garaele left town for a few days recently and came back wounded.",
 ], "", loc=("Stonehill Inn",)),
 E('friends', "Linene Graywind", [
   "The woman who runs the Lionshield Coster's trading post in Phandalin.",
   "Bandits have hit her company's caravans, and the latest one never arrived. She doesn't know who's responsible.",
   "She sells arms and armour from a back room, but not to anyone she thinks is a danger to the town.",
   "She pays 50 gold pieces for the return of her stolen goods, and warns people to stay away from the Sleeping Giant.",
 ], "The crates are in Klarg's cave.", loc=("Lionshield Coster",)),
 E('friends', "Daran Edermath", [
   "A drow, well over five hundred years old, who has retired to an orchard cottage outside Phandalin.",
   "He served for many years as a marshal and herald on the Dragon Coast, far to the south, before coming back to the Neverwinter region, his original home.",
   "He's a member of the Order of the Gauntlet, no longer active, but he keeps an eye on what happens around town.",
   "He wants someone to stand up to the Redbrands and their leader, Glasstaff, and knows their safe house is under Tresendar Manor.",
   "Prospectors have told him someone is digging at Old Owl Well and that undead chase them away. He'll give his boots of striding and springing to whoever finds out what's going on there.",
 ], "Happy to trade news with adventurers who share the order's virtues. (In the 2014 Lost Mine he was a half-elf; PaB makes him a drow, which plays nicely against the Spider.)", fac=("The Order of the Gauntlet",), loc=("Edermath Orchard",)),
 E('friends', "Sister Garaele", [
   "A zealous young elf priestess who tends the Shrine of Luck.",
   "She despairs of ever ridding Phandalin of the Redbrands.",
   "She recently left town for a few days and came back wounded.",
   "She's a Harper, and reports to her superiors on everything around Phandalin.",
   "Her superiors sent her to ask a banshee, Agatha, about a spellbook. Agatha drove her off. She wants someone to take the banshee a jeweled silver comb and ask where the spellbook of the legendary mage Bowgentle is. She pays three potions of healing.",
 ], "Agatha spoke wistfully of the beautiful things she owned in life; the comb makes the Persuasion check automatic.", fac=("The Harpers",), loc=("Shrine of Luck",)),
 E('friends', "Qelline Alderleaf", [
   "A wise, practical halfling farmer who seems to know everything that happens in Phandalin.",
   "She's an old friend of the druid Reidoth, who knows every inch of the land. Reidoth has gone to the ruins of Thundertree, about fifty miles north-west.",
 ], "Suggests Reidoth to anyone looking for Cragmaw Castle; gives directions.", loc=("Alderleaf Farm",)),
 E('friends', "Carp Alderleaf", [
   "Qelline's son: a spirited, precocious halfling boy who dreams of being an adventurer.",
   "Playing in the woods near Tresendar Manor, he found a secret tunnel in a thicket. Two \"big scary bandits\" came out of it to meet two Redbrands, and nearly caught him.",
   "He can show the way to the tunnel, but won't go in.",
 ], "The tunnel leads to area R8 (the crevasse cave).", loc=("Alderleaf Farm",)),
 E('friends', "Reidoth", [
   "An elderly human druid with long white hair who doesn't use two words where one will do. Qelline Alderleaf says there isn't an inch of the land she doesn't know.",
   "She keeps a watch post in Thundertree and visits from time to time to keep an eye on its dangers. She put up the warning sign on the road.",
   "She warns of spiders at the foot of the hill, people in black masks and cloaks on the east side, and a young green dragon that has moved into the old tower.",
   "She's a member of the Emerald Enclave, and won't stir up the goblins without good reason.",
   "She knows where Cragmaw Castle is, and where the lost mine lies.",
 ], "She gives directions to Cragmaw Castle to people who respect her position, or in exchange for chasing off Venomfang. If attacked, she turns into a grey squirrel and slips away.", fac=("The Emerald Enclave",), loc=("Thundertree",)),
 E('friends', "Mirna Dendrar", [
   "The widow of Thel Dendrar, a woodcarver the Redbrands murdered a tenday ago. She and her children disappeared the same day.",
   "The Redbrands held her and her children in cells under Tresendar Manor, waiting on a ransom from rich relatives in Neverwinter she'd invented to keep them alive.",
   "As a girl, she fled Thundertree with her family when undead overran it. Their herb and alchemy shop, in the south-east of the ruins, still hides an emerald necklace in a case under the storage shelves.",
 ], "Her children are Nilsa (18) and Nars (13). Thel's body is in the Redbrand crevasse cave (R8). The Dendrars only know the boss is a wizard with 'tall, furry monsters with big ears' working for him.", loc=("Phandalin",)),
 E('friends', "Nilsa and Nars Dendrar", [
   "Mirna Dendrar's children: Nilsa, eighteen, and Nars, thirteen. They vanished with their mother when the Redbrands murdered their father.",
 ], "Held with Mirna in R5.", loc=("Phandalin",)),
 E('friends', "Droop", [
   "A small, terrified goblin who faints at the first sign of trouble.",
   "He's from the Scraptops, a clan of goblin scavengers and tinkerers, and wandered into the Redbrand hideout looking for parts for a wagon he's fixing back home.",
   "The bugbears there bully him, and the Cragmaws are demanding he join them. He just wants to go home.",
   "He knows the hideout's layout, its secret doors and its traps.",
 ], "Found with Nosk's bugbears in R9. Doesn't remember where Cragmaw Castle is, only that it's up north in the forest.", fac=("The Scraptops",), loc=("Tresendar Manor",)),
 E('friends', "Halia Thornton", [
   "The quick-witted guild master of the Miner's Exchange, who acts as if the Exchange were the closest thing Phandalin has to a government.",
   "She offers 100 gold pieces to capture the Redbrands' leader, Glasstaff, and bring her any letters found in his quarters.",
   "She's an agent of the Zhentarim.",
   "She wants the Redbrands for herself.",
 ], "Ruthless, and a valuable patron if not crossed. DC 15 Insight shows ulterior motives. If the party jails Nezznar in Phandalin and doesn't guard him, she breaks him out and delivers him to the Zhentarim.", fac=("The Zhentarim",), loc=("The Miner's Exchange",)),
 E('friends', "Harbin Wester", [
   "Phandalin's townmaster: a cheerful, well-liked banker, and a timid one.",
   "He insists the Redbrands are \"just a mercenary guild, and not all that much trouble, really.\"",
   "He's posted a 100 gold piece contract to drive the marauders away from Wyvern Tor.",
   "Eventually he admits the Redbrands should be caught and tried, perhaps sent to Neverwinter for prison.",
 ], "Completely intimidated by the Redbrands. Will keep prisoners in his two cells for a few days; fears retaliation if Redbrands are killed.", loc=("Townmaster's Hall",)),
 E('friends', "Greska", [
   "The surly orc who runs the Sleeping Giant.",
 ], "", loc=("The Sleeping Giant",)),
 E('friends', "Agatha", [
   "A banshee who haunts a shelter in the woods outside Conyberry: the spirit of an elf woman who was beautiful once, and as vain in death as she was in life.",
   "She is well informed, and a capable diviner. She will answer one question, and only one.",
   "She longs for the beautiful things she owned in life.",
   "She traded Bowgentle's spellbook to a necromancer named Tsernoth, from the city of Iriaebor, more than a hundred years ago. She doesn't know what became of it.",
 ], "Rude or threatening visitors: Horrifying Visage, then a fight. The name of Old Owl Well's builder, which Hamun Kost wants: Dresina.", loc=("Agatha's Lair",)),
 E('friends', "Hamun Kost", [
   "A red-robed man with a shaved head and a tattoo on his forehead, camped among the ruins of Old Owl Well with silent, shambling labourers.",
   "He's a Red Wizard of Thay; the tattoo marks him as a necromancer.",
   "He isn't eager to fight. He calls off his zombies as soon as anyone speaks to him, and he's willing to trade.",
   "He wants the marauders at Wyvern Tor gone, because they've been scouting his camp. Or he wants someone to ask the banshee Agatha the name of the wizard who built the tower.",
 ], "Tight-lipped about why he's here: digging for Netherese lore. In return for either favour he'll share what he knows (the location of Cragmaw Castle or Wave Echo Cave). The answer to his question: Dresina. His tent: coin, agates, a potion of healing, a scroll of darkness, and the Netherese green-glass ring of protection in a jeweled box.", fac=("The Red Wizards of Thay",), loc=("Old Owl Well",)),
 E('friends', "Iarno Albrek", [
   "A Lords' Alliance wizard, a short, dark-bearded man in his thirties, who went to Phandalin several months ago to establish order. The Alliance hasn't heard from him since.",
   "He disappeared while exploring around Tresendar Manor about two months ago.",
   "He is Glasstaff, leader of the Redbrands.",
 ], "Sildar's missing contact. Keep this entry and 'Glasstaff' as two separate entries until the party works it out; then reveal the last block in both.", fac=("The Lords' Alliance",)),

 # ── FOES ─────────────────────────────────────────────────────────────────
 E('foes', "The Spider", [
   "Someone called the Spider is paying the Cragmaw goblins. He wanted Gundren Rockseeker captured and brought to him, with everything Gundren carried.",
   "The Redbrands' leader takes orders from him too. His letters are sealed with a spider in wax.",
   "He's put a bounty on the party: hobgoblins on the Triboar Trail carry a sketch of one of them and the promise of 25 gold.",
   "The Spider is a drow.",
   "His name is Nezznar. He followed the Rockseekers to Wave Echo Cave, killed Tharden, took Nundro, and is searching the mine for the Forge of Spells.",
   "He's curious about everyone he meets, and he'll promise anything, surrender, alliance, cooperation, and break his word the moment it suits him.",
 ], "Nezznar, a drow wizard with a spider staff, headquartered in the temple of Dumathoin (W19) with two bugbears; casts invisibility if warned. He admits everything when confronted: using the Cragmaws and the Redbrands to keep the mine secret. The undead in W8 and W12 have stopped him reaching the Forge; he doesn't know about the old streambed (W17). If jailed in Phandalin without a guard, Halia breaks him out. Treasure: potion of healing, spider staff, anvil-headed key to W20, sack of coin and an electrum ale mug.", loc=("Wave Echo Cave",)),
 E('foes', "Glasstaff", [
   "The leader of the Redbrands, known to the townsfolk by that name alone. The gang calls him that because he carries a staff of glass.",
   "He's a wizard. He lives under Tresendar Manor, with a workshop full of bubbling experiments.",
   "He puts on genteel manners: calls his thugs \"my good fellows\", calls kidnapping and arson \"that unpleasant little business\", and greets intruders as his \"honoured guests\".",
   "He takes his orders from the Spider, who promised him a share of the Forge of Spells.",
   "He is Iarno Albrek, the Lords' Alliance wizard Sildar came to find.",
 ], "Staff of defense (mage armor, shield). Warned by Zeond, he flees through a secret door, grabs the satchel in the R1 cistern and drinks a potion of invisibility. Surrenders at 8 hp and becomes a model prisoner, hoping the Spider will free him (he won't). Knows: the Spider is a drow; four bugbears were sent; the bugbears know the way to Wave Echo Cave; the Spider seeks the Forge; no other Alliance member knows he turned. Chest: coin, gems, scrolls of hold person and fireball. Desk: the Spider's sealed letter ordering the strangers captured or killed and any dwarven maps sent on.", fac=("The Redbrands",), loc=("Tresendar Manor",)),
 E('foes', "Klarg", [
   "The bugbear who leads the Cragmaw goblins at their hideout. He takes his orders from King Grol.",
   "He talks about himself in the third person and thinks he's a king at the start of a career of conquest: \"Klarg will build a throne from your bones!\"",
   "His goblins hate his bullying.",
   "He keeps a mangy pet wolf called Ripper and the best of the plunder in his own cave.",
 ], "H8 with two goblin honour guards and Ripper. Warned, they hide behind stalagmites and crates. If his allies die he tries to squeeze down the chimney to H3 (DC 10 Dex or stuck). Treasure chest among the Lionshield crates.", fac=("The Cragmaw Tribe",), loc=("Cragmaw Hideout",)),
 E('foes', "Yeemik", [
   "A goblin boss, second in command at the Cragmaw Hideout.",
   "When the fight turned, he dragged Sildar to the edge of a ledge and shouted: \"Truce, or this human dies!\"",
   "He wants Klarg dead so he can be leader, and promised to free Sildar in exchange for Klarg's head.",
 ], "Untrustworthy: if the party takes the deal, he tries to squeeze a ransom out of them afterwards. Refused, he shoves Sildar off the ledge. His crony Errk, another goblin boss, shouts along supportively.", fac=("The Cragmaw Tribe",), loc=("Cragmaw Hideout",)),
 E('foes', "King Grol", [
   "The bugbear king whom every Cragmaw band grudgingly obeys, ruling from Cragmaw Castle.",
   "A fierce old bugbear, fur streaked with grey, shoulders stooped, wearing jeweled silver teeth over his own rotting fangs. Nobody crosses him.",
   "He keeps a dire wolf called Snarl.",
   "He has Gundren Rockseeker and his map, and wants to sell the map to the Spider rather than hand it over.",
 ], "C14, haggling with Vyerith. Warned, he holds Gundren hostage. Hobgoblins in C12 are loyal to him.", fac=("The Cragmaw Tribe",), loc=("Cragmaw Castle",)),
 E('foes', "Vyerith", [
   "A drow woman with a silky voice, a guest in King Grol's quarters, come from the Spider to collect Gundren Rockseeker and his map.",
   "She isn't a drow. She's a doppelganger.",
   "She meant to betray the Spider: question Gundren to see who else knows where the mine is, then kill him and destroy the map.",
 ], "Warned, she hides behind the north-east door to attack from behind.", loc=("Cragmaw Castle",)),
 E('foes', "Vhalak", [
   "A drow overseeing bugbears as they dig in a collapsed cavern of Wave Echo Cave.",
   "Another doppelganger in drow guise, working for the Spider.",
 ], "W18. The Spider's divinations say something valuable lies in the rift (a dwarf's skeleton wearing gauntlets of ogre power, DC 20 Perception, one check per hour). If three bugbears fall, Vhalak runs to warn Nezznar and may pose as Nundro.", loc=("Wave Echo Cave",)),
 E('foes', "Ssarnak", [
   "A one-eyed, hunched monster that lurks by the bridges in the crevasse cave under Tresendar Manor, and speaks straight into the mind.",
   "It's a nothic. Glasstaff pays it in treasure and fresh meat to guard the hideout.",
   "It's loyal only for now, and will sell out the Redbrands for the right price, especially food.",
 ], "R8. Watches intruders from behind a column and uses Weird Insight to learn their secrets. Knows everything the Redbrands know. The southern bridge is rigged to collapse.", loc=("Tresendar Manor",)),
 E('foes', "Zeond", [
   "An invisible thing that watches over Glasstaff's workshop.",
   "Glasstaff's familiar: a quasit.",
 ], "R11. Waits until the party is fighting, then strikes and turns invisible again; warns Glasstaff of anyone coming through the workshop.", loc=("Tresendar Manor",)),
 E('foes', "Nosk", [
   "The leader of four bugbears quartered in the Redbrand hideout.",
   "The bugbears were sent by the Spider to help Glasstaff keep Phandalin in line, and they know the way to Wave Echo Cave and to Cragmaw Castle.",
 ], "R9. They fear the Spider more than the party and won't talk willingly (charm person might do it). They avoid the human Redbrands; people in scarlet cloaks can trick them. Nosk carries the master key and 50 gp in stones.", loc=("Tresendar Manor",)),
 E('foes', "Venomfang", [
   "A young green dragon that has taken the old tower in Thundertree, tearing in through the roof and killing the giant spiders that lived there.",
   "He spends hours each day admiring the dead wizard's treasure.",
 ], "Far above the party's weight at level 3–4: meant to be avoided, bargained with, or driven off. He flies away at a quarter of his hit points. Under the coins lies Hew, a +1 dwarven battleaxe that deals maximum damage to plants and wood. Reidoth trades directions to Cragmaw Castle for chasing him off.", loc=("Thundertree",)),
 E('foes', "Favric", [
   "An ambitious young man who leads the masked cultists hiding in Thundertree.",
   "He's come to win the green dragon's allegiance and hopes to rise fast in the cult by doing it.",
   "He suggests an alliance to anyone else interested in the dragon.",
 ], "He means to offer his 'allies' to the dragon as tribute, and the cultists side with the dragon in a fight. Tribute coffer: six amethysts (50 gp each). Wears a potion of flying around his neck. His followers flee if he's caught or killed.", fac=("The Cult of the Dragon",), loc=("Thundertree",)),
 E('foes', "Brughor Axe-Biter", [
   "The orc who leads the marauders camped on Wyvern Tor.",
   "His band noticed the extra traffic on the Triboar Trail and started ambushing travellers.",
 ], "18 hit points. His band flees if he dies (except Gog).", loc=("Wyvern Tor",)),
 E('foes', "Gog", [
   "An ogre who rides with the marauders on Wyvern Tor.",
 ], "Fights until slain.", loc=("Wyvern Tor",)),
 E('foes', "Lhupo", [
   "A goblin boss at Cragmaw Castle who calls herself a priest of the Jagged Tooth, a god the goblins made up.",
   "She keeps a grick as a pet, and the other goblins are terrified of it.",
 ], "C9 with two robed 'acolytes', none with real divine power. Chalice (180 gp) and censer (150 gp) on the altar.", fac=("The Cragmaw Tribe",), loc=("Cragmaw Castle",)),
 E('foes', "Yegg", [
   "The cantankerous goblin cook of Cragmaw Castle, who shouts at his assistants all day.",
 ], "C7 with six goblins. If he dies, the rest flee.", fac=("The Cragmaw Tribe",), loc=("Cragmaw Castle",)),
 E('foes', "Mormesk the Wraith", [
   "Something that was once a powerful mage still haunts the old wizards' quarters in Wave Echo Cave.",
   "He was the last wizard to die in the spell battle that closed the mine, and centuries of rage have poisoned his soul.",
   "He leads the undead of the mine, and he stays by the scorched chest that holds the treasure he can no longer touch.",
 ], "W14. Wants the spectator in the Forge destroyed. Chest: coin, malachites, a platinum-filigree pipe.", loc=("Wave Echo Cave",)),
 E('foes', "The Flameskull", [
   "A burning skull that guards the great smelter in Wave Echo Cave, along with a company of dead dwarf warriors.",
   "It served the pact's human wizards and still follows its ancient orders: nobody passes.",
 ], "W12, with eight dwarf zombies (they don't pursue beyond 1 round). This is what stops the Spider reaching the Forge; the old streambed (W17) goes around it.", loc=("Wave Echo Cave",)),
 E('foes', "The Spectator of the Forge", [
   "A floating, many-eyed sphere that guards the Forge of Spells and speaks Common.",
   "A wizard of the pact summoned it to guard the forge's treasures for 101 years. The magic unravelled when the mine fell, and it still believes the mine is open for business.",
 ], "W15. Attacks if anything is taken. DC 15 Deception convinces it the party works for the mine's owners and has come to end its service; it then vanishes home.", loc=("Wave Echo Cave",)),

 # ── MONSTERS ─────────────────────────────────────────────────────────────
 E('monsters', "Goblin", ["Small, cruel raiders who strike from ambush and run when the odds turn. The Cragmaws file their teeth into points."], "Goblin bosses lead bands; at the castle, some are archers.", "Cragmaw Hideout, Cragmaw Castle, the Triboar Trail"),
 E('monsters', "Bugbear", ["Big, hairy goblinoids with long arms, who move far more quietly than anything that size should."], "They lord it over the Cragmaws, and serve the Spider directly: in the Redbrand hideout, at Wyvern Tor and in Wave Echo Cave.", "Cragmaw Castle, Wyvern Tor, Wave Echo Cave"),
 E('monsters', "Hobgoblin", ["Disciplined, martial goblinoids who fight in formation."], "At Cragmaw Castle they plan to dispose of the bugbears someday. Squads on the trail hunt the party for the Spider's bounty.", "Cragmaw Castle, the Triboar Trail"),
 E('monsters', "Wolf and Dire Wolf", ["Wolves run in packs. The Cragmaws keep foul-tempered ones and train them for battle."], "Klarg's Ripper; Grol's dire wolf Snarl.", "Cragmaw Hideout, Cragmaw Castle, the wilds"),
 E('monsters', "Owlbear", ["A hulking predator with the body of a bear and the head and beak of an owl."], "A random encounter on the Triboar Trail.", "Forests and hills of the Triboar Trail"),
 E('monsters', "Ogre", ["A huge, dull-witted brute that lives to eat and smash."], "Gog at Wyvern Tor; a random encounter on the trail; ogre zombies in Wave Echo Cave.", "Wyvern Tor, the Triboar Trail"),
 E('monsters', "Orc", ["Savage raiders who live for battle and plunder."], "Brughor Axe-Biter.", "Wyvern Tor"),
 E('monsters', "Nothic", ["A hunched, one-eyed creature that was once a wizard, ruined by forbidden knowledge. It can see into the secrets of others."], "Ssarnak.", "Tresendar Manor"),
 E('monsters', "Quasit", ["A tiny, malicious demon that can turn invisible and change shape, often bound as a wizard's familiar."], "Zeond.", "Tresendar Manor"),
 E('monsters', "Skeleton", ["The animated bones of the dead, bound to guard a place."], "The Tresendar crypt; wandering in Wave Echo Cave.", "Tresendar Manor, Wave Echo Cave"),
 E('monsters', "Zombie", ["Rotting dead raised by necromancy, slow and relentless."], "Hamun Kost's twelve labourers; dwarf and ogre zombies in Wave Echo Cave.", "Old Owl Well, Wave Echo Cave"),
 E('monsters', "Ash Zombie", ["Grey, ash-caked zombies left over from the plague that followed Mount Hotenow's eruption. They release a choking cloud of ash when struck."], "Thundertree only.", "Thundertree"),
 E('monsters', "Ghoul", ["Hungry undead that paralyse their prey with a touch and gnaw on bones."], "Wave Echo Cave's packs; night encounters on the trail.", "Wave Echo Cave"),
 E('monsters', "Twig, Needle and Vine Blights", ["Plants twisted into walking, hungry things by dark magic. They stand perfectly still among ordinary bushes until prey comes close."], "Twig blights and needle blights in Thundertree's thickets.", "Thundertree"),
 E('monsters', "Giant Spider", ["Spiders the size of a horse that sense prey through their webs and drop on it."], "Thundertree's ruined store; the corpses outside Venomfang's tower.", "Thundertree"),
 E('monsters', "Stirge", ["A bat-like bloodsucker with a needle nose that latches on and drinks."], "Wave Echo Cave's old entrance; the trail.", "Wave Echo Cave, the Triboar Trail"),
 E('monsters', "Grick", ["A worm-like predator with a beaked maw ringed by tentacles, that hides on ledges and drops on prey."], "Lhupo's pet at Cragmaw Castle; wanders Wave Echo Cave.", "Cragmaw Castle, Wave Echo Cave"),
 E('monsters', "Grell", ["A floating brain with a beak and long, barbed tentacles that hunts from the dark."], "The 'ghost' in Cragmaw Castle's haunted tower.", "Cragmaw Castle"),
 E('monsters', "Doppelganger", ["A shapeshifter that can take any humanoid's form and read surface thoughts."], "Vyerith and Vhalak, both in drow guise.", "Cragmaw Castle, Wave Echo Cave"),
 E('monsters', "Ochre Jelly", ["A creeping, acidic ooze that splits when struck with blades or lightning."], "Stalks the old mine tunnels.", "Wave Echo Cave"),
 E('monsters', "Violet Fungus", ["A purple mushroom that lashes out with rotting tendrils, hidden among harmless fungi."], "W8, two of them.", "Wave Echo Cave"),
 E('monsters', "Giant Constrictor Snake", ["A snake long enough to wrap a horse."], "The dark pool, W10.", "Wave Echo Cave"),
 E('monsters', "Giant Octopus", ["A huge octopus drawn to light above the water."], "The booming cavern, W16.", "Wave Echo Cave"),
 E('monsters', "Flameskull", ["A burning skull bound to undeath by wizardry, which casts spells and reforms unless destroyed properly."], "The guardian of the smelter.", "Wave Echo Cave"),
 E('monsters', "Wraith", ["The hate-filled spirit of a powerful soul, whose touch drains life."], "Mormesk.", "Wave Echo Cave"),
 E('monsters', "Spectator", ["A lesser beholder summoned from another plane to guard a treasure."], "The Forge's guardian.", "Wave Echo Cave"),
 E('monsters', "Banshee", ["The spirit of a vain elf woman, whose wail can kill."], "Agatha.", "Agatha's Lair"),
 E('monsters', "Young Green Dragon", ["A green dragon not yet grown: cunning, cruel and greedy, with a poisonous breath."], "Venomfang.", "Thundertree"),
]

QUESTS = [
 Q("Escort the Supply Wagon", [
   "Gundren Rockseeker hired the party in Neverwinter to drive a wagon of mining supplies and food to Barthen's Provisions in Phandalin, where they'll be paid 10 gold pieces each.",
   "Gundren rode ahead with Sildar Hallwinter to see to business in town.",
 ], 10, 10, "10 gp each from Elmina Barthen",
   "Two oxen; cargo worth 100 gp. Ask how each character knows Gundren."),
 Q("Follow the Goblin Trail", [
   "Goblins ambushed Gundren and Sildar on the Triboar Trail. A trail leads north-west from the ambush site.",
   "About a dozen goblins came and went this way, dragging two human-sized bodies.",
 ], 20, 0, "", "Snare, then a pit; five miles to the Cragmaw Hideout."),
 Q("Rescue Sildar Hallwinter", [
   "Sildar Hallwinter, Gundren's escort, is a prisoner in the Cragmaw Hideout.",
   "The goblin Yeemik offers to free him in exchange for Klarg's head.",
 ], 30, 0, "Sildar's friendship and what he knows", "He's at 1 hp in H6."),
 Q("Return the Lionshield Goods", [
   "Linene Graywind's latest Lionshield caravan never reached Phandalin.",
   "The crates, marked with a blue lion, are in the Cragmaw Hideout.",
 ], 40, 50, "50 gp and Linene's help", ""),
 Q("Find Iarno Albrek", [
   "Sildar asks the party to find Iarno Albrek, a Lords' Alliance wizard who vanished while exploring around Tresendar Manor about two months ago.",
   "Iarno is Glasstaff.",
 ], 50, 0, "", "Once Sildar knows, he wants Iarno tried in Neverwinter."),
 Q("End the Redbrands", [
   "The Redbrands bully all of Phandalin from their hideout under Tresendar Manor. Sildar will pay to see them ended.",
   "Daran Edermath wants someone to stand up to them. The townmaster eventually admits they should be caught and tried.",
 ], 60, 200, "200 gp from Sildar", "Level 3 on finishing the hideout."),
 Q("Halia's Job", [
   "Halia Thornton offers 100 gold pieces to capture the Redbrands' leader, Glasstaff, and bring her any correspondence from his quarters.",
 ], 70, 100, "100 gp", "She wants Glasstaff out of the way so she can take over the Redbrands (DC 15 Insight)."),
 Q("Rescue the Dendrar Family", [
   "Thel Dendrar was murdered by the Redbrands. His wife Mirna and their children Nilsa and Nars disappeared the same day.",
   "They're held in cells under Tresendar Manor.",
 ], 80, 0, "Mirna tells of a family heirloom", ""),
 Q("The Banshee's Bargain", [
   "Sister Garaele asks the party to take a jeweled silver comb to the banshee Agatha, near Conyberry, and ask where the spellbook of the mage Bowgentle is.",
   "Agatha answered: she traded it to a necromancer named Tsernoth, of Iriaebor, more than a hundred years ago.",
 ], 90, 0, "Three potions of healing", "Agatha answers only one question. The comb makes the Persuasion check automatic."),
 Q("Who Digs at Old Owl Well", [
   "Daran Edermath wants to know who is digging at Old Owl Well, where prospectors say undead chased them off.",
   "A Red Wizard of Thay named Hamun Kost is excavating the ruins with zombie labour.",
 ], 100, 0, "Daran's boots of striding and springing", "Hamun trades information for the Wyvern Tor marauders being driven off, or for Agatha's answer to who built the tower (Dresina)."),
 Q("The Marauders of Wyvern Tor", [
   "The townmaster offers 100 gold pieces to drive off the marauders attacking caravans near Wyvern Tor.",
   "They're an orc, Brughor Axe-Biter, with bugbears and an ogre named Gog.",
 ], 110, 100, "100 gp from Harbin Wester", "Also satisfies Hamun Kost."),
 Q("Find Reidoth", [
   "Qelline Alderleaf says her friend Reidoth the druid knows every inch of the land, and went to the ruins of Thundertree.",
 ], 120, 0, "Directions to Cragmaw Castle", "Reidoth gives them if the party respects her, or trades them for chasing off Venomfang."),
 Q("The Dendrar Heirloom", [
   "Mirna Dendrar's family hid an emerald necklace in their herb and alchemy shop in Thundertree when they fled. The shop is in the south-east of the ruins.",
 ], 130, 0, "A gold necklace with an emerald pendant (200 gp)", "In a case in a compartment under the storage shelves (U9)."),
 Q("Find Cragmaw Castle", [
   "Gundren and his map were taken to King Grol at a place called Cragmaw Castle. Nobody in Phandalin knows where it is.",
   "Sildar pays 500 gold pieces to whoever finds it and defeats or drives off its leader.",
 ], 140, 500, "500 gp from Sildar",
   "Sources: captured Cragmaws, Reidoth, Agatha, Hamun Kost, Nosk's bugbears (by force or charm)."),
 Q("Rescue Gundren Rockseeker", [
   "Gundren is a prisoner of King Grol at Cragmaw Castle.",
 ], 150, 0, "25 gp each and a tenth share of the mine",
   "He's unconscious in C14; Vyerith plans to kill him after questioning."),
 Q("Find Wave Echo Cave", [
   "The lost mine of the Phandelver Pact lies somewhere in the hills. Gundren's map shows the way.",
 ], 160, 0, "", "Fifteen miles east of Phandalin. Map from Grol, or directions from Agatha, Reidoth, Hamun or the bugbears."),
 Q("Rescue Nundro Rockseeker", [
   "Gundren's brothers Tharden and Nundro were guarding the find and haven't come back to town.",
   "Tharden is dead at the camp. Nundro is a prisoner somewhere in the mine.",
 ], 170, 0, "", "W20; Nezznar has the key."),
 Q("Stop the Spider", [
   "Someone called the Spider is behind the Cragmaws and the Redbrands, and wants Wave Echo Cave for himself.",
   "The Spider is Nezznar, a drow, searching the mine for the Forge of Spells.",
 ], 180, 0, "Level 5", "W19. If jailed in Phandalin unguarded, Halia frees him."),
 Q("The Forge of Spells", [
   "At the heart of the mine stands the forge the pact was built around, guarded by something that still thinks the mine is open.",
 ], 190, 0, "Lightbringer, Tergon's breastplate, a few hours of +1 from the green flame",
   "Its magic has faded: no permanent enchantments any more."),
]

TIMELINE = [
 ("More than 500 years ago", "The Phandelver Pact", "Dwarf and gnome clans agree to share Wave Echo Cave. Human spellcasters join them and build the Forge of Spells. Old Phandalin prospers.", 1500),
 ("About 500 years ago", "The Fall of Wave Echo Cave", "Bandits backed by mercenary wizards storm the mine. The spell battle brings the caverns down, and the mine's location is lost. Old Phandalin is sacked and abandoned.", 1510),
 ("Thirty years ago", "Mount Hotenow Erupts", "The eruption devastates Thundertree, and a plague of strange zombies finishes it.", 2000),
 ("Three or four years ago", "Phandalin Resettled", "Settlers from Neverwinter and Waterdeep start building a new town on the ruins.", 2100),
 ("A couple of months ago", "The Redbrands Arrive", "Iarno Albrek, sent by the Lords' Alliance, vanishes near Tresendar Manor. A gang in scarlet cloaks led by 'Glasstaff' takes over the town. Marauders camp on Wyvern Tor.", 2900),
 ("A month ago", "The Rockseekers Find the Mine", "The three Rockseeker brothers find the entrance to Wave Echo Cave. They are followed.", 2950),
 ("A tenday ago", "Thel Dendrar Murdered", "The Redbrands kill a woodcarver who stood up to them, and his family vanishes.", 2980),
 ("Level 1", "The Ambush on the Triboar Trail", "Gundren Rockseeker and Sildar Hallwinter are taken by Cragmaw goblins on the road to Phandalin.", 3010),
 ("Level 5", "Wave Echo Cave Is Won", "The Spider falls and the Forge of Spells is found.", 3050),
]

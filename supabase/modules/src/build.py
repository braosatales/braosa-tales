"""Build library module JSON and campaign seed SQL from the Python sources.

    python3 supabase/modules/src/build.py

Writes:
  supabase/modules/lost-mine-of-phandelver.json   the module, as library data
  supabase/eve_of_giants_seed.sql                 full Eve of Giants seed (fresh campaign)
  supabase/eve_of_giants_lost_mine_remake.sql     swaps Eve's old Lost Mine entries for the module
Every seed needs supabase/progressive_reveal.sql to have been run first.
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, 'eve'))

import lost_mine as LM
import lost_mine_overlay as OV
import content_skt as SKT
import content_veor as VEOR

TAGS = 'abcdefghijkmnpqrsuvwxyz'


def q(s, tag):
    s = (s or '').strip()
    assert f'${tag}$' not in s, (tag, s[:50])
    return f'${tag}${s}${tag}$'


def nul(s, tag):
    return q(s, tag) if s else 'NULL::text'


# ── Module JSON ─────────────────────────────────────────────────────────────
def write_module():
    data = {
        'slug': 'lost-mine-of-phandelver',
        'title': 'Lost Mine of Phandelver',
        'source': 'Phandelver and Below: The Shattered Obelisk, chapters 1–4 (the updated Lost Mine); chapters 5+ left out.',
        'entries': LM.ENTRIES,
        'quests': LM.QUESTS,
        'timeline': [dict(event_date=d, title=t, description=x, sort_order=s) for d, t, x, s in LM.TIMELINE],
    }
    path = os.path.join(ROOT, 'modules', 'lost-mine-of-phandelver.json')
    with open(path, 'w') as f:
        json.dump(data, f, indent=1, ensure_ascii=False)
    return path


# ── Eve of Giants: assemble ─────────────────────────────────────────────────
def eve_content():
    entries = []
    for e in LM.ENTRIES:
        add_blocks, add_gm = OV.ADD.get(e['title'], ([], ''))
        gm = ' '.join(x for x in [e['gm'], add_gm] if x)
        entries.append(dict(e, blocks=e['blocks'] + add_blocks, gm=gm))
    unused = set(OV.ADD) - {e['title'] for e in LM.ENTRIES}
    assert not unused, unused

    # Eve-only Act I entry
    entries.append(dict(category='locations', title='The Long Road', habitat=None, fac=[], loc=['Neverwinter'],
        blocks=["The great road running north from Waterdeep through Triboar to Mirabar. Caravans, patrols and, lately, rumours of giants walking it."],
        gm="Eve seed (ours), via Toblen's cousin: fire giants on the Long Road, one 'swinging a rod like a dowser': Okssort and Ildmane tracking a buried Vonindod fragment toward Triboar. In SKT ch. 3, Xantharl's Keep stands on its loneliest stretch."))

    # Acts II and III: written as single paragraphs for now, so each is one block
    titles = {e['title'] for e in entries}
    for e in SKT.NEW + VEOR.NEW:
        assert e['title'] not in titles, e['title']
        titles.add(e['title'])
        entries.append(dict(category=e['category'], title=e['title'], blocks=[e['description']], gm=e['gm_notes'], habitat=e.get('habitat'), fac=[], loc=[]))

    fac = [(e['title'], f) for e in entries for f in e['fac']] + SKT.FAC + VEOR.FAC
    loc = [(e['title'], l) for e in entries for l in e['loc']] + SKT.LOC + VEOR.LOC
    cats = {e['title']: e['category'] for e in entries}
    for a, b in fac:
        assert a in cats and cats.get(b) == 'factions', (a, b)
    for a, b in loc:
        assert a in cats and cats.get(b) == 'locations', (a, b)
    fac = list(dict.fromkeys(fac))
    loc = list(dict.fromkeys(loc))

    quests = [dict(x) for x in LM.QUESTS]
    quests.append(dict(title="The Feast and the Letters to Triboar", sort=195, gold=0, other="Passage into Act II",
        blocks=["After the mine is won, Phandalin throws a feast. The next morning Linene Graywind has a letter for Alaestra Ulgar in Triboar, and Harbin Wester a much ruder one for Triboar's lord protector, Darathra Shendrel."],
        gm="Act I cliffhanger (ours, built on SKT Appendix A's hooks). On the night of the feast, fire giant scouts with a glowing rod circle the hills above Wave Echo Cave, find the entrance collapsed, and march east. The party reaches Triboar as those same giants attack it (SKT ch. 2). Level 5 by now."))
    for x in SKT.NEW_QUESTS + VEOR.NEW_QUESTS:
        quests.append(dict(title=x['title'], sort=x['sort'], gold=x['gold'], other=x['other'], gm=x['gm'], blocks=[x['description']]))
    quests.sort(key=lambda x: x['sort'])
    assert len({x['title'] for x in quests}) == len(quests)

    timeline = []
    for d, t, x, s in LM.TIMELINE:
        timeline.append(('Act I · ' + d if d.startswith('Level') else d, t, x, s))
    timeline += OV.EXTRA_TIMELINE + [t for t in SKT.TIMELINE] + [t for t in VEOR.TIMELINE]
    timeline.sort(key=lambda t: t[3])
    return entries, fac, loc, quests, timeline


def seed_sql(slug, title, entries, fac, loc, quests, timeline, header, pre=''):
    out = []
    w = out.append
    w(header)
    w(f"""BEGIN;

DO $chk$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.campaigns WHERE slug = '{slug}') THEN
    RAISE EXCEPTION 'Campaign {slug} not found. Run dashboard_campaigns.sql first.';
  END IF;
  IF to_regclass('public.the8_reveal_blocks') IS NULL THEN
    RAISE EXCEPTION 'Run progressive_reveal.sql first: this seed writes reveal blocks.';
  END IF;
END $chk$;
""")
    if pre:
        w(pre)
    c = f"WITH c AS (SELECT id FROM public.campaigns WHERE slug = '{slug}')"
    order = ['history', 'locations', 'factions', 'friends', 'foes', 'monsters']
    names = {'history': 'HISTORY', 'locations': 'LOCATIONS', 'factions': 'FACTIONS', 'friends': 'FRIENDS (allies, neutrals, and some who only look like allies)', 'foes': 'FOES', 'monsters': 'MONSTERS (with preferred habitat)'}
    n = 0
    for cat in order:
        rows = [e for e in entries if e['category'] == cat]
        n += 1
        w(f"\n-- ---------------------------------------------------------------------------\n-- {n}. {names[cat]}  ({len(rows)} entries, {sum(len(e['blocks']) for e in rows)} blocks)\n-- ---------------------------------------------------------------------------")
        vals = ",\n".join(f"  ({q(cat,'c')}, {q(e['title'],'t')}, {nul(e['gm'],'g')}, {nul(e.get('habitat'),'h')})" for e in rows)
        w(f"{c},\nseed(category, title, gm_notes, preferred_habitat) AS (VALUES\n{vals}\n)\nINSERT INTO public.the8_lore_entries (campaign_id, category, title, gm_notes, preferred_habitat, is_secret)\nSELECT c.id, s.category, s.title, s.gm_notes, s.preferred_habitat, true\nFROM seed s CROSS JOIN c\nWHERE NOT EXISTS (SELECT 1 FROM public.the8_lore_entries e WHERE e.campaign_id = c.id AND e.title = s.title);")
        bvals = ",\n".join(f"  ({q(e['title'],'t')}, {i}, {q(b,'b')})" for e in rows for i, b in enumerate(e['blocks']) if b.strip())
        w(f"-- blocks: all hidden; only added to entries that have none yet, so your edits are never overwritten\n{c},\nseed(title, sort_order, body) AS (VALUES\n{bvals}\n)\nINSERT INTO public.the8_reveal_blocks (campaign_id, lore_entry_id, body, is_revealed, sort_order)\nSELECT c.id, e.id, s.body, false, s.sort_order\nFROM seed s CROSS JOIN c\nJOIN public.the8_lore_entries e ON e.campaign_id = c.id AND e.title = s.title\nWHERE NOT EXISTS (SELECT 1 FROM public.the8_reveal_blocks b WHERE b.lore_entry_id = e.id);")

    def links(rows, table, col, cat, label):
        nonlocal n
        n += 1
        vals = ",\n".join(f"  ({q(a,'a')}, {q(b,'d')})" for a, b in rows)
        w(f"\n-- ---------------------------------------------------------------------------\n-- {n}. {label}  ({len(rows)}, all hidden until you reveal them)\n-- ---------------------------------------------------------------------------")
        w(f"{c},\nlinks(entry_title, target_title) AS (VALUES\n{vals}\n)\nINSERT INTO public.{table} (lore_entry_id, {col})\nSELECT e.id, t.id\nFROM links l CROSS JOIN c\nJOIN public.the8_lore_entries e ON e.campaign_id = c.id AND e.title = l.entry_title\nJOIN public.the8_lore_entries t ON t.campaign_id = c.id AND t.title = l.target_title AND t.category = '{cat}'\nON CONFLICT (lore_entry_id, {col}) DO NOTHING;")

    links(fac, 'the8_lore_entry_factions', 'faction_entry_id', 'factions', 'FACTION LINKS')
    links(loc, 'the8_lore_entry_locations', 'location_entry_id', 'locations', 'LOCATION LINKS')

    n += 1
    w(f"\n-- ---------------------------------------------------------------------------\n-- {n}. QUESTS  ({len(quests)}, in rough story order)\n-- ---------------------------------------------------------------------------")
    vals = ",\n".join(f"  ({q(x['title'],'t')}, {x['sort']}, {x['gold']}, {nul(x['other'],'o')}, {nul(x['gm'],'g')})" for x in quests)
    w(f"{c},\nseed(title, sort_order, reward_gold, reward_other, gm_notes) AS (VALUES\n{vals}\n)\nINSERT INTO public.the8_quests (campaign_id, title, status, sort_order, reward_gold, reward_other, gm_notes, is_secret)\nSELECT c.id, s.title, 'available', s.sort_order, s.reward_gold, s.reward_other, s.gm_notes, true\nFROM seed s CROSS JOIN c\nWHERE NOT EXISTS (SELECT 1 FROM public.the8_quests x WHERE x.campaign_id = c.id AND x.title = s.title);")
    bvals = ",\n".join(f"  ({q(x['title'],'t')}, {i}, {q(b,'b')})" for x in quests for i, b in enumerate(x['blocks']) if b.strip())
    w(f"{c},\nseed(title, sort_order, body) AS (VALUES\n{bvals}\n)\nINSERT INTO public.the8_reveal_blocks (campaign_id, quest_id, body, is_revealed, sort_order)\nSELECT c.id, x.id, s.body, false, s.sort_order\nFROM seed s CROSS JOIN c\nJOIN public.the8_quests x ON x.campaign_id = c.id AND x.title = s.title\nWHERE NOT EXISTS (SELECT 1 FROM public.the8_reveal_blocks b WHERE b.quest_id = x.id);")

    n += 1
    vals = ",\n".join(f"  ({q(d,'w')}, {q(t,'t')}, {q(x,'d')}, {s})" for d, t, x, s in timeline)
    w(f"\n-- ---------------------------------------------------------------------------\n-- {n}. TIMELINE  ({len(timeline)})\n-- ---------------------------------------------------------------------------")
    w(f"{c},\nseed(event_date, title, description, sort_order) AS (VALUES\n{vals}\n)\nINSERT INTO public.the8_timeline_events (campaign_id, event_date, title, description, sort_order, is_secret)\nSELECT c.id, s.event_date, s.title, s.description, s.sort_order, true\nFROM seed s CROSS JOIN c\nWHERE NOT EXISTS (SELECT 1 FROM public.the8_timeline_events x WHERE x.campaign_id = c.id AND x.title = s.title);")
    w(f"""
COMMIT;

-- ============================================================================
-- Check (run separately):
--   SELECT category, count(*) FROM the8_lore_entries
--   WHERE campaign_id = (SELECT id FROM campaigns WHERE slug = '{slug}')
--   GROUP BY category ORDER BY category;
-- ============================================================================""")
    return "\n".join(out) + "\n"


def sql_list(titles, tag):
    return "(" + ", ".join(q(t, tag) for t in titles) + ")"


def main():
    print('module ->', write_module())
    entries, fac, loc, quests, timeline = eve_content()
    head = """-- ============================================================================
-- Eve of Giants — campaign site seed
-- Lost Mine of Phandelver (levels 1–5) → Storm King's Thunder (5–11)
-- → Vecna: Eve of Ruin (10/11–20), following "Eve of Giants - Campaign Guide".
--
-- Act I is the Lost Mine library module (Phandelver and Below, chapters 1–4), written as
-- reveal blocks, plus this campaign's seeds. Acts II and III are one block per entry for now.
-- "(ours)" in GM notes marks our additions; OPTIONAL marks book content the guide skips.
--
-- Everything starts hidden. Make an entry visible when the party meets it, then reveal its
-- blocks and links as they learn more.
--
-- Needs progressive_reveal.sql first. Safe to re-run: it only adds what's missing and never
-- touches anything you've edited.
-- ============================================================================
"""
    sql = seed_sql('eve-of-giants', 'Eve of Giants', entries, fac, loc, quests, timeline, head)
    open(os.path.join(ROOT, 'eve_of_giants_seed.sql'), 'w').write(sql)

    legacy = json.load(open(os.path.join(HERE, 'eve', 'legacy_lost_mine_titles.json')))
    lm_titles = [e['title'] for e in LM.ENTRIES]
    del_lore = sorted(set(legacy['lore']) | set(lm_titles))
    del_quests = sorted(set(legacy['quests']) | {x['title'] for x in LM.QUESTS})
    del_tl = sorted(set(legacy['timeline']) | {t[1] for t in LM.TIMELINE})
    pre = f"""-- Remove the old Lost Mine part of Eve of Giants (lore, quests, timeline), so the module
-- version below replaces it. Storm King's Thunder and Eve of Ruin entries are not touched;
-- their links to Lost Mine entries are re-made further down.
DELETE FROM public.campaign_pins p USING public.the8_lore_entries e
 WHERE p.kind = 'lore' AND p.item_id = e.id AND e.campaign_id = (SELECT id FROM public.campaigns WHERE slug = 'eve-of-giants')
   AND e.title IN {sql_list(del_lore, 'x')};
DELETE FROM public.the8_lore_entries
 WHERE campaign_id = (SELECT id FROM public.campaigns WHERE slug = 'eve-of-giants')
   AND title IN {sql_list(del_lore, 'x')};
DELETE FROM public.the8_quests
 WHERE campaign_id = (SELECT id FROM public.campaigns WHERE slug = 'eve-of-giants')
   AND title IN {sql_list(del_quests, 'x')};
DELETE FROM public.the8_timeline_events
 WHERE campaign_id = (SELECT id FROM public.campaigns WHERE slug = 'eve-of-giants')
   AND title IN {sql_list(del_tl, 'x')};
"""
    rhead = """-- ============================================================================
-- Eve of Giants — swap in the remade Lost Mine (Act I)
--
-- For a campaign that already ran eve_of_giants_seed.sql (the old version). Deletes the old
-- Lost Mine entries, quests and timeline events, then adds the Lost Mine library module as
-- reveal blocks, plus this campaign's seeds. Acts II and III stay as they are.
--
-- Anything you revealed or edited in Eve's Lost Mine entries is lost; run it before session 1.
-- Needs progressive_reveal.sql first. Run once, in the Supabase SQL editor.
-- ============================================================================
"""
    rsql = seed_sql('eve-of-giants', 'Eve of Giants', entries, fac, loc, quests, timeline, rhead, pre)
    open(os.path.join(ROOT, 'eve_of_giants_lost_mine_remake.sql'), 'w').write(rsql)
    from collections import Counter
    print(Counter(e['category'] for e in entries), 'entries', len(entries), 'blocks', sum(len(e['blocks']) for e in entries),
          'quests', len(quests), 'fac', len(fac), 'loc', len(loc), 'timeline', len(timeline), 'bytes', len(sql), len(rsql))


if __name__ == '__main__':
    main()

def L(cat, title, desc, gm, habitat=None):
    return dict(category=cat, title=title, description=desc, gm_notes=gm, habitat=habitat)

def Q(title, desc, sort, gold=0, other='', gm=''):
    return dict(title=title, description=desc, status='available', sort=sort, gold=gold, other=other, gm=gm)

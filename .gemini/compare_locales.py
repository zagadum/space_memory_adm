import json

files = ['src/locales/ru.json', 'src/locales/uk.json', 'src/locales/pl.json', 'src/locales/en.json']
data = {}

for f in files:
    with open(f, 'r') as jf:
        data[f] = json.load(jf).get('newGroups', {})

all_keys = set()
for f in files:
    def get_keys(d, prefix=''):
        keys = set()
        for k, v in d.items():
            if isinstance(v, dict):
                keys.update(get_keys(v, prefix + k + '.'))
            else:
                keys.add(prefix + k)
        return keys
    all_keys.update(get_keys(data[f]))

for f in files:
    f_keys = set()
    def get_keys(d, prefix=''):
        keys = set()
        for k, v in d.items():
            if isinstance(v, dict):
                keys.update(get_keys(v, prefix + k + '.'))
            else:
                keys.add(prefix + k)
        return keys
    f_keys = get_keys(data[f])
    missing = all_keys - f_keys
    if missing:
        print(f"Missing in {f}: {sorted(list(missing))}")
    else:
        print(f"No missing keys in {f}")

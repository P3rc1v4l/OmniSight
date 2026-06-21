# Graphalion – Graph-Bericht

## Überblick

- Knoten gesamt: **1005**
- Kanten gesamt: **3657**

## Zentrale Knoten (God-Nodes)

- `get` — 166
- `$state` — 106
- `set` — 98
- `src\routes\+page.svelte` — 95
- `src\lib\components\SettingsModal.svelte` — 94
- `src\routes\+layout.svelte` — 93
- `run` — 84
- `update` — 83
- `src\routes\watchlist\+page.svelte` — 75
- `filter` — 72

## Importzyklen

- 253 → 276

## Cluster (Communities)

- Cluster 0: 223
- Cluster 1: 222
- Cluster 2: 173
- Cluster 3: 158
- Cluster 4: 82
- Cluster 5: 43
- Cluster 6: 23
- Cluster 7: 18
- Cluster 8: 11
- Cluster 9: 9
- Cluster 10: 8
- Cluster 11: 7
- Cluster 12: 7
- Cluster 13: 5
- Cluster 14: 5
- Cluster 15: 4
- Cluster 16: 3
- Cluster 17: 1
- Cluster 18: 1
- Cluster 19: 1
- Cluster 20: 1

## Unsichere Kanten (zur Review)

- 2744

## Vorschlagsfragen

- Why does 'get' have so many connections — is it over-coupled?
- There are 1 import/use cycles — can any be broken?
- 2744 edges are AMBIGUOUS — which call targets are unresolved?
- Do the detected clusters match the intended module boundaries?

---
_Erzeugt von Graphalion · ALERION Studios_
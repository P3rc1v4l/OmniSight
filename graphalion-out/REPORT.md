# Graphalion – Graph-Bericht

## Überblick

- Knoten gesamt: **963**
- Kanten gesamt: **3512**

## Zentrale Knoten (God-Nodes)

- `get` — 159
- `$state` — 97
- `set` — 97
- `src\routes\+page.svelte` — 95
- `src\lib\components\SettingsModal.svelte` — 94
- `src\routes\+layout.svelte` — 91
- `run` — 84
- `update` — 81
- `src\routes\watchlist\+page.svelte` — 70
- `src\lib\components\WrappedModal.svelte` — 68

## Importzyklen

- 276 → 253

## Cluster (Communities)

- Cluster 0: 221
- Cluster 1: 193
- Cluster 2: 153
- Cluster 3: 139
- Cluster 4: 53
- Cluster 5: 44
- Cluster 6: 43
- Cluster 7: 23
- Cluster 8: 21
- Cluster 9: 20
- Cluster 10: 18
- Cluster 11: 9
- Cluster 12: 7
- Cluster 13: 7
- Cluster 14: 5
- Cluster 15: 3
- Cluster 16: 1
- Cluster 17: 1
- Cluster 18: 1
- Cluster 19: 1

## Unsichere Kanten (zur Review)

- 2653

## Vorschlagsfragen

- Why does 'get' have so many connections — is it over-coupled?
- There are 1 import/use cycles — can any be broken?
- 2653 edges are AMBIGUOUS — which call targets are unresolved?
- Do the detected clusters match the intended module boundaries?

---
_Erzeugt von Graphalion · ALERION Studios_
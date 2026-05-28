# But

Outil de visualisation/étude des données de transport ouvertes du gouvernement français (transport.data.gouv.fr).

# Stack

- React + TypeScript, SPA, desktop only, pas de back-end
- Données : fetch live sur `https://transport.data.gouv.fr/api/datasets` (tout en une seule réponse, pas de pagination)
- Fallback dev : `datasets.json` local
- **Pas de chargement automatique** : un bouton "Charger les données" déclenche le fetch

# Structure du projet

```
analyse_pan/
  app/           ← application React/TS (Vite)
    src/
      components/
      types/
      utils/
    public/
      datasets.json   ← copie locale pour dev
```

# Données — logique de filtrage

## Ce qu'on garde

Un dataset est **retenu** s'il possède **au moins une ressource GTFS valide** :

- `format === "GTFS"` ET `is_available === true` ET `features` non vide

Les ressources `gtfs-rt` valides (`is_available === true` + `features` non vide) sont un bonus affiché en plus, jamais une condition d'inclusion.

Les datasets sans aucune ressource GTFS valide sont ignorés.

## Ressources GTFS (toutes affichées, pas seulement la première)

Pour chaque ressource GTFS valide d'un dataset :

- `title` de la ressource
- `features` (toutes, pas de filtre sur la liste)
- `metadata.has_shapes` → true/false
- `metadata.modes` → liste (bus, rail, tramway, subway, ferry, air, cable_car, coach, funicular, gondola)
- `metadata.start_date` + `metadata.end_date` + calcul du nombre de jours de validité
- `metadata.stats.trips_count === 0` → warning visible

## Ressources gtfs-rt (affichées pour chaque dataset qui en a)

Pour chaque ressource gtfs-rt valide :

- `title` de la ressource
- Présence de `trip_updates` (temps réel horaires)
- Présence de `service_alerts` (messages conjoncturels)
- Présence de `vehicle_positions` (position temps réel)

# Filtres (panneau latéral ou bandeau supérieur)

1. **Recherche texte** : sur `title` du dataset et `publisher.name`
2. **Publisher** : liste déroulante multi-sélection
3. **Features GTFS** : cases à cocher (toutes les features présentes dans les données)
4. **Modes de transport** : cases à cocher (bus, rail, tramway, subway, ferry, air, cable_car, coach, funicular, gondola)
5. **gtfs-rt disponible** : toggle (oui / indifférent)
6. **vehicle_positions disponible** : toggle
7. **has_shapes** : toggle
8. **trips_count = 0** : toggle "ne montrer que les problématiques" (bonus)

# Idées supplémentaires (issues de l'analyse des données)

- **Badge "⚠ trips=0"** visible directement dans la liste sans avoir à ouvrir le détail
- **Compteur de résultats** visible en permanence après filtre
- **Indicateur de fraîcheur** : coloration selon que `end_date` est dans le futur (valide), proche (< 30j) ou passé (expiré)
- **Filtre zone géographique** : les datasets ont un champ `covered_area` avec type (commune, département, EPCI, région, pays) — permettrait de filtrer par échelon ou de chercher par nom de territoire
- **Licence** : filtre optionnel (lov2, odc-odbl, fr-lo, mobility-licence, notspecified)
- **Export CSV** des datasets filtrés (titre, publisher, modes, features, dates)

# Vues

Sélecteur de vue 3 modes, filtres partagés entre les vues :

1. **Cards** — cartes détaillées paginées (vue initiale)
2. **Tableau condensé** — une ligne par dataset, toutes infos compressées, tri par colonne, non paginé
3. **Statistiques** — graphiques recharts (répartition modes, features, fraîcheur, couverture RT, top publishers, échelon géo)

# Todos

1. ✅ Scaffolding Vite + React + TypeScript
2. ✅ Types TypeScript depuis la structure JSON
3. ✅ Composant de chargement (bouton + état loading/error)
4. ✅ Logique de filtrage/transformation des données
5. ✅ Composant liste principale
6. ✅ Composant carte/ligne de dataset (GTFS + gtfs-rt)
7. ✅ Panneau de filtres
8. ✅ Indicateur de fraîcheur des dates
9. ✅ Badge warnings (trips=0)
10. ✅ Export CSV
11. Installer recharts
12. Sélecteur de vue
13. Vue tableau condensée (tri, non paginé)
14. Vue statistiques (recharts)

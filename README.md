# pan-gtfs-explore

Outil de visualisation et d'exploration des données de transport ouvertes du gouvernement français, issues de [transport.data.gouv.fr](https://transport.data.gouv.fr).

> **Transparence** : la quasi-totalité du code de ce projet a été écrite par GitHub Copilot (agent IA). L'humain a défini les specs, orienté les choix et validé le résultat.

## Description

Application web SPA (desktop) permettant d'explorer les jeux de données GTFS disponibles sur le portail national des données de transport. Elle récupère les données en direct via l'API publique, les filtre, les présente sous plusieurs vues et permet de les exporter.

## Fonctionnement

1. **Chargement automatique** : au démarrage, l'application vérifie un cache IndexedDB local.
   - **Cache frais (< 24h)** : les données sont affichées instantanément depuis le cache.
   - **Cache périmé (> 24h)** : les données du cache s'affichent immédiatement, puis un téléchargement en arrière-plan met à jour le cache silencieusement.
   - **Pas de cache** : un téléchargement depuis l'API publique se lance avec une barre de progression.
2. **API** : `https://transport.data.gouv.fr/api/datasets` (réponse unique, pas de pagination).
3. **Filtrage** : seuls les datasets possédant au moins une ressource GTFS valide (`format === "GTFS"`, `is_available === true`, `features` non vide) sont conservés.

## Vues

| Vue              | Description                                                                   |
| ---------------- | ----------------------------------------------------------------------------- |
| **Cards**        | Cartes détaillées paginées (vue par défaut)                                   |
| **Tableau**      | Une ligne par dataset, tri par colonne, non paginé                            |
| **Statistiques** | Graphiques recharts (modes, features, fraîcheur, RT, publishers, échelon géo) |

## Filtres disponibles

- Recherche texte (titre du dataset, nom du publisher)
- Publisher (liste déroulante multi-sélection)
- Features GTFS (cases à cocher)
- Modes de transport (bus, rail, tramway, subway, ferry, air, cable_car, coach, funicular, gondola)
- Disponibilité gtfs-rt, vehicle_positions, has_shapes
- Datasets avec `trips_count = 0` (données potentiellement problématiques)

## Informations affichées par dataset

Pour chaque ressource GTFS valide : titre, features, `has_shapes`, modes, dates de validité + nombre de jours, warning si `trips_count = 0`.

Pour chaque ressource gtfs-rt valide : titre, présence de `trip_updates`, `service_alerts`, `vehicle_positions`.

## Stack technique

- **React 19** + **TypeScript** + **Vite**
- **Recharts** pour les graphiques
- **IndexedDB** pour le cache local (TTL 24h)
- SPA, desktop uniquement, sans back-end
- Aucune dépendance d'état global (hooks locaux)

## Lancer le projet

```bash
npm install
npm run dev
```

```bash
npm run build   # build de production
npm run preview # prévisualisation du build
```

## Licence

[WTFPL](./LICENSE) — Do What The Fuck You Want To Public License

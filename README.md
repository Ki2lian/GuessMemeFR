# Devine le mème

**Devine le mème** est un jeu web francophone où il faut identifier un mème avant que son image ne soit totalement révélée.

Le projet propose deux modes de jeu :

- **Classique** : une partie de dix manches reproductible à partir d’une seed ;
- **Défi du jour** : un même mème, un même effet et une même seed pour toute la communauté pendant une journée.

Le code est open source et public. Le projet a été vibecodé par [Ki2lian](https://ki2lian.fr) avec l’assistance de Codex (OpenAI).

## Fonctionnalités

- Connexion Discord uniquement avec Better Auth ;
- rôles `user`, `editor` et `admin` ;
- catalogue de mèmes et back-office avec gestion des médias ;
- réponses canoniques et alias normalisés ;
- cinq effets de révélation Canvas ;
- statistiques de parties classiques et de défis quotidiens ;
- audit des connexions et gestion des sessions ;
- interface française, thème clair/sombre et pages d’erreur dédiées.

## Stack technique

- [Next.js 16](https://nextjs.org/) et [React 19](https://react.dev/) ;
- TypeScript, Tailwind CSS et composants shadcn/ui ;
- [Prisma ORM](https://www.prisma.io/) avec MySQL ou MariaDB ;
- [Better Auth](https://www.better-auth.com/) et OAuth Discord ;
- [Sharp](https://sharp.pixelplumbing.com/) pour le traitement local des images ;
- pnpm et Vitest.

## Prérequis

- Node.js **20.19+** ;
- pnpm **12** ;
- une base MySQL ou MariaDB ;
- une application Discord OAuth ;
- un répertoire inscriptible et persistant pour les médias en production.

## Installation

```bash
git clone https://github.com/Ki2lian/GuessMemeFR.git
cd GuessMemeFR
pnpm install
```

Dupliquez ensuite le modèle de variables d’environnement et renommez-le en `.env` :

```bash
# macOS / Linux
cp .env.example .env

# PowerShell
Copy-Item .env.example .env
```

Renseignez les valeurs décrites ci-dessous, puis générez le client Prisma et appliquez les migrations déjà versionnées :

```bash
pnpm db:generate
pnpm db:deploy
```

Enfin, démarrez l’application :

```bash
pnpm dev
```

Le serveur de développement utilise HTTPS et est disponible sur `https://localhost:3000` par défaut.

## Variables d’environnement

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | URL de connexion à la base applicative MySQL/MariaDB. |
| `SHADOW_DATABASE_URL` | URL d’une base distincte, utilisée par Prisma lors de `pnpm db:migrate`. |
| `NODE_ENV` | Environnement d’exécution, par exemple `development` ou `production`. |
| `BETTER_AUTH_SECRET` | Secret long et aléatoire utilisé par Better Auth. Ne le divulguez jamais. |
| `BETTER_AUTH_URL` | URL publique de l’application, par exemple `https://localhost:3000` en développement. |
| `DISCORD_CLIENT_ID` | Identifiant OAuth de l’application Discord. |
| `DISCORD_CLIENT_SECRET` | Secret OAuth de l’application Discord. |
| `PROTECTED_ADMIN_DISCORD_ID` | Facultatif. Identifiant Discord du compte protégé contre les modifications de rôle et les bannissements. |
| `MEDIA_STORAGE_PATH` | Chemin absolu du répertoire où sont conservées les images importées. Obligatoire pour importer des médias. |

Ajoutez également l’URL suivante aux URI de redirection de votre application Discord :

```text
https://votre-domaine.tld/api/auth/callback/discord
```

Adaptez le domaine à la valeur de `BETTER_AUTH_URL`. Le fichier `.env` contient des secrets : ne le versionnez jamais.

## Base de données et migrations

Utilisez les commandes suivantes selon le contexte :

| Commande | Usage |
| --- | --- |
| `pnpm db:generate` | Génère le client Prisma après une modification du schéma. |
| `pnpm db:migrate --name nom_de_la_migration` | Crée et applique une migration pendant le développement. |
| `pnpm db:deploy` | Applique les migrations existantes, notamment en production. |

Une migration doit être relue et versionnée avec le code qui l’utilise.

## Stockage des médias

Les images du catalogue ne sont ni placées dans `public/`, ni intégrées au build Next.js. Définissez un répertoire persistant hors du dépôt et du répertoire de déploiement :

```env
MEDIA_STORAGE_PATH="/var/lib/guess-meme/media"
```

L’application accepte les JPEG, PNG et WebP de moins de **900 Kio**, avec une dimension maximale de **4 096 px** par côté. Chaque image est validée, orientée correctement, convertie en WebP (qualité 85), nommée avec un UUID et associée à son hash SHA-256 pour éviter les doublons.

Les médias sont servis par l’endpoint interne `/api/media/[storageKey]` avec un cache long. Sauvegardez ce répertoire en même temps que la base de données : une base restaurée sans ses fichiers rendrait les mèmes incomplets. Les fichiers encore référencés par une seed classique ou un défi quotidien sont conservés afin de préserver les parties historiques.

## Commandes utiles

| Commande | Description |
| --- | --- |
| `pnpm dev` | Lance Next.js en développement avec Turbopack et HTTPS. |
| `pnpm build` | Produit le build de production. |
| `pnpm start` | Lance le build de production. |
| `pnpm lint` | Exécute ESLint. |
| `pnpm test` | Exécute les tests Vitest. |

## Déploiement

Avant de lancer `pnpm build`, vérifiez que toutes les variables d’environnement de production sont renseignées, que la base est accessible et que `MEDIA_STORAGE_PATH` pointe vers un volume persistant accessible en lecture et en écriture par le processus Node.js.

Lors d’un déploiement, appliquez les migrations avec `pnpm db:deploy`, puis construisez et démarrez l’application :

```bash
pnpm db:deploy
pnpm build
pnpm start
```

## Contributions

Les retours, issues et propositions d’amélioration sont les bienvenus. Avant une contribution, lancez au minimum :

```bash
pnpm lint
pnpm test
```

## Contact

- Site : [ki2lian.fr](https://ki2lian.fr)
- Discord : [ki2lian](https://discord.com/users/253176119921082369)
- X / Twitter : [@ki2lianm](http://x.com/ki2lianm)

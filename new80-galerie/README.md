# NEW80 — Galerie photo

Site où les clients de NEW80 retrouvent et enregistrent les photos des soirées. Il remplace l'ancien lien Google Drive.

- **Public** : `/` (dernière soirée + liste des précédentes), `/soiree/[slug]` (grille + visionneuse plein écran, bouton Enregistrer).
- **Admin** : `/admin` (réservé à l'équipe) pour créer une soirée, uploader les photos, publier ou dépublier, supprimer une photo.

## Stack

| Rôle | Service | Offre |
|---|---|---|
| Site (Next.js 15, App Router, Tailwind 4) | Cloudflare Workers via OpenNext | Gratuit, usage commercial autorisé |
| Base de données + comptes admin | Supabase | Gratuit |
| Stockage des images | Cloudflare R2 | Gratuit jusqu'à 10 Go, sans frais de sortie |

> Cloudflare a remplacé l'adaptateur Next.js pour Pages (`next-on-pages`, abandonné) par **OpenNext sur Workers**. Le déploiement se fait donc en « Worker », depuis le même compte et le même dashboard, avec la même offre gratuite.

### Images

Chaque photo est convertie **dans le navigateur de l'admin**, avant l'envoi, en deux versions :

- `…-600.webp` : vignette ~600 px pour la grille (repli JPEG si le navigateur ne sait pas encoder en WebP, c'est le cas de Safari) ;
- `…-2000.jpg` : ~2000 px, JPEG qualité 85, pour la visionneuse et l'enregistrement.

La pleine résolution n'est jamais stockée. Une couleur moyenne est enregistrée pour chaque photo et sert de fond pendant le chargement.

---

## 1. Comptes à créer (à transférer au club)

Chaque compte doit être créé avec une adresse mail **du club** (ex. `web@new80.fr`), jamais une adresse personnelle.

1. **GitHub** : dépôt du code.
2. **Cloudflare** : site + R2 + DNS du domaine.
3. **Supabase** : base + authentification.

## 2. Supabase

1. Créer un projet (région `eu-west`, Paris ou Francfort).
2. **SQL Editor** : coller puis exécuter `supabase/schema.sql`.
3. **Authentication > Sign In / Providers** : laisser Email activé et **désactiver « Allow new users to sign up »**.
4. **Authentication > Users > Invite user** pour chaque membre de l'équipe, puis dans le SQL Editor :
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'prenom@new80.fr';
   ```
   Pour retirer un accès : `delete from public.admins where user_id = (select id from auth.users where email = '…');`
5. **Authentication > URL Configuration** : Site URL = `https://photos.new80.fr`.
6. **Project Settings > API** : récupérer `Project URL` et la clé `anon public`.

## 3. Cloudflare R2

1. **R2 > Create bucket** : `new80-photos`.
2. **Settings > Public access > Custom domain** : brancher `img.new80.fr`. C'est l'adresse publique des images, à mettre dans `NEXT_PUBLIC_R2_PUBLIC_URL`.
3. **Settings > CORS policy** :
   ```json
   [
     {
       "AllowedOrigins": ["https://photos.new80.fr", "http://localhost:3000"],
       "AllowedMethods": ["GET", "PUT", "HEAD"],
       "AllowedHeaders": ["content-type", "cache-control"],
       "MaxAgeSeconds": 86400
     }
   ]
   ```
   Le `GET` sert au bouton Enregistrer, qui récupère le fichier pour la feuille de partage iOS. Le `PUT` sert à l'upload admin.
4. **R2 > Manage API tokens > Create API token** : droits *Object Read & Write* limités au bucket. Récupérer `Access Key ID`, `Secret Access Key` et l'`Account ID`.
5. (Recommandé) **Caching > Cache Rules** sur `img.new80.fr` : « Eligible for cache », Edge TTL 1 an. Les noms de fichiers sont uniques et ne changent jamais.

## 4. Variables d'environnement

Copier `.env.example` en `.env.local` pour le développement. En production, les déclarer dans Cloudflare (étape 5).

| Variable | Type | Exemple |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | build + runtime | `https://photos.new80.fr` |
| `NEXT_PUBLIC_REMOVAL_EMAIL` | build + runtime | `contact@new80.fr` (reçoit les demandes de retrait) |
| `NEXT_PUBLIC_SUPABASE_URL` | build + runtime | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | build + runtime | clé `anon public` |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | build + runtime | `https://img.new80.fr` |
| `R2_ACCOUNT_ID` | runtime | ID du compte Cloudflare |
| `R2_BUCKET` | runtime | `new80-photos` |
| `R2_ACCESS_KEY_ID` | **secret** | |
| `R2_SECRET_ACCESS_KEY` | **secret** | |

Les variables `NEXT_PUBLIC_*` sont intégrées au moment du build : il faut les déclarer **à la fois** en variables de build et en variables d'exécution. La clé `anon` peut être publique, c'est la sécurité RLS de la base qui protège les données. Les deux clés R2 ne doivent jamais apparaître côté client.

## 5. Déploiement

### Automatique (recommandé)
1. Cloudflare > **Workers & Pages > Create > Import a repository** : choisir le dépôt GitHub.
2. Build command : `npx opennextjs-cloudflare build`. Deploy command : `npx opennextjs-cloudflare deploy`.
3. **Settings > Variables and Secrets** : ajouter les variables d'exécution et les secrets. **Settings > Build > Variables** : ajouter les `NEXT_PUBLIC_*`.
4. **Settings > Domains & Routes** : ajouter `photos.new80.fr`.

Chaque push sur `main` redéploie ensuite le site.

### Manuel
```bash
npm install
npx wrangler login
npx wrangler secret put R2_ACCESS_KEY_ID
npx wrangler secret put R2_SECRET_ACCESS_KEY
npm run deploy          # build + mise en ligne
```

### Développement local
```bash
npm install
cp .env.example .env.local   # puis remplir
npm run dev                  # http://localhost:3000
npm run preview              # test dans le runtime Cloudflare
```

## 6. Utilisation (équipe)

1. `/admin` → se connecter.
2. **Nouvelle soirée** : nom, date, couleur (rouge, bleu, or ou blanc, comme sur la grille Instagram), artiste si showcase, photo de couverture.
3. Sur la page de la soirée, glisser les 200 à 400 photos. Garder l'onglet ouvert pendant l'envoi. Si des photos échouent, cliquer sur **Relancer les échecs**.
4. **Publier**. Le lien `photos.new80.fr/soiree/…` peut alors aller en bio ou en story.
5. **Demande de retrait** : le client écrit à `NEXT_PUBLIC_REMOVAL_EMAIL` en donnant le numéro affiché dans la visionneuse (« 12 / 312 »). Dans l'admin, la vignette porte le même numéro : cliquer **Supprimer**. Le fichier est effacé de R2.

## 7. Personnalisation

- **Logo** : déposer le fichier dans `public/logo.svg` et mettre `LOGO_SRC = '/logo.svg'` dans `components/Logo.tsx`.
- **Police titre officielle** : ajouter la `@font-face` dans `app/globals.css` puis `:root { --font-club: 'Nom de la police'; }`. Tous les titres basculent.
- **Couleurs** : `lib/couleurs.ts` et le bloc `@theme` de `app/globals.css`.

## 8. Arborescence

```
app/
  page.tsx                 accueil
  soiree/[slug]/page.tsx   page soirée + métadonnées OG
  sitemap.ts, robots.ts
  admin/login/             connexion
  admin/(espace)/          pages protégées (liste, soirée)
  admin/actions.ts         actions serveur (créer, publier, supprimer)
  api/admin/presign/       URL signées R2 pour l'upload direct
components/                Gallery, Viewer (swipe + Enregistrer), Logo, admin/*
lib/                       accès données, R2, compression image, formats
supabase/schema.sql        tables, RLS, trigger du compteur
```

## 9. Transfert de propriété (fin de contrat)

1. **GitHub** : Settings > Transfer ownership vers le compte du club, ou ajouter le club en propriétaire de l'organisation.
2. **Cloudflare** : Manage Account > Members, inviter le club en *Super Administrator*, puis se retirer.
3. **Supabase** : Organization > Members, inviter le club en *Owner*, puis se retirer.
4. Régénérer le token R2 et mettre à jour `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`. Retirer les anciens comptes de la table `admins`.
5. Vérifier que `NEXT_PUBLIC_REMOVAL_EMAIL` pointe vers une boîte lue par le club.

**Limites des offres gratuites à surveiller** : un projet Supabase gratuit se met en pause après 7 jours sans aucune requête (le trafic normal du site suffit à l'éviter), et R2 est gratuit jusqu'à 10 Go, soit environ 15 000 photos dans ce format.

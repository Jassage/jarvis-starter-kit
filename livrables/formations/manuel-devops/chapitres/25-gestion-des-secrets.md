<div class="chapitre-titre-num">CHAPITRE 25 · 🟠 AVANCÉ</div>

# Gestion des secrets

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Comprendre précisément ce qu'il ne faut jamais faire avec un mot de passe, une clé API, un jeton ou une clé SSH, et connaître les solutions adaptées à chaque contexte : GitHub Secrets, variables d'environnement, Docker secrets, gestionnaires de secrets dédiés. Ce chapitre ouvre la Partie VIII et rassemble, en une doctrine cohérente, tout ce que les chapitres précédents ont mentionné en passant sur ce sujet.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Depuis le chapitre 7, ce manuel répète une même règle à chaque occasion pertinente : ne jamais commiter de secret. Ce chapitre explique enfin pourquoi cette règle est aussi stricte, ce qui constitue précisément un secret, et surtout **comment** gérer correctement ce qui ne peut techniquement pas être évité — une application a toujours besoin, quelque part, d'un mot de passe de base de données ou d'une clé API.
</div>

## 25.1 Ce qu'il ne faut jamais faire

<div class="encadre attention">
<span class="encadre-titre">⚠️ Les trois erreurs fondamentales, récapitulées</span>

```text
Mot de passe dans Git       →  reste dans l'historique, même après suppression (chapitre 7)
API key dans le code        →  visible par quiconque lit le code source
Secret dans un Dockerfile   →  reste dans les couches de l'image (chapitre 14, section 14.3)
```

Ces trois erreurs partagent un point commun : le secret devient <strong>persistant</strong> dans un endroit conçu pour être partagé, dupliqué et conservé indéfiniment — exactement l'inverse de ce qu'un secret exige.
</div>

<div class="encadre retenir">
<span class="encadre-titre">📌 Ce qui constitue un secret</span>
Mot de passe (base de données, compte administrateur), clé API (service de paiement, envoi d'email, cloud), jeton d'authentification (JWT secret, jeton OAuth), certificat privé (clé TLS, chapitre 16), clé SSH privée (chapitre 6). La règle générale : si sa divulgation permettrait à quelqu'un d'agir à ta place ou d'accéder à des données protégées, c'est un secret.
</div>

## 25.2 GitHub Secrets : le mécanisme déjà utilisé

Le chapitre 8 (section 8.6) et le chapitre 21 (section 21.3) ont déjà introduit ce mécanisme :

```yaml
steps:
  - name: Déployer
    env:
      DATABASE_PASSWORD: ${{ secrets.DATABASE_PASSWORD }}
    run: ./deploy.sh
```

<div class="encadre retenir">
<span class="encadre-titre">📌 Ce que GitHub Secrets garantit, et ce qu'il ne garantit pas</span>
Chiffré au repos, jamais affiché en clair dans les logs (masquage automatique, chapitre 21), accessible uniquement aux workflows du dépôt (pas aux forks externes par défaut). Il ne protège <strong>pas</strong> contre un abus par un collaborateur ayant légitimement accès au dépôt et donc au workflow qui utilise ce secret — la protection porte sur la <em>divulgation externe</em>, pas sur la confiance interne accordée à l'équipe elle-même.
</div>

## 25.3 Variables d'environnement : le mécanisme universel

```bash
# Sur le serveur, jamais dans un fichier versionné
export DATABASE_PASSWORD="valeur-réelle"
```

```bash
# .env (jamais versionné, chapitre 18)
DATABASE_PASSWORD=valeur-réelle
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Lien direct avec les chapitres 5 et 18</span>
Ce mécanisme a déjà été détaillé techniquement au chapitre 5 (section 5.6, avec l'avertissement explicite sur `.bashrc`) et structuré au chapitre 18 (`.env`/`.env.example`) — ce chapitre complète la doctrine plutôt que de répéter la mécanique déjà expliquée.
</div>

## 25.4 Docker secrets

<div class="encadre attention">
<span class="encadre-titre">⚠️ Pourquoi une variable d'environnement Docker n'est pas toujours suffisante</span>
Une variable d'environnement passée à un conteneur (<code>docker run -e SECRET=valeur</code>) reste visible via <code>docker inspect</code> par quiconque a accès au démon Docker, et parfois dans les journaux système. Pour un besoin de sécurité renforcé (notamment en environnement Swarm ou Kubernetes, Partie XIII), Docker propose un mécanisme dédié : les <strong>secrets</strong>, montés comme fichiers plutôt que comme variables.
</div>

```yaml
# Docker Compose avec secrets
services:
  api:
    image: mon-api:1.0.0
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

```javascript
// Lecture dans l'application
const fs = require('fs');
const motDePasse = fs.readFileSync('/run/secrets/db_password', 'utf8').trim();
```

**Explication :** le secret est monté comme un **fichier** en lecture seule dans `/run/secrets/`, jamais comme variable d'environnement visible via `docker inspect` — une couche de protection supplémentaire, particulièrement pertinente à l'échelle d'un cluster (approfondi avec les Secrets Kubernetes au chapitre 41).

## 25.5 Gestionnaires de secrets dédiés

<div class="encadre memoriser">
<span class="encadre-titre">🧠 Pourquoi aller au-delà des mécanismes précédents</span>
À partir d'une certaine échelle (plusieurs services, plusieurs environnements, plusieurs personnes ayant besoin d'accéder à différents secrets avec des permissions différentes), un fichier <code>.env</code> par serveur devient difficile à auditer et à faire tourner (changer un secret compromis). Des outils dédiés — HashiCorp Vault, AWS Secrets Manager, Azure Key Vault — centralisent le stockage, l'accès contrôlé, la rotation et l'audit des secrets.
</div>

| Solution | Caractéristique |
|---|---|
| **HashiCorp Vault** | Open source, auto-hébergeable, très complet (rotation dynamique, chiffrement en transit) |
| **AWS Secrets Manager** | Managé, intégré nativement à l'écosystème AWS (chapitre 40) |
| **Azure Key Vault / GCP Secret Manager** | Équivalents managés pour Azure et GCP |

```bash
# Exemple conceptuel avec Vault (CLI)
vault kv put secret/mon-app/db password="valeur-réelle"
vault kv get secret/mon-app/db
```

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — proportionner l'outil au besoin réel</span>
Pour la majorité des projets de ce manuel (une application, un serveur ou quelques-uns), GitHub Secrets et des fichiers <code>.env</code> bien gérés (sections 25.2 et 25.3) restent largement suffisants. Un gestionnaire de secrets dédié devient pertinent à partir d'une échelle réelle — l'introduire prématurément ajoute de la complexité opérationnelle sans bénéfice proportionné, un principe déjà appliqué à Kubernetes (chapitre 9) et Terraform (chapitre 37).
</div>

## 25.6 Rotation des secrets

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — un secret qui ne change jamais est un risque qui s'accumule</span>
Plus un secret reste inchangé longtemps, plus le nombre de personnes et de systèmes qui y ont eu accès (légitimement ou non) s'accumule dans le temps. La <strong>rotation</strong> — changer régulièrement un secret, ou immédiatement après le départ d'une personne y ayant eu accès — limite la fenêtre d'exposition en cas de fuite non détectée. Ce principe a déjà été appliqué concrètement dans plusieurs projets réels du portefeuille (rotation de refresh tokens, révocation de sessions à la désactivation d'un compte).
</div>

## Atelier — Migrer un secret en clair vers une gestion correcte

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 25.1 — Corriger une fuite de secret volontairement introduite</span>

**Objectif** : reconnaître et corriger un secret mal géré, dans un contexte contrôlé.

**Étapes détaillées** :

1. Dans un dépôt de test (jamais un projet réel), commite volontairement un fichier contenant un faux secret (`API_KEY=fausse-valeur-de-test`).
2. Constate que ce faux secret reste visible dans `git log -p` même après l'avoir supprimé dans un commit suivant (chapitre 7) — la preuve concrète de la persistance dans l'historique.
3. Corrige : déplace la vraie configuration vers `.env` (non versionné), ajoute `.env` à `.gitignore`, crée un `.env.example` avec une valeur factice.
4. Pour un vrai secret ayant fuité en conditions réelles (hors de cet atelier), la correction demande davantage qu'un nouveau commit : **révoquer et régénérer** le secret compromis lui-même (section 25.6) — supprimer le fichier ne suffit jamais, le secret doit être considéré compromis dès l'instant où il a été exposé.

**Résultat attendu** : la compréhension concrète que la correction d'une fuite de secret est une opération en deux temps — nettoyer le dépôt, et surtout invalider le secret exposé lui-même.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Supprimer un secret d'un commit sans le révoquer</span>
Comme démontré dans l'atelier, supprimer un fichier contenant un secret dans un nouveau commit ne le retire pas de l'historique Git — le secret doit être traité comme compromis et remplacé, indépendamment du nettoyage de l'historique.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Un seul secret partagé entre tous les environnements</span>
Réutiliser le même mot de passe de base de données entre développement, staging et production (chapitre 18, section "Sécurité") signifie qu'une fuite dans l'environnement le moins protégé compromet directement la production.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Secrets transmis par des canaux non sécurisés</span>
Partager un mot de passe par email, messagerie instantanée non chiffrée, ou ticket de support, laisse une trace persistante dans des systèmes non conçus pour stocker des secrets — préférer un mécanisme dédié (section 25.5) ou, à défaut, un partage éphémère à usage unique.
</div>

## En entreprise

**Réalité répandue** : les audits de sécurité (souvent menés à l'échelle du portefeuille de projets d'une organisation) recherchent systématiquement des secrets exposés dans l'historique Git — des outils automatisés comme `gitleaks` ou `trufflehog` scannent en continu les dépôts à la recherche de motifs ressemblant à des clés API ou mots de passe.

**Bonne pratique répandue** : les entreprises matures appliquent une politique de rotation régulière (souvent trimestrielle ou semestrielle pour les secrets les plus sensibles) plutôt que d'attendre un incident pour changer un secret ancien.

**Erreur classique observée** : des secrets partagés dans un fichier texte non chiffré sur un poste de travail partagé ou un cloud personnel, en dehors de tout mécanisme dédié — une pratique qui persiste malgré la disponibilité d'outils adaptés, souvent par simple méconnaissance plutôt que par choix délibéré.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Un secret a été commité par erreur puis supprimé dans un commit suivant. Est-ce suffisant ?"**
Réponse attendue : non, le secret reste consultable dans l'historique Git tant que celui-ci n'est pas réécrit (une opération délicate) — la vraie correction consiste à révoquer et régénérer le secret compromis, pas seulement à le retirer du code actuel (section 25.6, atelier 25.1).

**Q2. "Quelle est la différence entre une variable d'environnement Docker et un Docker secret ?"**
Réponse attendue : une variable d'environnement reste visible via `docker inspect` ; un Docker secret est monté comme fichier en lecture seule, offrant une protection supplémentaire, particulièrement pertinente à l'échelle d'un cluster (section 25.4).

**Q3. "Quand recommanderais-tu un gestionnaire de secrets dédié comme Vault plutôt que de simples fichiers `.env` ?"**
Réponse attendue : à partir d'une échelle réelle (plusieurs services, environnements, personnes avec des besoins d'accès différenciés) nécessitant audit, rotation centralisée et contrôle d'accès fin — pas nécessaire pour un projet de taille modeste (section 25.5).
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
La règle centrale de ce chapitre, à appliquer sans exception dans tous les chapitres suivants de ce manuel : jamais de secret dans Git, dans une image Docker, ou transmis par un canal non sécurisé — toujours via un mécanisme dédié adapté au contexte (sections 25.2 à 25.5).
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documente, sans jamais révéler leur valeur, la liste des secrets qu'un projet nécessite et leur usage (dans `.env.example`, chapitre 18) — une personne qui découvre le projet doit savoir quels secrets configurer, sans avoir à deviner en lisant tout le code.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Un gestionnaire de secrets dédié (section 25.5) ajoute une latence réseau à chaque récupération de secret — un compromis à mesurer face au gain de sécurité et d'auditabilité, particulièrement pour des secrets consultés très fréquemment.
</div>

## Résumé du chapitre

- Ne jamais placer un secret dans Git, dans une image Docker, ou le transmettre par un canal non sécurisé — trois erreurs qui rendent un secret persistant et exposé.
- GitHub Secrets, les variables d'environnement (`.env`) et les Docker secrets couvrent la majorité des besoins des projets de ce manuel, chacun avec un niveau de protection différent.
- Un gestionnaire de secrets dédié (Vault, AWS Secrets Manager...) devient pertinent à l'échelle, pas dès le premier projet.
- Un secret exposé doit être révoqué et régénéré, pas seulement supprimé du code actuel.
- La rotation régulière des secrets limite la fenêtre d'exposition en cas de fuite non détectée.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Un secret commité puis supprimé dans un commit ultérieur :
   - a) Disparaît définitivement de tout le projet
   - b) Reste consultable dans l'historique Git tant que celui-ci n'est pas réécrit
   - c) Est automatiquement chiffré par Git
   - d) Bloque tous les commits suivants

2. Un Docker secret, par rapport à une variable d'environnement Docker classique :
   - a) Offre une protection équivalente, aucune différence réelle
   - b) Est monté comme fichier en lecture seule, moins visible via `docker inspect`
   - c) Ne peut être utilisé qu'avec Kubernetes
   - d) Supprime le besoin de tout autre mécanisme de sécurité

3. Un gestionnaire de secrets dédié comme Vault est particulièrement pertinent :
   - a) Pour tout projet, même le plus simple
   - b) À partir d'une échelle réelle (plusieurs services, environnements, accès différenciés)
   - c) Uniquement pour les projets sans aucun secret
   - d) Jamais, ces outils sont obsolètes

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Réutiliser le même mot de passe de base de données entre développement et production est une pratique sûre et recommandée. — **Faux** (section "Erreurs fréquentes", erreur n°2).
2. Un secret exposé doit être révoqué et régénéré, pas seulement retiré du code actuel. — **Vrai** (section 25.6).
3. GitHub Secrets protège contre un abus par un collaborateur ayant légitimement accès au dépôt. — **Faux** (section 25.2).

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 25.1</span>

Une entreprise découvre qu'une clé API de service de paiement a été exposée publiquement pendant trois semaines dans un dépôt GitHub rendu accidentellement public. Liste, dans l'ordre, les actions à entreprendre.
</div>

**Corrigé (exemple de réponse) :** (1) révoquer immédiatement la clé API compromise auprès du fournisseur du service de paiement, sans attendre d'avoir fini d'analyser l'ampleur du problème (section 25.6) ; (2) générer une nouvelle clé et la déployer via un mécanisme adapté (GitHub Secrets ou équivalent, section 25.2), en vérifiant qu'elle n'est stockée nulle part ailleurs en clair ; (3) rendre le dépôt privé si ce n'était pas l'intention initiale, et vérifier s'il a été cloné ou indexé par des outils tiers pendant la période d'exposition ; (4) auditer les journaux du service de paiement pour toute activité suspecte pendant la fenêtre d'exposition de trois semaines ; (5) documenter l'incident (chapitre 2, section 2.3, post-mortem sans blâme) pour comprendre comment la fuite s'est produite et prévenir sa répétition.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais identifier ce qui constitue un secret dans un projet.</li>
<li>☐ Je comprends pourquoi un secret commité reste exposé même après suppression apparente.</li>
<li>☐ Je sais utiliser GitHub Secrets, les fichiers `.env`, et les Docker secrets selon le contexte.</li>
<li>☐ Je sais quand un gestionnaire de secrets dédié devient pertinent, et quand il serait disproportionné.</li>
<li>☐ Je sais qu'un secret exposé doit être révoqué et régénéré, pas seulement retiré du code.</li>
<li>☐ Je comprends l'intérêt de la rotation régulière des secrets.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Comment détecter automatiquement un secret oublié avant de le pousser sur GitHub ?</dt>
<dd>Des outils comme `gitleaks` ou `git-secrets` peuvent s'intégrer comme hook pre-commit (chapitre "En entreprise", Husky déjà mentionné au chapitre 24) pour bloquer un commit contenant un motif ressemblant à un secret, avant même qu'il n'atteigne l'historique local.</dd>

<dt>GitHub détecte-t-il automatiquement les secrets exposés ?</dt>
<dd>Oui, GitHub propose une fonctionnalité de "secret scanning" qui détecte automatiquement de nombreux formats de secrets connus (clés API de fournisseurs reconnus) dans les dépôts publics, et alerte parfois directement le fournisseur du service concerné pour une révocation automatique.</dd>

<dt>Faut-il un secret différent pour chaque service utilisé par une application ?</dt>
<dd>Oui, dans la mesure du possible — un secret unique partagé entre plusieurs usages augmente l'impact d'une fuite et complique sa rotation isolée (principe du moindre privilège, déjà appliqué à travers tout ce manuel).</dd>
</dl>

## Références et pour aller plus loin

- OWASP — "Secrets Management Cheat Sheet" : [https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- HashiCorp Vault — documentation officielle : [https://developer.hashicorp.com/vault](https://developer.hashicorp.com/vault)
- `gitleaks` — détection automatisée de secrets dans un dépôt Git : [https://github.com/gitleaks/gitleaks](https://github.com/gitleaks/gitleaks)
- GitHub — documentation sur le secret scanning : [https://docs.github.com/code-security/secret-scanning](https://docs.github.com/code-security/secret-scanning)

*Chapitre suivant : déploiement sur VPS, guide complet — de la création du serveur jusqu'au monitoring, chaque étape expliquée sans rien laisser d'implicite.*

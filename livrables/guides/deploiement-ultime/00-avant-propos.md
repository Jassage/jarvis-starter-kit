# Avant-propos

## À qui s'adresse ce manuel

À toi si tu sais coder — écrire une application web, une API, un site — mais que tu n'as **jamais** mis cette application en ligne toi-même sur un vrai serveur. Tu as peut-être déjà utilisé Vercel, Netlify ou un hébergement mutualisé où tout est automatique. Ici, on part de l'autre extrême : une machine Linux vide, sans rien dessus, et on construit une compréhension complète, étape par étape, jusqu'à être capable de faire tourner n'importe quelle application dessus, de la sécuriser, de la maintenir, et de réparer les pannes seul.

Aucun prérequis en administration système n'est supposé. Chaque terme technique est défini la première fois qu'il apparaît.

## Objectif final

À la fin de ce manuel, tu dois être capable, **seul, sans autre documentation** :

- de comprendre ce qu'est un serveur et comment il diffère d'un ordinateur personnel ;
- de naviguer et d'administrer un système Linux en ligne de commande ;
- de louer, recevoir et sécuriser un serveur neuf de A à Z ;
- d'installer n'importe quel langage/runtime, base de données, ou outil nécessaire à une application moderne ;
- de déployer un projet réel (React, Next.js, Express, Laravel, Django, peu importe) jusqu'à ce qu'il soit accessible publiquement via un nom de domaine en HTTPS ;
- d'utiliser Docker quand c'est pertinent, et de savoir quand ce ne l'est pas ;
- de configurer Nginx comme reverse proxy, avec plusieurs sites sur le même serveur ;
- de sauvegarder, restaurer, surveiller et faire évoluer un serveur en production ;
- de diagnostiquer et résoudre les pannes les plus courantes sans paniquer.

## Ce que ce manuel n'est pas

Ce n'est pas un manuel de développement d'application — on suppose que ton code existe déjà et fonctionne en local. Ce n'est pas non plus un cours de réseau ou de sécurité informatique avancée (pentest, cryptographie) — on va suffisamment loin pour opérer un serveur en production de façon sérieuse, pas jusqu'au niveau d'un ingénieur sécurité spécialisé.

## Comment ce manuel est construit

Chaque grande partie suit la même structure, empruntée aux manuels de formation professionnelle :

> 🎯 **Objectifs d'apprentissage** — ce que tu sauras faire à la fin de la partie, listé avant de commencer. Sers-t'en pour savoir si tu peux sauter une section que tu maîtrises déjà.

Le corps du texte utilise des encadrés récurrents, toujours avec le même sens :

> 💡 **Analogie** — une comparaison avec quelque chose du quotidien pour ancrer un concept abstrait.

> ✅ **Bonne pratique** — une façon de faire recommandée par l'expérience, au-delà du strict nécessaire pour que "ça marche".

> ⚠️ **Attention** — un risque réel : perte de données, faille de sécurité, panne en production.

> ❌ **Erreur fréquente** — une erreur que font presque tous les débutants à cette étape précise, et pourquoi elle arrive.

> 📌 **À retenir** — un fait qu'il faut garder en mémoire même si le reste de la section s'oublie.

Chaque commande est présentée ainsi :

```bash
commande --option valeur
```
- **Ce que fait chaque partie de la commande**, décomposée mot par mot.
- **La sortie attendue**, pour que tu puisses comparer avec ce que tu vois réellement.
- **Ce que ça signifie si le résultat est différent.**

Chaque partie se termine par :
- 📝 **Résumé** — les idées clés en quelques lignes.
- ✅ **Checklist** — à cocher avant de passer à la suite.
- 🧪 **Mini-labo** — un exercice pratique à faire réellement, pas juste à lire.
- ❓ **FAQ** — les questions que se posent réellement les débutants à ce stade.

## Prérequis matériel et logiciel

- Un ordinateur (Windows, Mac ou Linux) avec accès à un terminal — sur Windows, PowerShell ou Git Bash suffisent amplement pour tout ce manuel.
- Une connexion internet stable.
- Un budget de quelques dollars par mois pour louer un vrai VPS de test le temps de l'apprentissage (la Partie 3 explique les options, y compris les plus économiques). **Rien de tout cela ne peut vraiment s'apprendre sans mettre les mains sur un vrai serveur** — lire ne suffit pas, c'est pour ça que chaque section a un labo pratique.

## Conseil avant de commencer

> ⚠️ **Attention** — La peur la plus commune chez un débutant est de "casser le serveur". C'est en réalité très difficile de causer un dommage irréversible si tu suis les bonnes pratiques de ce manuel (sauvegardes avant toute opération risquée, jamais d'opération destructive sans avoir vérifié deux fois). Et si un VPS de test est vraiment cassé au point d'être irrécupérable : on le détruit et on en recrée un autre en cinq minutes, ça ne coûte rien d'autre que le temps perdu. Utilise cette liberté pour expérimenter sans stress sur un serveur de test avant de toucher à une vraie production.

Passons à la Partie 1.

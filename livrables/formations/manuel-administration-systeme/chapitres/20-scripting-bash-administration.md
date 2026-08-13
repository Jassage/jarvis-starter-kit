<div class="chapitre-titre-num">CHAPITRE 20</div>

# Scripting Bash pour l'administration système

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Transformer les vérifications manuelles répétées des chapitres précédents (état des services, espace disque, contextes SELinux) en scripts Bash fiables, plutôt que de les retaper à chaque fois. À la fin de ce chapitre, tu sauras écrire un script Bash robuste (gestion d'erreurs, quoting correct, journalisation), le planifier automatiquement avec cron, et éviter les pièges de script les plus fréquents et les plus dangereux en administration système.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Depuis plusieurs semaines, chaque matin, tu répètes manuellement la même routine sur les serveurs Linux de l'entreprise : vérifier l'espace disque, l'état des services critiques (Nginx, PostgreSQL, le worker Python), et l'absence de refus SELinux récents. Le DSI, qui a remarqué cette routine quotidienne, te demande : <em>"Est-ce qu'on ne devrait pas automatiser tout ça ? Je préfère que tu passes ton temps sur autre chose que retaper les mêmes dix commandes chaque matin."</em> C'est exactement l'objet de ce chapitre — transformer cette routine manuelle en un script fiable, qui s'exécute automatiquement et t'alerte uniquement quand quelque chose nécessite réellement ton attention.
</div>

## 20.1 Pourquoi scripter : au-delà du simple gain de temps

Automatiser une tâche répétitive n'est pas seulement une question de confort — c'est directement lié à la discipline proactive du chapitre 1 (section 1.4) : un script exécuté automatiquement chaque matin détecte un problème naissant bien plus fiablement qu'une vérification manuelle, sujette à l'oubli, à la fatigue, ou à l'absence ponctuelle de la personne habituellement en charge.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie — la checklist du pilote avant décollage</span>
Un pilote de ligne suit la même checklist avant chaque décollage, qu'il ait 20 ans d'expérience ou 6 mois — non par manque de confiance en sa mémoire, mais parce qu'une checklist systématique élimine le risque d'un oubli ponctuel, même rare, aux conséquences potentiellement graves. Un script d'administration système joue exactement ce rôle : il exécute la même vérification, avec la même rigueur, tous les jours, sans jamais "oublier" une étape par fatigue ou distraction.
</div>

## 20.2 Anatomie d'un script Bash robuste

```bash
#!/usr/bin/env bash
# health-check.sh — Verification quotidienne de sante des serveurs
# Usage : ./health-check.sh

set -euo pipefail
```

<div class="encadre memoriser">
<span class="encadre-titre">🧠 À mémoriser — `set -euo pipefail`, la ligne la plus importante de ce chapitre</span>
Cette ligne, quasiment absente des tutoriels Bash superficiels, change fondamentalement le comportement d'un script :
- <code>-e</code> : arrête immédiatement le script si une commande échoue, plutôt que de continuer aveuglément sur un état déjà incohérent.
- <code>-u</code> : provoque une erreur si une variable non définie est utilisée, plutôt que de la traiter silencieusement comme une chaîne vide (une source fréquente de bugs subtils).
- <code>-o pipefail</code> : fait échouer un pipeline (<code>commande1 | commande2</code>) si N'IMPORTE LAQUELLE des commandes de la chaîne échoue, pas seulement la dernière — sans cette option, une erreur au début d'un pipeline peut passer totalement inaperçue.
</div>

## 20.3 Variables et le piège du word-splitting

```bash
# MAUVAIS : la variable non quotee est sujette au "word splitting"
# (Bash la redecoupe en plusieurs mots si elle contient des espaces)
fichier=$1
if [ -f $fichier ]; then    # dangereux si $fichier contient un espace
    echo "trouve"
fi

# BON : toujours quoter les variables, par reflexe systematique
fichier="$1"
if [ -f "$fichier" ]; then
    echo "trouve"
fi
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Le piège du word-splitting, une source majeure de bugs et de failles</span>
Une variable non quotée dans Bash est redécoupée selon les espaces qu'elle contient — un fichier nommé "rapport final.txt" devient silencieusement deux arguments distincts ("rapport" et "final.txt") pour une commande qui attendait un seul nom de fichier. Ce n'est pas seulement un bug potentiel : dans un script manipulant des noms de fichiers fournis par un utilisateur ou une source externe, ce comportement peut être exploité pour provoquer des actions non prévues. Le réflexe "toujours quoter mes variables" doit devenir systématique, sans exception réfléchie au cas par cas.
</div>

## 20.4 Structures de contrôle appliquées à un cas réel

```bash
# Verifier l'etat de plusieurs services, avec une boucle plutot
# que de repeter la meme verification pour chacun individuellement
services=("nginx" "postgresql" "portail-worker")

for service in "${services[@]}"; do
    if systemctl is-active --quiet "$service"; then
        echo "OK : $service est actif"
    else
        echo "ALERTE : $service n'est PAS actif"
    fi
done
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Explication — `"${services[@]}"` plutôt que `$services`</span>
Pour parcourir correctement un tableau Bash sans risque de word-splitting, la syntaxe complète <code>"${services[@]}"</code> (avec guillemets et crochets) est indispensable — une syntaxe qui semble verbeuse au premier abord, mais qui garantit que chaque élément du tableau est traité comme une unité complète, même s'il contient des espaces.
</div>

## 20.5 Fonctions : rendre un script modulaire et lisible

```bash
verifier_espace_disque() {
    local seuil_alerte=90
    local usage
    usage=$(df / --output=pcent | tail -1 | tr -d '% ')

    if (( usage >= seuil_alerte )); then
        echo "ALERTE : espace disque a ${usage}% (seuil : ${seuil_alerte}%)"
        return 1
    else
        echo "OK : espace disque a ${usage}%"
        return 0
    fi
}
```

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — `local` pour les variables internes à une fonction</span>
Déclarer une variable avec <code>local</code> à l'intérieur d'une fonction évite qu'elle n'entre en conflit avec une variable de même nom ailleurs dans le script — un réflexe simple qui évite des bugs difficiles à diagnostiquer dans des scripts plus longs, où une variable globale modifiée par erreur dans une fonction peut affecter silencieusement le comportement du reste du script.
</div>

## 20.6 Gestion des erreurs et codes de sortie

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — le code de sortie, le langage universel du succès ou de l'échec</span>
Chaque commande Unix retourne un code de sortie : <code>0</code> signifie succès, toute autre valeur (généralement 1 à 255) signifie un échec, avec parfois une signification précise selon la commande. La variable spéciale <code>$?</code> contient le code de sortie de la dernière commande exécutée — un mécanisme fondamental que <code>set -e</code> (section 20.2) exploite automatiquement pour arrêter le script dès qu'une commande échoue.
</div>

```bash
verifier_selinux() {
    local refus
    refus=$(ausearch -m avc -ts recent 2>/dev/null | wc -l)

    if (( refus > 0 )); then
        echo "ALERTE : $refus refus SELinux recents detectes"
        return 1
    fi
    return 0
}
```

## 20.7 Journaliser un script pour garder une trace

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — toujours journaliser un script automatisé</span>
Un script exécuté automatiquement (via cron, section 20.8) qui ne journalise rien devient une boîte noire : impossible de savoir après coup s'il s'est exécuté, quand, et avec quel résultat — exactement le type de lacune de documentation dénoncé au chapitre 3. Chaque exécution doit laisser une trace horodatée, consultable ultérieurement.
</div>

```bash
LOG="/var/log/health-check.log"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG"
}

log "Debut de la verification quotidienne"
```

## 20.8 Planifier l'exécution avec cron

```
# Editer les taches planifiees de l'utilisateur courant
crontab -e

# Exemple : executer le script tous les jours a 7h00 du matin
0 7 * * * /opt/scripts/health-check.sh >> /var/log/health-check-cron.log 2>&1
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Toujours rediriger la sortie d'une tâche cron vers un fichier journal</span>
Une tâche cron s'exécute sans terminal interactif — toute sortie non redirigée est généralement perdue, ou au mieux envoyée par email si le système est configuré pour (rarement le cas par défaut sur un serveur moderne). La redirection <code>>> fichier.log 2>&1</code> capture à la fois la sortie standard et les erreurs, garantissant qu'aucune information n'est silencieusement perdue en cas de problème.
</div>

## 20.9 Le script complet du scénario d'ouverture

```bash
#!/usr/bin/env bash
# health-check.sh — Verification quotidienne de sante des serveurs
set -euo pipefail

LOG="/var/log/health-check.log"
services=("nginx" "postgresql" "portail-worker")
erreurs=0

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG"
}

for service in "${services[@]}"; do
    if systemctl is-active --quiet "$service"; then
        log "OK : $service est actif"
    else
        log "ALERTE : $service n'est PAS actif"
        erreurs=$((erreurs + 1))
    fi
done

usage=$(df / --output=pcent | tail -1 | tr -d '% ')
if (( usage >= 90 )); then
    log "ALERTE : espace disque a ${usage}%"
    erreurs=$((erreurs + 1))
else
    log "OK : espace disque a ${usage}%"
fi

if (( erreurs > 0 )); then
    log "Verification terminee avec $erreurs alerte(s)"
    exit 1
else
    log "Verification terminee, tout est normal"
    exit 0
fi
```

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance — le code de sortie final permet une intégration future</span>
Ce script termine avec <code>exit 1</code> en cas d'alerte et <code>exit 0</code> sinon — un choix qui semble anodin, mais qui permet d'intégrer directement ce script à un outil de supervision externe (Partie 10) capable d'interpréter ce code de sortie pour déclencher une vraie alerte (SMS, email, notification d'équipe), plutôt que de compter sur la lecture manuelle du journal chaque matin.
</div>

## Atelier — Étendre le script de santé

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 20 — Ajouter la vérification SELinux au script</span>

**Objectif** : intégrer la fonction `verifier_selinux` de la section 20.6 au script complet de la section 20.9, en respectant les bonnes pratiques du chapitre.

**Préparation** : accès à un terminal Linux (réel ou de test) pour tester le script, ou une lecture attentive suffit pour cet atelier conceptuel.

**Étapes détaillées** :

1. Intègre la fonction `verifier_selinux` au script complet, en veillant à ce qu'un refus SELinux détecté incrémente également le compteur `erreurs`.
2. Assure-toi que le script respecte toujours `set -euo pipefail` sans provoquer d'arrêt prématuré inattendu (réfléchis à l'effet de `set -e` sur une fonction qui retourne volontairement `1` en cas de détection d'alerte).
3. Teste ton script modifié (ou décris comment tu le testerais) sur un serveur où tu sais qu'aucun service n'est en erreur, pour confirmer qu'il se termine bien avec le code 0.
4. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : l'ajout de `verifier_selinux` suit le même patron que les vérifications existantes — appeler la fonction, capturer son code de retour explicitement (`if ! verifier_selinux; then erreurs=$((erreurs + 1)); fi`) plutôt que de laisser `set -e` arrêter tout le script au premier retour non nul d'une fonction, ce qui empêcherait les vérifications suivantes de s'exécuter. C'est une nuance importante : `set -e` arrête un script sur une commande qui échoue directement, mais une fonction appelée dans une condition `if` ne déclenche pas cet arrêt automatique — un point souvent mal compris qui mérite d'être vérifié explicitement en le testant.

**Dépannage** : si le script s'arrête prématurément dès la première alerte détectée au lieu de continuer les vérifications suivantes, vérifie que chaque appel de fonction pouvant légitimement retourner un code non nul est bien entouré d'une structure conditionnelle (`if`), jamais appelé seul en dehors de toute condition.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — variables non quotées</span>
Rappel de la section 20.3 : la source la plus fréquente de bugs subtils et de failles potentielles dans un script Bash, à corriger par un réflexe systématique de quoting, pas une vérification ponctuelle au cas par cas.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — omettre `set -euo pipefail`</span>
Un script sans cette ligne peut continuer à s'exécuter après une commande échouée, sur un état potentiellement incohérent, sans jamais signaler clairement le problème — une source fréquente de scripts qui "semblent fonctionner" tout en cachant des échecs partiels silencieux.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — coder des secrets en clair directement dans un script</span>
Un mot de passe ou une clé d'API écrit directement dans un script (surtout si ce script est versionné dans un dépôt Git, chapitre 51) l'expose à quiconque a accès au fichier ou à son historique — une pratique à éviter au profit de variables d'environnement ou d'un gestionnaire de secrets dédié, approfondi en Partie 9.
</div>

## Diagnostiquer un script qui échoue de façon inattendue

<div class="encadre attention">
<span class="encadre-titre">🩺 Situation : "Le script fonctionne parfois, mais échoue sans raison apparente d'autres fois"</span>

- **Diagnostic** : ce comportement intermittent trahit souvent une dépendance à un état externe non garanti (un fichier qui n'existe pas toujours, une commande qui se comporte différemment selon le contexte d'exécution — notamment entre une exécution manuelle en terminal interactif et une exécution via cron, dont l'environnement est plus minimal).
- **Comment vérifier** : exécuter le script avec l'option `bash -x nom-du-script.sh`, qui affiche chaque commande réellement exécutée avec les valeurs de variables substituées — un outil de diagnostic bien plus précis que d'ajouter des `echo` manuellement un peu partout dans le script.
- **Résolution** : une fois la commande exacte qui échoue identifiée, vérifier si elle dépend d'une variable d'environnement absente en contexte cron (comme un `PATH` plus restreint que dans un terminal interactif) — une cause extrêmement fréquente de scripts qui "marchent en test mais pas en cron".
</div>

## En entreprise

- **Bonne pratique répandue** : centraliser les scripts d'administration dans un dépôt Git versionné (chapitre 51), avec une revue avant tout changement significatif — un script de production mérite la même rigueur que le code applicatif lui-même.
- **Bonne pratique répandue** : faire évoluer un script de vérification simple comme celui de ce chapitre vers un véritable outil de supervision (Zabbix, Prometheus, Partie 10) dès que les besoins dépassent une simple vérification quotidienne planifiée par cron.
- **Erreur classique observée** : des scripts critiques accumulés au fil des années par différentes personnes, sans convention commune ni documentation, dont plus personne ne comprend entièrement le fonctionnement — rejoignant directement le risque du "bus factor" de 1 évoqué au chapitre 1.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Que fait `set -euo pipefail` au début d'un script Bash, et pourquoi est-ce important ?"**
Réponse attendue : `-e` arrête le script sur une commande échouée, `-u` signale les variables non définies, `-o pipefail` fait échouer un pipeline si n'importe laquelle de ses commandes échoue — ensemble, ces options rendent un script beaucoup plus fiable en évitant qu'il continue silencieusement sur un état incohérent.

**Q2. "Pourquoi faut-il toujours quoter les variables dans un script Bash ?"**
Réponse attendue : une variable non quotée est sujette au word-splitting, redécoupée selon les espaces qu'elle contient — un comportement qui peut causer des bugs subtils (traitement incorrect de noms de fichiers avec espaces) voire des failles de sécurité si la variable provient d'une source externe non maîtrisée.

**Q3. "Comment déboguerais-tu un script Bash qui échoue de façon imprévisible ?"**
Réponse attendue : utiliser `bash -x` pour tracer précisément chaque commande exécutée et les valeurs réelles des variables, et vérifier en priorité les différences d'environnement entre une exécution manuelle en terminal et une exécution automatisée (via cron notamment), une cause très fréquente de comportement intermittent.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Ne jamais coder un secret (mot de passe, clé d'API) en clair dans un script — utiliser des variables d'environnement, un fichier de configuration exclu du contrôle de version (chapitre 51), ou un gestionnaire de secrets dédié selon le contexte (Partie 9).
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Commente chaque script au-delà de l'évidence (pourquoi ce seuil précis, pourquoi cette commande plutôt qu'une autre) et documente-le dans la CMDB (chapitre 3) — un script non documenté, découvert des années plus tard par quelqu'un d'autre, pose exactement les mêmes questions qu'une GPO ou un dépôt tiers non documenté.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Un script de vérification simple planifié par cron (section 20.8) est un excellent point de départ, mais atteint vite ses limites de flexibilité et de visibilité (pas d'historique graphique, pas d'alerte automatique par SMS/email) par rapport à un véritable outil de supervision — sache reconnaître le moment où faire évoluer une solution artisanale vers un outil dédié (Partie 10), plutôt que d'empiler indéfiniment des scripts de plus en plus complexes.
</div>

## Résumé du chapitre

- Automatiser une vérification répétitive via un script réduit le risque d'oubli humain et libère du temps pour des tâches à plus forte valeur ajoutée.
- `set -euo pipefail` en début de script est une pratique quasi systématique en administration système sérieuse.
- Les variables doivent toujours être quotées pour éviter le piège du word-splitting, une source fréquente de bugs et de risques de sécurité.
- Les fonctions avec `local` rendent un script modulaire et évitent les conflits de variables.
- Un script automatisé doit toujours journaliser ses actions et son résultat, avec un code de sortie exploitable par un outil externe.
- `cron` planifie l'exécution automatique d'un script, avec une redirection systématique de sa sortie vers un journal.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. `set -e` dans un script Bash provoque :
   - a) L'arrêt du script dès qu'une commande échoue
   - b) L'exécution du script en mode silencieux
   - c) L'affichage de chaque commande avant son exécution
   - d) La désactivation des variables d'environnement

2. Le piège du "word-splitting" concerne :
   - a) Les commentaires mal formatés
   - b) Les variables non quotées, redécoupées selon les espaces qu'elles contiennent
   - c) Les fonctions sans paramètres
   - d) Les fichiers journaux trop volumineux

3. Pour planifier l'exécution automatique quotidienne d'un script, on utilise :
   - a) `systemctl schedule`
   - b) `cron`
   - c) `apt schedule`
   - d) `bash --daily`

**Corrigé** : 1-a, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Une variable non quotée dans Bash est toujours traitée exactement comme si elle était quotée. — **Faux** (elle est sujette au word-splitting, section 20.3).
2. `local` à l'intérieur d'une fonction évite les conflits avec des variables de même nom ailleurs dans le script. — **Vrai**.
3. Une tâche cron hérite automatiquement du même environnement complet qu'un terminal interactif. — **Faux** (l'environnement cron est souvent plus restreint, source fréquente de bugs).
4. Coder un mot de passe en clair dans un script versionné dans Git est une pratique recommandée pour simplifier la maintenance. — **Faux** (une pratique dangereuse à éviter, section erreurs fréquentes).
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi un script sans aucune journalisation devient difficile à faire confiance une fois planifié automatiquement via cron.
2. Reprends le scénario d'ouverture. Explique en 3-4 phrases comment tu répondrais au DSI si le script automatisé, une fois en place, ratait quand même un incident réel (par exemple, un quatrième service critique ajouté plus tard, jamais inclus dans la liste `services` du script).

**Corrigé 1** : sans journalisation, il est impossible de savoir après coup si le script s'est réellement exécuté, à quelle heure, et avec quel résultat — un script qui échoue silencieusement (par exemple, une erreur de permission empêchant son exécution complète) peut donner une fausse impression de sécurité pendant des semaines, jusqu'à ce qu'un incident réel révèle que la vérification automatisée n'avait en réalité jamais fonctionné correctement.

**Corrigé 2** : je reconnaîtrais que ce script vérifie exactement ce qu'on lui a explicitement demandé de vérifier, mais rien de plus — un service ajouté après sa création reste invisible tant que le script n'est pas mis à jour en conséquence, exactement comme une documentation qui n'est pas tenue à jour après un changement (chapitre 3). Je proposerais d'intégrer la mise à jour de ce script comme étape systématique de toute procédure de déploiement d'un nouveau service critique (rejoignant le processus de changement du chapitre 2), plutôt que de le laisser devenir obsolète silencieusement au fil du temps.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 20.1</span>

Un script contient la ligne `rm -rf $dossier_temp/*`, où `$dossier_temp` provient d'une entrée utilisateur non validée. Explique le risque exact si `$dossier_temp` est vide ou non défini, et propose une correction en t'appuyant sur les sections 20.2 et 20.3.
</div>

**Corrigé :** Si `$dossier_temp` est vide (chaîne vide) ou non défini, la commande devient effectivement `rm -rf /*` — une tentative de suppression récursive et forcée de la racine du système de fichiers, potentiellement catastrophique. La correction combine deux réflexes de ce chapitre : `set -u` (section 20.2) ferait échouer le script immédiatement si `$dossier_temp` n'est pas défini, et quoter la variable (`rm -rf "${dossier_temp:?Variable dossier_temp non definie}"/*`) ajoute une vérification explicite supplémentaire qui interrompt le script avec un message clair plutôt que d'exécuter une commande destructrice sur une valeur inattendue.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 20.2</span>

Rédige, en 3 à 5 phrases, pourquoi `bash -x` est un outil de diagnostic plus fiable que d'ajouter manuellement des `echo` à différents endroits d'un script pour comprendre où il échoue.
</div>

**Corrigé (exemple de réponse) :** `bash -x` trace automatiquement et exhaustivement chaque commande réellement exécutée, avec les valeurs effectives des variables substituées, sans nécessiter de modifier le script lui-même ni de deviner à l'avance où ajouter des points de vérification. Ajouter des `echo` manuellement demande de faire des hypothèses préalables sur l'endroit probable du problème — une approche moins systématique qui peut facilement manquer la cause réelle si l'hypothèse initiale est incorrecte. `bash -x` élimine ce biais en montrant objectivement l'exécution complète et réelle du script, ligne par ligne.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais démarrer un script Bash robuste avec `set -euo pipefail`.</li>
<li>☐ Je comprends le piège du word-splitting et je quote systématiquement mes variables.</li>
<li>☐ Je sais écrire des fonctions Bash avec `local` pour la modularité.</li>
<li>☐ Je sais journaliser un script avec un horodatage exploitable.</li>
<li>☐ Je sais planifier l'exécution d'un script avec `cron`, en redirigeant sa sortie.</li>
<li>☐ Je sais utiliser `bash -x` pour diagnostiquer un script qui échoue de façon inattendue.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Faut-il toujours utiliser `set -euo pipefail`, sans exception ?</dt>
<dd>C'est une pratique par défaut fortement recommandée pour tout script d'administration système sérieux, mais certains cas spécifiques (un script volontairement conçu pour continuer malgré des échecs partiels individuels) peuvent justifier une approche plus nuancée — dans ce cas, la gestion d'erreur doit être explicite et réfléchie, jamais simplement absente par omission.</dd>

<dt>Bash est-il adapté à des scripts longs et complexes, ou vaut-il mieux passer à Python à un moment donné ?</dt>
<dd>Bash reste excellent pour orchestrer des commandes système et des pipelines simples à moyens (l'objet de ce chapitre) ; au-delà d'une certaine complexité (structures de données riches, logique métier élaborée, gestion d'erreurs fine), Python (chapitre 21) devient souvent plus adapté et plus maintenable — un choix à évaluer selon la complexité réelle du besoin, pas par habitude.</dd>

<dt>Comment tester un script avant de le déployer en production ?</dt>
<dd>Sur un environnement de test isolé autant que possible (rejoignant le principe du groupe pilote du chapitre 7), en vérifiant explicitement son comportement face à des cas limites (variable vide, fichier absent, permission refusée) plutôt que seulement son cas d'usage normal attendu.</dd>

<dt>Cron est-il le seul moyen de planifier l'exécution automatique d'un script sur Linux ?</dt>
<dd>Non, systemd propose aussi des "timers" (unités `.timer`, chapitre 16) comme alternative moderne à cron, avec des capacités de journalisation et de gestion de dépendances plus riches — cron reste néanmoins largement répandu et suffisant pour la majorité des besoins de planification simple.</dd>
</dl>

## Références et pour aller plus loin

- Bash Hackers Wiki — Guide de référence complet : [https://wiki.bash-hackers.org/](https://wiki.bash-hackers.org/)
- ShellCheck — outil d'analyse statique pour détecter les erreurs courantes dans un script Bash : [https://www.shellcheck.net/](https://www.shellcheck.net/)
- Documentation officielle GNU Bash : [https://www.gnu.org/software/bash/manual/bash.html](https://www.gnu.org/software/bash/manual/bash.html)

*Chapitre suivant : Python pour l'administration système — pour les besoins qui dépassent ce que Bash peut raisonnablement gérer, avec une syntaxe plus riche et un écosystème de bibliothèques bien plus vaste.*

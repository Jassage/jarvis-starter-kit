<div class="chapitre-titre-num">CHAPITRE 10 · 🟡 INTERMÉDIAIRE</div>

# Automatisation avec des scripts

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Comprendre pourquoi automatiser une tâche répétitive change tout (chapitre 2, section 2.7), maîtriser les briques de base du scripting Bash et PowerShell (variables, conditions, boucles, codes de retour, gestion d'erreurs), et construire quatre scripts réels et réutilisables qui serviront de socle au reste de ce manuel : `backup.sh`, `deploy.sh`, `healthcheck.sh`, `cleanup.sh`. Ce chapitre clôt la Partie IV et prépare directement Docker (Partie V) et les pipelines CI/CD (Partie VII), qui ne sont, in fine, que des scripts orchestrés automatiquement.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Tu as déjà exécuté manuellement, dans les chapitres précédents, des séquences de commandes répétitives : vérifier l'espace disque, redémarrer un service, sauvegarder un fichier avant de le modifier. Chaque fois que tu retapes la même séquence, tu prends le risque d'oublier une étape ou de faire une faute de frappe — exactement le problème que l'automatisation résout (chapitre 2). Ce chapitre transforme ces séquences répétées en scripts fiables, exécutables en une seule commande, identiques à chaque exécution.
</div>

## 10.1 Pourquoi automatiser : au-delà de la vitesse

Le chapitre 2 (section 2.7) a posé le principe : l'automatisation ne fait pas que gagner du temps, elle **élimine l'erreur humaine** sur les tâches répétitives. Un script bien écrit exécute toujours exactement la même séquence, dans le même ordre, sans fatigue ni distraction — un humain qui répète la même procédure pour la centième fois finit statistiquement par en oublier une étape.

<div class="encadre retenir">
<span class="encadre-titre">📌 Trois qualités d'un bon script d'automatisation</span>
<strong>Reproductible</strong> : produit toujours le même résultat dans les mêmes conditions. <strong>Idempotent</strong> : peut être exécuté plusieurs fois de suite sans effet cumulatif indésirable (relancer un script de création de dossier ne doit pas échouer si le dossier existe déjà). <strong>Sûr par défaut</strong> : échoue clairement et s'arrête plutôt que de continuer silencieusement après une erreur.
</div>

## 10.2 Bash : les briques de base

### Variables

```bash
#!/bin/bash
NOM_PROJET="mon-application"
DATE_DU_JOUR=$(date +%Y-%m-%d)
echo "Sauvegarde de $NOM_PROJET le $DATE_DU_JOUR"
```

**Explication :** `#!/bin/bash` (le *shebang*, toujours la première ligne) indique au système quel interpréteur utiliser pour exécuter ce fichier ; une variable s'assigne sans espace autour du `=` (`NOM="valeur"`, jamais `NOM = "valeur"`) et se lit avec un `$` devant (`$NOM_PROJET`) ; `$(commande)` capture la sortie d'une commande dans une variable.

### Conditions

```bash
if [ -f "/etc/nginx/nginx.conf" ]; then
    echo "Nginx est installé"
else
    echo "Nginx n'est pas installé"
fi
```

**Explication :** `[ -f chemin ]` teste si un chemin existe et est un fichier régulier (`-d` pour un dossier, `-x` pour un fichier exécutable) ; la structure `if`/`then`/`else`/`fi` (le mot-clé `if` inversé referme le bloc) est la structure conditionnelle de base de Bash.

### Boucles

```bash
for fichier in /var/log/*.log; do
    echo "Traitement de $fichier"
done

while ! curl -sf http://localhost:3000/health > /dev/null; do
    echo "En attente que l'application démarre..."
    sleep 2
done
```

**Explication :** la boucle `for` parcourt chaque élément d'une liste (ici, chaque fichier `.log` du dossier) ; la boucle `while` répète tant qu'une condition reste vraie — ici, tant que le endpoint de santé ne répond pas, avec une pause (`sleep 2`) entre chaque tentative, un pattern qui reviendra au chapitre 22 (attendre qu'un service soit prêt avant de continuer).

### Codes de retour et gestion d'erreurs

<div class="encadre retenir">
<span class="encadre-titre">📌 Le code de retour, langage universel du succès ou de l'échec</span>
Chaque commande Linux se termine avec un <strong>code de retour</strong> : <code>0</code> signifie succès, tout autre nombre (1 à 255) signifie un échec, chaque outil ayant ses propres conventions de codes. La variable spéciale <code>$?</code> contient toujours le code de retour de la <strong>dernière</strong> commande exécutée.
</div>

```bash
#!/bin/bash
set -e

cp fichier-source.txt fichier-destination.txt
echo "Copie réussie"
```

**Explication :** `set -e` (à placer en tout début de script) fait que le script s'arrête **immédiatement** dès qu'une commande échoue (code de retour différent de 0), plutôt que de continuer aveuglément avec les commandes suivantes — un réflexe de sécurité de base pour tout script d'automatisation sérieux.

```bash
if cp fichier-source.txt fichier-destination.txt; then
    echo "Copie réussie"
else
    echo "Échec de la copie" >&2
    exit 1
fi
```

**Explication :** cette forme, plus explicite que `set -e` seul, permet de réagir précisément à un échec (ici, afficher un message d'erreur sur la sortie d'erreur `>&2`, la convention Unix pour les messages d'erreur, puis quitter avec `exit 1`, un code de retour non nul qui signale l'échec à qui appelle ce script).

## 10.3 PowerShell : l'équivalent côté Windows

Les mêmes concepts existent en PowerShell, avec une syntaxe différente — utile pour des scripts d'automatisation exécutés depuis ta machine locale Windows (chapitre 3), par exemple pour piloter un déploiement depuis ton poste.

```powershell
# Variables
$NomProjet = "mon-application"
$DateDuJour = Get-Date -Format "yyyy-MM-dd"
Write-Output "Sauvegarde de $NomProjet le $DateDuJour"

# Condition
if (Test-Path "C:\config\app.json") {
    Write-Output "Fichier de configuration trouvé"
} else {
    Write-Output "Fichier de configuration manquant"
}

# Boucle
Get-ChildItem "C:\logs\*.log" | ForEach-Object {
    Write-Output "Traitement de $($_.Name)"
}

# Gestion d'erreur
$ErrorActionPreference = "Stop"
try {
    Copy-Item "source.txt" "destination.txt"
    Write-Output "Copie réussie"
} catch {
    Write-Error "Échec de la copie : $_"
    exit 1
}
```

**Explication des équivalences :** `Test-Path` remplace `[ -f ]` ; `Get-ChildItem` (alias `ls`/`dir`) remplace la boucle sur `*.log` ; `$ErrorActionPreference = "Stop"` transforme les erreurs non-terminantes en erreurs terminantes, l'équivalent de `set -e` ; `try`/`catch` gère explicitement les erreurs, comme le `if`/`else` sur le code de retour en Bash.

## 10.4 `backup.sh` : sauvegarder un dossier avec horodatage

```bash
#!/bin/bash
set -e

DOSSIER_SOURCE="/var/www/monsite"
DOSSIER_SAUVEGARDES="/home/deploiement/sauvegardes"
DATE_DU_JOUR=$(date +%Y%m%d-%H%M%S)
NOM_ARCHIVE="sauvegarde-${DATE_DU_JOUR}.tar.gz"

if [ ! -d "$DOSSIER_SOURCE" ]; then
    echo "Erreur : le dossier source $DOSSIER_SOURCE n'existe pas" >&2
    exit 1
fi

mkdir -p "$DOSSIER_SAUVEGARDES"
tar -czf "${DOSSIER_SAUVEGARDES}/${NOM_ARCHIVE}" -C "$(dirname "$DOSSIER_SOURCE")" "$(basename "$DOSSIER_SOURCE")"

echo "Sauvegarde créée : ${DOSSIER_SAUVEGARDES}/${NOM_ARCHIVE}"
ls -lh "${DOSSIER_SAUVEGARDES}/${NOM_ARCHIVE}"
```

**Explication ligne par ligne :** vérifie d'abord que le dossier source existe réellement (jamais supposer, toujours vérifier) ; `mkdir -p` (chapitre 4) crée le dossier de destination s'il n'existe pas déjà, rendant le script idempotent sur ce point ; `tar -czf` (chapitre 4) crée l'archive compressée, horodatée dans son nom pour ne jamais écraser une sauvegarde précédente ; `-C` change de dossier avant d'archiver, pour que l'archive contienne un chemin relatif propre plutôt que le chemin absolu complet.

**Test de vérification :**

```bash
chmod +x backup.sh
./backup.sh
```

**Résultat attendu** : une nouvelle archive apparaît dans `/home/deploiement/sauvegardes`, avec un nom unique horodaté.

## 10.5 `healthcheck.sh` : vérifier qu'une application répond

```bash
#!/bin/bash
URL_A_VERIFIER="http://localhost:3000/health"
NOMBRE_TENTATIVES_MAX=5
TENTATIVE=1

while [ $TENTATIVE -le $NOMBRE_TENTATIVES_MAX ]; do
    if curl -sf "$URL_A_VERIFIER" > /dev/null; then
        echo "Application en ligne (tentative $TENTATIVE/$NOMBRE_TENTATIVES_MAX)"
        exit 0
    fi
    echo "Tentative $TENTATIVE/$NOMBRE_TENTATIVES_MAX échouée, nouvel essai dans 3 secondes..."
    TENTATIVE=$((TENTATIVE + 1))
    sleep 3
done

echo "Erreur : application injoignable après $NOMBRE_TENTATIVES_MAX tentatives" >&2
exit 1
```

**Explication :** `curl -sf` (chapitre 4) échoue silencieusement (`-s`) et retourne un code d'échec (`-f`) si le serveur répond avec un code d'erreur HTTP ; la boucle `while` réessaie un nombre limité de fois plutôt qu'indéfiniment (éviter une boucle infinie qui bloquerait un pipeline automatisé) ; `exit 0` en cas de succès et `exit 1` en cas d'échec final permettent à ce script d'être utilisé comme condition dans un autre script ou un pipeline CI/CD (chapitre 22).

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — un healthcheck avec code de retour exploitable</span>
Ce script ne se contente pas d'afficher un message : son code de retour (0 ou 1) permet à un autre outil de réagir automatiquement (relancer un déploiement, déclencher une alerte). C'est exactement ce mécanisme qu'utiliseront les pipelines CI/CD (Partie VII) et les healthchecks Docker (Partie V) pour décider automatiquement si un déploiement a réussi.
</div>

## 10.6 `cleanup.sh` : nettoyer les fichiers temporaires anciens

```bash
#!/bin/bash
set -e

DOSSIER_A_NETTOYER="/home/deploiement/sauvegardes"
JOURS_DE_RETENTION=7

if [ -z "$DOSSIER_A_NETTOYER" ]; then
    echo "Erreur : DOSSIER_A_NETTOYER est vide, arrêt par sécurité" >&2
    exit 1
fi

echo "Suppression des fichiers de plus de $JOURS_DE_RETENTION jours dans $DOSSIER_A_NETTOYER"
find "$DOSSIER_A_NETTOYER" -type f -name "sauvegarde-*.tar.gz" -mtime "+${JOURS_DE_RETENTION}" -print -delete

echo "Nettoyage terminé"
```

**Explication :** la vérification `[ -z "$DOSSIER_A_NETTOYER" ]` (chapitre 4, rappel de l'erreur `rm -rf` sur une variable vide) est **une garde de sécurité obligatoire** avant toute commande destructive sur une variable ; `find ... -mtime +7 -delete` (chapitre 4) cible précisément les fichiers de sauvegarde de plus de 7 jours, jamais un `rm -rf` généraliste ; `-print` avant `-delete` affiche chaque fichier concerné avant de le supprimer, une trace utile en cas de besoin de vérification après coup.

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ce script démontre concrètement l'erreur n°3 du chapitre 4</span>
Remarque la vérification <code>[ -z "$DOSSIER_A_NETTOYER" ]</code> avant toute opération de suppression : c'est la mise en pratique directe de l'avertissement du chapitre 4 sur `rm -rf` avec une variable non vérifiée. Un script de nettoyage est justement le type de script le plus dangereux à mal écrire.
</div>

## 10.7 `deploy.sh` : assembler les scripts précédents en un déploiement

```bash
#!/bin/bash
set -e

echo "=== Étape 1/4 : sauvegarde avant déploiement ==="
./backup.sh

echo "=== Étape 2/4 : récupération du dernier code ==="
cd /home/deploiement/monapp
git pull origin main

echo "=== Étape 3/4 : redémarrage du service ==="
sudo systemctl restart monapp

echo "=== Étape 4/4 : vérification de santé ==="
./healthcheck.sh

echo "=== Déploiement terminé avec succès ==="
```

**Explication :** ce script orchestre les précédents dans un ordre logique et sûr — toujours sauvegarder **avant** de changer quoi que ce soit (chapitre 31, Partie IX approfondira cette discipline), puis récupérer le code, redémarrer, et **vérifier** que tout fonctionne avant de déclarer le déploiement réussi. `set -e` garantit qu'un échec à n'importe quelle étape arrête immédiatement le script plutôt que de continuer vers une étape suivante sur une base déjà cassée.

<div class="encadre memoriser">
<span class="encadre-titre">🧠 Ce script est le grand ancêtre du pipeline CI/CD</span>
Ce `deploy.sh`, exécuté manuellement aujourd'hui, deviendra en Partie VII un ensemble d'étapes automatisées dans GitHub Actions, déclenchées automatiquement à chaque push — la logique reste rigoureusement identique (sauvegarder, récupérer, redémarrer, vérifier), seul le déclenchement change.
</div>

## Atelier — Le cycle complet, testé en conditions réelles

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 10.1 — Construire et tester les quatre scripts sur ton laboratoire</span>

**Objectif** : avoir les quatre scripts fonctionnels et testés sur ton serveur de laboratoire, prêts à être réutilisés dans les chapitres suivants.

**Étapes détaillées** :

1. Sur ton serveur de laboratoire, crée un dossier `~/scripts` et places-y les quatre scripts de ce chapitre, adaptés à un projet de test simple (un dossier avec quelques fichiers, en l'absence d'une vraie application pour l'instant).
2. Rends-les tous exécutables (`chmod +x ~/scripts/*.sh`, chapitre 4).
3. Teste `backup.sh` seul, vérifie l'archive créée.
4. Teste `cleanup.sh` avec `JOURS_DE_RETENTION=0` temporairement (pour voir un vrai nettoyage se produire sans attendre 7 jours), puis remets la valeur à 7.
5. Teste `healthcheck.sh` contre une URL qui ne répond pas (`http://localhost:9999/health`), observe l'échec après 5 tentatives.

**Résultat attendu** : les quatre scripts s'exécutent correctement, avec des messages clairs à chaque étape, et le script `cleanup.sh` ne supprime jamais rien en dehors du dossier ciblé, même en cas de variable mal configurée (grâce à la garde de la section 10.6).

**Dépannage** : si `healthcheck.sh` réussit alors que l'URL ne devrait pas répondre, vérifie qu'aucun autre service ne tourne déjà sur ce port (revoir `ss -tulpn`, chapitre 4).
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Oublier `set -e` et continuer après un échec silencieux</span>
Sans `set -e`, un script Bash continue d'exécuter les lignes suivantes même après l'échec d'une commande, ce qui peut enchaîner des actions sur une base déjà corrompue. Réflexe systématique : `set -e` en tête de chaque script d'automatisation de ce manuel.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Chemins relatifs dans un script destiné à cron</span>
Comme signalé au chapitre 5 (section 5.5), un script appelé par cron n'a pas de "dossier courant" implicite — toujours utiliser des chemins absolus (`/home/deploiement/scripts/backup.sh`, jamais `./backup.sh`) dans un script destiné à être planifié.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Ne jamais tester un script de nettoyage sur des données réelles avant vérification</span>
Avant de faire confiance à un script comme `cleanup.sh` sur de vraies données de production, teste-le systématiquement sur un dossier de test jetable — la section 10.6 montre une garde de sécurité, mais elle ne remplace jamais un test réel avant mise en production.
</div>

## En entreprise

**Réalité répandue** : la quasi-totalité des scripts d'automatisation "maison" d'une entreprise (backup, healthcheck, déploiement) commencent exactement sous cette forme — de simples scripts Bash ou PowerShell — avant, éventuellement, d'évoluer vers des outils plus sophistiqués (Ansible, Terraform, Partie XII) une fois l'échelle atteinte. Savoir écrire un script Bash fiable reste une compétence fondamentale, jamais obsolète.

**Bonne pratique répandue** : les scripts de production versionnés dans Git (chapitre 7), avec une revue de code (chapitre 8) avant modification — un script d'automatisation a autant besoin de rigueur que le code applicatif qu'il déploie ou surveille.

**Erreur classique observée** : des scripts critiques ("le script qui fait le backup") qui existent uniquement sur un serveur, jamais versionnés, dont plus personne ne connaît l'origine exacte ni les modifications successives — un écho direct du "bus factor" évoqué ailleurs dans le portefeuille de manuels.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Qu'est-ce que `set -e` fait dans un script Bash, et pourquoi l'utiliser systématiquement ?"**
Réponse attendue : il arrête immédiatement le script dès qu'une commande échoue (code de retour non nul), évitant qu'un script continue d'exécuter des actions sur une base déjà en erreur (section 10.2).

**Q2. "Comment rendrais-tu un script de nettoyage sûr contre une variable de chemin accidentellement vide ?"**
Réponse attendue : une vérification explicite (`[ -z "$VARIABLE" ]`) qui arrête le script avant toute opération destructive si la variable est vide, comme démontré dans `cleanup.sh` (section 10.6), en écho direct à l'erreur n°3 du chapitre 4.

**Q3. "Qu'est-ce que l'idempotence, et pourquoi est-ce important pour un script de déploiement ?"**
Réponse attendue : la capacité d'un script à produire le même résultat final s'il est exécuté plusieurs fois de suite, sans effet cumulatif indésirable (section 10.1) — essentiel pour un script de déploiement qu'on pourrait avoir à relancer après un échec partiel, sans craindre de dupliquer ou casser quelque chose.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Ne mets jamais de secret (mot de passe, clé API) en clair directement dans un script versionné dans Git — même principe que le chapitre 7. Le chapitre 25 montrera comment injecter ces valeurs depuis des variables d'environnement ou un gestionnaire de secrets, jamais codées en dur.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Commente chaque script en tête de fichier (à quoi il sert, quels paramètres il attend, qui peut l'exécuter) — un script sans aucun commentaire, relu six mois plus tard, coûte un temps de compréhension largement supérieur au temps qu'aurait pris ce commentaire à l'écrire.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Un `healthcheck.sh` avec un nombre de tentatives limité (section 10.5) évite qu'un script bloqué indéfiniment sur un service qui ne démarre jamais ne bloque à son tour tout un pipeline d'automatisation en amont.
</div>

## Résumé du chapitre

- L'automatisation par script élimine l'erreur humaine sur les tâches répétitives, en plus de faire gagner du temps.
- Un bon script est reproductible, idempotent, et sûr par défaut (échoue clairement plutôt que de continuer silencieusement).
- `set -e` (Bash) et `$ErrorActionPreference = "Stop"` (PowerShell) transforment les erreurs en arrêts immédiats du script.
- `backup.sh`, `healthcheck.sh`, `cleanup.sh` et `deploy.sh` forment un socle réutilisable directement dans les chapitres suivants (Docker, CI/CD).
- Une variable jamais vérifiée avant une opération destructive (`rm -rf`, `find -delete`) reste le piège le plus coûteux du scripting d'automatisation.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. `set -e` en tête d'un script Bash a pour effet de :
   - a) Afficher toutes les commandes exécutées
   - b) Arrêter le script dès qu'une commande échoue
   - c) Exécuter le script en arrière-plan
   - d) Supprimer les erreurs silencieusement

2. Un script idempotent est un script qui :
   - a) S'exécute uniquement une fois dans la vie du serveur
   - b) Produit le même résultat final, qu'il soit exécuté une ou plusieurs fois
   - c) Ne peut jamais échouer
   - d) Nécessite toujours une confirmation manuelle

3. Dans `cleanup.sh` (section 10.6), la vérification `[ -z "$DOSSIER_A_NETTOYER" ]` sert à :
   - a) Afficher le contenu du dossier
   - b) Empêcher une suppression destructive si la variable est vide
   - c) Créer le dossier s'il n'existe pas
   - d) Compresser le dossier

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un script destiné à être exécuté par cron peut utiliser des chemins relatifs sans problème. — **Faux** (chapitre 5 et section "Erreurs fréquentes", erreur n°2).
2. `healthcheck.sh` retourne un code de sortie exploitable par d'autres scripts ou un pipeline CI/CD. — **Vrai**.
3. Il est acceptable d'écrire un mot de passe en clair dans un script versionné dans Git tant que le dépôt est privé. — **Faux** (section "Sécurité", et rappel du chapitre 7).

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 10.1</span>

Modifie `healthcheck.sh` (section 10.5) pour qu'il accepte l'URL à vérifier en argument de ligne de commande (`./healthcheck.sh http://localhost:4000/health`) plutôt qu'en valeur codée en dur, avec une valeur par défaut si aucun argument n'est fourni.
</div>

**Corrigé :**
```bash
#!/bin/bash
URL_A_VERIFIER="${1:-http://localhost:3000/health}"
NOMBRE_TENTATIVES_MAX=5
TENTATIVE=1

while [ $TENTATIVE -le $NOMBRE_TENTATIVES_MAX ]; do
    if curl -sf "$URL_A_VERIFIER" > /dev/null; then
        echo "Application en ligne (tentative $TENTATIVE/$NOMBRE_TENTATIVES_MAX)"
        exit 0
    fi
    TENTATIVE=$((TENTATIVE + 1))
    sleep 3
done
echo "Erreur : application injoignable après $NOMBRE_TENTATIVES_MAX tentatives" >&2
exit 1
```
`$1` représente le premier argument passé au script ; `${1:-valeur_par_defaut}` utilise cet argument s'il est fourni, sinon retombe sur la valeur par défaut — une technique Bash courante pour rendre un script flexible sans le complexifier.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais écrire un script Bash avec variables, conditions et boucles.</li>
<li>☐ Je comprends les codes de retour et j'utilise `set -e` par réflexe.</li>
<li>☐ Je sais écrire l'équivalent PowerShell des mêmes structures de base.</li>
<li>☐ J'ai construit et testé `backup.sh`, `healthcheck.sh`, `cleanup.sh` et `deploy.sh` sur mon laboratoire.</li>
<li>☐ Je sais protéger un script de nettoyage contre une variable de chemin vide.</li>
<li>☐ Je comprends pourquoi un script de déploiement doit toujours vérifier la santé de l'application après action.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Bash ou Python pour l'automatisation : lequel choisir ?</dt>
<dd>Pour des scripts courts orientés système (fichiers, processus, commandes) comme ceux de ce chapitre, Bash reste souvent plus direct. Pour une logique plus complexe (traitement de données structurées, appels API élaborés), Python devient généralement plus lisible et maintenable — un choix de contexte, pas une règle absolue.</dd>

<dt>Ces scripts remplacent-ils un outil comme Ansible ?</dt>
<dd>Non, pas à cette échelle. Ansible et les outils d'Infrastructure as Code (Partie XII) prennent le relais quand le nombre de serveurs ou la complexité de configuration dépasse ce que des scripts simples peuvent raisonnablement gérer de façon fiable. Comprendre le scripting de base reste néanmoins la fondation sur laquelle ces outils plus avancés s'appuient.</dd>

<dt>Faut-il tester ces scripts avec un framework de test dédié ?</dt>
<dd>Pour des scripts de cette taille, un test manuel rigoureux (comme l'atelier de ce chapitre) suffit généralement. Des frameworks existent (bats pour Bash, Pester pour PowerShell) et deviennent pertinents à mesure que le nombre et la complexité des scripts grandissent — approfondi indirectement au chapitre 23 (tests automatisés).</dd>
</dl>

## Références et pour aller plus loin

- Bash Guide (Greg's Wiki) — référence complète et régulièrement citée sur le scripting Bash : [https://mywiki.wooledge.org/BashGuide](https://mywiki.wooledge.org/BashGuide)
- ShellCheck — analyseur statique en ligne qui détecte les erreurs courantes dans un script Bash : [https://www.shellcheck.net](https://www.shellcheck.net)
- Documentation officielle Microsoft — scripting PowerShell : [https://learn.microsoft.com/powershell/scripting](https://learn.microsoft.com/powershell/scripting)

*Chapitre suivant : Docker — images, conteneurs, volumes et réseaux. La Partie V commence, et les scripts de ce chapitre trouveront bientôt leur place à l'intérieur de conteneurs reproductibles.*

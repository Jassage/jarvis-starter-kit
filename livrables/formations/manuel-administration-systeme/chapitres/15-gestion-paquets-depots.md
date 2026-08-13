<div class="chapitre-titre-num">CHAPITRE 15</div>

# Gestion des paquets et dépôts

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Maîtriser l'installation, la mise à jour et le retrait de logiciels sur les deux grandes familles de distributions Linux (`apt` pour Debian/Ubuntu, `dnf` pour Rocky Linux/RHEL), comprendre ce qu'est un dépôt et pourquoi sa fiabilité est une question de sécurité, et savoir diagnostiquer les erreurs les plus courantes de gestion de paquets. À la fin de ce chapitre, tu seras capable d'installer et de maintenir des logiciels sur un serveur Linux avec la même aisance qu'un administrateur Windows utilise le Gestionnaire de serveur.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Le premier serveur Ubuntu Server LTS du chapitre précédent vient d'être provisionné pour le portail client. Le développeur freelance t'envoie une liste de logiciels à installer : Nginx (serveur web), une base de données PostgreSQL, et un outil de monitoring qu'il a trouvé "sur un tutoriel en ligne, avec un script à exécuter directement en tant que root". Tu acceptes d'installer les deux premiers sans hésiter, mais tu marques une pause sur le troisième. <em>"Pourquoi tu ne l'installes pas directement avec le script, ça prend deux minutes"</em>, te demande-t-il. Ta réponse à cette question — et la façon rigoureuse dont tu vas installer chacun de ces trois logiciels — est exactement le sujet de ce chapitre.
</div>

## 15.1 Qu'est-ce qu'un paquet, qu'est-ce qu'un dépôt

Un **paquet** est une archive contenant un logiciel prêt à l'emploi, accompagné de métadonnées (nom, version, dépendances nécessaires, instructions d'installation). Un **dépôt** est un serveur distant qui héberge une collection organisée de paquets, que le gestionnaire de paquets interroge pour trouver, télécharger et installer un logiciel demandé.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie — la pharmacie contre le marché informel</span>
Installer un logiciel depuis un dépôt officiel s'apparente à acheter un médicament en pharmacie : la chaîne de fabrication et de distribution est tracée, contrôlée, et la pharmacie engage sa responsabilité sur ce qu'elle vend. Exécuter un script trouvé "sur un tutoriel en ligne" en tant que root, comme le suggère le développeur du scénario d'ouverture, s'apparente davantage à acheter un remède auprès d'un vendeur inconnu dans la rue : peut-être que le produit est authentique, mais rien ne le garantit, et personne n'engage sa responsabilité si ce n'est pas le cas.
</div>

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — pourquoi la provenance d'un paquet compte autant que son contenu</span>
Un dépôt officiel (Debian, Ubuntu, RHEL/Rocky, ou un dépôt tiers reconnu comme celui d'un éditeur logiciel majeur) signe cryptographiquement ses paquets — le gestionnaire de paquets vérifie cette signature avant toute installation, garantissant que le paquet provient réellement de la source annoncée et n'a pas été altéré en chemin. Un script exécuté directement depuis Internet, en tant que root, contourne entièrement cette vérification : rien ne garantit son authenticité ni son intégrité, et une exécution en tant que root lui donne un accès total et immédiat au système, sans aucune limite.
</div>

## 15.2 Répondre à la question du développeur

Reprenons directement la question posée dans le scénario d'ouverture : pourquoi ne pas simplement exécuter le script trouvé en ligne ?

<div class="encadre mauvaise-pratique">
<span class="encadre-titre">❌ Mauvaise pratique — `curl ... | sudo bash`</span>
Ce motif, très répandu dans des tutoriels en ligne peu rigoureux, télécharge un script depuis Internet et l'exécute immédiatement avec les privilèges root, sans jamais l'inspecter au préalable. Si la source est compromise (piratage du serveur hébergeant le script, attaque de la chaîne d'approvisionnement) ou si le script contient une erreur, le système est immédiatement exposé sans aucune barrière de sécurité intermédiaire — un risque disproportionné par rapport au gain de temps réel (quelques minutes) que cette méthode fait économiser par rapport à une installation via un dépôt correctement configuré.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — privilégier toujours le dépôt officiel du logiciel</span>
La grande majorité des logiciels sérieux (dont les outils de monitoring reconnus comme Prometheus, Grafana, ou Zabbix, approfondis en Partie 10) proposent officiellement un dépôt APT ou DNF à ajouter, avec une clé de signature publique à importer une seule fois — une méthode qui prend à peine plus de temps que le script direct, tout en bénéficiant de la vérification cryptographique et de la gestion normale des mises à jour futures via le gestionnaire de paquets standard.
</div>

## 15.3 `apt` : gestion des paquets sur Debian et Ubuntu

```
# Mettre a jour la liste locale des paquets disponibles depuis les depots
# configures (a faire avant toute installation, pour eviter d'installer
# une version obsolete deja retiree du depot)
sudo apt update

# Mettre a jour tous les paquets installes vers leur derniere version disponible
sudo apt upgrade

# Installer un nouveau paquet (ici, le serveur web Nginx)
sudo apt install nginx

# Rechercher un paquet par mot-cle
apt search postgresql

# Retirer un paquet, en conservant ses fichiers de configuration
sudo apt remove postgresql

# Retirer un paquet ET ses fichiers de configuration (nettoyage complet)
sudo apt purge postgresql

# Retirer les dependances devenues inutiles apres une suppression
sudo apt autoremove
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ne jamais confondre `apt update` et `apt upgrade`</span>
C'est l'une des confusions les plus fréquentes chez les débutants sur Debian/Ubuntu : <code>apt update</code> ne met à jour **aucun logiciel** — il actualise uniquement la liste locale des paquets disponibles depuis les dépôts. <code>apt upgrade</code> effectue la mise à jour réelle des logiciels installés. Oublier <code>apt update</code> avant <code>apt upgrade</code> peut faire manquer des mises à jour de sécurité récentes, car le système travaille alors sur une liste de paquets potentiellement obsolète.
</div>

## 15.4 `dnf` : gestion des paquets sur Rocky Linux et RHEL

```
# Mettre a jour tous les paquets installes (dnf combine en une seule commande
# ce qui necessite deux commandes distinctes avec apt : rafraichir + mettre a jour)
sudo dnf upgrade

# Installer un nouveau paquet
sudo dnf install nginx

# Rechercher un paquet par mot-cle
dnf search postgresql

# Retirer un paquet
sudo dnf remove postgresql

# Retirer les dependances devenues inutiles
sudo dnf autoremove

# Afficher des informations detaillees sur un paquet avant de l'installer
dnf info nginx
```

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — une différence structurelle entre `apt` et `dnf`</span>
Contrairement à `apt`, qui sépare explicitement le rafraîchissement de la liste des paquets (<code>apt update</code>) et leur mise à jour effective (<code>apt upgrade</code>) en deux commandes distinctes, `dnf` rafraîchit automatiquement ses métadonnées avant chaque opération — une seule commande <code>dnf upgrade</code> suffit. Ce n'est pas une meilleure ou une moins bonne conception, seulement une convention différente à connaître pour éviter toute confusion en changeant de famille de distribution.
</div>

## 15.5 Ajouter un dépôt tiers en toute sécurité

Reprenons l'installation de l'outil de monitoring du scénario d'ouverture, cette fois via son dépôt officiel plutôt que via le script direct :

```
# Exemple generique (la procedure exacte varie selon le logiciel,
# toujours suivre la documentation officielle du projet concerne) :

# 1. Telecharger et importer la cle de signature publique du depot
curl -fsSL https://exemple-outil.com/gpg-key.asc | sudo gpg --dearmor -o /usr/share/keyrings/exemple-outil.gpg

# 2. Ajouter le depot a la liste des sources, en reference explicite
#    a la cle importee (garantit que seuls les paquets signes par
#    cette cle precise seront acceptes depuis ce depot)
echo "deb [signed-by=/usr/share/keyrings/exemple-outil.gpg] https://exemple-outil.com/apt stable main" | sudo tee /etc/apt/sources.list.d/exemple-outil.list

# 3. Rafraichir la liste des paquets et installer normalement,
#    exactement comme un paquet du depot officiel de la distribution
sudo apt update
sudo apt install exemple-outil
```

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance — le bénéfice à long terme d'un dépôt bien configuré</span>
Au-delà de la sécurité immédiate, ajouter un dépôt correctement configuré signifie que les futures mises à jour de cet outil seront automatiquement proposées lors d'un simple <code>apt upgrade</code> ou <code>dnf upgrade</code> régulier — contrairement à un script exécuté manuellement une seule fois, qui n'offre aucun mécanisme de suivi des mises à jour futures et expose le système à une version figée et de plus en plus vulnérable avec le temps.
</div>

## 15.6 Diagnostiquer les erreurs courantes de gestion de paquets

```
# Reparer un systeme de paquets dans un etat incoherent (installation
# interrompue en cours de route, dependances cassees)
sudo apt --fix-broken install     # Debian/Ubuntu
sudo dnf check                    # Rocky Linux/RHEL, diagnostic seul

# Verifier quel paquet fournit un fichier ou une commande precise,
# utile pour comprendre l'origine d'un logiciel deja installe
dpkg -S /usr/bin/nginx            # Debian/Ubuntu
dnf provides /usr/bin/nginx       # Rocky Linux/RHEL
```

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : "l'installation d'un paquet échoue avec une erreur de dépendances"</span>

- **Diagnostic** : la cause la plus fréquente est une liste de paquets locale obsolète (oubli de <code>apt update</code>, section 15.3) ou un dépôt tiers mal configuré qui entre en conflit avec les versions attendues par les dépôts officiels.
- **Comment vérifier** : relancer <code>apt update</code> (ou <code>dnf clean all</code> puis une nouvelle opération sur Rocky/RHEL) avant de conclure à un problème plus profond.
- **Résolution** : si le problème persiste après ce rafraîchissement, `apt --fix-broken install` répare généralement un état incohérent sur Debian/Ubuntu ; sur Rocky/RHEL, `dnf check` diagnostique l'incohérence avant correction manuelle ciblée.
</div>

## Atelier — Installer les trois logiciels du scénario d'ouverture

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 15 — Une installation méthodique</span>

**Objectif** : appliquer la méthode rigoureuse de ce chapitre à la demande initiale du développeur (Nginx, PostgreSQL, un outil de monitoring tiers), en justifiant chaque étape.

**Préparation** : accès à un serveur Ubuntu Server (réel ou machine virtuelle de test), ou à défaut une lecture attentive suffit pour cet atelier conceptuel.

**Étapes détaillées** :

1. Rédige les commandes exactes pour installer Nginx et PostgreSQL depuis les dépôts officiels Ubuntu, dans le bon ordre (section 15.3).
2. Pour l'outil de monitoring tiers, rédige la procédure d'ajout de son dépôt officiel avant installation (section 15.5), plutôt que d'exécuter le script direct proposé initialement.
3. Rédige une phrase que tu adresserais au développeur pour expliquer, sans jargon excessif, pourquoi cette méthode légèrement plus longue est préférable.
4. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : `sudo apt update` suivi de `sudo apt install nginx postgresql` couvre les deux premiers logiciels en une seule opération groupée. Pour le troisième, la procédure en trois étapes de la section 15.5 (importer la clé, ajouter le dépôt, installer) remplace le script direct. L'explication au développeur reprend l'idée centrale de la section 15.2 : la vérification cryptographique et la gestion automatique des futures mises à jour justifient largement les quelques minutes supplémentaires par rapport à un script non vérifié exécuté en tant que root.

**Dépannage** : si le dépôt officiel d'un outil précis n'existe pas ou semble peu fiable, une alternative plus sûre qu'un script direct reste souvent de compiler le logiciel soi-même depuis son code source officiel, ou de le déployer via un conteneur Docker (Partie 7) avec une image officielle vérifiée.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — exécuter un script `curl | sudo bash` sans l'avoir lu</span>
Comme vu en section 15.2, cette pratique contourne toute vérification d'authenticité et donne un accès root immédiat et total à un code non inspecté — l'un des réflexes les plus risqués et pourtant les plus répandus chez les débutants pressés.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — oublier `apt update` avant une installation ou une mise à jour</span>
Rappel de la section 15.3 : cet oubli peut faire manquer des correctifs de sécurité récents ou provoquer des erreurs de dépendances évitables.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — mélanger des paquets installés via le gestionnaire de paquets et via des méthodes manuelles non suivies</span>
Un logiciel installé manuellement (compilation depuis les sources, script direct) échappe totalement au suivi du gestionnaire de paquets — il n'apparaîtra jamais dans un audit de version ou une mise à jour groupée, créant un angle mort similaire au "shadow IT" évoqué au chapitre 3, mais à l'échelle d'un seul serveur plutôt que de toute l'infrastructure.
</div>

## En entreprise

- **Bonne pratique répandue** : limiter strictement les dépôts tiers ajoutés à ceux réellement nécessaires et documentés (chapitre 3), plutôt que d'accumuler des sources non maîtrisées au fil des installations successives.
- **Bonne pratique répandue** : planifier des fenêtres régulières de mise à jour des paquets (rejoignant directement WSUS pour Windows, chapitre 12), plutôt que de laisser les mises à jour de sécurité s'accumuler indéfiniment sans être appliquées.
- **Erreur classique observée** : un serveur où plusieurs logiciels ont été installés "à la main" par différentes personnes au fil du temps, sans dépôt ni documentation, rendant impossible un audit fiable de ce qui tourne réellement sur la machine.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Quelle est la différence entre `apt update` et `apt upgrade` ?"**
Réponse attendue : `apt update` rafraîchit la liste locale des paquets disponibles depuis les dépôts configurés, sans installer aucune mise à jour ; `apt upgrade` installe réellement les mises à jour disponibles pour les paquets déjà installés. Les deux sont généralement enchaînées, mais elles n'ont pas le même rôle.

**Q2. "Pourquoi éviter d'installer un logiciel via un script `curl | sudo bash` trouvé en ligne ?"**
Réponse attendue : cette méthode contourne la vérification cryptographique de signature qu'offre un dépôt officiel correctement configuré, et exécute un code non inspecté avec des privilèges root complets — un risque de sécurité disproportionné par rapport au gain de temps réel, sans compter l'absence de suivi automatique des futures mises à jour.

**Q3. "Comment diagnostiquerais-tu une erreur de dépendances lors d'une installation de paquet ?"**
Réponse attendue : vérifier d'abord que la liste locale des paquets est à jour (`apt update` ou équivalent), puis utiliser les outils de diagnostic dédiés (`apt --fix-broken install`, `dnf check`) avant d'explorer des causes plus complexes comme un conflit avec un dépôt tiers mal configuré.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
N'installe jamais un logiciel en production via une méthode qui contourne la vérification de signature d'un dépôt reconnu, sauf nécessité absolue documentée et justifiée — le réflexe "dépôt officiel d'abord, alternative seulement si aucun dépôt fiable n'existe" doit devenir automatique.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documente (chapitre 3) chaque dépôt tiers ajouté à un serveur, avec sa raison d'être et sa source officielle — un audit futur doit pouvoir retrouver rapidement pourquoi chaque dépôt non standard a été ajouté, sans devoir deviner.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Planifie des fenêtres de maintenance régulières pour appliquer les mises à jour de paquets, plutôt que de les laisser s'accumuler — une mise à jour groupée après des mois d'accumulation comporte un risque de régression bien plus élevé qu'une série de mises à jour régulières et incrémentales, plus faciles à tester et à revenir en arrière individuellement si besoin.
</div>

## Résumé du chapitre

- Un paquet est une archive logicielle avec ses métadonnées ; un dépôt héberge une collection de paquets vérifiés cryptographiquement.
- Installer un logiciel via un script `curl | sudo bash` trouvé en ligne contourne toute vérification d'authenticité et donne un accès root immédiat à un code non inspecté — une pratique à éviter au profit d'un dépôt officiel.
- `apt` (Debian/Ubuntu) sépare rafraîchissement (`update`) et mise à jour effective (`upgrade`) ; `dnf` (Rocky Linux/RHEL) combine les deux dans une seule opération.
- Ajouter un dépôt tiers officiel (clé de signature + source) prend à peine plus de temps qu'un script direct, tout en apportant vérification cryptographique et suivi automatique des futures mises à jour.
- Un logiciel installé hors du gestionnaire de paquets échappe à tout audit et suivi de version, créant un angle mort similaire au shadow IT du chapitre 3.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Sur Debian/Ubuntu, la commande qui rafraîchit la liste des paquets disponibles sans rien installer est :
   - a) `apt upgrade`
   - b) `apt update`
   - c) `apt install`
   - d) `apt autoremove`

2. Le principal risque d'un script `curl | sudo bash` exécuté depuis un tutoriel en ligne est :
   - a) Il est toujours plus lent qu'une installation via dépôt
   - b) Il contourne la vérification cryptographique et s'exécute avec un accès root total sans inspection
   - c) Il ne fonctionne jamais sur Ubuntu Server
   - d) Il installe systématiquement un virus

3. Sur Rocky Linux/RHEL, le gestionnaire de paquets standard est :
   - a) `apt`
   - b) `dnf`
   - c) `npm`
   - d) `pip`

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. `dnf upgrade` rafraîchit automatiquement les métadonnées avant la mise à jour, contrairement à `apt upgrade` seul. — **Vrai**.
2. Un logiciel installé via un script manuel bénéficie automatiquement des futures mises à jour de sécurité au même titre qu'un paquet du dépôt officiel. — **Faux** (il échappe totalement au suivi du gestionnaire de paquets).
3. Ajouter un dépôt tiers signé et vérifié est toujours moins sûr qu'un script direct. — **Faux** (c'est l'inverse : le dépôt signé offre une vérification que le script direct n'offre pas).
4. `dpkg -S` permet de savoir quel paquet a installé un fichier précis sur le système. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi la vérification cryptographique d'un dépôt officiel change fondamentalement le niveau de confiance par rapport à un script téléchargé directement.
2. Reprends le scénario d'ouverture. Rédige une réponse de 3 à 4 phrases au développeur, qui reconnaît que sa méthode fonctionnerait probablement, tout en expliquant pourquoi elle n'est pas recommandée.

**Corrigé 1** : la signature cryptographique d'un dépôt garantit mathématiquement que le paquet reçu provient bien de la source annoncée et n'a été modifié par personne entre sa publication et son téléchargement — une garantie qu'aucun script téléchargé directement ne peut offrir, puisque rien ne prouve son origine réelle ni son intégrité au moment de l'exécution. Cette garantie protège contre deux scénarios distincts : une usurpation de la source (un attaquant se faisant passer pour l'éditeur légitime) et une altération en transit (une modification du contenu entre la publication et la réception).

**Corrigé 2** : je lui dirais que sa méthode fonctionnerait très probablement sans incident dans l'immédiat, ce qui explique pourquoi elle reste répandue malgré ses risques. Le problème n'est pas la probabilité d'un incident sur cette installation précise, mais le principe : un accès root total accordé à un code jamais vérifié reste une porte ouverte inutile, alors qu'une alternative presque aussi rapide (le dépôt officiel de l'outil) offre une vraie garantie de provenance et de suivi des futures mises à jour, pour un coût en temps minime.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 15.1</span>

Un collègue installe un paquet sur un serveur Rocky Linux avec `dnf install nginx`, sans avoir exécuté de commande de rafraîchissement au préalable. Explique pourquoi ce n'est pas une erreur, contrairement à ce qui se passerait avec `apt install` seul sur Ubuntu sans `apt update` préalable.
</div>

**Corrigé :** Contrairement à `apt`, qui nécessite un `apt update` explicite et distinct pour rafraîchir ses métadonnées locales, `dnf` rafraîchit automatiquement ses métadonnées à chaque opération avant de procéder (section 15.4) — une seule commande `dnf install` suffit donc à garantir que la liste des paquets disponibles est à jour, sans étape séparée nécessaire.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 15.2</span>

Rédige, en 3 à 5 phrases, une politique courte que tu proposerais à ton équipe concernant l'installation de logiciels tiers non disponibles dans les dépôts officiels de la distribution.
</div>

**Corrigé (exemple de réponse) :** Toute installation de logiciel tiers doit d'abord privilégier le dépôt officiel signé du projet concerné, ajouté et documenté selon la procédure de la section 15.5. Si aucun dépôt officiel fiable n'existe, l'alternative recommandée est un conteneur Docker basé sur une image officielle vérifiée (Partie 7), plutôt qu'un script exécuté directement en tant que root. Toute exception à cette politique doit être documentée avec sa justification précise (chapitre 3) et validée par un second membre de l'équipe, suivant le même principe que la revue d'un changement à risque (chapitre 2).

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je comprends ce qu'est un paquet et un dépôt, et pourquoi leur provenance compte.</li>
<li>☐ Je sais utiliser les commandes de base de `apt` (Debian/Ubuntu) et `dnf` (Rocky Linux/RHEL).</li>
<li>☐ Je comprends la différence entre `apt update` et `apt upgrade`.</li>
<li>☐ Je sais pourquoi éviter un script `curl | sudo bash` non vérifié, et quelle alternative privilégier.</li>
<li>☐ Je sais ajouter un dépôt tiers officiel de façon sécurisée (clé de signature + source).</li>
<li>☐ Je sais diagnostiquer une erreur de dépendances de base.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Peut-on avoir plusieurs versions du même logiciel installées simultanément via le gestionnaire de paquets ?</dt>
<dd>Généralement non de façon native avec `apt` ou `dnf` seuls (une seule version est installée à la fois par défaut) — des outils complémentaires comme les conteneurs Docker (Partie 7) ou des gestionnaires de version dédiés à un langage précis répondent à ce besoin spécifique quand plusieurs versions doivent réellement coexister.</dd>

<dt>Faut-il toujours faire `apt upgrade` dès qu'une mise à jour est disponible ?</dt>
<dd>Pas immédiatement et sans réflexion sur un serveur de production critique — suivre le processus de changement du chapitre 2 (test préalable, fenêtre de maintenance planifiée) reste recommandé, sauf pour des correctifs de sécurité critiques qui justifient une application plus rapide après une évaluation de risque accélérée.</dd>

<dt>Comment savoir si un dépôt tiers est fiable avant de l'ajouter ?</dt>
<dd>Vérifier qu'il s'agit bien du dépôt officiel documenté sur le site du projet logiciel lui-même (pas un lien trouvé dans un forum ou un tutoriel tiers non officiel), et que la clé de signature provient de la même source officielle — les mêmes réflexes de vérification de provenance que pour tout téléchargement sensible.</dd>

<dt>Les commandes `apt` et `dnf` fonctionnent-elles de la même façon en mode non interactif (scripts d'automatisation) ?</dt>
<dd>Toutes deux disposent d'options pour un usage non interactif (comme <code>-y</code> pour confirmer automatiquement), essentielles pour l'automatisation via des outils comme Ansible, approfondie au chapitre 52 — mais leur usage en script mérite encore plus de rigueur que leur usage manuel, faute de vérification humaine avant exécution.</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle Debian — APT : [https://wiki.debian.org/Apt](https://wiki.debian.org/Apt)
- Documentation officielle Ubuntu — Gestion des paquets : [https://ubuntu.com/server/docs/package-management](https://ubuntu.com/server/docs/package-management)
- Documentation officielle Red Hat — Gestion des paquets avec DNF : [https://access.redhat.com/documentation/fr-fr/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/managing-software-packages_configuring-basic-system-settings](https://access.redhat.com/documentation/fr-fr/red_hat_enterprise_linux/9/html/configuring_basic_system_settings/managing-software-packages_configuring-basic-system-settings)

*Chapitre suivant : systemd — comprendre comment les services démarrent, s'arrêtent et sont supervisés sur un système Linux moderne, la brique qui rend chaque logiciel installé dans ce chapitre réellement opérationnel.*

<div class="chapitre-titre-num">CHAPITRE 21</div>

# Python pour l'administration système

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Savoir reconnaître quand un besoin dépasse ce que Bash peut raisonnablement gérer, et utiliser Python pour ces cas précis : traitement de données structurées (JSON), appels réseau, logique conditionnelle complexe. À la fin de ce chapitre, tu sauras écrire un script Python robuste pour l'administration système, gérer ses erreurs proprement, le journaliser correctement, et éviter la faille de sécurité la plus fréquente liée à l'exécution de commandes système depuis Python.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Le script Bash de vérification quotidienne du chapitre 20 fonctionne bien, mais l'entreprise souhaite maintenant l'étendre : vérifier aussi l'état de santé du portail client via son API (`GET /health`, qui renvoie un document JSON détaillé), agréger les résultats des serveurs de Port-au-Prince ET du Cap-Haïtien, puis envoyer un rapport structuré par email si un problème est détecté. Tu tentes d'écrire cette logique en Bash, mais le traitement du JSON devient rapidement illisible (analyse de texte fragile avec `grep`/`sed`), et la gestion des deux sites avec leurs propres conditions d'erreur alourdit considérablement le script. C'est exactement le signal qui indique qu'il est temps de passer à Python — pas parce que Bash serait "mauvais", mais parce que ce besoin précis dépasse son terrain de prédilection.
</div>

## 21.1 Bash ou Python : reconnaître le bon moment pour basculer

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — un critère de décision simple</span>
Bash excelle pour orchestrer des commandes système et des pipelines simples (chapitre 20) — sa syntaxe devient rapidement pénible dès qu'il faut manipuler des données structurées (JSON, XML), faire des appels réseau élaborés, ou gérer une logique conditionnelle complexe avec de nombreux cas. Python, avec sa bibliothèque standard riche et son écosystème de paquets, prend le relais naturellement à partir de ce point — exactement le signal rencontré dans le scénario d'ouverture avec le traitement JSON de l'API du portail.
</div>

## 21.2 L'environnement Python sur un serveur : toujours utiliser un environnement virtuel

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ne jamais faire `pip install` directement sur l'installation Python du système</span>
Installer des paquets Python directement dans l'installation système (avec un simple <code>pip install requests</code> sans précaution) risque d'entrer en conflit avec des paquets système qui dépendent eux-mêmes d'une version précise de Python et de ses bibliothèques (de nombreux outils système modernes sont eux-mêmes écrits en Python) — une pratique désormais bloquée par défaut sur les distributions récentes (Ubuntu 23.04+, Debian 12+), précisément pour cette raison.
</div>

```
# Creer un environnement virtuel dedie a ce script, isole de
# l'installation Python du systeme
python3 -m venv /opt/scripts/venv-healthcheck

# Activer cet environnement virtuel (a faire avant toute installation
# de paquet ou execution du script)
source /opt/scripts/venv-healthcheck/bin/activate

# Installer les paquets necessaires UNIQUEMENT dans cet environnement
# virtuel isole, sans affecter le systeme
pip install requests

# Quitter l'environnement virtuel une fois termine
deactivate
```

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — un environnement virtuel par script ou projet</span>
Chaque script ou projet Python d'administration système mérite son propre environnement virtuel dédié, listant ses dépendances précises dans un fichier <code>requirements.txt</code> — une pratique qui rend le script reproductible sur un autre serveur (<code>pip install -r requirements.txt</code>) sans ambiguïté sur les versions exactes utilisées.
</div>

## 21.3 Un script Python structuré pour le scénario d'ouverture

```python
#!/usr/bin/env python3
"""health_check.py — Verification de sante multi-sites du portail client."""

import logging
import subprocess
import sys
from pathlib import Path

import requests

logging.basicConfig(
    filename="/var/log/health-check-python.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

SITES = {
    "Port-au-Prince": "https://portail-pap.assuranceht.local/health",
    "Cap-Haitien": "https://portail-cap.assuranceht.local/health",
}


def verifier_site(nom: str, url: str) -> dict:
    """Interroge l'API de sante d'un site et retourne son etat structure."""
    try:
        reponse = requests.get(url, timeout=5)
        reponse.raise_for_status()
        return {"site": nom, "statut": "OK", "details": reponse.json()}
    except requests.exceptions.RequestException as erreur:
        logger.error("Echec de verification pour %s : %s", nom, erreur)
        return {"site": nom, "statut": "ERREUR", "details": str(erreur)}


def main() -> int:
    resultats = [verifier_site(nom, url) for nom, url in SITES.items()]
    erreurs = [r for r in resultats if r["statut"] == "ERREUR"]

    for resultat in resultats:
        logger.info("%s : %s", resultat["site"], resultat["statut"])

    if erreurs:
        logger.warning("%d site(s) en erreur sur %d", len(erreurs), len(resultats))
        return 1

    logger.info("Tous les sites sont operationnels")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Explication des choix de conception</span>
Le dictionnaire <code>SITES</code> centralise la configuration des deux sites, rendant l'ajout d'un futur troisième site trivial (une seule ligne à ajouter, contrairement au tableau Bash qu'il aurait fallu étendre avec une logique similaire dupliquée). <code>requests.get(..., timeout=5)</code> évite qu'un site injoignable ne bloque indéfiniment le script — un piège fréquent des appels réseau sans limite de temps explicite, que Bash gère beaucoup plus difficilement sans outils externes. La fonction <code>verifier_site</code> retourne une structure de données cohérente (un dictionnaire), bien plus facile à agréger et à traiter ensuite que du texte brut à reparser.
</div>

## 21.4 Gestion des erreurs : `try`/`except` plutôt que `set -e`

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une exception non gérée arrête le script avec une trace complète (traceback)</span>
Contrairement à Bash où une commande échouée peut passer inaperçue sans `set -e` (chapitre 20), Python arrête immédiatement l'exécution dès qu'une exception non interceptée survient, en affichant une trace complète (*traceback*) montrant exactement où et pourquoi l'erreur s'est produite — un comportement par défaut déjà plus sûr que celui de Bash, mais qui nécessite quand même une gestion explicite (`try`/`except`) pour les erreurs **attendues** (comme un site injoignable dans le scénario d'ouverture), qu'on ne veut pas laisser interrompre brutalement tout le script.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — capturer des exceptions précises, jamais un `except:` générique</span>
La fonction <code>verifier_site</code> capture spécifiquement <code>requests.exceptions.RequestException</code> — la famille d'erreurs réseau attendues (timeout, connexion refusée, certificat invalide) — plutôt qu'un <code>except:</code> générique qui masquerait aussi des erreurs de programmation totalement différentes (une faute de frappe dans le code, par exemple), rendant le débogage futur beaucoup plus difficile en cachant la vraie nature du problème.
</div>

## 21.5 Journaliser avec le module `logging`, jamais avec `print`

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance — pourquoi `logging` plutôt que `print`</span>
Le module <code>logging</code> de la bibliothèque standard (utilisé dans le script de la section 21.3) offre nativement l'horodatage automatique, des niveaux de gravité (INFO, WARNING, ERROR), et un envoi simultané possible vers plusieurs destinations (fichier, console, système de journalisation centralisé comme celui du chapitre 16) — toutes des fonctionnalités qu'un simple <code>print</code> n'offre pas, et qu'il faudrait réimplémenter manuellement et imparfaitement. Utiliser <code>logging</code> dès le départ, même pour un petit script, évite d'avoir à tout réécrire plus tard quand le besoin de journalisation structurée devient réel.
</div>

## 21.6 La faille de sécurité à connaître absolument : `subprocess` avec `shell=True`

```python
# DANGEREUX : injection de commande possible si "nom_fichier"
# provient d'une source externe non maitrisee
import subprocess
nom_fichier = obtenir_depuis_une_source_externe()
subprocess.run(f"cat {nom_fichier}", shell=True)   # NE JAMAIS FAIRE CECI

# SUR : la liste d'arguments evite completement l'interpretation
# par un shell, donc l'injection de commande
subprocess.run(["cat", nom_fichier], shell=False)
```

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — pourquoi `shell=True` avec une entrée non maîtrisée est une faille critique</span>
Avec <code>shell=True</code>, la chaîne de commande est interprétée par un shell complet, exactement comme si elle avait été tapée dans un terminal — si <code>nom_fichier</code> contient quelque chose comme <code>"; rm -rf /"</code>, cette portion malveillante s'exécute également, comme une commande distincte. C'est l'équivalent Python direct des injections SQL (chapitre 25 pour la sécurité applicative plus large) : ne jamais faire confiance à une entrée externe interprétée par un interpréteur de commandes. La forme en liste (<code>["cat", nom_fichier]</code>, sans <code>shell=True</code>) élimine structurellement ce risque, car chaque élément de la liste est traité comme un argument littéral, jamais réinterprété par un shell.
</div>

## Atelier — Étendre le script pour envoyer une alerte email

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 21 — Ajouter l'envoi d'un rapport email en cas d'erreur</span>

**Objectif** : compléter le script de la section 21.3 pour répondre entièrement au besoin du scénario d'ouverture (rapport par email en cas de problème détecté).

**Préparation** : aucune installation nécessaire pour cet atelier conceptuel — il s'agit de raisonner sur la structure du code, pas de configurer un vrai serveur SMTP.

**Étapes détaillées** :

1. Décris, en pseudo-code ou en Python, où dans le script `main()` de la section 21.3 il faudrait ajouter l'envoi d'un email, et sous quelle condition précise.
2. Explique pourquoi cet envoi doit lui-même être entouré d'une gestion d'erreur (`try`/`except`) plutôt que d'être exécuté sans protection.
3. Propose le contenu minimal que ce rapport email devrait inclure, en t'appuyant sur les informations déjà collectées dans `resultats`.
4. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : l'envoi d'email doit se déclencher uniquement si `erreurs` n'est pas vide, juste avant le `return 1`. Il doit être entouré de son propre `try`/`except`, car un échec de l'envoi d'email lui-même (serveur SMTP injoignable) ne doit jamais empêcher le script de se terminer proprement et de retourner un code d'erreur cohérent — un échec secondaire ne doit jamais masquer l'échec principal déjà détecté. Le contenu minimal du rapport reprend la liste des sites en erreur avec leur détail (`resultat["details"]`), suffisant pour qu'un destinataire humain comprenne immédiatement quoi vérifier sans avoir à se reconnecter au serveur pour consulter le journal complet.

**Dépannage** : si tu hésites sur la structure exacte de l'envoi d'email en Python, cherche la bibliothèque standard `smtplib` ou une bibliothèque tierce comme celle déjà utilisée dans le module PowerShell/notification d'autres chapitres — le principe reste le même : construire un message structuré, l'envoyer via une connexion protégée, et gérer l'échec de cet envoi séparément de la logique métier principale.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — `pip install` directement sur le Python système</span>
Rappel de la section 21.2 : une pratique risquant des conflits avec les paquets système, à éviter systématiquement au profit d'un environnement virtuel dédié.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — `subprocess` avec `shell=True` sur une entrée non maîtrisée</span>
La faille de sécurité critique de la section 21.6 — une pratique qui semble fonctionner parfaitement en test, mais qui expose le système à une injection de commande dès qu'une entrée malveillante ou simplement inattendue est fournie.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — `except:` générique qui masque toutes les erreurs indistinctement</span>
Rappel de la section 21.4 : capturer toutes les exceptions sans distinction cache aussi bien les erreurs attendues (réseau) que les erreurs de programmation réelles, rendant le débogage futur beaucoup plus difficile.
</div>

## Diagnostiquer un script Python qui échoue

<div class="encadre attention">
<span class="encadre-titre">🩺 Situation : "Le script Python se termine avec une trace d'erreur (traceback) incompréhensible"</span>

- **Diagnostic** : contrairement à un script Bash qui peut échouer silencieusement (chapitre 20), Python affiche par défaut une trace complète — la dernière ligne de cette trace indique généralement le type d'erreur précis (`KeyError`, `TypeError`, `ConnectionError`...) et sa cause immédiate.
- **Comment vérifier** : lire la trace de bas en haut : la dernière ligne donne le type et le message d'erreur ; les lignes précédentes montrent la chaîne d'appels de fonctions qui a mené à cette erreur, permettant de remonter jusqu'à la ligne de code exacte en cause.
- **Résolution** : une fois la ligne et le type d'erreur identifiés, ajouter une gestion d'exception ciblée si l'erreur est attendue dans certains cas (section 21.4), ou corriger directement le code si l'erreur révèle un vrai bug de logique (comme une faute de frappe ou une hypothèse incorrecte sur la structure des données).
</div>

## En entreprise

- **Bonne pratique répandue** : maintenir un fichier `requirements.txt` versionné (chapitre 51) pour chaque script Python de production, garantissant que l'environnement peut être reconstruit à l'identique sur un autre serveur en cas de besoin.
- **Bonne pratique répandue** : faire relire (revue de code) tout script Python touchant à des données sensibles ou exécutant des commandes système, avec une attention particulière portée à l'usage de `subprocess` — exactement le type de vigilance qui aurait détecté un `shell=True` risqué avant sa mise en production.
- **Erreur classique observée** : des scripts Python "de test" écrits rapidement sans gestion d'erreur ni journalisation, jamais retravaillés avant leur passage en production, où leurs lacunes deviennent alors critiques.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Dans quel cas choisirais-tu Python plutôt que Bash pour un script d'administration système ?"**
Réponse attendue : dès que le besoin implique du traitement de données structurées (JSON, XML), des appels réseau élaborés avec gestion d'erreurs fine, ou une logique conditionnelle complexe — Bash reste préférable pour orchestrer des commandes système simples, mais devient rapidement pénible au-delà.

**Q2. "Pourquoi `subprocess.run(commande, shell=True)` est-il dangereux avec une entrée utilisateur non validée ?"**
Réponse attendue : `shell=True` fait interpréter la chaîne de commande par un shell complet, permettant à un attaquant d'injecter des commandes supplémentaires via l'entrée fournie — la forme en liste d'arguments, sans `shell=True`, élimine structurellement ce risque en traitant chaque élément comme un argument littéral.

**Q3. "Pourquoi préférer le module `logging` à de simples `print` dans un script de production ?"**
Réponse attendue : `logging` offre nativement l'horodatage, des niveaux de gravité distincts, et la possibilité d'envoyer les journaux vers plusieurs destinations simultanément — des fonctionnalités indispensables pour un script exécuté automatiquement et sans surveillance humaine directe.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
N'utilise jamais `shell=True` avec une chaîne construite à partir d'une entrée externe non validée — la forme en liste d'arguments doit être le réflexe par défaut, `shell=True` l'exception rare et consciente.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Structure chaque script Python de production avec des fonctions nommées clairement (comme `verifier_site` dans l'exemple de ce chapitre), un `requirements.txt` versionné, et une documentation de son objectif dans la CMDB (chapitre 3) — les mêmes réflexes de maintenabilité déjà appliqués aux scripts Bash du chapitre 20.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Un `timeout` explicite sur tout appel réseau (comme dans `requests.get(..., timeout=5)`) évite qu'un site distant injoignable ne bloque indéfiniment l'exécution du script — un réflexe indispensable dès qu'un script interagit avec des ressources externes potentiellement peu fiables, exactement le cas du scénario d'ouverture avec deux sites géographiquement distants.
</div>

## Résumé du chapitre

- Python prend le relais de Bash dès qu'un besoin implique du traitement de données structurées, des appels réseau élaborés, ou une logique conditionnelle complexe.
- Un environnement virtuel dédié (`venv`) isole les dépendances d'un script Python, évitant tout conflit avec l'installation Python du système.
- `try`/`except` doit capturer des exceptions précises, jamais un `except:` générique qui masquerait aussi de vraies erreurs de programmation.
- Le module `logging` (jamais `print`) doit être utilisé pour tout script de production, avec horodatage et niveaux de gravité.
- `subprocess.run(..., shell=True)` avec une entrée non maîtrisée est une faille d'injection de commande critique — la forme en liste d'arguments doit être préférée par défaut.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Python devient généralement préférable à Bash pour un script d'administration système quand :
   - a) Le script doit uniquement redémarrer un service
   - b) Le besoin implique du traitement de données structurées ou des appels réseau élaborés
   - c) Le script doit être le plus court possible
   - d) Le serveur tourne sous Windows

2. La forme sûre d'appeler une commande système depuis Python, avec une entrée externe, est :
   - a) `subprocess.run(commande, shell=True)`
   - b) `subprocess.run(["commande", argument], shell=False)`
   - c) `os.system(commande)`
   - d) `eval(commande)`

3. Le module recommandé pour journaliser un script Python de production est :
   - a) `print`
   - b) `logging`
   - c) `sys.stdout` directement
   - d) `input`

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Il est recommandé d'installer des paquets Python directement sur l'installation système avec `pip install`. — **Faux** (un environnement virtuel dédié est recommandé, section 21.2).
2. `except:` générique capture toutes les erreurs, y compris de vraies erreurs de programmation non liées au problème attendu. — **Vrai**.
3. `shell=True` dans `subprocess.run` est toujours sans risque, quelle que soit la source de la commande. — **Faux** (un risque critique d'injection de commande avec une entrée non maîtrisée).
4. Un `timeout` explicite sur un appel réseau évite qu'un script ne reste bloqué indéfiniment face à un service injoignable. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi capturer précisément `requests.exceptions.RequestException` est préférable à un `except:` générique dans le script de la section 21.3.
2. Reprends le scénario d'ouverture. Explique en 3-4 phrases pourquoi le passage de Bash à Python pour ce besoin précis n'est pas un jugement de valeur sur Bash, mais un choix pragmatique selon la nature du besoin.

**Corrigé 1** : capturer précisément `requests.exceptions.RequestException` cible exactement les erreurs réseau attendues (timeout, connexion refusée, certificat invalide) sans masquer d'éventuelles erreurs de programmation totalement différentes dans le reste de la fonction — un `except:` générique capturerait aussi une faute de frappe ou une erreur de logique interne, donnant l'impression trompeuse que le site est simplement injoignable alors que le vrai problème serait ailleurs dans le code.

**Corrigé 2** : Bash reste parfaitement adapté et largement utilisé pour l'orchestration de commandes système simples, comme le script de vérification de services du chapitre 20 — rien dans ce chapitre ne remet en cause son utilité. Le passage à Python répond spécifiquement au besoin de traiter des données JSON structurées et de gérer plusieurs appels réseau avec des conditions d'erreur distinctes par site, un terrain où la syntaxe de Bash devient rapidement fragile et difficile à maintenir. Le bon réflexe est de choisir l'outil adapté à la nature précise du besoin, pas de considérer l'un supérieur à l'autre dans l'absolu.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 21.1</span>

Un développeur propose d'écrire `subprocess.run(f"ping -c 1 {adresse_ip}", shell=True)` où `adresse_ip` provient d'un formulaire web rempli par un utilisateur externe. Explique le risque exact et propose une version corrigée.
</div>

**Corrigé :** Si `adresse_ip` contient une valeur malveillante comme `"8.8.8.8; rm -rf /"`, le shell interprété par `shell=True` exécuterait la commande `ping` ET la commande destructrice supplémentaire, puisque le point-virgule sépare deux commandes distinctes pour un shell — exactement la faille de la section 21.6. La version corrigée utilise la forme en liste : `subprocess.run(["ping", "-c", "1", adresse_ip], shell=False)`, qui traite `adresse_ip` comme un argument unique et littéral, sans jamais l'interpréter comme une commande shell supplémentaire, éliminant structurellement ce risque d'injection.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 21.2</span>

Rédige, en 3 à 5 phrases, pourquoi un `requirements.txt` versionné est important pour la maintenabilité à long terme d'un script Python de production, en t'appuyant sur le chapitre 3.
</div>

**Corrigé (exemple de réponse) :** Un `requirements.txt` documente précisément quelles bibliothèques, et dans quelles versions, un script nécessite pour fonctionner correctement — sans lui, reconstruire l'environnement sur un nouveau serveur (ou après une panne nécessitant une réinstallation) devient une devinette risquée, avec le danger qu'une version différente d'une bibliothèque change subtilement le comportement du script. Ce fichier constitue exactement le type de documentation vivante évoquée au chapitre 3 : versionné avec le code lui-même (chapitre 51), il reste toujours synchronisé avec l'état réel du script, contrairement à une documentation externe qu'on pourrait oublier de mettre à jour.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais reconnaître quand un besoin justifie de passer de Bash à Python.</li>
<li>☐ Je sais créer et utiliser un environnement virtuel Python (`venv`) pour isoler les dépendances d'un script.</li>
<li>☐ Je sais capturer des exceptions précises plutôt qu'un `except:` générique.</li>
<li>☐ Je sais utiliser le module `logging` plutôt que `print` pour un script de production.</li>
<li>☐ Je comprends pourquoi `subprocess` avec `shell=True` sur une entrée non maîtrisée est une faille critique, et je sais l'éviter.</li>
<li>☐ Je sais lire une trace d'erreur Python (traceback) pour localiser la cause d'un échec.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Faut-il connaître un framework web (Django, Flask) pour utiliser Python en administration système ?</dt>
<dd>Non, ce chapitre couvre du Python "utilitaire" pur, sans aucun besoin de framework web — les scripts d'administration système utilisent principalement la bibliothèque standard et quelques bibliothèques ciblées comme `requests`, un usage très différent du développement d'applications web.</dd>

<dt>Quelle version de Python privilégier pour un script d'administration système en 2026 ?</dt>
<dd>La version fournie par défaut avec la distribution du serveur (généralement Python 3.10+ sur les distributions récentes) convient largement pour la plupart des besoins — éviter Python 2, définitivement obsolète et non maintenu depuis 2020, si jamais rencontré sur un système hérité.</dd>

<dt>Un script Python peut-il aussi être planifié avec cron, comme un script Bash ?</dt>
<dd>Oui, exactement de la même façon que dans le chapitre 20 — la seule différence est d'appeler l'interpréteur Python de l'environnement virtuel concerné (le chemin complet vers le `python3` du `venv`, pas le Python système) dans la ligne cron, pour garantir que les bonnes dépendances installées dans cet environnement virtuel soient bien utilisées.</dd>

<dt>Comment savoir si un script devrait être réécrit en Python plutôt que maintenu en Bash ?</dt>
<dd>Un signal fiable est la difficulté croissante à lire ou modifier un script Bash existant à cause de sa complexité (traitement de texte fragile pour des données structurées, nombreuses conditions imbriquées) — exactement le signal rencontré dans le scénario d'ouverture de ce chapitre, plutôt qu'une règle rigide basée uniquement sur la taille du script.</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle Python : [https://docs.python.org/fr/3/](https://docs.python.org/fr/3/)
- Documentation officielle du module `logging` : [https://docs.python.org/fr/3/library/logging.html](https://docs.python.org/fr/3/library/logging.html)
- Documentation officielle de la bibliothèque `requests` : [https://requests.readthedocs.io/](https://requests.readthedocs.io/)
- OWASP — Command Injection (pour approfondir le risque de la section 21.6) : [https://owasp.org/www-community/attacks/Command_Injection](https://owasp.org/www-community/attacks/Command_Injection)

*Fin de la Partie 3. La Partie 4 aborde maintenant l'identité, l'authentification et les annuaires — LDAP en profondeur, Kerberos, PKI/certificats/TLS et MFA, des fondations qui traversent aussi bien les environnements Windows que Linux déjà couverts.*

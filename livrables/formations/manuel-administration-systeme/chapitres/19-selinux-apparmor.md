<div class="chapitre-titre-num">CHAPITRE 19</div>

# Sécurité Linux : SELinux et AppArmor

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Comprendre le contrôle d'accès obligatoire (MAC), une couche de sécurité qui va au-delà des permissions traditionnelles et des ACL du chapitre 18, en limitant ce qu'un processus peut faire même s'il dispose techniquement des bonnes permissions Unix. À la fin de ce chapitre, tu sauras diagnostiquer un blocage SELinux sans céder au réflexe de le désactiver, comprendre la logique des profils AppArmor, et choisir la bonne approche de diagnostic selon la distribution utilisée.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
La compagnie d'assurance déploie un nouveau système de gestion documentaire, soumis à des exigences de conformité plus strictes que le portail client (chapitre 14) — le choix se porte sur Rocky Linux, suivant le cadre de décision du chapitre 14. Le développeur configure Nginx pour servir des documents depuis un dossier personnalisé, `/donnees/documents`, avec des permissions Unix parfaitement correctes (vérifiées trois fois). Pourtant, Nginx renvoie systématiquement une erreur 403 "Forbidden" en tentant d'accéder à ce dossier. <em>"Les permissions sont bonnes, `chmod` et `chown` sont corrects, je ne comprends pas"</em>, te dit-il, à deux doigts de proposer de "désactiver la sécurité pour que ça marche enfin". C'est exactement le moment où ce chapitre devient indispensable : le problème n'est ni un bug ni une permission Unix incorrecte, mais SELinux, une couche de sécurité entièrement différente.
</div>

## 19.1 Au-delà des permissions Unix : le contrôle d'accès obligatoire

Les permissions Unix traditionnelles et les ACL du chapitre 18 relèvent du **contrôle d'accès discrétionnaire** (DAC, *Discretionary Access Control*) : le propriétaire d'un fichier décide lui-même qui peut y accéder. **SELinux** et **AppArmor** ajoutent une couche de **contrôle d'accès obligatoire** (MAC, *Mandatory Access Control*) : même le propriétaire d'un fichier, même root, ne peut pas outrepasser une politique de sécurité centrale définie au niveau du système.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie — le badge d'accès d'un immeuble sécurisé</span>
Les permissions Unix ressemblent à une porte de bureau que son occupant peut librement verrouiller ou déverrouiller pour qui il veut (contrôle discrétionnaire). SELinux et AppArmor ressemblent au système de badge central d'un immeuble sécurisé : même si l'occupant d'un bureau te donne verbalement l'autorisation d'entrer, le badge central peut quand même te refuser l'accès si la politique de sécurité de l'immeuble ne prévoit pas cette entrée précise pour toi — une décision qui échappe totalement à l'occupant du bureau lui-même.
</div>

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
C'est exactement ce qui se passe dans le scénario d'ouverture : les permissions Unix (contrôle discrétionnaire) sont correctes, mais SELinux (contrôle obligatoire) applique une politique indépendante qui bloque quand même l'accès de Nginx à ce dossier précis, non prévu dans son contexte de sécurité habituel.
</div>

## 19.2 SELinux : la logique des contextes de sécurité

Sur Rocky Linux et RHEL, chaque fichier, dossier et processus porte un **contexte de sécurité** (ou *label*) — une étiquette qui détermine, selon la politique SELinux active, quelles interactions sont autorisées entre ce fichier et ce processus.

```
# Afficher les contextes de securite des fichiers d'un dossier
ls -Z /donnees/documents

# Afficher le contexte de securite des processus en cours
ps -eZ | grep nginx
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ La cause exacte du problème du scénario d'ouverture</span>
Le dossier standard servi par Nginx (`/usr/share/nginx/html`) porte le contexte <code>httpd_sys_content_t</code>, que la politique SELinux autorise explicitement pour Nginx. Un dossier personnalisé créé ailleurs (comme <code>/donnees/documents</code>) hérite par défaut du contexte de son emplacement parent — généralement un contexte générique non reconnu par la politique SELinux comme autorisé pour Nginx, même si les permissions Unix elles-mêmes sont parfaitement correctes. SELinux bloque alors l'accès, non pas parce que les permissions sont mauvaises, mais parce que le contexte de sécurité ne correspond pas à ce que la politique autorise pour ce type de processus.
</div>

```
# Corriger le contexte du dossier personnalise pour qu'il corresponde
# a ce que Nginx est autorise a lire (resout precisement le scenario
# d'ouverture)
sudo semanage fcontext -a -t httpd_sys_content_t "/donnees/documents(/.*)?"
sudo restorecon -Rv /donnees/documents
```

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — corriger le contexte plutôt que désactiver SELinux</span>
La solution correcte n'est jamais de désactiver SELinux "pour que ça marche" (section 19.6), mais d'ajuster précisément le contexte de sécurité du dossier concerné pour qu'il corresponde à l'usage réel prévu — exactement les deux commandes ci-dessus. Cette correction est ciblée, documentable, et ne réduit en rien la protection SELinux pour l'ensemble du reste du système.
</div>

## 19.3 Diagnostiquer méthodiquement un blocage SELinux

```
# Consulter les refus SELinux recents, la source d'information la
# plus directe pour comprendre pourquoi un acces a ete bloque
sudo ausearch -m avc -ts recent

# Generer automatiquement une regle de politique a partir d'un refus
# observe (a examiner et valider avant application, jamais appliquer
# aveuglement une regle generee automatiquement sans comprendre son effet)
sudo audit2allow -a
```

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : "Permission denied" ou erreur 403, alors que les permissions Unix semblent correctes</span>

- **Diagnostic** : sur un système Rocky Linux/RHEL, vérifier systématiquement SELinux avant de conclure à une erreur de configuration applicative — exactement le réflexe qui a manqué au développeur du scénario d'ouverture, prêt à désactiver "la sécurité" avant même d'avoir vérifié cette hypothèse.
- **Comment vérifier** : `ausearch -m avc -ts recent` révèle immédiatement si SELinux a effectivement bloqué une action récente, avec le contexte précis en cause.
- **Résolution** : ajuster le contexte de sécurité avec `semanage fcontext` et `restorecon` (section 19.2) pour le cas d'un fichier ou dossier mal étiqueté ; pour un besoin plus complexe (un service ayant besoin d'une capacité normalement non autorisée), examiner la suggestion générée par `audit2allow` avant de l'appliquer consciemment, jamais par réflexe automatique.
</div>

<div class="encadre memoriser">
<span class="encadre-titre">🧠 À mémoriser — la démarche en trois temps face à un blocage SELinux</span>
1. Confirmer que SELinux est bien la cause via `ausearch -m avc -ts recent`, plutôt que de le supposer ou de l'écarter sans vérification.
2. Comprendre précisément quel contexte est attendu et lequel est réellement présent.
3. Corriger le contexte de façon ciblée (`semanage`/`restorecon`), jamais désactiver la protection dans son ensemble.
</div>

## 19.4 AppArmor : une approche différente, par chemin de fichier

**AppArmor**, utilisé par défaut sur Ubuntu et Debian, répond au même objectif que SELinux (contrôle d'accès obligatoire) mais avec une approche différente : plutôt que d'étiqueter chaque fichier avec un contexte abstrait, AppArmor définit des **profils** par application, listant explicitement les chemins de fichiers auxquels cette application a le droit d'accéder.

```
# Voir l'etat des profils AppArmor charges
sudo aa-status

# Placer un profil en mode "plainte" (complain) : les violations sont
# journalisees mais PAS bloquees, utile pour observer le comportement
# reel d'une application avant de passer en mode strict
sudo aa-complain /etc/apparmor.d/usr.sbin.nginx

# Repasser un profil en mode strict (enforce), une fois le profil
# ajuste et valide
sudo aa-enforce /etc/apparmor.d/usr.sbin.nginx
```

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — SELinux vs AppArmor, la différence philosophique clé</span>
SELinux raisonne en <strong>contextes/labels</strong> abstraits attachés à chaque objet (fichier, processus), indépendamment de son chemin d'accès — une approche puissante mais avec une courbe d'apprentissage plus raide. AppArmor raisonne en <strong>chemins de fichiers</strong> explicites dans un profil dédié à chaque application — une approche plus intuitive à lire pour un débutant, mais potentiellement moins robuste si un fichier est déplacé ou accédé via un chemin non prévu explicitement dans le profil.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Le mode "plainte" (complain), un allié précieux pour le diagnostic</span>
Le mode <code>complain</code> d'AppArmor (section ci-dessus) permet d'observer ce qu'une application tenterait de faire sans réellement bloquer ces actions — un outil de diagnostic précieux avant de resserrer un profil, permettant de construire ou d'ajuster un profil à partir d'un usage réel observé, plutôt qu'en devinant à l'aveugle toutes les actions légitimes possibles.
</div>

## 19.5 Comparatif synthétique

| Critère | SELinux (RHEL/Rocky) | AppArmor (Ubuntu/Debian) |
|---|---|---|
| Approche | Contextes/labels abstraits | Profils par chemin de fichier |
| Courbe d'apprentissage | Plus raide | Plus intuitive pour un débutant |
| Granularité | Très fine | Fine, mais liée aux chemins explicites |
| Outil de diagnostic principal | `ausearch`, `audit2allow` | `aa-status`, mode `complain` |
| Mode d'observation sans blocage | `permissive` (systémique) | `complain` (par profil) |

## 19.6 Le piège classique : désactiver la protection "pour que ça marche"

<div class="encadre mauvaise-pratique">
<span class="encadre-titre">❌ Mauvaise pratique — `setenforce 0` en production, sans jamais revenir en arrière</span>
Face à un blocage SELinux frustrant et mal compris, le réflexe le plus répandu — et le plus dangereux — consiste à désactiver purement et simplement SELinux (<code>setenforce 0</code>, ou pire, une désactivation permanente dans la configuration du système). Cette "solution" élimine effectivement le symptôme immédiat, mais désactive aussi toute la protection MAC pour l'ensemble du système, pas seulement pour le cas précis qui posait problème — annulant complètement le bénéfice de sécurité que SELinux était censé apporter, souvent de façon permanente puisque personne ne pense à réactiver la protection une fois le problème immédiat "résolu".
</div>

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — le mode "permissive" comme outil de diagnostic temporaire, jamais comme solution finale</span>
Le mode <code>permissive</code> de SELinux (équivalent au mode <code>complain</code> d'AppArmor) journalise les violations sans les bloquer — utile pour un diagnostic temporaire et contrôlé (identifier précisément ce qui serait bloqué), mais ne doit jamais devenir l'état permanent d'un serveur de production. La bonne pratique reste toujours de revenir en mode <code>enforcing</code> une fois le contexte ou le profil correctement ajusté, jamais de rester indéfiniment en mode diagnostic par facilité.
</div>

## Atelier — Diagnostiquer et corriger le scénario d'ouverture

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 19 — Résoudre le blocage Nginx sans désactiver SELinux</span>

**Objectif** : appliquer la démarche méthodique de la section 19.3 pour résoudre le problème exact du scénario d'ouverture, sans céder au réflexe de désactivation.

**Préparation** : accès à un serveur Rocky Linux de test avec Nginx installé (chapitre 15), ou une lecture attentive suffit pour cet atelier conceptuel.

**Étapes détaillées** :

1. Rédige la commande pour confirmer que SELinux est bien la cause du refus d'accès observé par le développeur.
2. Rédige les deux commandes nécessaires pour corriger le contexte de sécurité du dossier `/donnees/documents`, en t'appuyant sur la section 19.2.
3. Explique en 2-3 phrases pourquoi cette solution est préférable à `setenforce 0`.
4. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : `sudo ausearch -m avc -ts recent` confirme la cause exacte. `sudo semanage fcontext -a -t httpd_sys_content_t "/donnees/documents(/.*)?"` puis `sudo restorecon -Rv /donnees/documents` corrigent précisément et durablement le contexte du dossier concerné. Cette solution est préférable car elle résout le problème réel (un contexte mal configuré) sans désactiver la protection SELinux pour l'ensemble du système — Nginx reste protégé contre tout accès non prévu ailleurs sur le serveur, seul l'accès légitime à ce dossier précis est désormais autorisé.

**Dépannage** : si la correction de contexte ne résout pas entièrement le problème, vérifie si un booléen SELinux distinct doit aussi être activé (par exemple `httpd_can_network_connect` pour certains scénarios réseau) via `getsebool -a | grep httpd` — un mécanisme SELinux complémentaire aux contextes de fichiers, hors du périmètre détaillé de ce chapitre introductif mais utile à savoir chercher en cas de blocage persistant.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — désactiver SELinux ou AppArmor au premier blocage rencontré</span>
Le réflexe le plus répandu et le plus risqué, détaillé en section 19.6 — la protection MAC existe précisément pour bloquer des accès non prévus, la désactiver élimine cette protection pour l'ensemble du système, pas seulement pour le cas gênant du moment.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — appliquer aveuglément une règle générée par `audit2allow`</span>
`audit2allow` génère une règle technique valide, mais ne juge jamais si cette règle est réellement souhaitable du point de vue de la sécurité — l'appliquer sans comprendre ce qu'elle autorise réellement peut ouvrir un accès plus large que nécessaire, à l'encontre du principe du moindre privilège (chapitre 1).
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — oublier de vérifier SELinux/AppArmor lors d'un diagnostic applicatif</span>
Exactement le piège initial du développeur dans le scénario d'ouverture — passer un temps considérable à revérifier les permissions Unix, déjà correctes, sans penser à la couche de sécurité MAC potentiellement en cause.
</div>

## En entreprise

- **Bonne pratique répandue** : documenter (chapitre 3) chaque contexte SELinux personnalisé ou profil AppArmor ajusté, avec sa justification — un audit de sécurité futur doit pouvoir comprendre rapidement pourquoi chaque exception à la politique par défaut existe.
- **Bonne pratique répandue** : utiliser systématiquement le mode diagnostic (`permissive`/`complain`) de façon temporaire et contrôlée pour comprendre un nouveau déploiement, jamais comme configuration permanente de production.
- **Erreur classique observée** : une infrastructure entière avec SELinux désactivé "depuis le début du projet, personne ne se souvient trop pourquoi", révélée lors d'un audit de sécurité — une dette de sécurité accumulée silencieusement, difficile à corriger rétroactivement sans un travail de reconstruction méthodique des contextes appropriés.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Quelle est la différence entre le contrôle d'accès discrétionnaire (DAC) et obligatoire (MAC) ?"**
Réponse attendue : le DAC (permissions Unix traditionnelles, ACL) laisse le propriétaire d'une ressource décider qui peut y accéder ; le MAC (SELinux, AppArmor) applique une politique de sécurité centrale que même le propriétaire ou root ne peut pas outrepasser, ajoutant une couche de protection indépendante des permissions traditionnelles.

**Q2. "Un développeur te dit que SELinux 'bloque tout n'importe comment' et propose de le désactiver. Que lui réponds-tu ?"**
Réponse attendue : SELinux ne bloque jamais "n'importe comment" — chaque refus a une cause précise et traçable via `ausearch -m avc`, généralement un contexte de sécurité mal configuré plutôt qu'un vrai bug de SELinux lui-même. La bonne réponse est de diagnostiquer et corriger le contexte précis en cause, jamais de désactiver la protection pour l'ensemble du système.

**Q3. "Quelle est la différence philosophique principale entre SELinux et AppArmor ?"**
Réponse attendue : SELinux raisonne en contextes/labels abstraits attachés aux objets, indépendamment de leur chemin d'accès ; AppArmor raisonne en chemins de fichiers explicites dans des profils par application — une approche plus intuitive à lire, mais potentiellement moins robuste face à des chemins d'accès non prévus explicitement.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Ne désactive jamais SELinux ou AppArmor en production comme solution à un blocage — diagnostique toujours la cause précise (section 19.3) et corrige le contexte ou le profil de façon ciblée, en conservant la protection active pour tout le reste du système.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documente (chapitre 3) chaque ajustement de contexte SELinux ou de profil AppArmor effectué en production, avec sa justification précise — une information indispensable pour tout futur audit ou toute personne reprenant l'administration de ce serveur.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
La surcharge de performance de SELinux ou AppArmor est généralement négligeable sur un serveur moderne — un argument de performance n'est presque jamais une raison légitime de désactiver cette protection, contrairement à une idée reçue parfois avancée pour justifier une désactivation par facilité.
</div>

## Résumé du chapitre

- Le contrôle d'accès obligatoire (MAC), via SELinux ou AppArmor, ajoute une couche de sécurité indépendante des permissions Unix traditionnelles (DAC) du chapitre 18.
- SELinux (RHEL/Rocky) fonctionne par contextes de sécurité abstraits ; AppArmor (Ubuntu/Debian) fonctionne par profils basés sur des chemins de fichiers explicites.
- Un blocage SELinux ou AppArmor se diagnostique méthodiquement (`ausearch`, `aa-status`), jamais en désactivant purement et simplement la protection.
- Le mode `permissive`/`complain` est un outil de diagnostic temporaire, jamais une configuration permanente de production.
- `audit2allow` génère des règles techniquement valides, mais nécessite toujours une validation humaine avant application, pour éviter d'ouvrir un accès plus large que nécessaire.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Le contrôle d'accès obligatoire (MAC) se distingue du contrôle discrétionnaire (DAC) car :
   - a) Il est plus rapide à configurer
   - b) Même le propriétaire d'une ressource ne peut pas outrepasser la politique centrale
   - c) Il remplace entièrement le besoin de permissions Unix
   - d) Il ne concerne que les utilisateurs root

2. SELinux est utilisé par défaut sur :
   - a) Ubuntu et Debian
   - b) RHEL et Rocky Linux
   - c) Windows Server
   - d) Toutes les distributions Linux de façon identique

3. La bonne pratique face à un blocage SELinux mal compris est de :
   - a) Désactiver SELinux immédiatement
   - b) Diagnostiquer la cause précise et corriger le contexte concerné
   - c) Redémarrer le serveur en boucle jusqu'à ce que ça fonctionne
   - d) Passer à AppArmor à la place

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Le mode `permissive` de SELinux bloque les accès non autorisés tout en les journalisant. — **Faux** (il journalise sans bloquer, section 19.6).
2. AppArmor raisonne principalement en chemins de fichiers explicites par profil applicatif. — **Vrai**.
3. `audit2allow` peut être appliqué automatiquement sans revue humaine, ses règles étant toujours sûres. — **Faux** (une revue humaine reste nécessaire, section 19.6).
4. Désactiver SELinux résout un blocage précis sans affecter la protection du reste du système. — **Faux** (cela désactive la protection pour l'ensemble du système, pas seulement le cas problématique).
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi un problème de permissions Unix parfaitement correctes peut quand même provoquer une erreur "Permission denied" sur un système avec SELinux actif.
2. Reprends le scénario d'ouverture. Explique ce que tu répondrais au développeur qui propose de "désactiver la sécurité pour que ça marche".

**Corrigé 1** : les permissions Unix (DAC) et SELinux (MAC) sont deux couches de contrôle d'accès totalement indépendantes, qui doivent toutes les deux autoriser une action pour qu'elle réussisse. Des permissions Unix correctes garantissent seulement que la première couche autorise l'accès — si le contexte de sécurité SELinux du fichier ne correspond pas à ce que la politique autorise pour le processus concerné, la seconde couche bloque quand même l'accès, indépendamment de la validité de la première.

**Corrigé 2** : je lui expliquerais que SELinux ne bloque jamais arbitrairement — le refus observé a une cause précise et vérifiable (`ausearch -m avc`), presque toujours un contexte de sécurité mal configuré plutôt qu'un vrai obstacle à contourner. Désactiver SELinux résoudrait ce cas précis, mais supprimerait aussi la protection pour l'ensemble du système, exposant potentiellement d'autres services à des risques que SELinux aurait autrement bloqués. La correction ciblée du contexte (section 19.2) résout le problème réel sans ce compromis de sécurité disproportionné.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 19.1</span>

Un fichier a des permissions Unix `rwxr-xr-x` et appartient à l'utilisateur `nginx`, ce qui semble parfaitement correct pour un accès en lecture par le processus Nginx. Pourtant, Nginx reçoit une erreur "Permission denied" en tentant de le lire sur un serveur Rocky Linux. Propose une explication possible et la commande pour la vérifier.
</div>

**Corrigé :** La cause la plus probable est un contexte de sécurité SELinux incorrect sur ce fichier — les permissions Unix peuvent être parfaitement correctes tout en étant bloquées par la couche MAC indépendante de SELinux (section 19.1). La commande `sudo ausearch -m avc -ts recent` permettrait de confirmer cette hypothèse en révélant un éventuel refus SELinux récent lié à ce fichier, avant de corriger le contexte avec `semanage fcontext` et `restorecon` si l'hypothèse se confirme.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 19.2</span>

Rédige, en 3 à 5 phrases, pourquoi le mode `permissive`/`complain` est un outil précieux pendant le déploiement initial d'un nouveau service, mais dangereux s'il reste actif indéfiniment en production.
</div>

**Corrigé (exemple de réponse) :** Pendant un déploiement initial, le mode `permissive`/`complain` permet d'observer précisément quelles actions un nouveau service tente de réaliser, sans bloquer son fonctionnement le temps de comprendre et d'ajuster correctement ses contextes ou profils — un outil de diagnostic sûr et contrôlé. Si ce mode reste actif indéfiniment en production, la protection MAC devient purement décorative : elle journalise les violations sans jamais les empêcher réellement, laissant le système aussi vulnérable que s'il n'avait aucune protection MAC du tout, tout en donnant une fausse impression de sécurité à quiconque constaterait simplement que SELinux ou AppArmor est "installé et actif" sans vérifier son mode réel de fonctionnement.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je comprends la différence entre contrôle d'accès discrétionnaire (DAC) et obligatoire (MAC).</li>
<li>☐ Je sais diagnostiquer un blocage SELinux avec `ausearch -m avc` avant de conclure à un bug applicatif.</li>
<li>☐ Je sais corriger un contexte de sécurité SELinux avec `semanage fcontext` et `restorecon`.</li>
<li>☐ Je comprends la différence philosophique entre SELinux (contextes) et AppArmor (chemins de fichiers).</li>
<li>☐ Je sais pourquoi désactiver SELinux ou AppArmor est presque toujours une mauvaise pratique.</li>
<li>☐ Je comprends que le mode `permissive`/`complain` est un outil de diagnostic temporaire, jamais une configuration permanente.</li>
</ul>

## FAQ

<dl class="faq">
<dt>SELinux et AppArmor peuvent-ils fonctionner ensemble sur le même système ?</dt>
<dd>Non, les deux ne sont généralement pas conçus pour cohabiter activement sur le même système — chaque distribution utilise l'un ou l'autre par défaut (SELinux pour RHEL/Rocky, AppArmor pour Ubuntu/Debian), et il est rare et déconseillé de tenter de faire cohabiter les deux simultanément.</dd>

<dt>Un serveur sans SELinux ni AppArmor est-il automatiquement moins sécurisé ?</dt>
<dd>Il perd une couche de défense en profondeur significative, mais reste protégé par les autres mesures de sécurité en place (permissions, pare-feu, bastion du chapitre 4) — la sécurité globale dépend de l'ensemble de ces couches combinées, mais retirer volontairement une couche de protection sans raison précise reste une décision à éviter sans justification solide.</dd>

<dt>Combien de temps faut-il pour maîtriser réellement SELinux ?</dt>
<dd>La démarche de diagnostic de base (section 19.3) s'acquiert rapidement, mais une maîtrise avancée (écriture de politiques personnalisées complexes) demande une pratique plus approfondie — heureusement, la grande majorité des besoins quotidiens d'un administrateur système se limite à corriger des contextes de fichiers, une compétence largement suffisante pour la plupart des situations réelles.</dd>

<dt>Existe-t-il un outil graphique pour faciliter la gestion de SELinux ?</dt>
<dd>Oui, des outils comme `system-config-selinux` (avec interface graphique) existent et peuvent faciliter une première prise en main visuelle, mais la ligne de commande (`ausearch`, `semanage`, `restorecon`) reste l'outil de référence pour un diagnostic rapide et pour l'automatisation future (Partie 9).</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle Red Hat — Utilisation de SELinux : [https://access.redhat.com/documentation/fr-fr/red_hat_enterprise_linux/9/html/using_selinux/index](https://access.redhat.com/documentation/fr-fr/red_hat_enterprise_linux/9/html/using_selinux/index)
- Documentation officielle Ubuntu — AppArmor : [https://ubuntu.com/server/docs/apparmor](https://ubuntu.com/server/docs/apparmor)
- Wiki AppArmor officiel : [https://gitlab.com/apparmor/apparmor/-/wikis/home](https://gitlab.com/apparmor/apparmor/-/wikis/home)

*Chapitre suivant : scripting Bash pour l'administration système — automatiser les tâches répétitives rencontrées dans les chapitres précédents (vérifications, diagnostics, installations) plutôt que de les répéter manuellement à chaque fois.*

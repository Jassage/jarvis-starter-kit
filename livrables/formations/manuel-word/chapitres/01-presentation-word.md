<div class="chapitre-titre-num">CHAPITRE 1</div>

# Présentation de Microsoft Word : histoire, positionnement et écosystème

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectifs pédagogiques</span>
À la fin de ce chapitre, tu sauras : définir précisément ce qu'est Microsoft Word et en quoi il diffère d'un simple éditeur de texte ; situer Word dans l'histoire du traitement de texte et expliquer pourquoi certains de ses choix de conception (le Ruban, le format DOCX) ont marqué toute l'industrie ; distinguer les différentes éditions de Word (Microsoft 365, Office 2021, Word Online, Word Mobile) et savoir laquelle te concerne ; comparer objectivement Word à ses principaux concurrents (Google Docs, LibreOffice Writer) ; et expliquer, avec des arguments et non une préférence, pourquoi Word reste aujourd'hui la référence professionnelle dans la quasi-totalité des secteurs.
</div>

**Matrice de compétences MOS** : ce chapitre ne correspond à aucun objectif testé par l'examen MOS Word (MO-100/MO-101) — il pose le contexte avant toute manipulation. La première compétence évaluée apparaît au chapitre 5 (voir `assets/mos-objectifs.md`).

**Prérequis** : aucun. Ce chapitre est le point de départ du manuel et ne suppose aucune connaissance préalable, ni même que Word soit déjà installé sur ta machine.

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Tu viens d'obtenir un stage dans le service administratif d'une ONG à Port-au-Prince. Le premier jour, ta responsable te demande de préparer "le rapport mensuel", "une lettre officielle pour un bailleur de fonds" et "un modèle de contrat pour les nouveaux bénévoles". Elle ajoute, presque en passant : <em>"Tout se fait sous Word ici, comme partout ailleurs d'ailleurs — mais fais attention, le bailleur utilise une vieille version, et certains collègues travaillent depuis leur téléphone."</em> Tu réalises que "savoir utiliser Word" ne veut pas seulement dire "savoir taper du texte" : il faut comprendre quelles versions existent, comment elles communiquent entre elles, et pourquoi ce logiciel précis — plutôt qu'un autre — s'est imposé comme le standard que ta responsable tient pour acquis. Ce chapitre pose exactement ces bases, avant de passer aux manipulations concrètes au chapitre 2.
</div>

## 1.1 Qu'est-ce que Microsoft Word

**Microsoft Word** est un **logiciel de traitement de texte** (*word processor*) : un programme conçu pour créer, mettre en forme, structurer et imprimer des documents textuels — lettres, rapports, contrats, mémoires, livres — avec un rendu visuel fidèle à ce qui sera imprimé ou partagé (principe dit **WYSIWYG**, *What You See Is What You Get*, "ce que tu vois est ce que tu obtiens").

Il fait partie de la suite bureautique **Microsoft Office** (aujourd'hui commercialisée sous le nom **Microsoft 365**), aux côtés d'Excel (tableurs), PowerPoint (présentations), Outlook (messagerie) et d'autres applications que tu croiseras au fil de ce manuel.

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Un <strong>traitement de texte</strong> ne se limite pas à "écrire du texte". Un éditeur de texte brut (le Bloc-notes Windows, VS Code) manipule des caractères sans mise en forme ni mise en page. Word ajoute une couche complète de <strong>structure visuelle et sémantique</strong> : polices, styles, marges, tableaux, images, numérotation automatique, table des matières — tout ce qui transforme un simple flux de caractères en un <em>document</em> présentable et professionnel. Cette distinction, anodine en apparence, structure d'ailleurs tout ce manuel : les 52 premiers chapitres portent presque exclusivement sur cette couche de structure.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Écrire dans le Bloc-notes, c'est comme dicter un texte à voix haute sans jamais préciser le ton, les pauses ou l'emphase : le message brut passe, mais rien ne guide la lecture. Écrire dans Word, c'est disposer en plus d'un metteur en scène qui structure ce discours — des titres qui sautent aux yeux, des paragraphes aérés, des tableaux qui organisent les chiffres, une table des matières qui oriente le lecteur avant même qu'il ne commence à lire.
</div>

## 1.2 Une brève histoire de Word

Comprendre l'histoire de Word aide à comprendre pourquoi certains de ses choix de conception actuels — parfois déroutants pour un débutant — existent réellement.

<div class="encadre saviez-vous">
<span class="encadre-titre">🧠 Le saviez-vous ? — Word n'a pas commencé chez Microsoft en position dominante</span>
Le premier "Multi-Tool Word" est sorti en **1983** sur MS-DOS, conçu par deux anciens ingénieurs de Xerox (Charles Simonyi et Richard Brodie) qui avaient découvert l'interface graphique et la souris au centre de recherche Xerox PARC — la même source d'inspiration que le Macintosh d'Apple. À l'époque, le traitement de texte dominant du marché professionnel n'était **pas** Word mais **WordPerfect**, alors quasi incontournable dans les cabinets juridiques et l'administration américaine. Word n'a dépassé WordPerfect en parts de marché qu'à la fin des années 1980 et surtout au début des années 1990, porté par l'essor de Windows et par des versions (Word for Windows 1.0 en 1989, puis Word 6.0 en 1993) qui exploitaient l'interface graphique bien mieux que son concurrent, resté longtemps attaché à une interface en mode texte même sous Windows.
</div>

Quelques jalons marquants de cette histoire :

- **1983** — Sortie de Multi-Tool Word sur MS-DOS, premier logiciel grand public à démocratiser l'usage de la souris pour un traitement de texte.
- **1989** — Word for Windows 1.0, qui exploite pleinement l'interface graphique Windows.
- **1995** — Intégration dans la suite **Microsoft Office 95**, standardisant le format `.doc` comme référence de fait dans le monde professionnel pendant plus d'une décennie.
- **1997** — Introduction de **Clippy** (l'assistant animé en forme de trombone), tentative précoce et restée célèbre — pour de mauvaises raisons — d'assistance contextuelle intelligente.
- **2007** — Refonte totale de l'interface avec l'introduction du **Ruban** (abordé en détail au chapitre 3) et du nouveau format **DOCX** (basé sur XML, remplaçant le format binaire propriétaire `.doc`).
- **2011-2013** — Intégration progressive dans le **cloud** avec Office 365 (devenu Microsoft 365 en 2020), introduisant l'enregistrement automatique sur OneDrive et la coédition en temps réel.
- **2023-2026** — Intégration de **Copilot**, l'assistant d'intelligence artificielle générative de Microsoft, directement dans Word (chapitre 49).

<div class="encadre saviez-vous">
<span class="encadre-titre">🧠 Le saviez-vous ? — pourquoi Clippy est-il devenu un symbole d'échec ?</span>
Clippy (1997-2007) analysait ce que l'utilisateur tapait pour proposer une aide contextuelle — par exemple, détecter "Cher " en début de texte pour proposer le modèle "lettre". L'idée n'était pas mauvaise en soi ; l'exécution l'était : suggestions trop fréquentes, mal calibrées, et une personnification jugée infantilisante par une majorité d'utilisateurs professionnels. Microsoft l'a retiré par défaut dès Office XP (2001) puis définitivement en 2007. L'anecdote reste pertinente aujourd'hui : au chapitre 49, tu verras que Microsoft a manifestement tiré des leçons de cet échec dans la conception de Copilot, pensé comme un outil sollicité explicitement plutôt qu'une interruption permanente.
</div>

<div class="encadre memoriser">
<span class="encadre-titre">🧠 À mémoriser — le tournant DOCX de 2007</span>
Le passage de `.doc` à `.docx` en 2007 n'est pas un simple changement de nom de fichier : `.doc` était un format **binaire propriétaire**, difficile à lire sans Word lui-même, tandis que `.docx` est un format **ouvert basé sur XML**, en réalité une archive ZIP contenant plusieurs fichiers XML structurés. Ce choix a rendu le format nettement plus robuste (récupération de documents corrompus facilitée), plus léger, et surtout **interopérable** — n'importe quel logiciel, y compris des concurrents comme LibreOffice ou Google Docs, peut aujourd'hui lire et écrire du DOCX sans licence Microsoft. Ce sujet est repris en détail dans le comparatif de la section 1.6 et dans l'annexe C.
</div>

## 1.3 Word dans l'écosystème Microsoft 365

Word ne fonctionne pas isolément. Il s'inscrit dans un écosystème que tu recroiseras à plusieurs reprises dans ce manuel, notamment au chapitre 47 :

```{.uml}
                    Microsoft 365
                          │
   ┌──────────┬───────────┼───────────┬──────────┐
   │          │           │           │          │
  Word      Excel    PowerPoint    Outlook      Teams
(texte)   (tableurs) (presentations) (email)  (reunions/chat)
   │          │           │           │          │
   └──────────┴───────────┴───────────┴──────────┘
                          │
                     OneDrive / SharePoint
              (stockage cloud, coedition, versions)
```

- **Excel** : quand un document Word a besoin de calculs complexes ou de grands volumes de données tabulaires, on y insère souvent un objet ou un lien Excel plutôt que de tout recréer dans un tableau Word (chapitre 24 sur les graphiques, alimentés par un mini-classeur Excel intégré).
- **PowerPoint** : partage les mêmes thèmes visuels que Word (chapitre 18) — une entreprise cohérente utilise en général le même thème de marque dans ses rapports Word et ses présentations PowerPoint.
- **Outlook** : le publipostage (chapitre 34) peut générer directement des e-mails personnalisés envoyés depuis Outlook, à partir d'un document Word source.
- **OneDrive / SharePoint** : stockage cloud qui rend possibles l'enregistrement automatique, l'historique de versions et la coédition en temps réel (chapitre 41) — sans ce composant, Word resterait un logiciel purement local comme en 1995.
- **Teams** : les commentaires et le suivi des modifications d'un document Word peuvent être discutés directement dans une conversation Teams liée au fichier.

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — PME</span>
Dans une PME haïtienne d'une dizaine d'employés, un devis est généralement rédigé sous Word à partir d'un modèle (chapitre 19), puis le suivi des paiements associés est géré dans Excel. Le rapport financier trimestriel destiné aux associés combine souvent les deux : texte explicatif et mise en page sous Word, tableaux et graphiques importés ou liés depuis Excel. Comprendre cette complémentarité — plutôt que de tout forcer dans un seul outil — est une compétence recherchée dès les premières missions freelance.
</div>

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — Établissement scolaire</span>
Une administration scolaire (comme un établissement universitaire tel qu'UJEPH) utilise Word pour ses correspondances officielles et ses règlements internes, mais s'appuie fréquemment sur Outlook pour la diffusion et sur SharePoint/OneDrive pour centraliser les modèles de documents partagés entre plusieurs secrétariats — évitant que chaque service réinvente sa propre mise en page pour un même type de courrier.
</div>

## 1.4 Les différentes éditions et déclinaisons de Word

Contrairement à une idée reçue répandue chez les débutants, il n'existe pas "un seul Word" : plusieurs déclinaisons coexistent, avec des différences réelles de fonctionnalités et de mode de licence. Ce manuel les couvre toutes, mais il est essentiel de les distinguer dès maintenant.

| Édition | Mode de licence | Mise à jour | Fonctionnalités les plus récentes (Copilot inclus) |
|---|---|---|---|
| **Word (Microsoft 365)** | Abonnement (mensuel/annuel) | Continue, automatique | Oui, toujours à jour |
| **Word 2021 / 2024 (achat unique)** | Licence perpétuelle, un seul paiement | Corrections de sécurité uniquement, pas de nouvelles fonctions | Non (figé à la version achetée) |
| **Word Online (Web)** | Gratuit avec un compte Microsoft, ou inclus dans 365 | Continue, automatique | Fonctionnalités de base, certaines options avancées absentes |
| **Word Mobile (Android/iOS)** | Gratuit pour la lecture et l'édition basique, complet avec 365 | Continue, automatique | Interface adaptée tactile, fonctionnalités avancées limitées |

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attention à la confusion la plus fréquente chez les débutants</span>
"Microsoft Office" et "Microsoft 365" ne sont **pas strictement synonymes** aujourd'hui. "Office 2021"/"Office 2024" désigne une licence perpétuelle achetée une seule fois (les applications restent figées dans le temps). "Microsoft 365" désigne un abonnement qui inclut les mêmes applications mais avec mises à jour continues, du stockage OneDrive, et — depuis peu — l'accès à Copilot selon la formule souscrite. Le mot "Office" reste utilisé familièrement pour désigner l'un comme l'autre, ce qui entretient la confusion ; ce manuel précise systématiquement de laquelle il s'agit dès que la distinction a un impact réel sur une manipulation.
</div>

Ce sujet est développé en profondeur au chapitre 2 (installation et choix d'édition) et au chapitre 48 (comparatif détaillé Word Online / Word Desktop).

## 1.5 À qui s'adresse Word, et pour quoi faire

Word est pensé pour la création de **documents structurés destinés à être lus** — que ce soit à l'écran ou imprimés. Il ne faut pas le confondre avec des outils voisins mais différents :

<div class="encadre astuce">
<span class="encadre-titre">💡 Bon choix pour...</span>
- Rapports, comptes rendus, notes de service, mémoires, contrats, lettres officielles.
- Documents destinés à être imprimés avec une mise en page fidèle et prévisible.
- Documents longs nécessitant une structure automatisée (table des matières, numérotation, index — Partie 8 de ce manuel).
- Publipostage de masse personnalisé (chapitre 34).
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Moins adapté pour...</span>
- La **mise en page graphique complexe** de type magazine ou plaquette publicitaire : Microsoft Publisher ou Adobe InDesign sont conçus spécifiquement pour un contrôle typographique et graphique bien plus fin, que Word ne prétend pas offrir.
- Le **code source** ou tout texte où chaque caractère (espaces, retours à la ligne) doit rester strictement identique : un éditeur de texte brut (VS Code, Notepad++) est requis, car Word insère des caractères de mise en forme invisibles qui casseraient un fichier de code.
- Les **calculs et l'analyse de données volumineuses** : c'est le rôle d'Excel, pas de Word, même si un tableau simple reste tout à fait à sa place dans un document Word (chapitres 26-27).
</div>

## 1.6 Word face à ses principaux concurrents

<div class="encadre astuce">
<span class="encadre-titre">💡 Comparatif — Word vs Google Docs vs LibreOffice Writer</span>

| Critère | Microsoft Word | Google Docs | LibreOffice Writer |
|---|---|---|---|
| Modèle économique | Abonnement ou achat unique | Gratuit (compte Google) | Gratuit, open source |
| Fonctionnement hors ligne | Natif et complet (Desktop) | Limité, nécessite une configuration | Natif et complet |
| Coédition en temps réel | Oui (365, via OneDrive/SharePoint) | Oui, natif et très fluide | Non, sans extension tierce |
| Compatibilité DOCX | Native (format par défaut) | Bonne mais imparfaite sur la mise en forme avancée | Bonne mais imparfaite sur la mise en forme avancée |
| Macros/VBA | Oui (chapitres 36-37) | Non (Apps Script, langage différent) | Oui (Basic, proche mais non identique à VBA) |
| Reconnu pour la certification MOS | Oui — la certification porte spécifiquement sur Word | Non | Non |
| Assistant IA intégré | Copilot (365, chapitre 49) | Gemini (Google Workspace) | Non, natif |
</div>

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir pour ce manuel</span>
Ce comparatif n'a pas vocation à désigner "le meilleur" outil dans l'absolu — chacun a des usages légitimes. Il sert à justifier un choix pédagogique assumé : ce manuel se concentre sur **Microsoft Word**, parce qu'il reste la référence dans l'écrasante majorité des environnements professionnels francophones et anglophones, qu'il est le seul des trois à faire l'objet d'une certification internationale reconnue (MOS, Partie 14), et que la compatibilité DOCX qu'il définit lui-même sert de standard de fait auquel les deux autres outils doivent s'adapter.
</div>

## 1.7 Ce que ce manuel va couvrir

```{.uml}
Manuel de reference Microsoft Word
│
├─ Partie 1-2  : Decouverte et manipulation des documents      (ch. 1-8)
│
├─ Partie 3-4  : Mise en forme du texte et mise en page         (ch. 9-16)
│
├─ Partie 5    : Styles, themes et modeles                      (ch. 17-20)
│
├─ Partie 6-7  : Objets visuels et tableaux                     (ch. 21-27)
│
├─ Partie 8    : Documents longs et references                 (ch. 28-33)
│
├─ Partie 9    : Publipostage et automatisation (macros/VBA)    (ch. 34-37)
│
├─ Partie 10   : Collaboration et revision                      (ch. 38-41)
│
├─ Partie 11   : Protection, impression et export                (ch. 42-45)
│
├─ Partie 12   : Accessibilite, Microsoft 365 et Copilot        (ch. 46-49)
│
├─ Partie 13   : Projets fil rouge                               (ch. 50-52)
│
└─ Partie 14   : Preparation a la certification MOS             (ch. 53-55)
```

Chaque partie s'appuie sur la précédente : la Partie 3 (mise en forme) suppose que tu sais déjà créer et enregistrer un document (Partie 2) ; la Partie 8 (documents longs) suppose une maîtrise solide des styles (Partie 5), sans lesquels une table des matières automatique est tout simplement impossible à générer correctement. Ce manuel est conçu pour être lu dans l'ordre au moins une première fois, puis consulté chapitre par chapitre comme ouvrage de référence ensuite.

## Atelier — Cartographier ton propre accès à Word

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 1 — Quelle(s) édition(s) de Word ai-je réellement à ma disposition ?</span>

**Objectif** : partir d'un état des lieux personnel concret plutôt que théorique, pour aborder le chapitre 2 (installation) en sachant déjà ce qui te concerne.

**Préparation** : aucune installation nécessaire. Prends une feuille ou un fichier texte.

**Étapes détaillées** :
1. Réponds par écrit : as-tu déjà accès à Word aujourd'hui (ordinateur personnel, ordinateur d'un établissement scolaire, compte professionnel) ? Si oui, sais-tu s'il s'agit d'un abonnement Microsoft 365 ou d'une licence achetée une fois (Office 2021/2024) ? Si tu ne sais pas, ce n'est pas grave à ce stade — le chapitre 2 t'apprendra à le vérifier.
2. Identifie, parmi ton entourage proche (études, freelance, famille), au moins deux contextes différents où Word est utilisé (par exemple : rédaction de mémoire universitaire, facture freelance, courrier administratif). Pour chacun, note si le document final est surtout **imprimé**, surtout **partagé en PDF**, ou surtout **coédité en ligne**.
3. Compare ta situation à celle du scénario en ouverture de ce chapitre (l'ONG avec un bailleur sur une "vieille version" et des collègues sur téléphone) : quel problème de compatibilité pourrait, selon toi, se poser dans ta propre situation identifiée à l'étape 2 ? (La réponse détaillée à ce type de problème arrive au chapitre 48 et à l'annexe C — l'objectif ici est seulement d'apprendre à anticiper la question, pas encore d'y répondre techniquement.)

**Résultat attendu** : un court état des lieux personnel écrit (10 lignes suffisent), qui te servira de fil conducteur concret pour le chapitre 2.

**Dépannage** : si tu n'as accès à Word dans aucun contexte pour l'instant, ce n'est pas un obstacle — le chapitre 2 couvre justement les options gratuites ou d'essai (Word Online, essai Microsoft 365) qui permettent de suivre tout le reste de ce manuel sans achat immédiat.
</div>

## Défi

<div class="encadre defi">
<span class="encadre-titre">🏆 Défi — Justifier un choix d'outil face à une objection</span>
Un ami te dit : "Pourquoi apprendre Word alors que Google Docs est gratuit et fait presque la même chose ?" Rédige une réponse argumentée de 6 à 10 phrases, en t'appuyant sur au moins trois critères précis du tableau comparatif de la section 1.6 (pas une impression générale), et en évitant l'argument de popularité seul ("tout le monde l'utilise") qui ne convaincra pas un interlocuteur déjà sceptique. Pense en particulier à la situation d'un freelance qui doit livrer des documents à des clients dont il ne contrôle pas les outils.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Confondre "Word" et "Microsoft Office"</span>
Word est **une application** au sein de la suite Office/365, pas la suite elle-même. Dire "ouvrir Office" pour désigner Word est un raccourci de langage courant mais techniquement inexact — une confusion qui peut prêter à malentendu en contexte professionnel (installation, licence, support).
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Croire que toutes les éditions de Word offrent exactement les mêmes fonctionnalités</span>
Comme vu section 1.4, Word Online et Word Mobile n'exposent pas l'intégralité des fonctionnalités de Word Desktop (certaines macros VBA, par exemple, ne s'exécutent pas dans Word Online). Un document conçu avec des fonctionnalités avancées sur Desktop peut donc s'afficher ou se comporter différemment une fois ouvert depuis un navigateur ou un téléphone.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Penser que le format DOCX garantit un rendu strictement identique partout</span>
Le format DOCX est ouvert et largement compatible (section 1.6), mais "compatible" ne veut pas dire "rendu pixel pour pixel identique". Un même fichier `.docx` peut s'afficher avec de légères différences de mise en page entre Word et LibreOffice Writer, en particulier sur des polices non installées sur la machine de destination — un sujet repris concrètement au chapitre 44 (impression) et à l'annexe C.
</div>

## Dépannage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : "je ne sais pas si j'ai déjà Word, ni quelle édition"</span>

- **Diagnostic** : situation extrêmement courante, en particulier sur un ordinateur familial ou professionnel déjà configuré par quelqu'un d'autre.
- **Comment vérifier rapidement** : chercher "Word" dans le menu Démarrer (Windows) ou le Launchpad (macOS). S'il apparaît, l'ouvrir puis consulter **Fichier > Compte** : cet écran indique le type de licence (abonnement Microsoft 365 ou version figée) et, pour un abonnement, si celui-ci est encore actif.
- **Résolution complète** : traitée en détail au chapitre 2, avec toutes les options (essai gratuit, licence étudiante souvent incluse dans un établissement universitaire, Word Online sans installation).
</div>

## En entreprise

Dans la quasi-totalité des environnements professionnels francophones (entreprises, administrations, ONG, cabinets, établissements scolaires), Word — ou au minimum la compatibilité avec le format DOCX qu'il a imposé — reste une compétence attendue par défaut, au même titre que savoir envoyer un e-mail. Quelques constats qui reviennent en entreprise :

- **Bonne pratique répandue** : dans une organisation avec plusieurs collaborateurs, s'accorder explicitement sur l'édition de Word utilisée (365 vs 2021) pour éviter qu'un document conçu avec des fonctionnalités récentes s'affiche mal chez un destinataire resté sur une version plus ancienne — exactement la situation du bailleur de fonds dans la mise en situation d'ouverture.
- **Bonne pratique répandue** : privilégier l'enregistrement au format `.docx` par défaut (plutôt que l'ancien `.doc`) pour tout nouveau document, sauf contrainte explicite d'un partenaire encore sur un système ancien (rare, mais pas inexistant dans certaines administrations).
- **Erreur classique observée** : sous-estimer Word en le réduisant à "juste écrire du texte", puis découvrir tardivement — souvent à la veille d'une échéance — qu'un document de 40 pages sans styles ni structure (Partie 5) est extrêmement pénible à corriger, réorganiser ou mettre à jour.

## Astuces avancées

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — vérifier la conformité MOS d'une compétence avant de l'apprendre "à l'ancienne"</span>
Si ton objectif final inclut la certification MOS (Partie 14), un réflexe utile dès maintenant : Microsoft publie un référentiel officiel des compétences évaluées par version de l'examen (Word Associate / Word Expert). Ce manuel aligne volontairement chaque chapitre pertinent sur ce référentiel (encadrés `🎓 Préparation MOS`), pour éviter d'apprendre par cœur des manipulations d'une version ancienne de Word qui ne correspondent plus à l'examen actuel.
</div>

## 🎓 Préparation MOS

<div class="encadre mos">
<span class="encadre-titre">🎓 Préparation MOS — ce que ce chapitre couvre pour l'examen</span>
La certification **Microsoft Office Specialist (MOS) Word** ne teste aucune connaissance historique comme celle de ce chapitre — mais elle porte sur la version **Microsoft 365** de Word, jamais sur Office 2021 seul ni sur Word Online. **Piège fréquent chez les candidats autodidactes** : s'entraîner exclusivement sur une version ancienne ou sur Word Online, puis être surpris en examen par des options absentes de l'interface habituée. **Recommandation** : dès le chapitre 2, installe ou vérifie l'accès à la version Microsoft 365 (Desktop) pour t'entraîner dans les conditions exactes de l'examen — un point qui te fera gagner un temps précieux d'ici la Partie 14.
</div>

## Résumé du chapitre

- Word est un logiciel de **traitement de texte** WYSIWYG, membre de la suite Microsoft Office/365, distinct d'un simple éditeur de texte brut.
- Son histoire (1983 à aujourd'hui) explique des choix de conception actuels : le Ruban (2007), le format DOCX (2007), l'intégration cloud (2011+), Copilot (2023+).
- Il existe plusieurs éditions de Word (Microsoft 365, Office 2021/2024, Word Online, Word Mobile) aux fonctionnalités et modes de licence différents — une distinction à connaître avant même d'installer quoi que ce soit.
- Word s'intègre à un écosystème plus large (Excel, PowerPoint, Outlook, OneDrive, Teams) qui démultiplie ses usages professionnels réels.
- Comparé à Google Docs et LibreOffice Writer, Word se distingue par sa compatibilité DOCX de référence, ses macros VBA et sa certification MOS reconnue internationalement.
- Ce manuel couvre Word de bout en bout : interface, mise en forme, styles, objets, documents longs, automatisation, collaboration, protection, Microsoft 365, Copilot, et une préparation directe à la certification MOS.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Microsoft Word est :
   - a) La suite bureautique complète de Microsoft
   - b) Un logiciel de traitement de texte membre de la suite Microsoft Office/365
   - c) Un système d'exploitation
   - d) Un langage de programmation

2. Le format DOCX, introduit en 2007, repose sur :
   - a) Un format binaire propriétaire fermé
   - b) Une archive ZIP contenant des fichiers XML structurés
   - c) Une base de données SQL
   - d) Un simple fichier texte brut

3. Laquelle de ces éditions de Word n'exécute PAS l'intégralité des macros VBA ?
   - a) Word Microsoft 365 (Desktop)
   - b) Word 2021 (Desktop)
   - c) Word Online
   - d) Aucune, toutes les éditions sont strictement identiques

**Corrigé** : 1-b, 2-b, 3-c.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. "Microsoft Office" et "Microsoft 365" sont des synonymes stricts en tout point. — **Faux** (Office 2021/2024 est une licence perpétuelle figée ; Microsoft 365 est un abonnement avec mises à jour continues et fonctionnalités comme Copilot selon la formule).
2. WordPerfect dominait le marché du traitement de texte professionnel avant que Word ne s'impose. — **Vrai** (jusqu'à la fin des années 1980).
3. Le Ruban a été introduit dans Word dès sa première version en 1983. — **Faux** (introduit en 2007, avec Office 2007).
4. La certification MOS Word peut être passée indifféremment sur n'importe quelle édition de Word. — **Faux** (elle porte spécifiquement sur Microsoft 365).
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique, en tes propres mots, pourquoi le passage au format DOCX en 2007 a représenté davantage qu'un simple changement de nom de fichier.
2. Un collègue te dit : "Word, Google Docs, LibreOffice Writer, c'est pareil, ça ne change rien de choisir l'un ou l'autre." Que lui réponds-tu, en t'appuyant sur au moins deux critères concrets ?

**Corrigé 1** : `.doc` était un format binaire propriétaire, difficile à interpréter sans Word lui-même et plus fragile en cas de corruption. `.docx` repose sur du XML structuré dans une archive ZIP, ce qui le rend plus robuste, plus léger, et surtout lisible/écrivable par des logiciels tiers sans dépendre d'une rétro-ingénierie du format — une bascule vers l'interopérabilité, pas seulement un habillage technique.

**Corrigé 2 (exemple de réponse)** : Non, les trois ne sont pas interchangeables selon le contexte. Si le destinataire final attend un fichier DOCX parfaitement fidèle (un client professionnel, un bailleur de fonds), Word reste la référence puisqu'il définit lui-même ce format. Si la priorité est la coédition fluide et gratuite entre plusieurs personnes sans installation, Google Docs a un avantage réel. Si l'environnement impose un logiciel gratuit et hors ligne sans dépendance à un compte cloud, LibreOffice Writer se distingue. Le choix dépend donc du besoin réel, pas d'une préférence a priori.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 1.1</span>

Cite trois jalons de l'histoire de Word (avec leur date approximative) et explique, pour chacun, en une phrase, en quoi il a changé la façon dont les utilisateurs travaillent avec le logiciel.
</div>

**Corrigé :** Par exemple : (1) 1989, Word for Windows 1.0 — bascule vers une interface graphique complète, remplaçant la manipulation en ligne de commande. (2) 2007, introduction du Ruban et du format DOCX — réorganisation totale de l'accès aux fonctionnalités par onglets visuels, et passage à un format ouvert et interopérable. (3) 2011+, intégration cloud (OneDrive/365) — un document n'est plus seulement local : il peut être coédité en temps réel et accessible depuis n'importe quel appareil.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 1.2</span>

Reprends le scénario de la mise en situation en ouverture (l'ONG, le bailleur sur une "vieille version", les collègues sur téléphone). Identifie, pour chacune des deux contraintes mentionnées (version ancienne du bailleur / usage mobile des collègues), le chapitre de ce manuel où tu trouveras une réponse technique complète, en te basant sur la table des matières et sur la section 1.7.
</div>

**Corrigé :** La contrainte du bailleur sur une "vieille version" relève de la compatibilité entre éditions/format de fichier, traitée principalement au chapitre 45 (export et conversion) et à l'annexe C (DOC vs DOCX). La contrainte des collègues sur téléphone relève des différences fonctionnelles entre Word Desktop et Word Mobile/Online, traitées au chapitre 48.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je peux définir Word sans dire "la suite Office" ni "juste un logiciel pour écrire".</li>
<li>☐ Je connais au moins 3 jalons de l'histoire de Word et leur impact concret.</li>
<li>☐ Je sais distinguer Microsoft 365 (abonnement) d'Office 2021/2024 (licence perpétuelle).</li>
<li>☐ Je peux citer au moins 3 différences réelles entre Word et Google Docs ou LibreOffice Writer.</li>
<li>☐ Je comprends pourquoi le format DOCX (2007) a représenté un vrai tournant technique.</li>
<li>☐ J'ai identifié quelle(s) édition(s) de Word je peux réellement utiliser pour suivre ce manuel.</li>
<li>☐ Je sais que la certification MOS porte spécifiquement sur Microsoft 365.</li>
</ul>

## Aide-mémoire

<div class="encadre retenir">
<span class="encadre-titre">📌 Points clés à retenir</span>

- **Word** = traitement de texte WYSIWYG, membre de la suite **Microsoft Office/365**.
- **Microsoft 365** = abonnement, mises à jour continues, Copilot selon formule. **Office 2021/2024** = achat unique, figé.
- **DOCX** (depuis 2007) = XML dans une archive ZIP, format ouvert et interopérable ; remplace `.doc` (binaire propriétaire).
- Éditions : **Desktop** (complète), **Online** (navigateur, fonctionnalités réduites), **Mobile** (tactile, fonctionnalités réduites).
- La certification **MOS Word** porte sur **Microsoft 365 Desktop**, pas sur une autre édition.

Pas de raccourci clavier propre à ce chapitre introductif — les premiers raccourcis pratiques apparaissent dès le chapitre 5.
</div>

## FAQ

<dl class="faq">
<dt>Dois-je absolument payer pour suivre ce manuel ?</dt>
<dd>Non. Word Online est gratuit avec un compte Microsoft, et Microsoft propose régulièrement des essais gratuits de Microsoft 365. Le chapitre 2 détaille toutes les options, y compris les licences étudiantes souvent incluses gratuitement par les établissements universitaires.</dd>

<dt>Est-ce que ce manuel s'applique aussi à Word sur Mac ?</dt>
<dd>Oui, dans les grandes lignes : les concepts et la quasi-totalité des fonctionnalités sont identiques. Les captures d'écran décrites dans ce manuel supposent Windows par défaut ; les rares différences d'emplacement de menu sur macOS seront signalées explicitement quand elles existent.</dd>

<dt>Google Docs suffit-il pour passer la certification MOS ?</dt>
<dd>Non. La certification MOS Word porte spécifiquement sur Microsoft Word (365), et évalue des fonctionnalités (macros VBA, certains outils de révision avancés) que Google Docs ne propose pas du tout ou différemment.</dd>

<dt>Pourquoi ce chapitre ne montre-t-il encore aucune capture d'écran de l'interface de Word ?</dt>
<dd>Par choix pédagogique délibéré : comprendre ce qu'est Word et pourquoi il fonctionne comme il fonctionne facilite l'apprentissage de l'interface elle-même, abordée en détail dès le chapitre 3, une fois l'installation effectuée au chapitre 2.</dd>
</dl>

## Références et ressources complémentaires

- Documentation officielle Microsoft Word : [https://support.microsoft.com/word](https://support.microsoft.com/word)
- Référentiel officiel de la certification Microsoft Office Specialist : [https://www.microsoft.com/microsoft-365/microsoft-office-specialist-certification](https://www.microsoft.com/microsoft-365/microsoft-office-specialist-certification)
- Spécification ouverte du format Office Open XML (norme ECMA-376, base technique du DOCX) : [https://www.ecma-international.org/publications-and-standards/standards/ecma-376/](https://www.ecma-international.org/publications-and-standards/standards/ecma-376/)
- *Word Annoyances* et documentation historique Microsoft — pour approfondir l'histoire du logiciel au-delà de ce chapitre.

*Chapitre suivant : installation et configuration de Microsoft Word, pour transformer cette vue d'ensemble en un environnement de travail réellement opérationnel sur ta machine.*

<div class="chapitre-titre-num">CHAPITRE 22</div>

# Hachage des mots de passe (bcrypt)

## Objectifs pédagogiques

Comprendre pourquoi un mot de passe ne doit jamais être stocké en clair, ni même simplement chiffré, et maîtriser bcrypt pour le hachage sécurisé avec salage automatique.

## 22.1 Pourquoi jamais stocker un mot de passe en clair

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une base de données compromise expose alors TOUS les mots de passe en clair</span>
Si une base de données contenant des mots de passe en clair est un jour compromise (fuite de données, erreur de configuration, employé malveillant), **tous** les comptes utilisateurs sont immédiatement exposés — d'autant plus grave que beaucoup d'utilisateurs réutilisent le même mot de passe sur plusieurs services.
</div>

## 22.2 Pourquoi le chiffrement (réversible) n'est pas non plus la solution

<div class="encadre astuce">
<span class="encadre-titre">💡 Hachage vs chiffrement : une distinction fondamentale</span>
Le **chiffrement** est réversible : avec la bonne clé, on peut retrouver la donnée d'origine. Le **hachage** est **irréversible par conception** : impossible de retrouver le mot de passe original à partir du hash, même en connaissant l'algorithme utilisé. Pour un mot de passe, on veut justement ne **jamais** avoir besoin de le retrouver en clair — seulement vérifier qu'un mot de passe saisi correspond au hash stocké. Le hachage est donc la bonne primitive, jamais le chiffrement.
</div>

## 22.3 Pourquoi pas un simple hachage MD5/SHA-256

<div class="encadre attention">
<span class="encadre-titre">⚠️ MD5 et SHA-256 sont conçus pour être RAPIDES — un défaut pour les mots de passe</span>
MD5 et SHA-256 sont des fonctions de hachage **génériques**, optimisées pour être calculées très rapidement (utiles pour vérifier l'intégrité d'un fichier, par exemple). Cette rapidité est un **problème** pour les mots de passe : un attaquant disposant d'une liste de hashs volés peut tester des **milliards** de mots de passe par seconde sur du matériel dédié (GPU), rendant une attaque par force brute ou par dictionnaire réalisable en un temps raisonnable.
</div>

## 22.4 bcrypt : conçu spécifiquement pour les mots de passe

**bcrypt** est un algorithme de hachage **volontairement lent** et **paramétrable** (facteur de coût), rendant les attaques par force brute nettement plus coûteuses en temps de calcul — un ralentissement négligeable pour une seule vérification légitime (quelques centaines de millisecondes), mais rédhibitoire à l'échelle de milliards de tentatives.

```
$ npm install bcrypt
```

```js
const bcrypt = require("bcrypt");

async function hacherMotDePasse(motDePasse) {
  const facteurCout = 10; // plus élevé = plus lent = plus résistant, mais coûte aussi plus cher en calcul serveur
  return bcrypt.hash(motDePasse, facteurCout);
}

async function verifierMotDePasse(motDePasseSaisi, hashStocke) {
  return bcrypt.compare(motDePasseSaisi, hashStocke); // retourne true/false
}
```

```js
// Utilisation dans le service d'inscription (rappel du chapitre 15)
const utilisateur = await creerUtilisateur({
  nom,
  email,
  motDePasseHash: await hacherMotDePasse(motDePasse), // ne JAMAIS stocker motDePasse tel quel
});
```

```js
// Utilisation lors de la connexion
async function connecter(email, motDePasse) {
  const utilisateur = await UtilisateurRepository.trouverParEmail(email);
  if (!utilisateur) {
    throw new NonAutoriseError("Email ou mot de passe incorrect"); // message VOLONTAIREMENT vague, section 22.6
  }

  const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasseHash);
  if (!motDePasseValide) {
    throw new NonAutoriseError("Email ou mot de passe incorrect");
  }

  return utilisateur;
}
```

## 22.5 Le sel (salt) automatique de bcrypt

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi deux mots de passe identiques produisent des hashs différents</span>
```js
console.log(await bcrypt.hash("motdepasse123", 10));
// $2b$10$N9qo8uLOickgx2ZMRZoMye...
console.log(await bcrypt.hash("motdepasse123", 10));
// $2b$10$KIXQ3vN8YQZ7fD5jRp2Xxe...  ← DIFFÉRENT, bien que le mot de passe soit identique !
```
bcrypt génère automatiquement un **sel** (une valeur aléatoire) différent à chaque hachage, intégré directement dans le hash final produit. Cela empêche les attaques par "table arc-en-ciel" (rainbow table, des hashs précalculés pour des mots de passe courants) : même un mot de passe très commun ("123456") produit un hash unique à chaque compte, rendant ces tables précalculées inutiles.
</div>

## 22.6 Ne jamais révéler si c'est l'email ou le mot de passe qui est incorrect

<div class="encadre attention">
<span class="encadre-titre">⚠️ "Email incorrect" vs "Mot de passe incorrect" : une fuite d'information</span>
```js
// ❌ Révèle à un attaquant si un email est enregistré dans le système, même sans connaître le mot de passe
if (!utilisateur) throw new NonAutoriseError("Cet email n'existe pas");
if (!motDePasseValide) throw new NonAutoriseError("Mot de passe incorrect");
```
Un message d'erreur différencié permet à un attaquant de **vérifier** quels emails sont enregistrés (énumération de comptes), une information précieuse pour cibler ensuite une attaque de phishing ou de force brute. Toujours utiliser le **même** message générique ("Email ou mot de passe incorrect") dans les deux cas.
</div>

## 22.7 Choisir le bon facteur de coût

<div class="encadre astuce">
<span class="encadre-titre">💡 Le facteur de coût doit évoluer avec la puissance de calcul disponible</span>
Un facteur de coût de **10-12** est généralement recommandé en 2026 pour un bon compromis sécurité/performance serveur. Ce nombre devrait être **augmenté périodiquement** à mesure que le matériel informatique devient plus puissant (et donc plus rapide à casser un hash faiblement coûteux) — bcrypt a été spécifiquement conçu pour permettre cet ajustement sans changer d'algorithme.
</div>

## 22.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier que bcrypt.hash() et bcrypt.compare() sont asynchrones</span>
```js
// ❌ bcrypt.hashSync existe, mais BLOQUE le thread principal (rappel du chapitre 1) — à éviter dans un serveur
const hash = bcrypt.hashSync(motDePasse, 10);
```
```js
// ✅ Toujours utiliser la version asynchrone dans le code serveur
const hash = await bcrypt.hash(motDePasse, 10);
```
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Comparer un mot de passe avec === au lieu de bcrypt.compare()</span>
```js
if (motDePasseSaisi === utilisateur.motDePasseHash) { ... } // ❌ ne fonctionnera JAMAIS, le hash n'est pas le mot de passe
```
Le mot de passe saisi (en clair) ne peut **jamais** être comparé directement au hash stocké — seule `bcrypt.compare()` sait recalculer et comparer correctement, en tenant compte du sel intégré au hash.
</div>

## 22.9 Résumé du chapitre

- Un mot de passe ne doit jamais être stocké en clair, ni chiffré de façon réversible — seul le hachage irréversible convient.
- bcrypt est volontairement lent et paramétrable (facteur de coût), résistant aux attaques par force brute à grande échelle, contrairement à MD5/SHA-256.
- bcrypt intègre un sel aléatoire automatiquement, rendant deux hashs d'un même mot de passe toujours différents.
- Toujours utiliser un message d'erreur générique ("email ou mot de passe incorrect"), jamais différencier les deux cas.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 22.1</span>

Écris une fonction `changerMotDePasse(utilisateurId, ancienMotDePasse, nouveauMotDePasse)` qui vérifie l'ancien mot de passe via bcrypt avant de hacher et enregistrer le nouveau.
</div>

**Corrigé :**
```js
async function changerMotDePasse(utilisateurId, ancienMotDePasse, nouveauMotDePasse) {
  const utilisateur = await UtilisateurRepository.trouverParId(utilisateurId);

  const ancienValide = await bcrypt.compare(ancienMotDePasse, utilisateur.motDePasseHash);
  if (!ancienValide) {
    throw new NonAutoriseError("Ancien mot de passe incorrect");
  }

  const nouveauHash = await bcrypt.hash(nouveauMotDePasse, 10);
  await UtilisateurRepository.mettreAJourMotDePasse(utilisateurId, nouveauHash);
}
```

*Chapitre suivant : l'authentification JWT, pour identifier un utilisateur à travers ses requêtes suivantes sans lui redemander son mot de passe.*

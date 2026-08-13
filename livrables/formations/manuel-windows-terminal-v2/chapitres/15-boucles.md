<div class="chapitre-titre-num">CHAPITRE 15</div>

# Boucles

## 🎯 Objectifs

Maîtriser `foreach`, `for`, `while`, `do-while`/`do-until`, et savoir choisir la bonne boucle selon le besoin.

## Prérequis

Chapitre 14.

## 🧠 Comprendre : répéter sans copier-coller

**Le problème.** Traiter 500 fichiers un par un en copiant-collant 500 fois la même instruction serait absurde. Il faut un mécanisme pour répéter une action sur chaque élément d'une liste, ou tant qu'une condition reste vraie.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Une boucle `foreach` est un employé qui traite, un par un, chaque dossier d'une pile, jusqu'à ce qu'il n'en reste plus. Une boucle `while` est un employé qui continue à travailler tant qu'une horloge affiche "encore du temps", sans savoir à l'avance combien de dossiers il traitera.
</div>

## 💻 Démonstration : foreach

```powershell
$fruits = @("pomme", "banane", "mangue")
foreach ($fruit in $fruits) {
    Write-Output "Fruit : $fruit"
}
```

## 🔍 Décortiquons

<div class="encadre attention">
<span class="encadre-titre">⚠️ foreach (mot-clé) vs ForEach-Object (cmdlet) : deux syntaxes différentes</span>
```powershell
foreach ($f in $fruits) { Write-Output $f }        ← mot-cle de langage, en dehors d'un pipeline
$fruits | ForEach-Object { Write-Output $_ }        ← cmdlet, DANS un pipeline, utilise $_ pour l'element courant
```
Les deux font conceptuellement la même chose, mais `foreach` (mot-clé) ne peut pas être utilisé **dans** un pipeline (après un `|`), tandis que `ForEach-Object` (cmdlet) est justement conçue pour ça — un piège de nommage fréquent chez les débutants.
</div>

## 15.1 for : boucle avec compteur

```powershell
for ($i = 1; $i -le 10; $i++) {
    Write-Output "Compteur : $i"
}

for ($i = 10; $i -ge 1; $i--) {
    Write-Output "Décompte : $i"
}
```

## 15.2 while : tant qu'une condition est vraie

```powershell
$compteur = 0
while ($compteur -lt 5) {
    Write-Output "Compteur : $compteur"
    $compteur++
}
```

## 15.3 do-while et do-until : exécuter au moins une fois

```powershell
$reponse = ""
do {
    $reponse = Read-Host "Tape 'quitter' pour arrêter"
} while ($reponse -ne "quitter")
```

```powershell
$nombre = 0
do {
    $nombre = Get-Random -Minimum 1 -Maximum 10
    Write-Output "Nombre tiré : $nombre"
} until ($nombre -eq 7)
```

<div class="encadre astuce">
<span class="encadre-titre">💡 do-while vs while : la différence clé</span>
`while` vérifie la condition **avant** la première exécution (peut ne jamais s'exécuter) ; `do-while`/`do-until` exécute le bloc **au moins une fois**, puis vérifie la condition — utile pour des menus interactifs (rappel du chapitre 8 en Batch) où on veut toujours afficher le menu au moins une fois avant de vérifier si l'utilisateur veut quitter.
</div>

## 15.4 break et continue

```powershell
foreach ($nombre in 1..20) {
    if ($nombre -eq 10) { break }        ← arrete COMPLETEMENT la boucle
    if ($nombre % 2 -eq 0) { continue }   ← passe a l'iteration SUIVANTE, sans executer le reste du bloc
    Write-Output $nombre
}
```

## 15.5 L'opérateur .. (range)

```powershell
1..10                    ← genere les nombres de 1 a 10
10..1                    ← genere de 10 a 1 (decroissant)
foreach ($i in 1..5) { Write-Output $i }
```

## 15.6 ForEach-Object -Parallel (PowerShell 7+)

```powershell
$serveurs = @("srv1", "srv2", "srv3", "srv4")

$serveurs | ForEach-Object -Parallel {
    Test-Connection -ComputerName $_ -Count 1
} -ThrottleLimit 4
```

<div class="encadre astuce">
<span class="encadre-titre">💡 -Parallel : exclusif à PowerShell 7, absent de Windows PowerShell 5.1</span>
Cette fonctionnalité teste, par exemple, la connectivité de plusieurs serveurs **simultanément** plutôt que l'un après l'autre — un gain de temps considérable sur des opérations réseau lentes répétées sur de nombreuses cibles (rappel direct pour le chapitre 33, projet Vérificateur réseau). `-ThrottleLimit` limite le nombre d'exécutions parallèles simultanées.
</div>

## ⚠️ Attention : erreur fréquente

<div class="encadre attention">
<span class="encadre-titre">⚠️ Boucle infinie par oubli d'incrémentation</span>
```powershell
$i = 0
while ($i -lt 10) {
    Write-Output $i
    # ❌ $i++ oublié : la condition reste TOUJOURS vraie, boucle infinie !
}
```
</div>

## Bonnes pratiques

- Préférer `foreach`/`ForEach-Object` à une boucle `for` avec compteur dès qu'on parcourt simplement une collection, sans besoin de l'index.
- Utiliser `ForEach-Object -Parallel` pour des opérations réseau/I/O répétées sur de nombreuses cibles indépendantes.
- Toujours vérifier qu'une boucle `while` progresse réellement vers sa condition de sortie.

## 📝 Exercice facile

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 15.1</span>

Affiche tous les nombres pairs de 1 à 30 avec une boucle `for`.
</div>

**✅ Correction.**
```powershell
for ($i = 1; $i -le 30; $i++) {
    if ($i % 2 -eq 0) { Write-Output $i }
}
```

## 📝 Exercice intermédiaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 15.2</span>

Teste la connectivité (ping) de 5 sites web différents en parallèle, et affiche pour chacun s'il répond ou non.
</div>

**✅ Correction.**
```powershell
$sites = @("google.com", "microsoft.com", "github.com", "openai.com", "wikipedia.org")

$sites | ForEach-Object -Parallel {
    $resultat = Test-Connection -ComputerName $_ -Count 1 -Quiet
    [PSCustomObject]@{ Site = $_; Repond = $resultat }
} -ThrottleLimit 5
```

## 🔥 Défi

<div class="encadre defi">
<span class="encadre-titre">🔥 Défi 15.3</span>

Explique pourquoi ce code boucle indéfiniment, et corrige-le :
```powershell
$tentative = 0
do {
    Write-Output "Tentative $tentative"
} while ($tentative -lt 3)
```
</div>

**✅ Correction du défi.** `$tentative` n'est jamais incrémenté à l'intérieur de la boucle — la condition `$tentative -lt 3` reste éternellement vraie (`0 < 3`). Correction :
```powershell
$tentative = 0
do {
    Write-Output "Tentative $tentative"
    $tentative++
} while ($tentative -lt 3)
```

## 🎯 Ce que tu sais maintenant

- `foreach` (mot-clé) parcourt une collection hors pipeline ; `ForEach-Object` (cmdlet) fait de même dans un pipeline avec `$_`.
- `for` (compteur), `while` (vérifie avant), `do-while`/`do-until` (vérifie après, au moins une exécution garantie).
- `break` arrête la boucle ; `continue` passe à l'itération suivante.
- `ForEach-Object -Parallel` (PowerShell 7+) exécute les itérations en parallèle, avec une limite de concurrence (`-ThrottleLimit`).

*Chapitre suivant : les fonctions, pour structurer et réutiliser du code PowerShell.*

<div class="chapitre-titre-num">CHAPITRE 13</div>

# Boucles

## Objectifs pédagogiques

Maîtriser `foreach`, `for`, `while`, `do-while`, `do-until`, et savoir choisir la bonne boucle selon le besoin.

## Prérequis

Chapitre 12.

## 13.1 foreach : parcourir une collection

```powershell
$fruits = @("pomme", "banane", "mangue")
foreach ($fruit in $fruits) {
    Write-Output "Fruit : $fruit"
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ foreach (mot-clé) vs ForEach-Object (cmdlet) : deux syntaxes différentes</span>
```powershell
foreach ($f in $fruits) { Write-Output $f }        # mot-clé de langage, en dehors d'un pipeline
$fruits | ForEach-Object { Write-Output $_ }        # cmdlet, DANS un pipeline, utilise $_ pour l'élément courant
```
Les deux font conceptuellement la même chose, mais `foreach` (mot-clé) ne peut pas être utilisé **dans** un pipeline (après un `|`), tandis que `ForEach-Object` (cmdlet) est justement conçue pour ça — un piège de nommage fréquent chez les débutants.
</div>

## 13.2 for : boucle avec compteur

```powershell
for ($i = 1; $i -le 10; $i++) {
    Write-Output "Compteur : $i"
}

for ($i = 10; $i -ge 1; $i--) {
    Write-Output "Décompte : $i"
}
```

## 13.3 while : tant qu'une condition est vraie

```powershell
$compteur = 0
while ($compteur -lt 5) {
    Write-Output "Compteur : $compteur"
    $compteur++
}
```

## 13.4 do-while et do-until : exécuter au moins une fois

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
`while` vérifie la condition **avant** la première exécution (peut ne jamais s'exécuter) ; `do-while`/`do-until` exécute le bloc **au moins une fois**, puis vérifie la condition — utile pour des menus interactifs (rappel du chapitre 7 en Batch) où on veut toujours afficher le menu au moins une fois avant de vérifier si l'utilisateur veut quitter.
</div>

## 13.5 break et continue

```powershell
foreach ($nombre in 1..20) {
    if ($nombre -eq 10) { break }        # arrête COMPLÈTEMENT la boucle
    if ($nombre % 2 -eq 0) { continue }   # passe à l'itération SUIVANTE, sans exécuter le reste du bloc
    Write-Output $nombre
}
```

## 13.6 L'opérateur .. (range) pour générer une séquence

```powershell
1..10                    # génère les nombres de 1 à 10
10..1                    # génère de 10 à 1 (décroissant)
foreach ($i in 1..5) { Write-Output $i }
```

## 13.7 ForEach-Object -Parallel (PowerShell 7+) : paralléliser une boucle

```powershell
$serveurs = @("srv1", "srv2", "srv3", "srv4")

$serveurs | ForEach-Object -Parallel {
    Test-Connection -ComputerName $_ -Count 1
} -ThrottleLimit 4
```

<div class="encadre astuce">
<span class="encadre-titre">💡 -Parallel : exclusif à PowerShell 7, absent de Windows PowerShell 5.1</span>
Cette fonctionnalité teste, par exemple, la connectivité de plusieurs serveurs **simultanément** plutôt que l'un après l'autre — un gain de temps considérable sur des opérations réseau lentes répétées sur de nombreuses cibles (rappel direct pour le chapitre 29, projet "scanner réseau"). `-ThrottleLimit` limite le nombre d'exécutions parallèles simultanées.
</div>

## 13.8 Erreurs fréquentes

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

## 13.9 Bonnes pratiques

- Préférer `foreach`/`ForEach-Object` à une boucle `for` avec compteur dès qu'on parcourt simplement une collection, sans besoin de l'index.
- Utiliser `ForEach-Object -Parallel` pour des opérations réseau/I/O répétées sur de nombreuses cibles indépendantes.
- Toujours vérifier qu'une boucle `while` progresse réellement vers sa condition de sortie.

## 13.10 Résumé du chapitre

- `foreach` (mot-clé) parcourt une collection hors pipeline ; `ForEach-Object` (cmdlet) fait de même dans un pipeline avec `$_`.
- `for` (compteur), `while` (vérifie avant), `do-while`/`do-until` (vérifie après, au moins une exécution garantie).
- `break` arrête la boucle ; `continue` passe à l'itération suivante.
- `ForEach-Object -Parallel` (PowerShell 7+) exécute les itérations en parallèle, avec une limite de concurrence (`-ThrottleLimit`).

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 13.1</span>

Affiche tous les nombres pairs de 1 à 30 avec une boucle `for`.
</div>

**Corrigé :**
```powershell
for ($i = 1; $i -le 30; $i++) {
    if ($i % 2 -eq 0) { Write-Output $i }
}
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 13.2 (mini-projet)</span>

Teste la connectivité (ping) de 5 sites web différents en parallèle, et affiche pour chacun s'il répond ou non.
</div>

**Corrigé :**
```powershell
$sites = @("google.com", "microsoft.com", "github.com", "openai.com", "wikipedia.org")

$sites | ForEach-Object -Parallel {
    $resultat = Test-Connection -ComputerName $_ -Count 1 -Quiet
    [PSCustomObject]@{ Site = $_; Repond = $resultat }
} -ThrottleLimit 5
```

*Chapitre suivant : les fonctions, modules et scripts, pour structurer et réutiliser du code PowerShell.*

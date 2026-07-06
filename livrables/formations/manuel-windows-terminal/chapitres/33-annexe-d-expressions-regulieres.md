<div class="chapitre-titre-num">ANNEXE D</div>

# Expressions régulières en PowerShell

## D.1 Syntaxe de base

| Motif | Signification |
|---|---|
| `.` | N'importe quel caractère (sauf saut de ligne) |
| `\d` | Un chiffre (0-9) |
| `\D` | Tout sauf un chiffre |
| `\w` | Un caractère alphanumérique ou underscore |
| `\W` | Tout sauf alphanumérique |
| `\s` | Un espace (espace, tabulation, saut de ligne) |
| `\S` | Tout sauf un espace |
| `^` | Début de chaîne (ou de ligne en mode multiligne) |
| `$` | Fin de chaîne (ou de ligne en mode multiligne) |
| `*` | 0 ou plusieurs répétitions |
| `+` | 1 ou plusieurs répétitions |
| `?` | 0 ou 1 répétition (rend aussi le quantificateur précédent non-gourmand) |
| `{n}` | Exactement n répétitions |
| `{n,}` | Au moins n répétitions |
| `{n,m}` | Entre n et m répétitions |
| `[abc]` | Un caractère parmi a, b ou c |
| `[^abc]` | Un caractère différent de a, b et c |
| `[a-z]` | Un caractère entre a et z |
| `(...)` | Groupe de capture |
| `(?:...)` | Groupe non capturant |
| `\|` | Alternative (OU) |

## D.2 Opérateurs PowerShell utilisant les regex

| Opérateur | Usage |
|---|---|
| `-match` | Teste une correspondance, remplit `$matches` |
| `-notmatch` | Teste l'absence de correspondance |
| `-replace` | Remplace selon un motif regex |
| `Select-String -Pattern` | Recherche dans des fichiers/chaînes |
| `[regex]::Match()` | Classe .NET pour des besoins avancés |
| `[regex]::Matches()` | Toutes les correspondances (pas seulement la première) |

```powershell
"rapport-2026.docx" -match "^rapport-(\d{4})\.docx$"
$matches[1]     # "2026" — capturé par le groupe (\d{4})

"Jaslin Occius" -replace "Occius", "Pierre"    # "Jaslin Pierre"

[regex]::Matches("a1 b2 c3", "\d").Value       # 1, 2, 3
```

## D.3 Exemples pratiques courants

```powershell
# Valider une adresse email (simplifiée)
$email -match "^[\w\.-]+@[\w\.-]+\.\w{2,}$"

# Valider un format de date JJ/MM/AAAA
$date -match "^\d{2}/\d{2}/\d{4}$"

# Extraire toutes les adresses IP d'un fichier de log
Select-String -Path "acces.log" -Pattern "\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}" -AllMatches |
    ForEach-Object { $_.Matches.Value } | Sort-Object -Unique

# Nettoyer les espaces multiples
"trop      d'espaces" -replace "\s+", " "

# Extraire un numéro de version depuis un nom de fichier
"app-v2.5.1-final.zip" -match "v(\d+\.\d+\.\d+)"
$matches[1]    # "2.5.1"
```

## D.4 Rappel : -like (wildcards) vs -match (regex)

<div class="encadre astuce">
<span class="encadre-titre">💡 Rappel du chapitre 17</span>
`-like` accepte uniquement `*` et `?` — suffisant pour un filtrage simple de noms de fichiers. `-match` (et `Select-String`) offre la puissance complète des expressions régulières .NET — quantificateurs, classes de caractères, groupes de capture — indispensable dès que le motif de recherche devient précis (format de date, structure d'email, extraction de sous-chaîne).
</div>

## D.5 Piège fréquent : caractères spéciaux à échapper

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un point "." dans un motif regex correspond à N'IMPORTE QUEL caractère</span>
```powershell
"192x168x1x1" -match "192.168.1.1"     # ✅ correspond quand meme, car "." = n'importe quoi
"192.168.1.1" -match "192\.168\.1\.1"  # ✅ le SEUL motif qui exige vraiment des points littéraux
```
Pour rechercher un point, une parenthèse, ou tout autre caractère ayant un sens spécial en regex, il doit être échappé avec un antislash (`\.`, `\(`, `\)`) — un oubli fréquent qui rend un filtre trop permissif sans erreur visible.
</div>

*Annexe suivante : les erreurs fréquentes et leurs solutions, en synthèse de l'ensemble du manuel.*

<div class="chapitre-titre-num">ANNEXE C</div>

# Cheat sheet — 200 cmdlets PowerShell essentielles

<div class="encadre astuce">
<span class="encadre-titre">💡 Note sur cette annexe</span>
Cmdlets réellement employées dans ce manuel ou en pratique professionnelle courante, organisées par domaine et reliées au chapitre où chacune est expliquée. `Get-Command -Module <Nom>` (chapitre 10) retrouve à tout moment la liste exhaustive et à jour d'un module donné.
</div>

## C.1 Découverte et aide (chapitre 10)

`Get-Command`, `Get-Help`, `Get-Member`, `Update-Help`, `Get-Verb`, `Get-Alias`, `Show-Command`

## C.2 Navigation et fichiers (chapitres 10-11)

`Get-ChildItem`, `Get-Location`, `Set-Location`, `Push-Location`, `Pop-Location`, `New-Item`, `Copy-Item`, `Move-Item`, `Rename-Item`, `Remove-Item`, `Get-Content`, `Set-Content`, `Add-Content`, `Clear-Content`, `Test-Path`, `Resolve-Path`, `Join-Path`, `Split-Path`, `Get-Item`, `Get-ItemProperty`, `Set-ItemProperty`

## C.3 Objets et pipeline (chapitre 12)

`Select-Object`, `Where-Object`, `Sort-Object`, `Group-Object`, `Measure-Object`, `Compare-Object`, `ForEach-Object`, `Format-Table`, `Format-List`, `Format-Wide`, `Format-Custom`, `Out-File`, `Out-Null`, `Out-GridView`, `Tee-Object`, `New-Object`

## C.4 Variables, types, collections (chapitre 13)

`Get-Variable`, `Set-Variable`, `Remove-Variable`, `Clear-Variable`, `ConvertTo-Json`, `ConvertFrom-Json`, `ConvertTo-Csv`, `ConvertFrom-Csv`, `ConvertTo-Html`, `Export-Csv`, `Import-Csv`

## C.5 Conditions, boucles, fonctions (chapitres 14-16)

Mots-clés : `if`, `elseif`, `else`, `switch`, `foreach`, `for`, `while`, `do`, `break`, `continue`, `function`, `param`, `return`, `try`, `catch`, `finally`. Cmdlets : `Invoke-Command` *(bloc de script local)*, `Measure-Command`

## C.6 Processus (chapitre 17)

`Get-Process`, `Start-Process`, `Stop-Process`, `Wait-Process`, `Debug-Process`, `Get-Counter`

## C.7 Services (chapitre 18)

`Get-Service`, `Start-Service`, `Stop-Service`, `Restart-Service`, `Suspend-Service`, `Resume-Service`, `Set-Service`, `New-Service`

## C.8 Informations système / CIM (chapitre 19)

`Get-ComputerInfo`, `Get-CimInstance`, `Get-CimClass`, `Invoke-CimMethod`, `New-CimSession`, `Remove-CimSession`, `Get-CimSession`, `Get-Volume`, `Get-Disk`, `Get-Partition`, `Get-HotFix`

## C.9 Réseau (chapitre 20)

`Get-NetIPConfiguration`, `Get-NetIPAddress`, `Get-NetAdapter`, `Enable-NetAdapter`, `Disable-NetAdapter`, `Restart-NetAdapter`, `Test-Connection`, `Test-NetConnection`, `Get-NetTCPConnection`, `Get-NetUDPEndpoint`, `Resolve-DnsName`, `Clear-DnsClientCache`, `Get-DnsClientServerAddress`, `Set-DnsClientServerAddress`, `Get-NetNeighbor`, `Get-NetRoute`, `New-NetRoute`

## C.10 API REST (chapitre 21)

`Invoke-WebRequest`, `Invoke-RestMethod`, `ConvertTo-Json`, `ConvertFrom-Json`

## C.11 Sécurité (chapitre 22)

`Get-Acl`, `Set-Acl`, `Get-ExecutionPolicy`, `Set-ExecutionPolicy`, `Set-AuthenticodeSignature`, `Get-AuthenticodeSignature`, `ConvertTo-SecureString`, `ConvertFrom-SecureString`, `Set-Secret`, `Get-Secret`, `Remove-Secret`, `Register-SecretVault`, `Get-Credential`, `New-SelfSignedCertificate`, `Get-NetFirewallRule`, `New-NetFirewallRule`, `Disable-NetFirewallRule`, `Remove-NetFirewallRule`, `Get-MpComputerStatus`, `Get-MpThreatDetection`, `Start-MpScan`, `Update-MpSignature`, `Add-MpPreference`, `Get-WinEvent`, `Get-EventLog`

## C.12 Automatisation et tâches planifiées (chapitre 23)

`New-ScheduledTaskAction`, `New-ScheduledTaskTrigger`, `New-ScheduledTaskPrincipal`, `New-ScheduledTaskSettingsSet`, `Register-ScheduledTask`, `Get-ScheduledTask`, `Get-ScheduledTaskInfo`, `Start-ScheduledTask`, `Stop-ScheduledTask`, `Disable-ScheduledTask`, `Enable-ScheduledTask`, `Unregister-ScheduledTask`, `Start-Sleep`, `Get-Random`, `Clear-RecycleBin`

## C.13 Modules et profil (chapitre 24)

`Import-Module`, `Export-ModuleMember`, `Get-Module`, `Remove-Module`, `New-ModuleManifest`, `Test-ModuleManifest`, `Find-Module`, `Install-Module`, `Update-Module`, `Uninstall-Module`, `Get-InstalledModule`, `Publish-Module`

## C.14 Remoting (chapitre 25)

`Enable-PSRemoting`, `Disable-PSRemoting`, `Test-WSMan`, `Invoke-Command`, `New-PSSession`, `Get-PSSession`, `Enter-PSSession`, `Exit-PSSession`, `Remove-PSSession`, `New-PSSessionOption`

## C.15 Azure (chapitre 26)

`Connect-AzAccount`, `Disconnect-AzAccount`, `Get-AzContext`, `Set-AzContext`, `Get-AzSubscription`, `Get-AzResourceGroup`, `New-AzResourceGroup`, `Remove-AzResourceGroup`, `Get-AzVM`, `New-AzVM`, `Start-AzVM`, `Stop-AzVM`, `Remove-AzVM`, `New-AzStorageAccount`, `New-AzStorageContainer`, `Set-AzStorageBlobContent`, `Get-AzStorageBlob`

## C.16 Développement et DevOps (chapitres 27-28)

`Test-Connection` *(vérif dispo services)*, `Start-Job`, `Get-Job`, `Receive-Job`, `Stop-Job`, `Wait-Job`, `Get-FileHash`, `Compress-Archive`, `Expand-Archive`, `Select-String`

## C.17 Dépannage (chapitre 29)

`Write-Verbose`, `Write-Debug`, `Write-Warning`, `Write-Error`, `Write-Information`, `Write-Host`, `Write-Output`, `Set-PSBreakpoint`, `Get-PSBreakpoint`, `Remove-PSBreakpoint`, `Trace-Command`

## C.18 Divers indispensables

`Get-Date`, `Start-Transcript`, `Stop-Transcript`, `Get-Culture`, `Get-Host`, `$PSVersionTable`, `Get-TypeData`, `Update-TypeData`, `Get-PSDrive`, `New-PSDrive`, `Invoke-Expression`, `Invoke-Item`, `Get-Transcript`

*Annexe suivante : cheat sheet des 50 commandes réseau.*

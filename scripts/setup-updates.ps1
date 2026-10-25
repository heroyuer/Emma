param([Parameter(Mandatory=$true)][string]$InstallRoot)
$ErrorActionPreference = 'Stop'
$resolvedRoot = (Resolve-Path -LiteralPath $InstallRoot).Path
$resolvedHome = [Environment]::GetFolderPath('UserProfile')
if (-not $resolvedRoot.StartsWith($resolvedHome + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Use this account home for the Emma installation' }
$nodePath = (Get-Command node -ErrorAction Stop).Source
$launcherPath = Join-Path $resolvedRoot 'launcher.mjs'
if (-not (Test-Path -LiteralPath $launcherPath)) { throw 'Run bootstrap first' }
$action = New-ScheduledTaskAction -Execute $nodePath -Argument ('"' + $launcherPath + '" --root "' + $resolvedRoot + '"')
$triggers = @((New-ScheduledTaskTrigger -Daily -At '12:00'), (New-ScheduledTaskTrigger -AtLogOn -User ([Security.Principal.WindowsIdentity]::GetCurrent().Name)))
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 10)
$principal = New-ScheduledTaskPrincipal -UserId ([Security.Principal.WindowsIdentity]::GetCurrent().Name) -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName 'Emma approved updates' -Action $action -Trigger $triggers -Settings $settings -Principal $principal -Force | Out-Null
Write-Output 'Registered for this Windows account: daily noon and sign-in; offline catch-up when available. Client refresh may require restart.'

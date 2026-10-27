param([Parameter(Mandatory=$true)][string]$InstallRoot, [ValidateSet('stable','preview')][string]$Channel)
$ErrorActionPreference = 'Stop'
$resolvedRoot = (Resolve-Path -LiteralPath $InstallRoot).Path
$resolvedHome = [Environment]::GetFolderPath('UserProfile')
if (-not $resolvedRoot.StartsWith($resolvedHome + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Use this account home for the Emma installation' }
$toolchainFile = Join-Path $resolvedRoot 'runtime/toolchain.json'
$nodePath = $null
if (Test-Path -LiteralPath $toolchainFile) { $nodePath = (Get-Content -LiteralPath $toolchainFile -Raw | ConvertFrom-Json).paths.node }
if (!$nodePath -or !(Test-Path -LiteralPath $nodePath -PathType Leaf)) { $nodePath = (Get-Command node -ErrorAction Stop).Source }
$launcherPath = Join-Path $resolvedRoot 'launcher.mjs'
if (-not (Test-Path -LiteralPath $launcherPath)) { throw 'Run bootstrap first' }
$toolchainScript = Join-Path $resolvedRoot 'current/scripts/toolchain.mjs'
$toolArgs = @('"' + $toolchainScript + '"', '--root', '"' + $resolvedRoot + '"')
$toolProcess = Start-Process -FilePath $nodePath -ArgumentList $toolArgs -WindowStyle Hidden -Wait -PassThru
if ($toolProcess.ExitCode -ne 0) { throw 'Cannot register updater without validated per-user tools' }
$action = New-ScheduledTaskAction -Execute $nodePath -WorkingDirectory $resolvedRoot -Argument ('"' + $launcherPath + '" --root "' + $resolvedRoot + '"')
$triggers = @((New-ScheduledTaskTrigger -Daily -At '12:00'), (New-ScheduledTaskTrigger -AtLogOn -User ([Security.Principal.WindowsIdentity]::GetCurrent().Name)))
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 10)
$principal = New-ScheduledTaskPrincipal -UserId ([Security.Principal.WindowsIdentity]::GetCurrent().Name) -LogonType Interactive -RunLevel Limited
$existing = Get-ScheduledTask -TaskName 'Emma approved updates' -ErrorAction SilentlyContinue
if ($existing) {
  $expectedSid = [Security.Principal.WindowsIdentity]::GetCurrent().User.Value
  $existingSid = $existing.Principal.UserId
  if (-not $existingSid.StartsWith('S-1-')) { $existingSid = ([Security.Principal.NTAccount]::new($existingSid)).Translate([Security.Principal.SecurityIdentifier]).Value }
  if ($existingSid -ne $expectedSid) { throw 'Existing task belongs to another account; no change made' }
  $triggers = $existing.Triggers
  $settings = $existing.Settings
  $principal = $existing.Principal
}
if (!$Channel) {
    $Channel = 'stable'
    if ($existing -and @($existing.Actions | Where-Object { $_.Arguments -match '(?:^|\s)--preview(?:\s|$)' }).Count -gt 0) { $Channel = 'preview' }
}
$channelFlag = ''
if ($Channel -eq 'preview') { $channelFlag = ' --preview' }
$action = New-ScheduledTaskAction -Execute $nodePath -WorkingDirectory $resolvedRoot -Argument ('"' + $launcherPath + '" --root "' + $resolvedRoot + '"' + $channelFlag)
Register-ScheduledTask -TaskName 'Emma approved updates' -Action $action -Trigger $triggers -Settings $settings -Principal $principal -Force | Out-Null
$verifiedTask = Get-ScheduledTask -TaskName 'Emma approved updates' -ErrorAction Stop
$verifiedPreview = @($verifiedTask.Actions | Where-Object { $_.Arguments -match '(?:^|\s)--preview(?:\s|$)' }).Count -gt 0
if ($verifiedPreview -ne ($Channel -eq 'preview')) { throw 'Scheduled update channel readback did not match' }
Write-Output ("Current-user update task reconciled and channel verified: " + $Channel + ". Existing timing preserved; a new task defaults to noon/sign-in. A running client or pending save defers activation.")

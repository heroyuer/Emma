param([Parameter(Mandatory=$true)][string]$InstallRoot)
$ErrorActionPreference = 'Stop'
$resolvedRoot = (Resolve-Path -LiteralPath $InstallRoot).Path
$resolvedHome = [Environment]::GetFolderPath('UserProfile')
if (-not $resolvedRoot.StartsWith($resolvedHome + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Use this account home for the Emma installation' }
$nodePath = (Get-Command node -ErrorAction Stop).Source
$launcherPath = Join-Path $resolvedRoot 'launcher.mjs'
if (-not (Test-Path -LiteralPath $launcherPath)) { throw 'Run bootstrap first' }
$toolchainScript = Join-Path $resolvedRoot 'current/scripts/toolchain.mjs'
& $nodePath $toolchainScript --root $resolvedRoot
if ($LASTEXITCODE -ne 0) { throw 'Cannot register updater without validated per-user tools' }
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
Register-ScheduledTask -TaskName 'Emma approved updates' -Action $action -Trigger $triggers -Settings $settings -Principal $principal -Force | Out-Null
Write-Output 'Current-user update task reconciled; existing timing preserved. A new task defaults to noon/sign-in. Client fresh-chat/restart may be required.'

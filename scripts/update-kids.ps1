[CmdletBinding()]
param(
    [ValidatePattern('^\d+\.\d+\.\d+$')]
    [string]$Version,
    [switch]$Preview,
    [string]$InstallRoot = (Join-Path $env:USERPROFILE '.emma')
)
$ErrorActionPreference = 'Stop'
$emmaRoot = [IO.Path]::GetFullPath($InstallRoot)
$emmaGuard = Join-Path $emmaRoot 'runtime\lesson-active.json'
if (Test-Path -LiteralPath $emmaGuard) {
    Write-Output '{"status":"deferred","reason":"Finish or resolve the current lesson and pending archive before updating."}'
    exit 2
}
$emmaToolFile = Join-Path $emmaRoot 'runtime\toolchain.json'
$emmaLauncher = Join-Path $emmaRoot 'launcher.mjs'
if (!(Test-Path -LiteralPath $emmaToolFile) -or !(Test-Path -LiteralPath $emmaLauncher)) {
    throw 'Existing Emma installation/toolchain required. Use the setup guide in this account; do not create a second plugin.'
}
$emmaTools = Get-Content -LiteralPath $emmaToolFile -Raw | ConvertFrom-Json
$emmaNode = $emmaTools.paths.node
if (!$emmaNode -or ![IO.Path]::IsPathRooted($emmaNode) -or !(Test-Path -LiteralPath $emmaNode -PathType Leaf)) {
    throw 'Configured Node executable is unavailable. Repair this account toolchain before updating.'
}
$emmaArgs = @($emmaLauncher, '--root', $emmaRoot, '--between-sessions')
if ($Version) { $emmaArgs += @('--version', $Version) }
if ($Preview) { $emmaArgs += '--preview' }
$emmaStdout = [IO.Path]::GetTempFileName()
$emmaStderr = [IO.Path]::GetTempFileName()
try {
    $emmaQuotedArgs = @($emmaArgs | ForEach-Object { '"' + $_.Replace('"', '\"') + '"' })
    $emmaProcess = Start-Process -FilePath $emmaNode -ArgumentList $emmaQuotedArgs -WindowStyle Hidden -Wait -PassThru -RedirectStandardOutput $emmaStdout -RedirectStandardError $emmaStderr
    $emmaExit = $emmaProcess.ExitCode
    $emmaOutput = Get-Content -LiteralPath $emmaStdout -Raw
    $emmaError = Get-Content -LiteralPath $emmaStderr -Raw
    if ($emmaError) { Write-Output $emmaError }
}
finally {
    Remove-Item -LiteralPath $emmaStdout, $emmaStderr -ErrorAction SilentlyContinue
}
if ($emmaExit -ne 0) {
    Write-Output $emmaOutput
    exit $emmaExit
}
try { $emmaResult = ($emmaOutput -join [Environment]::NewLine) | ConvertFrom-Json }
catch { throw 'Updater output could not be verified; installation is not confirmed.' }
Write-Output ($emmaResult | ConvertTo-Json -Depth 10 -Compress)
$emmaExpected = $Version
if (!$emmaExpected) { $emmaExpected = $emmaResult.version }
if (!$emmaExpected -or $emmaResult.cache_refresh -ne 'verified' -or $emmaResult.installed_version -ne $emmaExpected) {
    Write-Output 'Update is pending or the expected installed version was not verified. Keep the current settings and inspect the status above.'
    exit 2
}
Write-Output "Emma $emmaExpected is installed. Start a fresh chat and confirm its loaded version before today's real session."

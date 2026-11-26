# Only the container name is needed; the caller removes inherited signing credentials.
$ErrorActionPreference = 'Stop'
Add-Type -Path (Join-Path $PSScriptRoot 'windows-token-public-key.cs')
[SnhTokenPublicKey]::Read([SnhTokenPublicKey+NativeApi]::new(), $env:SNH_TOKEN_PUBLIC_CONTAINER) | ConvertTo-Json -Compress

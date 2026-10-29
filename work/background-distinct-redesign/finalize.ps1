$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$workspacePath=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$assetsPath=Join-Path $workspacePath 'images/flair/backgrounds'
$files=@('GlassBeach.jpg','VolcanicRidge.jpg','SnowGhostRidge.jpg','OpenPlains.jpg')
$beforeAll=@{}
Get-ChildItem -LiteralPath $assetsPath -File -Filter '*.jpg' | ForEach-Object {$beforeAll[$_.Name]=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash}
foreach($file in $files){
 $destination=Join-Path $assetsPath $file
 $original=Join-Path $PSScriptRoot ('originals/'+$file)
 $revised=Join-Path $PSScriptRoot ('revised/'+$file)
 if((Get-FileHash -LiteralPath $destination).Hash -ne (Get-FileHash -LiteralPath $original).Hash){throw "Current asset changed since backup: $file"}
 $b=[System.Drawing.Bitmap]::new($revised)
 try{if($b.Width -ne 1536 -or $b.Height -ne 1536 -or $b.RawFormat.Guid -ne [System.Drawing.Imaging.ImageFormat]::Jpeg.Guid){throw "Invalid final image: $file"}}finally{$b.Dispose()}
}
$records=@()
foreach($file in $files){
 $destination=Join-Path $assetsPath $file
 $revised=Join-Path $PSScriptRoot ('revised/'+$file)
 Copy-Item -LiteralPath $revised -Destination $destination
 $hash=(Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash
 if($hash -ne (Get-FileHash -LiteralPath $revised -Algorithm SHA256).Hash){throw "Copy verification failed: $file"}
 $records += [ordered]@{filename=$file;path=$destination;width=1536;height=1536;format='JPEG';bytes=(Get-Item -LiteralPath $destination).Length;beforeSha256=$beforeAll[$file];afterSha256=$hash}
}
foreach($file in $beforeAll.Keys){if($file -notin $files -and (Get-FileHash -LiteralPath (Join-Path $assetsPath $file)).Hash -ne $beforeAll[$file]){throw "Unrelated asset changed: $file"}}
$records | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'final-assets.json') -Encoding utf8
$zipPath=Join-Path $PSScriptRoot 'Redesigned-Backgrounds-4.zip'
$zipStream=[System.IO.File]::Open($zipPath,[System.IO.FileMode]::CreateNew)
$zip=[System.IO.Compression.ZipArchive]::new($zipStream,[System.IO.Compression.ZipArchiveMode]::Create)
function Add-ZipFile($source,$entry){[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip,$source,$entry,[System.IO.Compression.CompressionLevel]::Optimal) | Out-Null}
try{
 foreach($file in $files){
  Add-ZipFile (Join-Path $assetsPath $file) ('Backgrounds/'+$file)
  Add-ZipFile (Join-Path $PSScriptRoot ('originals/'+$file)) ('Originals/'+$file)
 }
 foreach($file in @('README.txt','prompts.json','refinement-prompts.json','generation-history.json','final-assets.json')){Add-ZipFile (Join-Path $PSScriptRoot $file) $file}
 foreach($file in @('game-preview.jpg','comparison.jpg')){Add-ZipFile (Join-Path $PSScriptRoot ('previews/'+$file)) ('Previews/'+$file)}
}finally{$zip.Dispose();$zipStream.Dispose()}
$archive=[System.IO.Compression.ZipFile]::OpenRead($zipPath)
try{
 foreach($record in $records){
  $entry=$archive.GetEntry('Backgrounds/'+$record.filename)
  if(-not $entry){throw 'Missing ZIP image'}
  $stream=$entry.Open();$sha=[System.Security.Cryptography.SHA256]::Create()
  try{$hash=[System.Convert]::ToHexString($sha.ComputeHash($stream));if($hash -ne $record.afterSha256){throw 'ZIP hash mismatch'}}finally{$sha.Dispose();$stream.Dispose()}
 }
}finally{$archive.Dispose()}
$result=[ordered]@{updated=4;otherAssetsUnchanged=($beforeAll.Count-4);dimensions='1536x1536';format='JPEG';zip=$zipPath;zipBytes=(Get-Item -LiteralPath $zipPath).Length;files=$records}
$result | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'verification.json') -Encoding utf8
$result | ConvertTo-Json -Depth 6

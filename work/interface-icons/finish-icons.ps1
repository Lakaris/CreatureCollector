$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.IO.Compression
$workspacePath=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$manifest=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'manifest.json') -Raw | ConvertFrom-Json
$generated=@(Get-Content -LiteralPath (Join-Path $PSScriptRoot 'generated.jsonl') | ForEach-Object {$_ | ConvertFrom-Json})
$completed=@(Get-Content -LiteralPath (Join-Path $PSScriptRoot 'completed.jsonl') | ForEach-Object {$_ | ConvertFrom-Json})
if($generated.Count -ne 42 -or $completed.Count -ne 42){throw 'Expected 42 completed icons.'}
$checks=foreach($item in $manifest.items){
 $path=Join-Path $workspacePath $item.destination
 $bitmap=[System.Drawing.Bitmap]::new($path)
 try{
  if($bitmap.Width -ne 256 -or $bitmap.Height -ne 256){throw ('Wrong dimensions: '+$path)}
  if($bitmap.RawFormat.Guid -ne [System.Drawing.Imaging.ImageFormat]::Png.Guid){throw ('Wrong format: '+$path)}
  foreach($corner in @(@(0,0),@(255,0),@(0,255),@(255,255))){if($bitmap.GetPixel($corner[0],$corner[1]).A -ne 0){throw ('Opaque corner: '+$path)}}
  $export=@($completed | Where-Object filename -eq $item.filename)
  if($export.Count -ne 1){throw ('Missing or duplicated export: '+$item.name)}
  [pscustomobject]@{name=$item.name;category=$item.group;path=$item.destination;width=256;height=256;transparent=$true;bounds=$export[0].bounds}
 }finally{$bitmap.Dispose()}
}
$checks | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'verification.json') -Encoding utf8
$checks | Select-Object name,category,path,width,height,transparent | Export-Csv -LiteralPath (Join-Path $PSScriptRoot 'icon-index.csv') -NoTypeInformation -Encoding utf8
[ordered]@{tool=$manifest.tool;size=@(256,256);transparent_background=$true;items=$generated;exports=$completed} | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'prompts.json') -Encoding utf8
$archivePath=Join-Path $PSScriptRoot 'icon-pack.zip'
if(Test-Path -LiteralPath $archivePath){throw 'Archive already exists.'}
$archive=[System.IO.Compression.ZipFile]::Open($archivePath,[System.IO.Compression.ZipArchiveMode]::Create)
try{
 foreach($item in $manifest.items){[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive,(Join-Path $workspacePath $item.destination),$item.destination,[System.IO.Compression.CompressionLevel]::Optimal) | Out-Null}
 [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive,(Join-Path $PSScriptRoot 'icon-index.csv'),'icon-index.csv') | Out-Null
}finally{$archive.Dispose()}
Write-Output ('Verified and packaged '+$checks.Count+' transparent 256 x 256 PNGs.')

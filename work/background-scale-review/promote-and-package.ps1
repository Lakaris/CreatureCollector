$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.IO.Compression
$workspacePath=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$assetRoot=[System.IO.Path]::GetFullPath((Join-Path $workspacePath 'images\flair\backgrounds'))+[System.IO.Path]::DirectorySeparatorChar
$audit=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'review-decisions.json') -Raw | ConvertFrom-Json
$edited=@($audit.items | Where-Object decision -eq 'edit')
if($audit.items.Count -ne 80 -or $edited.Count -ne 15){throw 'Unexpected audit counts.'}
$changes=@(foreach($item in $edited){
 $filename=[System.IO.Path]::GetFileName($item.path)
 $destination=[System.IO.Path]::GetFullPath((Join-Path $workspacePath $item.path))
 if(!$destination.StartsWith($assetRoot,[System.StringComparison]::OrdinalIgnoreCase)){throw 'Destination outside background folder.'}
 $backup=Join-Path $PSScriptRoot ('originals\'+$filename)
 $draft=Join-Path $PSScriptRoot ('revised\'+$filename)
 $beforeHash=(Get-FileHash -LiteralPath $backup -Algorithm SHA256).Hash
 if((Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash -ne $beforeHash){throw ('Current game file changed during review: '+$filename)}
 $b=[System.Drawing.Bitmap]::new($draft)
 try{if($b.Width -ne 1536 -or $b.Height -ne 1536 -or $b.RawFormat.Guid -ne [System.Drawing.Imaging.ImageFormat]::Jpeg.Guid){throw ('Invalid revised image: '+$filename)}}finally{$b.Dispose()}
 [pscustomobject]@{name=$item.name;filename=$filename;destination=$destination;draft=$draft;backup=$backup;beforeSha256=$beforeHash.ToLower();afterSha256=(Get-FileHash -LiteralPath $draft -Algorithm SHA256).Hash.ToLower()}
})
$baseline=@(foreach($item in $audit.items){[pscustomobject]@{name=$item.name;path=$item.path;sha256=(Get-FileHash -LiteralPath (Join-Path $workspacePath $item.path) -Algorithm SHA256).Hash.ToLower()}})
$baseline | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'pre-update-hashes.json') -Encoding utf8
foreach($change in $changes){Copy-Item -LiteralPath $change.draft -Destination $change.destination -Force}
$changes | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'applied-changes.json') -Encoding utf8
$index=@(foreach($item in $audit.items){
 $filename=[System.IO.Path]::GetFileName($item.path)
 $path=Join-Path $workspacePath $item.path
 $b=[System.Drawing.Bitmap]::new($path)
 try{if($b.Width -ne 1536 -or $b.Height -ne 1536 -or $b.RawFormat.Guid -ne [System.Drawing.Imaging.ImageFormat]::Jpeg.Guid){throw ('Invalid game background: '+$filename)}}finally{$b.Dispose()}
 $hash=(Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLower()
 $changed=$item.decision -eq 'edit'
 if(!$changed -and $hash -ne ($baseline | Where-Object name -eq $item.name).sha256){throw ('Unselected background changed: '+$item.name)}
 if($changed -and $hash -ne ($changes | Where-Object name -eq $item.name).afterSha256){throw ('Copy verification failed: '+$item.name)}
 [pscustomobject][ordered]@{name=$item.name;gameId=$item.id;filename=$filename;changed=$changed;width=1536;height=1536;format='JPEG';bytes=(Get-Item -LiteralPath $path).Length;sha256=$hash;path=$path}
})
$index | Select-Object * -ExcludeProperty path | Export-Csv -LiteralPath (Join-Path $PSScriptRoot 'background-index.csv') -NoTypeInformation -Encoding utf8
$template=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'gallery-template.html') -Raw
$localData=@($index | ForEach-Object {[ordered]@{name=$_.name;changed=$_.changed;after=('../../images/flair/backgrounds/'+$_.filename);before=if($_.changed){'originals/'+$_.filename}else{$null}}}) | ConvertTo-Json -Compress
$portableData=@($index | ForEach-Object {[ordered]@{name=$_.name;changed=$_.changed;after=('Backgrounds/'+$_.filename);before=if($_.changed){'Before/'+$_.filename}else{$null}}}) | ConvertTo-Json -Compress
[System.IO.File]::WriteAllText((Join-Path $PSScriptRoot 'gallery.html'),$template.Replace('%%DATA%%',$localData),[System.Text.UTF8Encoding]::new($false))
$readme=@'
BACKGROUND SCALE REVIEW

80 game backgrounds reviewed using the supplied in-game screenshot and a creature overlay at approximately the same scale. Decorative objects were reduced in 15 backgrounds. The other 65 images were retained.

Backgrounds/ contains the complete updated set of 80 opaque 1536 x 1536 JPG files.
Before/ contains the 15 original images as backups.
Open gallery.html to compare the adjusted scenes with a creature overlay, or switch to all 80 reviewed scenes.
The character is only a preview overlay. No character is baked into the background JPGs.

The game files at images/flair/backgrounds/ were updated directly. No game code was changed.
Edits were made with the built-in ImageGen tool, then resized and JPEG-encoded at quality 85 (80-85 if needed for file size).
edit-prompts-final.json records the edit prompts. review-decisions.json records the audit and requested corrections.
Original PNG generation outputs, intermediate revisions, and additional inspection previews are retained in the local work/background-scale-review folder.
'@
[System.IO.File]::WriteAllText((Join-Path $PSScriptRoot 'README.txt'),$readme,[System.Text.UTF8Encoding]::new($false))
$zipPath=Join-Path $PSScriptRoot 'Backgrounds-Scale-Checked-80.zip'
$stream=[System.IO.File]::Open($zipPath,[System.IO.FileMode]::CreateNew)
$zip=[System.IO.Compression.ZipArchive]::new($stream,[System.IO.Compression.ZipArchiveMode]::Create,$false)
try{
 foreach($entry in $index){[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip,$entry.path,('Backgrounds/'+$entry.filename),[System.IO.Compression.CompressionLevel]::NoCompression) | Out-Null}
 foreach($change in $changes){[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip,$change.backup,('Before/'+$change.filename),[System.IO.Compression.CompressionLevel]::NoCompression) | Out-Null}
 foreach($name in @('background-index.csv','edit-prompts-final.json','review-decisions.json','README.txt','scale-creature.png')){[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip,(Join-Path $PSScriptRoot $name),$name,[System.IO.Compression.CompressionLevel]::Optimal) | Out-Null}
 $writer=[System.IO.StreamWriter]::new($zip.CreateEntry('gallery.html').Open(),[System.Text.UTF8Encoding]::new($false))
 try{$writer.Write($template.Replace('%%DATA%%',$portableData))}finally{$writer.Dispose()}
}finally{$zip.Dispose();$stream.Dispose()}
$summary=[ordered]@{reviewed=$index.Count;updated=$changes.Count;retained=($index.Count-$changes.Count);width=1536;height=1536;format='JPEG';totalBytes=($index.bytes | Measure-Object -Sum).Sum;zip=$zipPath;zipBytes=(Get-Item -LiteralPath $zipPath).Length;verifiedUtc=[DateTime]::UtcNow.ToString('o')}
$summary | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'verification.json') -Encoding utf8
$summary | ConvertTo-Json -Compress

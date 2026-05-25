$MavenVersion = "3.9.9"
$CacheDir     = "$env:USERPROFILE\.m2\wrapper\dists\apache-maven-$MavenVersion"
$MavenHome    = "$CacheDir\apache-maven-$MavenVersion"
$MavenCmd     = "$MavenHome\bin\mvn.cmd"

if (-not (Test-Path $MavenCmd)) {
    Write-Host "Downloading Apache Maven $MavenVersion ..."
    New-Item -ItemType Directory -Force -Path $CacheDir | Out-Null
    $url = "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/$MavenVersion/apache-maven-$MavenVersion-bin.zip"
    $zip = "$CacheDir.zip"
    Invoke-WebRequest -Uri $url -OutFile $zip
    Expand-Archive -Path $zip -DestinationPath $CacheDir -Force
    Remove-Item $zip
    Write-Host "Maven downloaded."
}

Write-Host "Starting SailConnect backend ..."
& $MavenCmd spring-boot:run

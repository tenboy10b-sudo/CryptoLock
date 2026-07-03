---
title: "PowerShell Scripting for Windows Admins: Variables, Loops and Functions"
date: "2026-06-14"
publishDate: "2026-06-14"
description: "Learn PowerShell scripting fundamentals for Windows administration. Variables, conditionals, loops, functions, error handling and running scripts securely."
tags: ["windows", "powershell", "scripting", "automation", "administration"]
readTime: 6
translatesUk: "osnovy-powershell-skripty-windows"
---

PowerShell scripts automate repetitive tasks. Here's everything you need to go from copy-pasting commands to writing reusable scripts.

---

## Variables and Data Types

```powershell
# Strings
$name = "Windows Admin"
$path = "C:\Logs\output.txt"

# Numbers
$count = 42
$ram = 16.5

# Arrays
$servers = @("PC01", "PC02", "PC03")
$servers[0]   # first element: PC01
$servers.Count  # number of elements: 3

# Hashtables (key-value)
$config = @{
  Server = "192.168.1.10"
  Port   = 443
  SSL    = $true
}
$config.Server  # 192.168.1.10

# Boolean
$enabled = $true
$debug = $false
```

---

## String Manipulation

```powershell
# String interpolation
$computer = "PC01"
Write-Host "Connected to: $computer"

# String methods
"UPPERCASE".ToLower()       # lowercase
"  trim me  ".Trim()        # remove spaces
"path\to\file".Split("\")   # split to array
"hello world".Replace("world", "PowerShell")

# Here-strings (multiline)
$message = @"
Server: $computer
Status: Online
Time: $(Get-Date)
"@
```

---

## Conditionals

```powershell
# If / ElseIf / Else
$cpu = (Get-CimInstance Win32_Processor).LoadPercentage

if ($cpu -gt 90) {
  Write-Warning "CPU critical: $cpu%"
} elseif ($cpu -gt 70) {
  Write-Host "CPU high: $cpu%" -ForegroundColor Yellow
} else {
  Write-Host "CPU normal: $cpu%" -ForegroundColor Green
}

# Switch statement
switch ($cpu) {
  {$_ -gt 90} { "Critical"; break }
  {$_ -gt 70} { "High"; break }
  default      { "Normal" }
}
```

---

## Loops

```powershell
# ForEach-Object (pipeline)
Get-Service | Where-Object {$_.Status -eq "Stopped"} |
  ForEach-Object { Write-Host "Stopped: $($_.Name)" }

# foreach loop (faster for collections)
$computers = @("PC01", "PC02", "PC03")
foreach ($pc in $computers) {
  Write-Host "Checking $pc..."
  Test-NetConnection $pc -Port 3389 -EA 0
}

# For loop
for ($i = 1; $i -le 10; $i++) {
  Write-Host "Item $i"
}

# While loop
$attempts = 0
while ($attempts -lt 3) {
  $attempts++
  Write-Host "Attempt $attempts"
}
```

---

## Functions

```powershell
# Basic function
function Get-DiskInfo {
  param(
    [string]$DriveLetter = "C",
    [switch]$Verbose
  )
  
  $drive = Get-PSDrive $DriveLetter
  $freeGB = [math]::Round($drive.Free/1GB, 1)
  $usedGB = [math]::Round($drive.Used/1GB, 1)
  $totalGB = $freeGB + $usedGB
  $freePct = [math]::Round($freeGB/$totalGB * 100)
  
  if ($Verbose) {
    Write-Host "Drive ${DriveLetter}: Total=$totalGB GB, Used=$usedGB GB, Free=$freeGB GB ($freePct%)"
  }
  
  return [PSCustomObject]@{
    Drive  = $DriveLetter
    FreeGB = $freeGB
    UsedGB = $usedGB
    FreePct = $freePct
  }
}

# Usage
Get-DiskInfo -DriveLetter "C" -Verbose
$info = Get-DiskInfo "D"
if ($info.FreePct -lt 10) { Write-Warning "Low disk space on $($info.Drive)!" }
```

---

## Error Handling

```powershell
# Try/Catch/Finally
try {
  $result = Get-Content "C:\Missing\file.txt" -ErrorAction Stop
  Write-Host "File contents: $result"
}
catch [System.IO.FileNotFoundException] {
  Write-Warning "File not found"
}
catch {
  Write-Error "Unexpected error: $($_.Exception.Message)"
}
finally {
  Write-Host "Always runs"
}

# ErrorAction preference
$ErrorActionPreference = "Stop"  # treat all errors as terminating

# -EA 0 = silently continue (short for -ErrorAction SilentlyContinue)
Get-Service "NonExistent" -EA 0
```

---

## Write Output

```powershell
Write-Host "Normal output" -ForegroundColor Cyan
Write-Warning "This is a warning"
Write-Error "This is an error"
Write-Verbose "Debug info" -Verbose
Write-Progress -Activity "Processing" -Status "50%" -PercentComplete 50

# Output to file
"Log entry" | Out-File "C:\log.txt" -Append
Get-Process | Export-Csv "C:\processes.csv" -NoTypeInformation
Get-Service | ConvertTo-Json | Out-File "C:\services.json"
```

---

## Summary

Variables: `$name`. Arrays: `@()`. Hashtables: `@{}`. Loops: `foreach` for collections, `ForEach-Object` for pipelines. Functions with `param()` for reusable code. Error handling with `try/catch`. Always use `-ErrorAction Stop` in functions to make errors catchable.

## Frequently Asked Questions

### What's the difference between Write-Host and Write-Output?

`Write-Host` writes directly to the console — output can't be piped or redirected. `Write-Output` (or just a bare value) writes to the pipeline — can be captured, piped, or redirected. Use `Write-Output` in functions, `Write-Host` for user messages.

### My script works interactively but fails when scheduled — why?

Check: 1) Execution policy for the SYSTEM account, 2) relative paths (use `$PSScriptRoot` instead), 3) modules not loaded automatically, 4) credentials needed. Add full paths and explicit module imports.

### How do I make a script accept parameters from command line?

```powershell
param(
  [Parameter(Mandatory=$true)]
  [string]$ServerName,
  [int]$Port = 443,
  [switch]$Verbose
)
# Run: .\script.ps1 -ServerName "PC01" -Port 80
```

---
title: "How to Monitor Windows Performance with Performance Monitor and Counters"
date: "2026-04-14"
publishDate: "2026-04-14"
description: "Use Windows Performance Monitor (perfmon) to track CPU, memory, disk, and network in real time and over time. Create data collector sets and analyze bottlenecks with built-in tools."
tags: ["windows", "diagnostics", "monitoring", "administration"]
readTime: 6
---

Performance Monitor goes far deeper than Task Manager — it lets you track hundreds of specific counters, record data over time, and generate reports. Here's how to use it effectively.

---

## Open Performance Monitor

`Win + R` → `perfmon`

Or: `Win + S` → **Performance Monitor**

Three main sections in the left panel:
- **Monitoring Tools** → **Performance Monitor** — real-time charts
- **Data Collector Sets** — record data over time
- **Reports** — view recorded data

---

## Real-Time Performance Monitor

Click **Monitoring Tools** → **Performance Monitor**

By default it shows `% Processor Time`. The green line shows CPU usage in real time.

**Add more counters:**
Click the `+` button → browse categories → select counters → **Add** → **OK**

**Useful counters to add:**

| Category | Counter | What it measures |
|----------|---------|-----------------|
| Processor | % Processor Time | Total CPU usage |
| Processor | % User Time | User-mode CPU |
| Memory | Available MBytes | Free RAM |
| Memory | Pages/sec | Pagefile activity |
| PhysicalDisk | % Disk Time | Disk busy time |
| PhysicalDisk | Avg. Disk Queue Length | Disk backlog |
| Network Interface | Bytes Total/sec | Network throughput |
| System | Processor Queue Length | CPU queue depth |

---

## PowerShell: Read Performance Counters

```powershell
# CPU usage
(Get-Counter '\Processor(_Total)\% Processor Time').CounterSamples.CookedValue

# Available RAM in MB
(Get-Counter '\Memory\Available MBytes').CounterSamples.CookedValue

# Disk queue (should be < 2)
(Get-Counter '\PhysicalDisk(_Total)\Avg. Disk Queue Length').CounterSamples.CookedValue

# Network bytes/sec on all adapters
Get-Counter '\Network Interface(*)\Bytes Total/sec' |
  Select-Object -ExpandProperty CounterSamples |
  Where-Object {$_.CookedValue -gt 0} |
  Select-Object InstanceName, CookedValue

# Multiple counters at once
$counters = @(
  '\Processor(_Total)\% Processor Time',
  '\Memory\Available MBytes',
  '\PhysicalDisk(_Total)\% Disk Time'
)
Get-Counter -Counter $counters | ForEach-Object {
  $_.CounterSamples | Select-Object Path, CookedValue
}
```

---

## Log Performance Over Time

```powershell
# Log CPU and memory every 5 seconds for 10 minutes
$counters = @('\Processor(_Total)\% Processor Time', '\Memory\Available MBytes')
$samples = 120  # 120 samples × 5 seconds = 10 minutes

Get-Counter -Counter $counters -SampleInterval 5 -MaxSamples $samples |
  ForEach-Object {
    $_.CounterSamples | Select-Object Timestamp, Path, CookedValue
  } | Export-Csv "C:\PerfLog.csv" -NoTypeInformation

# View the log
Import-Csv "C:\PerfLog.csv" | Format-Table
```

---

## Create a Data Collector Set

For ongoing monitoring that survives reboots:

`perfmon` → **Data Collector Sets** → **User Defined** → right-click → **New** → **Data Collector Set**

1. Name it (e.g. "System Health Monitor")
2. Choose **Create manually**
3. **Performance counter** → add your counters → set sample interval (60 seconds is reasonable)
4. Set output folder
5. Start → data is recorded until you stop

**View recorded data:**
`perfmon` → **Reports** → **User Defined** → find your set → view graphs or export.

---

## Generate System Performance Report

```powershell
# Auto-generate full performance report (60 seconds of data)
perfmon /report
```

Opens an HTML report with:
- CPU, memory, disk, network analysis
- Problem identification
- Recommendations

---

## Key Metrics and What They Mean

**CPU:**
- `% Processor Time` > 80% sustained = bottleneck
- `Processor Queue Length` > 2 = CPU can't keep up with requests

**Memory:**
- `Available MBytes` < 200 MB = critically low RAM
- `Pages/sec` > 20 = excessive pagefile use (need more RAM)

**Disk:**
- `Avg. Disk Queue Length` > 2 = disk bottleneck
- `Avg. Disk sec/Transfer` > 20ms (HDD) or 1ms (SSD) = slow disk

**Network:**
- Compare `Bytes Total/sec` to your known link speed
- Sustained at 100% of link speed = network saturation

---

## Continuous Monitoring Script

```powershell
# Monitor and alert if CPU > 80% or RAM < 500MB
while ($true) {
  $cpu = [math]::Round((Get-Counter '\Processor(_Total)\% Processor Time').CounterSamples.CookedValue, 0)
  $ram = [math]::Round((Get-Counter '\Memory\Available MBytes').CounterSamples.CookedValue, 0)
  $disk = [math]::Round((Get-Counter '\PhysicalDisk(_Total)\Avg. Disk Queue Length').CounterSamples.CookedValue, 1)

  $status = "$(Get-Date -Format 'HH:mm:ss') | CPU: $cpu% | RAM: $ram MB free | Disk Queue: $disk"

  if ($cpu -gt 80) { Write-Host $status -ForegroundColor Red }
  elseif ($ram -lt 500) { Write-Host $status -ForegroundColor Yellow }
  else { Write-Host $status -ForegroundColor Green }

  Start-Sleep 5
}
```

---

## Summary

`perfmon` for visual real-time charts. `Get-Counter` in PowerShell for scripting and logging. Key thresholds: CPU < 80%, RAM > 200MB free, Disk Queue < 2. Use Data Collector Sets to record over time and identify patterns. Run `perfmon /report` for an automated 60-second analysis.

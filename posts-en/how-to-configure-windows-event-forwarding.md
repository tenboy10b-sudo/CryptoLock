---
title: "How to Collect Windows Event Logs from Multiple PCs Centrally"
date: "2026-06-01"
publishDate: "2026-06-01"
description: "Set up Windows Event Forwarding to collect logs from multiple PCs to a central collector. Configure subscriptions, WinRM and filter events via PowerShell."
tags: ["windows", "event-log", "monitoring", "administration", "security"]
readTime: 6
---

Windows Event Forwarding lets you collect logs from dozens of PCs to one central location — essential for security monitoring and troubleshooting in multi-PC environments.

---

## Architecture

```
Source PCs (agents)
    ↓ push events
Collector PC (stores all logs)
    ↓
Analyze in Event Viewer or SIEM
```

---

## Step 1: Configure Collector PC

```powershell
# On the Collector PC — run as Administrator
winrm quickconfig -quiet

# Configure Windows Event Collector service
wecutil qc -quiet

# Verify
Get-Service wecsvc | Select-Object Status
```

---

## Step 2: Configure Source PCs

```powershell
# On each Source PC — run as Administrator
winrm quickconfig -quiet

# Add Collector to TrustedHosts (if not in domain)
Set-Item WSMan:\localhost\Client\TrustedHosts -Value "CollectorPC" -Force

# Add Network Service to Event Log Readers group
Add-LocalGroupMember -Group "Event Log Readers" -Member "NT AUTHORITY\NETWORK SERVICE"
```

---

## Step 3: Create Subscription on Collector

```powershell
# Create subscription via wecutil
$subscriptionXml = @"
<Subscription xmlns="http://schemas.microsoft.com/2006/03/windows/events/subscription">
  <SubscriptionId>Security-Events</SubscriptionId>
  <SubscriptionType>SourceInitiated</SubscriptionType>
  <Description>Security log collection</Description>
  <Enabled>true</Enabled>
  <Uri>http://schemas.microsoft.com/wbem/wsman/1/windows/EventLog</Uri>
  <ConfigurationMode>Custom</ConfigurationMode>
  <Delivery Mode="Push">
    <Batching>
      <MaxItems>20</MaxItems>
      <MaxLatencyTime>900000</MaxLatencyTime>
    </Batching>
    <PushSettings>
      <Heartbeat BaseTime="1800000"/>
    </PushSettings>
  </Delivery>
  <Query>
    <![CDATA[
      <QueryList>
        <Query Id="0">
          <Select Path="Security">*[System[(EventID=4624 or EventID=4625 or EventID=4720 or EventID=4726 or EventID=1102)]]</Select>
          <Select Path="System">*[System[Level=1 or Level=2]]</Select>
        </Query>
      </QueryList>
    ]]>
  </Query>
  <ReadExistingEvents>false</ReadExistingEvents>
  <TransportName>HTTP</TransportName>
  <ContentFormat>RenderedText</ContentFormat>
  <Locale Language="en-US"/>
  <LogFile>ForwardedEvents</LogFile>
  <AllowedSourceDomainComputers>O:NSG:NSD:(A;;GA;;;DC)(A;;GA;;;NS)</AllowedSourceDomainComputers>
</Subscription>
"@

$xmlPath = "C:\Temp\security-subscription.xml"
$subscriptionXml | Out-File $xmlPath -Encoding UTF8
wecutil cs $xmlPath
```

---

## View Forwarded Events

```powershell
# View events in ForwardedEvents log
Get-WinEvent -LogName "ForwardedEvents" -MaxEvents 20 |
  Select-Object TimeCreated, Id, MachineName, Message | Format-List

# Filter by source machine
Get-WinEvent -LogName "ForwardedEvents" -MaxEvents 100 |
  Where-Object {$_.MachineName -eq "PC01"} |
  Select-Object TimeCreated, Id, Message
```

---

## Manage Subscriptions

```powershell
# List subscriptions
wecutil es

# View subscription details
wecutil gs Security-Events

# Check subscription runtime status
wecutil gr Security-Events

# Delete subscription
wecutil ds Security-Events
```

---

## Group Policy for Source PCs

For domain environments — configure all source PCs via GPO:

`Computer Configuration` → `Administrative Templates` → `Windows Components` → `Event Forwarding`
- **Configure target subscription manager** → Enabled → `Server=http://CollectorPC:5985/wsman/SubscriptionManager/WEC`

`Computer Configuration` → `Administrative Templates` → `Windows Components` → `Windows Remote Management (WinRM)` → `WinRM Service`
- **Allow remote server management through WinRM** → Enabled

---

## Summary

Collector: `winrm quickconfig` + `wecutil qc`. Sources: `winrm quickconfig` + add Network Service to Event Log Readers. Create subscription XML with event filter. View in ForwardedEvents log. Use GPO for domain-wide deployment.

## Frequently Asked Questions

### How many source PCs can one collector handle?

A single collector can typically handle 500-2000 source PCs depending on event volume and hardware. For large environments, use multiple collectors or a dedicated SIEM.

### Events are delayed or missing — why?

Check WinRM connectivity from collector to source. Verify the Event Log Readers group membership. Check subscription status with `wecutil gr SubscriptionName` for error details.

### Is Event Forwarding secure?

Default HTTP is authenticated but unencrypted. For security-sensitive environments, configure HTTPS transport (port 5986) with certificates.

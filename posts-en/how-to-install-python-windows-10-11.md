---
title: "How to Install Python on Windows 10 and 11: Setup, pip and Virtual Environments"
date: "2026-06-10"
publishDate: "2026-08-21"
updated: "2026-06-10"
description: "How to install Python on Windows 10 and 11, fix PATH issues, install pip packages and create virtual environments. VS Code setup for Python. Fix 'python is not recognized' error."
tags: ["windows", "python", "development", "tools", "programming"]
readTime: 8
translatesUk: "vstanovlennya-python-windows-10-11"
---

Python is the most popular programming language for automation, data analysis and web development. Installation on Windows takes 5 minutes, but there are key steps that will save you hours of debugging.

---

## Step 1 — Download Python

1. Go to [python.org/downloads](https://www.python.org/downloads/)
2. Click the large **"Download Python 3.x.x"** button
3. Installer downloads (~25 MB)

---

## Step 2 — Install

1. Run the installer
2. **Important:** check **"Add Python to PATH"** at the bottom
3. Click **"Install Now"**

### Verify installation
```powershell
python --version
# Python 3.12.4

pip --version
# pip 24.0
```

---

## Fix "python is not recognized"

Most common error after installation:

**Solution 1 — add to PATH manually:**
```powershell
$pythonPath = "C:\Users\$env:USERNAME\AppData\Local\Programs\Python\Python312"
$pipPath    = "$pythonPath\Scripts"
[Environment]::SetEnvironmentVariable("PATH",
    $env:PATH + ";$pythonPath;$pipPath", "User")
```

**Solution 2 — reinstall with "Add to PATH" checked**

**Solution 3 — via winget:**
```powershell
winget install Python.Python.3.12
```

---

## pip — Package Manager

```powershell
pip install requests           # install package
pip install requests==2.31.0  # specific version
pip install --upgrade requests # update
pip uninstall requests         # remove
pip list                       # list installed
pip freeze > requirements.txt  # save dependencies
pip install -r requirements.txt # install from file
```

---

## Virtual Environments

Isolated environment per project — prevents version conflicts:

```powershell
python -m venv venv      # create
.\venv\Scripts\activate  # activate (Windows)
pip install flask        # installs only in this venv
deactivate               # deactivate
```

When active, `(venv)` appears before the prompt:
```
(venv) C:\Projects\myapp>
```

---

## VS Code for Python

1. Install VS Code from [code.visualstudio.com](https://code.visualstudio.com)
2. Install Python extension: `Ctrl+Shift+X` → search "Python" → Microsoft
3. Select interpreter: `Ctrl+Shift+P` → "Python: Select Interpreter"

---

## First Python Program

```python
# hello.py
name = input("What's your name? ")
print(f"Hello, {name}!")

numbers = [1, 2, 3, 4, 5]
print(f"Sum: {sum(numbers)}")
print(f"Average: {sum(numbers) / len(numbers)}")
```

```powershell
python hello.py
```

---

## Useful Libraries

```powershell
pip install requests    # HTTP requests
pip install openpyxl    # Excel files
pip install pandas      # data analysis
pip install flask       # web framework
pip install selenium    # browser automation
```

---

## Python + Windows Automation

```python
import os, subprocess, shutil
from pathlib import Path

# List files
for file in Path("C:/Users").iterdir():
    print(file.name)

# Run Windows command
result = subprocess.run(["ipconfig"], capture_output=True, text=True)
print(result.stdout)

# Get environment variables
print(os.environ.get("USERNAME"))
print(os.environ.get("COMPUTERNAME"))
```

---

## Summary

| Step | Action |
|------|--------|
| 1 | python.org → Download Python 3.x |
| 2 | Install with "Add to PATH" checked |
| 3 | Verify: `python --version` |
| 4 | Per project: `python -m venv venv` → activate |
| 5 | Editor: VS Code + Python extension |

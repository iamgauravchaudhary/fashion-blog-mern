# 🔍 StyleVibe Frontend Deployment Verification Script (Windows PowerShell)
# This script verifies all deployment requirements are met

Write-Host "🔍 StyleVibe Frontend Verification Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Initialize counters
$TOTAL = 0
$PASSED = 0

# Function to check status
function Check-Item {
    param(
        [string]$description,
        [scriptblock]$condition
    )
    
    $script:TOTAL += 1
    
    if (& $condition) {
        Write-Host "✅ $description" -ForegroundColor Green
        $script:PASSED += 1
    }
    else {
        Write-Host "❌ $description" -ForegroundColor Red
    }
}

# ==========================================
# 1. ENVIRONMENT FILES
# ==========================================
Write-Host "1. Environment Configuration" -ForegroundColor Yellow
Check-Item ".env file exists" { Test-Path -Path ".env" }
Check-Item ".env.local file exists" { Test-Path -Path ".env.local" }
Check-Item ".env has REACT_APP_API_URL" { (Get-Content .env) -match "REACT_APP_API_URL" }
Check-Item ".env.local has REACT_APP_API_URL" { (Get-Content .env.local) -match "REACT_APP_API_URL" }
Check-Item ".gitignore excludes .env" { (Get-Content .gitignore) -match ".env" }
Write-Host ""

# ==========================================
# 2. SOURCE CODE CONFIGURATION
# ==========================================
Write-Host "2. Source Code Configuration" -ForegroundColor Yellow
Check-Item "api.ts exists" { Test-Path -Path "src/config/api.ts" }
Check-Item "api.ts uses process.env.REACT_APP_API_URL" { (Get-Content src/config/api.ts) -match "process.env.REACT_APP_API_URL" }
Check-Item "api.ts has deployed backend fallback" { (Get-Content src/config/api.ts) -match "fashion-blog-mern-1.onrender.com" }
Check-Item "api.ts has API_ENDPOINTS object" { (Get-Content src/config/api.ts) -match "API_ENDPOINTS" }
Check-Item "api.ts has apiCall function" { (Get-Content src/config/api.ts) -match "export const apiCall" }
Write-Host ""

# ==========================================
# 3. AUTHENTICATION
# ==========================================
Write-Host "3. Authentication Configuration" -ForegroundColor Yellow
Check-Item "AuthPage.tsx uses apiCall" { (Get-Content src/app/pages/AuthPage.tsx) -match "apiCall" }
Check-Item "AuthPage.tsx imports API_ENDPOINTS" { (Get-Content src/app/pages/AuthPage.tsx) -match "API_ENDPOINTS" }
Check-Item "AuthPage.tsx has error handling" { (Get-Content src/app/pages/AuthPage.tsx) -match "setError" }
Check-Item "AuthPage.tsx has loading state" { (Get-Content src/app/pages/AuthPage.tsx) -match "setLoading" }
Write-Host ""

# ==========================================
# 4. COMPONENTS
# ==========================================
Write-Host "4. Component Configuration" -ForegroundColor Yellow
Check-Item "Community.tsx uses apiCall" { (Get-Content src/app/pages/Community.tsx) -match "apiCall" }
Check-Item "AIStylistChat.tsx uses apiCall" { (Get-Content src/app/pages/AIStylistChat.tsx) -match "apiCall" }
Check-Item "OutfitSuggestions.tsx uses API_ENDPOINTS" { (Get-Content src/app/pages/OutfitSuggestions.tsx) -match "API_ENDPOINTS" }
Check-Item "Profile.tsx uses apiCall" { (Get-Content src/app/pages/Profile.tsx) -match "apiCall" }
Write-Host ""

# ==========================================
# 5. NO LOCALHOST REFERENCES
# ==========================================
Write-Host "5. Localhost References Check" -ForegroundColor Yellow

$localhostFiles = Get-ChildItem -Path "src" -Include "*.tsx", "*.ts" -Recurse | 
    Where-Object { (Get-Content $_) -match "localhost" -and $_.Name -notmatch "\.map" }

if ($localhostFiles) {
    Write-Host "❌ Found localhost references in src/" -ForegroundColor Red
    $TOTAL += 1
}
else {
    Write-Host "✅ No localhost references in src/" -ForegroundColor Green
    $PASSED += 1
    $TOTAL += 1
}

$ipFiles = Get-ChildItem -Path "src" -Include "*.tsx", "*.ts" -Recurse | 
    Where-Object { (Get-Content $_) -match "127.0.0.1" -and $_.Name -notmatch "\.map" }

if ($ipFiles) {
    Write-Host "❌ Found 127.0.0.1 references in src/" -ForegroundColor Red
    $TOTAL += 1
}
else {
    Write-Host "✅ No 127.0.0.1 references in src/" -ForegroundColor Green
    $PASSED += 1
    $TOTAL += 1
}
Write-Host ""

# ==========================================
# 6. DEPENDENCIES
# ==========================================
Write-Host "6. Dependencies" -ForegroundColor Yellow
Check-Item "package.json exists" { Test-Path -Path "package.json" }
Check-Item "node_modules installed" { Test-Path -Path "node_modules" -PathType Container }
Check-Item "axios installed" { (Get-Content package.json) -match '"axios"' }
Check-Item "react-router-dom installed" { (Get-Content package.json) -match '"react-router-dom"' }
Write-Host ""

# ==========================================
# 7. BUILD CONFIGURATION
# ==========================================
Write-Host "7. Build Configuration" -ForegroundColor Yellow
Check-Item "vite.config.ts exists" { Test-Path -Path "vite.config.ts" }
Check-Item "vite.config.ts configured" { (Get-Content vite.config.ts) -match "defineConfig" }
Check-Item "package.json has build script" { (Get-Content package.json) -match '"build"' }
Check-Item "package.json has dev script" { (Get-Content package.json) -match '"dev"' }
Write-Host ""

# ==========================================
# 8. DOCUMENTATION
# ==========================================
Write-Host "8. Documentation" -ForegroundColor Yellow
Check-Item "DEPLOYMENT_GUIDE.md exists" { Test-Path -Path "DEPLOYMENT_GUIDE.md" }
Check-Item "TESTING_GUIDE.md exists" { Test-Path -Path "TESTING_GUIDE.md" }
Check-Item "PRE_DEPLOYMENT_CHECKLIST.md exists" { Test-Path -Path "PRE_DEPLOYMENT_CHECKLIST.md" }
Check-Item "COMPLETION_SUMMARY.md exists" { Test-Path -Path "COMPLETION_SUMMARY.md" }
Check-Item "README.md updated" { (Get-Content README.md) -match "StyleVibe" }
Write-Host ""

# ==========================================
# SUMMARY
# ==========================================
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Verification Summary" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
$PERCENTAGE = [math]::Round(($PASSED / $TOTAL) * 100)
Write-Host "Passed: $PASSED / $TOTAL ($PERCENTAGE%)"
Write-Host ""

if ($PASSED -eq $TOTAL) {
    Write-Host "✅ ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host "Application is ready for deployment."
}
else {
    Write-Host "⚠️  Some checks failed." -ForegroundColor Yellow
    Write-Host "Please review the failures above."
}

Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "  - Deployment: ./DEPLOYMENT_GUIDE.md"
Write-Host "  - Testing: ./TESTING_GUIDE.md"
Write-Host "  - Checklist: ./PRE_DEPLOYMENT_CHECKLIST.md"
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Run full test suite: npm run dev"
Write-Host "  2. Test all features with deployed backend"
Write-Host "  3. Build: npm run build"
Write-Host "  4. Deploy to hosting provider"
Write-Host ""

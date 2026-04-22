#!/bin/bash

# 🔍 StyleVibe Frontend Deployment Verification Script
# This script verifies all deployment requirements are met

echo "🔍 StyleVibe Frontend Verification Script"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Initialize counter
TOTAL=0
PASSED=0

# Function to check status
check_item() {
  local description=$1
  local command=$2
  TOTAL=$((TOTAL + 1))
  
  if eval "$command" > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} $description"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}❌${NC} $description"
  fi
}

# ==========================================
# 1. ENVIRONMENT FILES
# ==========================================
echo -e "${YELLOW}1. Environment Configuration${NC}"
check_item ".env file exists" "test -f .env"
check_item ".env.local file exists" "test -f .env.local"
check_item ".env has REACT_APP_API_URL" "grep -q 'REACT_APP_API_URL' .env"
check_item ".env.local has REACT_APP_API_URL" "grep -q 'REACT_APP_API_URL' .env.local"
check_item ".gitignore excludes .env" "grep -q '.env' .gitignore"
echo ""

# ==========================================
# 2. SOURCE CODE CONFIGURATION
# ==========================================
echo -e "${YELLOW}2. Source Code Configuration${NC}"
check_item "api.ts exists" "test -f src/config/api.ts"
check_item "api.ts uses process.env.REACT_APP_API_URL" "grep -q 'process.env.REACT_APP_API_URL' src/config/api.ts"
check_item "api.ts has deployed backend fallback" "grep -q 'fashion-blog-mern-1.onrender.com' src/config/api.ts"
check_item "api.ts has API_ENDPOINTS object" "grep -q 'API_ENDPOINTS' src/config/api.ts"
check_item "api.ts has apiCall function" "grep -q 'export const apiCall' src/config/api.ts"
echo ""

# ==========================================
# 3. AUTHENTICATION
# ==========================================
echo -e "${YELLOW}3. Authentication Configuration${NC}"
check_item "AuthPage.tsx uses apiCall" "grep -q 'apiCall' src/app/pages/AuthPage.tsx"
check_item "AuthPage.tsx imports API_ENDPOINTS" "grep -q 'API_ENDPOINTS' src/app/pages/AuthPage.tsx"
check_item "AuthPage.tsx has error handling" "grep -q 'setError' src/app/pages/AuthPage.tsx"
check_item "AuthPage.tsx has loading state" "grep -q 'setLoading' src/app/pages/AuthPage.tsx"
echo ""

# ==========================================
# 4. COMPONENTS
# ==========================================
echo -e "${YELLOW}4. Component Configuration${NC}"
check_item "Community.tsx uses apiCall" "grep -q 'apiCall' src/app/pages/Community.tsx"
check_item "AIStylistChat.tsx uses apiCall" "grep -q 'apiCall' src/app/pages/AIStylistChat.tsx"
check_item "OutfitSuggestions.tsx uses API_ENDPOINTS" "grep -q 'API_ENDPOINTS' src/app/pages/OutfitSuggestions.tsx"
check_item "Profile.tsx uses apiCall" "grep -q 'apiCall' src/app/pages/Profile.tsx"
echo ""

# ==========================================
# 5. NO LOCALHOST REFERENCES
# ==========================================
echo -e "${YELLOW}5. Localhost References Check${NC}"

# Check for localhost in src files
if grep -r "localhost" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "\.map" | grep -v "node_modules" > /dev/null; then
  echo -e "${RED}❌${NC} Found localhost references in src/"
  TOTAL=$((TOTAL + 1))
else
  echo -e "${GREEN}✅${NC} No localhost references in src/"
  PASSED=$((PASSED + 1))
  TOTAL=$((TOTAL + 1))
fi

# Check for 127.0.0.1
if grep -r "127.0.0.1" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "\.map" > /dev/null; then
  echo -e "${RED}❌${NC} Found 127.0.0.1 references in src/"
  TOTAL=$((TOTAL + 1))
else
  echo -e "${GREEN}✅${NC} No 127.0.0.1 references in src/"
  PASSED=$((PASSED + 1))
  TOTAL=$((TOTAL + 1))
fi
echo ""

# ==========================================
# 6. DEPENDENCIES
# ==========================================
echo -e "${YELLOW}6. Dependencies${NC}"
check_item "package.json exists" "test -f package.json"
check_item "node_modules installed" "test -d node_modules"
check_item "axios installed" "grep -q '\"axios\"' package.json"
check_item "react-router-dom installed" "grep -q '\"react-router-dom\"' package.json"
echo ""

# ==========================================
# 7. BUILD CONFIGURATION
# ==========================================
echo -e "${YELLOW}7. Build Configuration${NC}"
check_item "vite.config.ts exists" "test -f vite.config.ts"
check_item "vite.config.ts configured" "grep -q 'defineConfig' vite.config.ts"
check_item "package.json has build script" "grep -q '\"build\"' package.json"
check_item "package.json has dev script" "grep -q '\"dev\"' package.json"
echo ""

# ==========================================
# 8. DOCUMENTATION
# ==========================================
echo -e "${YELLOW}8. Documentation${NC}"
check_item "DEPLOYMENT_GUIDE.md exists" "test -f DEPLOYMENT_GUIDE.md"
check_item "TESTING_GUIDE.md exists" "test -f TESTING_GUIDE.md"
check_item "PRE_DEPLOYMENT_CHECKLIST.md exists" "test -f PRE_DEPLOYMENT_CHECKLIST.md"
check_item "COMPLETION_SUMMARY.md exists" "test -f COMPLETION_SUMMARY.md"
check_item "README.md updated" "grep -q 'StyleVibe' README.md"
echo ""

# ==========================================
# SUMMARY
# ==========================================
echo "=========================================="
echo -e "${YELLOW}Verification Summary${NC}"
echo "=========================================="
PERCENTAGE=$((PASSED * 100 / TOTAL))
echo "Passed: $PASSED / $TOTAL ($PERCENTAGE%)"
echo ""

if [ $PASSED -eq $TOTAL ]; then
  echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
  echo "Application is ready for deployment."
else
  echo -e "${YELLOW}⚠️  Some checks failed.${NC}"
  echo "Please review the failures above."
fi

echo ""
echo "📚 Documentation:"
echo "  - Deployment: ./DEPLOYMENT_GUIDE.md"
echo "  - Testing: ./TESTING_GUIDE.md"
echo "  - Checklist: ./PRE_DEPLOYMENT_CHECKLIST.md"
echo ""
echo "🚀 Next Steps:"
echo "  1. Run full test suite: npm run dev"
echo "  2. Test all features with deployed backend"
echo "  3. Build: npm run build"
echo "  4. Deploy to hosting provider"
echo ""

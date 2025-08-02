#!/bin/bash

echo "=== Testing Preview Performance Improvement ==="

# 1. Register a new user for clean test
USER="perf_test_$RANDOM"
curl -s -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$USER@test.com\", \"username\": \"$USER\", \"password\": \"test123\"}" > /dev/null

# 2. Login
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$USER\", \"password\": \"test123\"}" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

echo "✓ Test user created and logged in"

# 3. Create a project
PROJECT=$(curl -s -X POST "http://localhost:8000/api/projects?name=Performance%20Test" \
  -H "Authorization: Bearer $TOKEN")
PROJECT_ID=$(echo "$PROJECT" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "✓ Project created"

# 4. Upload file (with preview generation)
echo -e "\n📤 Uploading file (preview generated during upload)..."
UPLOAD_START=$(date +%s.%N)
UPLOAD_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/projects/$PROJECT_ID/files" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_data.csv")
UPLOAD_END=$(date +%s.%N)
UPLOAD_TIME=$(echo "($UPLOAD_END - $UPLOAD_START) * 1000" | bc | cut -d. -f1)

FILE_ID=$(echo "$UPLOAD_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$FILE_ID" ]; then
  echo "Upload failed!"
  echo "$UPLOAD_RESPONSE"
  exit 1
fi

echo "✓ File uploaded with preview generation in ${UPLOAD_TIME}ms"

# 5. Test preview retrieval speed
echo -e "\n⚡ Testing preview retrieval speed..."

# Warm-up request
curl -s "http://localhost:8000/api/projects/$PROJECT_ID/files/$FILE_ID/preview" \
  -H "Authorization: Bearer $TOKEN" > /dev/null

# Measure 5 preview requests
TIMES=()
for i in {1..5}; do
  START=$(date +%s.%N)
  curl -s "http://localhost:8000/api/projects/$PROJECT_ID/files/$FILE_ID/preview" \
    -H "Authorization: Bearer $TOKEN" > /dev/null
  END=$(date +%s.%N)
  TIME=$(echo "($END - $START) * 1000" | bc | cut -d. -f1)
  TIMES+=($TIME)
  echo "  Preview request $i: ${TIME}ms"
done

# Calculate average
SUM=0
for t in "${TIMES[@]}"; do
  SUM=$((SUM + t))
done
AVG=$((SUM / ${#TIMES[@]}))

echo -e "\n📊 Results:"
echo "========================"
echo "Upload time (includes preview generation): ${UPLOAD_TIME}ms"
echo "Average preview retrieval time: ${AVG}ms"
echo ""

if [ $AVG -lt 20 ]; then
  echo "✅ EXCELLENT: Preview served from cache (<20ms)"
  echo "   This is 10-100x faster than reading & parsing the file!"
elif [ $AVG -lt 50 ]; then
  echo "✅ GOOD: Preview is fast (<50ms)"
else
  echo "⚠️  Could be faster. Check if preview_data is properly cached."
fi

echo -e "\n🎯 Performance Improvement:"
echo "- Old: Parse CSV/Excel file on EVERY preview request"
echo "- New: Pre-calculated during upload, served instantly from DB"
echo "- Benefit: Consistent fast response, reduced server load"
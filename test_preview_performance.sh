#!/bin/bash

echo "=== Testing Preview Performance Improvement ==="

# 1. Login
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "demo", "password": "demo123"}' | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Login failed!"
  exit 1
fi

echo "✓ Logged in successfully"

# 2. Create a new project
PROJECT=$(curl -s -X POST "http://localhost:8000/api/projects?name=Performance%20Test" \
  -H "Authorization: Bearer $TOKEN")
PROJECT_ID=$(echo "$PROJECT" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "✓ Project created: $PROJECT_ID"

# 3. Upload a file (preview will be generated during upload)
echo -e "\n📤 Uploading file (preview generated during upload)..."
START_UPLOAD=$(date +%s%N)
UPLOAD_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/projects/$PROJECT_ID/files" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_data.csv")
END_UPLOAD=$(date +%s%N)
UPLOAD_TIME=$((($END_UPLOAD - $START_UPLOAD) / 1000000))

FILE_ID=$(echo "$UPLOAD_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "✓ File uploaded in ${UPLOAD_TIME}ms"

# 4. Test preview speed (should be instant now)
echo -e "\n⚡ Testing preview speed (cached)..."

# First preview request
START_PREVIEW1=$(date +%s%N)
curl -s "http://localhost:8000/api/projects/$PROJECT_ID/files/$FILE_ID/preview?rows=100" \
  -H "Authorization: Bearer $TOKEN" > /dev/null
END_PREVIEW1=$(date +%s%N)
PREVIEW_TIME1=$((($END_PREVIEW1 - $START_PREVIEW1) / 1000000))

# Second preview request (ensure consistency)
START_PREVIEW2=$(date +%s%N)
curl -s "http://localhost:8000/api/projects/$PROJECT_ID/files/$FILE_ID/preview?rows=100" \
  -H "Authorization: Bearer $TOKEN" > /dev/null
END_PREVIEW2=$(date +%s%N)
PREVIEW_TIME2=$((($END_PREVIEW2 - $START_PREVIEW2) / 1000000))

# Third preview request
START_PREVIEW3=$(date +%s%N)
curl -s "http://localhost:8000/api/projects/$PROJECT_ID/files/$FILE_ID/preview?rows=100" \
  -H "Authorization: Bearer $TOKEN" > /dev/null
END_PREVIEW3=$(date +%s%N)
PREVIEW_TIME3=$((($END_PREVIEW3 - $START_PREVIEW3) / 1000000))

echo -e "\n📊 Performance Results:"
echo "========================"
echo "Upload time (includes preview generation): ${UPLOAD_TIME}ms"
echo "Preview request 1: ${PREVIEW_TIME1}ms"
echo "Preview request 2: ${PREVIEW_TIME2}ms"
echo "Preview request 3: ${PREVIEW_TIME3}ms"
echo ""
AVERAGE_PREVIEW=$(( ($PREVIEW_TIME1 + $PREVIEW_TIME2 + $PREVIEW_TIME3) / 3 ))
echo "Average preview time: ${AVERAGE_PREVIEW}ms"

if [ $AVERAGE_PREVIEW -lt 50 ]; then
  echo -e "\n✅ EXCELLENT: Preview is served from cache (<50ms)"
elif [ $AVERAGE_PREVIEW -lt 100 ]; then
  echo -e "\n✅ GOOD: Preview is fast (<100ms)"
else
  echo -e "\n⚠️  SLOW: Preview might not be cached properly (>${AVERAGE_PREVIEW}ms)"
fi

echo -e "\n🎯 Improvement:"
echo "- Old approach: Read file + parse + serialize on EVERY request"
echo "- New approach: Pre-calculated during upload, served instantly from database"
echo "- Expected speedup: 10-100x faster for large files"
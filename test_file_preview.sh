#!/bin/bash

echo "=== Testing File Preview Fix ==="

# 1. Login
echo "1. Logging in..."
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "demo", "password": "demo123"}' | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Login failed!"
  exit 1
fi

echo "✓ Logged in successfully"

# 2. Create a new project for testing
echo -e "\n2. Creating test project..."
PROJECT=$(curl -s -X POST "http://localhost:8000/api/projects?name=Preview%20Test%20Project" \
  -H "Authorization: Bearer $TOKEN")
PROJECT_ID=$(echo "$PROJECT" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "✓ Project created: $PROJECT_ID"

# 3. Upload test CSV file
echo -e "\n3. Uploading test CSV file..."
UPLOAD_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/projects/$PROJECT_ID/files" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_data.csv")

FILE_ID=$(echo "$UPLOAD_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$FILE_ID" ]; then
  echo "✗ Upload failed!"
  echo "Response: $UPLOAD_RESPONSE"
  exit 1
fi

echo "✓ File uploaded: $FILE_ID"

# 4. Test file preview
echo -e "\n4. Testing file preview..."
PREVIEW=$(curl -s "http://localhost:8000/api/projects/$PROJECT_ID/files/$FILE_ID/preview?rows=5" \
  -H "Authorization: Bearer $TOKEN")

if echo "$PREVIEW" | grep -q "columns"; then
  echo "✓ Preview successful!"
  echo -e "\nPreview data:"
  echo "$PREVIEW" | python3 -m json.tool | head -30
  
  # Check for NaN handling
  if echo "$PREVIEW" | grep -q "NaN"; then
    echo -e "\n⚠️  Warning: NaN values still present in preview"
  else
    echo -e "\n✓ NaN values properly handled"
  fi
else
  echo "✗ Preview failed!"
  echo "Response: $PREVIEW"
fi

echo -e "\n=== Test Complete ==="
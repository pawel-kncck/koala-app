# Setting up Google Gemini for Koala App

Koala uses Google Gemini as its primary LLM provider for natural language data analysis. Follow these steps to set up Gemini API access.

## Step 1: Get a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Select a project or create a new one
5. Copy the generated API key

## Step 2: Configure the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your-actual-gemini-api-key-here
   ```

## Step 3: Install Dependencies

If you haven't already, set up the Python virtual environment and install dependencies:

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Step 4: Start the Backend

```bash
uvicorn main:app --reload --port 8000
```

## Step 5: Verify Gemini is Working

The backend will log which LLM provider is being used on startup. You should see:
```
INFO: Using gemini as LLM provider
INFO: LLM service initialized with Gemini model: gemini-1.5-flash
```

## Available Gemini Models

By default, Koala uses `gemini-1.5-flash` which is fast and cost-effective. You can change this by setting the `GEMINI_MODEL` environment variable in your `.env` file:

- `gemini-1.5-flash` - Fast, efficient model (default)
- `gemini-1.5-pro` - More capable model for complex tasks
- `gemini-1.0-pro` - Previous generation model

Example:
```env
GEMINI_MODEL=gemini-1.5-pro
```

## Fallback to OpenAI

If Gemini is not configured or unavailable, Koala will automatically fall back to OpenAI if an `OPENAI_API_KEY` is provided:

```env
# Fallback configuration
OPENAI_API_KEY=your-openai-api-key-here
```

## Troubleshooting

### "No LLM provider available"
- Ensure your API key is correctly set in the `.env` file
- Check that the `.env` file is in the `backend` directory
- Verify the API key is valid by testing it in [Google AI Studio](https://makersuite.google.com/)

### Rate Limiting
- Gemini has generous free tier limits
- If you hit rate limits, consider upgrading to a paid plan or using the fallback OpenAI provider

### Model Errors
- Ensure you're using a valid model name
- Check the [Gemini documentation](https://ai.google.dev/models/gemini) for the latest available models

## API Key Security

- Never commit your `.env` file to version control
- The `.gitignore` file is already configured to exclude `.env`
- For production, use environment variables or a secrets management service

## Cost Considerations

- Gemini offers a free tier with generous limits
- `gemini-1.5-flash` is the most cost-effective option
- Monitor your usage in the [Google Cloud Console](https://console.cloud.google.com/)

## Additional Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/)
- [Gemini Pricing](https://ai.google.dev/pricing)
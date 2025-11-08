# Limitless Exchange SDK - Examples

This directory contains example scripts demonstrating how to use the Limitless Exchange SDK.

## Prerequisites

Before running these examples, make sure you have:

1. Installed the SDK:
   ```bash
   npm install limitless-exchange-sdk
   ```

2. (Optional) Set up your API key as an environment variable:
   ```bash
   export LIMITLESS_API_KEY=your-api-key-here
   ```

## Available Examples

### 1. Basic Usage (`basic-usage.js`)

Demonstrates the fundamental SDK operations:
- Configuring the SDK
- Listing active markets
- Getting market details
- Retrieving user statistics

**Run the example:**
```bash
node examples/basic-usage.js
```

**What it does:**
- Fetches all active markets from the Limitless Exchange
- Displays the first market's information
- Shows how to get detailed information about a specific market
- Includes commented code for fetching user statistics

### 2. Endpoint Override (`endpoint-override.js`)

Shows how to customize API endpoints when the API structure changes:
- Overriding specific endpoints
- Configuring timeout settings
- Adapting to API changes without modifying SDK code

**Run the example:**
```bash
node examples/endpoint-override.js
```

**What it does:**
- Demonstrates the endpoint override configuration
- Tests the configuration by making API calls
- Provides guidance on how to adapt to API changes

**When to use endpoint overrides:**
- The API endpoint structure changes
- You need to use a different API version
- You're testing against a staging environment
- You need to work around temporary API issues

## Running Examples with Local SDK

If you're developing the SDK locally and want to test the examples:

1. Build the SDK:
   ```bash
   npm run build
   ```

2. Link the SDK locally:
   ```bash
   npm link
   ```

3. In the examples directory, link to your local SDK:
   ```bash
   cd examples
   npm link limitless-exchange-sdk
   ```

4. Run the examples:
   ```bash
   node basic-usage.js
   node endpoint-override.js
   ```

## Environment Variables

The examples support the following environment variables:

- `LIMITLESS_API_KEY` - Your API key for authentication (optional)
- `LIMITLESS_API_URL` - Override the default API base URL (optional)

You can create a `.env` file in the examples directory:

```env
LIMITLESS_API_KEY=your-api-key-here
LIMITLESS_API_URL=https://api.limitless.exchange
```

## Troubleshooting

### "Module not found" error

Make sure you've installed the SDK:
```bash
npm install limitless-exchange-sdk
```

### API connection errors

1. Check that the API URL is correct
2. Verify your network connection
3. Ensure the API is accessible from your location
4. Check if an API key is required

### Configuration errors

If you see configuration errors:
1. Verify the base URL format (must be a valid URL)
2. Check that custom endpoint paths start with `/`
3. Ensure endpoint path parameters use the `:param` format

## Additional Resources

- [SDK Documentation](../README.md)
- [API Documentation](https://docs.limitless.exchange) (if available)
- [GitHub Repository](https://github.com/yourusername/limitless-exchange-sdk)

## Contributing

Found an issue with the examples or have a suggestion? Please open an issue or submit a pull request!

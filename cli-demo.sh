#!/bin/bash

# CLI Demo Script for Limitless Exchange SDK
# Demonstrates all CLI functionality

echo "🚀 Limitless Exchange SDK CLI Demo"
echo "=================================="

# Set demo environment variables
export LIMITLESS_API_URL="https://api.limitless.exchange"
export LIMITLESS_API_KEY="demo-key"

echo ""
echo "📋 Available CLI Commands:"
echo "1. List markets"
echo "2. Get market details"
echo "3. Place a bet"
echo "4. Get user statistics"
echo ""

# Build the project first
echo "🔨 Building SDK..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix build errors first."
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""

# Test CLI help
echo "📖 CLI Help:"
echo "============"
node dist/cli.js --help

echo ""
echo "📊 Testing Markets Command:"
echo "=========================="
echo "Command: node dist/cli.js markets"
node dist/cli.js markets

echo ""
echo "📈 Testing Market Details Command:"
echo "================================="
echo "Command: node dist/cli.js market 1"
node dist/cli.js market 1

echo ""
echo "💰 Testing Bet Command (will show validation):"
echo "=============================================="
echo "Command: node dist/cli.js bet --market 1 --outcome YES --amount 10"
node dist/cli.js bet --market 1 --outcome YES --amount 10

echo ""
echo "👤 Testing User Stats Command:"
echo "============================="
echo "Command: node dist/cli.js user 0x742d35Cc6634C0532925a3b8D4C9db96590e4265"
node dist/cli.js user 0x742d35Cc6634C0532925a3b8D4C9db96590e4265

echo ""
echo "🎯 Testing JSON Output:"
echo "======================"
echo "Command: node dist/cli.js markets --json"
node dist/cli.js markets --json

echo ""
echo "❌ Testing Error Handling:"
echo "========================="
echo "Command: node dist/cli.js market invalid-id"
node dist/cli.js market invalid-id

echo ""
echo "Command: node dist/cli.js user invalid-address"
node dist/cli.js user invalid-address

echo ""
echo "🎉 CLI Demo completed!"
echo "====================="
echo ""
echo "Available commands:"
echo "- limitless-ex markets                    # List all markets"
echo "- limitless-ex market <id>               # Get market details"
echo "- limitless-ex bet --market <id> --outcome <YES|NO> --amount <number>"
echo "- limitless-ex user <address>            # Get user statistics"
echo "- Add --json flag for JSON output"
echo "- Add --api-url <url> to override API URL"
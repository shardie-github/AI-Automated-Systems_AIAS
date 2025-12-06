#!/bin/bash

# Setup script for git-crypt
# Run this to initialize git-crypt for protecting financial data

set -e

echo "🔐 Setting up git-crypt for financial data protection..."

# Check if git-crypt is installed
if ! command -v git-crypt &> /dev/null; then
    echo "❌ git-crypt is not installed."
    echo "Install it with:"
    echo "  macOS: brew install git-crypt"
    echo "  Linux: sudo apt-get install git-crypt"
    echo "  Or visit: https://www.agwa.name/projects/git-crypt/"
    exit 1
fi

# Check if already initialized
if [ -f .git-crypt/keys/default ]; then
    echo "⚠️  git-crypt is already initialized."
    read -p "Do you want to reinitialize? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping initialization."
        exit 0
    fi
fi

# Initialize git-crypt
echo "📦 Initializing git-crypt..."
git-crypt init

# Add GPG user (if GPG is available)
if command -v gpg &> /dev/null; then
    echo "🔑 Adding GPG user..."
    read -p "Enter your GPG key email: " gpg_email
    if [ ! -z "$gpg_email" ]; then
        git-crypt add-gpg-user "$gpg_email"
        echo "✅ Added GPG user: $gpg_email"
    else
        echo "⚠️  No GPG email provided. You can add GPG users later with:"
        echo "   git-crypt add-gpg-user YOUR_EMAIL"
    fi
else
    echo "⚠️  GPG is not installed. You can add GPG users later with:"
    echo "   git-crypt add-gpg-user YOUR_EMAIL"
fi

# Verify .gitattributes is in place
if [ -f .gitattributes ]; then
    echo "✅ .gitattributes file found"
else
    echo "⚠️  .gitattributes file not found. Creating it..."
    cat > .gitattributes << 'EOF'
# Git Attributes for git-crypt
internal/private/financial/** filter=git-crypt diff=git-crypt
internal/private/financial/** !filter !diff
*.financial filter=git-crypt diff=git-crypt
*.accounting filter=git-crypt diff=git-crypt
EOF
    echo "✅ Created .gitattributes"
fi

echo ""
echo "✅ git-crypt setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Add financial data to: internal/private/financial/"
echo "   2. Files will be automatically encrypted on commit"
echo "   3. To unlock (view): git-crypt unlock"
echo "   4. To lock (after viewing): git-crypt lock"
echo ""
echo "🔒 Protected directories:"
echo "   - internal/private/financial/"
echo "   - internal/private/financial/aias/"
echo ""

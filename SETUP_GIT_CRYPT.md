# Git-crypt Setup Instructions

This repository uses **git-crypt** to encrypt sensitive investor relations documents in the `/INVESTOR-RELATIONS-PRIVATE` directory.

## Prerequisites

1. **Install git-crypt:**
   ```bash
   # macOS
   brew install git-crypt
   
   # Ubuntu/Debian
   sudo apt-get install git-crypt
   
   # Or build from source: https://www.agwa.name/projects/git-crypt/
   ```

2. **Set up GPG (if not already installed):**
   ```bash
   # Check if GPG is installed
   gpg --version
   
   # Generate a GPG key if needed
   gpg --full-generate-key
   ```

## Initial Setup (Repository Owner)

1. **Initialize git-crypt in the repository:**
   ```bash
   git crypt init
   ```

2. **Add yourself as a GPG user:**
   ```bash
   git crypt add-gpg-user your_email@example.com
   ```

3. **Commit the .gitattributes file (if not already committed):**
   ```bash
   git add .gitattributes
   git commit -m "feat(security): Configure git-crypt for private investor assets"
   ```

4. **Add files to the encrypted directory:**
   ```bash
   # Move sensitive files into INVESTOR-RELATIONS-PRIVATE/
   git add INVESTOR-RELATIONS-PRIVATE/
   git commit -m "docs(ir): Add encrypted internal business documents"
   ```

## Adding Collaborators

To grant access to other team members:

1. **Get their GPG public key:**
   ```bash
   # They should export their public key:
   gpg --armor --export their_email@example.com > their_key.gpg
   ```

2. **Add them as a GPG user:**
   ```bash
   git crypt add-gpg-user their_email@example.com
   ```

3. **Commit the updated keyring:**
   ```bash
   git add .git-crypt/
   git commit -m "feat(security): Add collaborator access to encrypted files"
   git push
   ```

## Unlocking Encrypted Files

After cloning the repository or pulling updates:

```bash
# Unlock encrypted files (requires your GPG key)
git crypt unlock
```

If you don't have access, you'll see encrypted files in the `INVESTOR-RELATIONS-PRIVATE` directory. Contact the repository owner to be added as a GPG user.

## Verifying Encryption

To verify that files are encrypted:

```bash
# Check git-crypt status
git crypt status

# Files marked with "encrypted" are protected
```

## Troubleshooting

- **"git-crypt: not found"**: Install git-crypt using the instructions above
- **"gpg: no valid OpenPGP data found"**: Ensure your GPG key is properly set up
- **Files appear encrypted**: Run `git crypt unlock` with your GPG key

## Security Notes

- Never commit unencrypted sensitive files
- Always verify `.gitattributes` includes the encryption rules
- Rotate keys periodically for enhanced security
- Keep GPG private keys secure and backed up

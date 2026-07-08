#!/bin/bash

# Configuration
EXTERNAL_TOOLS_DIR="/Users/justinmafie/clinic-ai/external_tools"
GEMINI_SKILLS_DIR="/Users/justinmafie/.gemini/config/skills"

# List of repositories
REPOS=(
    "https://github.com/bruzethegreat/gsap-master-mcp-server.git"
    "https://github.com/greensock/GSAP.git"
    "https://github.com/nexu-io/open-design.git"
    "https://github.com/garrytan/gstack.git"
    "https://github.com/obra/superpowers.git"
    "https://github.com/motiondivision/motion-vue.git"
    "https://github.com/motiondivision/motion.git"
    "https://github.com/JuliusBrussee/caveman.git"
    "https://github.com/sickn33/antigravity-awesome-skills.git"
    "https://github.com/affaan-m/ECC.git"
    "https://github.com/pheralb/svgl.git"
    "https://github.com/VoltAgent/awesome-design-md.git"
    "https://github.com/ruvnet/ruflo.git"
    "https://github.com/Anil-matcha/Open-Generative-AI.git"
    "https://github.com/rtk-ai/rtk.git"
    "https://github.com/mattpocock/skills.git"
    "https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git"
    "https://github.com/21st-dev/magic-mcp.git"
    "https://github.com/juliangarnier/anime.git"
    "https://github.com/fusionjs/fusionjs.git"
    "https://github.com/VoltAgent/awesome-claude-code-subagents.git"
    "https://github.com/getagentseal/codeburn.git"
    "https://github.com/GLips/Figma-Context-MCP.git"
    "https://github.com/ComposioHQ/awesome-claude-skills.git"
    "https://github.com/yanqinJiang/Animate3D.git"
    "https://github.com/shadcn-ui/ui.git"
    "https://github.com/RevenueCat/cat-paywall-swiftui.git"
    "https://github.com/i18next/react-i18next.git"
)

# Ensure directories exist
mkdir -p "$EXTERNAL_TOOLS_DIR"
mkdir -p "$GEMINI_SKILLS_DIR"

cd "$EXTERNAL_TOOLS_DIR" || exit 1

for REPO in "${REPOS[@]}"; do
    # Extract the repository name from the URL
    REPO_NAME=$(basename "$REPO" .git)
    
    echo "Processing $REPO_NAME..."
    
    if [ -d "$REPO_NAME" ]; then
        echo "Updating existing repository: $REPO_NAME"
        cd "$REPO_NAME" || continue
        git pull
        cd ..
    else
        echo "Cloning new repository: $REPO_NAME"
        git clone "$REPO"
    fi

    # Create a symlink in the Gemini skills directory
    LINK_PATH="$GEMINI_SKILLS_DIR/$REPO_NAME"
    if [ ! -e "$LINK_PATH" ]; then
        echo "Creating symlink for $REPO_NAME..."
        ln -s "$EXTERNAL_TOOLS_DIR/$REPO_NAME" "$LINK_PATH"
    else
        echo "Symlink for $REPO_NAME already exists."
    fi
done

echo "Running npx commands..."
# Run the requested npx command
npx -y skills add higgsfield-ai/skills

echo "All tasks completed!"

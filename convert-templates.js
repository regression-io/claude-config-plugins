#!/usr/bin/env node
/**
 * Convert claude-config templates to plugins
 */

const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = '/Users/ruze/reg/my/claude-config/templates';
const PLUGINS_DIR = '/Users/ruze/reg/my/claude-config-plugins/plugins';

// Template to plugin name mapping
const TEMPLATE_MAPPING = {
  'universal': 'coding-standards',
  'languages/python': 'python-support',
  'languages/javascript': 'javascript-support',
  'languages/typescript': 'typescript-support',
  'frameworks/fastapi': 'fastapi-support',
  'frameworks/react-js': 'react-js-support',
  'frameworks/react-ts': 'react-ts-support',
  'frameworks/python-cli': 'python-cli-support',
  'frameworks/mcp-python': 'mcp-python-support',
  'composites/fastapi-react-js': 'fullstack-fastapi-react',
  'composites/fastapi-react-ts': 'fullstack-fastapi-react-ts',
};

// Plugin descriptions
const PLUGIN_DESCRIPTIONS = {
  'coding-standards': 'Universal best practices for all projects - code quality, testing, documentation, security, error handling, API design, and git workflow',
  'python-support': 'Python language best practices - style guides, dependency management, and common patterns',
  'javascript-support': 'JavaScript language best practices - style guides and common patterns',
  'typescript-support': 'TypeScript language best practices - configuration, style guides, and type patterns',
  'fastapi-support': 'FastAPI REST API framework guidance - includes Python best practices and API patterns',
  'react-js-support': 'React with JavaScript framework guidance - components, hooks, and best practices',
  'react-ts-support': 'React with TypeScript framework guidance - type-safe components, hooks, and best practices',
  'python-cli-support': 'Python CLI application guidance - argument parsing, user interaction, and CLI patterns',
  'mcp-python-support': 'MCP Server development in Python - protocol implementation and best practices',
  'fullstack-fastapi-react': 'Full-stack monorepo guidance for FastAPI backend + React frontend projects',
  'fullstack-fastapi-react-ts': 'Full-stack monorepo guidance for FastAPI backend + React TypeScript frontend projects',
};

/**
 * Convert a rule file to a skill with frontmatter
 */
function convertRuleToSkill(rulePath, skillName) {
  const content = fs.readFileSync(rulePath, 'utf8');

  // Extract first heading as description
  const headingMatch = content.match(/^#\s+(.+)$/m);
  const description = headingMatch
    ? headingMatch[1].replace(/Rules?$/i, '').trim() + ' guidance'
    : `${skillName} guidance`;

  // Add frontmatter
  const skillContent = `---
name: ${skillName}
description: ${description}
---

${content}`;

  return skillContent;
}

/**
 * Convert a template to a plugin
 */
function convertTemplate(templatePath, pluginName) {
  const pluginDir = path.join(PLUGINS_DIR, pluginName);
  const pluginMetaDir = path.join(pluginDir, '.claude-plugin');
  const skillsDir = path.join(pluginDir, 'skills');
  const commandsDir = path.join(pluginDir, 'commands');

  // Create directories
  fs.mkdirSync(pluginMetaDir, { recursive: true });

  // Read template.json
  const templateJsonPath = path.join(templatePath, 'template.json');
  let templateJson = { name: pluginName, description: '', includes: [] };
  if (fs.existsSync(templateJsonPath)) {
    templateJson = JSON.parse(fs.readFileSync(templateJsonPath, 'utf8'));
  }

  // Create plugin.json
  const pluginJson = {
    name: pluginName,
    description: PLUGIN_DESCRIPTIONS[pluginName] || templateJson.description,
    version: '1.0.0',
    author: {
      name: 'regression-io',
      email: 'ruze@regression.io'
    },
    homepage: 'https://github.com/regression-io/claude-config-plugins',
    keywords: ['claude-config', pluginName.replace(/-/g, ' ')]
  };

  fs.writeFileSync(
    path.join(pluginMetaDir, 'plugin.json'),
    JSON.stringify(pluginJson, null, 2)
  );

  // Convert rules to skills
  const rulesDir = path.join(templatePath, 'rules');
  if (fs.existsSync(rulesDir)) {
    const rules = fs.readdirSync(rulesDir).filter(f => f.endsWith('.md'));

    for (const rule of rules) {
      const skillName = rule.replace('.md', '');
      const skillDir = path.join(skillsDir, skillName);
      fs.mkdirSync(skillDir, { recursive: true });

      const rulePath = path.join(rulesDir, rule);
      const skillContent = convertRuleToSkill(rulePath, skillName);

      fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skillContent);
    }

    console.log(`  ✓ Converted ${rules.length} rules to skills`);
  }

  // Copy commands
  const templateCommandsDir = path.join(templatePath, 'commands');
  if (fs.existsSync(templateCommandsDir)) {
    fs.mkdirSync(commandsDir, { recursive: true });

    const commands = fs.readdirSync(templateCommandsDir).filter(f => f.endsWith('.md'));

    for (const command of commands) {
      const srcPath = path.join(templateCommandsDir, command);
      const destPath = path.join(commandsDir, command);
      fs.copyFileSync(srcPath, destPath);
    }

    console.log(`  ✓ Copied ${commands.length} commands`);
  }

  // Handle includes by adding included content as additional skills
  if (templateJson.includes && templateJson.includes.length > 0) {
    console.log(`  ℹ Includes: ${templateJson.includes.join(', ')}`);

    // For frameworks that include languages, we flatten the content
    for (const include of templateJson.includes) {
      const includePath = path.join(TEMPLATES_DIR, include);
      if (fs.existsSync(includePath)) {
        const includeRulesDir = path.join(includePath, 'rules');
        if (fs.existsSync(includeRulesDir)) {
          const rules = fs.readdirSync(includeRulesDir).filter(f => f.endsWith('.md'));

          for (const rule of rules) {
            const skillName = rule.replace('.md', '');
            const skillDir = path.join(skillsDir, skillName);

            // Only add if not already exists
            if (!fs.existsSync(skillDir)) {
              fs.mkdirSync(skillDir, { recursive: true });

              const rulePath = path.join(includeRulesDir, rule);
              const skillContent = convertRuleToSkill(rulePath, skillName);

              fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skillContent);
            }
          }

          console.log(`    ✓ Included ${rules.length} skills from ${include}`);
        }
      }
    }
  }

  console.log(`✓ Created plugin: ${pluginName}`);
}

// Main
console.log('Converting templates to plugins...\n');

// Ensure plugins directory exists
fs.mkdirSync(PLUGINS_DIR, { recursive: true });

for (const [templateRelPath, pluginName] of Object.entries(TEMPLATE_MAPPING)) {
  const templatePath = path.join(TEMPLATES_DIR, templateRelPath);

  if (fs.existsSync(templatePath)) {
    console.log(`\nConverting: ${templateRelPath} → ${pluginName}`);
    convertTemplate(templatePath, pluginName);
  } else {
    console.log(`⚠ Template not found: ${templateRelPath}`);
  }
}

console.log('\n✅ Conversion complete!');

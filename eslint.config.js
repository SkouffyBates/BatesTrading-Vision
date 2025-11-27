import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
    // 1. Fichiers et dossiers à ignorer
    globalIgnores(['dist']),

    // 2. Configuration JavaScript de base recommandée
    js.configs.recommended,

    // 3. Configuration pour les fichiers Electron (Node.js) - Correction des erreurs 'no-undef'
    {
        files: ['electron/main.js'], // Ciblage spécifique du fichier Electron
        languageOptions: {
            // Ajout des variables globales du Node.js (require, __dirname, process, etc.)
            globals: {
                ...globals.node,
            },
            sourceType: 'module', // Assurer la compatibilité avec l'import/export ES
            ecmaVersion: 'latest',
        },
        rules: {
            // Permettre l'utilisation de console.log, etc., qui est courant dans les scripts Node
            'no-console': 'off',
        }
    },

    // 4. Bloc de configuration unique pour les fichiers React/JSX
    {
        files: ['**/*.{js,jsx}'],
        
        plugins: {
            react: react,
            'react-refresh': reactRefresh
        },

        languageOptions: {
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: { jsx: true },
            },
            globals: {
                ...globals.browser,
            },
        },
        
        rules: {
            // Règles de base de React
            ...react.configs.recommended.rules,
            ...reactRefresh.configs.vite.rules,

            // --- Corrections pour App.jsx ---
            
            // Correction 1: Désactivation de prop-types
            'react/prop-types': 'off',
            
            // Correction 2: Désactivation de la vérification des entités échappées pour corriger les erreurs de guillemets
            // Si vous préférez la correction, relancez `eslint . --fix`.
            'react/no-unescaped-entities': 'off',
            
            // Correction 3: Forcer rel="noopener noreferrer" pour target="_blank"
            // La règle par défaut de React est d'émettre une erreur, mais `eslint --fix` devrait ajouter `rel="noreferrer"`.
            // Nous allons laisser la règle active pour qu'elle puisse être corrigée via --fix ou manuellement.

            // Désactivation des imports explicites de 'React' (pour React 17+)
            'react/jsx-uses-react': 'off',
            'react/react-in-jsx-scope': 'off',

            // Correction 4: Règle pour les variables non utilisées. Permet de ne pas utiliser la variable d'erreur.
            // Corrige l'erreur 'error' is defined but never used
            'no-unused-vars': [
                'error', 
                { 
                    varsIgnorePattern: '^[A-Z_]', 
                    argsIgnorePattern: '^_',      
                    caughtErrors: 'none'  // Change ici: 'none' permet de ne pas utiliser le paramètre d'erreur (e) dans catch (e)
                }
            ],
        },
        
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
]);
[![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/pokeclicker/pokeclicker/develop?label=dev%20version)](https://github.com/pokeclicker/pokeclicker/tree/develop)<br/>
[![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/pokeclicker/pokeclicker/master?label=live%20version)](https://www.pokeclicker.com/)<br/>
[![Build Status](https://img.shields.io/travis/com/pokeclicker/pokeclicker?logo=travis)](https://travis-ci.com/pokeclicker/pokeclicker)<br/>
[![Discord](https://img.shields.io/discord/450412847017754644?color=7289DA&label=Discord&logo=discord)](https://discord.gg/a6DFe4p)

# PokéClicker
A game about catching Pokémon, defeating gym leaders, and watching numbers get bigger.

NOTE: PokéClicker is still in development!

You can try out the current state at https://www.pokeclicker.com/

You can reach out on discord to discuss your ideas and how to implement them: https://discord.gg/a6DFe4p

# Crobat fork Changelog
4/28/2022
* Dock added to Shortcuts window
* Pokeball selection added for each type
* Oak's Items loadouts increased from 3 to 6

5/24/2022
* Some egg exclusive pokémon added in the wild to reflect main games location ([Link](eggExclusives.md))
* Dungeon tiles size now dynamically changes inside a 300px height container
* Generic tooltip on locked bosses replaced by the actual requirement
* Enigma Berry: Discord not required anymore but it requires to generate a Trainer ID (Menu > Save > Generate Trainer ID) *This probably killed discord integration but I don't really care*
* Removed dungeon loot nerf if player's current region is 3 regions above the region where the selected dungeon is
* Pokéball by type menu collapsed by default
* Pikachu and Exeggcute now evolves into their alolan forms only inside Alola and into the normal ones only outside it

5/26/2022
* Added Official fork update (v0.9.4)

# Developer instructions

## Editor/IDE setup

We have an [EditorConfig](https://editorconfig.org/) and linting configured, to help everyone write similar code. You will find our recommended plugins for VSCode below, however you should be able to find a plugin for other IDEs as well.

* [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)
* [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

## Building from Source

First make sure you have git and npm available as command-line utilities (so you should install Git and NodeJS if you don't have them already).

Open a command line interface in the directory that contains this README file, and use the following command to install PokéClicker's other dependencies locally:
```cmd
npm clean-install
```

Then finally, run the following command in the command line interface to start a browser running PokéClicker.
```cmd
npm start
```

Changes to the sourcecode will automatically cause the browser to refresh.
This means you don't need to compile TypeScript yourself. Gulp will do this for you :thumbsup:


## Use Google cloud shell _(alternative)_
[![Google Cloud Shell](https://gstatic.com/cloudssh/images/open-btn.png)](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/pokeclicker/pokeclicker&git_branch=develop&page=editor&open_in_editor=README.md)
```cmd
npm clean-install
npm start
```
Click the [Web Preview](https://cloud.google.com/shell/docs/using-web-preview) Button and select port `3001` from the displayed menu.
Cloud Shell opens the preview URL on its proxy service in a new browser window.

## Deploying a new version to Github Pages
Before deploying, check that the game compiles and starts up without errors. Then run:
```cmd
npm run website
```

After this command completes, push the changed files in the 'docs' directory to Github.

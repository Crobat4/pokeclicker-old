import { Saveable } from '../DataStore/common/Saveable';
import BerryType from '../enums/BerryType';
import NotificationConstants from '../notifications/NotificationConstants';
import Notifier from '../notifications/Notifier';
import RedeemableCode from './RedeemableCode';
import * as GameConstants from '../GameConstants'; // added
import Rand from '../utilities/Rand';
import OakItemType from '../enums/OakItemType';
import BadgeEnums from '../enums/Badges';
// import * as PokemonFactory from '../../scripts/pokemons/PokemonFactory'; //added

export default class RedeemableCodes implements Saveable {
    defaults: Record<string, any>;
    saveKey = 'redeemableCodes';

    codeList: RedeemableCode[];

    constructor() {
        this.codeList = [
            new RedeemableCode('farming-quick-start', -83143881, false, () => { // FARMINGBOOST
                // Give the player 10k farming points, 100 Cheri berries
                App.game.wallet.gainFarmPoints(10000);
                App.game.farming.gainBerry(BerryType.Cheri, 100, false);
                // Notify that the code was activated successfully
                Notifier.notify({
                    title: 'Code activated!',
                    message: 'You gained 10,000 farmpoints and 100 Cheri berries',
                    type: NotificationConstants.NotificationOption.success,
                    timeout: 1e4,
                });
            }),
            new RedeemableCode('shiny-charmer', -318017456, false, () => { // OOOSHINY
                // Select a random Pokemon to give the player as a shiny
                const pokemon = pokemonMap.randomRegion(player.highestRegion());
                // Floor the ID, only give base/main Pokemon forms
                const idToUse = Math.floor(pokemon.id);
                App.game.party.gainPokemonById(idToUse, true, true);
                // Notify that the code was activated successfully
                Notifier.notify({
                    title: 'Code activated!',
                    message: `✨ You found a shiny ${pokemonMap[idToUse].name}! ✨`,
                    type: NotificationConstants.NotificationOption.success,
                    timeout: 1e4,
                });
            }),
            // Rotom (Crobat)
            // eslint-disable-next-line consistent-return
            new RedeemableCode('rotom-crobat', 855696596, false, () => { // CROBATISBASED
                const successfulCode = this.pokemonCode('Rotom (Crobat)', 'Rotom', BadgeEnums.Beacon);
                // Needs to be undefined to be counted as code reedemed
                // undefined is counted as false so it need "=== false"
                if (successfulCode === false) {
                    return false;
                }
            }),
            // Surfing Pikachu
            // eslint-disable-next-line consistent-return
            new RedeemableCode('surfing-pikachu', -1621513525, false, () => { // FATRATDROWNED
                const successfulCode = this.pokemonCode('Surfing Pikachu', 'Pikachu', BadgeEnums.Earth);
                if (successfulCode === false) {
                    return false;
                }
            }),
            // Unown C-R-O-B-A-T
            // eslint-disable-next-line consistent-return
            new RedeemableCode('unown-c', 64085966, false, () => { // CHASE
                const successfulCode = this.pokemonCode('Unown (C)', undefined, BadgeEnums.Rising);
                if (successfulCode === false) {
                    return false;
                }
            }),
            // eslint-disable-next-line consistent-return
            new RedeemableCode('unown-r', -70124742, false, () => { // REASSURE
                const successfulCode = this.pokemonCode('Unown (R)', undefined, BadgeEnums.Rising);
                if (successfulCode === false) {
                    return false;
                }
            }),
            // eslint-disable-next-line consistent-return
            new RedeemableCode('unown-o', -933339908, false, () => { // OBSERVE
                const successfulCode = this.pokemonCode('Unown (O)', undefined, BadgeEnums.Rising);
                if (successfulCode === false) {
                    return false;
                }
            }),
            // eslint-disable-next-line consistent-return
            new RedeemableCode('unown-b', 2034612, false, () => { // BEAR
                const successfulCode = this.pokemonCode('Unown (B)', undefined, BadgeEnums.Rising);
                if (successfulCode === false) {
                    return false;
                }
            }),
            // eslint-disable-next-line consistent-return
            new RedeemableCode('unown-a', 62423425, false, () => { // ANGRY
                const successfulCode = this.pokemonCode('Unown (A)', undefined, BadgeEnums.Rising);
                if (successfulCode === false) {
                    return false;
                }
            }),
            // eslint-disable-next-line consistent-return
            new RedeemableCode('unown-t', 2571185, false, () => { // TELL
                const successfulCode = this.pokemonCode('Unown (T)', undefined, BadgeEnums.Rising);
                if (successfulCode === false) {
                    return false;
                }
            }),
            // Flutes gem refund
            /*
            new RedeemableCode('azure-flute-refund', 267666929, false, () => { //AZUREFLUTE
                if (player.itemList['Azure_Flute']()) {
                    // Give the player the Azure Flute cost
                    App.game.gems.gainGems(50000, PokemonType.Dragon);
                    App.game.gems.gainGems(50000, PokemonType.Ghost);
                    App.game.gems.gainGems(50000, PokemonType.Psychic);
                    // Notify that the code was activated successfully
                    Notifier.notify({
                        title: 'Gems refunded!',
                        message: 'You gained 50,000 Dragon, Ghost and Psychic Gems',
                        type: NotificationConstants.NotificationOption.success,
                        timeout: 1e4,
                    });
                }
                else {
                    Notifier.notify({
                        message: 'You didn\'t buy the flute before the update.',
                        type: NotificationConstants.NotificationOption.danger,
                        timeout: 1e4,
                    });
                    return false;
                }
            }),
            new RedeemableCode('eon-flute-refund', -606755684, false, () => { //EONFLUTE
                if (player.itemList['Eon_Flute']()) {
                    // Give the player the Eon Flute cost
                    App.game.gems.gainGems(50000, PokemonType.Dragon);
                    App.game.gems.gainGems(50000, PokemonType.Flying);
                    App.game.gems.gainGems(50000, PokemonType.Psychic);
                    // Notify that the code was activated successfully
                    Notifier.notify({
                        title: 'Gems refunded!',
                        message: 'You gained 50,000 Dragon, Flying and Psychic Gems',
                        type: NotificationConstants.NotificationOption.success,
                        timeout: 1e4,
                    });
                }
                else {
                    Notifier.notify({
                        message: 'You didn\'t buy the flute before the update.',
                        type: NotificationConstants.NotificationOption.danger,
                        timeout: 1e4,
                    });
                    return false;
                }
            }),
            */
        ];
    }

    /**
     * Had to put this here because some errors when bringing the function from PokemonFactory.ts
     * Calculate if a shiny has spawned.
     * @param chance Base chance, should be from GameConstants.SHINY_CHANCE.*
     * @returns {boolean}
     */
    // eslint-disable-next-line class-methods-use-this
    generateShiny(chance: number, skipBonus = false): boolean {
        const bonus = skipBonus ? 1 : App.game.multiplier.getBonus('shiny');

        if (Rand.chance(chance / bonus)) {
            App.game.oakItems.use(OakItemType.Shiny_Charm);
            return true;
        }
        return false;
    }
    // eslint-disable-next-line class-methods-use-this
    checkRegion(pokemon, currentRegion) {
        if (currentRegion >= pokemon.nativeRegion) {
            return true;
        }
        return false;
    }
    // eslint-disable-next-line class-methods-use-this
    checkOriginalForm(originalForm) {
        // If MissingNo., no original form is required (This is mostly for the Unowns)
        if (App.game.party.alreadyCaughtPokemon(originalForm.id) || originalForm.id === 0) {
            return true;
        }
        return false;
    }
    // eslint-disable-next-line class-methods-use-this
    checkBadge(badge) {
        if (App.game.badgeCase.hasBadge(badge)) {
            return true;
        }
        return false;
    }
    // eslint-disable-next-line consistent-return
    pokemonCode(pokemonName, originalName = 'MissingNo.', badge) {
        const shiny = this.generateShiny(GameConstants.SHINY_CHANCE_SHOP);
        const pokemon = pokemonMap[pokemonName];
        const originalForm = pokemonMap[originalName];
        // const badge = BadgeEnums.Earth;
        const badgeSatisfied = this.checkBadge(badge);
        const regionSatisfied = this.checkRegion(pokemon, player.highestRegion());
        const originalFormSatisfied = this.checkOriginalForm(originalForm);
        if (regionSatisfied && originalFormSatisfied && badgeSatisfied) {
            App.game.party.gainPokemonById(pokemon.id, shiny, true);
            // Notify that the code was activated successfully
            Notifier.notify({
                title: 'Code activated!',
                message: `You obtained a${shiny ? ' shiny' : ''} ${pokemon.name}!`,
                type: NotificationConstants.NotificationOption.success,
                timeout: 1e4,
            });
        } else {
            // Notify that the region of code pokemon is not reached yet
            const messageGeneral = 'You can\'t get this Pokémon yet!';
            const messageOriginalForm = `Requires ${originalForm.name} to be caught.`;
            const messageBadge = `Requires the ${GameConstants.camelCaseToString(BadgeEnums[badge])} Badge.`;
            const mergeMessages = messageGeneral + (!originalFormSatisfied ? `\n${messageOriginalForm}` : '') + (!badgeSatisfied ? `\n${messageBadge}` : '');
            const messageRegion = 'You need to progress further to unlock this pokemon.';
            Notifier.notify({
                message: regionSatisfied ? mergeMessages : messageRegion,
                type: NotificationConstants.NotificationOption.danger,
                timeout: 1e4,
            });
            return false;
        }
    }

    // eslint-disable-next-line class-methods-use-this
    isDiscordCode(code: string): boolean {
        return /^\w{4}-\w{4}-\w{4}$/.test(code);
    }

    enterCode(code: string): void {
        // If this is a Discord code, send it to the Discord class to check
        if (App.game.discord.enabled && this.isDiscordCode(code)) {
            App.game.discord.enterCode(code);
            return;
        }

        const hash = this.hash(code);

        const redeemableCode = this.codeList.find((c) => c.hash === hash);

        if (!redeemableCode) {
            /*
            console.log(`Red_Flute: ${player.itemList.Red_Flute() ? 'true' : 'false'}`);
            console.log(`White_Flute: ${player.itemList.White_Flute() ? 'true' : 'false'}`);
            console.log(`Black_Flute: ${player.itemList.Black_Flute() ? 'true' : 'false'}`);
            console.log(`Yellow_Flute: ${player.itemList.Yellow_Flute() ? 'true' : 'false'}`);
            console.log(`Blue_Flute: ${player.itemList.Blue_Flute() ? 'true' : 'false'}`);
            console.log(`Poke_Flute: ${player.itemList.Poke_Flute() ? 'true' : 'false'}`);
            console.log(`Azure_Flute: ${player.itemList.Azure_Flute() ? 'true' : 'false'}`);
            console.log(`Eon_Flute: ${player.itemList.Eon_Flute() ? 'true' : 'false'}`);
            console.log(`Sun_Flute: ${player.itemList.Sun_Flute() ? 'true' : 'false'}`);
            console.log(`Moon_Flute: ${player.itemList.Moon_Flute() ? 'true' : 'false'}`);
            console.log(`Time_Flute: ${player.itemList.Time_Flute() ? 'true' : 'false'}`);
            console.log(`Grass_Flute: ${player.itemList.Grass_Flute() ? 'true' : 'false'}`);
            */
            Notifier.notify({
                message: `Invalid code ${code}`,
                type: NotificationConstants.NotificationOption.danger,
            });
            return;
        }

        redeemableCode.redeem();
    }

    /**
     * Insecure hash, but should keep some of the nosy people out.
     * @param text
     */
    // eslint-disable-next-line class-methods-use-this
    hash(text: string): number {
        let hash = 0;
        let i = 0;
        let chr = 0;
        if (text.length === 0) {
            return hash;
        }

        for (i = 0; i < text.length; i++) {
            chr = text.charCodeAt(i);
            // eslint-disable-next-line no-bitwise
            hash = ((hash << 5) - hash) + chr;
            // eslint-disable-next-line no-bitwise
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }

    fromJSON(json: string[]): void {
        if (json == null) {
            return;
        }

        json.forEach((name) => {
            const foundCode = this.codeList.find((code) => code.name === name);

            if (foundCode) {
                foundCode.isRedeemed = true;
            }
        });
    }

    toJSON(): Record<string, any> {
        return this.codeList.reduce((res: string[], code: RedeemableCode) => {
            if (code.isRedeemed) {
                res.push(code.name);
            }
            return res;
        }, []);
    }
}

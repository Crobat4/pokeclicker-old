///<reference path="PokemonHelper.ts"/>
///<reference path="BattlePokemon.ts"/>

class PokemonFactory {

    /**
     * Generate a wild pokemon based on route, region and the dataList.
     * @param route route that the player is on.
     * @param region region that the player is in.
     * @returns {any}
     */
    public static generateWildPokemon(route: number, region: GameConstants.Region, subRegion: SubRegion): BattlePokemon {
        if (!MapHelper.validRoute(route, region)) {
            return new BattlePokemon('MissingNo.', 0, PokemonType.None, PokemonType.None, 0, 0, 0, 0, new Amount(0, GameConstants.Currency.money), false, 0);
        }
        let name: PokemonNameType;

        const roaming = PokemonFactory.roamingEncounter(route, region, subRegion);
        if (roaming) {
            name = PokemonFactory.generateRoamingEncounter(region, subRegion);
        } else {
            name = Rand.fromArray(RouteHelper.getAvailablePokemonList(route, region));
        }
        const basePokemon = PokemonHelper.getPokemonByName(name);
        const routeAvgHp = (region, route) => {
            const poke = [...new Set(Object.values(Routes.getRoute(region, route).pokemon).flat().map(p => p.pokemon ?? p).flat())];
            const total = poke.map(p => pokemonMap[p].base.hitpoints).reduce((s, a) => s + a, 0);
            return total / poke.length;
        };

        // TODO this monster formula needs to be improved. Preferably with graphs :D
        // Health has a +/- 10% variable based on base health stat compared to the average of the route
        const maxHealth: number = Math.round((PokemonFactory.routeHealth(route, region) - (PokemonFactory.routeHealth(route, region) / 10)) + (PokemonFactory.routeHealth(route, region) / 10 / routeAvgHp(region, route) * basePokemon.hitpoints));
        const level: number = this.routeLevel(route, region);
        const money: number = this.routeMoney(route,region);
        const shiny: boolean = this.generateShiny(GameConstants.SHINY_CHANCE_BATTLE); // Remove
        if (roaming) {
            Notifier.notify({
                message: `You encountered a roaming ${name}!`,
                type: NotificationConstants.NotificationOption.warning,
                sound: NotificationConstants.NotificationSound.General.roaming,
                setting: NotificationConstants.NotificationSetting.General.encountered_roaming,
            });
            App.game.logbook.newLog(LogBookTypes.ROAMER, `[${Routes.getRoute(player.region, player.route()).routeName}] You encountered a ${shiny ? 'shiny' : ''} roaming ${name}!`);
        }
        const ep = GameConstants.BASE_EP_YIELD * (roaming ? GameConstants.ROAMER_EP_MODIFIER : 1);
        const battlePokemonObject = this.battlePokemonGenerator(basePokemon, maxHealth, level, money, GameConstants.SHINY_CHANCE_BATTLE, 1, false, GameConstants.ROUTE_HELD_ITEM_MODIFIER, 'wild encounter', ep);
		
        //return new BattlePokemon(name, id, basePokemon.type1, basePokemon.type2, maxHealth, level, catchRate, exp, new Amount(money, GameConstants.Currency.money), shiny, 1, heldItem, ep);
        return battlePokemonObject;
    }

    public static battlePokemonGenerator(basePokemon, maxHealth, level, money, shinyModifier, gems, isTrainer, heldItemModifier = undefined, logEventLabel = '', ep = undefined) {
        //const basePokemon = PokemonHelper.getPokemonByName(name);
        const name = basePokemon.name;
        const id = basePokemon.id;
        let catchRate = 0;
        const exp: number = basePokemon.exp; //add *1.5 on gym and temporary
        const heldItem: BagItem = this.generateHeldItem(basePokemon.heldItem, heldItemModifier);
        const shiny: boolean = this.generateShiny(shinyModifier);
        const genderType: number = basePokemon.genderType;
        const hasFemaleDifference: boolean = basePokemon.hasFemaleDifference;
        const isFemale = this.generateGender(basePokemon.genderRatio, genderType);
        const genderText = this.generateGenderTypeName(basePokemon, isFemale);

        if (!isTrainer) {
            catchRate = this.catchRateHelper(basePokemon.catchRate);
            this.shinyNotificationAndLog(name, shiny, logEventLabel);
        }

        const battlePokemonObject = new BattlePokemon(
            name,
            id,
            basePokemon.type1,
            basePokemon.type2,
            maxHealth,
            level,
            catchRate,
            exp,
            new Amount(money, GameConstants.Currency.money),
            shiny,
            gems,
            heldItem,
            ep,
            genderText,
            hasFemaleDifference,
            isFemale
        );
        return battlePokemonObject;
    }

    public static shinyNotificationAndLog(name, shiny, logEventLabel) {
        if (shiny) {
            Notifier.notify({
                message: `✨ You encountered a shiny ${name}! ✨`,
                type: NotificationConstants.NotificationOption.warning,
                sound: NotificationConstants.NotificationSound.General.shiny_long,
                setting: NotificationConstants.NotificationSetting.General.encountered_shiny,
            });

            // Track shinies encountered, and rate of shinies
            LogEvent('encountered shiny', 'shiny pokemon', logEventLabel,
                Math.floor(App.game.statistics.totalPokemonEncountered() / App.game.statistics.totalShinyPokemonEncountered()));
        }
    }

    public static routeLevel(route: number, region: GameConstants.Region): number {
        //return Math.floor(20 * Math.pow(MapHelper.normalizeRoute(route, region),(1 / 2.25))); //v0.9.7 EXP rebalance fix
        return Math.floor(MapHelper.normalizeRoute(route, region) * 2 + 20 * Math.pow(region, 2.3));
    }

    public static routeHealth(route: number, region: GameConstants.Region): number {
        const regionRoute = Routes.regionRoutes.find((routeData) => routeData.region === region && routeData.number === route);
        if (regionRoute?.routeHealth) {
            return regionRoute.routeHealth;
        }
        route = MapHelper.normalizeRoute(route, region);
        const health: number = Math.max(20, Math.floor(Math.pow((100 * Math.pow(route, 2.2) / 12), 1.15) * (1 + region / 20))) || 20;
        return health;
    }

    public static routeMoney(route: number, region: GameConstants.Region, useRandomDeviation = true): number {
        route = MapHelper.normalizeRoute(route, region);
        //If it's not random, we take the mean value (truncated)
        const deviation = useRandomDeviation ? Rand.intBetween(-25, 25) : 12;
        const money: number = Math.max(10, 3 * route + 5 * Math.pow(route, 1.15) + deviation);

        return money;
    }

    public static routeDungeonTokens(route: number, region: GameConstants.Region): number {
        route = MapHelper.normalizeRoute(route, region);

        const tokens = Math.max(1, 6 * Math.pow(route * 2 / (2.8 / (1 + region / 3)), 1.08));

        return tokens;
    }

    /**
     * Calculate if a shiny has spawned.
     * @param chance Base chance, should be from GameConstants.SHINY_CHANCE.*
     * @returns {boolean}
     */
    public static generateShiny(chance: number, skipBonus = false): boolean {
        const bonus = skipBonus ? 1 : App.game.multiplier.getBonus('shiny');

        if (Rand.chance(chance / bonus)) {
            App.game.oakItems.use(OakItemType.Shiny_Charm);
            return true;
        }
        return false;
    }

    /**
     * Calculate which gender has the pokemon.
     * @param chance Base chance, should be from GameConstants under Gender ratio comment
     * @param genderType Gender type (Genderless, male only, etc.), should be from GameConstants under Gender types comment
     * @returns {boolean} true if female, false if male
     */
    public static generateGender(chance: number, genderType: number): boolean {
        let isFemale = false;
        if (genderType === GameConstants.MALE_FEMALE) {
            if (Rand.chance(chance)) {
                isFemale = true;
            }
        } else if (genderType === GameConstants.FEMALE_ONLY) {
            isFemale = true;
        }
        return isFemale;
    }

    /**
     * Generates text according to the gender. Gender icon if male/female, nothing if genderless.
     * genderType Gender type (Genderless, male only, etc.), should be from GameConstants under Gender types comment
     * @param pokemon Pokemon object
     * @param isFemale True if female, false if male
     * @returns {string} Gender icon or nothing
     */
    public static generateGenderTypeName(pokemon: DataPokemon, isFemale: boolean): string {
        let genderText = '';
        // No gender icon if genderless or any of the Nidoran (like main games)
        if (pokemon.genderType === GameConstants.GENDERLESS || pokemon.id == 29 || pokemon.id == 32) {
            genderText = '';
        } else {
            if (isFemale) {
                genderText = '<i class="bi bi-gender-female gender-icon-female"></i>';
            } else {
                genderText = '<i class="bi bi-gender-male gender-icon-male"></i>';
            }
        }
        return genderText;
    }

    public static generatePartyPokemon(id: number, shiny = false): PartyPokemon {
        const dataPokemon = PokemonHelper.getPokemonById(id);
        return new PartyPokemon(dataPokemon.id, dataPokemon.name, dataPokemon.evolutions, dataPokemon.attack, shiny);
    }

    /**
     * Generate a Gym trainer pokemon based on gymName, index and the dataList.
     * @param gymName name of the gym that the player is fighting.
     * @param index index of the Pokémon that is being generated.
     * @returns {BattlePokemon}
     */
    public static generateGymPokemon(gym: Gym, index: number): BattlePokemon {
        const pokemon = gym.pokemons[index];
        const basePokemon = PokemonHelper.getPokemonByName(pokemon.name);
        const money = 0;
        const battlePokemonObject = this.battlePokemonGenerator(basePokemon, pokemon.maxHealth, pokemon.level, money, GameConstants.SHINY_CHANCE_BATTLE, GameConstants.GYM_GEMS, true);
        return battlePokemonObject;
    }

    /**
     * Generate a Battle Frontier pokemon.
     * @returns {BattlePokemon}
     */
     public static generateBattleFrontierPokemon(): BattlePokemon {
        const enemy = pokemonMap.randomRegion(player.highestRegion());
        // This needs to stay as none so the stage number isn't adjusted
        const health = PokemonFactory.routeHealth(BattleFrontierRunner.stage() + 10, GameConstants.Region.none);
        const level = Math.min(100, BattleFrontierRunner.stage());
        // Don't award money per pokemon defeated, award money at the end
        const money = 0;
        // Give 1 extra gem per pokemon defeated after every 80 stages
        const gems = Math.ceil(BattleFrontierRunner.stage() / 80);

        const battlePokemonObject = this.battlePokemonGenerator(enemy, health, level, money, GameConstants.SHINY_CHANCE_BATTLE, gems, false);
        return battlePokemonObject;
    }

    public static generateDungeonPokemon(name: PokemonNameType, chestsOpened: number, baseHealth: number, level: number): BattlePokemon {
        const basePokemon = PokemonHelper.getPokemonByName(name);
        const maxHealth: number = Math.floor(baseHealth * (1 + (chestsOpened / 5)));
        const money = 0;
        const ep = GameConstants.BASE_EP_YIELD * GameConstants.DUNGEON_EP_MODIFIER;
        //return new BattlePokemon(name, id, basePokemon.type1, basePokemon.type2, maxHealth, level, catchRate, exp, new Amount(money, GameConstants.Currency.money), shiny, GameConstants.DUNGEON_GEMS, heldItem, ep);
        const battlePokemonObject = this.battlePokemonGenerator(basePokemon, maxHealth, level, money, GameConstants.SHINY_CHANCE_DUNGEON, GameConstants.DUNGEON_GEMS, false, GameConstants.DUNGEON_HELD_ITEM_MODIFIER, 'dungeon encounter', ep);
        return battlePokemonObject;
    }

    public static generateDungeonTrainerPokemon(pokemon: GymPokemon, chestsOpened: number, baseHealth: number, level: number): BattlePokemon {
        // TODO: HLXII - Will Dungeon Trainer pokemon health be handled differently?
        const name = pokemon.name;
        const basePokemon = PokemonHelper.getPokemonByName(name);
        const maxHealth: number = Math.floor(baseHealth * (1 + (chestsOpened / 5)));
        // Reward 2% or 5% (boss) of dungeon DT cost when the trainer mons are defeated
        const money = 0;
        const battlePokemonObject = this.battlePokemonGenerator(basePokemon, maxHealth, level, money, GameConstants.SHINY_CHANCE_DUNGEON, GameConstants.DUNGEON_GEMS, true);
        return battlePokemonObject;
    }

    public static generateDungeonBoss(bossPokemon: DungeonBossPokemon, chestsOpened: number): BattlePokemon {
        const name: PokemonNameType = bossPokemon.name;
        const basePokemon = PokemonHelper.getPokemonByName(name);
        const level = bossPokemon.level;
        const maxHealth: number = Math.floor(bossPokemon.baseHealth * (1 + (chestsOpened / 5)));
        const money = 0;
        const ep = GameConstants.BASE_EP_YIELD * GameConstants.DUNGEON_BOSS_EP_MODIFIER;
        //return new BattlePokemon(name, id, basePokemon.type1, basePokemon.type2, maxHealth, bossPokemon.level, catchRate, exp, new Amount(money, GameConstants.Currency.money), shiny, GameConstants.DUNGEON_BOSS_GEMS, heldItem, ep);
        const battlePokemonObject = this.battlePokemonGenerator(basePokemon, maxHealth, level, money, GameConstants.SHINY_CHANCE_DUNGEON, GameConstants.DUNGEON_BOSS_GEMS, false, GameConstants.DUNGEON_BOSS_HELD_ITEM_MODIFIER, 'dungeon boss encounter', ep);
        return battlePokemonObject;
    }

    public static generateTemporaryBattlePokemon(battle: TemporaryBattle, index: number): BattlePokemon {
        const pokemon = battle.pokemons[index];
        const basePokemon = PokemonHelper.getPokemonByName(pokemon.name);
        const maxHealth = pokemon.maxHealth;
        const level = pokemon.level;
        const money = 0;
        const battlePokemonObject = this.battlePokemonGenerator(basePokemon, maxHealth, level, money, GameConstants.SHINY_CHANCE_BATTLE, GameConstants.GYM_GEMS, true);
        return battlePokemonObject;
    }

    private static generateRoamingEncounter(region: GameConstants.Region, subRegion: SubRegion): PokemonNameType {
        const possible = RoamingPokemonList.getSubRegionalGroupRoamers(region, RoamingPokemonList.findGroup(region, subRegion.id));

        // Double the chance of encountering a roaming Pokemon you have not yet caught
        return Rand.fromWeightedArray(possible, possible.map(r => App.game.party.alreadyCaughtPokemonByName(r.pokemon.name) ? 1 : 2)).pokemon.name;
    }

    private static roamingEncounter(routeNum: number, region: GameConstants.Region, subRegion: SubRegion): boolean {
        // Map to the route numbers
        const route = Routes.getRoute(region, routeNum);
        const routes = Routes.getRoutesByRegion(region).map(r => MapHelper.normalizeRoute(r.number, region));

        // Check if the dice rolls in their favor
        const encounter = PokemonFactory.roamingChance(Math.max(...routes), Math.min(...routes), route, region, subRegion);
        if (!encounter) {
            return false;
        }

        // There is likely to be a roamer available, so we can check this last
        const roamingPokemon = RoamingPokemonList.getSubRegionalGroupRoamers(region, RoamingPokemonList.findGroup(region, subRegion.id));
        if (!routes || !routes.length || !roamingPokemon || !roamingPokemon.length) {
            return false;
        }

        // Roaming encounter
        return true;
    }

    private static roamingChance(maxRoute: number, minRoute: number, curRoute: RegionRoute, region: GameConstants.Region, subRegion: SubRegion, max = GameConstants.ROAMING_MAX_CHANCE, min = GameConstants.ROAMING_MIN_CHANCE, skipBonus = false) {
        const bonus = skipBonus ? 1 : App.game.multiplier.getBonus('roaming');
        const routeNum = MapHelper.normalizeRoute(curRoute?.number, region);
        // Check if we should have increased chances on this route (3 x rate)
        const increasedChance = RoamingPokemonList.getIncreasedChanceRouteBySubRegionGroup(player.region, RoamingPokemonList.findGroup(region, subRegion.id))()?.number == curRoute?.number;
        const roamingChance = (max + ( (min - max) * (maxRoute - routeNum) / (maxRoute - minRoute))) / ((increasedChance ? 3 : 1) * bonus);
        return Rand.chance(roamingChance);
    }

    private static catchRateHelper(baseCatchRate: number, noVariation = false): number {
        const catchVariation = noVariation ? 0 : Rand.intBetween(-3, 3);
        const catchRateRaw = Math.floor(Math.pow(baseCatchRate, 0.75)) + catchVariation;
        return GameConstants.clipNumber(catchRateRaw, 0, 100);
    }

    private static generateHeldItem(item: BagItem, modifier: number): BagItem | null {
        if (!item || !BagHandler.displayName(item)) {
            return null;
        }

        let chance = GameConstants.HELD_ITEM_CHANCE;

        // Apply drop chance by item type
        switch (item.type) {
            case ItemType.underground:
                chance = GameConstants.HELD_UNDERGROUND_ITEM_CHANCE;
                break;
        }

        // Apply drop chance by item ID
        switch (item.id) {
            case 'Black_DNA':
                chance = GameConstants.DNA_ITEM_CHANCE;
                break;
            case 'White_DNA':
                chance = GameConstants.DNA_ITEM_CHANCE;
                break;
        }

        chance /= modifier;

        if (EffectEngineRunner.isActive(GameConstants.BattleItemType.Dowsing_machine)()) {
            chance /= 1.5;
        }

        if (Rand.chance(chance)) {
            return item;
        }

        return null;
    }
}

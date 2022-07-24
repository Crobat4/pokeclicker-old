import TypeColor = GameConstants.TypeColor;

class PokedexHelper {
    public static toggleStatisticShiny = ko.observable(false);
    public static toggleAllShiny = ko.observable(false);
    public static showAllPokemon = ko.observable(false);
    public static toggleFemale = ko.observable(false);

    public static navigateIndex: KnockoutObservable<number> = ko.observable(0);

    public static getBackgroundColors(name: PokemonNameType): string {
        const pokemon = PokemonHelper.getPokemonByName(name);

        if (!this.pokemonSeen(pokemon.id)()) {
            return 'grey';
        }
        if (pokemon.type2 == PokemonType.None) {
            return TypeColor[pokemon.type1];
        }
        return `linear-gradient(90deg,${TypeColor[pokemon.type1]} 50%, ${TypeColor[pokemon.type2]} 50%)`;
    }

    /**
     * Returns true if you have seen the pokemon
     * @param {number} id
     * @returns {boolean}
     */
    public static pokemonSeen(id: number): KnockoutComputed<boolean> {
        return ko.pureComputed(() => {
            try {
                return App.game.statistics.pokemonEncountered[id]() > 0 || App.game.statistics.pokemonDefeated[id]() > 0 || App.game.statistics.pokemonCaptured[id]() > 0 || App.game.party.alreadyCaughtPokemon(id);
            } catch (error) {
                return false;
            }
        });
    }

    public static filteredList: KnockoutObservableArray<Record<string, any>> = ko.observableArray([]);

    public static populateFilters() {
        let options = $('#pokedex-filter-type1');
        $.each(PokemonType, function () {
            if (isNaN(Number(this)) && this != PokemonType.None) {
                options.append($('<option />').val(PokemonType[this]).text(this));
            }
        });

        options = $('#pokedex-filter-type2');
        $.each(PokemonType, function () {
            if (isNaN(Number(this)) && this != PokemonType.None) {
                options.append($('<option />').val(PokemonType[this]).text(this));
            }
        });

        options = $('#pokedex-filter-region');
        for (let i = 0; i <= GameConstants.MAX_AVAILABLE_REGION; i++) {
            options.append($('<option />').val(i).text(GameConstants.camelCaseToString(GameConstants.Region[i])));
        }
    }

    public static shortenedListByIndex(id = 0) {
        return this.showAllPokemon() ? this.filteredList() : this.filteredList().slice(0, (this.navigateIndex() * 50));
    }
    public static addPokemonItem() {
        //this.filteredList().push(this.filteredList().slice(51, 100));
        this.setNavigateIndex(this.navigateIndex() + 1);
        //console.log(this.navigateIndex());
    }
    public static setNavigateIndex(index: number): void {
        this.navigateIndex(index);
    }

    public static updateList() {
        $('#pokemon-list').scrollTop(0);
        PokedexHelper.navigateIndex(1);
        PokedexHelper.filteredList(PokedexHelper.getList());
    }

    public static getList(): Array<Record<string, any>> {
        const filter: Record<string, any> = PokedexHelper.getFilters();

        const highestEncountered = App.game.statistics.pokemonEncountered.highestID;
        const highestDefeated = App.game.statistics.pokemonDefeated.highestID;
        const highestCaught = App.game.statistics.pokemonCaptured.highestID;
        const highestDex = Math.max(highestEncountered, highestDefeated, highestCaught);

        return pokemonList.filter((pokemon) => {
            // Checks based on caught/shiny status
            const alreadyCaught = App.game.party.alreadyCaughtPokemon(pokemon.id);
            const alreadyCaughtShiny = App.game.party.alreadyCaughtPokemon(pokemon.id, true);

            // If the Pokemon shouldn't be unlocked yet
            const nativeRegion = PokemonHelper.calcNativeRegion(pokemon.name);
            if (nativeRegion > GameConstants.MAX_AVAILABLE_REGION || nativeRegion == GameConstants.Region.none) {
                return false;
            }

            // If not showing this region
            const region: (GameConstants.Region | null) = filter.region ? parseInt(filter.region, 10) : null;
            if (region != null && region != nativeRegion) {
                return false;
            }

            // Event Pokemon
            if (pokemon.id <= 0 && !alreadyCaught) {
                return false;
            }

            // If we haven't seen a pokemon this high yet
            if (pokemon.id > highestDex) {
                return false;
            }

            // Check if the name contains the string
            if (filter.name && !pokemon.name.toLowerCase().includes(filter.name.toLowerCase().trim())) {
                return false;
            }

            // Check if either of the types match
            const type1: (PokemonType | null) = filter.type1 ? parseInt(filter.type1, 10) : null;
            const type2: (PokemonType | null) = filter.type2 ? parseInt(filter.type2, 10) : null;
            if ([type1, type2].includes(PokemonType.None)) {
                const type = (type1 == PokemonType.None) ? type2 : type1;
                if (!PokedexHelper.isPureType(pokemon, type)) {
                    return false;
                }
            } else if ((type1 != null && !(pokemon as PokemonListData).type.includes(type1)) || (type2 != null && !(pokemon as PokemonListData).type.includes(type2))) {
                return false;
            }

            // Alternate forms that we haven't caught yet
            if (!alreadyCaught && pokemon.id != Math.floor(pokemon.id)) {
                return false;
            }

            // Only uncaught
            if (filter['caught-shiny'] == 'uncaught' && alreadyCaught) {
                return false;
            }

            // All caught
            if (filter['caught-shiny'] == 'caught' && !alreadyCaught) {
                return false;
            }

            // Only caught not shiny
            if (filter['caught-shiny'] == 'caught-not-shiny' && (!alreadyCaught || alreadyCaughtShiny)) {
                return false;
            }

            // Only caught shiny
            if (filter['caught-shiny'] == 'caught-shiny' && !alreadyCaughtShiny) {
                return false;
            }

            // Only pokemon with a hold item
            if (filter['held-item'] && !BagHandler.displayName((pokemon as PokemonListData).heldItem)) {
                return false;
            }

            // Only pokemon with gender differences
            if (filter['gender-diff'] && !(pokemon as PokemonListData).hasFemaleDifference) {
                return false;
            }

            return true;
        });
    }

    private static getFilters() {
        const res: Record<string, any> = {};
        res.name = $('#nameFilter').val();
        res.type1 = $('#pokedex-filter-type1').val();
        res.type2 = $('#pokedex-filter-type2').val();
        res.region = $('#pokedex-filter-region').val();
        res['caught-shiny'] = $('#pokedex-filter-shiny-caught').val();
        res['held-item'] = $('#pokedex-filter-held-item').is(':checked');
        res['gender-diff'] = $('#pokedex-filter-gender-diff').is(':checked');
        return res;
    }

    public static getImage(id: number, isFemale = false) {
        const pokemon = PokemonHelper.getPokemonById(id);
        let src = 'assets/images/';
        if (App.game.party.alreadyCaughtPokemon(id, true) && this.toggleAllShiny()) {
        //if (App.game.party.alreadyCaughtPokemon(id, true) && Settings.getSetting('shinyPokedex').observableValue()) {
            src += 'shiny';
        }

        let genderString = '';
        if (isFemale || this.toggleFemale() && pokemon.hasFemaleDifference) {
            genderString = '-f';
        }

        src += `pokemon/${id}${genderString}.png`;
        return src;
    }

    public static getImageStatistics(id: number, isFemale = false) {
        let src = 'assets/images/';
        if (App.game.party.alreadyCaughtPokemon(id, true) && this.toggleStatisticShiny()) {
            src += 'shiny';
        }

        let genderString = '';
        if (isFemale) {
            genderString = '-f';
        }

        src += `pokemon/${id}${genderString}.png`;
        return src;
    }

    public static getGenderTypeTooltip(pokemon, isFemale = false) {
        let genderTooltip = '';
        const genderless = pokemon.genderType === GameConstants.GENDERLESS;
        const maleFemale = pokemon.genderType === GameConstants.MALE_FEMALE;
        const maleOnly = pokemon.genderType === GameConstants.MALE_ONLY;
        const femaleOnly = pokemon.genderType === GameConstants.FEMALE_ONLY;
        if (pokemon.id === 169) {
            genderTooltip = 'Gigachad';
        } else if (genderless) {
            genderTooltip = 'Genderless';
        } else if (maleFemale && !pokemon.hasFemaleDifference) {
            genderTooltip = 'Male/Female';
        } else if (maleOnly || (maleFemale && !isFemale)) {
            genderTooltip = 'Male';
        } else if (femaleOnly || (maleFemale && isFemale)) {
            genderTooltip = 'Female';
        }
        if (maleOnly || femaleOnly) {
            genderTooltip += ' only';
        }
        return genderTooltip;
    }

    public static getGenderRatioText(pokemon, isFemale = false) {
        const genderType = pokemon.genderType;
        const genderRatio = pokemon.genderRatio;
        let genderRatioMale = '';
        let genderRatioFemale = '';
        console.log(pokemon);
        if (genderType === GameConstants.MALE_ONLY) {
            genderRatioMale = '100';
            genderRatioFemale = '0';
        } else if (genderType === GameConstants.FEMALE_ONLY) {
            genderRatioMale = '0';
            genderRatioFemale = '100';
        } else {
            switch (genderRatio) {
                case GameConstants.MALE_12_5:
                    genderRatioMale = '12.5';
                    genderRatioFemale = '87.5';
                    break;
                case GameConstants.MALE_25:
                    genderRatioMale = '25';
                    genderRatioFemale = '75';
                    break;
                case GameConstants.MALE_50:
                    genderRatioMale = '50';
                    genderRatioFemale = '50';
                    break;
                case GameConstants.MALE_75:
                    genderRatioMale = '75';
                    genderRatioFemale = '25';
                    break;
                case GameConstants.MALE_87_5:
                    genderRatioMale = '87.5';
                    genderRatioFemale = '12.5';
                    break;
                default:
            }
        }
        return !isFemale ? genderRatioMale : genderRatioFemale;
    }

    public static toggleStatisticShinyOnModalOpen() {
        //if (Settings.getSetting('shinyPokedex').observableValue()) {
        //    this.toggleStatisticShiny(true);
        //} else {
            this.toggleStatisticShiny(false);
        //}
    }

    private static isPureType(pokemon: PokemonListData, type: (PokemonType | null)): boolean {
        return (pokemon.type.length === 1 && (type == null || pokemon.type[0] === type));
    }
}

$(document).ready(() => {
    $('#pokemonStatisticsModal').on('hidden.bs.modal', () => {
        //if (Settings.getSetting('shinyPokedex').observableValue()) {
        //    PokedexHelper.toggleStatisticShiny(true);
        //} else {
            PokedexHelper.toggleStatisticShiny(false);
        //}
    });
    $('#pokemon-list').on('scroll', () => {
        const scrollY = $('#pokemon-list').scrollTop();
        const divHeight = $('#pokemon-elements').height();
        if (scrollY >= divHeight - 500) {
            PokedexHelper.addPokemonItem();
        }

    });
    $('#pokedexModal').on('hidden.bs.modal', () => {
        PokedexHelper.navigateIndex(1);
    });
    $('#pokedex-filter-show-all').on('click', () => {
        $('#pokemon-list').scrollTop(0);
        if ($('#pokedex-filter-show-all').is(':checked')) {
            PokedexHelper.showAllPokemon(true);
        }
        else {
            PokedexHelper.navigateIndex(1);
            PokedexHelper.showAllPokemon(false);
        }
        
    });
});

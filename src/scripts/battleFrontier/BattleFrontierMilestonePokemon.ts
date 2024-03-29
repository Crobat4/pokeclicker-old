class BattleFrontierMilestonePokemon extends BattleFrontierMilestone {
    pokemonName: string;

    constructor (stage: number, pokemonName: string, image = `assets/images/items/pokemonItem/${pokemonName}.png`) {
        super(
            stage,
            () => {
                App.game.party.gainPokemonById(pokemonMap[pokemonName].id);
            },
            image,
            pokemonName
        );
    }
}

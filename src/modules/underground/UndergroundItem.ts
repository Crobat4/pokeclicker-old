import UndergroundItemValueType from '../enums/UndergroundItemValueType';
import Requirement from '../requirements/Requirement';
import { StoneType } from '../GameConstants';

export default class UndergroundItem {
    public space: Array<Array<any>>;
    public type?: number;

    constructor(
        public name: string,
        public id: number,
        space: Array<Array<number>>,
        public value = 1,
        public valueType = UndergroundItemValueType.Diamond,
        public requirement?: Requirement,
    ) {
        // Map out our item sizing
        this.space = space.map((r, y) => r.map((v, x) => ({
            sizeX: r.length,
            sizeY: space.length,
            x,
            y,
            value: v ? this.id : 0,
            rotations: 0,
        })));
    }

    public isUnlocked(): boolean {
        return this.requirement ? this.requirement.isCompleted() : true;
    }

    get displayName() {
        return this.name;
    }

    get image() {
        switch (this.valueType) {
            case UndergroundItemValueType.EvolutionItem:
                return `assets/images/items/evolution/${StoneType[this.type]}.png`;
            case UndergroundItemValueType.Fossil:
                return `assets/images/breeding/${this.name}.png`;
            default:
                return `assets/images/items/underground/${this.name}.png`;
        }
    }

    get undergroundImage() {
        return `assets/images/underground/${this.name}.png`;
    }
}

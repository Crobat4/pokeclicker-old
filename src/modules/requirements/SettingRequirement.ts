import Settings from '../settings';
import { AchievementOption } from '../GameConstants';
import Requirement from './Requirement';
// import BooleanSetting from '../settings/BooleanSetting';

export default class SettingRequirement extends Requirement {
    public setting: number;
    public value: number;
    constructor(setting: number, option: AchievementOption = AchievementOption.equal) {
        super(1, option);
        this.setting = setting;
    }

    public getProgress() {
        if (Settings.getSetting('addEggExclusiveToWild').observableValue()) {
            this.value = 1;
        } else {
            this.value = 0;
        }
        // console.log(this.value);
        return this.value;
    }

    // eslint-disable-next-line class-methods-use-this
    public hint(): string {
        return 'Requires to enable the respective setting.';
    }
}

import {
    Alert,
    Linking,
    Platform,
    BackHandler,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Toast from '@remobile/react-native-toast';
import { DownloadHelper } from '@qudian_mobile/qd-react-native-tool-kit';

const CHOICE_TYPE = {
    OK: 'ok',
    CANCLE: 'cancel',
    REMINDE_ME_LATER: 'remind_me_later',
};

export default class UpgradeHelper {

    constructor() {

    }

    version = '';
    forceUpdate = false;
    url = '';
    message = '';

    /**
     * 检查更新
     * @param {func} requestFuncPromise 请求是否有更新的异步方法
     * @param {bool} manually 是否是手动检查更新
     */
    checkUpdates(requestFuncPromise, manually = false) {
        requestFuncPromise().then((data) => {
            if (data.has_new) {
                this.version = data.version;
                this.forceUpdate = data.force_update;
                this.url = data.url;
                if (data.message) {
                    this.message = data.message;
                }
                // 检查版本号是否最新
                if (DeviceInfo.getVersion() !== data.version) {
                    // 检查用户是否拒绝过升级
                    storage.load({ 
                        key: this.generateVersionChoiceKey(),
                    }).then((ret) => {
                        if (ret === CHOICE_TYPE.REMINDE_ME_LATER || manually) {
                            this.showAlert();
                        }
                    }).catch((err) => {
                        if (err.name === 'NotFoundError') {
                            this.showAlert();
                        }
                    })
                }
            }
        }).catch(e =>{
            console.warn('检查更新失败', e)
        });
    }

    showAlert() {
        let options = [
            {text: '取消', onPress: () => {
                this.rememberChoice(CHOICE_TYPE.CANCLE);
            }},
            {text: '下次提醒我', onPress: () => {
                this.rememberChoice(CHOICE_TYPE.REMINDE_ME_LATER);
            }, style: 'cancel'},
            {text: '好的', onPress: () => {
                this.doUpgrade();
            }},
        ];
        if (this.forceUpdate) {
            options = [
                {text: '好的', onPress: () => {
                    this.doUpgrade();
                }},
            ];
        }
        let message = `检测到新版本${this.version}，是否前往升级？`;
        if (this.message !== '') {
            message = this.message;
        }
        Alert.alert('升级', message, options , { 
            cancelable: true, 
            onDismiss: () => {
                if (this.forceUpdate) {
                    Toast.showLongCenter('必须更新才可以使用App！');
                    setTimeout(() => {
                        BackHandler.exitApp();
                    }, 1000);
                } else {
                    this.rememberChoice(CHOICE_TYPE.CANCLE);
                }
            }
        });
    }

    doUpgrade() {
        if (this.url === '') {
            return;
        }
        if (Platform.OS === 'android') {
            // 下载
            DownloadHelper.download(this.url);
        } else {
            // 跳转AppStore
            Linking.openURL(this.url);
        }
    }

    rememberChoice(type) {
        storage.save({
            key: this.generateVersionChoiceKey(),
            data: type,
        });
    }

    forgetChoice() {
        storage.remove({
            key: this.generateVersionChoiceKey(),
        });
    }

    generateVersionChoiceKey() {
        return `choiceForVersion${this.version}`;
    }
}
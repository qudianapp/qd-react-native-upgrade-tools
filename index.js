import React from 'react';
import {
    Alert,
    Linking,
    AsyncStorage,
    Platform,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Storage from 'react-native-storage';

const CHOICE_TYPE = {
    OK: 'ok',
    CANCLE: 'cancel',
    REMINDE_ME_LATER: 'remind_me_later',
};

const STORAGE_KEY = 'last_choice';

export default class UpgradeHelper {

    constructor() {

    }

    newVersion = '';
    forceUpdate = false;
    url = '';
    message = '';

    /**
     * 检查更新
     * @param {func} requestFuncPromise 请求是否有更新的异步方法
     */
    checkUpdates(requestFuncPromise) {
        requestFuncPromise().then((data) => {
            if (data.has_new) {
                this.newVersion = data.version;
                this.forceUpdate = data.force_update;
                if (data.message) {
                    this.message = data.message;
                }
                // 检查版本号是否最新
                if (DeviceInfo.getVersion() !== data.version) {
                    // 检查用户是否拒绝过升级
                    storage.load({ 
                        key: STORAGE_KEY,
                    }).then((ret) => {
                        if (ret === CHOICE_TYPE.REMINDE_ME_LATER) {
                            this.showAlert();
                        }
                    }).catch(() => {
                        this.showAlert();
                    })
                }
            }
        }).catch(e =>{
            console.warn('检查更新失败')
        });
    }

    showAlert() {
        let options = [
            {text: '取消', onPress: () => {
                this.forgetChoice();
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
        Alert.alert('升级', message, options , { cancelable: this.forceUpdate });
    }

    doUpgrade() {
        if (Platform.OS === 'android') {
            // 下载
        } else {
            // 跳转AppStore
        }
    }

    rememberChoice(type) {
        storage.save({
            key: STORAGE_KEY,
            data: type,
        });
    }

    forgetChoice(type) {
        storage.remove({
            key: STORAGE_KEY,
        });
    }
}
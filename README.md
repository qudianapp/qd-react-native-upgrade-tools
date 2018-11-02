# qd-react-native-upgrade-tools
tools for native upgrade
## Getting started

`$ npm install @qudian_mobile/qd-react-native-upgrade-tools --save`
```
react-native link react-native-device-info
react-native link prop-types
react-native link @remobile/react-native-toast
react-native link @qudian_mobile/qd-react-native-tool-kit
```

## Usage
```javascript
import UpgradeHelper from '@qudian_mobile/qd-react-native-upgrade-tools';

_checkUpdates() {
        new UpgradeHelper().checkUpdates(() => {
            return new Promise((resolve, reject) => {
          				// maybe resolve from your network fetch
                        resolve({
                            has_new: true,
                            version: '1.1.1',
                            force_update: false,
                            url: '',
                            message: '',
                        });
                })
            })
        })
    }


```
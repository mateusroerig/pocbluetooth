import React, {useEffect} from 'react';
import {Platform, PermissionsAndroid} from 'react-native';
import MainScreen from './src/screens/MainScreen';
import BleManager from 'react-native-ble-manager';

const App = () => {
  useEffect(() => {
    BleManager.start().then(() => console.log('Module initialized'));

    if (Platform.OS === 'android') {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ).then((result) => {
        if (result) {
          console.log('Permission is OK');
        } else {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ).then((result) => {
            if (result) {
              console.log('User accept');
            } else {
              console.log('User refuse');
            }
          });
        }
      });
    }
  }, []);

  return (
    <>
      <MainScreen />
    </>
  );
};

export default App;

import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Text,
  TouchableOpacity,
  NativeModules,
  NativeEventEmitter,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import BleManager, {connect} from 'react-native-ble-manager';

const {width, height} = Dimensions.get('window');

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const MainScreen = () => {
  const [data, setData] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [scan, setScan] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [writing, setWriting] = useState(false);

  let peripherals = new Map();

  useEffect(() => {
    bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      handleDiscoverPeripheral,
    );
    bleManagerEmitter.addListener(
      'BleManagerConnectPeripheral',
      handleConnectPeripheral,
    );
    bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan);
    bleManagerEmitter.addListener(
      'BleManagerDisconnectPeripheral',
      handleDisconnectPeripheral,
    );
  });

  const handleDisconnectPeripheral = (args) => {
    setSelectedId(null);
  };

  const handleDiscoverPeripheral = (peripheral) => {
    console.log(peripheral);

    if (!peripheral.name) {
      peripheral.name = 'NO NAME';
    }

    peripherals.set(peripheral.id, peripheral);
  };

  const handleStopScan = () => {
    setScan(false);
    setData(Array.from(peripherals.values()));
  };

  const handleConnectPeripheral = (peripheral) => {
    BleManager.connect(selectedId);
  };

  const connect = async () => {
    if (selectedId) {
      setConnecting(true);
      await BleManager.connect(selectedId)
        .then(() => {
          console.log('Connected');
        })
        .catch((error) => {
          Alert.alert('Aviso', error);
        });
      await BleManager.retrieveServices(selectedId);
    } else {
      Alert.alert('Aviso', 'Nenhum dispositivo selecionado');
    }
    setConnecting(false);
  };

  const search = async () => {
    setScan(true);
    peripherals.clear();
    await BleManager.scan([], 3, true).then(() => console.log('Scan started'));
  };

  const write = async () => {
    setWriting(true);
    await BleManager.writeWithoutResponse(selectedId, 'FFE0', 'FFE1', [
      18,
      96,
      178,
      21,
      72,
      132,
      31,
    ])
      .then(() => {
        console.log('Writed');
      })
      .catch((error) => {
        Alert.alert('Aviso', 'Nenhum dispositivo conectado');
      });
    setWriting(false);
  };

  const Item = ({item, backgroundColor}) => {
    const onPress = () => setSelectedId(item.id);

    return (
      <TouchableOpacity onPress={onPress}>
        <View style={[styles.item, {backgroundColor: backgroundColor}]}>
          <Text style={styles.itemFont}>{item.name}</Text>
          <Text style={styles.itemFont}>{item.id}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        contentContainerStyle={{flex: 1}}
        data={data}
        renderItem={({item}) => {
          const backgroundColor =
            item.id === selectedId ? 'springgreen' : 'transparent';

          return <Item item={item} backgroundColor={backgroundColor} />;
        }}
        keyExtractor={(item, index) => item.id}
        extraData={selectedId}
        ListEmptyComponent={() => {
          return (
            <View style={styles.emptyContainer}>
              <Text style={styles.itemFont}>Nenhum dispositivo</Text>
            </View>
          );
        }}
      />
      <View style={styles.buttonContainer}>
        <Button title="Scannear" onPress={search} loading={scan} />
        <Button title="Conectar" onPress={connect} loading={connecting} />
        <Button title="Enviar" onPress={write} loading={writing} />
      </View>
    </SafeAreaView>
  );
};

const Button = ({title, onPress, loading}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.button}>
        {loading ? (
          <ActivityIndicator color={'white'} />
        ) : (
          <Text style={{color: 'white'}}>{title}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'lightgrey',
    height: height * 0.1,
    borderTopRightRadius: 5,
    borderTopLeftRadius: 5,
  },
  item: {
    flexDirection: 'row',
    padding: 15,
    justifyContent: 'space-between',
    borderColor: 'lightgrey',
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    marginHorizontal: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  itemFont: {
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'dodgerblue',
    padding: 15,
    borderRadius: 5,
    width: width * 0.25,
    alignItems: 'center',
  },
});

export default MainScreen;

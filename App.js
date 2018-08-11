import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import GPSState from 'react-native-gps-state';
import MapView, { Marker } from 'react-native-maps';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = 0;
const LONGITUDE = 0;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const currentLocationImage = require('./images/currentLocation.png');

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      goSearch: false,
      indicator: false,
    };
  }

  componentDidMount = () => {
    this.reqPermission();
  }

  componentWillUnmount = () => {
    navigator.geolocation.clearWatch(this.watchID);
  }

  reqPermission() {
    GPSState.getStatus().then((status) => {
      switch (status) {
        case GPSState.NOT_DETERMINED:
          Alert.alert(
            'No location provider available',
            'We need the GPS to locate your location, Please activate your GPS',
            [
              { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
              { text: 'OK', onPress: () => GPSState.openSettings() },
            ],
            { cancelable: false },
          );
          break;
        case GPSState.RESTRICTED:
          Alert.alert(
            'No location provider available',
            'We need the GPS to locate your location, Please activate your GPS',
            [
              { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
              {
                text: 'OK',
                onPress: () => {
                  GPSState.openSettings();
                  this.findMe();
                },
              },
            ],
            { cancelable: false },
          );
          break;
        case GPSState.DENIED:
          Alert.alert(
            'No location provider available',
            'We need the GPS to locate your location, Please activate your GPS',
            [
              { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
              {
                text: 'OK',
                onPress: () => {
                  GPSState.openSettings();
                  this.findMe();
                },
              },
            ],
            { cancelable: false },
          );
          break;
        case GPSState.AUTHORIZED_ALWAYS:
          this.findMe();
          break;

        case GPSState.AUTHORIZED_WHENINUSE:
          // TODO do something amazing with you app
          break;
        default:
          break;
      }
    });
  }

  findMe() {
    this.setState({ indicator: true });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;
        console.log(coords);
        this.setState({
          region: {
            latitude,
            longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.001,
          },
        });
        this.setState({ indicator: false });
      },
      (error) => {
        console.log('find me :', error);
        if (error.code === 2) {
          Alert.alert(
            'No location provider available',
            'Please activate your GPS',
            [
              { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
              { text: 'OK', onPress: () => GPSState.openSettings() },
            ],
            { cancelable: false },
          );
        }
        this.setState({ indicator: false });
      },
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 10000 }
    );
  }

  renderSearch() {
    const { goSearch, region } = this.state;
    return (
      <GooglePlacesAutocomplete
        placeholder='ابحث عن مكان'
        minLength={2}
        autoFocus={goSearch}
        returnKeyType='default'
        fetchDetails
        onPress={(data, details = null) => {
          console.log('onPress: ', data, details);
          this.setState({
            region: {
              latitude: details.geometry.location.lat,
              longitude: details.geometry.location.lng,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            },
            goSearch: false,
          });
        }}
        query={{
          key: 'AIzaSyAElqBdvFRRFtMctfle0oyyXxE9wOXUD6U',
          language: 'ar',
        }}
        styles={{
          textInputContainer: {
            backgroundColor: 'white',
            // marginHorizontal: 20,
            borderRadius: 12,
            height: 45,
            width: '100%',
          },
          textInput: {
            marginLeft: 0,
            marginRight: 0,
            height: 40,
            color: '#5d5d5d',
            fontSize: 16,
          },
          listView: {
            backgroundColor: 'white',
            width: '100%',
            height: goSearch ? height * 0.25 : 0,
            // marginHorizontal: 20,
            borderBottomRightRadius: 12,
            borderBottomLeftRadius: 12,
          },
        }}
        nearbyPlacesAPI='GooglePlacesSearch'
        debounce={200}
      />
    );
  }

  render() {
    const { goSearch, indicator, region } = this.state;
    console.log('region :',region);
    
    const hitSlop = {
      top: 15,
      bottom: 15,
      left: 15,
      right: 15,
    };
    return (
      <View style={{ flex: 1 }}>
        <MapView
          style={styles.container}
          showsUserLocation
          showsMyLocationButton={false}
          region={region}
          onPress={(e) => {
            console.log('map press :', e.nativeEvent);
            this.setState({
              region: {
                latitude: e.nativeEvent.coordinate.latitude,
                longitude: e.nativeEvent.coordinate.longitude,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
              },
              goSearch: false,
            });
          }
          }
        >
          <Marker
            draggable
            coordinate={region}
            onDragEnd={(e) => {
              this.setState({
                goSearch: false,
                region: {
                  latitude: e.nativeEvent.coordinate.latitude,
                  longitude: e.nativeEvent.coordinate.longitude,
                  latitudeDelta: LATITUDE_DELTA,
                  longitudeDelta: LONGITUDE_DELTA,
                },
              });
            }}
          />

        </MapView>
        <View style={styles.searchLocationContainer}>
          {goSearch ? this.renderSearch() : (
            <TouchableOpacity
              onPress={() => {
                this.setState({ goSearch: true });
              }}
              style={styles.searchLocationButton}
            >
              <Text style={styles.searchLocationText}>
                ابحث عن مكان
              </Text>
            </TouchableOpacity>)}
        </View>

        <View style={styles.findMeView}>
          {indicator ? <ActivityIndicator size='large' /> : (
            <TouchableOpacity
              hitSlop={hitSlop}
              activeOpacity={0.4}
              style={styles.mapButton}
              onPress={() => this.findMe()}
            >
              <Image source={currentLocationImage} style={styles.currentLocationImage} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.completeView}>
          <View style={{ width: '50%', height: '100%'}}>
            <Text style={styles.completeText}>
              {region.latitude}
            </Text>
          </View>
          <View style={{ width: '50%', height: '100%', borderLeftWidth: 1, borderColor: 'grey'}}>
            <Text style={styles.completeText}>
              {region.longitude}
            </Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    flex: 1,
    zIndex: 1 ,
  },
  completeSection: {
    width,
    borderTopWidth: 0.5,
    borderColor: "#e4e4e4",
    backgroundColor: 'transparent',
  },
  findMeView: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    backgroundColor: 'transparent',
    alignItems: 'center',
    zIndex: 5,
  },
  mapButton: {
    width: 50,
    height: 50,
    borderRadius: 85 / 2,
    backgroundColor: 'rgba(252, 253, 253, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'black',
    shadowRadius: 8,
    shadowOpacity: 0.12,
    opacity: 0.9,
    zIndex: 5,
  },
  searchLocationContainer: {
    width: '90%',
    alignSelf: 'center',
    position: 'absolute',
    top: 20,
    zIndex: 5,
    backgroundColor: 'transparent',
  },
  searchLocationButton: {
    backgroundColor: 'white',
    height: 45,
    // marginHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
  },
  searchLocationText: {
    fontSize: 18,
    fontWeight: '400',
    fontStyle: 'normal',
    lineHeight: 30,
    letterSpacing: 0,
    textAlign: 'right',
    padding: 20,
  },
  completeView: {
    height: 45,
    width: width * 0.9,
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 6,
    borderRadius: 12,
    position: 'absolute',
    bottom: 20,
    zIndex: 5,
    backgroundColor: 'white',
    flexDirection: 'row',

  },
  completeText: {
    fontSize: 18,
    fontWeight: "600",
    fontStyle: "normal",
    lineHeight: 30,
    letterSpacing: 0,
    textAlign: "center",
    color: 'grey'
  },
  currentLocationImage: {
    width: 30,
    height: 30,
  }
});
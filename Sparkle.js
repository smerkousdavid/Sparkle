import React from 'react';
import {
  StyleSheet,
  ScrollView,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  AsyncStorage
} from 'react-native';

import BackgroundTimer from 'react-native-background-timer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import update from 'immutability-helper';
import tinycolor from 'tinycolor2';
import * as Animatable from 'react-native-animatable';

import {
  HueSlider,
  SaturationSlider,
  LightnessSlider
} from 'react-native-color';

const API_URL = 'http://192.168.1.100:7777';
const FAVORITES = 'sparkle:favorites';
const AUTO_ROTATE_MS = 15000;

export default class Sparkle extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      color: null,
      favorites: ['#247ba0', '#70c1b3', '#b2dbbf', '#f3ffbd', '#ff1654'],
      autoRotate: false
    };

    this.lastUpdate = 0;

    this.updateColorBind = this.updateColor.bind(this);
    this.updateHueBind = this.updateHue.bind(this);
    this.updateSaturationBind = this.updateSaturation.bind(this);
    this.updateLightnessBind = this.updateLightness.bind(this);
    this.toggleAutoRotateBind = this.toggleAutoRotate.bind(this);
  }

  componentDidMount() {
    StatusBar.setBackgroundColor(colors.primary);
    this.getLatestColor();

    this.colorChecker = BackgroundTimer.setInterval(() => {
      if(new Date().getMilliseconds() - this.lastUpdate > 3000) {
        this.getLatestColor();
      } 
    }, 5000);

    AsyncStorage.getItem(FAVORITES).then(value => {
      if(value !== null) {
        this.setState({
          favorites: JSON.parse(value) 
        });
      }
    });
  }

  componentWillUnmount() {
    if(this.colorChecker) BackgroundTimer.clearInterval(this.colorChecker);
    if(this.autoRotate) BackgroundTimer.clearInterval(this.autoRotate);
  }

  getLatestColor() {
    this.getColor().then(data => {
      const color = tinycolor(data);
      if(data !== null && color.isValid() ) {
        this.setState({ color: color.toHsl() });
        StatusBar.setBackgroundColor(color.toHexString());
      } else {
        console.log('the received color', data, 'is invalid');
      }
    }).catch(err => {
      console.log('failed to fetch the color', err);
    });
  }

  updateColor() {
    this.lastUpdate = new Date().getMilliseconds();
    const color = tinycolor(this.state.color);
    if(color.isValid()) {
      const hexValue = color.toHexString();
      StatusBar.setBackgroundColor(hexValue);
      this.setColor(hexValue).catch(err => {
        console.log('failed to update the remote light colors', err);
      });
    }
  }

  updateHue(h) {
    this.setState({ color: { ...this.state.color, h } }, this.updateColorBind);
  }

  updateSaturation(s) {
    this.setState({ color: { ...this.state.color, s } }, this.updateColorBind);
  }

  updateLightness(l) {
    this.setState({ color: { ...this.state.color, l } }, this.updateColorBind);
  }

  baseRequest(path) {
    return fetch(API_URL + path);
  }

  getColor() {
    return this.baseRequest('/get').then(response => {
      if(response.status !== 200) {
        console.log('received a non 200 status code from the lights');
        return null;
      }
      return response.text();
    });
  }

  setColor(color, update) {
    if(update) this.setState({ color: tinycolor(color).toHsl() });
    return this.baseRequest('/set?c=' + color.replace('#', '').substring(0, 6)).then(response => { 
      if(response.status !== 200) {
        console.log('received a non 200 status code from the lights');
        return null;
      }
      return response.text();
    });
  }
  
  addFavorite(color) {
    if(this.state.favorites.indexOf(color) !== -1) {
      console.log('attempted to add already favorited color'); 
      return;
    }
    try {
      this.setState({
        favorites: update(this.state.favorites, {$push: [color]})
      }, () => AsyncStorage.setItem(FAVORITES, JSON.stringify(this.state.favorites)));
    } catch(err) {
      console.log('failed to add favorite', err);
    }
  }

  removeFavorite(color) {
    if(this.state.favorites.indexOf(color) === -1) {
      console.log('attempted to remove non existent color');
      return;
    }

    this.state.favorites.map((val, ind) => {
      if(val === color) {
        this.setState({
          favorites: update(this.state.favorites, {$splice: [[ind, 1]]})
        }, () => AsyncStorage.setItem(FAVORITES, JSON.stringify(this.state.favorites)));
      }
    });
  }

  toggleAutoRotate() {
    if(this.autoRotate !== null) {
      BackgroundTimer.clearInterval(this.autoRotate);

      this.autoRotate = null;
      this.setState({ autoRotate: false });
    } else {
      if(this.state.favorites.length === 0) {
        console.log('there are no favorites to rotate through');
        return;
      }

      let rotateIndex = 0;
      if(tinycolor(this.state.color).toHexString().startsWith("#000000")) {
        this.setColor(this.state.favorites[rotateIndex++ % this.state.favorites.length], true);
      }
      
      this.autoRotate = BackgroundTimer.setInterval(() => {
        this.setColor(this.state.favorites[rotateIndex++ % this.state.favorites.length], true);
      }, AUTO_ROTATE_MS);

      this.setState({ autoRotate: true });
    }
  }

  render() {
    const { color, favorites, autoRotate } = this.state;
    return (
      <View style={styles.container}>
      {color ? null : <Text style={{fontSize: 20, paddingBottom: 20}}>Connecting...</Text>}
      {color ?
        <View style={{flex: 1, width: '100%', padding: 0, marginBottom: 0}}>
          <View style={[styles.colorHeader, {backgroundColor: tinycolor(this.state.color).toHslString()}]}>
            <Text style={{textAlign: 'center', marginTop: 10, fontSize: 50, color: tinycolor(this.state.color).isLight() ? '#222222' : '#CCCCCC'}}>Sparkle</Text>
            <TouchableOpacity
              onPress={() => this.setColor('#000000', true)}
              style={{position: 'absolute', bottom: 15, right: 13}}>
              <Icon name="lightbulb" size={20} style={{color: tinycolor(this.state.color).isLight() ? '#222222' : '#CCCCCC'}} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.sliderRow}>Hue</Text>
            <HueSlider
              style={styles.sliderRow}
              gradientSteps={40}
              value={color.h}
              onValueChange={this.updateHueBind} />
            
            <Text style={styles.sliderRow}>Saturation</Text>
            <SaturationSlider
              style={styles.sliderRow}
              gradientSteps={20}
              value={color.s}
              color={color}
              onValueChange={this.updateSaturationBind} />

            <Text style={styles.sliderRow}>Lightness</Text>
            <LightnessSlider
              style={styles.sliderRow}
              gradientSteps={20}
              value={color.l}
              color={color}
              onValueChange={this.updateLightnessBind} />
          </ScrollView>

          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{flexDirection: 'row'}}>
              <Text style={[styles.sliderRow, {padding: 3, marginBottom: 5}]}>Favorites</Text>
              <TouchableOpacity
                onPress={this.toggleAutoRotateBind}
                style={[styles.sliderRow, {flexDirection: 'row', padding: 3}]}>
                <Icon name={autoRotate ? 'checkbox-marked' : 'checkbox-blank-outline'} size={18} />
                <Text style={{paddingLeft: 5}}>Auto rotate</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => this.addFavorite(tinycolor(this.state.color).toHexString())}
              style={[styles.sliderRow, {marginRight: 10, padding: 3}]}>
              <Text style={{fontWeight: 'bold'}}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal={true} contentContainerStyle={{padding: 5, margin: 5, borderRadius: 10}}>
            {favorites.map((recent, key) => 
              <TouchableOpacity
                key={key}
                onPress={() => this.setState({ color: tinycolor(recent).toHsl() }, this.updateColorBind)}
                onLongPress={() => this.removeFavorite(recent)}
                style={{width: 50, height: 50, backgroundColor: recent, margin: 10, padding: 5, borderRadius: 8}} />
            )}
          </ScrollView>
        </View> :
        <Animatable.View
          animation="rotate"
          easing="ease-in-out"
          iterationCount="infinite">
          <Icon name="loading" size={50} />
        </Animatable.View>
      }  
      </View>
    );
  }
}

const colors = {
  primary: '#FFFFFF'
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 0,
    marginBottom: 0
  },
  colorHeader: {
    margin: 0,
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column'
  },
  content: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingHorizontal: 32,
    paddingBottom: 32
  },
  sliderRow: {
    alignSelf: 'stretch',
    marginLeft: 12,
    marginTop: 12
  },
});
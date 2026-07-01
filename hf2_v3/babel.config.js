module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // NativeWind NOT used — pure StyleSheet. 
      // babel-preset-expo only; no nativewind/babel (causes react-native-worklets conflict).
      "babel-preset-expo",
    ],
  };
};

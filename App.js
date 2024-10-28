import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet, BackHandler, ActivityIndicator, View, Alert, Image
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// const myLink = 'https://organic-verified-hedgehog.ngrok-free.app';
const myLink = 'https://plsmind.com';


export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(myLink); // Your domain
  const webviewRef = useRef(null);

  useEffect(() => {
    // Simulate a splash screen delay
    setTimeout(async () => {
      await SplashScreen.hideAsync();
      setIsAppReady(true);
    }, 3000);
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (webviewRef.current && canGoBack) {
        webviewRef.current.goBack();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [canGoBack]);

  const handleWebViewMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'push-notification') {
      Notifications.scheduleNotificationAsync({
        content: {
          title: data.title || 'Notification',
          body: data.body || 'PLS Mind Notification',
          sound: true,
        },
        trigger: { seconds: 2 },
      });
    }
  };

  const isInternalLink = (url) => {
    return url.startsWith(myLink); // Restrict to your domain
  };

  const onShouldStartLoadWithRequest = (request) => {
    if (isInternalLink(request.url)) {
      return true; // Allow the link to load
    } else {
      Alert.alert(
        'External Link Blocked',
        'For Privacy of users.',
        [{ text: 'OK' }]
      );
      return false; // Block external links
    }
  };

  if (!isAppReady) {
    return (
      <View style={styles.splashContainer}>
        <Image source={require('./assets/splash.png')} style={styles.splashImage} />
      </View>
    );
  }

  const injectedJavaScript = `
  
  if(document.querySelector(".open_t")){
    var open_t = document.querySelector(".open_t");
    open_t.onclick = function(){
      window.history.back();
    }
  }
  var mxa = document.querySelectorAll("a");
  for(var ix = 0; ix <mxa.length; ix++){
    
    mxa[ix].target = "_self";
  }
  const installPrompt = document.getElementById('install-prompt');
  inApp = true;
  installPrompt.style.display = 'none';
  
  if(message == "Product edited successfully." || message == "You have successfully uploaded your product" || message == "Successfully Modified Your Business Account"){
    popup_cart_n.style.display = 'flex';
    
    //push notification
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: 'push-notification',
        title: 'P.L.S Mind Update',
        body: message,
      })
    );
    
                
    setInterval(function(){
        x_time_close ++;
        
        if(x_time_close ==200){
            popup_cart_n.style.display = "none";
            // window.history.back(2);
            window.history.go(-(window.history.length - 1));
            //window.location.href = "{% url 'items:all_seller_product' %}";
            

            
        }
    }, 10);
  }
  
  `;

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#a68c37" />
        </View>
      )}

      <WebView
        ref={webviewRef}
        source={{ uri: currentUrl }}
        injectedJavaScript={injectedJavaScript} // Inject the JavaScript
        javaScriptEnabled
        geolocationEnabled
        domStorageEnabled
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest} // Intercept link clicks
        onMessage={handleWebViewMessage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a68c37',
    paddingBottom: 2,
  },
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#a68c37',
  },
  splashImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 2,
    display: 'none',
  },
});

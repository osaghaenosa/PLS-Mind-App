import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, BackHandler, Alert, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(null);
  const webviewRef = useRef(null); // To reference WebView
  const [canGoBack, setCanGoBack] = useState(false); // To track if we can go back
  //const [currentUrl, setCurrentUrl] = useState('https://organic-verified-hedgehog.ngrok-free.app'); // Set test URL
  const [currentUrl, setCurrentUrl] = useState('https://www.plsmind.com'); // Set initial URL
  // Handle back button press on Android
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

  // Request permissions for camera, location, and notifications
  useEffect(() => {
    (async () => {
      // Camera permissions
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(cameraStatus === 'granted');

      // Location permissions
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(locationStatus === 'granted');

      // Notification permissions
      const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
      setNotificationPermission(notificationStatus === 'granted');

      // Get push token
      if (notificationStatus === 'granted') {
        const token = await Notifications.getExpoPushTokenAsync();
        console.log('Push token:', token);
      }
    })();
  }, []);

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }, []);
  

  // Handle incoming messages from the WebView
  const handleWebViewMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);

    // Handle push notification request from webpage
    if (data.type === 'push-notification') {
      Notifications.scheduleNotificationAsync({
        content: {
          title: data.title || 'Notification',
          body: data.body || 'PLS Mind Notification',
          sound: true,
        },
        trigger: { seconds: 2 }, // Trigger after 2 seconds
      });
    }
  };
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
      <WebView
        ref={webviewRef}
        source={{ uri: currentUrl }} // Load the current URL in WebView
        injectedJavaScript={injectedJavaScript} // Inject the JavaScript
        javaScriptEnabled={true}
        geolocationEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        domStorageEnabled={true}
        onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)} // Track if WebView can go back
        onShouldStartLoadWithRequest={(request) => {
          // Always open the request in the WebView (even if it has target="_blank")
          const isExternalLink = request.url !== currentUrl;
          
          if (isExternalLink) {
            setCurrentUrl(request.url); // Load new URL in the WebView
            return false; // Prevent the external browser from opening
          }

          return true; // Allow other internal requests
        }}
        onMessage={handleWebViewMessage} // Listen for messages from the webpage
      />

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a68c37',
  },
});

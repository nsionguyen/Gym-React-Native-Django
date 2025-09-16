
import { createStackNavigator } from "@react-navigation/stack"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"

import Welcome from "./components/User/Welcome"
import Login from "./components/User/Login"
import Register from "./components/User/Register"
import Home from "./components/Home/Home";
import Chat from "./components/Home/Chat"

import MyUserReducer from "./reducers/MyUserReducer";
import { useContext, useReducer } from "react";
import { MyDispatchContext, MyUserContext } from "./configs/MyContexts";
import { Icon } from "react-native-paper";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import PtProfiles from "./components/Home/PtProfiles";
import PtDetails from "./components/Home/PtDetails";

import PTHome from "./components/Home/PTHome";
import Schedule from "./components/Home/Schedule";
import PTSchedule from "./components/Home/PTSchedule";
import ChatPt from "./components/Home/ChatPt";
import RegisterMemberPackage from "./components/Home/RegisterMemberPackage"
import PackageList from "./components/Home/PackageList"
import Services from "./components/Home/Services"
import ServicesDetails from "./components/Home/ServiceDetails"

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator();


const StackNavigator3 = () => {

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="services" screenOptions={{ headerShown: false }} >
        <Stack.Screen name="services" component={Services} options={{ title: 'Danh sách dich vu' }} />
        {/* <Stack.Screen name="sv-details" component={ServicesDetails} options={{ title: 'Chi tiết dich vu', headerShown: true }} /> */}


      </Stack.Navigator>
    </SafeAreaProvider>
  );
}



const StackNavigator2 = () => {

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="pt-profiles" screenOptions={{ headerShown: false }} >
        <Stack.Screen name="pt-profiles" component={PtProfiles} options={{ title: 'Danh sách pt' }} />
        <Stack.Screen name="pt-details" component={PtDetails} options={{ title: 'Chi tiết pt', headerShown: true }} />


      </Stack.Navigator>
    </SafeAreaProvider>
  );
}

//Pt 

const TabNavigator1 = () => {
  return (
    <SafeAreaProvider>
      <Tab.Navigator >

        <Tab.Screen name="index" component={PTHome} options={{ title: "Trang pt home", tabBarIcon: () => <Icon size={30} source="home" /> }} />
        <Tab.Screen name="PTSchedule" component={PTSchedule} options={{ title: "Trang lich", tabBarIcon: () => <Icon source="calendar" size={30} /> }} />
        <Tab.Screen name="chatPT" component={ChatPt} options={{ title: 'Chat', tabBarIcon: () => <Icon source="chat" size={30} /> }} />







      </Tab.Navigator>
    </SafeAreaProvider>
  );
}

// member

const TabNavigator = () => {
  return (
    <SafeAreaProvider>
      <Tab.Navigator >
        <Tab.Screen name="index" component={Home} options={{ title: 'Trang chu', tabBarIcon: () => <Icon size={30} source="home" /> }} />
        <Tab.Screen name="chat" component={Chat} options={{ title: 'Chat', tabBarIcon: () => <Icon source="chat" size={30} /> }} />
        <Tab.Screen name="danh sách pt" component={StackNavigator2} options={{ title: 'danh sach pt', tabBarIcon: () => <Icon source="format-list-bulleted" size={30} /> }} />
        <Tab.Screen name="Schedule" component={Schedule} options={{ title: "Đặt lịch", tabBarIcon: () => <Icon source="calendar" size={30} /> }} />
        <Tab.Screen name="PackageList" component={PackageList} options={{ title: "Đặt gói tập" }} />
        <Tab.Screen name="danh sách dich vu" component={StackNavigator3} options={{ title: 'Danh sach dich vu', tabBarIcon: () => <Icon source="format-list-bulleted" size={30} /> }} />








      </Tab.Navigator>
    </SafeAreaProvider>
  );
}


const StackNavigator = () => {
  const user = useContext(MyUserContext);
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="home" component={TabNavigator} />
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="PTHome" component={TabNavigator1} />



      </Stack.Navigator>
    </SafeAreaProvider>
  );
}




export default function App() {
  const [user, dispatch] = useReducer(MyUserReducer, null);


  return (
    <MyUserContext.Provider value={user}>
      <MyDispatchContext.Provider value={dispatch}>
        <NavigationContainer>
          <StackNavigator />
        </NavigationContainer>
      </MyDispatchContext.Provider>
    </MyUserContext.Provider>
  );


  // return (
  //   <SafeAreaProvider>
  //     <NavigationContainer>
  //       <StatusBar style="auto" />
  //       <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
  //         <Stack.Screen name="Welcome" component={Welcome} />
  //         <Stack.Screen name="Login" component={Login} />
  //         <Stack.Screen name="Register" component={Register} />

  //       </Stack.Navigator>
  //     </NavigationContainer>
  //   </SafeAreaProvider>
  // )


}


import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { MyUserContext, MyDispatchContext } from "../../configs/MyContexts"
import { useState, useEffect, useContext } from "react"
const PTHome = ({ navigation }) => {

  const [friendName1, setFriendName1] = useState('');
  const user = useContext(MyUserContext);



  useEffect(() => {
    fetchNextSchedule();
    if (friendName1) {
      console.log(" friendName1 :", friendName1);
    }
  }, [friendName1]);

  const fetchNextSchedule = async () => {
    const api = authApis(user.access_token)
    const response = await api.get(endpoints["schedules"])
    const name = response.data[0].user.first_name;
    setFriendName1(name);


  }


  // useEffect(() => {
  //   const loadUser = async () => {
  //     const userData = await AsyncStorage.getItem('user');
  //     if (userData) setUser(JSON.parse(userData));
  //   };
  //   loadUser();
  // }, []);

  const logout = async () => {
    await AsyncStorage.clear();
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Chào mừng PT {user?.last_name || user?.email}!</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("PTSchedule")}>
        <Text style={styles.buttonText}>Xem lịch tập</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("members")}>
        <Text style={styles.buttonText}>Danh sách hội viên</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("chatPT", { friendName1 })}>
        <Text style={styles.buttonText}>Chat với hội viên</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={logout}>
        <Text style={styles.buttonText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PTHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  welcome: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#1976d2',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#d32f2f',
  },
});
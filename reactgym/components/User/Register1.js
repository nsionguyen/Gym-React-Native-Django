"use client"

import { useState } from "react"
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from 'expo-image-picker';

import Apis, { authApis, endpoints } from "../../configs/Apis";
const Register = ({ navigation }) => {
    const [lastName, setLastName] = useState("")
    const [firstName, setFirstName] = useState("")
    const [email1, setEmail1] = useState("")
    const [height, setHeight] = useState("")
    const [weight, setWeight] = useState("")
    const [goal, setGoal] = useState("")

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [avatar, setAvatar] = useState({})

    const handleSignUp = async () => {
        // Kiểm tra các trường dữ liệu đơn giản
        if (!lastName || !firstName || !email1 || !height || !weight || !goal || !email || !password) {
            Alert.alert("Error", "Please fill in all fields")
            return
        }
        Alert.alert("Error", `${avatar.uri}`)
        const data1 = new FormData();
        data1.append('password', password);
        data1.append('username', email);
        data1.append('email', email1);
        data1.append('first_name', firstName);
        data1.append('last_name', lastName);
        // data1.append('avatar', {
        //     uri: avatar?.uri,
        //     name: avatar?.fileName,
        //     type: avatar?.type
        // });
        let res1 = await Apis.post(endpoints['register'], data1, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        let userId = res1.data.id;
        const data2 = new FormData();
        data2.append('height', height);
        data2.append('weight', weight);
        data2.append('goal', goal);
        data2.append('user', userId);
        let res2 = await Apis.post(endpoints['member-profile'], data2, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });

        Alert.alert("Thành công", `${userId}`)


        // Giả lập đăng ký thành công và chuyển đến màn hình Home
        // navigation.navigate("Home", { name, email })
    }



    const picker = async () => {
        let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert("Permissions denied!");
        } else {
            const result = await ImagePicker.launchImageLibraryAsync();

            if (!result.canceled)
                setAvatar(result.assets[0]);
        }
    }




    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>Sign Up</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Họ</Text>
                        <TextInput style={styles.input} placeholder="Nhập họ" value={lastName} onChangeText={setLastName} />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Tên</Text>
                        <TextInput style={styles.input} placeholder="Nhập têên" value={firstName} onChangeText={setFirstName} />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>gmail</Text>
                        <TextInput style={styles.input} placeholder="Nhập gmail" value={email1} onChangeText={setEmail1} />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Chiều cao </Text>
                        <TextInput style={styles.input} placeholder="Nhập chieu cao" value={height} onChangeText={setHeight} />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Cân nặng </Text>
                        <TextInput style={styles.input} placeholder="Nhập can nang" value={weight} onChangeText={setWeight} />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Mục ttiêu </Text>
                        <TextInput style={styles.input} placeholder="Nhập muc tieu" value={goal} onChangeText={setGoal} />
                    </View>

                    <TouchableOpacity onPress={picker}>
                        <Text>Chọn ảnh đại diện...</Text>
                    </TouchableOpacity>
                    {avatar?.uri && <Image source={{ uri: avatar.uri }} style={{ width: 100, height: 100 }} />}


                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Username </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Nhập mật khẩu"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={24} color="gray" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {/* weight */}


                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Nhập lại mật khẩu"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={24} color="gray" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
                        <Text style={styles.signUpButtonText}>SIGN UP</Text>
                    </TouchableOpacity>

                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                            <Text style={styles.loginLink}>Login</Text>
                        </TouchableOpacity>
                    </View>


                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 30,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerText: {
        fontSize: 28,
        fontWeight: "bold",
    },
    formContainer: {
        paddingHorizontal: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        color: "#666",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
    },
    passwordContainer: {
        flexDirection: "row",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        alignItems: "center",
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
    },
    eyeIcon: {
        padding: 10,
    },
    signUpButton: {
        backgroundColor: "#FF6347",
        borderRadius: 30,
        paddingVertical: 15,
        alignItems: "center",
        marginTop: 10,
        marginBottom: 20,
    },
    signUpButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    loginContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 30,
    },
    loginText: {
        color: "#666",
    },
    loginLink: {
        color: "#FF6347",
        fontWeight: "500",
    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: "#ddd",
    },
    dividerText: {
        paddingHorizontal: 10,
        color: "#666",
    },
    socialButtonsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    socialButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 15,
        width: "48%",
    },
    socialIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    socialButtonText: {
        fontWeight: "500",
        fontSize: 14,
    },
})

export default Register

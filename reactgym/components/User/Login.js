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
import Apis, { authApis, endpoints } from "../../configs/Apis";
import qs from 'qs';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useContext } from "react";
import { MyDispatchContext } from "../../configs/MyContexts";
const Login = ({ navigation }) => {
    // const [user, setUser] = useState({});
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false);
    const dispatch = useContext(MyDispatchContext);




    const login = async () => {
        if (1 === 1) {
            try {


                const data = qs.stringify({
                    username: email,
                    password: password,
                    client_id: 'al4N7fjD0s08GLA8eUmCA14SQjzpQRadEcKACbiU',
                    client_secret: 'R9XX6ftoLQzlRt41dem7AU0LEV1ST0DfyClOUF8WpO9ud8SN6S8dII35s9xi8wzbxmMVMndg5rwDLPnJLVXhiIjW8irJpJVJFNr0IXJe02VtogGwot90CECtGBXDljGI',
                    grant_type: 'password',
                });

                let res = await Apis.post(endpoints['login'], data, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                });

                await AsyncStorage.setItem('token', res.data.access_token);

                let u = await authApis(res.data.access_token).get(endpoints['current-user']);

                const userWithToken = {
                    ...u.data,
                    access_token: res.data.access_token
                };




                // Lưu user đầy đủ vào AsyncStorage
                await AsyncStorage.setItem('user', JSON.stringify(userWithToken));


                dispatch({
                    "type": "login",
                    "payload": userWithToken
                });


                if (userWithToken.role === 'member') {
                    navigation.navigate("home");
                } else if (userWithToken.role === 'pt') {
                    navigation.navigate("PTHome");
                } else {
                    console.warn("Vai trò người dùng không xác định!");
                }
            } catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        }
    }




    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color="black" />
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.headerText}>Login</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>E-mail</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Your email or phone"
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
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={24} color="gray" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.forgotPasswordContainer}>
                        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.loginButton} onPress={login}>
                        <Text style={styles.loginButtonText}>LOGIN</Text>
                    </TouchableOpacity>

                    <View style={styles.signUpContainer}>
                        <Text style={styles.signUpText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                            <Text style={styles.signUpLink}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                    {/* <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>Sign in with</Text>
                        <View style={styles.divider} />
                    </View>

                    <View style={styles.socialButtonsContainer}>
                        <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin("Facebook")}>
                            <Image
                                source={{
                                    uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1200px-Facebook_Logo_%282019%29.png",
                                }}
                                style={styles.socialIcon}
                            />
                            <Text style={styles.socialButtonText}>FACEBOOK</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin("Google")}>
                            <Image
                                source={{
                                    uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/1200px-Google_%22G%22_Logo.svg.png",
                                }}
                                style={styles.socialIcon}
                            />
                            <Text style={styles.socialButtonText}>GOOGLE</Text>
                        </TouchableOpacity>
                    </View> */}
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
    backButton: {
        position: "absolute",
        top: 50,
        left: 20,
        zIndex: 10,
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
    forgotPasswordContainer: {
        alignItems: "flex-end",
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: "#FF6347",
    },
    loginButton: {
        backgroundColor: "#FF6347",
        borderRadius: 30,
        paddingVertical: 15,
        alignItems: "center",
        marginBottom: 20,
    },
    loginButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    signUpContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 30,
    },
    signUpText: {
        color: "#666",
    },
    signUpLink: {
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

export default Login

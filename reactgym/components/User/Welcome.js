import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

const Welcome = ({ navigation }) => {


    return (
        <View style={styles.container}>
            <ImageBackground
                source={{ uri: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000" }}
                style={styles.backgroundImage}
            >
                <LinearGradient colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.7)"]} style={styles.gradient}>
                    <View style={styles.contentContainer}>
                        <View style={styles.headerContainer}>
                            <Text style={styles.welcomeText}>Welcome to</Text>
                            <Text style={styles.appName}>GYM</Text>
                            <Text style={styles.tagline}>To keep fit, you should exercise regularly and eat a balanced diet</Text>
                        </View>

                        <View style={styles.socialContainer}>
                            <Text style={styles.signInText}>sign in with</Text>

                            <View style={styles.socialButtonsRow}>
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
                            </View>

                            <TouchableOpacity style={styles.emailButton} onPress={() => navigation.navigate("Login")}>
                                <Text style={styles.emailButtonText}>Đăng nhập</Text>
                            </TouchableOpacity>

                            <View style={styles.accountContainer}>
                                <Text style={styles.accountText}>Already have an account? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                                    <Text style={styles.signInLink}>Sign In</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>
            <View style={styles.sideBar} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
    },
    sideBar: {
        width: 10,
        backgroundColor: "#FF6347",
    },
    backgroundImage: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    contentContainer: {
        width: "100%",
        height: "100%",
        paddingHorizontal: 30,
        paddingVertical: 50,
        justifyContent: "space-between",
    },
    headerContainer: {
        marginTop: 50,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: "bold",
        color: "white",
    },
    appName: {
        fontSize: 36,
        fontWeight: "bold",
        color: "#FF6347",
        marginBottom: 10,
    },
    tagline: {
        fontSize: 16,
        color: "white",
        lineHeight: 24,
    },
    socialContainer: {
        width: "100%",
        alignItems: "center",
    },
    signInText: {
        color: "white",
        marginBottom: 15,
    },
    socialButtonsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 20,
    },
    socialButton: {
        flexDirection: "row",
        backgroundColor: "white",
        borderRadius: 30,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: "center",
        justifyContent: "center",
        width: "48%",
    },
    socialIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    socialButtonText: {
        fontWeight: "bold",
        fontSize: 12,
    },
    emailButton: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 30,
        paddingVertical: 15,
        width: "100%",
        alignItems: "center",
        marginBottom: 20,
    },
    emailButtonText: {
        color: "white",
        fontWeight: "500",
    },
    accountContainer: {
        flexDirection: "row",
        marginTop: 10,
    },
    accountText: {
        color: "white",
    },
    signInLink: {
        color: "white",
        fontWeight: "bold",
        textDecorationLine: "underline",
    },
})

export default Welcome

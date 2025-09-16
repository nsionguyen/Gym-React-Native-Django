import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View, Alert } from "react-native";
import MyStyles from "../../styles/MyStyles";
import { List } from "react-native-paper";
import Apis, { endpoints } from "../../configs/Apis";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { MyDispatchContext, MyUserContext } from "../../configs/MyContexts";
import { useContext } from "react";
const PtProfiles = () => {


    const [loading, setLoading] = useState(false);
    const [PtProfiles, setPtProfiles] = useState([]);
    const nav = useNavigation();
    const user = useContext(MyUserContext);


    const loadPtProfiles = async () => {

        try {
            setLoading(true);
            let res = await Apis.get(endpoints['pt-profiles']);

            setPtProfiles(res.data);

        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPtProfiles();
        const { avatar } = PtProfiles;
    }, []);

    return (
        <View style={{ flex: 1 }}>

            <FlatList
                data={PtProfiles}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <List.Item
                        title={item.nickname}

                        left={() => (
                            <TouchableOpacity onPress={() => nav.navigate('pt-details', { ptId: item.id })}>

                                <Image
                                    source={{ uri: 'https://res.cloudinary.com/dieiwsp2i/' + item.avatar }}
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 25,
                                        marginRight: 10
                                    }}
                                />
                            </TouchableOpacity>
                        )}
                    />
                )}
            />

        </View>









    )








}

export default PtProfiles;
import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { Button, Card, List, TextInput } from "react-native-paper";

import MyStyles from "../../styles/MyStyles";
import { Image } from "react-native";
import moment from "moment";
import { MyUserContext } from "../../configs/MyContexts";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ServicesDetails = ({ route }) => {
    const [service, setSevice] = useState(null);
    const [comments, setComments] = useState([]);
    const svId = route.params?.svId;
    const user = useContext(MyUserContext);
    const [content, setContent] = useState();
    const [rating, setRating] = useState();
    const [loading, setLoading] = useState(false);

    const loadPt = async () => {
        let res = await Apis.get(endpoints['services-details'](svId));
        setSevice(res.data);
    }

    const loadComments = async () => {
        let res = await Apis.get(endpoints['comments-services'](svId));
        setComments(res.data);



    }

    const addComment = async () => {
        try {
            setLoading(true);
            let token = await AsyncStorage.getItem('token');
            let res = await authApis(token).post(endpoints['comments-services'](svId), {
                content: content,
                rating: rating,

            });
            setComments([res.data, ...comments]);
            loadComments();

            setContent("");
            setRating("");

        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {

        loadPt();
        loadComments();
    }, [svId]);


    return (
        <ScrollView>
            {service === null ? (
                <ActivityIndicator />
            ) : (
                <>
                    <Card>
                        <Card.Title subtitle={service.name} />
                        <Card.Cover source={{ uri: 'https://res.cloudinary.com/dieiwsp2i/' + service.avatar }} />
                        <Card.Content>
                            <Text>Chứng chỉ: {service.name}</Text>

                        </Card.Content>
                    </Card>
                </>
            )}

            {user && (
                <View style={MyStyles.p}>
                    <TextInput
                        mode="outlined"
                        label="Bình luận"
                        value={content}
                        onChangeText={setContent}
                        placeholder="Nội dung bình luận..."
                    />
                    <TextInput
                        mode="outlined"
                        label="Đánh giá (1-5)"
                        value={rating?.toString()}
                        onChangeText={(text) => setRating(Number(text))}
                        placeholder="Số sao từ 1 đến 5"
                        keyboardType="numeric"
                    />
                    <Button
                        onPress={addComment}
                        disabled={loading}
                        loading={loading}
                        style={MyStyles.m}
                        mode="contained"
                    >
                        Thêm bình luận
                    </Button>
                </View>
            )}

            <View>
                {comments.map((c, index) => (
                    <List.Item
                        key={index}
                        title={`${c.content} (${c.rating}⭐)`}
                        description={moment(c.created_date).fromNow()}
                        left={() => (
                            <Image
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    marginRight: 10,
                                }}
                                source={{ uri: c.user.avatar }}
                            />
                        )}
                    />
                ))}
            </View>
        </ScrollView>
    );









}
export default ServicesDetails;
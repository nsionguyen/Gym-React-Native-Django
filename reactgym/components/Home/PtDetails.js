import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { Button, Card, List, TextInput } from "react-native-paper";

import MyStyles from "../../styles/MyStyles";
import { Image } from "react-native";
import moment from "moment";
import { MyUserContext } from "../../configs/MyContexts";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PtDetails = ({ route }) => {
    const [pt, setPt] = useState(null);
    const [comments, setComments] = useState([]);
    const ptId = route.params?.ptId;
    const user = useContext(MyUserContext);
    const [content, setContent] = useState();
    const [rating, setRating] = useState();
    const [loading, setLoading] = useState(false);

    const loadPt = async () => {
        let res = await Apis.get(endpoints['pt-details'](ptId));
        setPt(res.data);
    }

    const loadComments = async () => {
        let res = await Apis.get(endpoints['comments'](ptId));
        setComments(res.data);
        const ratings = res.data.map(c => parseFloat(c.rating || 0));
        const avgRating = ratings.length > 0
            ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
            : 0;
        setPt(prev => ({ ...prev, total_rating: avgRating }));


    }

    const addComment = async () => {
        try {
            setLoading(true);
            const api = authApis(user.access_token)
            let res = await api.post(
                endpoints['comments'](ptId),
                {
                    content: content,
                    rating: rating,

                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
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
    }, [ptId]);


    return (
        <ScrollView>
            {pt === null ? (
                <ActivityIndicator />
            ) : (
                <>
                    <Card>
                        <Card.Title subtitle={pt.nickname} />
                        <Card.Cover source={{ uri: 'https://res.cloudinary.com/dieiwsp2i/' + pt.avatar }} />
                        <Card.Content>
                            <Text>Chứng chỉ: {pt.certification}</Text>
                            <Text>Kinh nghiệm: {pt.experience_years} năm</Text>
                            <Text>Đánh giá trung bình: {pt.total_rating} ⭐</Text>
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
export default PtDetails;